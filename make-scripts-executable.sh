#!/usr/bin/env bash

# Make security scripts executable
chmod +x install-hooks.sh
chmod +x .githooks/pre-commit

echo "✅ Security scripts are now executable"
echo ""
echo "To install hooks, run:"
echo "  ./install-hooks.sh"
echo ""
echo "Or use npm:"
echo "  npm run security:install-hooks"
