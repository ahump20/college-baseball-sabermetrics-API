#!/bin/bash

# 🔥 Blaze Sports Intel - MCP Server Deployment Script
# This script deploys the College Baseball Sabermetrics MCP server to Cloudflare Workers

set -e

WRANGLER_CMD="npx wrangler"

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🔥 BLAZE SPORTS INTEL - MCP Server Deployment"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Check if wrangler is available locally
if ! $WRANGLER_CMD --version &> /dev/null; then
    echo "❌ Error: Wrangler CLI not found"
    echo "Install project dependencies with: npm install"
    exit 1
fi

echo "✅ Wrangler CLI found"
echo ""

# Check if logged in to Cloudflare
echo "Checking Cloudflare authentication..."
if ! $WRANGLER_CMD whoami &> /dev/null; then
    echo "⚠️  Not logged in to Cloudflare"
    echo "Running: npx wrangler login"
    $WRANGLER_CMD login
else
    echo "✅ Authenticated with Cloudflare"
fi
echo ""

# Step 1: Create KV Namespaces
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📦 Step 1: Creating KV Namespaces"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Check if RATE_LIMIT_KV exists
echo "Creating RATE_LIMIT_KV namespace..."
RATE_LIMIT_OUTPUT=$($WRANGLER_CMD kv:namespace create RATE_LIMIT_KV 2>&1) || true
RATE_LIMIT_ID=$(echo "$RATE_LIMIT_OUTPUT" | grep -o 'id = "[^"]*"' | head -1 | sed 's/id = "\(.*\)"/\1/')

if [ -z "$RATE_LIMIT_ID" ]; then
    echo "⚠️  RATE_LIMIT_KV may already exist or creation failed"
    echo "   If it already exists, manually get the ID with: wrangler kv:namespace list"
    echo "   Output: $RATE_LIMIT_OUTPUT"
else
    echo "✅ RATE_LIMIT_KV created: $RATE_LIMIT_ID"
fi
echo ""

# Check if TEAM_STATS_KV exists
echo "Creating TEAM_STATS_KV namespace..."
TEAM_STATS_OUTPUT=$($WRANGLER_CMD kv:namespace create TEAM_STATS_KV 2>&1) || true
TEAM_STATS_ID=$(echo "$TEAM_STATS_OUTPUT" | grep -o 'id = "[^"]*"' | head -1 | sed 's/id = "\(.*\)"/\1/')

if [ -z "$TEAM_STATS_ID" ]; then
    echo "⚠️  TEAM_STATS_KV may already exist or creation failed"
    echo "   If it already exists, manually get the ID with: wrangler kv:namespace list"
    echo "   Output: $TEAM_STATS_OUTPUT"
else
    echo "✅ TEAM_STATS_KV created: $TEAM_STATS_ID"
fi
echo ""

# Step 2: Update wrangler.toml with KV namespace IDs
if [ -n "$RATE_LIMIT_ID" ] || [ -n "$TEAM_STATS_ID" ]; then
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo "📝 Step 2: Updating wrangler.toml with KV namespace IDs"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo ""
    
    if [ -n "$RATE_LIMIT_ID" ]; then
        echo "⚠️  Add this to wrangler.toml (under the commented KV section):"
        echo ""
        echo "[[kv_namespaces]]"
        echo "binding = \"RATE_LIMIT_KV\""
        echo "id = \"$RATE_LIMIT_ID\""
        echo ""
    fi
    
    if [ -n "$TEAM_STATS_ID" ]; then
        echo "[[kv_namespaces]]"
        echo "binding = \"TEAM_STATS_KV\""
        echo "id = \"$TEAM_STATS_ID\""
        echo ""
    fi
    
    echo "Manual edit required: Update wrangler.toml with the IDs above"
    read -p "Press Enter after updating wrangler.toml to continue..."
fi

# Step 3: Set BSI_API_KEY secret
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🔐 Step 3: Setting BSI_API_KEY secret"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Check if .env file exists and load BSI_API_KEY
if [ -f .env ]; then
    source .env
    if [ -n "$BSI_API_KEY" ]; then
        echo "Found BSI_API_KEY in .env file"
        echo "Setting secret in Cloudflare Workers..."
        echo "$BSI_API_KEY" | $WRANGLER_CMD secret put BSI_API_KEY
        echo "✅ BSI_API_KEY secret set"
    else
        echo "⚠️  BSI_API_KEY not found in .env"
        echo "You'll need to set it manually with: wrangler secret put BSI_API_KEY"
        read -p "Set BSI_API_KEY now? (y/n): " -n 1 -r
        echo
        if [[ $REPLY =~ ^[Yy]$ ]]; then
            $WRANGLER_CMD secret put BSI_API_KEY
            echo "✅ BSI_API_KEY secret set"
        else
            echo "⚠️  Skipping BSI_API_KEY setup - you'll need to set it manually later"
        fi
    fi
else
    echo "⚠️  .env file not found"
    echo "Setting BSI_API_KEY interactively..."
    $WRANGLER_CMD secret put BSI_API_KEY
    echo "✅ BSI_API_KEY secret set"
fi
echo ""

# Step 4: Deploy to Cloudflare Workers
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🚀 Step 4: Deploying to Cloudflare Workers"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

$WRANGLER_CMD deploy

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ DEPLOYMENT COMPLETE!"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "🔗 Production URL: https://sabermetrics.blazesportsintel.com"
echo "🔗 MCP Endpoint: https://sabermetrics.blazesportsintel.com/mcp"
echo ""
echo "📋 Next Steps:"
echo ""
echo "1. Configure DNS (if not already done):"
echo "   • Go to Cloudflare DNS for blazesportsintel.com"
echo "   • Add CNAME record:"
echo "     - Type: CNAME"
echo "     - Name: sabermetrics"
echo "     - Target: college-baseball-mcp.ahump20.workers.dev"
echo "     - Proxy: ON (orange cloud)"
echo ""
echo "2. Test the deployment:"
echo "   curl https://sabermetrics.blazesportsintel.com/health"
echo ""
echo "3. Connect to Claude.ai:"
echo "   • Open Claude.ai Settings → Connectors"
echo "   • Add new connector:"
echo "     - URL: https://sabermetrics.blazesportsintel.com/mcp"
echo "     - Header: Authorization: Bearer YOUR_BSI_API_KEY"
echo ""
echo "📖 Full documentation: See CLAUDE_MCP_SETUP.md"
echo ""
echo "🔥 COURAGE · GRIT · LEADERSHIP"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
