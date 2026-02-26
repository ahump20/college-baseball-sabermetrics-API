# 🔥 Troubleshooting Claude.ai MCP Connection Error

## Problem

When trying to add the MCP server to Claude.ai, you see:

```
"There was an error connecting to the MCP server. Please check your server URL 
and make sure your server handles auth correctly."
```

## Root Causes & Solutions

### 🔴 Issue 1: BSI_API_KEY Secret Not Set in Cloudflare Workers

**Symptom:** The MCP server returns 401 Unauthorized when Claude.ai tries to connect.

**Why this happens:** The MCP server requires authentication via the `BSI_API_KEY` environment variable, but this secret hasn't been set in Cloudflare Workers yet.

**Solution:**

```bash
# Method 1: Use the quick test script
bash test-claude-connection.sh

# Method 2: Set manually
# Get your API key from .env file, then:
echo "bsi_mcp_83453667ea265aa73a3ccae226cc0003ba006b27a" | wrangler secret put BSI_API_KEY

# Method 3: Interactive
wrangler secret put BSI_API_KEY
# Then paste: bsi_mcp_83453667ea265aa73a3ccae226cc0003ba006b27a
```

**Verify:**
```bash
curl -X POST https://sabermetrics.blazesportsintel.com/mcp \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer bsi_mcp_83453667ea265aa73a3ccae226cc0003ba006b27a" \
  -d '{"jsonrpc":"2.0","id":1,"method":"initialize","params":{}}'
```

Expected response should include `"protocolVersion":"2024-11-05"` and NOT "Unauthorized".

---

### 🔴 Issue 2: Wrong Server URL in Claude.ai

**Symptom:** Claude.ai can't connect to the server at all.

**Why this happens:** The URL might be missing `/mcp` at the end, or using an old preview URL.

**Correct URL:**
```
https://sabermetrics.blazesportsintel.com/mcp
```

**Wrong URLs (don't use these):**
- ❌ `https://sabermetrics.blazesportsintel.com` (missing /mcp)
- ❌ `https://college-baseball-sab--ahump20.github.app/mcp` (old preview URL)
- ❌ `http://sabermetrics.blazesportsintel.com/mcp` (http instead of https)

---

### 🔴 Issue 3: Missing or Malformed Authorization Header

**Symptom:** 401 Unauthorized or auth error in Claude.ai

**Why this happens:** The Authorization header format is incorrect.

**Correct format in Claude.ai:**

When adding custom header in Claude.ai Connectors:

```
Header Key:   Authorization
Header Value: Bearer bsi_mcp_83453667ea265aa73a3ccae226cc0003ba006b27a
```

**Important:**
- There MUST be a space between `Bearer` and the key
- Don't include quotes around the value
- Use the exact key from your `.env` file: `BSI_API_KEY=bsi_mcp_83453667ea265aa73a3ccae226cc0003ba006b27a`

**Common mistakes:**
- ❌ `Bearer bsi_mcp_83453667ea265aa73a3ccae226cc0003ba006b27a` (no space)
- ❌ `"Bearer bsi_mcp_83453667ea265aa73a3ccae226cc0003ba006b27a"` (quotes included)
- ❌ `bsi_mcp_83453667ea265aa73a3ccae226cc0003ba006b27a` (missing "Bearer" prefix)

---

### 🔴 Issue 4: Server Not Deployed or DNS Not Configured

**Symptom:** Connection timeout or "server not found"

**Why this happens:** Either the Worker isn't deployed, or DNS isn't pointing to it.

**Check deployment:**
```bash
curl https://sabermetrics.blazesportsintel.com/health
```

Expected response:
```json
{"status":"ok","service":"college-baseball-sabermetrics-mcp","version":"1.0.0"}
```

**If you get an error:**

1. **Deploy the Worker:**
   ```bash
   wrangler deploy
   ```

2. **Configure DNS in Cloudflare:**
   - Go to Cloudflare Dashboard → Your account → blazesportsintel.com → DNS
   - Add CNAME record:
     - **Type:** CNAME
     - **Name:** sabermetrics
     - **Target:** college-baseball-mcp.ahump20.workers.dev
     - **Proxy status:** Proxied (orange cloud)
     - **TTL:** Auto
   - Click "Save"

3. **Wait for DNS propagation** (usually 1-5 minutes, max 24 hours)

4. **Test again:**
   ```bash
   curl https://sabermetrics.blazesportsintel.com/health
   ```

---

### 🔴 Issue 5: Rate Limiting KV Namespace Not Set

**Symptom:** Server works but returns errors about rate limiting

**Why this happens:** The code expects `RATE_LIMIT_KV` binding but it's not configured in wrangler.toml

**Solution:**

1. **Create KV namespace:**
   ```bash
   wrangler kv:namespace create RATE_LIMIT_KV
   ```

2. **Copy the ID from output:**
   ```
   ✨ Success!
   Add the following to your configuration file in your kv_namespaces array:
   { binding = "RATE_LIMIT_KV", id = "abc123def456..." }
   ```

3. **Edit wrangler.toml** and uncomment/update:
   ```toml
   [[kv_namespaces]]
   binding = "RATE_LIMIT_KV"
   id = "abc123def456..."  # Paste your actual ID here
   ```

4. **Redeploy:**
   ```bash
   wrangler deploy
   ```

5. **Repeat for TEAM_STATS_KV:**
   ```bash
   wrangler kv:namespace create TEAM_STATS_KV
   ```

---

## Step-by-Step Connection Guide for Claude.ai

### Prerequisites Checklist

Before connecting to Claude.ai, verify ALL of these:

- [ ] Worker is deployed: `wrangler deploy` completed successfully
- [ ] DNS is configured: CNAME record points sabermetrics → college-baseball-mcp.ahump20.workers.dev
- [ ] Health endpoint works: `curl https://sabermetrics.blazesportsintel.com/health` returns `{"status":"ok"}`
- [ ] BSI_API_KEY is set: `wrangler secret put BSI_API_KEY` completed
- [ ] KV namespaces created and configured in wrangler.toml
- [ ] MCP endpoint works with auth: Run `bash test-claude-connection.sh`

### Adding to Claude.ai (Web Interface)

1. **Open Claude.ai Settings**
   - Click the settings icon (⚙️) in bottom left
   - Go to **"Feature Preview"** or **"Connectors"** section

2. **Enable MCP (if needed)**
   - Toggle ON: "Model Context Protocol (MCP)"

3. **Add New Connector**
   - Click **"Add Server"** or **"+ New Connector"**

4. **Fill in Details:**

   **Server Name:**
   ```
   College Baseball Sabermetrics API
   ```

   **Server URL:**
   ```
   https://sabermetrics.blazesportsintel.com/mcp
   ```

   **Custom Header:**
   - Click "Add Custom Header" or "Add Header"
   - **Header Key:** `Authorization`
   - **Header Value:** `Bearer bsi_mcp_83453667ea265aa73a3ccae226cc0003ba006b27a`
     
     ⚠️ **IMPORTANT:** 
     - Include the word "Bearer" followed by a space
     - Use your exact BSI_API_KEY from .env file
     - No quotes, no extra spaces

5. **Save**
   - Click "Save" or "Add"
   - Status should change to **"Connected"** with a green indicator

6. **Verify Tools Loaded**
   - You should see available tools listed:
     - get_scoreboard
     - get_game_details
     - get_rankings
     - calculate_batting_metrics
     - calculate_pitching_metrics
     - ... and more

### Testing the Connection

In Claude chat, try these prompts:

**Test 1: List available tools**
```
What MCP tools do you have for college baseball?
```

**Test 2: Get live data**
```
Show me today's college baseball scoreboard using your MCP tool
```

**Test 3: Calculate metrics**
```
Calculate batting metrics for: PA=200, AB=180, H=60, 2B=12, 3B=2, HR=8, BB=15, K=45
```

If Claude uses the tools successfully, **you're connected!** ✅

---

## Quick Diagnostic Commands

Run these to diagnose issues:

```bash
# 1. Test health endpoint (no auth needed)
curl https://sabermetrics.blazesportsintel.com/health

# 2. Test MCP endpoint with auth
curl -X POST https://sabermetrics.blazesportsintel.com/mcp \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer bsi_mcp_83453667ea265aa73a3ccae226cc0003ba006b27a" \
  -d '{"jsonrpc":"2.0","id":1,"method":"initialize","params":{}}'

# 3. List available tools
curl -X POST https://sabermetrics.blazesportsintel.com/mcp \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer bsi_mcp_83453667ea265aa73a3ccae226cc0003ba006b27a" \
  -d '{"jsonrpc":"2.0","id":1,"method":"tools/list","params":{}}'

# 4. Run automated test script
bash test-claude-connection.sh

# 5. Check Wrangler deployment status
wrangler deployments list

# 6. View Worker logs (live)
wrangler tail

# 7. Check if secret is set (won't show value, just confirms existence)
wrangler secret list
```

---

## Common Error Messages & Fixes

### "Unauthorized" or 401

**Fix:** BSI_API_KEY not set or incorrect
```bash
echo "bsi_mcp_83453667ea265aa73a3ccae226cc0003ba006b27a" | wrangler secret put BSI_API_KEY
wrangler deploy
```

### "Rate limit exceeded" or 429

**Fix:** Too many requests, wait 60 seconds OR KV namespace not configured
```bash
# Create and configure KV namespace
wrangler kv:namespace create RATE_LIMIT_KV
# Then add the ID to wrangler.toml and redeploy
```

### "Connection timeout" or "Server not found"

**Fix:** DNS not configured or Worker not deployed
```bash
# Redeploy
wrangler deploy

# Check DNS in Cloudflare dashboard
# Ensure CNAME: sabermetrics → college-baseball-mcp.ahump20.workers.dev
```

### "Invalid Request" or "Method not found"

**Fix:** Request format incorrect - ensure using JSON-RPC 2.0 format
```json
{
  "jsonrpc": "2.0",
  "id": 1,
  "method": "initialize",
  "params": {}
}
```

---

## Complete Setup from Scratch

If nothing works, start fresh:

```bash
# 1. Ensure you're logged in to Cloudflare
wrangler login

# 2. Set the API key
echo "bsi_mcp_83453667ea265aa73a3ccae226cc0003ba006b27a" | wrangler secret put BSI_API_KEY

# 3. Create KV namespaces
wrangler kv:namespace create RATE_LIMIT_KV
wrangler kv:namespace create TEAM_STATS_KV

# 4. Edit wrangler.toml with the KV IDs from step 3

# 5. Deploy
wrangler deploy

# 6. Test
bash test-claude-connection.sh

# 7. Add to Claude.ai using the connection details shown
```

---

## Support Resources

- **MCP Specification:** https://modelcontextprotocol.io/
- **Claude MCP Docs:** https://support.anthropic.com/en/collections/7979775-model-context-protocol
- **Cloudflare Workers Docs:** https://developers.cloudflare.com/workers/
- **Wrangler CLI Docs:** https://developers.cloudflare.com/workers/wrangler/

---

## Your Specific Configuration

**API Key (from .env):**
```
bsi_mcp_83453667ea265aa73a3ccae226cc0003ba006b27a
```

**MCP Endpoint:**
```
https://sabermetrics.blazesportsintel.com/mcp
```

**Authorization Header for Claude.ai:**
```
Key:   Authorization
Value: Bearer bsi_mcp_83453667ea265aa73a3ccae226cc0003ba006b27a
```

**Worker Name:**
```
college-baseball-mcp
```

**Cloudflare Account (from .env):**
```
Account ID: a12cb329d84130460eed99b816e4d0d3
```

---

🔥 **COURAGE · GRIT · LEADERSHIP**

*Blaze Sports Intel - Production-Grade NCAA Analytics Platform*
