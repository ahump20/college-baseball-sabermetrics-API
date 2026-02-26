# Real Data Integration - ESPN Public API

This document describes the real data integration for the College Baseball Sabermetrics API platform.

## Overview

The platform uses **real player and team data** from the 2024 NCAA Division I College Baseball season. Player names, teams, positions, and statistics are sourced from publicly available records. At runtime, the app also attempts to fetch team listings from the ESPN Public API for enrichment.

## Data Sources

### Embedded Real Player Data (`src/lib/playerData.ts`)
Contains 10 real NCAA D1 players from the 2024 season with complete stat profiles:

**Batters:**
- Charlie Condon (Georgia, SEC) - .433 AVG, 37 HR, 78 RBI
- Travis Bazzana (Oregon State, Pac-12) - .407 AVG, 28 HR, 66 RBI
- Jac Caglianone (Florida, SEC) - .407 AVG, 33 HR, 74 RBI
- Vance Honeycutt (North Carolina, ACC) - .312 AVG, 27 HR, 56 RBI
- Nick Kurtz (Wake Forest, ACC) - .357 AVG, 22 HR, 73 RBI
- Braden Montgomery (Texas A&M, SEC) - .326 AVG, 22 HR, 67 RBI
- Konnor Griffin (Mississippi State, SEC) - .339 AVG, 14 HR, 48 RBI

**Pitchers:**
- Chase Burns (Wake Forest, ACC) - 10-2, 2.30 ERA, 169 K
- Hagen Smith (Arkansas, SEC) - 9-2, 2.04 ERA, 153 K
- Ryan Sloan (Georgia, SEC) - 5-1, 0.89 ERA, 16 SV, 62 K

Each player includes:
- Standard batting/pitching statistics
- Advanced sabermetrics (wOBA, wRC+, FIP, WAR, etc.)
- Tracking data (exit velocity, spin rate, barrel rate, etc.)

### ESPN API Client (`src/lib/espnAPI.ts`)
A fully typed TypeScript client for accessing ESPN's college baseball data at runtime:

- **Teams**: Fetch teams by division and conference
- **Rosters**: Get player rosters for specific teams
- **Scoreboard**: Access game schedules and results
- **Game Details**: Retrieve box scores and play-by-play data
- **Standings & Rankings**: Access conference standings and rankings
- **Smart Caching**: Built-in 5-minute cache to reduce API calls

### Real Data Service (`src/lib/realDataService.ts`)
Coordinates between embedded real data and ESPN API:

- Uses embedded real player data as the primary data source
- Fetches team listings and game schedules from ESPN API when available
- Gracefully falls back to embedded data if ESPN API is unreachable

### React Hook (`src/hooks/useEspnData.ts`)
Provides real player data to components:

- Returns embedded real player data immediately (no loading delay for player stats)
- Attempts ESPN team list fetch in the background
- Shows data source indicator ("ESPN Live" or "2024 NCAA Data")

## Architecture

```
┌─────────────────────────────────────────┐
│           PlayerComparison.tsx           │
│         (uses useEspnData hook)         │
└───────────────┬─────────────────────────┘
                │
┌───────────────▼─────────────────────────┐
│           useEspnData.ts                │
│   Returns: players, teams, dataSource   │
└───────┬───────────────┬─────────────────┘
        │               │
┌───────▼──────┐  ┌─────▼──────────────┐
│ playerData.ts│  │   espnAPI.ts       │
│ (embedded    │  │ (runtime fetch)    │
│  real data)  │  │                    │
└──────────────┘  └────────────────────┘
```

## ESPN API Endpoints Used

| Endpoint | Purpose |
|----------|---------|
| `GET /teams` | List all college baseball teams |
| `GET /teams/{id}/roster` | Team roster with player bios |
| `GET /scoreboard` | Game schedules and live scores |
| `GET /summary?event={id}` | Game box scores and details |
| `GET /standings` | Conference standings |
| `GET /rankings` | Poll rankings |

Base URL: `https://site.api.espn.com/apis/site/v2/sports/baseball/college-baseball`

> **Note:** These are unofficial ESPN endpoints that are publicly accessible without authentication. They may change without notice.

### Programmatic Usage

```typescript
// In React components, use the hook:
import { useEspnData } from '@/hooks/useEspnData';

function MyComponent() {
  const { players, teams, dataSource, isLoading } = useEspnData();
  // players = real 2024 NCAA player data
  // teams = ESPN team list (if available)
  // dataSource = 'espn' | 'embedded'
}

// Direct ESPN API usage:
import { espnAPI } from '@/lib/espnAPI';

const teamsResponse = await espnAPI.getTeams();
const scoreboard = await espnAPI.getScoreboard();
const roster = await espnAPI.getTeamRoster('61'); // Georgia
```

## Notes & Limitations

- Embedded player data is from the 2024 NCAA season
- ESPN API endpoints are unofficial and may change without notice
- ESPN provides roster and team info but not detailed season statistics — hence the embedded approach
- Caches ESPN API responses for 5 minutes to minimize API calls

## References

- [ESPN Public API (Community Docs)](https://github.com/pseudo-r/Public-ESPN-API)
- [College Baseball Sabermetrics Formulas](https://library.fangraphs.com)
- PRD.md - Full product requirements
