# 🔥 MCP Server Quick Start - Claude.ai Connection Fix

## The Problem You're Experiencing

You're trying to add the MCP server to Claude.ai but getting this error:

```
"There was an error connecting to the MCP server. Please check your 
server URL and make sure your server handles auth correctly."
```

## The Solution (5 Minutes)

### Step 1: Set the API Key in Cloudflare Workers

The MCP server requires authentication. Run this command:

```bash
echo "bsi_mcp_83453667ea265aa73a3ccae226cc0003ba006b27a" | wrangler secret put BSI_API_KEY
```

This sets your API key as a secret in Cloudflare Workers.

### Step 2: Deploy the MCP Server

```bash
wrangler deploy
```

This deploys your MCP server to Cloudflare Workers at the production URL.

### Step 3: Test the Connection

```bash
bash test-claude-connection.sh
```

This script will:
- Test the health endpoint
- Test MCP authentication
- Show you the exact connection details for Claude.ai

### Step 4: Add to Claude.ai

1. Open **Claude.ai** → **Settings** (⚙️ icon) → **Connectors** (or **Feature Preview**)

2. Click **"Add Server"** or **"+ New Connector"**

3. Fill in:

   **Server URL:**
   ```
   https://sabermetrics.blazesportsintel.com/mcp
   ```

   **Custom Header:**
   - **Key:** `Authorization`
   - **Value:** `Bearer bsi_mcp_83453667ea265aa73a3ccae226cc0003ba006b27a`

4. Click **Save**

5. Status should show **"Connected"** ✅

### Step 5: Test in Claude

Ask Claude:
```
What college baseball MCP tools do you have available?
```

Claude should list tools like:
- get_scoreboard
- get_game_details
- get_rankings
- calculate_batting_metrics
- calculate_pitching_metrics

**You're connected!** 🎉

---

## If It Still Doesn't Work

### Run the Full Deployment Script

```bash
bash deploy-mcp.sh
```

This automated script will:
1. Create KV namespaces for rate limiting
2. Set the BSI_API_KEY secret
3. Deploy to Cloudflare
4. Show you the connection details

### Check the Troubleshooting Guide

See **`TROUBLESHOOTING_CLAUDE_MCP.md`** for detailed diagnostics and solutions.

### Verify Prerequisites

Run these quick checks:

```bash
# 1. Health check (should return {"status":"ok"})
curl https://sabermetrics.blazesportsintel.com/health

# 2. MCP endpoint test (should NOT return "Unauthorized")
curl -X POST https://sabermetrics.blazesportsintel.com/mcp \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer bsi_mcp_83453667ea265aa73a3ccae226cc0003ba006b27a" \
  -d '{"jsonrpc":"2.0","id":1,"method":"initialize","params":{}}'

# 3. Check if you're logged in to Cloudflare
wrangler whoami

# 4. Check deployment status
wrangler deployments list
```

---

## Important URLs & Credentials

**Production MCP Endpoint:**
```
https://sabermetrics.blazesportsintel.com/mcp
```

**Health Check (no auth):**
```
https://sabermetrics.blazesportsintel.com/health
```

**Your BSI API Key:**
```
bsi_mcp_83453667ea265aa73a3ccae226cc0003ba006b27a
```

**Claude.ai Authorization Header:**
```
Authorization: Bearer bsi_mcp_83453667ea265aa73a3ccae226cc0003ba006b27a
```

---

## DNS Configuration (If Server Not Accessible)

If `https://sabermetrics.blazesportsintel.com` doesn't work at all, configure DNS:

1. Go to **Cloudflare Dashboard** → **blazesportsintel.com** → **DNS**

2. Add **CNAME** record:
   - **Type:** CNAME
   - **Name:** sabermetrics
   - **Target:** college-baseball-mcp.ahump20.workers.dev
   - **Proxy:** ON (orange cloud)

3. Wait 1-5 minutes for DNS propagation

4. Test: `curl https://sabermetrics.blazesportsintel.com/health`

---

## What the MCP Server Provides

Once connected to Claude.ai, you can ask Claude to:

### Get Live Game Data
```
Show me today's college baseball scoreboard
```

### Calculate Advanced Metrics
```
Calculate wOBA for a player with:
PA=200, AB=180, H=60, 2B=12, 3B=2, HR=8, BB=15, K=45
```

### Get Rankings
```
Who are the top 10 college baseball teams?
```

### Get Box Scores
```
Get the box score for game ID 401234567
```

### Analyze Teams
```
Show me SEC conference standings
```

---

## Quick Command Reference

| Task | Command |
|------|---------|
| Deploy MCP server | `wrangler deploy` |
| Set API key secret | `echo "YOUR_KEY" \| wrangler secret put BSI_API_KEY` |
| Test connection | `bash test-claude-connection.sh` |
| Full automated setup | `bash deploy-mcp.sh` |
| View live logs | `wrangler tail` |
| Check deployments | `wrangler deployments list` |
| Health check | `curl https://sabermetrics.blazesportsintel.com/health` |

---

## Files & Documentation

| File | Purpose |
|------|---------|
| `TROUBLESHOOTING_CLAUDE_MCP.md` | Detailed error solutions and diagnostics |
| `CLAUDE_MCP_SETUP.md` | Complete Claude.ai connection guide |
| `deploy-mcp.sh` | Automated deployment script |
| `test-claude-connection.sh` | Quick connection test |
| `.env` | Your credentials (never commit to git) |
| `wrangler.toml` | Cloudflare Workers configuration |

---

## Still Having Issues?

1. **Read the detailed guide:** `TROUBLESHOOTING_CLAUDE_MCP.md`
2. **Check Worker logs:** `wrangler tail` (run in terminal, then try connecting from Claude.ai to see real-time errors)
3. **Verify secret is set:** `wrangler secret list` (should show BSI_API_KEY)
4. **Test manually:** Use the curl commands in this guide
5. **Redeploy:** `wrangler deploy` and try again

---

## Understanding the Error

The error "Please check your server URL and make sure your server handles auth correctly" means one of:

1. ❌ **BSI_API_KEY not set** → Run `wrangler secret put BSI_API_KEY`
2. ❌ **Wrong URL in Claude.ai** → Use `https://sabermetrics.blazesportsintel.com/mcp`
3. ❌ **Wrong auth header** → Use `Authorization: Bearer YOUR_KEY` (with space after "Bearer")
4. ❌ **Server not deployed** → Run `wrangler deploy`
5. ❌ **DNS not configured** → Add CNAME record in Cloudflare

The `test-claude-connection.sh` script will help you identify which one!

---

🔥 **COURAGE · GRIT · LEADERSHIP**

*Blaze Sports Intel - Production-Grade NCAA Analytics Platform*
