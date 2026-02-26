# College Baseball Sabermetrics MCP Server - Architecture

## System Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                         Claude.ai / ChatGPT                      │
│                     (AI Coding Assistants)                       │
└───────────────────────────┬─────────────────────────────────────┘
                            │
                            │ HTTPS + JSON-RPC 2.0
                            │ MCP Protocol
                            │
┌───────────────────────────▼─────────────────────────────────────┐
│              Cloudflare Workers (Edge Network)                   │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │         MCP Server (standalone-worker.ts)                 │  │
│  │  ┌─────────────────────────────────────────────────────┐  │  │
│  │  │  Protocol Handler (JSON-RPC 2.0)                    │  │  │
│  │  │  • initialize                                        │  │  │
│  │  │  • tools/list                                        │  │  │
│  │  │  • tools/call                                        │  │  │
│  │  └─────────────────────────────────────────────────────┘  │  │
│  │  ┌─────────────────────────────────────────────────────┐  │  │
│  │  │  Security Layer                                      │  │  │
│  │  │  • CORS (Allow: *)                                   │  │  │
│  │  │  • API Key Auth (Optional)                           │  │  │
│  │  │  • Rate Limiting (1K/hr per IP)                      │  │  │
│  │  └─────────────────────────────────────────────────────┘  │  │
│  │  ┌─────────────────────────────────────────────────────┐  │  │
│  │  │  Tool Handlers (7 Tools)                             │  │  │
│  │  │  ├─ get_scoreboard                                   │  │  │
│  │  │  ├─ get_game_details                                 │  │  │
│  │  │  ├─ get_game_play_by_play                            │  │  │
│  │  │  ├─ get_standings                                    │  │  │
│  │  │  ├─ get_rankings                                     │  │  │
│  │  │  ├─ calculate_batting_metrics                        │  │  │
│  │  │  └─ calculate_pitching_metrics                       │  │  │
│  │  └─────────────────────────────────────────────────────┘  │  │
│  └───────────────────────────────────────────────────────────┘  │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │         KV Storage (Rate Limiting State)                  │  │
│  │  • IP → Request Count + Reset Time                        │  │
│  │  • TTL: 1 hour                                             │  │
│  └───────────────────────────────────────────────────────────┘  │
└───────────────────────────┬─────────────────────────────────────┘
                            │
                            │ HTTPS Fetch
                            │
┌───────────────────────────▼─────────────────────────────────────┐
│                    External Data Sources                         │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │  ESPN College Baseball API                                 │ │
│  │  • /scoreboard - Live games                                │ │
│  │  • /summary - Box scores                                   │ │
│  │  • /summary - Play-by-play                                 │ │
│  │  • /standings - Conference standings                       │ │
│  │  • /rankings - Top 25 rankings                             │ │
│  └────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
```

## Data Flow

### 1. Initialize Handshake

```
Claude → MCP Server
  POST /mcp
  {
    "jsonrpc": "2.0",
    "id": 1,
    "method": "initialize",
    "params": {}
  }

MCP Server → Claude
  {
    "jsonrpc": "2.0",
    "id": 1,
    "result": {
      "protocolVersion": "2024-11-05",
      "capabilities": { "tools": {} },
      "serverInfo": {
        "name": "college-baseball-sabermetrics-api",
        "version": "1.0.0"
      }
    }
  }
```

### 2. Tool Discovery

```
Claude → MCP Server
  POST /mcp
  {
    "jsonrpc": "2.0",
    "id": 2,
    "method": "tools/list",
    "params": {}
  }

MCP Server → Claude
  {
    "jsonrpc": "2.0",
    "id": 2,
    "result": {
      "tools": [
        {
          "name": "get_scoreboard",
          "description": "Get live college baseball scoreboard",
          "inputSchema": { ... },
          "readOnlyHint": true
        },
        ...
      ]
    }
  }
```

### 3. Tool Execution

```
Claude → MCP Server
  POST /mcp
  {
    "jsonrpc": "2.0",
    "id": 3,
    "method": "tools/call",
    "params": {
      "name": "get_scoreboard",
      "arguments": { "limit": 5 }
    }
  }

MCP Server → ESPN API
  GET https://site.api.espn.com/apis/site/v2/sports/baseball/college-baseball/scoreboard?limit=5

ESPN API → MCP Server
  {
    "events": [ ... ],
    "leagues": [ ... ]
  }

MCP Server → Claude
  {
    "jsonrpc": "2.0",
    "id": 3,
    "result": {
      "content": [{
        "type": "text",
        "text": "{ \"events\": [ ... ] }"
      }]
    }
  }
```

## Security Layers

### Layer 1: CORS (Browser Security)

```typescript
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-API-Key',
  'Access-Control-Max-Age': '86400',
}
```

### Layer 2: API Key Authentication (Optional)

```typescript
async function checkAuth(request: Request, env: Env) {
  if (!env.MCP_API_KEY) return { authorized: true }
  
  const authHeader = request.headers.get('Authorization')
  const apiKeyHeader = request.headers.get('X-API-Key')
  
  const providedKey = authHeader?.replace('Bearer ', '') || apiKeyHeader
  
  if (!providedKey || providedKey !== env.MCP_API_KEY) {
    return { authorized: false, error: 'Invalid API key' }
  }
  
  return { authorized: true }
}
```

### Layer 3: Rate Limiting (KV-based)

```typescript
const RATE_LIMIT_WINDOW = 3600000  // 1 hour
const RATE_LIMIT_MAX_REQUESTS = 1000

async function checkRateLimit(request: Request, env: Env) {
  const ip = request.headers.get('CF-Connecting-IP') || 'unknown'
  const key = `ratelimit:${ip}`
  
  const data = await env.RATE_LIMIT_KV.get(key)
  
  // Check if rate limit exceeded
  // Update counter
  // Return { allowed, remaining, resetTime }
}
```

## Tool Categories

### Data Retrieval Tools (ESPN API)

1. **get_scoreboard** - Current/recent games
2. **get_game_details** - Box score for specific game
3. **get_game_play_by_play** - Event-level data
4. **get_standings** - Conference standings
5. **get_rankings** - Top 25 national rankings

### Analytics Tools (Pure Computation)

6. **calculate_batting_metrics**
   - Inputs: PA, AB, H, 2B, 3B, HR, BB, HBP, K, SF
   - Outputs: wOBA, AVG, OBP, SLG, OPS, ISO, BABIP, BB%, K%

7. **calculate_pitching_metrics**
   - Inputs: IP, H, R, ER, HR, BB, HBP, K, IBB
   - Outputs: ERA, FIP, WHIP, K/9, BB/9, HR/9

## Deployment Topology

```
┌─────────────────────────────────────────────────────────────┐
│                   Developer Workflow                         │
│                                                               │
│  Local Development            Production Deployment          │
│  ┌────────────────┐           ┌──────────────────┐          │
│  │ wrangler dev   │           │ wrangler deploy  │          │
│  │ localhost:8787 │           │ *.workers.dev    │          │
│  └────────────────┘           └──────────────────┘          │
│         │                              │                     │
│         ▼                              ▼                     │
│  ┌────────────────┐           ┌──────────────────┐          │
│  │ Local Testing  │           │ Cloudflare Edge  │          │
│  │ • curl         │           │ • Global CDN     │          │
│  │ • Postman      │           │ • 300+ locations │          │
│  └────────────────┘           └──────────────────┘          │
└─────────────────────────────────────────────────────────────┘
```

## Performance Characteristics

| Metric | Value | Notes |
|--------|-------|-------|
| Cold start | ~10-50ms | First request to new edge location |
| Warm response | ~5-20ms | Subsequent requests |
| ESPN API latency | ~100-500ms | External API call |
| Total latency | ~100-550ms | Cold start + ESPN |
| Rate limit | 1,000 req/hr | Per IP address |
| Free tier | 100K req/day | Cloudflare Workers free tier |
| Paid tier | 10M req/mo | $5/month |

## Error Handling

```
┌─────────────────────────────────────────────────────────┐
│                    Error Flow                            │
│                                                           │
│  User Request                                             │
│       │                                                   │
│       ├─ CORS preflight missing? → 204 (empty response)  │
│       │                                                   │
│       ├─ Missing/invalid API key? → 401 (Unauthorized)   │
│       │                                                   │
│       ├─ Rate limit exceeded? → 429 (Too Many Requests)  │
│       │                                                   │
│       ├─ Invalid JSON-RPC? → -32600 (Invalid Request)    │
│       │                                                   │
│       ├─ Unknown method? → -32601 (Method Not Found)     │
│       │                                                   │
│       ├─ ESPN API error? → -32603 (Internal Error)       │
│       │                                                   │
│       └─ Success → 200 (JSON-RPC result)                 │
│                                                           │
└─────────────────────────────────────────────────────────┘
```

## Monitoring & Observability

### Built-in Cloudflare Analytics

- Request volume (req/min, req/day)
- Success rate (2xx vs 4xx/5xx)
- Geographic distribution
- CPU time per request
- Bandwidth usage

### Real-Time Logs

```bash
wrangler tail
```

Shows:
- Request method + URL
- Response status
- Execution time
- Console logs
- Errors/exceptions

### Rate Limit Headers (in every response)

```
X-RateLimit-Limit: 1000
X-RateLimit-Remaining: 995
X-RateLimit-Reset: 1704672000000
```

## Scaling Considerations

| Scenario | Solution |
|----------|----------|
| High request volume | Upgrade to Workers Paid ($5/mo for 10M req) |
| Slow ESPN API | Add caching layer (Cloudflare Cache API) |
| Expensive calculations | Pre-compute and cache common metrics |
| Multiple clients | API key per client + per-key rate limits |
| Global users | Already handled (Cloudflare edge network) |

## Security Best Practices

1. **Always use HTTPS** - Cloudflare provides TLS automatically
2. **Enable API keys** for production - Prevent unauthorized access
3. **Monitor rate limits** - Detect abuse patterns
4. **Rotate secrets** regularly - Use `wrangler secret put`
5. **Validate inputs** - Prevent injection attacks
6. **Log suspicious activity** - Track failed auth attempts
7. **Use environment-specific configs** - Separate dev/prod secrets

## Cost Optimization

### Free Tier Strategy (100K req/day)

- Enable aggressive rate limiting (100-500 req/hr per IP)
- Cache ESPN API responses (5-15 minute TTL)
- Return error for non-essential requests
- Monitor usage in Cloudflare dashboard

### Paid Tier Strategy ($5/mo, 10M req/mo)

- Moderate rate limiting (1K-10K req/hr)
- Shorter cache TTLs (1-5 minutes)
- Allow higher burst traffic
- Enable detailed logging

### Cost Breakdown

```
Free Tier:
  100,000 requests/day × 30 days = 3M requests/month
  Cost: $0/month
  
Paid Tier:
  10,000,000 requests/month
  Cost: $5/month
  Effective cost: $0.0000005 per request
  
For comparison:
  AWS Lambda: ~$0.20 per 1M requests
  Google Cloud Functions: ~$0.40 per 1M requests
  Azure Functions: ~$0.20 per 1M requests
```

## Next Steps

1. **Deploy**: Follow `DEPLOY_MCP_TO_CLOUDFLARE.md`
2. **Connect**: Add to Claude.ai custom connectors
3. **Test**: Try the example prompts
4. **Monitor**: Watch Cloudflare analytics
5. **Iterate**: Add more tools/data sources as needed

---

**Architecture designed for:**
- ✅ Simplicity (single file, zero dependencies)
- ✅ Performance (edge network, <50ms cold start)
- ✅ Reliability (global CDN, 99.99% uptime SLA)
- ✅ Cost efficiency ($0/month for most use cases)
- ✅ Security (CORS, auth, rate limiting)
- ✅ Observability (logs, analytics, metrics)
