# 🎯 MCP Server Quick Reference

## Your Deployed MCP URL
```
https://college-baseball-mcp.<YOUR-SUBDOMAIN>.workers.dev/mcp
```

## Three-Step Deployment

### Step 1: Test Locally
```bash
cd /workspaces/spark-template
wrangler dev

# In another terminal
curl http://localhost:8787/health
```

### Step 2: Deploy to Cloudflare
```bash
wrangler login
wrangler deploy
```

### Step 3: Add Security (Optional)
```bash
wrangler kv:namespace create "RATE_LIMIT"
wrangler secret put MCP_API_KEY
wrangler deploy
```

## Connect to Claude.ai

1. **Settings** → **Connectors** → **Add custom connector**
2. Paste: `https://college-baseball-mcp.<YOUR-SUBDOMAIN>.workers.dev/mcp`
3. Click **Add**
4. In chat: **+** button → **Connectors** → Toggle ON

## Test Prompts for Claude

```
Get today's college baseball scoreboard
```

```
Show me the Top 25 rankings
```

```
Calculate batting metrics for: PA=200, AB=180, H=65, 2B=15, HR=10, BB=18, K=40
```

```
Get the box score for game 401628374 and analyze the top performers
```

## Available Tools

1. **get_scoreboard** - Live games
2. **get_game_details** - Box scores
3. **get_game_play_by_play** - Play-by-play events
4. **get_standings** - Conference standings
5. **get_rankings** - Top 25 rankings
6. **calculate_batting_metrics** - wOBA, OPS, ISO, BABIP
7. **calculate_pitching_metrics** - FIP, ERA, WHIP, K/9

## Common Commands

```bash
# View logs
wrangler tail

# Update deployment
wrangler deploy

# Test health
curl https://college-baseball-mcp.<YOUR-SUBDOMAIN>.workers.dev/health

# Test with auth
curl -X POST https://college-baseball-mcp.<YOUR-SUBDOMAIN>.workers.dev/mcp \
  -H "Content-Type: application/json" \
  -H "X-API-Key: YOUR_KEY" \
  -d '{"jsonrpc":"2.0","id":1,"method":"tools/list","params":{}}'
```

## Cost

- **Free tier**: 100,000 requests/day
- **Paid ($5/mo)**: 10M requests/month

## Full Documentation

- **Complete Guide**: `DEPLOY_MCP_TO_CLOUDFLARE.md`
- **Detailed Setup**: `MCP_DEPLOYMENT_GUIDE.md`
- **Architecture**: `MCP_ARCHITECTURE.md`
- **Implementation**: `MCP_IMPLEMENTATION_COMPLETE.md`

## Troubleshooting

**Connection failed?**
```bash
curl https://college-baseball-mcp.<YOUR-SUBDOMAIN>.workers.dev/health
```

**View analytics:**
[Cloudflare Dashboard](https://dash.cloudflare.com) → Workers & Pages → college-baseball-mcp

**Rate limits:**
- Default: 1,000 requests/hour per IP
- Edit `src/mcp/standalone-worker.ts` to adjust

## Data Sources

✅ ESPN College Baseball API (live)  
✅ NCAA.com (via ESPN)  
✅ Real-time scores, rankings, standings  
✅ Box scores & play-by-play  
✅ Advanced sabermetrics calculations

---

**Need help?** See `DEPLOY_MCP_TO_CLOUDFLARE.md` for step-by-step instructions.
