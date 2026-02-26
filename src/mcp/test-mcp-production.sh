#!/bin/bash

# MCP Server Production Testing Script
# This script tests all MCP endpoints on the deployed Cloudflare Worker

set -e

echo "🚀 College Baseball Sabermetrics MCP Server - Production Testing"
echo "=================================================================="
echo ""

# Prompt for the deployed URL
read -p "Enter your deployed Worker URL (without /mcp): " BASE_URL
MCP_URL="$BASE_URL/mcp"

echo ""
echo "Testing: $MCP_URL"
echo ""

# Prompt for API key (if authentication is enabled)
read -p "Do you have authentication enabled? (y/n): " HAS_AUTH

AUTH_HEADER=""
if [ "$HAS_AUTH" = "y" ]; then
  read -sp "Enter your API key: " API_KEY
  echo ""
  AUTH_HEADER="-H \"X-API-Key: $API_KEY\""
fi

echo ""
echo "1️⃣ Testing Health Endpoint..."
echo "-------------------------------"
curl -s $BASE_URL/health | jq '.'
echo ""

echo "2️⃣ Testing MCP Initialize..."
echo "-------------------------------"
if [ -n "$AUTH_HEADER" ]; then
  curl -s -X POST $MCP_URL \
    -H "Content-Type: application/json" \
    -H "X-API-Key: $API_KEY" \
    -d '{"jsonrpc":"2.0","id":1,"method":"initialize","params":{}}' \
    | jq '.'
else
  curl -s -X POST $MCP_URL \
    -H "Content-Type: application/json" \
    -d '{"jsonrpc":"2.0","id":1,"method":"initialize","params":{}}' \
    | jq '.'
fi
echo ""

echo "3️⃣ Testing Authentication (if enabled)..."
echo "-------------------------------"
if [ "$HAS_AUTH" = "y" ]; then
  echo "Testing WITHOUT API key (should fail):"
  curl -s -X POST $MCP_URL \
    -H "Content-Type: application/json" \
    -d '{"jsonrpc":"2.0","id":1,"method":"initialize","params":{}}' \
    | jq '.'
  echo ""
  echo "Testing WITH API key (should succeed):"
  curl -s -X POST $MCP_URL \
    -H "Content-Type: application/json" \
    -H "X-API-Key: $API_KEY" \
    -d '{"jsonrpc":"2.0","id":1,"method":"initialize","params":{}}' \
    | jq '.result.serverInfo'
else
  echo "Authentication not enabled, skipping..."
fi
echo ""

echo "4️⃣ Testing Rate Limit Headers..."
echo "-------------------------------"
if [ -n "$AUTH_HEADER" ]; then
  curl -s -i -X POST $MCP_URL \
    -H "Content-Type: application/json" \
    -H "X-API-Key: $API_KEY" \
    -d '{"jsonrpc":"2.0","id":2,"method":"tools/list","params":{}}' \
    | grep -E "(X-RateLimit-|HTTP/)"
else
  curl -s -i -X POST $MCP_URL \
    -H "Content-Type: application/json" \
    -d '{"jsonrpc":"2.0","id":2,"method":"tools/list","params":{}}' \
    | grep -E "(X-RateLimit-|HTTP/)"
fi
echo ""

echo "5️⃣ Testing Live Data (Scoreboard)..."
echo "-------------------------------"
if [ -n "$AUTH_HEADER" ]; then
  curl -s -X POST $MCP_URL \
    -H "Content-Type: application/json" \
    -H "X-API-Key: $API_KEY" \
    -d '{
      "jsonrpc":"2.0",
      "id":3,
      "method":"tools/call",
      "params":{
        "name":"get_scoreboard",
        "arguments":{"limit":3}
      }
    }' | jq '.result.content[0].text | fromjson | {events: (.events | length), date: .events[0].date}'
else
  curl -s -X POST $MCP_URL \
    -H "Content-Type: application/json" \
    -d '{
      "jsonrpc":"2.0",
      "id":3,
      "method":"tools/call",
      "params":{
        "name":"get_scoreboard",
        "arguments":{"limit":3}
      }
    }' | jq '.result.content[0].text | fromjson | {events: (.events | length)}'
fi
echo ""

echo "6️⃣ Testing Metrics Calculation..."
echo "-------------------------------"
if [ -n "$AUTH_HEADER" ]; then
  curl -s -X POST $MCP_URL \
    -H "Content-Type: application/json" \
    -H "X-API-Key: $API_KEY" \
    -d '{
      "jsonrpc":"2.0",
      "id":4,
      "method":"tools/call",
      "params":{
        "name":"calculate_batting_metrics",
        "arguments":{
          "stats":{
            "pa":250,"ab":220,"h":75,"_2b":18,"_3b":3,"hr":12,
            "bb":25,"hbp":5,"k":55,"sf":3
          }
        }
      }
    }' | jq '.result.content[0].text | fromjson'
else
  curl -s -X POST $MCP_URL \
    -H "Content-Type: application/json" \
    -d '{
      "jsonrpc":"2.0",
      "id":4,
      "method":"tools/call",
      "params":{
        "name":"calculate_batting_metrics",
        "arguments":{
          "stats":{
            "pa":250,"ab":220,"h":75,"_2b":18,"_3b":3,"hr":12,
            "bb":25,"hbp":5,"k":55,"sf":3
          }
        }
      }
    }' | jq '.result.content[0].text | fromjson'
fi
echo ""

echo "7️⃣ Testing CORS Headers..."
echo "-------------------------------"
curl -s -i -X OPTIONS $MCP_URL \
  -H "Origin: https://claude.ai" \
  -H "Access-Control-Request-Method: POST" \
  -H "Access-Control-Request-Headers: Content-Type" \
  | grep -E "(Access-Control-|HTTP/)"
echo ""

echo "✅ All production tests complete!"
echo ""
echo "Next steps:"
echo "  1. Copy your MCP URL: $MCP_URL"
echo "  2. Add it to Claude.ai: Settings → Connectors → Add custom connector"
if [ "$HAS_AUTH" = "y" ]; then
  echo "  3. In Claude.ai, click Advanced settings and add your API key"
fi
echo ""
echo "Test in Claude with:"
echo '  - "Get today'"'"'s college baseball scoreboard"'
echo '  - "Calculate batting stats for a player with PA:250, H:75, HR:12"'
echo ""
