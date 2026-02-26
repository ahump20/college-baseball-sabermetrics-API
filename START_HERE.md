# 🔥 Blaze Sports Intel - MCP Server Documentation Index

## 🚨 START HERE: Fix Claude.ai Connection Error

You're getting an error when trying to connect Claude.ai to the MCP server. **Follow this guide:**

📖 **[CHEAT_SHEET.md](CHEAT_SHEET.md)** ⭐ **ONE-PAGE QUICK REFERENCE** - Everything you need on one page

📖 **[WHAT_WAS_CREATED.md](WHAT_WAS_CREATED.md)** - Summary of what was just created for you

📖 **[MCP_CONNECTION_FIX.md](MCP_CONNECTION_FIX.md)** - Quick 5-minute fix for the connection error

### Quick Commands to Fix the Issue

```bash
# 1. Make scripts executable
bash make-executable.sh

# 2. Test your connection and see what's wrong
./test-claude-connection.sh

# 3. If needed, run full deployment
./deploy-mcp.sh
```

---

## 📚 Complete Documentation Library

### Getting Started
- **[MCP_CONNECTION_FIX.md](MCP_CONNECTION_FIX.md)** ⭐ **START HERE** - Quick fix for Claude.ai connection error
- **[TROUBLESHOOTING_CLAUDE_MCP.md](TROUBLESHOOTING_CLAUDE_MCP.md)** - Detailed troubleshooting for all connection issues
- **[CLAUDE_MCP_SETUP.md](CLAUDE_MCP_SETUP.md)** - Complete Claude.ai setup guide with examples

### Deployment & Configuration
- **[DEPLOY_MCP_TO_CLOUDFLARE.md](DEPLOY_MCP_TO_CLOUDFLARE.md)** - Production deployment instructions
- **[MCP_DEPLOYMENT_GUIDE.md](MCP_DEPLOYMENT_GUIDE.md)** - Step-by-step deployment walkthrough
- **[START_HERE_MCP_DEPLOYMENT.md](START_HERE_MCP_DEPLOYMENT.md)** - Quick start deployment guide
- **[BLAZE_DEPLOYMENT_GUIDE.md](BLAZE_DEPLOYMENT_GUIDE.md)** - Blaze-specific deployment notes

### Technical Documentation
- **[MCP_ARCHITECTURE.md](MCP_ARCHITECTURE.md)** - MCP server architecture and design
- **[MCP_ARCHITECTURE_DIAGRAM.md](MCP_ARCHITECTURE_DIAGRAM.md)** - Visual architecture diagrams
- **[MCP_QUICK_REFERENCE.md](MCP_QUICK_REFERENCE.md)** - API and tools quick reference
- **[MCP_SERVER_SETUP.md](MCP_SERVER_SETUP.md)** - Server configuration details

### Feature Documentation
- **[TEXAS_PDF_SCRAPER.md](TEXAS_PDF_SCRAPER.md)** - Texas Longhorns PDF scraping
- **[SEC_SCRAPERS_IMPLEMENTATION.md](SEC_SCRAPERS_IMPLEMENTATION.md)** - SEC team scrapers
- **[PDF_SCRAPING_IMPLEMENTATION.md](PDF_SCRAPING_IMPLEMENTATION.md)** - PDF scraping architecture
- **[CRON_AUTOMATION.md](CRON_AUTOMATION.md)** - Automated data refresh setup
- **[GAME_DATA_ENHANCEMENT.md](GAME_DATA_ENHANCEMENT.md)** - Game data features
- **[REAL_DATA_INTEGRATION.md](REAL_DATA_INTEGRATION.md)** - Real data integration guide

### Project Status
- **[ITERATION_12_COMPLETE.md](ITERATION_12_COMPLETE.md)** - Latest iteration summary
- **[PRODUCTION_DEPLOYMENT_COMPLETE.md](PRODUCTION_DEPLOYMENT_COMPLETE.md)** - Deployment status
- **[MCP_IMPLEMENTATION_COMPLETE.md](MCP_IMPLEMENTATION_COMPLETE.md)** - MCP implementation status
- **[DEPLOYMENT_READY.md](DEPLOYMENT_READY.md)** - Deployment readiness checklist
- **[VERIFICATION_CHECKLIST.md](VERIFICATION_CHECKLIST.md)** - Post-deployment verification

### Design & Planning
- **[PRD.md](PRD.md)** - Product requirements document
- **[DESIGN_SYSTEM.md](DESIGN_SYSTEM.md)** - Design system and UI guidelines
- **[BLAZE_BRANDING_SUMMARY.md](BLAZE_BRANDING_SUMMARY.md)** - Branding guidelines

---

## 🛠️ Available Scripts

All scripts are in the project root directory:

| Script | Purpose | Usage |
|--------|---------|-------|
| `deploy-mcp.sh` | Full automated deployment to Cloudflare | `./deploy-mcp.sh` |
| `test-claude-connection.sh` | Test MCP connection and auth | `./test-claude-connection.sh` |
| `make-executable.sh` | Make scripts executable | `bash make-executable.sh` |
| `validate-deployment.sh` | Validate deployment status | `./validate-deployment.sh` |

### Make Scripts Executable First

```bash
bash make-executable.sh
```

---

## 🔑 Your Credentials

All credentials are stored in `.env` (never committed to git):

```bash
# View your credentials
cat .env
```

**Important values:**

- **BSI_API_KEY:** `bsi_mcp_83453667ea265aa73a3ccae226cc0003ba006b27a`
  - This is what Claude.ai uses to authenticate
  - Format in Claude.ai: `Authorization: Bearer bsi_mcp_83453667ea265aa73a3ccae226cc0003ba006b27a`

- **MCP Endpoint:** `https://sabermetrics.blazesportsintel.com/mcp`

- **Cloudflare Account ID:** `a12cb329d84130460eed99b816e4d0d3`

---

## 🎯 Common Tasks

### Fix Claude.ai Connection Error

```bash
# Quick diagnostic
./test-claude-connection.sh

# If API key not set
echo "bsi_mcp_83453667ea265aa73a3ccae226cc0003ba006b27a" | wrangler secret put BSI_API_KEY

# Redeploy
wrangler deploy

# Test again
./test-claude-connection.sh
```

### Deploy MCP Server from Scratch

```bash
# Full automated deployment
./deploy-mcp.sh

# This will:
# 1. Create KV namespaces
# 2. Set BSI_API_KEY
# 3. Deploy to Cloudflare
# 4. Show connection details
```

### Test the MCP Server

```bash
# Health check (no auth required)
curl https://sabermetrics.blazesportsintel.com/health

# MCP endpoint with auth
curl -X POST https://sabermetrics.blazesportsintel.com/mcp \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer bsi_mcp_83453667ea265aa73a3ccae226cc0003ba006b27a" \
  -d '{"jsonrpc":"2.0","id":1,"method":"tools/list","params":{}}'
```

### View Live Logs

```bash
# Watch logs in real-time
wrangler tail

# Then try connecting from Claude.ai to see what errors occur
```

### Check Deployment Status

```bash
# List deployments
wrangler deployments list

# Check secrets (won't show values, just names)
wrangler secret list

# Check KV namespaces
wrangler kv:namespace list
```

---

## 🏗️ Project Structure

```
/workspaces/spark-template/
├── src/
│   ├── mcp/                      # MCP server implementation
│   │   ├── standalone-worker.ts  # Main Worker file
│   │   ├── server.ts             # MCP server logic
│   │   └── http-server.ts        # HTTP endpoints
│   ├── components/               # React UI components
│   └── App.tsx                   # Main React app
├── wrangler.toml                 # Cloudflare Workers config
├── .env                          # Your credentials (not in git)
├── .env.example                  # Example credentials file
├── deploy-mcp.sh                 # Automated deployment script
├── test-claude-connection.sh     # Connection test script
└── Documentation (markdown files listed above)
```

---

## 🔐 Security Notes

1. **Never commit `.env` to git** - It's already in `.gitignore`

2. **API keys are stored as Cloudflare secrets** - They're encrypted and not accessible via the dashboard

3. **Rate limiting is configured** - 60 requests/minute per IP address

4. **Authentication is required** - All `/mcp` and `/api/*` endpoints require the Bearer token

---

## 📖 Claude.ai Setup (Quick Version)

1. **Go to Claude.ai** → Settings → Connectors

2. **Add Server:**
   - **URL:** `https://sabermetrics.blazesportsintel.com/mcp`
   - **Header Key:** `Authorization`
   - **Header Value:** `Bearer bsi_mcp_83453667ea265aa73a3ccae226cc0003ba006b27a`

3. **Save and test** - Should show "Connected" status

4. **Ask Claude:**
   ```
   What college baseball MCP tools do you have?
   ```

---

## ❓ Need Help?

### For Connection Issues
→ **[TROUBLESHOOTING_CLAUDE_MCP.md](TROUBLESHOOTING_CLAUDE_MCP.md)**

### For Deployment Issues
→ **[MCP_DEPLOYMENT_GUIDE.md](MCP_DEPLOYMENT_GUIDE.md)**

### For API/Tools Reference
→ **[MCP_QUICK_REFERENCE.md](MCP_QUICK_REFERENCE.md)**

### For General Setup
→ **[CLAUDE_MCP_SETUP.md](CLAUDE_MCP_SETUP.md)**

---

## 🚀 Next Steps After Connection Works

Once Claude.ai is connected successfully:

1. **Test the tools** - Ask Claude to use the various MCP tools
2. **Explore features** - Try game data, rankings, metrics calculations
3. **Add more data** - Run PDF scrapers for SEC teams
4. **Set up automation** - Configure cron jobs for data refresh
5. **Monitor usage** - Check logs with `wrangler tail`

---

## 📊 Available MCP Tools

Once connected, Claude.ai can use these tools:

- **get_scoreboard** - Live college baseball games
- **get_game_details** - Box scores and game details
- **get_game_play_by_play** - Play-by-play data
- **get_standings** - Conference standings
- **get_rankings** - Top 25 rankings
- **calculate_batting_metrics** - wOBA, OPS, ISO, BABIP, etc.
- **calculate_pitching_metrics** - FIP, ERA, WHIP, K/9, etc.

See **[MCP_QUICK_REFERENCE.md](MCP_QUICK_REFERENCE.md)** for detailed API docs.

---

## 🏁 Quick Start Checklist

- [ ] Review **[MCP_CONNECTION_FIX.md](MCP_CONNECTION_FIX.md)**
- [ ] Run `bash make-executable.sh`
- [ ] Run `./test-claude-connection.sh`
- [ ] If issues found, run `./deploy-mcp.sh`
- [ ] Configure DNS (if needed) - see TROUBLESHOOTING
- [ ] Add to Claude.ai with correct URL and auth header
- [ ] Test in Claude.ai
- [ ] ✅ Connected!

---

🔥 **COURAGE · GRIT · LEADERSHIP**

*Blaze Sports Intel - Production-Grade NCAA Analytics Platform*
