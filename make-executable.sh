#!/bin/bash

# Make deployment scripts executable
chmod +x deploy-mcp.sh
chmod +x test-claude-connection.sh

echo "✅ Deployment scripts are now executable"
echo ""
echo "Available commands:"
echo "  ./deploy-mcp.sh              - Full automated deployment"
echo "  ./test-claude-connection.sh  - Test Claude.ai connection"
echo ""
