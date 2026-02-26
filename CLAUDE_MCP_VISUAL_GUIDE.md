# 🔥 Claude.ai MCP Connection - Visual Guide

## The Connection Flow

```
┌─────────────────┐
│   Claude.ai     │
│                 │
│  Settings →     │
│  Connectors →   │
│  Add Server     │
└────────┬────────┘
         │
         │ HTTPS Request
         │ POST /mcp
         │
         │ Headers:
         │ • Content-Type: application/json
         │ • Authorization: Bearer bsi_mcp_83453667ea265aa73a3ccae226cc0003ba006b27a
         │
         ▼
┌─────────────────────────────────────────────────────┐
│  https://sabermetrics.blazesportsintel.com/mcp      │
│                                                     │
│  Cloudflare Workers                                 │
│  ┌────────────────────────────────────────────┐   │
│  │ standalone-worker.ts                       │   │
│  │                                            │   │
│  │ 1. Check Authorization header              │   │
│  │    ├─ Missing → 401 Unauthorized          │   │
│  │    ├─ Wrong → 401 Unauthorized            │   │
│  │    └─ Correct → Continue                  │   │
│  │                                            │   │
│  │ 2. Check rate limit (60 req/min)          │   │
│  │    └─ Exceeded → 429 Rate Limit           │   │
│  │                                            │   │
│  │ 3. Process MCP request                     │   │
│  │    ├─ initialize → Server info            │   │
│  │    ├─ tools/list → Available tools        │   │
│  │    └─ tools/call → Execute tool           │   │
│  │                                            │   │
│  │ 4. Return JSON-RPC 2.0 response           │   │
│  └────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────┘
         │
         │ Response
         │
         ▼
┌─────────────────┐
│   Claude.ai     │
│                 │
│  Status:        │
│  ✅ Connected   │
│                 │
│  Tools loaded:  │
│  • get_scoreboard
│  • get_game_details
│  • get_rankings
│  • calculate_batting_metrics
│  • ...
└─────────────────┘
```

---

## What Each Part Does

### 1. Claude.ai Connector Setup

**You configure in Claude.ai Settings:**

| Field | Value |
|-------|-------|
| Server Name | College Baseball Sabermetrics API |
| Server URL | `https://sabermetrics.blazesportsintel.com/mcp` |
| Header Key | `Authorization` |
| Header Value | `Bearer bsi_mcp_83453667ea265aa73a3ccae226cc0003ba006b27a` |

### 2. Cloudflare DNS

**CNAME Record (in Cloudflare Dashboard):**

```
Type:   CNAME
Name:   sabermetrics
Target: college-baseball-mcp.ahump20.workers.dev
Proxy:  ON (orange cloud)
```

This makes `sabermetrics.blazesportsintel.com` → `college-baseball-mcp.ahump20.workers.dev`

### 3. Cloudflare Worker

**Environment Variables (set via wrangler):**

```bash
# Secret (encrypted, set once)
wrangler secret put BSI_API_KEY
> bsi_mcp_83453667ea265aa73a3ccae226cc0003ba006b27a

# KV Namespaces (for rate limiting)
wrangler kv:namespace create RATE_LIMIT_KV
wrangler kv:namespace create TEAM_STATS_KV
```

### 4. Authentication Check

**Worker code checks:**

```typescript
const authHeader = request.headers.get('Authorization');
const providedKey = authHeader?.replace('Bearer ', '');

if (providedKey !== env.BSI_API_KEY) {
  return 401 Unauthorized
}
```

**This is why you need:**
- ✅ `BSI_API_KEY` set in Cloudflare (via `wrangler secret put`)
- ✅ `Authorization: Bearer YOUR_KEY` in Claude.ai header

---

## Common Failure Points

### ❌ Failure 1: "Unauthorized" Error

```
Claude.ai → Worker
              │
              ├─ Check: env.BSI_API_KEY
              │    ↓
              │    undefined (not set!)
              │
              └─ Return: 401 Unauthorized
```

**Fix:**
```bash
echo "bsi_mcp_83453667ea265aa73a3ccae226cc0003ba006b27a" | wrangler secret put BSI_API_KEY
wrangler deploy
```

### ❌ Failure 2: "Server not found"

```
Claude.ai → sabermetrics.blazesportsintel.com
              │
              ├─ DNS lookup
              │    ↓
              │    No CNAME record!
              │
              └─ Error: Cannot resolve hostname
```

**Fix:**
Add CNAME record in Cloudflare DNS:
- Name: `sabermetrics`
- Target: `college-baseball-mcp.ahump20.workers.dev`

### ❌ Failure 3: "Invalid header format"

```
Claude.ai
  │
  └─ Header: "Bearerbsi_mcp_..." (no space!)
              │
              ▼
         Worker checks: authHeader.replace('Bearer ', '')
              │
              ├─ Gets: "Bearerbsi_mcp_..."
              │
              └─ Doesn't match env.BSI_API_KEY
                   │
                   └─ Return: 401 Unauthorized
```

**Fix:**
Header value MUST have space after "Bearer":
```
Bearer bsi_mcp_83453667ea265aa73a3ccae226cc0003ba006b27a
```

---

## Step-by-Step Visual Checklist

### ☐ Step 1: Cloudflare Setup

```bash
# Login to Cloudflare
wrangler login
   ↓
✅ Authenticated
```

### ☐ Step 2: Set API Key Secret

```bash
echo "bsi_mcp_83453667ea265aa73a3ccae226cc0003ba006b27a" | wrangler secret put BSI_API_KEY
   ↓
✅ Secret set in Cloudflare Workers
```

### ☐ Step 3: Deploy Worker

```bash
wrangler deploy
   ↓
✅ Deployed to college-baseball-mcp.ahump20.workers.dev
```

### ☐ Step 4: Configure DNS

```
Cloudflare Dashboard → DNS → Add Record
   ↓
Type: CNAME
Name: sabermetrics
Target: college-baseball-mcp.ahump20.workers.dev
   ↓
✅ sabermetrics.blazesportsintel.com is live
```

### ☐ Step 5: Test Health Endpoint

```bash
curl https://sabermetrics.blazesportsintel.com/health
   ↓
{"status":"ok","service":"college-baseball-sabermetrics-mcp","version":"1.0.0"}
   ↓
✅ Server is accessible
```

### ☐ Step 6: Test MCP with Auth

```bash
curl -X POST https://sabermetrics.blazesportsintel.com/mcp \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer bsi_mcp_83453667ea265aa73a3ccae226cc0003ba006b27a" \
  -d '{"jsonrpc":"2.0","id":1,"method":"initialize","params":{}}'
   ↓
{"jsonrpc":"2.0","id":1,"result":{"protocolVersion":"2024-11-05",...}}
   ↓
✅ Authentication works
```

### ☐ Step 7: Add to Claude.ai

```
Claude.ai → Settings → Connectors → Add Server
   ↓
URL: https://sabermetrics.blazesportsintel.com/mcp
Header: Authorization: Bearer bsi_mcp_83453667ea265aa73a3ccae226cc0003ba006b27a
   ↓
✅ Status: Connected
```

### ☐ Step 8: Test in Claude

```
User: "What college baseball MCP tools do you have?"
   ↓
Claude uses tools/list method
   ↓
Claude responds with list of tools
   ↓
✅ MCP integration working!
```

---

## Complete Connection Test Script

Run this to test everything:

```bash
#!/bin/bash

echo "Testing MCP Connection..."
echo ""

# Test 1: Health check
echo "1. Testing health endpoint (no auth)..."
curl -s https://sabermetrics.blazesportsintel.com/health
echo ""

# Test 2: MCP initialize
echo "2. Testing MCP initialize (with auth)..."
curl -s -X POST https://sabermetrics.blazesportsintel.com/mcp \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer bsi_mcp_83453667ea265aa73a3ccae226cc0003ba006b27a" \
  -d '{"jsonrpc":"2.0","id":1,"method":"initialize","params":{}}'
echo ""

# Test 3: List tools
echo "3. Testing tools/list..."
curl -s -X POST https://sabermetrics.blazesportsintel.com/mcp \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer bsi_mcp_83453667ea265aa73a3ccae226cc0003ba006b27a" \
  -d '{"jsonrpc":"2.0","id":1,"method":"tools/list","params":{}}'
echo ""

echo "If all three tests passed, you're ready to connect Claude.ai!"
```

Save as `test-connection.sh` and run:
```bash
bash test-connection.sh
```

---

## Understanding the Error Messages

### Error: "Unauthorized"

```json
{
  "error": "Unauthorized",
  "message": "Valid API key required. Set header: Authorization: Bearer YOUR_KEY"
}
```

**Meaning:** The Worker checked `env.BSI_API_KEY` and it either:
1. Doesn't exist (not set via `wrangler secret put`)
2. Doesn't match the key in your Authorization header

**Fix:** Set the secret and redeploy.

### Error: "Rate limit exceeded"

```json
{
  "error": "Rate limit exceeded",
  "message": "60 requests/minute limit. Retry after 60 seconds."
}
```

**Meaning:** You've made >60 requests in the last minute.

**Fix:** Wait 60 seconds, or create the `RATE_LIMIT_KV` namespace to enable proper rate limiting.

### Error: "Method not found"

```json
{
  "jsonrpc": "2.0",
  "id": 1,
  "error": {
    "code": -32601,
    "message": "Method not found: your_method"
  }
}
```

**Meaning:** You called an MCP method that doesn't exist.

**Valid methods:**
- `initialize`
- `tools/list`
- `tools/call`

---

## Your Specific Configuration

**Copy these values exactly:**

| What | Value |
|------|-------|
| MCP URL | `https://sabermetrics.blazesportsintel.com/mcp` |
| Auth Header Key | `Authorization` |
| Auth Header Value | `Bearer bsi_mcp_83453667ea265aa73a3ccae226cc0003ba006b27a` |
| Worker Name | `college-baseball-mcp` |
| Cloudflare Account | `a12cb329d84130460eed99b816e4d0d3` |

---

🔥 **COURAGE · GRIT · LEADERSHIP**

*Blaze Sports Intel - Production-Grade NCAA Analytics Platform*
