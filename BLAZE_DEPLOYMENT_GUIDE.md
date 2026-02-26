# 🔥 Blaze Sports Intel - Custom Domain Deployment Guide

## Overview

This guide will walk you through deploying the College Baseball Sabermetrics API MCP server to the custom domain `sabermetrics.blazesportsintel.com`.

---

## Prerequisites

- ✅ Cloudflare account with `blazesportsintel.com` zone configured
- ✅ Wrangler CLI installed (`npm install -g wrangler`)
- ✅ Repository cloned to your local machine
- ✅ Cloudflare API token with Workers deployment permissions

---

## Step 1: Configure Cloudflare DNS

### 1.1: Add blazesportsintel.com to Cloudflare (if not already)

1. Log in to [Cloudflare Dashboard](https://dash.cloudflare.com)
2. Click **"Add a Site"**
3. Enter `blazesportsintel.com`
4. Follow the nameserver configuration steps
5. Update your domain registrar's nameservers to Cloudflare's

### 1.2: Verify DNS is active

Once nameservers propagate (usually 5-30 minutes):
- Your Cloudflare dashboard should show `blazesportsintel.com` as **Active**

---

## Step 2: Deploy MCP Server to Cloudflare Workers

### 2.1: Navigate to project directory

```bash
cd /workspaces/spark-template
```

### 2.2: Authenticate with Cloudflare

```bash
wrangler login
```

This opens a browser window to authorize the CLI.

### 2.3: Test locally first

```bash
wrangler dev
```

In another terminal, test the MCP endpoint:

```bash
curl -X POST http://localhost:8787/mcp \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","id":1,"method":"initialize","params":{}}'
```

Expected: JSON response with MCP capabilities.

### 2.4: Deploy to Cloudflare

```bash
wrangler deploy
```

You'll see output like:

```
Total Upload: 125 KiB / gzip: 38 KiB
Uploaded college-baseball-mcp (1.23 sec)
Published college-baseball-mcp (0.45 sec)
  https://college-baseball-mcp.YOUR-SUBDOMAIN.workers.dev
Current Deployment ID: abc123...
```

**Your temporary URL:** `https://college-baseball-mcp.YOUR-SUBDOMAIN.workers.dev`

---

## Step 3: Configure Custom Domain Route

The `wrangler.toml` file has been pre-configured with the custom domain route:

```toml
routes = [
  { pattern = "sabermetrics.blazesportsintel.com/*", zone_name = "blazesportsintel.com" }
]
```

### 3.1: Verify zone_name matches your Cloudflare zone

1. Go to [Cloudflare Dashboard](https://dash.cloudflare.com)
2. Click on `blazesportsintel.com`
3. Scroll down to **API** section
4. Confirm **Zone Name** is exactly `blazesportsintel.com`

### 3.2: Redeploy with custom route

```bash
wrangler deploy
```

Cloudflare will automatically:
- Create DNS CNAME record: `sabermetrics.blazesportsintel.com` → Workers route
- Issue SSL certificate via Cloudflare Universal SSL
- Route all traffic matching `sabermetrics.blazesportsintel.com/*` to your Worker

---

## Step 4: Verify Custom Domain Deployment

### 4.1: Wait for DNS propagation (usually instant with Cloudflare)

```bash
dig sabermetrics.blazesportsintel.com
```

Should show Cloudflare IPs.

### 4.2: Test MCP endpoint over HTTPS

```bash
curl https://sabermetrics.blazesportsintel.com/health
```

Expected:
```json
{
  "status": "ok",
  "service": "college-baseball-sabermetrics-mcp",
  "version": "1.0.0"
}
```

### 4.3: Test full MCP initialization

```bash
curl -X POST https://sabermetrics.blazesportsintel.com/mcp \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","id":1,"method":"initialize","params":{}}'
```

Expected: MCP capabilities response with tools list.

---

## Step 5: Connect to Claude.ai

### 5.1: Add Custom Connector

1. Go to [Claude.ai](https://claude.ai)
2. Click **Settings** (gear icon)
3. Select **Connectors** tab
4. Click **Add custom connector**

### 5.2: Enter MCP Server URL

Paste the following URL:

```
https://sabermetrics.blazesportsintel.com/mcp
```

### 5.3: Configure authentication (optional)

If you've set up API key authentication:
- Click **Advanced settings**
- Enter your API key

For now, we're using **authless** mode (public access).

### 5.4: Save and activate

1. Click **Add**
2. In any chat conversation:
   - Click the **+** button (lower left)
   - Select **Connectors**
   - Toggle ON: **College Baseball Sabermetrics**

---

## Step 6: Test Claude Integration

### Test Query 1: Live Scores

```
Get today's college baseball scoreboard
```

Claude should use the `get_scoreboard` tool and return live game data.

### Test Query 2: Rankings

```
Show me the current Top 25 college baseball rankings
```

Claude should use the `get_rankings` tool.

### Test Query 3: Advanced Metrics

```
Calculate batting metrics for a player with:
PA=200, AB=180, H=65, 2B=15, 3B=2, HR=10, BB=18, HBP=2, K=40
```

Claude should use `calculate_batting_metrics` and explain wOBA, wRC+, ISO, etc.

---

## Step 7: Optional - Add Security

### 7.1: Create KV namespace for rate limiting

```bash
wrangler kv:namespace create "RATE_LIMIT"
```

Copy the namespace ID from output.

### 7.2: Update wrangler.toml

Uncomment and update the KV binding:

```toml
[[kv_namespaces]]
binding = "RATE_LIMIT_KV"
id = "YOUR_KV_NAMESPACE_ID"
```

### 7.3: Set API key secret

```bash
wrangler secret put MCP_API_KEY
```

Enter a secure API key when prompted (e.g., generate with `openssl rand -hex 32`).

### 7.4: Redeploy

```bash
wrangler deploy
```

### 7.5: Update Claude connector

1. Go back to Claude.ai → Settings → Connectors
2. Click on your connector
3. **Advanced settings** → Enter the API key
4. Save

---

## Monitoring & Debugging

### Real-time logs

```bash
wrangler tail
```

Shows every request as it happens.

### Cloudflare Analytics

1. [Cloudflare Dashboard](https://dash.cloudflare.com)
2. **Workers & Pages** → **college-baseball-mcp**
3. View:
   - Request volume
   - Error rate
   - Geographic distribution
   - CPU time

### Health check

```bash
# Should always return 200 OK
curl -v https://sabermetrics.blazesportsintel.com/health
```

### MCP tools list

```bash
curl -X POST https://sabermetrics.blazesportsintel.com/mcp \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","id":2,"method":"tools/list","params":{}}'
```

---

## Troubleshooting

### "This site can't be reached"

**Cause:** DNS not propagated or custom route not configured.

**Fix:**
1. Verify `wrangler.toml` has correct `routes` configuration
2. Redeploy: `wrangler deploy`
3. Wait 1-2 minutes for DNS
4. Test with `curl https://sabermetrics.blazesportsintel.com/health`

### "Invalid Request" in Claude.ai

**Cause:** CORS headers not correct or URL malformed.

**Fix:**
1. Ensure URL ends with `/mcp` (not `/` or `/health`)
2. Test locally: `wrangler dev` → test with curl
3. Check browser DevTools → Network tab for CORS errors

### "Rate limit exceeded"

**Cause:** Too many requests from same IP (default: 1,000/hour).

**Fix:**
1. Adjust `RATE_LIMIT_MAX_REQUESTS` in `src/mcp/standalone-worker.ts`
2. Or implement API key auth (Step 7) to get per-key limits

### SSL certificate errors

**Cause:** Cloudflare SSL not yet provisioned.

**Fix:**
- Cloudflare Universal SSL issues certificates within 15 minutes
- Check Cloudflare dashboard → SSL/TLS → Edge Certificates
- Ensure SSL/TLS encryption mode is **Full** or **Full (strict)**

---

## Architecture Overview

```
Claude.ai User
    ↓
[HTTPS Request to sabermetrics.blazesportsintel.com/mcp]
    ↓
Cloudflare Edge Network
    ↓
[Custom Route: sabermetrics.blazesportsintel.com/*]
    ↓
Cloudflare Worker: college-baseball-mcp
    ↓
[MCP Protocol Handler: JSON-RPC 2.0]
    ↓
Tool Router
    ├─→ get_scoreboard → ESPN API
    ├─→ get_game_details → ESPN Box Score
    ├─→ get_standings → ESPN Standings
    ├─→ get_rankings → ESPN Top 25
    ├─→ calculate_batting_metrics → Sabermetrics Engine
    └─→ calculate_pitching_metrics → Sabermetrics Engine
    ↓
[JSON Response to Claude.ai]
```

---

## Production Checklist

- [ ] Custom domain `sabermetrics.blazesportsintel.com` resolves
- [ ] HTTPS certificate active (Cloudflare SSL)
- [ ] MCP `/health` endpoint returns 200 OK
- [ ] MCP `/mcp` endpoint accepts JSON-RPC requests
- [ ] Claude.ai connector configured with correct URL
- [ ] Test queries return real data from ESPN API
- [ ] Monitoring enabled (Cloudflare Analytics + `wrangler tail`)
- [ ] Rate limiting configured (optional but recommended)
- [ ] API key authentication set up (optional for public beta)

---

## Cost Estimate

### Free Tier (Current Setup)

- **100,000 requests/day**
- **3 million requests/month**
- **$0/month**
- Includes custom domain routing
- Includes Cloudflare SSL certificate
- Includes Cloudflare Analytics

### Paid Tier (If Needed)

- **10 million requests/month**
- **$5/month** (Cloudflare Workers Paid plan)
- Advanced monitoring
- Priority support

**Current usage:** Most users stay on free tier indefinitely.

---

## Next Steps

1. ✅ **Deploy**: Follow Steps 1-4 above
2. ✅ **Connect**: Add to Claude.ai (Step 5)
3. ✅ **Test**: Run sample queries (Step 6)
4. 🔒 **Secure**: Add rate limiting + API keys (Step 7)
5. 📊 **Monitor**: Set up alerts in Cloudflare dashboard

---

## Support Resources

- **MCP Specification:** https://modelcontextprotocol.io/
- **Cloudflare Workers Docs:** https://developers.cloudflare.com/workers/
- **Wrangler CLI Docs:** https://developers.cloudflare.com/workers/wrangler/
- **Claude Custom Connectors:** https://support.claude.com/en/articles/11175166
- **ESPN API Docs:** https://gist.github.com/nntrn/ee26cb2a0716de0947a0a4e9a157bc1c

---

## MCP Server URL (Production)

```
https://sabermetrics.blazesportsintel.com/mcp
```

**Use in:**
- ✅ Claude.ai (Settings → Connectors)
- ✅ ChatGPT (when MCP support launches)
- ✅ Any MCP-compatible AI assistant

---

## Branding Updates

The UI has been updated with **Blaze Sports Intel** branding:

### Visual Updates
- ✅ Dark theme with orange/copper accent colors
- ✅ Blaze Sports Intel logo in header and footer
- ✅ "COURAGE · GRIT · LEADERSHIP" tagline
- ✅ Custom domain reference in footer
- ✅ Flame icon for version badge

### Color Palette
- **Background:** Deep charcoal `oklch(0.12 0.01 30)`
- **Primary:** Copper/orange `oklch(0.62 0.18 40)`
- **Accent:** Bright orange `oklch(0.68 0.20 35)`
- **Success:** Field green `oklch(0.55 0.12 145)`

### Typography
- **Headers:** Inter SemiBold
- **Body:** Inter Regular
- **Code/Data:** JetBrains Mono

---

**Powered by Blaze Sports Intel**  
*Courage · Grit · Leadership*

🔥 **sabermetrics.blazesportsintel.com** 🔥
