# College Baseball Sabermetrics API - MCP Server

## Quick Start: Your MCP Server URL

**For immediate use with Claude.ai:**

Since this is a browser-based Spark application, you have two options for creating an MCP server:

### Option 1: Use the Mock API Endpoint (Simplest - No deployment needed)

The current Spark app is already running and accessible. You can create a simple proxy that wraps the existing functionality:

**Your MCP Server URL:**
```
https://your-spark-subdomain.spark.github.dev/api/mcp
```

However, this requires adding an MCP endpoint to your Spark app. See implementation below.

### Option 2: Deploy a Standalone MCP Server (Recommended)

Since Spark apps are browser-based and don't support the Node.js MCP SDK, the best approach is to deploy a standalone MCP server that calls the same ESPN APIs.

## Implementation: Add MCP Endpoint to Your Spark App

I've created an implementation that works within the Spark constraints (browser-only, no Node.js modules).

### What I've Built

1. **`src/lib/mcpHandler.ts`** - Browser-compatible MCP handler
2. **Updated `MCP_SERVER_SETUP.md`** - Complete deployment guide
3. **Example `wrangler.toml`** - Cloudflare Workers deployment config

### Available Tools

Once deployed, your MCP server exposes these tools to Claude.ai:

| Tool Name | Description | Parameters |
|-----------|-------------|------------|
| `get_scoreboard` | Get current college baseball games | `limit?: number` |
| `get_game_details` | Get box score for a specific game | `gameId: string` |
| `get_game_play_by_play` | Get play-by-play events | `gameId: string` |
| `get_standings` | Get conference standings | `season?: number` |
| `get_rankings` | Get Top 25 rankings | `week?: number` |
| `calculate_batting_metrics` | Calculate wOBA, OPS, etc. | `stats: object` |
| `calculate_pitching_metrics` | Calculate FIP, ERA, WHIP | `stats: object` |

### Real Data Sources

All tools pull **real, live data** from:
- ✅ ESPN College Baseball API (scoreboard, box scores, play-by-play)
- ✅ NCAA.com (via ESPN integration)
- ✅ Conference standings
- ✅ National rankings

### Deployment Instructions

Since you're working in a Spark environment (browser-based React app), you'll need to deploy the MCP server separately. Here's the fastest path:

#### Using Cloudflare Workers (Free Tier - 100k requests/day)

1. **Install Wrangler CLI:**
   ```bash
   npm install -g wrangler
   ```

2. **Create a new Cloudflare Worker project:**
   ```bash
   mkdir college-baseball-mcp
   cd college-baseball-mcp
   npm init -y
   npm install hono
   ```

3. **Copy the MCP server code** (provided in `MCP_SERVER_SETUP.md`)

4. **Deploy:**
   ```bash
   wrangler login
   wrangler deploy
   ```

5. **Your URL will be:**
   ```
   https://college-baseball-mcp.YOUR-SUBDOMAIN.workers.dev/mcp
   ```

#### Connecting to Claude.ai

1. Go to **Settings → Connectors**
2. Click **Add custom connector**
3. Paste your Worker URL: `https://college-baseball-mcp.YOUR-SUBDOMAIN.workers.dev/mcp`
4. Click **Add**
5. In any conversation, enable the connector with the **"+"** button

#### Testing Your MCP Server

Once connected, try asking Claude:

```
Show me today's college baseball scores
```

```
Get the box score for game 401234567 and calculate advanced batting metrics for the top performers
```

```
What are the current Top 25 rankings?
```

```
Compare the batting stats of two players and calculate their wOBA
```

## Why This Approach?

1. **Browser Limitation**: Spark apps run entirely in the browser and cannot use Node.js-specific packages like `@modelcontextprotocol/sdk`

2. **MCP Requirements**: Claude.ai requires:
   - Public HTTPS endpoint
   - CORS configured for `https://claude.ai`
   - JSON-RPC 2.0 protocol
   - Streamable HTTP transport

3. **Best Solution**: Deploy a lightweight Cloudflare Worker that:
   - Implements the MCP protocol
   - Calls the same ESPN APIs your Spark app uses
   - Handles CORS and authentication
   - Stays free under 100k requests/day

## Complete Code

See `MCP_SERVER_SETUP.md` for:
- ✅ Full Cloudflare Worker implementation
- ✅ wrangler.toml configuration
- ✅ CORS setup
- ✅ Tool definitions
- ✅ Sabermetrics calculation formulas
- ✅ Error handling
- ✅ Rate limiting

## Alternative: Use GitHub Codespaces

If you're already in a GitHub Codespace (which you appear to be), you can:

1. Create a separate directory for the MCP server
2. Use Node.js there (outside the Spark app)
3. Run the MCP server on a different port
4. Use GitHub Codespaces port forwarding to make it publicly accessible
5. Use that forwarded URL in Claude.ai

However, this only works while your Codespace is running. For a persistent solution, use Cloudflare Workers.

## Need Help?

The complete, production-ready MCP server code is in:
- `src/mcp/standalone-worker.ts` (Cloudflare Worker implementation)
- `MCP_SERVER_SETUP.md` (Full deployment guide)
- `wrangler.example.toml` (Configuration template)

Deploy to Cloudflare Workers (free tier) and you'll have a permanent MCP server URL to use with Claude.ai or any other AI coding assistant that supports MCP!
