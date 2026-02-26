# ⚡ DEPLOYMENT QUICK START

## Run These Commands Now (10 minutes total)

### Step 1: Authenticate (30 seconds)
```bash
export CLOUDFLARE_API_TOKEN=cyiTcPF1i_7rDzJHjKqmYHGpnfBKFDmO9DN_q91Q
cd /workspaces/spark-template
wrangler whoami
```

Expected: Should show your Cloudflare account info.

---

### Step 2: Create KV Namespace (1 minute)
```bash
wrangler kv:namespace create RATE_LIMIT_KV
```

**IMPORTANT:** Copy the ID from the output (looks like: `id = "abc123def456..."`).

Then edit `wrangler.toml` and find this section:
```toml
# [[kv_namespaces]]
# binding = "RATE_LIMIT_KV"
# id = "your-kv-namespace-id-here"
```

Uncomment it and replace `your-kv-namespace-id-here` with your actual ID:
```toml
[[kv_namespaces]]
binding = "RATE_LIMIT_KV"
id = "abc123def456ghi789"
```

---

### Step 3: Generate and Set API Key (1 minute)
```bash
# Generate a secure key
openssl rand -hex 32
```

Copy the output (your API key). Then:
```bash
# Set it as a Cloudflare secret
wrangler secret put BSI_API_KEY
```

Paste your API key when prompted.

**SAVE YOUR API KEY!** You'll need it for Claude.ai.

---

### Step 4: Deploy (1 minute)
```bash
wrangler deploy
```

Expected output:
```
✨ Success!
Published college-baseball-mcp
  https://college-baseball-mcp.workers.dev
  sabermetrics.blazesportsintel.com
```

---

### Step 5: Configure DNS (2 minutes)

1. Go to https://dash.cloudflare.com
2. Click `blazesportsintel.com`
3. Go to **DNS** tab
4. Click **Add record**
5. Fill in:
   - Type: **CNAME**
   - Name: **sabermetrics**
   - Target: **college-baseball-sab.ahump20.workers.dev**
   - Proxy: **ON** (orange cloud)
6. Click **Save**

Wait 1-2 minutes for DNS to propagate.

---

### Step 6: Test (2 minutes)

```bash
# Test health (no auth)
curl https://sabermetrics.blazesportsintel.com/health

# Test MCP (with auth - replace YOUR_API_KEY)
curl -X POST https://sabermetrics.blazesportsintel.com/mcp \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -d '{"jsonrpc":"2.0","id":1,"method":"tools/list","params":{}}'
```

Expected: JSON responses confirming the server is live.

---

### Step 7: Connect Claude.ai (3 minutes)

1. Open https://claude.ai
2. Click **Settings** (⚙️) → **Feature Preview**
3. Enable **Model Context Protocol (MCP)**
4. Go to **Connectors** → **Add Server**
5. Fill in:
   - **Name:** College Baseball Sabermetrics
   - **URL:** https://sabermetrics.blazesportsintel.com/mcp
   - **Custom Header:**
     - Key: `Authorization`
     - Value: `Bearer YOUR_API_KEY` (use the key from Step 3)
6. Click **Save**

---

### Step 8: Test in Claude

Type in Claude:
```
Show me today's college baseball scores
```

Expected: Claude uses the MCP tools and returns live game data.

---

## ✅ YOU'RE LIVE!

**Production URL:** https://sabermetrics.blazesportsintel.com

**MCP Endpoint:** https://sabermetrics.blazesportsintel.com/mcp

**Your API Key:** (saved from Step 3)

---

## Troubleshooting

### "Worker threw exception"
- Check `wrangler.toml` has the correct KV namespace ID
- Run `wrangler tail` to see error logs
- Verify secrets are set: `wrangler secret list`

### "Unauthorized" in Claude
- Verify API key in Claude header is correct
- Check header format: `Bearer YOUR_KEY` (with space)
- Confirm secret is set: `wrangler secret list` should show `BSI_API_KEY`

### DNS not resolving
- Wait 5 minutes for propagation
- Check CNAME in Cloudflare dashboard
- Verify proxy is ON (orange cloud)

---

## Full Documentation

See these files for complete details:
- `DEPLOYMENT_READY.md` - Executive summary
- `PRODUCTION_DEPLOYMENT_STEPS.md` - Complete walkthrough
- `CLAUDE_MCP_SETUP.md` - Claude.ai connection guide

---

🔥 **Blaze Sports Intel**  
*Production-Grade NCAA Analytics*
