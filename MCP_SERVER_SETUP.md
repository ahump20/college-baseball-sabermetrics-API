# College Baseball Sabermetrics MCP Server Setup

This document explains how to connect the College Baseball Sabermetrics API to Claude.ai using the Model Context Protocol (MCP).

##⚡ Quick Start - Your MCP Server URL

**Ready to use with Claude.ai:**

I've created a standalone Cloudflare Worker implementation that you can deploy in under 5 minutes.

```
https://college-baseball-mcp.YOUR-SUBDOMAIN.workers.dev/mcp
```

## What is MCP?

The Model Context Protocol (MCP) is an open standard that allows AI assistants like Claude to access external data sources and tools. This implementation exposes real college baseball data and sabermetrics calculations as tools Claude can call.

## Architecture

Since Spark apps are browser-based and can't use Node.js modules, I've created a **standalone Cloudflare Worker** implementation:

### Standalone Worker (`src/mcp/standalone-worker.ts`)
- ✅ **Production-ready** - Deploy directly to Cloudflare Workers
- ✅ **Zero dependencies** - Pure TypeScript, no npm packages needed
- ✅ **Free tier** - 100,000 requests/day on Cloudflare's free plan
- ✅ **CORS configured** - Works with Claude.ai immediately
- ✅ **Real data** - Calls ESPN College Baseball API directly

## Available Tools

Once deployed, Claude.ai can call these tools:

| Tool | Description | Parameters | Read-Only |
|------|-------------|------------|-----------|
| `get_scoreboard` | Get live scoreboard with current games | `limit?: number` | ✅ |
| `get_game_details` | Get detailed box score for a game | `gameId: string` | ✅ |
| `get_game_play_by_play` | Get play-by-play data | `gameId: string` | ✅ |
| `get_standings` | Get conference standings | `season?: number` | ✅ |
| `get_rankings` | Get Top 25 rankings | `week?: number` | ✅ |
| `calculate_batting_metrics` | Calculate wOBA, OPS, ISO, BABIP, etc. | `stats: object` | ✅ |
| `calculate_pitching_metrics` | Calculate FIP, ERA, WHIP, K/9, etc. | `stats: object` | ✅ |

### Data Sources

All tools pull **real, live data** from:
- ✅ **ESPN College Baseball API** (https://site.api.espn.com/apis/site/v2/sports/baseball/college-baseball)
- ✅ Live scoreboards
- ✅ Game summaries and box scores
- ✅ Play-by-play events
- ✅ Conference standings
- ✅ National rankings

## Deployment (5 Minutes)

### Prerequisites

1. **Cloudflare Account** (free tier works perfectly)
   - Sign up at https://cloudflare.com
2. **Wrangler CLI**
   ```bash
   npm install -g wrangler
   ```

### Step-by-Step Deployment

1. **Create a new directory for your Worker:**
   ```bash
   mkdir college-baseball-mcp
   cd college-baseball-mcp
   ```

2. **Copy the standalone worker code:**
   - Copy `src/mcp/standalone-worker.ts` to your new directory as `index.ts`
   - Or use the code directly from this repo

3. **Create `wrangler.toml`:**
   ```toml
   name = "college-baseball-mcp"
   main = "index.ts"
   compatibility_date = "2024-01-01"
   
   [observability]
   enabled = true
   ```

4. **Login to Cloudflare:**
   ```bash
   wrangler login
   ```

5. **Deploy:**
   ```bash
   wrangler deploy
   ```

6. **Your URL will be:**
   ```
   https://college-baseball-mcp.YOUR-SUBDOMAIN.workers.dev/mcp
   ```

### Test Your Deployment

```bash
# Health check
curl https://college-baseball-mcp.YOUR-SUBDOMAIN.workers.dev/health

# Test MCP initialize
curl -X POST https://college-baseball-mcp.YOUR-SUBDOMAIN.workers.dev/mcp \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","id":1,"method":"initialize","params":{}}'
```

## Connecting to Claude.ai

### For Individual Users (Pro/Max)

1. Go to **Settings → Connectors**
2. Click **Add custom connector**
3. Paste your Worker URL:
   ```
   https://college-baseball-mcp.YOUR-SUBDOMAIN.workers.dev/mcp
   ```
4. Click **Add**
5. In any conversation, click **"+"** → **Connectors** → toggle on your connector

### For Team/Enterprise

1. **Owner** goes to **Organization settings → Connectors**
2. **Add custom connector** with the URL
3. **Team members** go to **Settings → Connectors** → **Connect**

### Usage Examples

Once connected, ask Claude:

```
Get today's college baseball scoreboard
```

```
Show me the box score for game ID 401628934 and calculate advanced batting metrics
```

```
What are the current Top 25 rankings?
```

```
Calculate sabermetrics for a player with:
- PA: 200, AB: 175, H: 58, 2B: 12, 3B: 2, HR: 8, BB: 22, HBP: 3, K: 45, SF: 2
```

```
Get conference standings and show me which teams have the best records
```

## Troubleshooting

### "Failed to connect to server"

**Check CORS:**
The worker already has CORS configured for `*`. If you see CORS errors:
1. Open browser DevTools → Network tab
2. Look for failed OPTIONS requests
3. Verify the `Access-Control-Allow-Origin` header is present

**Check URL:**
- Must end with `/mcp`
- Must use HTTPS
- Test with `curl` first to verify it's reachable

### "Method not found"

The MCP client is sending a method your server doesn't handle. Supported methods:
- `initialize`
- `tools/list`
- `tools/call`

### Rate Limiting

Cloudflare Workers free tier limits:
- 100,000 requests/day
- 10ms CPU time per request

For higher usage, upgrade to Workers Paid ($5/month for 10M requests).

## Advanced Configuration

### Add Authentication

To secure your MCP server, add an API key check:

```typescript
if (url.pathname === '/mcp' && request.method === 'POST') {
  const authHeader = request.headers.get('Authorization');
  const expectedKey = 'Bearer your-secret-key';
  
  if (authHeader !== expectedKey) {
    return new Response('Unauthorized', { status: 401, headers: corsHeaders });
  }
  
  // ... rest of handler
}
```

Then in Claude.ai, use **Advanced settings** when adding the connector to provide the API key.

### Add Caching

To reduce ESPN API calls, add caching:

```typescript
// In your Worker
const cache = caches.default;

async function fetchWithCache(url: string, ttl: number = 300) {
  const cacheKey = new Request(url);
  let response = await cache.match(cacheKey);
  
  if (!response) {
    response = await fetch(url);
    const headers = new Headers(response.headers);
    headers.set('Cache-Control', `s-maxage=${ttl}`);
    response = new Response(response.body, { ...response, headers });
    await cache.put(cacheKey, response.clone());
  }
  
  return response;
}
```

### Monitor Usage

Enable Cloudflare Analytics in your dashboard to track:
- Request volume
- Error rates
- CPU time
- Geographic distribution

## Alternative: Local Development

If you want to test locally before deploying:

```bash
wrangler dev
```

This starts a local server at `http://localhost:8787`. Note: Claude.ai requires HTTPS, so this is only for testing with curl/Postman.

## Files in This Repo

- `src/mcp/standalone-worker.ts` - Complete Worker implementation
- `wrangler.example.toml` - Configuration template
- `MCP_SERVER_SETUP.md` - This file
- `MCP_QUICK_START.md` - Quick reference guide

## Resources

- [MCP Specification](https://modelcontextprotocol.io/)
- [Claude Custom Connectors Guide](https://support.claude.com/en/articles/11175166-get-started-with-custom-connectors-using-remote-mcp)
- [Cloudflare Workers Docs](https://developers.cloudflare.com/workers/)
- [Cloudflare MCP Guide](https://developers.cloudflare.com/agents/guides/remote-mcp-server/)
- [ESPN API Documentation](https://github.com/pseudo-r/Public-ESPN-API)

## License

MIT - same as the parent project.
