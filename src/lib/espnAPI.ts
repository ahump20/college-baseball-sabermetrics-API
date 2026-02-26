export interface ESPNTeam {
  id: string;
  uid: string;
  slug: string;
  location: string;
  name: string;
  abbreviation: string;
  displayName: string;
  shortDisplayName: string;
  color: string;
  alternateColor: string;
  isActive: boolean;
  logos?: Array<{
    href: string;
    width: number;
    height: number;
  }>;
  links?: Array<{
    href: string;
    text: string;
  }>;
}

export interface ESPNAthlete {
  id: string;
  uid: string;
  guid: string;
  displayName: string;
  shortName: string;
  firstName: string;
  lastName: string;
  fullName: string;
  jersey?: string;
  position?: {
    name: string;
    displayName: string;
    abbreviation: string;
  };
  team?: {
    id: string;
    abbreviation: string;
    displayName: string;
  };
  headshot?: {
    href: string;
    alt: string;
  };
  college?: {
    id: string;
    name: string;
  };
}

export interface ESPNGame {
  id: string;
  uid: string;
  date: string;
  name: string;
  shortName: string;
  season: {
    year: number;
    type: number;
    displayName: string;
  };
  status: {
    type: {
      id: string;
      name: string;
      state: string;
      completed: boolean;
      description: string;
      detail: string;
      shortDetail: string;
    };
  };
  competitions: Array<{
    id: string;
    uid: string;
    date: string;
    attendance: number;
    type: {
      id: string;
      abbreviation: string;
    };
    timeValid: boolean;
    neutralSite: boolean;
    conferenceCompetition: boolean;
    recent: boolean;
    competitors: Array<{
      id: string;
      uid: string;
      type: string;
      order: number;
      homeAway: string;
      winner: boolean;
      team: ESPNTeam;
      score: string;
      statistics?: any[];
      records?: Array<{
        name: string;
        abbreviation: string;
        type: string;
        summary: string;
      }>;
    }>;
    notes?: Array<{
      type: string;
      headline: string;
    }>;
    status: any;
    broadcasts?: any[];
    leaders?: any[];
  }>;
}

export interface ESPNPlayerStats {
  athlete: ESPNAthlete;
  stats: string[];
  categories: Array<{
    name: string;
    displayName: string;
    shortDisplayName: string;
    abbreviation: string;
    summary?: string;
  }>;
}

const ESPN_BASE_URL = 'https://site.api.espn.com/apis/site/v2/sports/baseball/college-baseball';

export class ESPNAPIClient {
  private cache: Map<string, { data: any; timestamp: number }> = new Map();
  private cacheDuration = 5 * 60 * 1000;

  private async fetchWithCache<T>(url: string): Promise<T> {
    const cached = this.cache.get(url);
    const now = Date.now();

    if (cached && now - cached.timestamp < this.cacheDuration) {
      return cached.data as T;
    }

    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`ESPN API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      this.cache.set(url, { data, timestamp: now });
      return data as T;
    } catch (error) {
      console.error('ESPN API fetch error:', error);
      if (cached) {
        console.warn('Returning stale cache data due to fetch error');
        return cached.data as T;
      }
      throw error;
    }
  }

  async getTeams(division?: string, conference?: string): Promise<{ teams: ESPNTeam[] }> {
    let url = `${ESPN_BASE_URL}/teams`;
    const params = new URLSearchParams();

    if (division) {
      params.append('division', division);
    }
    if (conference) {
      params.append('conference', conference);
    }

    if (params.toString()) {
      url += `?${params.toString()}`;
    }

    return this.fetchWithCache<{ teams: ESPNTeam[] }>(url);
  }

  async getTeam(teamId: string): Promise<{ team: ESPNTeam }> {
    const url = `${ESPN_BASE_URL}/teams/${teamId}`;
    return this.fetchWithCache<{ team: ESPNTeam }>(url);
  }

  async getScoreboard(
    date?: string,
    limit: number = 50,
    group?: string
  ): Promise<{ events: ESPNGame[] }> {
    let url = `${ESPN_BASE_URL}/scoreboard`;
    const params = new URLSearchParams({ limit: limit.toString() });

    if (date) {
      params.append('dates', date);
    }
    if (group) {
      params.append('group', group);
    }

    url += `?${params.toString()}`;
    return this.fetchWithCache<{ events: ESPNGame[] }>(url);
  }

  async getGameSummary(gameId: string): Promise<any> {
    const url = `${ESPN_BASE_URL}/summary?event=${gameId}`;
    return this.fetchWithCache<any>(url);
  }

  async getGameBoxScore(gameId: string): Promise<any> {
    const url = `${ESPN_BASE_URL}/summary?event=${gameId}`;
    const data = await this.fetchWithCache<any>(url);
    return data.boxscore || null;
  }

  async getTeamRoster(teamId: string): Promise<{ athletes: ESPNAthlete[] }> {
    const url = `${ESPN_BASE_URL}/teams/${teamId}/roster`;
    return this.fetchWithCache<{ athletes: ESPNAthlete[] }>(url);
  }

  async getStandings(season?: number): Promise<any> {
    let url = `${ESPN_BASE_URL}/standings`;
    if (season) {
      url += `?season=${season}`;
    }
    return this.fetchWithCache<any>(url);
  }

  async getRankings(week?: number): Promise<any> {
    let url = `${ESPN_BASE_URL}/rankings`;
    if (week) {
      url += `?week=${week}`;
    }
    return this.fetchWithCache<any>(url);
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

export const espnAPI = new ESPNAPIClient();
