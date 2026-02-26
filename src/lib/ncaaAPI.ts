// NCAA API client for https://ncaa-api.henrygd.me (MIT-licensed, free public API)

const NCAA_BASE_URL = 'https://ncaa-api.henrygd.me';

// --- Response shape interfaces ---

export interface NCAATeam {
  nameShort: string;
  nameSeo: string;
  score: string;
  description: string;
  conferences: string[];
  isTop25: boolean;
  currentRecord: string;
  logoUrl?: string;
}

export interface NCAAGame {
  gameID: string;
  title: string;
  url: string;
  startDate: string;
  startTime: string;
  startTimeEpoch: string;
  bracketRound?: string;
  bracketId?: string;
  gameState: string;
  startTimeTBD: boolean;
  currentPeriod: string;
  videoState?: string;
  home: NCAATeam;
  away: NCAATeam;
  contestId?: string;
}

export interface NCAAScoreboardResponse {
  games: NCAAGame[];
}

// Box score

export interface NCAABoxScoreTeamStats {
  [statName: string]: string;
}

export interface NCAABoxScoreTeam {
  names: {
    char6: string;
    short: string;
    full: string;
    seo: string;
  };
  score: string;
  stats: NCAABoxScoreTeamStats;
  periodScores: Array<{ score: string; period: string }>;
}

export interface NCAABoxScoreResponse {
  meta: {
    gameID: string;
    gameDate: string;
    gameState: string;
    sport: string;
    startTime: string;
    currentPeriod: string;
  };
  teams: [NCAABoxScoreTeam, NCAABoxScoreTeam];
}

// Play-by-play

export interface NCAAPlayEvent {
  period: string;
  time?: string;
  description: string;
  score?: string;
  team?: string;
}

export interface NCAAPlayByPlayResponse {
  meta: {
    gameID: string;
    gameDate: string;
    gameState: string;
  };
  periods: Array<{
    period: string;
    plays: NCAAPlayEvent[];
  }>;
}

// Team stats

export interface NCAATeamStatsResponse {
  meta: {
    gameID: string;
    gameDate: string;
  };
  teams: Array<{
    names: {
      char6: string;
      short: string;
      full: string;
      seo: string;
    };
    stats: NCAABoxScoreTeamStats;
  }>;
}

// Standings

export interface NCAAStandingEntry {
  rank?: string;
  teamName: string;
  teamSeo: string;
  conference: string;
  wins: string;
  losses: string;
  pct: string;
  gamesBack?: string;
  confWins?: string;
  confLosses?: string;
  streak?: string;
}

export interface NCAAStandingsResponse {
  standings: NCAAStandingEntry[];
}

// Rankings

export interface NCAARankingEntry {
  rank: string;
  teamName: string;
  teamSeo: string;
  record: string;
  previousRank?: string;
  trend?: string;
}

export interface NCAARankingsResponse {
  rankings: NCAARankingEntry[];
}

// --- Rate limiter: max 3 req/s (conservative for a 5 req/s public limit) ---

class RateLimiter {
  private queue: Array<() => void> = [];
  private running = 0;
  private readonly maxPerSecond: number;
  private lastWindowStart = Date.now();
  private countInWindow = 0;

  constructor(maxPerSecond: number) {
    this.maxPerSecond = maxPerSecond;
  }

  async acquire(): Promise<void> {
    return new Promise((resolve) => {
      this.queue.push(resolve);
      this.tryDispatch();
    });
  }

  private tryDispatch() {
    const now = Date.now();
    if (now - this.lastWindowStart >= 1000) {
      this.lastWindowStart = now;
      this.countInWindow = 0;
    }

    while (this.queue.length > 0 && this.countInWindow < this.maxPerSecond) {
      const next = this.queue.shift()!;
      this.countInWindow++;
      next();
    }

    if (this.queue.length > 0) {
      const delay = 1000 - (now - this.lastWindowStart);
      setTimeout(() => this.tryDispatch(), delay);
    }
  }
}

// --- NCAA API client ---

export class NCAAAPIClient {
  private cache: Map<string, { data: unknown; timestamp: number }> = new Map();
  private cacheDuration = 5 * 60 * 1000; // 5 minutes
  private rateLimiter = new RateLimiter(3);

  private async fetchWithCache<T>(url: string): Promise<T | null> {
    const cached = this.cache.get(url);
    const now = Date.now();

    if (cached && now - cached.timestamp < this.cacheDuration) {
      return cached.data as T;
    }

    await this.rateLimiter.acquire();

    try {
      const response = await fetch(url);
      if (!response.ok) {
        console.error(`NCAA API error: ${response.status} ${response.statusText} — ${url}`);
        if (cached) {
          console.warn('Returning stale cache data due to fetch error');
          return cached.data as T;
        }
        return null;
      }

      const data = await response.json();
      this.cache.set(url, { data, timestamp: now });
      return data as T;
    } catch (error) {
      console.error('NCAA API fetch error:', error);
      if (cached) {
        console.warn('Returning stale cache data due to fetch error');
        return cached.data as T;
      }
      return null;
    }
  }

  /**
   * Get daily D1 scoreboard.
   * @param date  YYYY/MM/DD  (defaults to today)
   */
  async getScoreboard(date?: string): Promise<NCAAScoreboardResponse | null> {
    const d = date ?? new Date().toISOString().slice(0, 10).replace(/-/g, '/');
    const url = `${NCAA_BASE_URL}/scoreboard/baseball/d1/${d}/all-conf`;
    return this.fetchWithCache<NCAAScoreboardResponse>(url);
  }

  /**
   * Get box score for a specific game.
   */
  async getBoxScore(gameId: string): Promise<NCAABoxScoreResponse | null> {
    const url = `${NCAA_BASE_URL}/game/${gameId}/boxscore`;
    return this.fetchWithCache<NCAABoxScoreResponse>(url);
  }

  /**
   * Get play-by-play for a specific game.
   */
  async getPlayByPlay(gameId: string): Promise<NCAAPlayByPlayResponse | null> {
    const url = `${NCAA_BASE_URL}/game/${gameId}/play_by_play`;
    return this.fetchWithCache<NCAAPlayByPlayResponse>(url);
  }

  /**
   * Get team stats for a specific game.
   */
  async getTeamStats(gameId: string): Promise<NCAATeamStatsResponse | null> {
    const url = `${NCAA_BASE_URL}/game/${gameId}/team_stats`;
    return this.fetchWithCache<NCAATeamStatsResponse>(url);
  }

  /**
   * Get season standings.
   * @param year  4-digit year (defaults to current year)
   */
  async getStandings(year?: number): Promise<NCAAStandingsResponse | null> {
    const y = year ?? new Date().getFullYear();
    const url = `${NCAA_BASE_URL}/standings/baseball/d1/${y}`;
    return this.fetchWithCache<NCAAStandingsResponse>(url);
  }

  /**
   * Get weekly rankings.
   * @param week  Week number (defaults to 1)
   */
  async getRankings(week?: number): Promise<NCAARankingsResponse | null> {
    const w = week ?? 1;
    const url = `${NCAA_BASE_URL}/rankings/baseball/d1/${w}`;
    return this.fetchWithCache<NCAARankingsResponse>(url);
  }

  clearCache(): void {
    this.cache.clear();
  }

  getCacheStats(): { size: number; entries: string[] } {
    return {
      size: this.cache.size,
      entries: Array.from(this.cache.keys()),
    };
  }
}

export const ncaaAPI = new NCAAAPIClient();
