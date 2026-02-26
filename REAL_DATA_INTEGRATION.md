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

### ESPN Game Data Service (`src/lib/espnGameData.ts`)
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

// Check game data cache
const gamesCacheStats = espnGameData.getCacheStats();
console.log(`${gamesCacheStats.boxScores} box scores, ${gamesCacheStats.playByPlay} PBP cached`);
```

## Data Flow

```
ESPN API
   ↓
ESPN API Client (caching layer)
   ↓
┌─────────────────────┬──────────────────────────┐
│                     │                          │
Real Data Service     ESPN Game Data Service     │
(player transformation) (game transformation)    │
│                     │                          │
└─────────────────────┴──────────────────────────┘
   ↓                     ↓
Player Data Model    Box Score / PBP Models
   ↓                     ↓
UI Components (Players, Comparison, Games, etc.)
```

## API Endpoints Used

The integration uses ESPN's public college baseball API endpoints:

- `GET /sports/baseball/college-baseball/teams` - Team directory
- `GET /sports/baseball/college-baseball/teams/{id}/roster` - Team rosters
- `GET /sports/baseball/college-baseball/scoreboard` - Games/schedule
- `GET /sports/baseball/college-baseball/summary?event={id}` - **Game details, box scores, and play-by-play**
- `GET /sports/baseball/college-baseball/standings` - Standings
- `GET /sports/baseball/college-baseball/rankings` - Rankings

**Note**: The `/summary` endpoint is the primary source for real box score data, providing:
- Complete line scores (runs by inning)
- Team statistics (hits, errors, runs)
- Player batting statistics (AB, R, H, RBI, BB, SO, AVG)
- Player pitching statistics (IP, H, R, ER, BB, SO, ERA, pitch counts)
- Game metadata (venue, attendance, status, notes)

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
- Integration with additional data sources (NCAA.org, Sportradar, etc.)
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
2. **Transform new data types** in `realDataService.ts`
3. **Update the Player interface** in `playerData.ts` if needed
4. **Add UI controls** in component files

## References

- [ESPN Public API Documentation](https://site.api.espn.com)
- [College Baseball Sabermetrics Formulas](https://library.fangraphs.com)
- PRD.md - Full product requirements
