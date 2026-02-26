# 🎯 Deploy Your MCP Server - Start Here

## What You're Deploying

A **Model Context Protocol (MCP) server** that gives Claude.ai and other AI assistants access to:

- ✅ **Live college baseball scores** (ESPN API)
- ✅ **Game box scores & play-by-play** (real-time data)
- ✅ **Conference standings & rankings** (Top 25)
- ✅ **Advanced sabermetrics calculator** (wOBA, FIP, OPS+, etc.)

**Cost:** $0/month (Cloudflare Workers free tier: 100K requests/day)

---

## 🚀 Quick Start (15 minutes)

### Three Simple Steps

1. **Test locally** → `wrangler dev`
2. **Deploy to Cloudflare** → `wrangler deploy`
3. **Connect to Claude.ai** → Paste your URL

**Full guide:** [DEPLOY_MCP_TO_CLOUDFLARE.md](./DEPLOY_MCP_TO_CLOUDFLARE.md)

**Quick reference:** [MCP_QUICK_REFERENCE.md](./MCP_QUICK_REFERENCE.md)

---

## 📋 Prerequisites

- **Cloudflare account** (free) - [Sign up](https://cloudflare.com)
- **Wrangler CLI** - `npm install -g wrangler`
- **This repository** (you already have it)

---

## 🎬 Step-by-Step Instructions

### Step 1: Test Locally (3 minutes)

```bash
cd /workspaces/spark-template
wrangler dev
```

In another terminal:
```bash
curl http://localhost:8787/health
```

Expected response: `{"status":"ok",...}`

**Full testing guide:** [DEPLOY_MCP_TO_CLOUDFLARE.md#step-1-test-locally](./DEPLOY_MCP_TO_CLOUDFLARE.md#step-1%EF%B8%8F⃣-test-locally-5-minutes)

---

### Step 2: Deploy to Cloudflare (5 minutes)

```bash
wrangler login
wrangler deploy
```

You'll get a URL like:
```
https://college-baseball-mcp.YOUR-SUBDOMAIN.workers.dev
```

**Your MCP endpoint:**
```
https://college-baseball-mcp.YOUR-SUBDOMAIN.workers.dev/mcp
```

**Full deployment guide:** [DEPLOY_MCP_TO_CLOUDFLARE.md#step-2-deploy-to-cloudflare-workers](./DEPLOY_MCP_TO_CLOUDFLARE.md#step-2%EF%B8%8F⃣-deploy-to-cloudflare-workers-5-minutes)

---

### Step 3: Connect to Claude.ai (2 minutes)

1. Go to **[Claude.ai](https://claude.ai)** → **Settings** → **Connectors**
2. Click **Add custom connector**
3. Paste: `https://college-baseball-mcp.YOUR-SUBDOMAIN.workers.dev/mcp`
4. Click **Add**
5. In any chat: **+** button → **Connectors** → Toggle ON

**Connection guide:** [DEPLOY_MCP_TO_CLOUDFLARE.md#24-connect-to-claudeai](./DEPLOY_MCP_TO_CLOUDFLARE.md#24-connect-to-claudeai)

---

## ✅ Test It Works

Ask Claude:

```
Get today's college baseball scoreboard
```

```
Show me the Top 25 rankings
```

```
Calculate batting metrics for a player with:
PA=200, AB=180, H=65, 2B=15, HR=10, BB=18, K=40
```

---

## 🔒 Optional: Add Security (10 minutes)

Enable **API key authentication** and **rate limiting**:

```bash
wrangler kv:namespace create "RATE_LIMIT"
wrangler secret put MCP_API_KEY
wrangler deploy
```

**Security guide:** [DEPLOY_MCP_TO_CLOUDFLARE.md#step-3-add-authentication-and-rate-limiting](./DEPLOY_MCP_TO_CLOUDFLARE.md#step-3%EF%B8%8F⃣-add-authentication-and-rate-limiting-10-minutes)

---

## 📚 Documentation Index

| Document | Purpose | When to Read |
|----------|---------|--------------|
| **[DEPLOY_MCP_TO_CLOUDFLARE.md](./DEPLOY_MCP_TO_CLOUDFLARE.md)** | Complete step-by-step deployment guide | **Start here** |
| **[MCP_QUICK_REFERENCE.md](./MCP_QUICK_REFERENCE.md)** | Command cheatsheet | After deployment |
| **[MCP_ARCHITECTURE_DIAGRAM.md](./MCP_ARCHITECTURE_DIAGRAM.md)** | System architecture & data flow | Understanding how it works |
| **[MCP_DEPLOYMENT_GUIDE.md](./MCP_DEPLOYMENT_GUIDE.md)** | Original detailed guide | Advanced configuration |
| **[MCP_IMPLEMENTATION_COMPLETE.md](./MCP_IMPLEMENTATION_COMPLETE.md)** | Implementation details | Development reference |
| **[wrangler.toml](./wrangler.toml)** | Cloudflare Workers config | Customize deployment |
| **[src/mcp/standalone-worker.ts](./src/mcp/standalone-worker.ts)** | MCP server source code | Modify/extend functionality |

---

## 🛠️ What's Included

### 7 MCP Tools

| Tool | What It Does | Example |
|------|--------------|---------|
| `get_scoreboard` | Live games | "Show today's games" |
| `get_game_details` | Box scores | "Get box score for game 401628374" |
| `get_game_play_by_play` | Play-by-play | "Show play-by-play for game 401628374" |
| `get_standings` | Standings | "SEC standings" |
| `get_rankings` | Top 25 | "Current rankings" |
| `calculate_batting_metrics` | wOBA, OPS, ISO | "Calculate metrics for..." |
| `calculate_pitching_metrics` | FIP, ERA, WHIP | "Calculate pitching stats..." |

### Real Data Sources

- ✅ ESPN College Baseball API (live scores)
- ✅ NCAA.com integration (via ESPN)
- ✅ Conference standings
- ✅ National rankings
- ✅ Box scores & play-by-play

### Built-in Features

- ✅ CORS configured for browser clients
- ✅ JSON-RPC 2.0 protocol (MCP standard)
- ✅ Error handling & validation
- ✅ Optional API key authentication
- ✅ Rate limiting (1,000 req/hr per IP)
- ✅ Real-time logging (`wrangler tail`)
- ✅ Cloudflare Analytics dashboard

---

## 💰 Cost Breakdown

### Free Tier (Perfect for Most Users)

- **100,000 requests per day**
- **3 million requests per month**
- **$0 per month**
- No credit card required

### Paid Tier (If You Outgrow Free)

- **10 million requests per month**
- **$5 per month**
- Advanced analytics
- Priority support

**99% of users stay on the free tier.**

---

## 🎯 Common Use Cases

### 1. AI-Powered Baseball Analytics

Ask Claude:
```
Compare the offensive stats of the top 5 SEC teams and calculate park-adjusted wOBA
```

### 2. Game Analysis

```
Get the box score for today's Alabama vs LSU game and identify which pitchers had the best FIP
```

### 3. Rankings & Standings

```
Show me the Top 25 rankings and tell me which teams have the best run differential
```

### 4. Player Statistics

```
Calculate advanced batting metrics for a player with these stats:
PA=250, AB=220, H=75, 2B=18, 3B=3, HR=12, BB=25, K=55
Explain what the metrics mean.
```

---

## 🔍 Monitoring Your MCP Server

### Real-Time Logs

```bash
wrangler tail
```

Shows every request as it happens.

### Cloudflare Dashboard

1. [Cloudflare Dashboard](https://dash.cloudflare.com)
2. **Workers & Pages** → **college-baseball-mcp**
3. View:
   - Request volume
   - Success rate
   - Geographic distribution
   - CPU time
   - Errors

### Health Check

```bash
curl https://college-baseball-mcp.YOUR-SUBDOMAIN.workers.dev/health
```

---

## 🛠️ Customization

### Add More Tools

Edit `src/mcp/standalone-worker.ts`:

```typescript
// Add to tools array
{
  name: 'get_team_roster',
  description: 'Get roster for a specific team',
  inputSchema: {
    type: 'object',
    properties: {
      teamId: { type: 'string', description: 'Team ID' }
    },
    required: ['teamId']
  },
  readOnlyHint: true
}

// Add handler in handleToolCall()
case 'get_team_roster': {
  const { teamId } = args;
  // Your implementation
}
```

Then redeploy:
```bash
wrangler deploy
```

### Adjust Rate Limits

Edit `src/mcp/standalone-worker.ts`:

```typescript
const RATE_LIMIT_WINDOW = 3600000;  // 1 hour
const RATE_LIMIT_MAX_REQUESTS = 1000;  // ← Change this
```

### Add Caching

```typescript
// In handleToolCall()
case 'get_scoreboard': {
  const cacheKey = `scoreboard:${Date.now() / 60000 | 0}`;  // 1-minute cache
  const cached = await caches.default.match(cacheKey);
  if (cached) return await cached.json();
  
  // Fetch from ESPN...
  const response = await fetch(ESPN_URL);
  const data = await response.json();
  
  // Cache for 1 minute
  await caches.default.put(cacheKey, new Response(JSON.stringify(data), {
    headers: { 'Cache-Control': 'max-age=60' }
  }));
  
  return data;
}
```

---

## 🆘 Troubleshooting

### "Failed to connect to server" in Claude.ai

**Check deployment:**
```bash
curl https://college-baseball-mcp.YOUR-SUBDOMAIN.workers.dev/health
```

**Verify URL:**
- Must end with `/mcp`
- Must be HTTPS
- Must be publicly accessible

**Check CORS:**
- Open browser DevTools → Network tab
- Look for CORS errors

### "Invalid Request" errors

- Ensure you're using the `/mcp` endpoint
- Verify JSON-RPC 2.0 format
- Check method is one of: `initialize`, `tools/list`, `tools/call`

### "Rate limit exceeded"

- Default: 1,000 requests per hour per IP
- Check Cloudflare Analytics for usage
- Adjust `RATE_LIMIT_MAX_REQUESTS` in code

### Deployment fails

```bash
# Check Wrangler version
wrangler --version

# Update if needed
npm install -g wrangler@latest

# Re-authenticate
wrangler logout
wrangler login
```

---

## 📖 Additional Resources

- **[MCP Specification](https://modelcontextprotocol.io/)** - Protocol details
- **[Claude Custom Connectors](https://support.claude.com/en/articles/11175166)** - Claude.ai setup
- **[Cloudflare Workers Docs](https://developers.cloudflare.com/workers/)** - Platform docs
- **[ESPN API Docs](https://gist.github.com/nntrn/ee26cb2a0716de0947a0a4e9a157bc1c)** - ESPN endpoints
- **[Wrangler CLI](https://developers.cloudflare.com/workers/wrangler/)** - CLI reference

---

## 🎓 What You've Built

A production-ready MCP server that:

1. ✅ Implements the full MCP protocol (JSON-RPC 2.0)
2. ✅ Exposes 7 powerful tools for college baseball analytics
3. ✅ Pulls real, live data from ESPN and NCAA
4. ✅ Calculates advanced sabermetrics (wOBA, FIP, etc.)
5. ✅ Handles authentication and rate limiting
6. ✅ Deploys globally on Cloudflare's edge network
7. ✅ Costs $0/month for most usage
8. ✅ Takes 15 minutes from zero to production

---

## 🚀 Ready to Deploy?

**Start here:** [DEPLOY_MCP_TO_CLOUDFLARE.md](./DEPLOY_MCP_TO_CLOUDFLARE.md)

**Quick commands:**
```bash
wrangler dev        # Test locally
wrangler deploy     # Deploy to production
wrangler tail       # View logs
```

---

## 📞 Need Help?

1. **Check documentation:** See files listed above
2. **Test locally first:** `wrangler dev`
3. **View logs:** `wrangler tail`
4. **Check Cloudflare status:** [status.cloudflare.com](https://status.cloudflare.com)

---

## 📝 License

MIT - Same as the parent College Baseball Sabermetrics API project.

---

**Your MCP Server URL (after deployment):**
```
https://college-baseball-mcp.YOUR-SUBDOMAIN.workers.dev/mcp
```

**Use in:**
- ✅ Claude.ai (Settings → Connectors)
- ✅ ChatGPT (when MCP support launches)
- ✅ Any MCP-compatible AI assistant

**Enjoy your College Baseball Sabermetrics MCP Server!** ⚾📊
