# Deploy College Baseball MCP Server to Cloudflare Workers

## 🚀 5-Minute Setup

### 1. Install Wrangler
```bash
npm install -g wrangler
```

### 2. Create Project
```bash
mkdir college-baseball-mcp && cd college-baseball-mcp
```

### 3. Create `index.ts`

Copy the contents of `src/mcp/standalone-worker.ts` from this repo into `index.ts` in your new directory.

Or download it directly:
```bash
curl -o index.ts https://raw.githubusercontent.com/YOUR_USERNAME/YOUR_REPO/main/src/mcp/standalone-worker.ts
```

### 4. Create `wrangler.toml`
```toml
name = "college-baseball-mcp"
main = "index.ts"
compatibility_date = "2024-01-01"

[observability]
enabled = true
```

### 5. Deploy
```bash
wrangler login
wrangler deploy
```

### 6. Get Your URL
```
https://college-baseball-mcp.YOUR-SUBDOMAIN.workers.dev/mcp
```

## 🔗 Connect to Claude.ai

1. **Settings → Connectors**
2. **Add custom connector**
3. Paste URL: `https://college-baseball-mcp.YOUR-SUBDOMAIN.workers.dev/mcp`
4. **Add**

## ✅ Test It

Ask Claude:
```
Get today's college baseball scoreboard
```

```
Show me the Top 25 rankings
```

```
Calculate batting metrics for: PA=200, AB=180, H=65, 2B=15, HR=10, BB=18, K=40
```

## 📊 What You Get

- ✅ Live college baseball scores
- ✅ Game box scores & play-by-play
- ✅ Conference standings
- ✅ Top 25 rankings
- ✅ Advanced sabermetrics (wOBA, FIP, OPS+, etc.)
- ✅ 100,000 free requests/day
- ✅ Zero dependencies
- ✅ Full source code transparency

## 🛠️ Local Testing

```bash
wrangler dev
```

Then test with:
```bash
curl http://localhost:8787/health
```

## 📖 Full Documentation

See `MCP_SERVER_SETUP.md` for:
- Complete tool documentation
- Advanced configuration
- Authentication setup
- Caching strategies
- Monitoring & analytics

## 🆘 Troubleshooting

**Connection failed?**
- Check URL ends with `/mcp`
- Test with: `curl https://your-url.workers.dev/health`
- Verify CORS in browser DevTools

**Rate limits?**
- Free tier: 100K requests/day
- Upgrade: $5/month for 10M requests

## 📝 License

MIT
