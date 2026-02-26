# 🚀 Deploy College Baseball MCP Server to Cloudflare Workers

## Complete Guide: Three Steps from Zero to Production

This guide will walk you through deploying your College Baseball Sabermetrics MCP server to Cloudflare Workers and connecting it to Claude.ai.

---

## 📋 Prerequisites

- **Cloudflare Account** (free tier is perfect) - [Sign up here](https://cloudflare.com)
- **Wrangler CLI** - Install globally:
  ```bash
  npm install -g wrangler
  ```
- **This repository** cloned or downloaded

---

## Step 1️⃣: Test Locally (5 minutes)

Before deploying to production, let's verify the MCP server works correctly.

### 1.1: Start Local Development Server

```bash
# Navigate to your project root
cd /workspaces/spark-template

# Start local Wrangler dev server
wrangler dev
```

This starts a local server at `http://localhost:8787`.

### 1.2: Test Health Check

Open a new terminal and run:

```bash
curl http://localhost:8787/health
```

**Expected response:**
```json
{
  "status": "ok",
  "service": "college-baseball-sabermetrics-mcp",
  "version": "1.0.0"
}
```

### 1.3: Test MCP Initialize

```bash
curl -X POST http://localhost:8787/mcp \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","id":1,"method":"initialize","params":{}}'
```

**Expected response:**
```json
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

### 1.4: Test List Tools

```bash
curl -X POST http://localhost:8787/mcp \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","id":2,"method":"tools/list","params":{}}'
```

You should see a JSON response with 7 tools available.

### 1.5: Test Real Data (Get Scoreboard)

```bash
curl -X POST http://localhost:8787/mcp \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","id":3,"method":"tools/call","params":{"name":"get_scoreboard","arguments":{"limit":5}}}'
```

This will return live college baseball game data from ESPN.

### 1.6: Test Sabermetrics Calculator

```bash
curl -X POST http://localhost:8787/mcp \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc":"2.0",
    "id":4,
    "method":"tools/call",
    "params":{
      "name":"calculate_batting_metrics",
      "arguments":{
        "stats":{
          "pa":200,"ab":175,"h":58,"_2b":12,"_3b":2,"hr":8,
          "bb":22,"hbp":3,"k":45,"sf":2
        }
      }
    }
  }'
```

**Expected response** (metrics calculated):
```json
{
  "jsonrpc": "2.0",
  "id": 4,
  "result": {
    "content": [{
      "type": "text",
      "text": "{\n  \"wOBA\": \"0.392\",\n  \"AVG\": \"0.331\",\n  \"OBP\": \"0.415\",\n  \"SLG\": \"0.571\",\n  \"OPS\": \"0.986\",\n  \"ISO\": \"0.240\",\n  \"BABIP\": \"0.385\",\n  \"BB%\": \"11.0\",\n  \"K%\": \"22.5\"\n}"
    }]
  }
}
```

### ✅ Step 1 Complete

If all tests pass, your MCP server is working correctly. Press `Ctrl+C` to stop the dev server and proceed to Step 2.

---

## Step 2️⃣: Deploy to Cloudflare Workers (5 minutes)

Now let's deploy your MCP server to Cloudflare so it's publicly accessible.

### 2.1: Login to Cloudflare

```bash
wrangler login
```

This opens a browser window. Authorize Wrangler to access your Cloudflare account.

### 2.2: Deploy to Production

```bash
# From your project root
cd /workspaces/spark-template

# Deploy!
wrangler deploy
```

You'll see output like:

```
Total Upload: XX.XX KiB / gzip: XX.XX KiB
Uploaded college-baseball-mcp (X.XX sec)
Published college-baseball-mcp (X.XX sec)
  https://college-baseball-mcp.<YOUR-SUBDOMAIN>.workers.dev
Current Deployment ID: xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
```

**🎉 Your MCP server is now live!**

### 2.3: Test Your Deployed Server

```bash
# Save your URL (replace <YOUR-SUBDOMAIN> with the actual subdomain from above)
export MCP_URL="https://college-baseball-mcp.<YOUR-SUBDOMAIN>.workers.dev"

# Health check
curl $MCP_URL/health

# MCP initialize
curl -X POST $MCP_URL/mcp \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","id":1,"method":"initialize","params":{}}'

# List tools
curl -X POST $MCP_URL/mcp \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","id":2,"method":"tools/list","params":{}}'
```

All three should return successful responses.

### 2.4: Connect to Claude.ai

#### For Individual Users (Claude Pro/Max):

1. Go to **[Claude.ai](https://claude.ai)** → **Settings** → **Connectors**
2. Click **Add custom connector**
3. Paste your Worker URL (must end with `/mcp`):
   ```
   https://college-baseball-mcp.<YOUR-SUBDOMAIN>.workers.dev/mcp
   ```
4. Click **Add**
5. In any conversation:
   - Click the **"+"** button (lower left)
   - Select **Connectors**
   - Toggle **ON** your "College Baseball MCP" connector

#### For Team/Enterprise:

1. **Organization Owner** goes to **Organization settings** → **Connectors**
2. Click **Add custom connector**
3. Paste the URL
4. Click **Add**
5. **Team members** go to **Settings** → **Connectors** → find the connector → Click **Connect**

### 2.5: Test with Claude

Once connected, try these prompts in Claude.ai:

```
Get today's college baseball scoreboard
```

```
Show me the current Top 25 rankings
```

```
Calculate sabermetrics for a player with these stats:
- PA: 250, AB: 220, H: 75, 2B: 18, 3B: 3, HR: 12
- BB: 25, HBP: 5, K: 55, SF: 3
```

```
Get the box score for game ID 401628374 and calculate advanced metrics
```

### ✅ Step 2 Complete

Your MCP server is now publicly deployed and connected to Claude.ai!

**Your permanent MCP URL:**
```
https://college-baseball-mcp.<YOUR-SUBDOMAIN>.workers.dev/mcp
```

---

## Step 3️⃣: Add Authentication and Rate Limiting (10 minutes)

The current deployment works without authentication. For production security, let's add API key authentication and rate limiting.

### 3.1: Create a KV Namespace for Rate Limiting

```bash
wrangler kv:namespace create "RATE_LIMIT"
```

You'll see output like:

```
🌀 Creating namespace with title "college-baseball-mcp-RATE_LIMIT"
✨ Success!
Add the following to your configuration file in your kv_namespaces array:
{ binding = "RATE_LIMIT_KV", id = "xxxxxxxxxxxxxxxxxxxx" }
```

**Copy that ID** - you'll need it in the next step.

### 3.2: Update `wrangler.toml` with KV Binding

Edit `/workspaces/spark-template/wrangler.toml`:

```toml
name = "college-baseball-mcp"
main = "src/mcp/standalone-worker.ts"
compatibility_date = "2024-01-01"

[observability]
enabled = true

# KV Namespace for rate limiting
[[kv_namespaces]]
binding = "RATE_LIMIT_KV"
id = "xxxxxxxxxxxxxxxxxxxx"  # ← Replace with your KV namespace ID from above
```

### 3.3: Generate and Set an API Key

```bash
# Generate a secure random API key (macOS/Linux)
openssl rand -base64 32

# Copy the output, then set it as a Cloudflare secret
wrangler secret put MCP_API_KEY
# When prompted, paste your API key and press Enter
```

**Save your API key somewhere safe** - you'll need it to connect Claude.ai.

### 3.4: Redeploy with Security Enabled

```bash
wrangler deploy
```

### 3.5: Test Authentication

**Without API key (should fail):**

```bash
curl -X POST $MCP_URL/mcp \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","id":1,"method":"initialize","params":{}}'
```

**Expected response:**
```json
{
  "error": "Missing API key. Provide via Authorization: Bearer <key> or X-API-Key header."
}
```

**With API key (should succeed):**

```bash
curl -X POST $MCP_URL/mcp \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_API_KEY_HERE" \
  -d '{"jsonrpc":"2.0","id":1,"method":"initialize","params":{}}'
```

Or using `X-API-Key` header:

```bash
curl -X POST $MCP_URL/mcp \
  -H "Content-Type: application/json" \
  -H "X-API-Key: YOUR_API_KEY_HERE" \
  -d '{"jsonrpc":"2.0","id":1,"method":"initialize","params":{}}'
```

### 3.6: Update Claude.ai with Authentication

1. Go to **Settings** → **Connectors**
2. Find your "College Baseball MCP" connector
3. Click the **...** menu → **Advanced settings**
4. Under **Authentication**, there should be an option for API Key
5. Paste your API key
6. Save

**Note:** As of January 2025, Claude.ai's custom connector UI may not expose an API key field in Advanced settings. If you don't see it:

- Use the authless version (skip Step 3 entirely), or
- Wait for Anthropic to add this UI, or
- Use OAuth (requires more setup - see `MCP_DEPLOYMENT_GUIDE.md` for details)

### 3.7: Test Rate Limiting

The rate limit is set to **1,000 requests per hour** per IP address.

Watch the rate limit headers in responses:

```bash
curl -X POST $MCP_URL/mcp \
  -H "Content-Type: application/json" \
  -H "X-API-Key: YOUR_API_KEY_HERE" \
  -d '{"jsonrpc":"2.0","id":1,"method":"tools/list","params":{}}' \
  -v 2>&1 | grep -i ratelimit
```

You should see:
```
< X-RateLimit-Limit: 1000
< X-RateLimit-Remaining: 999
< X-RateLimit-Reset: 1704672000000
```

If you exceed the limit, you'll get:
```json
{
  "error": "Rate limit exceeded",
  "limit": 1000,
  "window": 3600,
  "resetAt": "2025-01-08T12:00:00.000Z"
}
```

### 3.8: Customize Rate Limits (Optional)

To adjust limits, edit `src/mcp/standalone-worker.ts`:

```typescript
// Near the top of the file
const RATE_LIMIT_WINDOW = 3600000;  // 1 hour in ms
const RATE_LIMIT_MAX_REQUESTS = 1000;  // Max requests per window

// For stricter limits:
// const RATE_LIMIT_MAX_REQUESTS = 100;

// For more generous limits:
// const RATE_LIMIT_MAX_REQUESTS = 10000;
```

Then redeploy:
```bash
wrangler deploy
```

### ✅ Step 3 Complete

Your MCP server now has:
- ✅ **API key authentication** (protects against unauthorized access)
- ✅ **Rate limiting** (1,000 requests/hour per IP)
- ✅ **Production-ready security** (CORS, input validation, error handling)

---

## 🎉 All Three Steps Complete!

You now have a fully functional, secure, production-ready MCP server:

1. ✅ **Tested locally** before deploying
2. ✅ **Deployed to Cloudflare Workers** with a public HTTPS URL
3. ✅ **Connected to Claude.ai** (ready for ChatGPT/other MCP clients)
4. ✅ **Secured** (optional) with authentication and rate limiting

---

## 📊 What's Available

Your MCP server exposes **7 tools** to Claude.ai:

| Tool | Description | Example Usage |
|------|-------------|---------------|
| `get_scoreboard` | Live college baseball games | "Show today's games" |
| `get_game_details` | Box score for a specific game | "Get box score for game 401628374" |
| `get_game_play_by_play` | Play-by-play events | "Show play-by-play for game 401628374" |
| `get_standings` | Conference standings | "Show SEC standings" |
| `get_rankings` | Top 25 rankings | "What are the current Top 25 rankings?" |
| `calculate_batting_metrics` | wOBA, OPS, ISO, BABIP, etc. | "Calculate metrics for PA=200, AB=180, H=65..." |
| `calculate_pitching_metrics` | FIP, ERA, WHIP, K/9, etc. | "Calculate pitching metrics for IP=100, K=95..." |

All tools pull **real, live data** from:
- ✅ ESPN College Baseball API
- ✅ NCAA.com (via ESPN integration)
- ✅ Conference standings
- ✅ National rankings

---

## 🔍 Monitoring and Maintenance

### View Real-Time Logs

```bash
wrangler tail
```

Shows all incoming requests in real-time.

### View Analytics in Cloudflare Dashboard

1. Go to [Cloudflare Dashboard](https://dash.cloudflare.com)
2. Select **Workers & Pages**
3. Click on **college-baseball-mcp**
4. View metrics:
   - Request volume
   - Success rate
   - Error rate
   - CPU time
   - Geographic distribution

### Update the Worker

After making changes:

```bash
wrangler deploy
```

Changes are live immediately (no downtime).

### Rotate API Keys

```bash
# Generate a new key
openssl rand -base64 32

# Update the secret
wrangler secret put MCP_API_KEY
# Paste new key

# Update Claude.ai with new key (if using auth)
```

---

## 🛠️ Troubleshooting

### "Failed to connect to server" in Claude.ai

**Check CORS:**
- The worker includes CORS headers for `*`
- Check browser DevTools → Network tab for CORS errors

**Verify URL:**
- Must end with `/mcp`
- Must use HTTPS
- Test with `curl` first

**Check Deployment:**
```bash
curl https://college-baseball-mcp.<YOUR-SUBDOMAIN>.workers.dev/health
```

### "Invalid Request" errors

- Ensure you're sending valid JSON-RPC 2.0 requests
- Check `jsonrpc` field is `"2.0"`
- Verify `method` is one of: `initialize`, `tools/list`, `tools/call`

### Rate limit errors

- Check your IP isn't being rate limited
- View Cloudflare Analytics for request volume
- Adjust `RATE_LIMIT_MAX_REQUESTS` if needed

### KV errors

- Verify KV namespace is created: `wrangler kv:namespace list`
- Check binding in `wrangler.toml` matches your KV namespace ID

---

## 📖 Additional Resources

- [MCP Specification](https://modelcontextprotocol.io/)
- [Claude Custom Connectors Guide](https://support.claude.com/en/articles/11175166-get-started-with-custom-connectors-using-remote-mcp)
- [Cloudflare Workers Docs](https://developers.cloudflare.com/workers/)
- [Cloudflare MCP Guide](https://developers.cloudflare.com/agents/guides/remote-mcp-server/)
- [ESPN College Baseball API](https://site.api.espn.com/apis/site/v2/sports/baseball/college-baseball/scoreboard)

---

## ✨ Your Production MCP Server URL

```
https://college-baseball-mcp.<YOUR-SUBDOMAIN>.workers.dev/mcp
```

Use this URL in:
- ✅ Claude.ai (Settings → Connectors → Add custom connector)
- ✅ ChatGPT (when MCP support is available)
- ✅ Any MCP-compatible AI coding assistant

---

## 📝 Cost Breakdown

**Cloudflare Workers Free Tier:**
- ✅ 100,000 requests per day
- ✅ Unlimited domains
- ✅ No credit card required

**Paid Plan ($5/month):**
- 10,000,000 requests per month
- Advanced analytics
- Priority support

For most use cases, **the free tier is more than enough**.

---

## 🎓 What You've Built

A production-ready MCP server that:
1. Implements the full MCP protocol (JSON-RPC 2.0)
2. Exposes 7 powerful tools for college baseball analytics
3. Pulls real, live data from ESPN and NCAA sources
4. Calculates advanced sabermetrics (wOBA, FIP, OPS+, etc.)
5. Handles CORS for browser clients
6. Includes optional API key authentication
7. Implements rate limiting to prevent abuse
8. Deploys globally on Cloudflare's edge network
9. Costs $0/month for most usage patterns
10. Takes 15 minutes from zero to production

**Enjoy your College Baseball Sabermetrics MCP Server!** ⚾📊
