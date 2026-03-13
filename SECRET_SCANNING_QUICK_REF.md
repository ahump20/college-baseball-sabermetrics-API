# 🔒 Secret Protection Quick Reference

## ⚡ Quick Commands

```bash
# Install pre-commit hooks (run once)
./install-hooks.sh

# Test secret detection manually
bash .githooks/pre-commit

# Scan entire repository for secrets
git grep -iE "(api[_-]?key|secret|password|token).*=.*[A-Za-z0-9]{20,}"

# Check if file is gitignored
git check-ignore .env

# View git history for a secret pattern
git log -S "your-secret-value" --all

# Set Cloudflare Worker secret
wrangler secret put SECRET_NAME
```

---

## 🚨 Emergency: Secret Was Committed

### If Not Pushed Yet:
```bash
# Undo last commit, keep changes
git reset --soft HEAD~1

# Remove secret from files
# ... edit files ...

# Commit again
git add -A
git commit -m "Fixed configuration"
```

### If Already Pushed:
```bash
# 1. REVOKE THE SECRET FIRST!

# 2. Remove from history
bfg --replace-text secrets.txt
git reflog expire --expire=now --all
git gc --prune=now --aggressive

# 3. Force push
git push origin --force --all
```

---

## ✅ Safe Patterns

### ✅ DO:
```typescript
// Environment variables
const key = process.env.OPENAI_API_KEY;

// Cloudflare Worker
const key = env.HIGHLIGHTLY_API_KEY;

// Template file
// .env.example
OPENAI_API_KEY=
```

### ❌ DON'T:
```typescript
// Hardcoded
const key = "sk-abc123...";

// Committed .env
git add .env

// Client-side secret
export const API_KEY = "...";
```

---

## 📋 Enable GitHub Protection

1. Go to: **Settings → Security**
2. Enable:
   - ✅ Secret scanning
   - ✅ Push protection
   - ✅ Dependabot alerts

---

## 🔧 Common Issues

**Hook not running?**
```bash
chmod +x .githooks/pre-commit
git config core.hooksPath .githooks
```

**Want to bypass (emergency only)?**
```bash
git commit --no-verify
```

**Check if secret is in history:**
```bash
git log -S "your-secret" --all
```

---

## 📞 Need Help?

- Read: [SECRET_SCANNING_GUIDE.md](./SECRET_SCANNING_GUIDE.md)
- Security issues: See [SECURITY.md](./SECURITY.md)
