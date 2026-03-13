# 🔐 GitHub Secret Scanning & Push Protection Setup

## Overview

This guide walks you through enabling GitHub's native secret scanning and push protection features for maximum repository security.

---

## ✅ Step 1: Enable Secret Scanning

1. Go to your repository on GitHub
2. Click **Settings** tab
3. Navigate to **Security** → **Code security and analysis**
4. Find **Secret scanning** section
5. Click **Enable** next to:
   - ✅ **Secret scanning**
   - ✅ **Push protection** (highly recommended!)

---

## 🛡️ Step 2: Enable Push Protection

**What it does:** Blocks pushes that contain detected secrets in real-time.

1. In the same **Code security and analysis** page
2. Find **Push protection** under Secret scanning
3. Toggle it to **Enabled**

**⚠️ Important:** 
- Push protection will block `git push` if secrets are detected
- You'll get an error message with instructions to remove the secret
- You can bypass with `git push --force` but this is **not recommended**

---

## 🔔 Step 3: Configure Notifications

1. Go to **Settings** → **Notifications**
2. Under **Security alerts**:
   - ✅ Enable **Email** notifications for secret scanning
   - ✅ Enable **Web** notifications
3. Click **Save notification preferences**

---

## 👥 Step 4: Set Up for Organization (if applicable)

If this is part of a GitHub Organization:

1. Go to **Organization Settings**
2. Navigate to **Code security and analysis**
3. Enable **Secret scanning** and **Push protection** for:
   - ✅ All existing repositories
   - ✅ All new repositories (automatically)

---

## 🧪 Step 5: Test the Protection

### Test Secret Scanning Detection:

1. Create a test branch:
   ```bash
   git checkout -b test-secret-detection
   ```

2. Add a fake secret to a file:
   ```bash
   echo "GITHUB_TOKEN=ghp_test1234567890abcdefghijklmnopqrstuv" > test.txt
   git add test.txt
   git commit -m "test: secret detection"
   ```

3. Try to push:
   ```bash
   git push origin test-secret-detection
   ```

**Expected result:**
- ❌ Push should be **blocked** with an error message
- You'll see which secret pattern was detected
- Instructions on how to remove it

4. Clean up:
   ```bash
   git reset --hard HEAD~1
   git checkout main
   git branch -D test-secret-detection
   ```

---

## 📊 Step 6: Review Detected Secrets

If secrets are found (in history or new pushes):

1. Go to **Security** tab
2. Click **Secret scanning** in the left sidebar
3. Review all detected secrets
4. For each secret:
   - **State:** Open, Resolved, or False positive
   - **Location:** Exact file and line number
   - **Type:** What kind of secret (GitHub token, API key, etc.)

### How to Resolve:

**For false positives:**
- Mark as "False positive" in the UI
- Optionally add to allowlist in `.gitleaks.toml`

**For real secrets:**
1. **Revoke the secret immediately** (new key from the provider)
2. Remove from code (see guide below)
3. Remove from git history (if needed)
4. Mark as "Resolved" in GitHub UI

---

## 🚨 How to Remove Secrets from Git History

### Option 1: BFG Repo Cleaner (Recommended)

```bash
# Install BFG
brew install bfg  # macOS
# OR download from: https://rtyley.github.io/bfg-repo-cleaner/

# Create a file with secrets to remove
cat > secrets.txt << EOF
ghp_test1234567890abcdefghijklmnopqrstuv
sk_live_abc123def456ghi789
EOF

# Clean history
bfg --replace-text secrets.txt --no-blob-protection .git

# Cleanup
git reflog expire --expire=now --all
git gc --prune=now --aggressive

# Force push
git push origin --force --all
git push origin --force --tags
```

### Option 2: git-filter-repo

```bash
# Install
pip install git-filter-repo

# Remove specific file from history
git filter-repo --path .env --invert-paths

# Force push
git push origin --force --all
```

---

## 📋 Custom Secret Patterns

GitHub scans for 200+ partner patterns by default. To add custom patterns:

1. Go to **Settings** → **Code security and analysis**
2. Scroll to **Custom patterns** under Secret scanning
3. Click **New pattern**
4. Fill in:
   - **Name:** e.g., "Blaze API Key"
   - **Secret format:** Regex pattern
   - **Test string:** Example of the pattern

**Example custom patterns:**

```regex
# Blaze API Key
blaze_(live|test|dev)_[A-Za-z0-9]{32,}

# BSI Admin Key
bsi_admin_[A-Za-z0-9]{32,}

# Custom UUID-based API key
[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}
```

---

## 🔗 Bypass Protection (Emergency Only!)

**⚠️ Only use in emergencies - always prefer removing the secret first!**

### If you absolutely must push with a detected secret:

```bash
# This bypasses push protection (NOT RECOMMENDED)
git push --no-verify
```

**Better approach:**
1. Revert the commit with the secret
2. Remove the secret
3. Push the cleaned version
4. Then revoke the old secret

---

## 📈 Monitoring & Maintenance

### Weekly:
- [ ] Check **Security** tab for new secret scanning alerts
- [ ] Review any false positives
- [ ] Verify push protection is still enabled

### Monthly:
- [ ] Audit resolved secrets to ensure they were revoked
- [ ] Review custom pattern effectiveness
- [ ] Update `.gitleaks.toml` with new patterns if needed

### After Team Changes:
- [ ] When someone leaves: audit their commits for secrets
- [ ] Rotate any secrets they had access to
- [ ] Review access to secret scanning alerts

---

## 🆘 Common Issues

### "Push protection is blocking my push but I need to deploy!"

**Solution:**
```bash
# 1. Identify the secret
git log -1 -p  # See what's in the commit

# 2. Remove it
git reset --soft HEAD~1
# Edit files to remove secret
git add -A
git commit -m "Fixed configuration"

# 3. Push
git push origin main
```

### "Secret scanning found a false positive"

**Solution:**
1. Go to Security → Secret scanning
2. Click on the alert
3. Click **Close as** → **False positive**
4. Add to allowlist if it's a pattern that will recur

### "I need to disable protection temporarily"

**Don't!** Instead:
- Fix the issue properly
- Remove secrets from code
- Use environment variables

---

## 📚 Additional Resources

- [GitHub Secret Scanning Docs](https://docs.github.com/en/code-security/secret-scanning/about-secret-scanning)
- [Push Protection Guide](https://docs.github.com/en/code-security/secret-scanning/protecting-pushes-with-secret-scanning)
- [Custom Patterns](https://docs.github.com/en/code-security/secret-scanning/defining-custom-patterns-for-secret-scanning)
- [Partner Patterns List](https://docs.github.com/en/code-security/secret-scanning/secret-scanning-patterns)

---

## ✅ Setup Verification Checklist

After completing all steps:

- [ ] Secret scanning is enabled (green checkmark in Settings)
- [ ] Push protection is enabled
- [ ] Email notifications are configured
- [ ] Test push with fake secret was blocked
- [ ] No active secret scanning alerts (or all resolved)
- [ ] Team members are aware of the protection
- [ ] Custom patterns added for Blaze-specific secrets
- [ ] `.gitleaks.toml` is committed to repository
- [ ] Pre-commit hooks installed (`npm run security:install-hooks`)

---

**Last Updated:** 2026-03-12  
**Next Review:** 2026-04-12

For questions, see [SECRET_SCANNING_GUIDE.md](./SECRET_SCANNING_GUIDE.md)
