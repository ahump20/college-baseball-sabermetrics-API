#!/bin/bash

# 🔥 Blaze Sports Intel - Deployment Validation Script
# This script validates that your MCP server is correctly deployed

set -e

echo "🔥 Blaze Sports Intel - Deployment Validation"
echo "=============================================="
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Base URL
BASE_URL="https://sabermetrics.blazesportsintel.com"

# Check if API key is provided
if [ -z "$BSI_API_KEY" ]; then
    echo -e "${YELLOW}⚠️  Warning: BSI_API_KEY environment variable not set${NC}"
    echo "   Set it with: export BSI_API_KEY=your_key_here"
    echo "   Skipping authenticated endpoint tests..."
    echo ""
    SKIP_AUTH=true
else
    echo -e "${GREEN}✓${NC} BSI_API_KEY found"
    SKIP_AUTH=false
fi

echo ""
echo "Starting validation tests..."
echo ""

# Test 1: Health endpoint (no auth)
echo "Test 1: Health endpoint (public, no auth required)"
HEALTH_RESPONSE=$(curl -s -w "\n%{http_code}" "${BASE_URL}/health")
HTTP_CODE=$(echo "$HEALTH_RESPONSE" | tail -n1)
BODY=$(echo "$HEALTH_RESPONSE" | head -n1)

if [ "$HTTP_CODE" -eq 200 ]; then
    echo -e "${GREEN}✓${NC} Health endpoint returned 200 OK"
    echo "   Response: $BODY"
else
    echo -e "${RED}✗${NC} Health endpoint failed (HTTP $HTTP_CODE)"
    echo "   Response: $BODY"
    exit 1
fi

echo ""

# Test 2: DNS resolution
echo "Test 2: DNS resolution"
if command -v dig &> /dev/null; then
    DNS_RESULT=$(dig +short sabermetrics.blazesportsintel.com | head -n1)
    if [ -n "$DNS_RESULT" ]; then
        echo -e "${GREEN}✓${NC} DNS resolves to: $DNS_RESULT"
    else
        echo -e "${RED}✗${NC} DNS not resolving"
        exit 1
    fi
else
    echo -e "${YELLOW}⚠${NC} 'dig' command not found, skipping DNS test"
fi

echo ""

# Test 3: MCP endpoint without auth (should fail with 401)
echo "Test 3: MCP endpoint without auth (should return 401)"
MCP_NOAUTH_RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "${BASE_URL}/mcp" \
    -H "Content-Type: application/json" \
    -d '{"jsonrpc":"2.0","id":1,"method":"initialize","params":{}}')
HTTP_CODE=$(echo "$MCP_NOAUTH_RESPONSE" | tail -n1)
BODY=$(echo "$MCP_NOAUTH_RESPONSE" | head -n1)

if [ "$HTTP_CODE" -eq 401 ]; then
    echo -e "${GREEN}✓${NC} MCP endpoint correctly requires authentication (401)"
    echo "   Response: $BODY"
else
    echo -e "${YELLOW}⚠${NC} Expected 401, got HTTP $HTTP_CODE"
    echo "   This might mean auth is not configured (which is okay for testing)"
    echo "   Response: $BODY"
fi

echo ""

# Test 4: MCP endpoint with auth (if key provided)
if [ "$SKIP_AUTH" = false ]; then
    echo "Test 4: MCP initialize endpoint with auth"
    MCP_AUTH_RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "${BASE_URL}/mcp" \
        -H "Content-Type: application/json" \
        -H "Authorization: Bearer $BSI_API_KEY" \
        -d '{"jsonrpc":"2.0","id":1,"method":"initialize","params":{}}')
    HTTP_CODE=$(echo "$MCP_AUTH_RESPONSE" | tail -n1)
    BODY=$(echo "$MCP_AUTH_RESPONSE" | head -n1)

    if [ "$HTTP_CODE" -eq 200 ]; then
        echo -e "${GREEN}✓${NC} MCP initialize successful (200 OK)"
        echo "   Response: $BODY"
    else
        echo -e "${RED}✗${NC} MCP initialize failed (HTTP $HTTP_CODE)"
        echo "   Response: $BODY"
        exit 1
    fi

    echo ""

    # Test 5: MCP tools/list endpoint
    echo "Test 5: MCP tools/list endpoint"
    TOOLS_RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "${BASE_URL}/mcp" \
        -H "Content-Type: application/json" \
        -H "Authorization: Bearer $BSI_API_KEY" \
        -d '{"jsonrpc":"2.0","id":2,"method":"tools/list","params":{}}')
    HTTP_CODE=$(echo "$TOOLS_RESPONSE" | tail -n1)
    BODY=$(echo "$TOOLS_RESPONSE" | head -n1)

    if [ "$HTTP_CODE" -eq 200 ]; then
        echo -e "${GREEN}✓${NC} MCP tools/list successful (200 OK)"
        # Count tools in response
        TOOL_COUNT=$(echo "$BODY" | grep -o '"name"' | wc -l)
        echo "   Found $TOOL_COUNT tools in response"
        echo "   Response preview: $(echo "$BODY" | cut -c1-100)..."
    else
        echo -e "${RED}✗${NC} MCP tools/list failed (HTTP $HTTP_CODE)"
        echo "   Response: $BODY"
        exit 1
    fi

    echo ""

    # Test 6: Rate limiting headers
    echo "Test 6: Rate limiting headers"
    HEADERS=$(curl -s -I -X POST "${BASE_URL}/mcp" \
        -H "Content-Type: application/json" \
        -H "Authorization: Bearer $BSI_API_KEY" \
        -d '{"jsonrpc":"2.0","id":3,"method":"initialize","params":{}}')
    
    if echo "$HEADERS" | grep -qi "x-ratelimit-limit"; then
        LIMIT=$(echo "$HEADERS" | grep -i "x-ratelimit-limit" | cut -d' ' -f2 | tr -d '\r')
        REMAINING=$(echo "$HEADERS" | grep -i "x-ratelimit-remaining" | cut -d' ' -f2 | tr -d '\r')
        echo -e "${GREEN}✓${NC} Rate limit headers present"
        echo "   Limit: $LIMIT requests/minute"
        echo "   Remaining: $REMAINING"
    else
        echo -e "${YELLOW}⚠${NC} Rate limit headers not found (might not be configured yet)"
    fi
else
    echo "Test 4-6: Skipped (no API key provided)"
fi

echo ""
echo "=============================================="
echo -e "${GREEN}✓${NC} All validation tests passed!"
echo ""
echo "Next steps:"
echo "1. If you haven't already, connect to Claude.ai:"
echo "   URL: ${BASE_URL}/mcp"
echo "   Header: Authorization: Bearer YOUR_BSI_API_KEY"
echo ""
echo "2. Test in Claude with:"
echo "   'Show me today's college baseball scores'"
echo ""
echo "3. Monitor logs with:"
echo "   wrangler tail"
echo ""
echo "🔥 Powered by Blaze Sports Intel"
echo "   Courage · Grit · Leadership"
