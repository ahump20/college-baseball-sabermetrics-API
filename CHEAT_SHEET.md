# 🔥 Claude.ai MCP Connection - Cheat Sheet

## Quick Fix (Copy & Paste)

```bash
# 1. Make scripts executable
bash make-executable.sh

# 2. Set API key in Cloudflare
echo "bsi_mcp_83453667ea265aa73a3ccae226cc0003ba006b27a" | wrangler secret put BSI_API_KEY

# 3. Deploy
wrangler deploy

# 4. Test
./test-claude-connection.sh
```

---

## Claude.ai Settings

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

## Test Commands

```bash
# Health check (no auth)
curl https://sabermetrics.blazesportsintel.com/health

# MCP endpoint (with auth)
curl -X POST https://sabermetrics.blazesportsintel.com/mcp \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer bsi_mcp_83453667ea265aa73a3ccae226cc0003ba006b27a" \
  -d '{"jsonrpc":"2.0","id":1,"method":"tools/list","params":{}}'

# Watch live logs
wrangler tail
```

---

## Common Errors & Fixes

| Error | Fix |
|-------|-----|
| "Unauthorized" | `wrangler secret put BSI_API_KEY` |
| "Server not found" | Configure DNS CNAME record |
| "Rate limit exceeded" | Wait 60 seconds or create KV namespace |
| "Connection timeout" | Check `wrangler deployments list` |

---

## DNS Setup

**Cloudflare DNS → Add Record:**
- **Type:** CNAME
- **Name:** sabermetrics
- **Target:** college-baseball-mcp.ahump20.workers.dev
- **Proxy:** ON (orange cloud)

---

## Key Files

- `START_HERE.md` - Main navigation
- `MCP_CONNECTION_FIX.md` - Quick fix guide
- `TROUBLESHOOTING_CLAUDE_MCP.md` - Detailed help
- `.env` - Your credentials (never commit!)

---

## Your Values

```
MCP URL: https://sabermetrics.blazesportsintel.com/mcp
API Key: bsi_mcp_83453667ea265aa73a3ccae226cc0003ba006b27a
Worker:  college-baseball-mcp
Account: a12cb329d84130460eed99b816e4d0d3
```

---

🔥 **COURAGE · GRIT · LEADERSHIP**
