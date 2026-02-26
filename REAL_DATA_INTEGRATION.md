# Real Data Integration - ESPN Public API

This document describes the real data fetching integration for the College Baseball Sabermetrics API platform.

## Overview

The platform now supports fetching **real game data, box scores, player stats, and team data** from the ESPN Public API instead of relying solely on mock/synthetic data. This enables you to work with actual NCAA baseball games, rosters, teams, and live statistics.

## Features

### ESPN API Client (`src/lib/espnAPI.ts`)
A fully typed TypeScript client for accessing ESPN's college baseball data:

- **Teams**: Fetch teams by division and conference
- **Rosters**: Get player rosters for specific teams
- **Scoreboard**: Access game schedules and results
- **Game Details**: Retrieve box scores and play-by-play data
- **Standings & Rankings**: Access conference standings and rankings
- **Smart Caching**: Built-in 5-minute cache to reduce API calls

### NCAA API Client (`src/lib/ncaaAPI.ts`)
A fully typed TypeScript client for the free [henrygd/ncaa-api](https://github.com/henrygd/ncaa-api) (`https://ncaa-api.henrygd.me`):

- **Scoreboard**: Daily D1 game scoreboard across all conferences
- **Box Scores**: Complete box score for any game ID
- **Play-by-Play**: Per-inning play events for any game
- **Team Stats**: Aggregate team stats for a specific game
- **Standings**: Season standings for all D1 teams
- **Rankings**: Weekly top-25 rankings
- **Smart Caching**: Built-in 5-minute cache (timestamp set after successful fetch)
- **Rate Limiting**: Throttled to 3 req/s (public API allows up to 5 req/s)
- **Graceful Errors**: Returns `null` on failure; serves stale cache on network error

### Multi-Source Data Connector (`src/lib/dataConnector.ts`)
An abstraction layer that normalises both ESPN and NCAA response shapes into a single set of unified types with configurable source priority and automatic fallback:

- **Unified types**: `UnifiedGame`, `UnifiedBoxScore`, `UnifiedPlayByPlayEvent`, `UnifiedStandingEntry`, `UnifiedRankingEntry` — each carrying a `source: 'espn' | 'ncaa'` discriminator
- **Configurable priority**: Constructor and `setSources()` accept an ordered source list (default: `['espn', 'ncaa']`)
- **Automatic fallback**: Each method tries the primary source first; silently falls back to secondary on error or empty result
- **Per-call source override**: Optional `source` parameter pins a single request to a specific backend


Advanced service for fetching and transforming real game data:

- **Game Schedules**: Fetch today's games or games from the last N days
- **Box Scores**: Complete box score data including line scores, team stats, and player stats
- **Player Statistics**: Batting and pitching stats for all players in a game
- **Play-by-Play**: Detailed play-by-play events with inning, outs, and scoring plays
- **Intelligent Caching**: 2-minute cache for game data to balance freshness and performance

### Real Data Service (`src/lib/realDataService.ts`)
Transforms ESPN data into the internal Player data model:

- **Data Transformation**: Converts ESPN athlete data to your Player interface
- **Statistics Generation**: Creates realistic batting and pitching stats based on position
- **Advanced Metrics Calculation**: Computes wOBA, FIP, wRC+, and other sabermetrics
- **Tracking Stats**: Generates TrackMan-style data (exit velocity, spin rate, etc.)
- **Conference Mapping**: Intelligently maps teams to conferences (SEC, ACC, Pac-12, Big 12, etc.)

### Player Comparison Component
Now includes a data source toggle:

- **Mock Data Mode**: Use the original synthetic player dataset for testing
- **Real Data Mode**: Fetch live player data from ESPN API
- **Seamless Switching**: Toggle between data sources with a button click
- **Loading States**: Shows progress while fetching real data
- **Toast Notifications**: Provides feedback on data loading success/failure

### Game Scoreboard Component (`src/components/GameScoreboard.tsx`)
NEW! Complete game data viewer with real ESPN box scores:

- **Live Game List**: Browse recent NCAA baseball games (today, last 3/7/14 days)
- **Game Status**: See which games are live, final, or scheduled
- **Full Box Scores**: View complete box scores including:
  - Line score by inning (runs, hits, errors)
  - Player batting stats (AB, R, H, RBI, BB, SO, AVG)
  - Player pitching stats (IP, H, R, ER, BB, SO, ERA)
- **Game Details**: Venue, attendance, and game notes
- **Auto-Load**: Automatically selects and displays the first completed game
- **Refresh**: Manual refresh to get the latest games

## Usage

### In the Games Tab (NEW!)

1. Navigate to the **Games** tab (first tab, default view)
2. The system will automatically:
   - Fetch recent NCAA baseball games from ESPN
   - Display games from the last 3 days by default
   - Auto-select the first completed game and show its box score
3. Use the controls:
   - **Time Range Selector**: Choose Today, Last 3/7/14 days
   - **Refresh Button**: Reload the latest games
   - **Game List**: Click any game to view its box score
4. View detailed box scores:
   - **Line Score**: Runs by inning for both teams
   - **Batting Tab**: All batters with plate appearance stats
   - **Pitching Tab**: All pitchers with pitching line stats

### In the Player Comparison Tab

1. Navigate to the **Players** tab
2. Click the **"Real Data (ESPN)"** button in the top-right corner
3. The system will:
   - Fetch teams from ESPN's college baseball API
   - Load rosters for the first 20 teams
   - Transform the data into the internal format
   - Display a toast with the number of players and teams loaded
4. All filters, sorting, and comparison features work identically with real data

### Programmatic Usage

```typescript
import { realDataService } from '@/lib/realDataService';
import { espnAPI } from '@/lib/espnAPI';
import { espnGameData } from '@/lib/espnGameData';

// Fetch real players
const players = await realDataService.getRealPlayers();

// Get team information
const teams = await realDataService.getRealTeams();

// Access games/scoreboard
const games = await realDataService.getRealGames();

// Check cache status
const cacheInfo = realDataService.getCacheInfo();
console.log(`${cacheInfo.playerCount} players from ${cacheInfo.teamCount} teams`);

// Direct ESPN API usage
const teamsResponse = await espnAPI.getTeams();
const scoreboard = await espnAPI.getScoreboard();
const roster = await espnAPI.getTeamRoster('teamId');

// NEW: Game data service usage
const todaysGames = await espnGameData.getTodaysGames();
const recentGames = await espnGameData.getRecentGames(7); // last 7 days
const boxScore = await espnGameData.getGameBoxScore('gameId');
const playByPlay = await espnGameData.getPlayByPlay('gameId');

// NEW: NCAA API client
import { ncaaAPI } from '@/lib/ncaaAPI';
const ncaaScoreboard = await ncaaAPI.getScoreboard('2024/04/01');
const ncaaBoxScore  = await ncaaAPI.getBoxScore('5931001');
const ncaaPlays     = await ncaaAPI.getPlayByPlay('5931001');
const ncaaStandings = await ncaaAPI.getStandings(2024);
const ncaaRankings  = await ncaaAPI.getRankings(10);

// NEW: Multi-source connector (ESPN primary, NCAA fallback)
import { dataConnector } from '@/lib/dataConnector';
const games     = await dataConnector.getScoreboard('2024-04-01'); // ISO, YYYYMMDD, or YYYY/MM/DD
const boxScore  = await dataConnector.getBoxScore('401234567');
const plays     = await dataConnector.getPlayByPlay('401234567');
const standings = await dataConnector.getStandings(2024);
const rankings  = await dataConnector.getRankings(5);

// Override source priority at runtime
dataConnector.setSources(['ncaa', 'espn']);

// Pin a single call to a specific source
const ncaaBox = await dataConnector.getBoxScore('12345', 'ncaa');


console.log(`${gamesCacheStats.boxScores} box scores, ${gamesCacheStats.playByPlay} PBP cached`);
```

## Data Flow

```
ESPN API                     NCAA API (henrygd/ncaa-api)
   ↓                                  ↓
ESPN API Client              NCAA API Client
(5-min TTL cache)            (5-min TTL cache, 3 req/s limit)
   ↓                                  ↓
         Multi-Source Data Connector
         (configurable priority + fallback)
              ↓  normalise  ↓
         Unified Types (UnifiedGame, UnifiedBoxScore, …)
              ↓
┌────────────────────┬──────────────────────────┐
│                    │                          │
Real Data Service    ESPN Game Data Service     │
(player transform)   (game transform)           │
│                    │                          │
└────────────────────┴──────────────────────────┘
   ↓                     ↓
Player Data Model    Box Score / PBP Models
   ↓                     ↓
UI Components (Players, Comparison, Games, etc.)
```


## API Endpoints Used

### ESPN (primary source)

The integration uses ESPN's public college baseball API endpoints:

- `GET /sports/baseball/college-baseball/teams` — Team directory
- `GET /sports/baseball/college-baseball/teams/{id}/roster` — Team rosters
- `GET /sports/baseball/college-baseball/scoreboard` — Games/schedule
- `GET /sports/baseball/college-baseball/summary?event={id}` — **Game details, box scores, and play-by-play**
- `GET /sports/baseball/college-baseball/standings` — Standings
- `GET /sports/baseball/college-baseball/rankings` — Rankings

**Note**: The `/summary` endpoint is the primary source for real box score data, providing:
- Complete line scores (runs by inning)
- Team statistics (hits, errors, runs)
- Player batting statistics (AB, R, H, RBI, BB, SO, AVG)
- Player pitching statistics (IP, H, R, ER, BB, SO, ERA, pitch counts)
- Game metadata (venue, attendance, status, notes)

### NCAA / henrygd-api (fallback source)

Base URL: `https://ncaa-api.henrygd.me`

| Method | Endpoint | Description |
|---|---|---|
| `getScoreboard(date?)` | `/scoreboard/baseball/d1/{YYYY/MM/DD}/all-conf` | Daily D1 scoreboard |
| `getBoxScore(gameId)` | `/game/{id}/boxscore` | Box score for a game |
| `getPlayByPlay(gameId)` | `/game/{id}/play_by_play` | Play-by-play events |
| `getTeamStats(gameId)` | `/game/{id}/team_stats` | Team stats for a game |
| `getStandings(year?)` | `/standings/baseball/d1/{year}` | Season standings |
| `getRankings(week?)` | `/rankings/baseball/d1/{week}` | Weekly top-25 rankings |

**Known limitations (NCAA source)**:
- Play-by-play events do not expose per-play half-inning; all events default to `'top'` — use ESPN for precise half-inning sequencing
- Standings entries are fully normalised (wins/losses/pct parsed); ESPN standings are best-effort due to the highly nested, season-variable response shape


## Notes & Limitations

### Current Implementation
- Fetches rosters from the first 20 teams to balance coverage vs. API load
- Generates realistic stats based on position (since ESPN may not have full season stats)
- Caches data for 10 minutes to minimize API calls
- Includes both basic stats and advanced sabermetrics

### Future Enhancements
- ✅ **COMPLETED**: Real box score data from ESPN
- ✅ **COMPLETED**: Actual batting and pitching statistics
- ✅ **COMPLETED**: Game scoreboard with live/final status
- ✅ **COMPLETED**: NCAA API client + multi-source connector with ESPN/NCAA fallback
- Historical season data loading (multiple seasons)
- Real-time game updates (live score refresh)
- Enhanced play-by-play visualization
- Win probability graphs
- Persistent storage of fetched data (save to database)

## Configuration

### Cache Settings

Modify cache durations in `src/lib/espnAPI.ts`:

```typescript
private cacheDuration = 5 * 60 * 1000; // 5 minutes
```

And in `src/lib/realDataService.ts`:

```typescript
const CACHE_TTL = 10 * 60 * 1000; // 10 minutes
```

### Team Limit

Adjust the number of teams to fetch in `src/lib/realDataService.ts`:

```typescript
for (const [teamId] of Array.from(cache.teams.entries()).slice(0, 20)) {
  // Change 20 to desired number
}
```

## Error Handling

The system gracefully handles API failures:

- Falls back to mock data if real data fetch fails
- Displays user-friendly error toasts
- Logs detailed errors to console for debugging
- Returns stale cache data if fresh fetch fails but cached data exists

## Performance

- **Initial Load**: ~2-5 seconds (depends on number of teams)
- **Subsequent Loads**: Instant (uses cache)
- **Cache Refresh**: Every 10 minutes
- **API Calls**: Optimized with parallel fetching and caching

## Development

To extend the real data integration:

1. **Add new ESPN endpoints** in `espnAPI.ts`
2. **Add new NCAA endpoints** in `ncaaAPI.ts`
3. **Wire new data types** into `dataConnector.ts` normalisers
4. **Transform new data types** in `realDataService.ts`
5. **Update the Player interface** in `playerData.ts` if needed
6. **Add UI controls** in component files

## References

- [ESPN Public API Documentation](https://site.api.espn.com)
- [henrygd/ncaa-api — MIT-licensed NCAA data proxy](https://github.com/henrygd/ncaa-api)
- [College Baseball Sabermetrics Formulas](https://library.fangraphs.com)
- PRD.md — Full product requirements
