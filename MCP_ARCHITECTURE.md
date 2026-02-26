# MCP Server Architecture & Flow

## System Architecture

```
┌─────────────────────────────────────────────────────────────────────────┐
│                           Client Applications                           │
├──────────────┬──────────────┬──────────────┬─────────────────────────────┤
│  Claude.ai   │   ChatGPT    │  VS Code     │  Other MCP Clients          │
│              │  (future)    │  (Copilot)   │                             │
└──────┬───────┴──────┬───────┴──────┬───────┴──────┬──────────────────────┘
       │              │              │              │
       │ HTTPS + Auth │              │              │
       │              │              │              │
       └──────────────┴──────────────┴──────────────┘
                          │
                          ▼
       ┌──────────────────────────────────────────────────┐
       │   Cloudflare Workers (Edge Network)              │
       │                                                  │
       │  ┌────────────────────────────────────────────┐ │
       │  │  MCP Server (standalone-worker.ts)         │ │
       │  │                                            │ │
       │  │  ┌──────────────┐  ┌───────────────────┐ │ │
       │  │  │ Auth Layer   │  │  Rate Limiter     │ │ │
       │  │  │ - API Key    │  │  - KV Store       │ │ │
       │  │  │ - Bearer     │  │  - 1000 req/hour  │ │ │
       │  │  │ - X-API-Key  │  │  - Per IP         │ │ │
       │  │  └──────┬───────┘  └───────┬───────────┘ │ │
       │  │         │                  │             │ │
       │  │         └──────────┬───────┘             │ │
       │  │                    ▼                     │ │
       │  │         ┌──────────────────────┐         │ │
       │  │         │  MCP Protocol Layer  │         │ │
       │  │         │  - JSON-RPC 2.0      │         │ │
       │  │         │  - initialize        │         │
       │  │         │  - tools/list        │         │
       │  │         │  - tools/call        │         │
       │  │         └──────────┬───────────┘         │ │
       │  │                    │                     │ │
       │  │                    ▼                     │ │
       │  │         ┌──────────────────────┐         │ │
       │  │         │  Tool Handlers       │         │ │
       │  │         │  (7 tools)           │         │ │
       │  │         └──────────┬───────────┘         │ │
       │  └────────────────────┼─────────────────────┘ │
       └────────────────────────┼───────────────────────┘
                                │
                   ┌────────────┼────────────┐
                   │            │            │
                   ▼            ▼            ▼
         ┌─────────────┐  ┌──────────┐  ┌──────────────┐
         │   ESPN API  │  │  NCAA    │  │  Calculations│
         │  Scoreboard │  │  (future)│  │  (in-memory) │
         │  Box Scores │  │          │  │  - wOBA      │
         │  PBP        │  │          │  │  - FIP       │
         │  Standings  │  │          │  │  - OPS+      │
         │  Rankings   │  │          │  │              │
         └─────────────┘  └──────────┘  └──────────────┘
```

## Data Flow: MCP Request → Response

```
┌─────────────────────────────────────────────────────────────────────┐
│ 1. Client sends MCP request                                        │
│    POST /mcp                                                        │
│    {                                                                │
│      "jsonrpc": "2.0",                                             │
│      "id": 1,                                                      │
│      "method": "tools/call",                                       │
│      "params": {                                                   │
│        "name": "get_scoreboard",                                   │
│        "arguments": {"limit": 10}                                  │
│      }                                                             │
│    }                                                               │
└─────────────────────────────────────────────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────────────┐
│ 2. CORS Preflight (if from browser)                                │
│    OPTIONS /mcp                                                     │
│    ← 204 No Content + CORS headers                                 │
└─────────────────────────────────────────────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────────────┐
│ 3. Authentication Check                                             │
│    • Extract API key from Authorization or X-API-Key header         │
│    • Compare with env.MCP_API_KEY secret                           │
│    • If missing/invalid → 401 Unauthorized                         │
│    • If valid or no key required → continue                        │
└─────────────────────────────────────────────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────────────┐
│ 4. Rate Limit Check                                                 │
│    • Get client IP from CF-Connecting-IP header                     │
│    • Lookup KV: ratelimit:{ip} → {count, resetTime}               │
│    • If count > 1000 and resetTime not expired → 429               │
│    • If under limit → increment count, save to KV, continue        │
└─────────────────────────────────────────────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────────────┐
│ 5. Parse & Validate JSON-RPC Request                                │
│    • Check jsonrpc === "2.0"                                       │
│    • Validate method is one of: initialize, tools/list, tools/call │
│    • Extract id for response correlation                           │
└─────────────────────────────────────────────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────────────┐
│ 6. Route to Method Handler                                          │
│                                                                     │
│    ┌──────────────┐  ┌─────────────┐  ┌─────────────┐            │
│    │ initialize   │  │ tools/list  │  │ tools/call  │            │
│    └──────┬───────┘  └──────┬──────┘  └──────┬──────┘            │
│           │                 │                 │                    │
│           │                 │                 └────────┐           │
│           │                 │                          │           │
│           ▼                 ▼                          ▼           │
│    Return protocol    Return tool     Call specific tool handler  │
│    version + caps     definitions     (get_scoreboard, etc.)      │
└─────────────────────────────────────────────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────────────┐
│ 7. Tool Handler Execution (for tools/call)                         │
│                                                                     │
│    get_scoreboard:                                                  │
│    ┌─────────────────────────────────────────┐                    │
│    │ 1. Extract limit from arguments         │                    │
│    │ 2. Fetch ESPN API scoreboard endpoint   │                    │
│    │ 3. Parse JSON response                  │                    │
│    │ 4. Return as MCP content structure      │                    │
│    └─────────────────────────────────────────┘                    │
│                                                                     │
│    calculate_batting_metrics:                                      │
│    ┌─────────────────────────────────────────┐                    │
│    │ 1. Extract stats from arguments         │                    │
│    │ 2. Calculate wOBA with linear weights   │                    │
│    │ 3. Calculate AVG, OBP, SLG, OPS, ISO    │                    │
│    │ 4. Calculate BABIP, BB%, K%             │                    │
│    │ 5. Format to 3 decimal places           │                    │
│    │ 6. Return as JSON object                │                    │
│    └─────────────────────────────────────────┘                    │
└─────────────────────────────────────────────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────────────┐
│ 8. Build JSON-RPC Response                                          │
│    {                                                                │
│      "jsonrpc": "2.0",                                             │
│      "id": 1,                                                      │
│      "result": {                                                   │
│        "content": [{                                               │
│          "type": "text",                                           │
│          "text": "{...ESPN scoreboard data...}"                    │
│        }]                                                          │
│      }                                                             │
│    }                                                               │
└─────────────────────────────────────────────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────────────┐
│ 9. Add Response Headers                                             │
│    • Content-Type: application/json                                │
│    • Access-Control-Allow-Origin: *                                │
│    • X-RateLimit-Limit: 1000                                       │
│    • X-RateLimit-Remaining: 995                                    │
│    • X-RateLimit-Reset: {timestamp}                                │
└─────────────────────────────────────────────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────────────┐
│ 10. Return Response to Client                                       │
│     200 OK                                                          │
│     {...JSON-RPC response with data...}                            │
└─────────────────────────────────────────────────────────────────────┘
```

## Security Layers

```
┌───────────────────────────────────────────────────────────────┐
│                       Request Pipeline                        │
└───────────────────────────────────────────────────────────────┘
                              │
                              ▼
         ┌────────────────────────────────────┐
         │   Layer 1: CORS Protection         │
         │   • Validates Origin header        │
         │   • Handles preflight OPTIONS      │
         │   • Returns proper CORS headers    │
         └────────────┬───────────────────────┘
                      │
                      ▼
         ┌────────────────────────────────────┐
         │   Layer 2: Authentication          │
         │   • Checks Authorization header    │
         │   • Validates API key if set       │
         │   • Returns 401 if invalid         │
         └────────────┬───────────────────────┘
                      │
                      ▼
         ┌────────────────────────────────────┐
         │   Layer 3: Rate Limiting           │
         │   • Tracks requests per IP         │
         │   • 1000 requests/hour window      │
         │   • Returns 429 if exceeded        │
         │   • Uses KV for distributed state  │
         └────────────┬───────────────────────┘
                      │
                      ▼
         ┌────────────────────────────────────┐
         │   Layer 4: Input Validation        │
         │   • JSON-RPC 2.0 schema check      │
         │   • Method whitelisting            │
         │   • Parameter type validation      │
         │   • Returns 400 if invalid         │
         └────────────┬───────────────────────┘
                      │
                      ▼
         ┌────────────────────────────────────┐
         │   Layer 5: Error Handling          │
         │   • Try/catch around all handlers  │
         │   • Structured error responses     │
         │   • No stack traces in production  │
         │   • Returns 500 for server errors  │
         └────────────┬───────────────────────┘
                      │
                      ▼
                 ┌────────┐
                 │  Tool  │
                 │Handler │
                 └────────┘
```

## Deployment Flow

```
                    Developer Workstation
                            │
                            │ 1. wrangler login
                            ▼
                    ┌───────────────┐
                    │  Cloudflare   │
                    │  Auth Portal  │
                    └───────┬───────┘
                            │
                            │ 2. OAuth flow
                            ▼
                    ┌───────────────┐
                    │  Create/Get   │
                    │  Account ID   │
                    └───────┬───────┘
                            │
                            │ 3. wrangler kv:namespace create
                            ▼
                    ┌───────────────────┐
                    │  KV Namespace     │
                    │  (rate limiting)  │
                    │  ID: xxxxxxxx     │
                    └───────┬───────────┘
                            │
                            │ 4. Update wrangler.toml
                            ▼
                    ┌───────────────────┐
                    │  wrangler.toml    │
                    │  + KV binding     │
                    └───────┬───────────┘
                            │
                            │ 5. wrangler secret put MCP_API_KEY
                            ▼
                    ┌───────────────────┐
                    │  Encrypted Secret │
                    │  in CF account    │
                    └───────┬───────────┘
                            │
                            │ 6. wrangler deploy
                            ▼
                    ┌───────────────────────────┐
                    │  Cloudflare Edge Network  │
                    │  • 300+ locations         │
                    │  • Sub-10ms latency       │
                    │  • Auto-scaling           │
                    │  • Zero cold starts       │
                    └───────┬───────────────────┘
                            │
                            │ 7. Returns public URL
                            ▼
            https://college-baseball-mcp.{subdomain}.workers.dev
                            │
                            │ 8. Test with curl
                            ▼
                    ┌───────────────────┐
                    │  Health check ✓   │
                    │  Initialize ✓     │
                    │  Tools list ✓     │
                    └───────┬───────────┘
                            │
                            │ 9. Add to Claude.ai
                            ▼
                    ┌───────────────────┐
                    │  Claude.ai        │
                    │  Settings →       │
                    │  Connectors →     │
                    │  Add Custom       │
                    └───────┬───────────┘
                            │
                            │ 10. Test in conversation
                            ▼
                    ┌───────────────────────────┐
                    │  Live MCP connection! ✓   │
                    │  Real college baseball    │
                    │  data + sabermetrics      │
                    └───────────────────────────┘
```

## Tool Execution Flow (Example: get_scoreboard)

```
  Client                Worker              ESPN API
    │                      │                    │
    │  tools/call          │                    │
    │  get_scoreboard      │                    │
    │  limit:10            │                    │
    ├─────────────────────>│                    │
    │                      │                    │
    │                      │ Validate args      │
    │                      │ (limit is number)  │
    │                      │                    │
    │                      │ Build ESPN URL     │
    │                      │ with limit param   │
    │                      │                    │
    │                      │  GET /scoreboard   │
    │                      │  ?limit=10         │
    │                      ├───────────────────>│
    │                      │                    │
    │                      │                    │ Query DB
    │                      │                    │ Filter games
    │                      │                    │ Format JSON
    │                      │                    │
    │                      │    200 OK          │
    │                      │    {...events...}  │
    │                      │<───────────────────┤
    │                      │                    │
    │  Parse ESPN response │                    │
    │  Extract games       │                    │
    │  Format as MCP       │                    │
    │  content structure   │                    │
    │                      │                    │
    │  200 OK              │                    │
    │  {result: {content}} │                    │
    │<─────────────────────┤                    │
    │                      │                    │
    │  Parse & display     │                    │
    │                      │                    │
    ▼                      ▼                    ▼
```

## Rate Limiting Algorithm

```
                    ┌─────────────────────────┐
                    │  Incoming request       │
                    │  IP: 192.168.1.100      │
                    └──────────┬──────────────┘
                               │
                               ▼
                    ┌──────────────────────────┐
                    │  Lookup KV:              │
                    │  ratelimit:192.168.1.100 │
                    └──────────┬───────────────┘
                               │
                ┌──────────────┴──────────────┐
                │                             │
                ▼                             ▼
    ┌───────────────────┐        ┌────────────────────┐
    │  Key exists       │        │  Key missing       │
    │  Get stored data  │        │  Initialize:       │
    └────────┬──────────┘        │  count: 1          │
             │                   │  resetTime: now+1h │
             ▼                   └────────┬───────────┘
    ┌───────────────────┐                │
    │  Check resetTime  │                │
    └────────┬──────────┘                │
             │                            │
      ┌──────┴──────┐                   │
      │             │                    │
      ▼             ▼                    │
  Expired      Not expired               │
      │             │                    │
      │             ▼                    │
      │    ┌──────────────┐             │
      │    │ count >= 1000│             │
      │    └───┬──────┬───┘             │
      │        │      │                 │
      │        │      └────┐            │
      │        ▼           ▼            │
      │    Allow       Reject           │
      │    count++     429 error        │
      │        │           │            │
      │        │           │            │
      └────────┼───────────┼────────────┘
               │           │
               ▼           ▼
    ┌──────────────┐   ┌─────────────┐
    │ Save to KV:  │   │ Return 429  │
    │ - new count  │   │ + headers   │
    │ - resetTime  │   │ - Remaining │
    │ - TTL: 1h    │   │ - Reset     │
    └──────┬───────┘   └─────────────┘
           │
           ▼
    ┌──────────────────┐
    │  Continue to     │
    │  request handler │
    └──────────────────┘
```
