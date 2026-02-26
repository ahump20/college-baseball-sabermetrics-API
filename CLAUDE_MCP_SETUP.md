# 🔥 Claude.ai MCP Connection Guide

## Quick Setup (3 Minutes)

### Prerequisites
- ✅ MCP server deployed to `https://sabermetrics.blazesportsintel.com`
- ✅ BSI_API_KEY set in Cloudflare Workers secrets
- ✅ Claude.ai account with MCP feature enabled

---

## Method 1: Claude.ai Web Interface

### Step 1: Enable MCP (if not already enabled)

1. Go to [Claude.ai](https://claude.ai)
2. Click **Settings** (⚙️ icon, bottom left)
3. Navigate to **Feature Preview**
4. Toggle ON: **Model Context Protocol (MCP)**

### Step 2: Add MCP Server

1. In Settings, go to **Connectors** or **MCP** section
2. Click **Add Server** or **+ New Connector**
3. Fill in the configuration:

**Server Name:**
```
College Baseball Sabermetrics
```

**Server URL:**
```
https://sabermetrics.blazesportsintel.com/mcp
```

**Authentication:**
- Click **Add Custom Header**
- Header Key: `Authorization`
- Header Value: `Bearer YOUR_BSI_API_KEY`

Replace `YOUR_BSI_API_KEY` with your actual API key.

### Step 3: Save and Activate

1. Click **Save** or **Add**
2. The server should show as **Connected** with a green indicator
3. You'll see available tools listed (scoreboard, rankings, metrics, etc.)

---

## Method 2: Claude Desktop App

### Step 1: Locate Config File

**macOS:**
```bash
~/Library/Application Support/Claude/claude_desktop_config.json
```

**Windows:**
```
%APPDATA%\Claude\claude_desktop_config.json
```

**Linux:**
```bash
~/.config/Claude/claude_desktop_config.json
```

### Step 2: Edit Configuration

Open the config file and add this to the `mcpServers` section:

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

**Complete Example:**
```json
{
  "mcpServers": {
    "college-baseball-sabermetrics": {
      "url": "https://sabermetrics.blazesportsintel.com/mcp",
      "headers": {
        "Authorization": "Bearer a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6"
      }
    }
  },
  "globalShortcut": "CommandOrControl+Shift+Space"
}
```

Replace `a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6` with your actual API key.

### Step 3: Restart Claude Desktop

Close and reopen the Claude Desktop app for changes to take effect.

---

## Method 3: Alternative MCP Clients

### For Generic MCP Clients

**Connection Details:**
- **Protocol:** MCP over HTTP (JSON-RPC 2.0)
- **Endpoint:** `https://sabermetrics.blazesportsintel.com/mcp`
- **Method:** POST
- **Content-Type:** `application/json`
- **Authentication Header:** `Authorization: Bearer YOUR_BSI_API_KEY`

**Example Request (cURL):**
```bash
curl -X POST https://sabermetrics.blazesportsintel.com/mcp \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_BSI_API_KEY" \
  -d '{
    "jsonrpc": "2.0",
    "id": 1,
    "method": "tools/list",
    "params": {}
  }'
```

---

## Verification

### Test 1: Check Connection

In Claude, type:
```
What MCP tools do you have available for college baseball?
```

**Expected:** Claude lists the available tools:
- `get_scoreboard` - Get live college baseball scoreboard
- `get_game_details` - Get box score for a specific game
- `get_rankings` - Get Top 25 rankings
- `calculate_batting_metrics` - Calculate wOBA, OPS, ISO, etc.
- `calculate_pitching_metrics` - Calculate FIP, ERA, WHIP, etc.
- ... and more

### Test 2: Live Data

```
Show me today's college baseball scores
```

**Expected:** Claude uses `get_scoreboard` tool and returns live game data.

### Test 3: Advanced Metrics

```
Calculate batting metrics for a player with:
PA=250, AB=220, H=75, 2B=18, 3B=3, HR=12, BB=25, HBP=5, K=55
```

**Expected:** Claude uses `calculate_batting_metrics` and explains:
- wOBA (weighted On-Base Average)
- OPS (On-base Plus Slugging)
- ISO (Isolated Power)
- BABIP (Batting Average on Balls in Play)
- BB% and K% rates

### Test 4: Team Rankings

```
Who are the top 10 college baseball teams right now?
```

**Expected:** Claude uses `get_rankings` tool and returns current Top 25 data.

---

## Troubleshooting

### Issue: "Unable to connect to MCP server"

**Possible Causes:**
1. Server URL incorrect
2. API key missing or invalid
3. Network/firewall blocking the connection

**Solutions:**
1. Verify URL is exactly: `https://sabermetrics.blazesportsintel.com/mcp`
2. Test endpoint manually:
   ```bash
   curl https://sabermetrics.blazesportsintel.com/health
   ```
   Should return `{"status":"ok",...}`
3. Check API key is set correctly in the `Authorization` header

### Issue: "Unauthorized" or 401 errors

**Cause:** API key missing, malformed, or incorrect.

**Solution:**
1. Verify header format: `Authorization: Bearer YOUR_KEY` (with space after "Bearer")
2. Check for extra spaces or line breaks in the key
3. Confirm the key matches what was set with `wrangler secret put BSI_API_KEY`

### Issue: "Rate limit exceeded"

**Cause:** More than 60 requests per minute.

**Solution:**
1. Wait 60 seconds before retrying
2. If you need higher limits, contact the API administrator
3. Current limit headers are returned in responses:
   - `X-RateLimit-Limit: 60`
   - `X-RateLimit-Remaining: <count>`
   - `X-RateLimit-Reset: <timestamp>`

### Issue: Claude doesn't use the tools

**Cause:** Tools not properly registered or connection inactive.

**Solution:**
1. Check that the connector shows **Connected** status
2. Try explicitly asking Claude to use a specific tool:
   ```
   Use the get_scoreboard tool to show me today's games
   ```
3. Restart Claude Desktop (if using desktop app)
4. Re-add the connector (web interface)

---

## Available MCP Tools

### 1. `get_scoreboard`
**Description:** Get live college baseball scoreboard  
**Parameters:**
- `limit` (optional): Max number of games (default: 50)

**Example Usage:**
```
Show me today's college baseball scoreboard
```

### 2. `get_game_details`
**Description:** Get detailed box score for a specific game  
**Parameters:**
- `gameId` (required): ESPN game ID

**Example Usage:**
```
Get the box score for game ID 401234567
```

### 3. `get_game_play_by_play`
**Description:** Get play-by-play data for a game  
**Parameters:**
- `gameId` (required): ESPN game ID

**Example Usage:**
```
Show me the play-by-play for game 401234567
```

### 4. `get_standings`
**Description:** Get conference standings  
**Parameters:**
- `season` (optional): Season year (default: current year)

**Example Usage:**
```
Show me the conference standings
```

### 5. `get_rankings`
**Description:** Get Top 25 rankings  
**Parameters:**
- `week` (optional): Week number (default: current week)

**Example Usage:**
```
Who are the top 25 college baseball teams?
```

### 6. `calculate_batting_metrics`
**Description:** Calculate advanced batting metrics (wOBA, OPS, ISO, BABIP, etc.)  
**Parameters:**
- `stats` (required): Object with batting stats (pa, ab, h, hr, bb, k, etc.)

**Example Usage:**
```
Calculate batting metrics for: PA=200, AB=180, H=60, HR=8, BB=15, K=45
```

### 7. `calculate_pitching_metrics`
**Description:** Calculate advanced pitching metrics (FIP, ERA, WHIP, K/9, etc.)  
**Parameters:**
- `stats` (required): Object with pitching stats (ip, h, er, hr, bb, k, etc.)

**Example Usage:**
```
Calculate pitching metrics for: IP=75, H=65, ER=28, HR=7, BB=22, K=85
```

---

## API Key Management

### Where to Get Your API Key

Your API key was set during deployment with:
```bash
wrangler secret put BSI_API_KEY
```

If you need to retrieve it, you'll need to:
1. Contact the API administrator, or
2. Regenerate a new key with `wrangler secret put BSI_API_KEY`

**Note:** Cloudflare Workers secrets are write-only for security. You cannot view existing secrets, only update them.

### Rotating API Keys

To rotate your API key:

1. Generate a new key:
   ```bash
   openssl rand -hex 32
   ```

2. Update the secret:
   ```bash
   wrangler secret put BSI_API_KEY
   ```
   (Paste the new key when prompted)

3. Update Claude.ai connector:
   - Settings → Connectors → Edit "College Baseball Sabermetrics"
   - Update the `Authorization` header value with the new key
   - Save

4. Redeploy (optional, but recommended):
   ```bash
   wrangler deploy
   ```

---

## Advanced Configuration

### Custom Timeout Settings

If you experience timeout issues, some MCP clients allow custom timeout values:

```json
{
  "mcpServers": {
    "college-baseball-sabermetrics": {
      "url": "https://sabermetrics.blazesportsintel.com/mcp",
      "headers": {
        "Authorization": "Bearer YOUR_BSI_API_KEY"
      },
      "timeout": 30000
    }
  }
}
```

Timeout is in milliseconds (30000 = 30 seconds).

### Multiple Environments

You can configure separate servers for development and production:

```json
{
  "mcpServers": {
    "college-baseball-sabermetrics-prod": {
      "url": "https://sabermetrics.blazesportsintel.com/mcp",
      "headers": {
        "Authorization": "Bearer PRODUCTION_API_KEY"
      }
    },
    "college-baseball-sabermetrics-dev": {
      "url": "https://dev.sabermetrics.blazesportsintel.com/mcp",
      "headers": {
        "Authorization": "Bearer DEVELOPMENT_API_KEY"
      }
    }
  }
}
```

---

## Production URLs Reference

**MCP Endpoint:**  
`https://sabermetrics.blazesportsintel.com/mcp`

**Health Check (no auth required):**  
`https://sabermetrics.blazesportsintel.com/health`

**Web UI:**  
`https://sabermetrics.blazesportsintel.com/`

---

## Support & Resources

- **MCP Specification:** https://modelcontextprotocol.io/
- **Claude MCP Documentation:** https://support.anthropic.com/en/collections/7979775-model-context-protocol
- **ESPN API Reference:** https://gist.github.com/nntrn/ee26cb2a0716de0947a0a4e9a157bc1c
- **Wrangler CLI Docs:** https://developers.cloudflare.com/workers/wrangler/

---

## Quick Connection Summary

1. **Enable MCP** in Claude.ai Settings → Feature Preview
2. **Add Server** with URL: `https://sabermetrics.blazesportsintel.com/mcp`
3. **Set Header**: `Authorization: Bearer YOUR_BSI_API_KEY`
4. **Test** by asking Claude: "What college baseball tools do you have?"

✅ **You're connected!** Start asking Claude about college baseball data, rankings, and sabermetrics.

🔥 **Powered by Blaze Sports Intel**  
*Courage · Grit · Leadership*
