# ⚾ College Baseball Sabermetrics API

A production-ready **NCAA Analytics Platform** with real-time game data, advanced sabermetrics, and **Model Context Protocol (MCP)** integration for Claude.ai and other AI assistants.

---

## 🔒 Security Notice

**API Keys and Secrets**: This application uses secure secret management via Spark KV storage. 

- ✅ **Secrets are NOT stored in source code**
- ✅ **Environment variables are gitignored**
- ✅ **Only app owners can access secrets**

See [SECURITY_REMEDIATION.md](SECURITY_REMEDIATION.md) for details on secure secret management.

⚠️ **Note**: The Bearer token shown in this README is for MCP authentication and should be rotated if compromised. Owner-only secrets are stored separately in the Configuration panel.

---

## 🚨 FIXING CLAUDE.AI CONNECTION ERROR?

### 👉 **[🔥_START_HERE_🔥.txt](🔥_START_HERE_🔥.txt)** ⭐ **READ THIS FIRST!**

### Quick Reference Guides

**👉 [CHEAT_SHEET.md](CHEAT_SHEET.md)** - ONE PAGE with all commands and settings

**👉 [MCP_CONNECTION_FIX.md](MCP_CONNECTION_FIX.md)** - 5-minute quick fix guide

**👉 [TROUBLESHOOTING_CLAUDE_MCP.md](TROUBLESHOOTING_CLAUDE_MCP.md)** - Detailed error diagnostics

### Quick Fix Commands

```bash
# 1. Make scripts executable
bash make-executable.sh

# 2. Test your connection
./test-claude-connection.sh

# 3. Deploy if needed
./deploy-mcp.sh
```

### Your Claude.ai Connection Details

**Server URL:**
```
https://sabermetrics.blazesportsintel.com/mcp
```

**Custom Header:**
```
Key:   Authorization
Value: Bearer bsi_mcp_83453667ea265aa73a3ccae226cc0003ba006b27a
```

---

## 🎯 What's Built

- ✅ **Live college baseball scores** from ESPN API
- ✅ **Game box scores & play-by-play** (real-time data)
- ✅ **Conference standings & Top 25 rankings**
- ✅ **Advanced sabermetrics calculator** (wOBA, FIP, OPS+, ISO, BABIP, etc.)
- ✅ **Interactive ERD & schema viewer** for database design
- ✅ **Player & team comparison tools**
- ✅ **MCP Server** deployed to Cloudflare Workers
- ✅ **Claude.ai integration** with authentication

## 🚀 Documentation Index

### Essential Guides (Start Here)
- **[START_HERE.md](START_HERE.md)** ⭐ **Main index and quick start**
- **[MCP_CONNECTION_FIX.md](MCP_CONNECTION_FIX.md)** - Fix Claude.ai connection errors
- **[TROUBLESHOOTING_CLAUDE_MCP.md](TROUBLESHOOTING_CLAUDE_MCP.md)** - Detailed troubleshooting

### Deployment & Setup
- **[QUICK_START.md](QUICK_START.md)** - 10-minute deployment guide
- **[CLAUDE_MCP_SETUP.md](CLAUDE_MCP_SETUP.md)** - Claude.ai integration guide
- **[DEPLOYMENT_DOCUMENTATION_INDEX.md](DEPLOYMENT_DOCUMENTATION_INDEX.md)** - All deployment docs
- **[PRODUCTION_DEPLOYMENT_STEPS.md](PRODUCTION_DEPLOYMENT_STEPS.md)** - Step-by-step deployment

---

## 📚 Additional Documentation

### MCP Server
- **[BLAZE_DEPLOYMENT_GUIDE.md](./BLAZE_DEPLOYMENT_GUIDE.md)** - Original deployment guide
- **[MCP_QUICK_REFERENCE.md](./MCP_QUICK_REFERENCE.md)** - Command cheatsheet
- **[MCP_ARCHITECTURE_DIAGRAM.md](./MCP_ARCHITECTURE_DIAGRAM.md)** - System architecture

### Application Documentation
- **[PRD.md](./PRD.md)** - Product requirements document
- **[DESIGN_SYSTEM.md](./DESIGN_SYSTEM.md)** - UI/UX design system
- **[REAL_DATA_INTEGRATION.md](./REAL_DATA_INTEGRATION.md)** - Data sources & integration
- **[MCP_IMPLEMENTATION_COMPLETE.md](./MCP_IMPLEMENTATION_COMPLETE.md)** - MCP implementation details

## 🛠️ What's Inside?

### Frontend (React + TypeScript)
- **Interactive dashboard** with 10 tabs (Games, API Explorer, Schema, ERD, Analytics, Compare, Players, Live API, Provenance, Coverage)
- **Real-time game scoreboard** with auto-refresh
- **Advanced metrics calculator** for batting & pitching stats
- **Player comparison tool** with sabermetrics
- **Schema viewer & ERD** for database design

### MCP Server (Cloudflare Workers)
- **7 MCP tools** for AI assistants (scoreboard, box scores, play-by-play, standings, rankings, sabermetrics)
- **Real data from ESPN** & NCAA APIs
- **CORS configured** for browser clients
- **Optional auth & rate limiting**

### Data Sources
- ESPN College Baseball API (live scores, box scores, play-by-play)
- NCAA.com (via ESPN integration)
- Conference standings & national rankings

## 💻 Local Development

### Run the Spark App (Frontend)

```bash
npm install
npm run dev
```

Open http://localhost:5173

### Run the MCP Server Locally

```bash
wrangler dev
```

Test with:
```bash
curl http://localhost:8787/health
```


## Local Security Hooks

Use the pre-commit framework with `gitleaks` so secrets are blocked before code is committed.

```bash
pip install pre-commit
pre-commit install
pre-commit run --all-files
```

This repository includes `.pre-commit-config.yaml` and `.gitleaks.toml`.

- `.pre-commit-config.yaml` wires the local pre-commit hook to run `gitleaks`.
- `.gitleaks.toml` contains baseline allowlist rules for known documentation/demo strings.
- Any leak reported by gitleaks exits with a non-zero status and blocks the commit.

## 🌐 Deploy to Production

### Deploy MCP Server to Cloudflare Workers

```bash
wrangler login
wrangler deploy
```

**Full guide:** [DEPLOY_MCP_TO_CLOUDFLARE.md](./DEPLOY_MCP_TO_CLOUDFLARE.md)

### Deploy Frontend (Spark App)

The Spark app is designed to run in the browser. You can:
- Use the built-in Spark runtime
- Deploy to any static hosting (Cloudflare Pages, Vercel, Netlify)
- Serve locally for development

## 🔗 Connect to Claude.ai

Once your MCP server is deployed:

1. Go to **[Claude.ai](https://claude.ai)** → **Settings** → **Connectors**
2. Click **Add custom connector**
3. Paste: `https://college-baseball-mcp.YOUR-SUBDOMAIN.workers.dev/mcp`
4. Click **Add**
5. Enable in chat: **+** → **Connectors** → Toggle ON

**Test with Claude:**
```
Get today's college baseball scoreboard
```

```
Calculate batting metrics for: PA=200, AB=180, H=65, 2B=15, HR=10, BB=18, K=40
```

## 📊 Available MCP Tools

| Tool | What It Does |
|------|--------------|
| `get_scoreboard` | Live college baseball games |
| `get_game_details` | Box score for a specific game |
| `get_game_play_by_play` | Play-by-play events |
| `get_standings` | Conference standings |
| `get_rankings` | Top 25 national rankings |
| `calculate_batting_metrics` | wOBA, OPS, ISO, BABIP, BB%, K% |
| `calculate_pitching_metrics` | FIP, ERA, WHIP, K/9, BB/9, HR/9 |

## 🎓 What's This For?

This project demonstrates:

1. **Real-time sports data integration** (ESPN API)
2. **Advanced analytics** (sabermetrics formulas)
3. **MCP protocol implementation** (connect AI assistants to live data)
4. **Production architecture** (provenance tracking, coverage awareness, data validation)
5. **Modern web stack** (React, TypeScript, Tailwind, Cloudflare Workers)

## 🏗️ Project Structure

```
.
├── src/
│   ├── App.tsx                 # Main React app
│   ├── components/             # React components
│   │   ├── GameScoreboard.tsx  # Live game scores
│   │   ├── APIExplorer.tsx     # API documentation
│   │   ├── SchemaViewer.tsx    # Database schema
│   │   ├── InteractiveERD.tsx  # Entity relationship diagram
│   │   └── ...
│   ├── lib/
│   │   ├── espnAPI.ts          # ESPN API client
│   │   ├── espnGameData.ts     # Game data parsing
│   │   └── ...
│   └── mcp/
│       ├── standalone-worker.ts # MCP server (Cloudflare Worker)
│       ├── server.ts            # MCP server (stdio)
│       └── ...
├── wrangler.toml               # Cloudflare Workers config
├── START_HERE_MCP_DEPLOYMENT.md
├── DEPLOY_MCP_TO_CLOUDFLARE.md
└── ...
```

## 🔒 Security Features

- ✅ CORS configured for browser clients
- ✅ Optional API key authentication
- ✅ Rate limiting (1,000 requests/hour per IP)
- ✅ Input validation & error handling
- ✅ Cloudflare Workers security best practices

## 💰 Cost

**Cloudflare Workers Free Tier:**
- 100,000 requests per day
- 3 million requests per month
- **$0 per month**

**Paid Tier ($5/month):**
- 10 million requests per month
- Advanced analytics

**99% of users stay on the free tier.**

## 📖 Learn More

### MCP (Model Context Protocol)
- [MCP Specification](https://modelcontextprotocol.io/)
- [Claude Custom Connectors](https://support.claude.com/en/articles/11175166)
- [Cloudflare MCP Guide](https://developers.cloudflare.com/agents/guides/remote-mcp-server/)

### Data Sources
- [ESPN Public API Docs](https://gist.github.com/nntrn/ee26cb2a0716de0947a0a4e9a157bc1c)
- [NCAA Baseball Statistics](https://www.ncaa.com/stats/baseball/d1)
- [FanGraphs Sabermetrics Library](https://library.fangraphs.com/)

### Technologies
- [React](https://react.dev/)
- [TypeScript](https://www.typescriptlang.org/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Cloudflare Workers](https://workers.cloudflare.com/)
- [Wrangler CLI](https://developers.cloudflare.com/workers/wrangler/)

## 🆘 Troubleshooting

**MCP server won't deploy?**
- Check Wrangler is installed: `wrangler --version`
- Update if needed: `npm install -g wrangler@latest`
- Re-authenticate: `wrangler logout && wrangler login`

**Claude.ai can't connect?**
- Verify URL ends with `/mcp`
- Test with: `curl https://your-url.workers.dev/health`
- Check CORS in browser DevTools

**Rate limit errors?**
- Default: 1,000 requests/hour per IP
- Adjust in `src/mcp/standalone-worker.ts`
- Monitor in Cloudflare Analytics

**See full troubleshooting guide:** [DEPLOY_MCP_TO_CLOUDFLARE.md#troubleshooting](./DEPLOY_MCP_TO_CLOUDFLARE.md#🛠️-troubleshooting)

## 🎯 Next Steps

After deploying your MCP server:

1. **Add OAuth 2.0** for enterprise teams ([MCP_DEPLOYMENT_GUIDE.md](./MCP_DEPLOYMENT_GUIDE.md))
2. **Deploy to custom domain** with Cloudflare DNS
3. **Add caching layer** to reduce API calls and improve speed
4. **Extend with more tools** (player rosters, historical stats, etc.)
5. **Monitor usage** in Cloudflare Analytics

## 📝 License

MIT - See [LICENSE](./LICENSE) for details.

Copyright GitHub, Inc. (Spark Template Resources)

---

## 🚀 Ready to Deploy?

**[→ START HERE: Deploy Your MCP Server ←](./START_HERE_MCP_DEPLOYMENT.md)**

**Your MCP URL (after deployment):**
```
https://college-baseball-mcp.YOUR-SUBDOMAIN.workers.dev/mcp
```

**Enjoy your College Baseball Sabermetrics MCP Server!** ⚾📊
