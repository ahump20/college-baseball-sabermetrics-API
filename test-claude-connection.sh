#!/bin/bash

# 🔥 Quick Fix for Claude.ai MCP Connection Error
# This script fixes the "error connecting to the MCP server" issue

set -e

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🔥 Fixing Claude.ai MCP Connection Issue"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Load BSI_API_KEY from .env
if [ -f .env ]; then
    source .env
    echo "✅ Loaded credentials from .env"
else
    echo "❌ Error: .env file not found"
    exit 1
fi

if [ -z "$BSI_API_KEY" ]; then
    echo "❌ Error: BSI_API_KEY not set in .env"
    exit 1
fi

echo "📋 Your BSI API Key: $BSI_API_KEY"
echo ""

# Test health endpoint
echo "Testing MCP server health endpoint..."
HEALTH_RESPONSE=$(curl -s https://sabermetrics.blazesportsintel.com/health || echo "FAILED")

if [[ "$HEALTH_RESPONSE" == "FAILED" ]] || [[ ! "$HEALTH_RESPONSE" =~ "ok" ]]; then
    echo "❌ Health check failed"
    echo "   Response: $HEALTH_RESPONSE"
    echo ""
    echo "The server may not be deployed yet. Deploy with:"
    echo "   bash deploy-mcp.sh"
    exit 1
else
    echo "✅ Health check passed"
    echo "   Response: $HEALTH_RESPONSE"
fi
echo ""

# Test MCP endpoint with authentication
echo "Testing MCP endpoint with authentication..."
MCP_RESPONSE=$(curl -s -X POST https://sabermetrics.blazesportsintel.com/mcp \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer $BSI_API_KEY" \
    -d '{"jsonrpc":"2.0","id":1,"method":"initialize","params":{}}' || echo "FAILED")

if [[ "$MCP_RESPONSE" == "FAILED" ]]; then
    echo "❌ MCP endpoint test failed - connection error"
    exit 1
elif [[ "$MCP_RESPONSE" =~ "Unauthorized" ]]; then
    echo "❌ Authentication failed"
    echo "   Response: $MCP_RESPONSE"
    echo ""
    echo "The BSI_API_KEY secret may not be set in Cloudflare. Set it with:"
    echo "   echo \"$BSI_API_KEY\" | wrangler secret put BSI_API_KEY"
    exit 1
elif [[ "$MCP_RESPONSE" =~ "protocolVersion" ]]; then
    echo "✅ MCP endpoint authenticated successfully!"
    echo "   Response: $MCP_RESPONSE"
else
    echo "⚠️  Unexpected response:"
    echo "   $MCP_RESPONSE"
fi
echo ""

# Show Claude.ai connection details
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📋 Claude.ai Connection Details"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "Server URL:"
echo "  https://sabermetrics.blazesportsintel.com/mcp"
echo ""
echo "Custom Header:"
echo "  Key:   Authorization"
echo "  Value: Bearer $BSI_API_KEY"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🔧 Setup in Claude.ai:"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "1. Go to Claude.ai Settings → Connectors (or Feature Preview)"
echo "2. Click 'Add Server' or '+ New Connector'"
echo "3. Fill in:"
echo "   • Server Name: College Baseball Sabermetrics API"
echo "   • Server URL: https://sabermetrics.blazesportsintel.com/mcp"
echo "   • Add Custom Header:"
echo "     - Header Key: Authorization"
echo "     - Header Value: Bearer $BSI_API_KEY"
echo "4. Save and test the connection"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Create a test command for curl
echo "💡 Test command (copy and paste to test manually):"
echo ""
echo "curl -X POST https://sabermetrics.blazesportsintel.com/mcp \\"
echo "  -H 'Content-Type: application/json' \\"
echo "  -H 'Authorization: Bearer $BSI_API_KEY' \\"
echo "  -d '{\"jsonrpc\":\"2.0\",\"id\":1,\"method\":\"tools/list\",\"params\":{}}'"
echo ""
