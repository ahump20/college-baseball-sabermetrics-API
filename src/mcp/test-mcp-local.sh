#!/bin/bash

# MCP Server Local Testing Script
# This script tests all MCP endpoints locally before deployment

set -e

echo "🧪 College Baseball Sabermetrics MCP Server - Local Testing"
echo "============================================================="
echo ""

# Check if wrangler dev is running
echo "⚠️  Make sure 'wrangler dev standalone-worker.ts' is running in another terminal"
echo "Press ENTER to continue..."
read

MCP_URL="http://localhost:8787"

echo ""
echo "1️⃣ Testing Health Endpoint..."
echo "-------------------------------"
curl -s $MCP_URL/health | jq '.'
echo ""

echo "2️⃣ Testing MCP Initialize..."
echo "-------------------------------"
curl -s -X POST $MCP_URL/mcp \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","id":1,"method":"initialize","params":{}}' \
  | jq '.'
echo ""

echo "3️⃣ Testing Tools List..."
echo "-------------------------------"
curl -s -X POST $MCP_URL/mcp \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","id":2,"method":"tools/list","params":{}}' \
  | jq '.result.tools[] | {name, description}'
echo ""

echo "4️⃣ Testing Get Scoreboard..."
echo "-------------------------------"
curl -s -X POST $MCP_URL/mcp \
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
echo ""

echo "5️⃣ Testing Calculate Batting Metrics..."
echo "-------------------------------"
curl -s -X POST $MCP_URL/mcp \
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
  }' | jq '.result.content[0].text | fromjson'
echo ""

echo "6️⃣ Testing Calculate Pitching Metrics..."
echo "-------------------------------"
curl -s -X POST $MCP_URL/mcp \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc":"2.0",
    "id":5,
    "method":"tools/call",
    "params":{
      "name":"calculate_pitching_metrics",
      "arguments":{
        "stats":{
          "ip":75.1,"h":68,"r":32,"er":28,"hr":8,
          "bb":22,"hbp":4,"k":92,"ibb":2
        }
      }
    }
  }' | jq '.result.content[0].text | fromjson'
echo ""

echo "7️⃣ Testing Invalid Method (Error Handling)..."
echo "-------------------------------"
curl -s -X POST $MCP_URL/mcp \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","id":6,"method":"invalid_method","params":{}}' \
  | jq '.'
echo ""

echo "8️⃣ Testing Invalid Tool Call (Error Handling)..."
echo "-------------------------------"
curl -s -X POST $MCP_URL/mcp \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc":"2.0",
    "id":7,
    "method":"tools/call",
    "params":{
      "name":"nonexistent_tool",
      "arguments":{}
    }
  }' | jq '.'
echo ""

echo "✅ All local tests complete!"
echo ""
echo "Next steps:"
echo "  1. If all tests passed, deploy with: wrangler deploy"
echo "  2. After deploying, run ./test-mcp-production.sh to test the live server"
echo ""
