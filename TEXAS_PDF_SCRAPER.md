# Texas Longhorns PDF Scraper

## Overview

The Texas Longhorns PDF Scraper is a specialized data extraction tool designed to parse and analyze official team statistics from the Texas Longhorns baseball program's PDF documents hosted at texaslonghorns.com.

## Features

### 🎯 Core Capabilities

- **Season Statistics Extraction**: Parses batting and pitching statistics from official season stats PDFs
- **Media Guide Parsing**: Extracts player biographical information from team media guides
- **Team Analytics**: Automatically calculates team-level batting and pitching statistics
- **Player Profiles**: Combines stats with biographical data for comprehensive player profiles
- **Schedule & Results**: Tracks game results, scores, and attendance data

### 📊 Data Collected

#### Player Batting Statistics
- Games Played (GP)
- At Bats (AB)
- Runs (R)
- Hits (H)
- Doubles, Triples, Home Runs
- RBI, BB, SO
- Stolen Bases (SB) / Caught Stealing (CS)
- AVG, OBP, SLG, OPS

#### Player Pitching Statistics
- Games Played / Games Started
- Wins-Losses-Saves
- Innings Pitched
- Hits, Runs, Earned Runs
- Strikeouts, Walks
- ERA, WHIP

#### Player Biographical Data
- Height & Weight
- Hometown
- High School
- Previous School
- Year (Fr/So/Jr/Sr)
- Jersey Number

## Implementation

### File Structure

```
src/
├── lib/
│   └── texasPdfScraper.ts         # Core PDF scraping logic
└── components/
    └── TexasLonghornsData.tsx     # React UI component
```

### API Reference

#### `TexasPdfScraper` Class

```typescript
class TexasPdfScraper {
  // Fetch and extract text from a PDF URL
  async fetchPdfText(url: string): Promise<string>
  
  // Scrape season stats from official PDF
  async scrapeSeasonStats(pdfUrl: string): Promise<TexasPlayerStats[]>
  
  // Scrape media guide for player bios
  async scrapeMediaGuide(pdfUrl: string): Promise<Partial<TexasTeamStats>>
  
  // Full team data scraping (combines stats + bios)
  async scrapeFullTeamData(): Promise<TexasTeamStats>
  
  // Generate mock data for testing/demo purposes
  generateMockData(): TexasTeamStats
}
```

### Usage Example

```typescript
import { texasPdfScraper } from '@/lib/texasPdfScraper';

// Scrape full team data
const teamData = await texasPdfScraper.scrapeFullTeamData();

// Access player stats
teamData.players.forEach(player => {
  console.log(`${player.name}: ${player.batting?.avg.toFixed(3)}`);
});

// Team totals
console.log(`Team AVG: ${teamData.teamBatting.avg.toFixed(3)}`);
console.log(`Team ERA: ${teamData.teamPitching.era.toFixed(2)}`);
```

## Data Sources

### Primary PDF Sources

1. **Season Statistics PDF**
   - URL Pattern: `https://texaslonghorns.com/documents/YYYY/M/D/Season-Stats-MMM-DD.pdf`
   - Example: `https://texaslonghorns.com/documents/2026/2/25/Season-Stats-Feb-24.pdf`
   - Contains: Current season batting and pitching statistics

2. **Media Guide PDF**
   - URL Pattern: `https://texaslonghorns.com/documents/YYYY/M/D/YYYY_Baseball_Media_Guide.pdf`
   - Example: `https://texaslonghorns.com/documents/2026/2/12/2026_Baseball_Media_Guide.pdf`
   - Contains: Player bios, roster information, historical data

## UI Component

### `TexasLonghornsData` Component

A comprehensive React component that displays Texas Longhorns baseball data with the following features:

#### Layout Sections

1. **Team Header**
   - Current season record (overall, conference, home/away)
   - Action buttons for data loading
   - Team branding and identity

2. **Team Statistics Cards**
   - Team Batting Summary (AVG, OPS, HR, RBI, SB)
   - Team Pitching Summary (ERA, WHIP, K, BB, SV)
   - Data Source Information

3. **Tabbed Views**
   - **Overview**: Recent game results with scores and attendance
   - **Batting Leaders**: Sortable table of top offensive performers
   - **Pitching Leaders**: Sortable table of top pitchers

4. **Player Detail Modal**
   - Expanded player card with biographical info
   - Complete batting and/or pitching statistics
   - Calculated metrics (K/9, etc.)

#### Interactive Features

- **Mock Data Loading**: Quick demo mode with realistic sample data
- **Live PDF Scraping**: Attempt to fetch and parse real PDF documents
- **Player Selection**: Click any player row to view detailed profile
- **Sortable Stats**: Leaders automatically sorted by key metrics

## Technical Details

### PDF Text Extraction

The scraper uses a browser-compatible PDF parsing approach:

1. **Fetch PDF**: Download PDF as ArrayBuffer
2. **Extract Text**: Parse PDF stream objects and text operators
3. **Parse Stats**: Use regex patterns to identify stat lines
4. **Structure Data**: Convert to typed TypeScript objects

### Parsing Strategy

```typescript
// Pattern matching for batting lines
const battingMatch = line.match(/^(\d+)?\s*([A-Z][a-z]+(?:\s+[A-Z][a-z]+)+)/);

// Statistical data extraction
const stats = statsText.split(/\s+/).map(s => parseFloat(s));
```

### Data Merging

Player data from multiple sources is merged by player ID:

```typescript
private mergePlayers(
  statsPlayers: TexasPlayerStats[], 
  bioPlayers: TexasPlayerStats[]
): TexasPlayerStats[]
```

## CORS Considerations

⚠️ **Important**: Direct PDF scraping from texaslonghorns.com requires CORS configuration or a proxy server.

### Browser Limitations

Due to browser Same-Origin Policy, direct PDF fetching may fail with CORS errors. Solutions:

1. **Mock Data Mode** (default): Uses pre-populated realistic data
2. **Server-Side Scraping**: Implement backend proxy to fetch PDFs
3. **CORS Proxy**: Use a CORS proxy service (development only)
4. **Cloudflare Worker**: Deploy scraper as edge function

### Production Deployment

For production use, implement one of these approaches:

```typescript
// Option 1: Cloudflare Worker endpoint
const response = await fetch('/api/scrape-texas-stats', {
  headers: { 'Authorization': 'Bearer YOUR_API_KEY' }
});

// Option 2: Backend proxy
const response = await fetch('https://api.yourdomain.com/texas/stats');

// Option 3: Pre-scraped data cache
const cachedData = await fetch('/api/cached-texas-stats');
```

## Integration with MCP Server

The Texas PDF scraper can be integrated into the MCP (Model Context Protocol) server for AI agent access:

### Add MCP Tool

```typescript
// In src/mcp/server.ts
{
  name: 'get_texas_stats',
  description: 'Get Texas Longhorns baseball statistics scraped from official PDFs',
  inputSchema: {
    type: 'object',
    properties: {
      season: {
        type: 'string',
        description: 'Season year (e.g., "2026")',
      },
    },
  },
  readOnlyHint: true,
}
```

### Tool Handler

```typescript
case 'get_texas_stats': {
  const data = await texasPdfScraper.scrapeFullTeamData();
  return {
    content: [{
      type: 'text',
      text: JSON.stringify(data, null, 2),
    }],
  };
}
```

## Future Enhancements

### Planned Features

- [ ] Multi-season historical data scraping
- [ ] Automatic PDF URL discovery
- [ ] Enhanced player headshot extraction
- [ ] Game-by-game stat tracking
- [ ] Advanced metrics calculation (wOBA, FIP, etc.)
- [ ] Real-time update monitoring
- [ ] Data caching and persistence
- [ ] Comparison tools (vs other teams)

### Extended Team Support

The scraper architecture is designed to be extensible:

```typescript
class NCAATeamScraper {
  protected readonly baseUrl: string;
  
  async scrapeTeamData(teamSlug: string): Promise<TeamStats>
  async scrapePlayerData(playerId: string): Promise<PlayerStats>
}

// Extend for other schools
class TexasAMScraper extends NCAATeamScraper {}
class LSUScraper extends NCAATeamScraper {}
class ArkansasScraper extends NCAATeamScraper {}
```

## Error Handling

The scraper includes robust error handling:

```typescript
try {
  const data = await scraper.scrapeFullTeamData();
} catch (error) {
  console.error('Scraping failed:', error);
  // Fallback to mock data
  const mockData = scraper.generateMockData();
}
```

## Performance Considerations

- **Lazy Loading**: Component loads mock data first, then optionally fetches live data
- **Caching**: Consider caching PDF content to reduce repeat requests
- **Progressive Enhancement**: UI displays immediately with mock data while real data loads
- **Timeout Handling**: PDF requests should timeout after reasonable duration

## License & Usage

This scraper is designed for research and development purposes within the Blaze Sports Intel platform. When scraping official team websites:

1. Respect robots.txt directives
2. Implement reasonable rate limiting
3. Cache results to minimize requests
4. Provide proper attribution to data sources
5. Comply with NCAA and team website terms of service

## Support

For questions or issues with the Texas PDF scraper:

1. Check CORS configuration if live scraping fails
2. Verify PDF URL patterns are current
3. Review browser console for detailed error messages
4. Test with mock data mode first
5. Consider server-side implementation for production

---

**Last Updated**: 2026-02-25  
**Version**: 1.0.0  
**Maintainer**: Blaze Sports Intel Team
