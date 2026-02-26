# SEC Team Scrapers & CORS Proxy Implementation

## Overview

This document describes the new automated PDF scraping system, CORS proxy server, and mobile UI improvements added to the College Baseball Sabermetrics API platform.

## Features Implemented

### 1. CORS Proxy Server

A server-side proxy that bypasses CORS restrictions when scraping PDFs and web pages from team websites.

**Location**: `/api/proxy` endpoint in `standalone-worker.ts`

**Usage**:
```typescript
import { corsProxy } from '@/lib/corsProxy';

// Fetch a PDF
const response = await corsProxy.getPdf('https://texaslonghorns.com/documents/2026/2/25/Season-Stats-Feb-24.pdf');

// Fetch any URL
const response = await corsProxy.get('https://example.com/stats');
```

**Features**:
- Handles PDF, JSON, and HTML responses
- Automatically sets appropriate User-Agent headers
- Returns structured response with status, headers, and data
- Bypasses CORS restrictions from browser

### 2. SEC Team Scrapers

Comprehensive scraping system for all 16 SEC baseball teams.

**Location**: `src/lib/secTeamScrapers.ts`

**Supported Teams**:
- Texas Longhorns
- Alabama Crimson Tide
- Arkansas Razorbacks
- Auburn Tigers
- Florida Gators
- Georgia Bulldogs
- Kentucky Wildcats
- LSU Tigers
- Mississippi State Bulldogs
- Missouri Tigers
- Ole Miss Rebels
- South Carolina Gamecocks
- Tennessee Volunteers
- Texas A&M Aggies
- Vanderbilt Commodores
- Oklahoma Sooners

**Usage**:
```typescript
import { SECTeamScraper, scrapeAllSECTeams } from '@/lib/secTeamScrapers';

// Scrape single team
const scraper = new SECTeamScraper('texas');
const texasStats = await scraper.scrapeTeamStats();

// Scrape all SEC teams
const allTeams = await scrapeAllSECTeams();
```

**Data Structure**:
```typescript
{
  teamId: string;
  teamName: string;
  season: string;
  lastUpdated: string;
  record: {
    overall: string;
    conference: string;
    home?: string;
    away?: string;
  };
  players: TeamPlayerStats[];
  source: 'pdf' | 'web' | 'mock';
}
```

### 3. Automated Daily Refresh

Daily automated scraping scheduled via Cloudflare Workers cron triggers.

**Schedule**: 6:00 AM UTC daily

**Configuration** (in `wrangler.toml`):
```toml
[triggers]
crons = ["0 6 * * *"]
```

**Workflow**:
1. Cron trigger fires at 6 AM UTC
2. Worker scrapes Texas stats from official PDFs
3. Data stored in Cloudflare KV (`TEAM_STATS_KV`)
4. Cached data served to frontend with fresh timestamps
5. Falls back to mock data if scraping fails

### 4. Mobile-First UI/UX Improvements

Complete redesign of the application for mobile devices.

**Key Improvements**:

#### Responsive Header
- Adaptive logo sizing (h-10 → h-16)
- Collapsing text on small screens
- Mobile menu button (hamburger) on devices < 768px
- Optimized badge visibility

#### Mobile Navigation
- Side sheet navigation panel on mobile
- Full-screen scrollable menu
- Touch-optimized button sizing (h-12)
- Visual active state indicators

#### Tab System
- Horizontal scrolling tabs on desktop
- Hidden tabs on mobile with status indicator
- Current tab显示 with icon and counter
- No tab overflow on any device

#### Content Spacing
- Reduced padding on mobile (px-4 vs px-8)
- Responsive vertical spacing (py-6 → py-12)
- Adaptive gap sizing (gap-2 → gap-4)

#### Typography
- Fluid font sizing with responsive breakpoints
- Minimum readable sizes on small screens
- Proper line height and letter spacing

#### Footer
- Responsive grid (1 col → 3 cols)
- Stack layout on mobile
- Adaptive logo and text sizing
- Wrapping domain display

**Breakpoints**:
- Mobile: < 640px (sm)
- Tablet: 640px - 1024px (md/lg)
- Desktop: > 1024px (xl)

## API Endpoints

### CORS Proxy
```
POST /api/proxy
Content-Type: application/json

{
  "url": "https://example.com/data.pdf",
  "method": "GET",
  "headers": { "Custom-Header": "value" }
}
```

### Team Stats
```
GET /api/sec-teams
Returns: { teams: string[] }

GET /api/team/{teamId}
Returns: TeamStats
```

## Setup Instructions

### 1. Create KV Namespaces

```bash
# Create rate limiting namespace
wrangler kv:namespace create RATE_LIMIT_KV

# Create team stats caching namespace
wrangler kv:namespace create TEAM_STATS_KV
```

### 2. Update wrangler.toml

Add the generated namespace IDs:

```toml
[[kv_namespaces]]
binding = "RATE_LIMIT_KV"
id = "your-rate-limit-kv-id"

[[kv_namespaces]]
binding = "TEAM_STATS_KV"
id = "your-team-stats-kv-id"
```

### 3. Deploy to Cloudflare

```bash
wrangler deploy
```

The cron trigger will automatically activate and run daily.

## Mobile Testing

To test mobile improvements:

1. **Chrome DevTools**: F12 → Toggle Device Toolbar (Ctrl+Shift+M)
2. **Responsive Design Mode** in Firefox: Ctrl+Shift+M
3. **Real Device**: Access via local network or deployed URL

**Test Scenarios**:
- [ ] Header adapts correctly at all breakpoints
- [ ] Mobile menu opens and closes smoothly
- [ ] Navigation works in side panel
- [ ] Tab indicator shows current position
- [ ] Content is readable without horizontal scroll
- [ ] Footer stacks properly on mobile
- [ ] All touch targets are >= 44px

## Performance Considerations

### Caching Strategy
- Team stats cached in KV for 24 hours
- CORS proxy responses not cached (always fresh)
- Frontend uses mock data as fallback

### Rate Limiting
- 60 requests/minute per IP
- Separate limits for API endpoints
- Bypass for static assets

### Mobile Optimization
- Lazy loading of tab content
- Reduced initial bundle with code splitting
- Optimized images (WebP format)
- Minimal JavaScript on first paint

## Troubleshooting

### CORS Proxy Fails
- Check that target URL is accessible
- Verify User-Agent header is set
- Ensure timeout isn't too short (<30s recommended)

### Scraper Returns Mock Data
- Check network connectivity
- Verify PDF URL is still valid
- Review HTML structure changes on team website
- Check CORS proxy is functioning

### Mobile Layout Issues
- Clear browser cache
- Check viewport meta tag in index.html
- Verify Tailwind breakpoints are correct
- Test in incognito mode

### Cron Not Running
- Verify triggers section in wrangler.toml
- Check Cloudflare dashboard for cron logs
- Ensure worker is deployed to production

## Future Enhancements

- [ ] PDF text extraction for more accurate stats
- [ ] Machine learning for stat recognition
- [ ] Real-time WebSocket updates
- [ ] Progressive Web App (PWA) features
- [ ] Offline support with Service Worker
- [ ] Push notifications for score updates
- [ ] Multi-language support
- [ ] Accessibility improvements (WCAG 2.1 AA)

## Support

For issues or questions:
- Check existing documentation in `/docs`
- Review error logs in Cloudflare dashboard
- Test with mock data to isolate scraping issues
- Verify API endpoints with curl/Postman
