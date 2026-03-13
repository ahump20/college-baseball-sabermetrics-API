#!/usr/bin/env bash

# Blaze Sports Intel - Git Hooks Installer
# Installs pre-commit hooks for secret detection
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

set -e

BLUE='\033[0;34m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}🔧 Installing Git Pre-Commit Hooks${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

# Check if we're in a git repository
if [ ! -d .git ]; then
    echo -e "${YELLOW}⚠ Warning: Not in a git repository root${NC}"
    echo "Please run this script from the repository root directory."
    exit 1
fi

# Create .git/hooks directory if it doesn't exist
mkdir -p .git/hooks

# Copy pre-commit hook
if [ -f .githooks/pre-commit ]; then
    cp .githooks/pre-commit .git/hooks/pre-commit
    chmod +x .git/hooks/pre-commit
    echo -e "${GREEN}✓ Installed pre-commit hook${NC}"
else
    echo -e "${YELLOW}⚠ Warning: .githooks/pre-commit not found${NC}"
    exit 1
fi

# Configure git to use our hooks directory
git config core.hooksPath .githooks
echo -e "${GREEN}✓ Configured git to use .githooks directory${NC}"

echo ""
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}✅ Git hooks installed successfully!${NC}"
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo "The pre-commit hook will now scan for secrets before each commit."
echo ""
echo -e "${YELLOW}To test the hook:${NC}"
echo "  1. Try staging a file with a fake API key"
echo "  2. Run: git commit -m 'test'"
echo "  3. The commit should be blocked"
echo ""
echo -e "${YELLOW}To bypass the hook (emergency only):${NC}"
echo "  git commit --no-verify"
echo ""
