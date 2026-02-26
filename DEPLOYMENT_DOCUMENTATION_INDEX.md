# 📑 Deployment Documentation Index

All documentation for deploying the College Baseball Sabermetrics MCP Server to production at `https://sabermetrics.blazesportsintel.com`.

---

## 🚀 Start Here

### For Immediate Deployment
**[`QUICK_START.md`](QUICK_START.md)**  
10-minute quick start guide with exact commands to run.  
**Use this if:** You want to deploy NOW.

---

## 📚 Complete Guides

### Primary Deployment Guide
**[`PRODUCTION_DEPLOYMENT_STEPS.md`](PRODUCTION_DEPLOYMENT_STEPS.md)**  
Complete walkthrough with:
- Wrangler authentication setup
- KV namespace creation
- API key secret configuration
- DNS CNAME record setup
- Deployment commands
- Verification steps
- Troubleshooting

**Use this if:** You want detailed explanations of each step.

---

### Claude.ai Integration
**[`CLAUDE_MCP_SETUP.md`](CLAUDE_MCP_SETUP.md)**  
Step-by-step guide for connecting Claude.ai to the MCP server.

**Covers:**
- Web interface setup
- Desktop app configuration
- Alternative MCP clients
- Authentication headers
- Test queries
- Troubleshooting

**Use this if:** You want to connect your deployed MCP server to Claude.

---

### Executive Summary
**[`DEPLOYMENT_READY.md`](DEPLOYMENT_READY.md)**  
High-level overview with:
- Architecture diagram
- Security features
- Available MCP tools
- Monitoring & debugging
- Cost structure
- Quick command reference

**Use this if:** You want to understand the overall system.

---

## 🛠️ Supporting Documentation

### Original Deployment Guide
**[`BLAZE_DEPLOYMENT_GUIDE.md`](BLAZE_DEPLOYMENT_GUIDE.md)**  
Comprehensive guide created in iteration 2 with:
- Custom domain setup
- SSL configuration
- Monitoring setup
- Branding details

### MCP Quick Reference
**[`MCP_QUICK_REFERENCE.md`](MCP_QUICK_REFERENCE.md)**  
Command cheatsheet for common operations.

### MCP Architecture
**[`MCP_ARCHITECTURE_DIAGRAM.md`](MCP_ARCHITECTURE_DIAGRAM.md)**  
System architecture and data flow diagrams.

---

## 🔧 Utility Scripts

### Deployment Validation Script
**[`validate-deployment.sh`](validate-deployment.sh)**  
Bash script to test all endpoints after deployment.

**Usage:**
```bash
chmod +x validate-deployment.sh
export BSI_API_KEY=your_key_here
./validate-deployment.sh
```

**Tests:**
- Health endpoint (public)
- DNS resolution
- MCP authentication (expects 401 without key)
- MCP initialize (with auth)
- MCP tools/list
- Rate limiting headers

---

## 📋 Deployment Checklist

Use this to track your progress:

```
PRE-DEPLOYMENT
==============
[ ] Reviewed QUICK_START.md
[ ] Cloudflare account access confirmed
[ ] Domain blazesportsintel.com active in Cloudflare
[ ] Wrangler CLI installed (npm install -g wrangler)
[ ] Project code cloned locally

DEPLOYMENT STEPS
================
[ ] 1. Set CLOUDFLARE_API_TOKEN environment variable
[ ] 2. Authenticate: wrangler whoami
[ ] 3. Create KV namespace: wrangler kv:namespace create RATE_LIMIT_KV
[ ] 4. Update wrangler.toml with KV namespace ID
[ ] 5. Generate API key: openssl rand -hex 32
[ ] 6. Set secret: wrangler secret put BSI_API_KEY
[ ] 7. Deploy: wrangler deploy
[ ] 8. Add DNS CNAME record in Cloudflare dashboard
[ ] 9. Wait for DNS propagation (1-2 minutes)

VERIFICATION
============
[ ] 10. Test health endpoint (curl)
[ ] 11. Test MCP without auth (should get 401)
[ ] 12. Test MCP with auth (should get 200)
[ ] 13. Run validation script: ./validate-deployment.sh
[ ] 14. Check Cloudflare Analytics dashboard

CLAUDE.AI INTEGRATION
=====================
[ ] 15. Enable MCP in Claude.ai Feature Preview
[ ] 16. Add MCP server connector
[ ] 17. Set URL: https://sabermetrics.blazesportsintel.com/mcp
[ ] 18. Add Authorization header with API key
[ ] 19. Test: "Show me today's college baseball scores"
[ ] 20. Verify Claude uses MCP tools successfully

POST-DEPLOYMENT
===============
[ ] 21. Monitor logs: wrangler tail
[ ] 22. Save API key securely
[ ] 23. Bookmark production URLs
[ ] 24. Share CLAUDE_MCP_SETUP.md with team members
[ ] 25. Set up alerts in Cloudflare dashboard (optional)
```

---

## 🗂️ File Organization

### Configuration Files
- `wrangler.toml` - Cloudflare Worker configuration
- `public/CNAME` - DNS CNAME record definition

### Worker Code
- `src/mcp/standalone-worker.ts` - Main MCP server implementation

### Documentation
- `QUICK_START.md` - Quick deployment guide
- `PRODUCTION_DEPLOYMENT_STEPS.md` - Complete walkthrough
- `CLAUDE_MCP_SETUP.md` - Claude.ai integration
- `DEPLOYMENT_READY.md` - Executive summary
- `BLAZE_DEPLOYMENT_GUIDE.md` - Original deployment guide
- `MCP_QUICK_REFERENCE.md` - Command reference
- `MCP_ARCHITECTURE_DIAGRAM.md` - Architecture docs
- `DEPLOYMENT_DOCUMENTATION_INDEX.md` - This file

### Scripts
- `validate-deployment.sh` - Deployment validation script

---

## 🎯 Which Document Should I Use?

### Scenario 1: First-time deployment
1. Start with **`QUICK_START.md`**
2. If you need more detail, refer to **`PRODUCTION_DEPLOYMENT_STEPS.md`**
3. After deployment, use **`CLAUDE_MCP_SETUP.md`** to connect Claude

### Scenario 2: Understanding the system
1. Read **`DEPLOYMENT_READY.md`** for overview
2. Review **`MCP_ARCHITECTURE_DIAGRAM.md`** for architecture
3. Check **`BLAZE_DEPLOYMENT_GUIDE.md`** for detailed features

### Scenario 3: Troubleshooting
1. Run **`validate-deployment.sh`** to identify issues
2. Check troubleshooting sections in:
   - **`PRODUCTION_DEPLOYMENT_STEPS.md`** (deployment issues)
   - **`CLAUDE_MCP_SETUP.md`** (Claude.ai connection issues)
3. Run `wrangler tail` for live logs

### Scenario 4: Connecting AI assistants
1. For Claude.ai: **`CLAUDE_MCP_SETUP.md`**
2. For other MCP clients: See "Alternative MCP Clients" section in **`CLAUDE_MCP_SETUP.md`**

### Scenario 5: Quick command reference
1. **`MCP_QUICK_REFERENCE.md`** - Wrangler commands
2. **`DEPLOYMENT_READY.md`** - Quick command reference section
3. **`QUICK_START.md`** - Essential deployment commands

---

## 🔑 Key Information

### Production URLs
- **MCP Endpoint:** `https://sabermetrics.blazesportsintel.com/mcp`
- **Web UI:** `https://sabermetrics.blazesportsintel.com/`
- **Health Check:** `https://sabermetrics.blazesportsintel.com/health`

### Cloudflare Details
- **Account ID:** `a12cb329d84130460eed99b816e4d0d3`
- **Zone:** `blazesportsintel.com`
- **Worker Name:** `college-baseball-mcp`
- **Subdomain:** `sabermetrics`

### Secrets & Configuration
- **API Key Secret:** `BSI_API_KEY` (set via `wrangler secret put`)
- **KV Namespace:** `RATE_LIMIT_KV` (create via `wrangler kv:namespace create`)

### Authentication
- **Header:** `Authorization: Bearer YOUR_BSI_API_KEY`
- **Alternative:** `X-API-Key: YOUR_BSI_API_KEY`
- **Public Endpoints:** `/health`, `/`, `/favicon.svg`, `/favicon.ico`

### Rate Limiting
- **Limit:** 60 requests per minute per IP
- **Response Headers:** 
  - `X-RateLimit-Limit`
  - `X-RateLimit-Remaining`
  - `X-RateLimit-Reset`
- **Error:** HTTP 429 with `Retry-After: 60`

---

## 📞 Support Resources

### Documentation
- **MCP Specification:** https://modelcontextprotocol.io/
- **Cloudflare Workers:** https://developers.cloudflare.com/workers/
- **Wrangler CLI:** https://developers.cloudflare.com/workers/wrangler/
- **Claude MCP Docs:** https://support.anthropic.com/en/collections/7979775-model-context-protocol

### Tools
- **Cloudflare Dashboard:** https://dash.cloudflare.com
- **Claude.ai:** https://claude.ai
- **ESPN API Reference:** https://gist.github.com/nntrn/ee26cb2a0716de0947a0a4e9a157bc1c

---

## 🔄 Version History

- **v1.0.0** - Initial production deployment (Iteration 3)
  - Authentication middleware implemented
  - Rate limiting with KV namespace
  - Custom domain routing
  - Claude.ai integration ready
  - Complete documentation suite

---

🔥 **Powered by Blaze Sports Intel**  
*Courage · Grit · Leadership*

**Ready to deploy?** → Start with [`QUICK_START.md`](QUICK_START.md)
