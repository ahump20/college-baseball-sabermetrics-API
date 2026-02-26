# College Baseball Sabermetrics MCP Server - Complete Deployment Guide

This guide walks you through all three steps to get your MCP server running and connected to Claude.ai or ChatGPT.

## 🎯 Three-Step Deployment Process

### Step 1: Test the MCP server locally with curl or Postman before deploying

### Step 2: Deploy the MCP server to Cloudflare Workers and connect it to Claude.ai

### Step 3: Add authentication and rate limiting to secure the MCP server for production use

---

## 📋 Prerequisites

- **Cloudflare Account** (free tier works perfectly) - [Sign up here](https://cloudflare.com)
- **Wrangler CLI** installed globally
  ```bash
  npm install -g wrangler
  ```
- **curl** or **Postman** for local testing

---

## Step 1️⃣: Test Locally Before Deploying

Before deploying to production, let's test the MCP server logic locally.

### Option A: Test with curl (Quick)

The standalone worker file is already set up. Let's create a local test environment:

```bash
# Navigate to your project
cd /workspaces/spark-template

# Start a local Wrangler dev server
cd src/mcp
wrangler dev standalone-worker.ts
```

This will start a local server at `http://localhost:8787`.

### Test the MCP endpoints:

**1. Health Check:**
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

**2. MCP Initialize:**
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

**3. List Available Tools:**
```bash
curl -X POST http://localhost:8787/mcp \
  -H "Content-Type": application/json" \
  -d '{"jsonrpc":"2.0","id":2,"method":"tools/list","params":{}}'
```

**Expected response:**
```json
{
  "jsonrpc": "2.0",
  "id": 2,
  "result": {
    "tools": [
      {
        "name": "get_scoreboard",
        "description": "Get live college baseball scoreboard",
        "inputSchema": { ... },
        "readOnlyHint": true
      },
      ...
    ]
  }
}
```

**4. Call a Tool (Get Scoreboard):**
```bash
curl -X POST http://localhost:8787/mcp \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc":"2.0",
    "id":3,
    "method":"tools/call",
    "params":{
      "name":"get_scoreboard",
      "arguments":{"limit":5}
    }
  }'
```

**5. Calculate Batting Metrics:**
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

**Expected response (metrics):**
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

### Option B: Test with Postman

1. Open Postman
2. Create a new POST request to `http://localhost:8787/mcp`
3. Set Headers:
   - `Content-Type`: `application/json`
4. Set Body (raw JSON):
   ```json
   {
     "jsonrpc": "2.0",
     "id": 1,
     "method": "initialize",
     "params": {}
   }
   ```
5. Send and verify the response matches above

### ✅ Step 1 Complete

If all tests pass, your MCP server logic is working correctly. Move to Step 2 for deployment.

---

## Step 2️⃣: Deploy to Cloudflare Workers

Now let's deploy the MCP server to Cloudflare so it's publicly accessible.

### 2.1: Create a Standalone Deployment Package

```bash
# Create a new directory for deployment
mkdir -p ~/college-baseball-mcp-deploy
cd ~/college-baseball-mcp-deploy

# Copy the standalone worker
cp /workspaces/spark-template/src/mcp/standalone-worker.ts ./index.ts
```

### 2.2: Create `wrangler.toml`

Create a file called `wrangler.toml`:

```toml
name = "college-baseball-mcp"
main = "index.ts"
compatibility_date = "2024-01-01"

[observability]
enabled = true

# Optional: Add custom domain (requires Cloudflare zone)
# routes = [
#   { pattern = "mcp.yourdomain.com/*", zone_name = "yourdomain.com" }
# ]
```

### 2.3: Create `package.json` (minimal, for TypeScript)

```json
{
  "name": "college-baseball-mcp",
  "version": "1.0.0",
  "private": true,
  "scripts": {
    "deploy": "wrangler deploy",
    "dev": "wrangler dev",
    "tail": "wrangler tail"
  },
  "devDependencies": {
    "@cloudflare/workers-types": "^4.20250110.0"
  }
}
```

Install dependencies:
```bash
npm install
```

### 2.4: Login to Cloudflare

```bash
wrangler login
```

This will open a browser window. Authorize Wrangler to access your Cloudflare account.

### 2.5: Deploy!

```bash
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

### 2.6: Test Your Deployed MCP Server

```bash
# Replace <YOUR-SUBDOMAIN> with your actual Cloudflare Workers subdomain
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

### 2.7: Connect to Claude.ai

#### For Individual Users (Claude Pro/Max):

1. Go to **Settings → Connectors**
2. Click **Add custom connector**
3. Paste your Worker URL:
   ```
   https://college-baseball-mcp.<YOUR-SUBDOMAIN>.workers.dev/mcp
   ```
4. Click **Add**
5. In any conversation:
   - Click the **"+"** button (lower left)
   - Select **Connectors**
   - Toggle ON your "College Baseball MCP" connector

#### For Team/Enterprise:

1. **Organization Owner** goes to **Organization settings → Connectors**
2. Click **Add custom connector**
3. Paste the URL
4. Click **Add**
5. **Team members** go to **Settings → Connectors** → find the connector → Click **Connect**

### 2.8: Test with Claude

Once connected, try these prompts in Claude.ai:

```
Get today's college baseball scoreboard
```

```
Calculate sabermetrics for a player with:
- PA: 250, AB: 220, H: 75, 2B: 18, 3B: 3, HR: 12
- BB: 25, HBP: 5, K: 55, SF: 3
```

```
What are the current Top 25 rankings?
```

### ✅ Step 2 Complete

Your MCP server is now publicly deployed and connected to Claude.ai!

---

## Step 3️⃣: Add Authentication and Rate Limiting

The current deployment has authentication and rate limiting built in, but they're disabled by default. Let's enable them for production security.

### 3.1: Create a KV Namespace for Rate Limiting

```bash
# Create a KV namespace
wrangler kv:namespace create "RATE_LIMIT"
```

You'll see output like:
```
🌀 Creating namespace with title "college-baseball-mcp-RATE_LIMIT"
✨ Success!
Add the following to your configuration file in your kv_namespaces array:
{ binding = "RATE_LIMIT_KV", id = "xxxxxxxxxxxxxxxxxxxx" }
```

### 3.2: Update `wrangler.toml` with KV and Secrets

Add these lines to `wrangler.toml`:

```toml
name = "college-baseball-mcp"
main = "index.ts"
compatibility_date = "2024-01-01"

[observability]
enabled = true

# KV Namespace for rate limiting
[[kv_namespaces]]
binding = "RATE_LIMIT_KV"
id = "xxxxxxxxxxxxxxxxxxxx"  # Replace with your KV namespace ID from above

# Secrets (set via wrangler secret put)
# MCP_API_KEY - set this via CLI
```

### 3.3: Set an API Key Secret

```bash
# Generate a secure API key (or use your own)
openssl rand -base64 32

# Set it as a Cloudflare secret
wrangler secret put MCP_API_KEY
# When prompted, paste your API key
```

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

Or using X-API-Key header:
```bash
curl -X POST $MCP_URL/mcp \
  -H "Content-Type: application/json" \
  -H "X-API-Key: YOUR_API_KEY_HERE" \
  -d '{"jsonrpc":"2.0","id":1,"method":"initialize","params":{}}'
```

### 3.6: Update Claude.ai with Authentication

1. Go to **Settings → Connectors**
2. Find your "College Baseball MCP" connector
3. Click the **...** menu → **Advanced settings**
4. Under **Authentication**, select **API Key**
5. Paste your API key
6. Save

### 3.7: Test Rate Limiting

The rate limit is set to **1,000 requests per hour** per IP address.

To test, make rapid requests:

```bash
for i in {1..10}; do
  curl -X POST $MCP_URL/mcp \
    -H "Content-Type: application/json" \
    -H "X-API-Key: YOUR_API_KEY_HERE" \
    -d '{"jsonrpc":"2.0","id":'$i',"method":"tools/list","params":{}}'
  echo ""
done
```

You should see rate limit headers in responses:
```
X-RateLimit-Limit: 1000
X-RateLimit-Remaining: 990
X-RateLimit-Reset: 1704672000000
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

Edit `index.ts` to adjust limits:

```typescript
// At the top of the file
const RATE_LIMIT_WINDOW = 3600000;  // 1 hour in ms
const RATE_LIMIT_MAX_REQUESTS = 1000;  // Max requests per window

// For stricter limits:
// const RATE_LIMIT_MAX_REQUESTS = 100;  // 100 requests/hour

// For more generous limits:
// const RATE_LIMIT_MAX_REQUESTS = 10000;  // 10,000 requests/hour
```

Then redeploy:
```bash
wrangler deploy
```

### ✅ Step 3 Complete

Your MCP server now has:
- ✅ **API key authentication** (protects against unauthorized access)
- ✅ **Rate limiting** (prevents abuse, 1,000 req/hour per IP)
- ✅ **Production-ready security** (CORS, input validation, error handling)

---

## 🎉 All Steps Complete!

You now have a fully functional, secure, production-ready MCP server that:

1. ✅ **Tested locally** before deploying
2. ✅ **Deployed to Cloudflare Workers** with a public HTTPS URL
3. ✅ **Connected to Claude.ai** (and ready for ChatGPT/other MCP clients)
4. ✅ **Secured with authentication** and rate limiting

---

## 📊 Monitoring and Maintenance

### View Real-Time Logs

```bash
wrangler tail
```

This shows all incoming requests in real-time.

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

After making changes to `index.ts`:

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

# Update Claude.ai with new key (Settings → Connectors → Advanced)
```

### Delete the Worker (if needed)

```bash
wrangler delete
```

---

## 🔧 Troubleshooting

### "Failed to connect to server" in Claude.ai

**Check CORS:**
- The worker includes CORS headers for `*`. If you see CORS errors, check browser DevTools → Network tab.

**Verify URL:**
- Must end with `/mcp`
- Must use HTTPS
- Test with `curl` first

### "Invalid Request" errors

- Ensure you're sending valid JSON-RPC 2.0 requests
- Check `jsonrpc` field is `"2.0"`
- Verify `method` is one of: `initialize`, `tools/list`, `tools/call`

### Rate limit errors

- Check your IP isn't being rate limited
- View Cloudflare Analytics to see request volume
- Adjust `RATE_LIMIT_MAX_REQUESTS` if needed

### KV errors

- Verify KV namespace is created: `wrangler kv:namespace list`
- Check binding in `wrangler.toml` matches your KV namespace ID

---

## 📖 API Reference

### Available MCP Tools

| Tool | Description | Parameters |
|------|-------------|------------|
| `get_scoreboard` | Live college baseball games | `limit?: number` |
| `get_game_details` | Box score for a specific game | `gameId: string` |
| `get_game_play_by_play` | Play-by-play events | `gameId: string` |
| `get_standings` | Conference standings | `season?: number` |
| `get_rankings` | Top 25 rankings | `week?: number` |
| `calculate_batting_metrics` | wOBA, OPS, ISO, BABIP, etc. | `stats: object` |
| `calculate_pitching_metrics` | FIP, ERA, WHIP, K/9, etc. | `stats: object` |

### Authentication Headers

The MCP server accepts API keys in two formats:

**Option 1: Authorization Bearer token**
```
Authorization: Bearer YOUR_API_KEY
```

**Option 2: X-API-Key header**
```
X-API-Key: YOUR_API_KEY
```

### Rate Limit Headers (in all responses)

```
X-RateLimit-Limit: 1000
X-RateLimit-Remaining: 995
X-RateLimit-Reset: 1704672000000
```

---

## 🔗 Resources

- [MCP Specification](https://modelcontextprotocol.io/)
- [Claude Custom Connectors Guide](https://support.claude.com/en/articles/11175166-get-started-with-custom-connectors-using-remote-mcp)
- [Cloudflare Workers Docs](https://developers.cloudflare.com/workers/)
- [Cloudflare MCP Guide](https://developers.cloudflare.com/agents/guides/remote-mcp-server/)
- [ESPN College Baseball API](https://site.api.espn.com/apis/site/v2/sports/baseball/college-baseball/scoreboard)

---

## 📄 License

MIT - Same as the parent College Baseball Sabermetrics API project.

---

## ✨ Your MCP Server URL

Once deployed, your MCP server URL will be:

```
https://college-baseball-mcp.<YOUR-SUBDOMAIN>.workers.dev/mcp
```

**Use this URL in:**
- Claude.ai (Settings → Connectors → Add custom connector)
- ChatGPT (when MCP support is available)
- Any MCP-compatible AI coding assistant

Enjoy your production-ready College Baseball Sabermetrics MCP Server! ⚾📊
