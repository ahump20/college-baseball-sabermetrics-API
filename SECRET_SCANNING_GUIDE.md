# 🔒 Secret Scanning & Security Guide

**Blaze Sports Intel - Repository Security Configuration**

This repository is now protected against accidental secret commits through multiple layers of defense.

---

## 🛡️ Protection Layers

### 1. **Pre-Commit Hooks** ✅
Automatic scanning before every commit to catch secrets before they enter git history.

**What it detects:**
- API keys (OpenAI, Anthropic, Stripe, Cloudflare, etc.)
- Environment files (`.env`, `.env.local`, etc.)
- Private keys and certificates
- JWT tokens
- Database connection strings
- Hardcoded credentials in code
- URLs with embedded authentication

### 2. **GitHub Actions CI/CD** ✅
Continuous scanning on every push and pull request.

**Tools used:**
- **Gitleaks** - Industry-standard secret detection
- **TruffleHog** - Verified secret scanning
- **Custom patterns** - BSI-specific credential detection

### 3. **GitHub Secret Scanning** 🔄 (Requires manual activation)
Native GitHub protection for known secret patterns.

### 4. **GitHub Push Protection** 🔄 (Requires manual activation)
Blocks pushes containing detected secrets in real-time.

---

## 🚀 Quick Start

### Install Pre-Commit Hooks

Run this once after cloning the repository:

```bash
chmod +x install-hooks.sh
./install-hooks.sh
```

This installs the local git hook that scans for secrets before each commit.

---

## 📋 Setup Checklist

### ✅ Local Development Setup

- [ ] Run `./install-hooks.sh` to install pre-commit hooks
- [ ] Copy `.env.example` to `.env` and fill in your local secrets
- [ ] **Never commit `.env`** files (already in `.gitignore`)
- [ ] Verify `.gitignore` includes all secret patterns

### ✅ GitHub Repository Settings

Navigate to: **Settings → Security → Code security and analysis**

- [ ] Enable **Secret scanning**
- [ ] Enable **Push protection**
- [ ] Enable **Dependabot alerts**
- [ ] Enable **Dependabot security updates**

### ✅ Cloudflare Workers Secret Management

For production secrets, use Cloudflare's secure environment:

```bash
# Set secrets for Workers (never commit these!)
wrangler secret put HIGHLIGHTLY_API_KEY
wrangler secret put OPENAI_API_KEY
wrangler secret put STRIPE_SECRET_KEY
wrangler secret put CLOUDFLARE_API_TOKEN
```

Secrets are stored encrypted in Cloudflare and injected at runtime.

---

## 🔐 How to Store Secrets Properly

### ❌ NEVER DO THIS:

```typescript
// DON'T: Hardcoded in source code
const apiKey = "sk-abc123def456";

// DON'T: Committed .env file
git add .env
git commit -m "Added config"

// DON'T: Secrets in client-side code
export const STRIPE_KEY = "pk_live_...";
```

### ✅ ALWAYS DO THIS:

```typescript
// ✅ Use environment variables
const apiKey = process.env.OPENAI_API_KEY;

// ✅ For Cloudflare Workers
export default {
  async fetch(req: Request, env: Env) {
    const key = env.HIGHLIGHTLY_API_KEY;
  }
};

// ✅ For React apps (server-side only!)
// Only use VITE_ prefix for PUBLIC values, never secrets
```

**Environment variable hierarchy:**
1. **Development**: `.env` file (gitignored)
2. **Production**: Cloudflare Worker secrets (`wrangler secret put`)
3. **CI/CD**: GitHub repository secrets

---

## 🚨 What to Do If Secrets Are Committed

### Immediate Actions:

1. **Revoke the compromised credentials immediately**
   - Generate new API keys
   - Rotate all affected secrets
   - Do NOT wait to "fix the code first"

2. **Remove from git history:**

```bash
# Use BFG Repo-Cleaner (recommended)
brew install bfg  # or download from https://rtyley.github.io/bfg-repo-cleaner/
bfg --replace-text secrets.txt  # Create secrets.txt with patterns to remove
git reflog expire --expire=now --all
git gc --prune=now --aggressive

# OR use git-filter-repo
pip install git-filter-repo
git filter-repo --path .env --invert-paths
```

3. **Force push the cleaned history:**

```bash
git push origin --force --all
git push origin --force --tags
```

4. **Notify the team** that they need to re-clone the repository

5. **Verify the secret is gone:**

```bash
git log -S "your-secret-value" --all
```

---

## 🧪 Testing the Protection

### Test Pre-Commit Hook

1. Create a test file with a fake secret:

```bash
echo "STRIPE_KEY=sk_test_abc123def456ghi789jkl" > test-secret.txt
git add test-secret.txt
git commit -m "test secret detection"
```

**Expected result:** ❌ Commit blocked with error message

2. Remove the test file:

```bash
git reset HEAD test-secret.txt
rm test-secret.txt
```

### Test GitHub Actions

1. Create a branch with a secret pattern in code
2. Open a pull request
3. Check the **Actions** tab for scan results

---

## 📁 Safe File Patterns

These patterns are **safe to commit**:

- `.env.example` - Template with empty values
- `*.md` - Documentation (be careful with examples!)
- `*.sample` - Sample configuration files
- `test/fixtures/*.json` - Test data with fake credentials

These are **automatically blocked**:

- `.env`
- `.env.local`
- `.env.production`
- `*.secret`
- `*.pem`
- `*.key`
- Files in `secrets/` or `credentials/` directories

---

## 🔧 Configuration Files

### `.gitignore` - Secret Patterns

```gitignore
# Environment files
.env
.env.*
!.env.example

# Secrets and certificates
*.secret
*.pem
*.key
secrets/
credentials/
```

### `.githooks/pre-commit` - Detection Script

The pre-commit hook scans for 15+ secret patterns including:
- API keys (generic patterns)
- Provider-specific keys (Stripe, OpenAI, GitHub, etc.)
- Private keys and certificates
- Database connection strings
- JWT tokens
- Environment variable assignments

### `.github/workflows/secret-scanning.yml` - CI Pipeline

Runs on every push and PR with:
- Gitleaks scanning
- TruffleHog verified detection
- Custom pattern matching
- Hardcoded credential checks

---

## 🎯 Best Practices

### Development Workflow

1. **Use `.env` for local development**
   ```bash
   cp .env.example .env
   # Edit .env with your local secrets
   ```

2. **Reference secrets via environment variables**
   ```typescript
   const apiKey = process.env.API_KEY;
   if (!apiKey) throw new Error("API_KEY not configured");
   ```

3. **Use TypeScript for type safety**
   ```typescript
   interface Env {
     OPENAI_API_KEY: string;
     STRIPE_SECRET_KEY: string;
   }
   ```

4. **Validate environment on startup**
   ```typescript
   const requiredEnv = ["OPENAI_API_KEY", "DATABASE_URL"];
   const missing = requiredEnv.filter(key => !process.env[key]);
   if (missing.length) {
     throw new Error(`Missing required env vars: ${missing.join(", ")}`);
   }
   ```

### Production Deployment

1. **Use Cloudflare Worker secrets**
   ```bash
   wrangler secret put API_KEY
   # Paste value when prompted
   ```

2. **Never log secrets**
   ```typescript
   // ❌ DON'T
   console.log("API Key:", env.API_KEY);
   
   // ✅ DO
   console.log("API Key configured:", !!env.API_KEY);
   ```

3. **Rotate secrets regularly**
   - Set calendar reminders to rotate keys every 90 days
   - Rotate immediately if team members leave
   - Rotate after any suspected compromise

---

## 📊 Secret Scanning Dashboard

### Check Scan Results

**GitHub Actions:**
- Go to: Repository → Actions → Secret Scanning workflow
- View latest run for detailed results

**Local Pre-Commit:**
- Automatic on every `git commit`
- Manually run: `bash .githooks/pre-commit`

**GitHub Secret Scanning (once enabled):**
- Go to: Repository → Security → Secret scanning alerts
- Review any detected secrets

---

## 🆘 Emergency Procedures

### If You Accidentally Commit a Secret

**DO THIS IMMEDIATELY:**

1. **Revoke the secret** (within minutes, not hours)
2. **DO NOT** push to remote if still local:
   ```bash
   git reset --soft HEAD~1  # Undo commit, keep changes
   # Remove the secret from files
   git add -A
   git commit -m "Fixed configuration"
   ```

3. **If already pushed:**
   - Revoke the key FIRST (before fixing code)
   - Follow "Remove from git history" steps above
   - Force push cleaned history
   - Rotate to new credentials

### If Someone Else Commits a Secret

1. Alert them immediately
2. Have them revoke the credential
3. Help them clean git history
4. Review this guide with the team

---

## 🔗 Additional Resources

- [GitHub Secret Scanning Docs](https://docs.github.com/en/code-security/secret-scanning)
- [Gitleaks Documentation](https://github.com/gitleaks/gitleaks)
- [TruffleHog by Truffle Security](https://github.com/trufflesecurity/trufflehog)
- [Cloudflare Workers Secrets](https://developers.cloudflare.com/workers/configuration/secrets/)
- [OWASP Secrets Management Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Secrets_Management_Cheat_Sheet.html)

---

## 📝 Maintenance

### Monthly Tasks
- [ ] Review GitHub secret scanning alerts
- [ ] Audit `.env.example` for new secrets
- [ ] Test pre-commit hook with sample secrets
- [ ] Review team access to production secrets

### Quarterly Tasks
- [ ] Rotate production API keys
- [ ] Audit Cloudflare Worker secrets
- [ ] Review secret scanning patterns for new providers
- [ ] Update this documentation

---

## ✅ Verification Checklist

After setup, verify:

- [ ] Pre-commit hook blocks commits with fake API keys
- [ ] `.env` file is gitignored (test with `git check-ignore .env`)
- [ ] GitHub Actions workflow runs on push
- [ ] GitHub secret scanning is enabled in repo settings
- [ ] GitHub push protection is enabled
- [ ] Team members have installed hooks (`./install-hooks.sh`)
- [ ] `.env.example` exists with all required variables (values empty)
- [ ] No `.env` files in git history (`git log --all --full-history --source -- .env`)

---

**Last Updated:** 2026-03-12  
**Maintained By:** Blaze Sports Intel Security Team

For questions or issues, refer to [SECURITY.md](./SECURITY.md) or contact the repository owner.
