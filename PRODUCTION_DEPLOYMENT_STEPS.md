# 🔥 Production Deployment - Complete Walkthrough

## Overview

This document provides **exact commands** to deploy the College Baseball Sabermetrics MCP Server to production at `https://sabermetrics.blazesportsintel.com`.

⚠️ **IMPORTANT**: This file contains sensitive credentials. Do NOT commit to public repositories.

---

## Prerequisites Completed

✅ `wrangler.toml` configured with custom domain routes  
✅ Authentication middleware implemented in `standalone-worker.ts`  
✅ Rate limiting with KV namespace support  
✅ DNS CNAME file created at `/public/CNAME`  
✅ API documentation UI component created

---

## Step 1: Authenticate Wrangler CLI

### Option A: Use API Token (Recommended)

```bash
export CLOUDFLARE_API_TOKEN=cyiTcPF1i_7rDzJHjKqmYHGpnfBKFDmO9DN_q91Q
```

Verify authentication:

```bash
wrangler whoami
```

Expected output:
```
 ⛅️ wrangler 3.x.x
-------------------
Getting User settings...
👋 You are logged in with an API Token, associated with the email '<your-email>'.
┌──────────────────────┬──────────────────────────────────┐
│ Account Name         │ Account ID                       │
├──────────────────────┼──────────────────────────────────┤
│ BSI                  │ a12cb329d84130460eed99b816e4d0d3 │
└──────────────────────┴──────────────────────────────────┘
```

### Option B: Interactive Login

```bash
wrangler login
```

This opens a browser for OAuth authentication.

---

## Step 2: Create KV Namespace for Rate Limiting

Create the KV namespace:

```bash
wrangler kv:namespace create RATE_LIMIT_KV
```

**Example Output:**
```
 ⛅️ wrangler 3.x.x
-------------------
🌀 Creating namespace with title "college-baseball-mcp-RATE_LIMIT_KV"
✨ Success!
Add the following to your configuration file in your kv_namespaces array:
{ binding = "RATE_LIMIT_KV", id = "abc123def456ghi789" }
```

**Copy the namespace ID** from the output (the `id` value).

### Update wrangler.toml

Edit `wrangler.toml` and uncomment the KV namespace section, adding your ID:

```toml
[[kv_namespaces]]
binding = "RATE_LIMIT_KV"
id = "YOUR_KV_NAMESPACE_ID_HERE"
```

Replace `YOUR_KV_NAMESPACE_ID_HERE` with the actual ID from the command output.

---

## Step 3: Set API Key Secret

Generate a secure API key:

```bash
openssl rand -hex 32
```

**Example output:** `a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6a7b8c9d0`

Set the secret in Cloudflare Workers:

```bash
wrangler secret put BSI_API_KEY
```

When prompted, **paste the generated key** (or use your own secure key).

**Important:** Save this API key securely! You'll need it to:
- Connect Claude.ai to the MCP server
- Make authenticated API requests
- Configure other AI agents

---

## Step 4: Configure Cloudflare DNS

### 4.1: Access Cloudflare Dashboard

1. Go to [https://dash.cloudflare.com](https://dash.cloudflare.com)
2. Log in with your credentials
3. Select the `blazesportsintel.com` zone

### 4.2: Add CNAME Record

Navigate to **DNS** → **Records** → **Add record**

**Configuration:**
- **Type:** CNAME
- **Name:** `sabermetrics`
- **Target:** `college-baseball-sab.ahump20.workers.dev`
- **Proxy status:** ✅ Proxied (orange cloud icon ON)
- **TTL:** Auto

Click **Save**.

### 4.3: Verify DNS Record

Wait 1-2 minutes, then test:

```bash
dig sabermetrics.blazesportsintel.com
```

Expected: Cloudflare IP addresses in the response.

---

## Step 5: Deploy to Production

### 5.1: Build and Deploy

From the project root directory:

```bash
cd /workspaces/spark-template
wrangler deploy
```

**Expected Output:**
```
 ⛅️ wrangler 3.x.x
-------------------
Total Upload: XX KiB / gzip: XX KiB
Uploaded college-baseball-mcp (X.XX sec)
Published college-baseball-mcp (X.XX sec)
  https://college-baseball-mcp.<worker-name>.workers.dev
  sabermetrics.blazesportsintel.com
Current Deployment ID: xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
```

✅ Your MCP server is now live at: **https://sabermetrics.blazesportsintel.com**

---

## Step 6: Verify Deployment

### 6.1: Test Health Endpoint (No Auth Required)

```bash
curl https://sabermetrics.blazesportsintel.com/health
```

**Expected Response:**
```json
{
  "status": "ok",
  "service": "college-baseball-sabermetrics-mcp",
  "version": "1.0.0"
}
```

### 6.2: Test MCP Endpoint (Requires Auth)

**Without API Key (Should Fail):**

```bash
curl -X POST https://sabermetrics.blazesportsintel.com/mcp \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","id":1,"method":"initialize","params":{}}'
```

**Expected Response (401 Unauthorized):**
```json
{
  "error": "Unauthorized",
  "message": "Valid API key required. Set header: Authorization: Bearer YOUR_KEY"
}
```

**With API Key (Should Succeed):**

Replace `YOUR_BSI_API_KEY` with the key you set in Step 3:

```bash
curl -X POST https://sabermetrics.blazesportsintel.com/mcp \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_BSI_API_KEY" \
  -d '{"jsonrpc":"2.0","id":1,"method":"initialize","params":{}}'
```

**Expected Response (200 OK):**
```json
{
  "jsonrpc": "2.0",
  "id": 1,
  "result": {
    "protocolVersion": "2024-11-05",
    "capabilities": {
      "tools": {}
    },
    "serverInfo": {
      "name": "college-baseball-sabermetrics-api",
      "version": "1.0.0"
    }
  }
}
```

### 6.3: Test Tools List

```bash
curl -X POST https://sabermetrics.blazesportsintel.com/mcp \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_BSI_API_KEY" \
  -d '{"jsonrpc":"2.0","id":2,"method":"tools/list","params":{}}'
```

**Expected Response:** JSON array of available tools (scoreboard, rankings, metrics calculators, etc.)

---

## Step 7: Connect to Claude.ai

### 7.1: Open Claude.ai Settings

1. Go to [https://claude.ai](https://claude.ai)
2. Click the **Settings** icon (⚙️) in the bottom left
3. Navigate to **Feature Preview** tab
4. Enable **Model Context Protocol (MCP)** if not already enabled

### 7.2: Add Custom MCP Server

1. In Settings, go to the **Connectors** or **MCP Servers** section
2. Click **Add Server** or **+ New**
3. Fill in the configuration:

**Server Configuration:**
```json
{
  "name": "College Baseball Sabermetrics",
  "url": "https://sabermetrics.blazesportsintel.com/mcp",
  "headers": {
    "Authorization": "Bearer YOUR_BSI_API_KEY"
  }
}
```

Replace `YOUR_BSI_API_KEY` with your actual API key from Step 3.

### 7.3: Alternative: Claude Desktop App Configuration

If using Claude Desktop, edit the config file:

**macOS:** `~/Library/Application Support/Claude/claude_desktop_config.json`  
**Windows:** `%APPDATA%\Claude\claude_desktop_config.json`  
**Linux:** `~/.config/Claude/claude_desktop_config.json`

Add this to the `mcpServers` section:

```json
{
  "mcpServers": {
    "college-baseball-sabermetrics": {
      "url": "https://sabermetrics.blazesportsintel.com/mcp",
      "headers": {
        "Authorization": "Bearer YOUR_BSI_API_KEY"
      }
    }
  }
}
```

Restart Claude Desktop after saving.

### 7.4: Test Integration

In a Claude conversation, try these queries:

**Query 1: Check Available Tools**
```
What tools do you have available for college baseball?
```

Claude should list the MCP tools (scoreboard, rankings, metrics calculators).

**Query 2: Get Live Scores**
```
Show me today's college baseball scores
```

Claude should use the `get_scoreboard` tool and return game data.

**Query 3: Calculate Metrics**
```
Calculate batting metrics for a player with:
PA=250, AB=220, H=75, 2B=18, 3B=3, HR=12, BB=25, HBP=5, K=55
```

Claude should use `calculate_batting_metrics` and explain wOBA, OPS, ISO, etc.

---

## Step 8: Monitor & Debug

### 8.1: View Real-Time Logs

```bash
wrangler tail
```

This streams live request logs. Press Ctrl+C to stop.

### 8.2: Check Cloudflare Analytics

1. Go to [Cloudflare Dashboard](https://dash.cloudflare.com)
2. Select your account → **Workers & Pages**
3. Click **college-baseball-mcp**
4. View metrics:
   - Requests per second
   - Error rate
   - CPU time
   - Geographic distribution

### 8.3: Test Rate Limiting

Make 61+ requests in 60 seconds to trigger rate limiting:

```bash
for i in {1..65}; do
  echo "Request $i"
  curl -X POST https://sabermetrics.blazesportsintel.com/mcp \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer YOUR_BSI_API_KEY" \
    -d '{"jsonrpc":"2.0","id":'$i',"method":"initialize","params":{}}'
  sleep 0.5
done
```

After 60 requests, you should see HTTP 429 responses.

---

## Step 9: Update Future Deployments

Whenever you make code changes:

```bash
# 1. Make your code changes
# 2. Deploy
wrangler deploy

# 3. Verify
curl https://sabermetrics.blazesportsintel.com/health
```

No need to recreate secrets or KV namespaces—they persist across deployments.

---

## Troubleshooting

### Issue: "Error 1101: Worker threw exception"

**Cause:** Code error in the worker.

**Fix:**
1. Check syntax in `src/mcp/standalone-worker.ts`
2. Run `wrangler dev` to test locally first
3. View logs with `wrangler tail`

### Issue: DNS not resolving

**Cause:** CNAME record not set or propagation delay.

**Fix:**
1. Verify CNAME in Cloudflare DNS dashboard
2. Wait 5-10 minutes for propagation
3. Clear DNS cache: `sudo dscacheutil -flushcache` (macOS)

### Issue: "Unauthorized" even with correct API key

**Cause:** Secret not set or incorrect.

**Fix:**
1. Re-run `wrangler secret put BSI_API_KEY`
2. Verify secret exists: `wrangler secret list`
3. Redeploy: `wrangler deploy`

### Issue: Rate limit not working

**Cause:** KV namespace not bound or incorrect ID.

**Fix:**
1. Verify KV namespace ID in `wrangler.toml`
2. Check binding name is exactly `RATE_LIMIT_KV`
3. List namespaces: `wrangler kv:namespace list`

---

## Security Notes

### API Key Best Practices

- ✅ **DO** use a strong, randomly generated key (32+ characters)
- ✅ **DO** rotate keys periodically
- ✅ **DO** use different keys for production vs. development
- ❌ **DON'T** commit API keys to Git repositories
- ❌ **DON'T** share keys in public Slack/Discord channels
- ❌ **DON'T** hardcode keys in client-side code

### Rate Limiting Notes

- Current limit: **60 requests/minute per IP**
- Adjust in `standalone-worker.ts` if needed:
  ```typescript
  const RATE_LIMIT_WINDOW = 60000; // 60 seconds
  const RATE_LIMIT_MAX_REQUESTS = 60; // requests per window
  ```

### CORS Configuration

The worker allows all origins (`Access-Control-Allow-Origin: *`). To restrict:

Edit `standalone-worker.ts`:
```typescript
const corsHeaders = {
  'Access-Control-Allow-Origin': 'https://claude.ai', // Restrict to specific domain
  // ...
};
```

---

## Quick Reference Commands

```bash
# Authenticate
export CLOUDFLARE_API_TOKEN=cyiTcPF1i_7rDzJHjKqmYHGpnfBKFDmO9DN_q91Q

# Deploy
wrangler deploy

# View logs
wrangler tail

# Set secret
wrangler secret put BSI_API_KEY

# List secrets
wrangler secret list

# Create KV namespace
wrangler kv:namespace create RATE_LIMIT_KV

# List KV namespaces
wrangler kv:namespace list

# Test health endpoint
curl https://sabermetrics.blazesportsintel.com/health

# Test MCP endpoint (replace YOUR_BSI_API_KEY)
curl -X POST https://sabermetrics.blazesportsintel.com/mcp \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_BSI_API_KEY" \
  -d '{"jsonrpc":"2.0","id":1,"method":"tools/list","params":{}}'
```

---

## Production URLs

- **MCP Endpoint:** `https://sabermetrics.blazesportsintel.com/mcp`
- **Health Check:** `https://sabermetrics.blazesportsintel.com/health`
- **Web UI:** `https://sabermetrics.blazesportsintel.com/`

---

## Cloudflare Account Details

**Account ID:** `a12cb329d84130460eed99b816e4d0d3`  
**Zone:** `blazesportsintel.com`  
**Worker Name:** `college-baseball-mcp`  
**Subdomain:** `sabermetrics.blazesportsintel.com`

---

## Complete Deployment Checklist

- [ ] Step 1: Authenticate Wrangler CLI
- [ ] Step 2: Create KV namespace for rate limiting
- [ ] Step 3: Set BSI_API_KEY secret
- [ ] Step 4: Configure DNS CNAME record in Cloudflare
- [ ] Step 5: Deploy worker to production
- [ ] Step 6: Verify all endpoints (health, MCP, auth, rate limit)
- [ ] Step 7: Connect Claude.ai with authentication headers
- [ ] Step 8: Test integration with sample queries
- [ ] Step 9: Set up monitoring (wrangler tail, Cloudflare Analytics)

---

**Deployment Status:** Ready for production ✅

**Next Actions:**
1. Run `wrangler deploy` to go live
2. Set your API key with `wrangler secret put BSI_API_KEY`
3. Create the rate limit KV namespace
4. Add CNAME record in Cloudflare DNS
5. Connect Claude.ai with the MCP endpoint + auth header

🔥 **Powered by Blaze Sports Intel**  
*Courage · Grit · Leadership*
