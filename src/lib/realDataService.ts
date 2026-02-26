import { espnAPI, type ESPNTeam, type ESPNGame } from './espnAPI';
import { realPlayers, type Player } from './playerData';

interface CachedData {
  teams: Map<string, ESPNTeam>;
  players: Player[];
  games: ESPNGame[];
  lastUpdate: number;
}

const cache: CachedData = {
  teams: new Map(),
  players: [],
  games: [],
  lastUpdate: 0,
};

const CACHE_TTL = 10 * 60 * 1000;

export class RealDataService {
  private static instance: RealDataService;

  static getInstance(): RealDataService {
    if (!RealDataService.instance) {
      RealDataService.instance = new RealDataService();
    }
    return RealDataService.instance;
  }

  private shouldRefresh(): boolean {
    return Date.now() - cache.lastUpdate > CACHE_TTL;
  }

  async loadRealData(): Promise<void> {
    // Always use embedded real player data (sourced from 2024 NCAA season)
    cache.players = [...realPlayers];

    if (!this.shouldRefresh()) {
      return;
    }

    try {
      const teamsResponse = await espnAPI.getTeams();

      if (teamsResponse.teams) {
        cache.teams.clear();
        teamsResponse.teams.forEach((team) => {
          cache.teams.set(team.id, team);
        });
      }

      const currentDate = new Date().toISOString().split('T')[0].replace(/-/g, '');
      const scoreboard = await espnAPI.getScoreboard(currentDate, 100);

      if (scoreboard.events) {
        cache.games = scoreboard.events;
      }

      cache.lastUpdate = Date.now();
    } catch (error) {
      console.warn('ESPN API unavailable, using embedded real data:', error);
      // Embedded player data is already set above, so the app still works
      // Prevent tight retry loops by updating the cache timestamp even on failure
      cache.lastUpdate = Date.now();
    }
  }

  async getRealPlayers(): Promise<Player[]> {
    await this.loadRealData();
    return cache.players.slice();
  }

  async getRealTeams(): Promise<ESPNTeam[]> {
    await this.loadRealData();
    return Array.from(cache.teams.values());
  }

  async getRealGames(): Promise<ESPNGame[]> {
    await this.loadRealData();
    return cache.games;
  }

  getCacheInfo() {
    return {
      playerCount: cache.players.length,
      teamCount: cache.teams.size,
      gameCount: cache.games.length,
      lastUpdate: cache.lastUpdate,
      cacheAge: Date.now() - cache.lastUpdate,
    };
  }

  clearCache() {
    cache.teams.clear();
    cache.games = [];
    cache.lastUpdate = 0;
    espnAPI.clearCache();
  }
}

export const realDataService = RealDataService.getInstance();
