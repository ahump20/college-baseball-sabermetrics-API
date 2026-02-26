# Real PDF Text Extraction & Automated SEC Team Scraping

## Overview

This document describes the implementation of **real PDF text extraction** using PDF.js and **automated daily scraping** for all SEC teams with player statistics.

## Features Implemented

### 1. Real PDF Text Extraction with PDF.js

We've upgraded from basic regex-based PDF parsing to production-grade text extraction using **Mozilla's PDF.js library**.

**Library Added**: `pdfjs-dist@5.4.624`

#### Texas PDF Scraper Enhancements

**File**: `src/lib/texasPdfScraper.ts`

**Key Changes**:
- Added `pdfjs-dist` library for proper PDF parsing
- Implemented `ensurePdfJs()` method to lazy-load PDF.js with CDN worker
- Created `extractTextFromPdf()` using PDF.js text content extraction API
- Added fallback parser for when PDF.js fails
- Integrated with CORS proxy (`/api/proxy`) to fetch PDFs server-side
- Base64 encoding/decoding for ArrayBuffer transfer between proxy and client

**How It Works**:

```typescript
// 1. Fetch PDF through CORS proxy
const response = await fetch('/api/proxy', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    url: 'https://texaslonghorns.com/documents/2026/2/25/Season-Stats-Feb-24.pdf',
    responseType: 'arrayBuffer'
  })
});

// 2. Convert base64 response to ArrayBuffer
const result = await response.json();
const arrayBuffer = base64ToArrayBuffer(result.data);

// 3. Extract text with PDF.js
const pdfjs = await import('pdfjs-dist');
const loadingTask = pdfjs.getDocument({ data: arrayBuffer });
const pdf = await loadingTask.promise;

// 4. Extract text from all pages
for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
  const page = await pdf.getPage(pageNum);
  const textContent = await page.getTextContent();
  const pageText = textContent.items.map(item => item.str).join(' ');
  fullText += pageText + '\n';
}
```

**Parsing Strategy**:
- Extract all text content from PDF pages
- Identify batting/pitching sections by header patterns
- Parse player stat lines using regex patterns
- Extract jersey numbers, names, positions, and all stat columns
- Calculate team totals and averages

### 2. SEC Team Scrapers with Real PDF Support

**File**: `src/lib/secTeamScrapers.ts`

**All 16 SEC Teams Supported**:
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

**Key Features**:
- **PDF Discovery**: Automatically attempts to find team PDF URLs using common patterns
- **Multi-Source Fallback**: Tries PDF → Web scraping → Mock data
- **PDF.js Integration**: Same real PDF extraction as Texas scraper
- **Smart Parsing**: Handles both batting and pitching statistics
- **Team Colors**: Configured with official team colors for UI rendering

**Scraping Workflow**:

```typescript
class SECTeamScraper {
  async scrapeTeamStats() {
    // 1. Try PDF scraping first (highest quality)
    try {
      const pdfUrl = await this.discoverPdfUrl();
      const pdfText = await this.fetchPdfText(pdfUrl);
      const players = this.parsePdfStats(pdfText);
      return { teamId, teamName, players, source: 'pdf' };
    } catch (error) {
      console.warn('PDF scraping failed, trying web...');
    }
    
    // 2. Fallback to web scraping
    try {
      const html = await corsProxy.get(teamStatsUrl);
      const players = this.parseHtmlStats(html);
      return { teamId, teamName, players, source: 'web' };
    } catch (error) {
      console.warn('Web scraping failed, using mock data');
    }
    
    // 3. Final fallback to realistic mock data
    return this.generateMockData();
  }
}
```

### 3. Automated Daily Scraping with Cloudflare Workers

**File**: `src/mcp/standalone-worker.ts`

**Cron Schedule**: Daily at 6:00 AM UTC (`0 6 * * *`)

**New API Endpoints**:

#### `POST /api/scrape-all` (Auth Required)
Triggers scraping for all 16 SEC teams

**Request**:
```bash
curl -X POST https://sabermetrics.blazesportsintel.com/api/scrape-all \
  -H "Authorization: Bearer YOUR_BSI_API_KEY"
```

**Response**:
```json
{
  "message": "Scraping started",
  "status": {
    "startTime": "2026-02-26T06:00:00.000Z",
    "teamsScraped": 0,
    "totalTeams": 16,
    "status": "running",
    "teams": []
  }
}
```

#### `GET /api/scrape-status`
Check the status of ongoing scraping

**Response**:
```json
{
  "startTime": "2026-02-26T06:00:00.000Z",
  "endTime": "2026-02-26T06:05:23.456Z",
  "teamsScraped": 16,
  "totalTeams": 16,
  "status": "completed",
  "teams": [
    {
      "teamId": "texas",
      "status": "success",
      "timestamp": "2026-02-26T06:00:15.123Z"
    },
    ...
  ]
}
```

#### `GET /api/sec-teams`
List all available SEC teams

**Response**:
```json
{
  "teams": [
    "texas", "alabama", "arkansas", "auburn", "florida", "georgia",
    "kentucky", "lsu", "mississippi-state", "missouri", "ole-miss",
    "south-carolina", "tennessee", "texas-am", "vanderbilt", "oklahoma"
  ]
}
```

#### `GET /api/team/{teamId}`
Get cached stats for a specific team

**Example**: `GET /api/team/texas`

**Response**:
```json
{
  "teamId": "texas",
  "teamName": "Texas Longhorns",
  "season": "2026",
  "lastUpdated": "2026-02-26T06:00:15.123Z",
  "record": {
    "overall": "15-5",
    "conference": "3-0",
    "home": "10-2",
    "away": "5-3"
  },
  "players": [...],
  "source": "pdf"
}
```

### 4. Cloudflare KV Storage for Caching

**wrangler.toml Configuration**:

```toml
# KV Namespace for team stats caching
[[kv_namespaces]]
binding = "TEAM_STATS_KV"
id = "your-team-stats-kv-namespace-id-here"

# Cron triggers for automated data scraping
[triggers]
crons = ["0 6 * * *"]
```

**Data Persistence**:
- Team stats cached for 24 hours (86400 seconds TTL)
- Scrape status cached for 1 hour (3600 seconds TTL)
- Keys: `team:{teamId}` and `scrape:status`

**Setup Commands**:
```bash
# Create the KV namespace
wrangler kv:namespace create TEAM_STATS_KV

# Copy the returned ID into wrangler.toml
# Example: id = "abc123def456..."
```

### 5. CORS Proxy for PDF Fetching

**Endpoint**: `POST /api/proxy`

**Purpose**: Bypass browser CORS restrictions when fetching PDFs from team websites

**Request**:
```json
{
  "url": "https://texaslonghorns.com/documents/2026/2/25/Season-Stats-Feb-24.pdf",
  "responseType": "arrayBuffer"
}
```

**Response**:
```json
{
  "ok": true,
  "status": 200,
  "statusText": "OK",
  "headers": {
    "content-type": "application/pdf",
    "content-length": "123456"
  },
  "data": "base64-encoded-array-buffer"
}
```

**Supported Response Types**:
- `arrayBuffer` - For PDFs (returns base64-encoded byte array)
- `json` - For JSON responses
- `text` - For HTML/text responses

## Data Flow Architecture

```
┌─────────────────────────────────────────────────────────┐
│                   Cloudflare Worker                      │
│                                                          │
│  ┌──────────────────────────────────────────────────┐   │
│  │  Cron Trigger (Daily 6 AM UTC)                   │   │
│  │  ├─> Scrape Texas (PDF)                          │   │
│  │  ├─> Scrape Alabama (Web)                        │   │
│  │  ├─> Scrape Arkansas (PDF)                       │   │
│  │  └─> ... (all 16 SEC teams)                      │   │
│  └───────────────┬──────────────────────────────────┘   │
│                  │                                        │
│                  ▼                                        │
│  ┌──────────────────────────────────────────────────┐   │
│  │  /api/proxy (CORS Bypass)                        │   │
│  │  ├─> Fetch PDF from team website                 │   │
│  │  ├─> Convert to base64                           │   │
│  │  └─> Return to scraper                           │   │
│  └───────────────┬──────────────────────────────────┘   │
│                  │                                        │
│                  ▼                                        │
│  ┌──────────────────────────────────────────────────┐   │
│  │  PDF.js Text Extraction                          │   │
│  │  ├─> Parse all pages                             │   │
│  │  ├─> Extract batting stats                       │   │
│  │  ├─> Extract pitching stats                      │   │
│  │  └─> Calculate team totals                       │   │
│  └───────────────┬──────────────────────────────────┘   │
│                  │                                        │
│                  ▼                                        │
│  ┌──────────────────────────────────────────────────┐   │
│  │  Cloudflare KV Storage                           │   │
│  │  ├─> Cache team:texas (24h TTL)                  │   │
│  │  ├─> Cache team:alabama (24h TTL)                │   │
│  │  ├─> ... (all 16 teams)                          │   │
│  │  └─> Cache scrape:status (1h TTL)                │   │
│  └──────────────────────────────────────────────────┘   │
│                                                          │
└─────────────────────────────────────────────────────────┘
                           │
                           ▼
                    ┌─────────────┐
                    │  Client App │
                    │  React UI   │
                    └─────────────┘
```

## Usage Examples

### Texas Longhorns Stats (Real PDF)

```typescript
import { texasPdfScraper } from '@/lib/texasPdfScraper';

// Scrape full team data from official PDFs
const teamData = await texasPdfScraper.scrapeFullTeamData();

console.log(`Season: ${teamData.season}`);
console.log(`Record: ${teamData.record.overall}`);
console.log(`Team AVG: ${teamData.teamBatting.avg.toFixed(3)}`);
console.log(`Team ERA: ${teamData.teamPitching.era.toFixed(2)}`);

// Access individual players
teamData.players.forEach(player => {
  if (player.batting) {
    console.log(`${player.name}: .${player.batting.avg.toFixed(3)} AVG, ${player.batting.hr} HR`);
  }
  if (player.pitching) {
    console.log(`${player.name}: ${player.pitching.era.toFixed(2)} ERA, ${player.pitching.so} K`);
  }
});
```

### All SEC Teams

```typescript
import { scrapeAllSECTeams } from '@/lib/secTeamScrapers';

// Scrape all 16 SEC teams
const allTeams = await scrapeAllSECTeams();

allTeams.forEach(team => {
  console.log(`${team.teamName} (${team.record?.overall})`);
  console.log(`  Source: ${team.source}`);
  console.log(`  Players: ${team.players.length}`);
  console.log(`  Last Updated: ${team.lastUpdated}`);
});
```

### Single Team Scraper

```typescript
import { SECTeamScraper } from '@/lib/secTeamScrapers';

// Scrape Arkansas Razorbacks
const scraper = new SECTeamScraper('arkansas');
const stats = await scraper.scrapeTeamStats();

console.log(stats);
```

## Production Deployment

### 1. Create KV Namespace

```bash
wrangler kv:namespace create TEAM_STATS_KV
```

Copy the returned namespace ID and add it to `wrangler.toml`:

```toml
[[kv_namespaces]]
binding = "TEAM_STATS_KV"
id = "your-actual-kv-id-here"  # Replace with actual ID
```

### 2. Set API Key (Optional)

```bash
wrangler secret put BSI_API_KEY
# Paste your API key when prompted
```

### 3. Deploy to Cloudflare

```bash
wrangler deploy
```

### 4. Verify Cron Schedule

The worker will automatically scrape all SEC teams daily at 6 AM UTC. You can also manually trigger scraping:

```bash
curl -X POST https://sabermetrics.blazesportsintel.com/api/scrape-all \
  -H "Authorization: Bearer YOUR_BSI_API_KEY"
```

### 5. Check Scraping Status

```bash
curl https://sabermetrics.blazesportsintel.com/api/scrape-status
```

## Data Quality & Fallbacks

The scraping system uses a **multi-tier approach** to ensure data availability:

### Tier 1: Real PDF Extraction (Best Quality)
- Uses PDF.js to extract text from official team PDFs
- Parses batting and pitching statistics
- Includes player names, positions, years, jersey numbers
- Calculates team totals and averages
- **Source**: `"pdf"`

### Tier 2: Web Scraping (Good Quality)
- Falls back to HTML parsing if PDF unavailable
- Extracts stats from team website stat pages
- Parses HTML tables for player data
- **Source**: `"web"`

### Tier 3: Mock Data (Guaranteed Availability)
- Generates realistic sample data as final fallback
- Ensures app always has data to display
- Useful for development and testing
- **Source**: `"mock"`

## Error Handling

All scraping methods include comprehensive error handling:

```typescript
try {
  const data = await texasPdfScraper.scrapeFullTeamData();
  // Successfully scraped real data
} catch (error) {
  console.error('Scraping failed:', error);
  // Automatically falls back to mock data
  const mockData = texasPdfScraper.generateMockData();
}
```

## Performance Considerations

- **PDF Caching**: Team stats cached for 24 hours in Cloudflare KV
- **Lazy Loading**: PDF.js library loaded on-demand
- **Parallel Scraping**: All 16 teams scraped concurrently
- **Worker Timeout**: Cloudflare Workers have 30-second CPU time limit
- **Batch Processing**: Large scraping jobs may need to be split

## Browser Compatibility

**PDF.js Requirements**:
- Modern browsers (Chrome, Firefox, Safari, Edge)
- Web Workers support for PDF parsing
- ArrayBuffer and Uint8Array support
- ES6+ JavaScript features

**CDN Worker URL**:
```
https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${version}/pdf.worker.min.js
```

## Monitoring & Debugging

### Check Scraping Status

```bash
curl https://sabermetrics.blazesportsintel.com/api/scrape-status
```

### View Cached Team Data

```bash
curl https://sabermetrics.blazesportsintel.com/api/team/texas
```

### Test PDF Proxy

```bash
curl -X POST https://sabermetrics.blazesportsintel.com/api/proxy \
  -H "Content-Type: application/json" \
  -d '{"url": "https://texaslonghorns.com/documents/2026/2/25/Season-Stats-Feb-24.pdf", "responseType": "arrayBuffer"}'
```

### Cloudflare Dashboard

Monitor worker execution in Cloudflare dashboard:
- Analytics → Workers → `college-baseball-mcp`
- View request counts, CPU time, errors
- Check cron trigger execution logs

## Future Enhancements

### Planned Features

- [ ] **Historical Data**: Scrape and store multi-season data
- [ ] **Real-time Updates**: Scrape during games for live stats
- [ ] **Advanced Metrics**: Calculate wRC+, xwOBA, FIP, WAR
- [ ] **Player Headshots**: Extract player photos from media guides
- [ ] **Game-by-Game**: Parse box scores for individual game tracking
- [ ] **Injury Reports**: Monitor and parse injury updates
- [ ] **Roster Changes**: Track transfers, signings, and departures
- [ ] **Conference Standings**: Calculate real-time SEC standings

### Extended Team Coverage

- [ ] All NCAA D1 baseball teams (300+)
- [ ] Conference-specific scrapers (ACC, Big 12, Pac-12, etc.)
- [ ] Minor league baseball (Cape Cod League, etc.)
- [ ] International college baseball

## Security & Rate Limiting

**API Authentication**: Optional BSI_API_KEY for `/api/scrape-all`

**Rate Limits**: 60 requests/minute per IP (configurable)

**CORS Policy**: Open for browser-based scraping, restricted for automation

**User-Agent**: `Mozilla/5.0 (compatible; BSI-Scraper/1.0)`

## License & Terms

This scraper is designed for **research and development** purposes within the Blaze Sports Intel platform. When scraping official team websites:

1. ✅ Respect `robots.txt` directives
2. ✅ Implement reasonable rate limiting
3. ✅ Cache results to minimize requests
4. ✅ Provide proper attribution to data sources
5. ✅ Comply with NCAA and team website terms of service

---

**Last Updated**: 2026-02-26  
**Version**: 2.0.0  
**Maintainer**: Blaze Sports Intel Team
