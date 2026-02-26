import { useState, useEffect } from 'react';
import { useKV } from '@github/spark/hooks';

const HIGHLIGHTLY_BASE_URL = 'https://api.highlightly.net';

export interface HighlightlyGame {
  id: string;
  date: string;
  homeTeam: {
    id: string;
    name: string;
    abbreviation: string;
    score?: number;
  };
  awayTeam: {
    id: string;
    name: string;
    abbreviation: string;
    score?: number;
  };
  status: string;
  venue?: string;
  league?: string;
  highlights?: string[];
}

export interface HighlightlyTeam {
  id: string;
  name: string;
  abbreviation: string;
  conference?: string;
  division?: string;
  city?: string;
  state?: string;
  logo?: string;
  colors?: {
    primary: string;
    secondary: string;
  };
}

export interface HighlightlyPlayer {
  id: string;
  name: string;
  firstName: string;
  lastName: string;
  number?: string;
  position?: string;
  teamId?: string;
  team?: string;
  year?: string;
  stats?: Record<string, number | string>;
}

export interface HighlightlyStats {
  playerId: string;
  season: string;
  stats: {
    batting?: {
      avg: number;
      hr: number;
      rbi: number;
      sb: number;
      obp: number;
      slg: number;
      ops: number;
      ab: number;
      h: number;
      r: number;
      bb: number;
      so: number;
    };
    pitching?: {
      era: number;
      w: number;
      l: number;
      sv: number;
      ip: number;
      h: number;
      r: number;
      er: number;
      bb: number;
      so: number;
      whip: number;
    };
  };
}

async function fetchFromHighlightly<T>(endpoint: string, params?: Record<string, string>): Promise<T> {
  const apiKey = await getHighlightlyApiKey();
  
  if (!apiKey) {
    throw new Error('Highlightly API key not configured');
  }

  const url = new URL(`${HIGHLIGHTLY_BASE_URL}${endpoint}`);
  
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      url.searchParams.append(key, value);
    });
  }

  const response = await fetch(url.toString(), {
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error(`Highlightly API error: ${response.status} ${response.statusText}`);
  }

  return response.json();
}

async function getHighlightlyApiKey(): Promise<string | null> {
  try {
    const user = await window.spark.user();
    if (!user?.isOwner) {
      return null;
    }
    
    const secrets = await window.spark.kv.get<any[]>('api-secrets');
    if (!secrets) return null;
    
    const highlightlySecret = secrets.find(s => s.key === 'HIGHLIGHTLY_API_KEY');
    return highlightlySecret?.value || null;
  } catch (error) {
    console.error('Failed to retrieve Highlightly API key:', error);
    return null;
  }
}

export function useHighlightlyGames(date?: string, league: string = 'college-baseball') {
  const cacheKey = date ? `highlightly-games-${league}-${date}` : `highlightly-games-${league}-today`;
  const [games, setGames] = useKV<HighlightlyGame[]>(cacheKey, []);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useKV<number>(`${cacheKey}-last-updated`, 0);

  const fetchGames = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const params: Record<string, string> = { league };
      if (date) {
        params.date = date;
      }
      
      const data = await fetchFromHighlightly<{ games: HighlightlyGame[] }>('/v1/games', params);
      
      setGames(data.games || []);
      setLastUpdated(Date.now());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch games from Highlightly');
      setGames([]);
    } finally {
      setIsLoading(false);
    }
  };

  const shouldRefresh = () => {
    const FIVE_MINUTES = 5 * 60 * 1000;
    return !lastUpdated || Date.now() - lastUpdated > FIVE_MINUTES;
  };

  useEffect(() => {
    if (shouldRefresh()) {
      fetchGames();
    }
  }, [date, league]);

  return {
    games,
    isLoading,
    error,
    lastUpdated,
    refetch: fetchGames,
  };
}

export function useHighlightlyTeams(league: string = 'college-baseball') {
  const cacheKey = `highlightly-teams-${league}`;
  const [teams, setTeams] = useKV<HighlightlyTeam[]>(cacheKey, []);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useKV<number>(`${cacheKey}-last-updated`, 0);

  const fetchTeams = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const data = await fetchFromHighlightly<{ teams: HighlightlyTeam[] }>('/v1/teams', { league });
      
      setTeams(data.teams || []);
      setLastUpdated(Date.now());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch teams from Highlightly');
      setTeams([]);
    } finally {
      setIsLoading(false);
    }
  };

  const shouldRefresh = () => {
    const ONE_HOUR = 60 * 60 * 1000;
    return !lastUpdated || Date.now() - lastUpdated > ONE_HOUR;
  };

  useEffect(() => {
    if (shouldRefresh()) {
      fetchTeams();
    }
  }, [league]);

  return {
    teams,
    isLoading,
    error,
    lastUpdated,
    refetch: fetchTeams,
  };
}

export function useHighlightlyPlayers(teamId?: string, league: string = 'college-baseball') {
  const cacheKey = teamId ? `highlightly-players-${league}-${teamId}` : `highlightly-players-${league}`;
  const [players, setPlayers] = useKV<HighlightlyPlayer[]>(cacheKey, []);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useKV<number>(`${cacheKey}-last-updated`, 0);

  const fetchPlayers = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const params: Record<string, string> = { league };
      if (teamId) {
        params.teamId = teamId;
      }
      
      const data = await fetchFromHighlightly<{ players: HighlightlyPlayer[] }>('/v1/players', params);
      
      setPlayers(data.players || []);
      setLastUpdated(Date.now());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch players from Highlightly');
      setPlayers([]);
    } finally {
      setIsLoading(false);
    }
  };

  const shouldRefresh = () => {
    const ONE_HOUR = 60 * 60 * 1000;
    return !lastUpdated || Date.now() - lastUpdated > ONE_HOUR;
  };

  useEffect(() => {
    if (shouldRefresh()) {
      fetchPlayers();
    }
  }, [teamId, league]);

  return {
    players,
    isLoading,
    error,
    lastUpdated,
    refetch: fetchPlayers,
  };
}

export function useHighlightlyPlayerStats(playerId: string, season?: string) {
  const cacheKey = season ? `highlightly-stats-${playerId}-${season}` : `highlightly-stats-${playerId}`;
  const [stats, setStats] = useKV<HighlightlyStats | null>(cacheKey, null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useKV<number>(`${cacheKey}-last-updated`, 0);

  const fetchStats = async () => {
    if (!playerId) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const params: Record<string, string> = {};
      if (season) {
        params.season = season;
      }
      
      const data = await fetchFromHighlightly<HighlightlyStats>(`/v1/players/${playerId}/stats`, params);
      
      setStats(data);
      setLastUpdated(Date.now());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch player stats from Highlightly');
      setStats(null);
    } finally {
      setIsLoading(false);
    }
  };

  const shouldRefresh = () => {
    const THIRTY_MINUTES = 30 * 60 * 1000;
    return !lastUpdated || Date.now() - lastUpdated > THIRTY_MINUTES;
  };

  useEffect(() => {
    if (playerId && shouldRefresh()) {
      fetchStats();
    }
  }, [playerId, season]);

  return {
    stats,
    isLoading,
    error,
    lastUpdated,
    refetch: fetchStats,
  };
}

export function useHighlightlyGameDetails(gameId: string) {
  const cacheKey = `highlightly-game-${gameId}`;
  const [game, setGame] = useKV<HighlightlyGame | null>(cacheKey, null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useKV<number>(`${cacheKey}-last-updated`, 0);

  const fetchGameDetails = async () => {
    if (!gameId) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const data = await fetchFromHighlightly<HighlightlyGame>(`/v1/games/${gameId}`);
      
      setGame(data);
      setLastUpdated(Date.now());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch game details from Highlightly');
      setGame(null);
    } finally {
      setIsLoading(false);
    }
  };

  const shouldRefresh = () => {
    const TWO_MINUTES = 2 * 60 * 1000;
    return !lastUpdated || Date.now() - lastUpdated > TWO_MINUTES;
  };

  useEffect(() => {
    if (gameId && shouldRefresh()) {
      fetchGameDetails();
    }
  }, [gameId]);

  return {
    game,
    isLoading,
    error,
    lastUpdated,
    refetch: fetchGameDetails,
  };
}

export function useHighlightlyStandings(league: string = 'college-baseball', conference?: string) {
  const cacheKey = conference ? `highlightly-standings-${league}-${conference}` : `highlightly-standings-${league}`;
  const [standings, setStandings] = useKV<any[]>(cacheKey, []);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useKV<number>(`${cacheKey}-last-updated`, 0);

  const fetchStandings = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const params: Record<string, string> = { league };
      if (conference) {
        params.conference = conference;
      }
      
      const data = await fetchFromHighlightly<{ standings: any[] }>('/v1/standings', params);
      
      setStandings(data.standings || []);
      setLastUpdated(Date.now());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch standings from Highlightly');
      setStandings([]);
    } finally {
      setIsLoading(false);
    }
  };

  const shouldRefresh = () => {
    const ONE_HOUR = 60 * 60 * 1000;
    return !lastUpdated || Date.now() - lastUpdated > ONE_HOUR;
  };

  useEffect(() => {
    if (shouldRefresh()) {
      fetchStandings();
    }
  }, [league, conference]);

  return {
    standings,
    isLoading,
    error,
    lastUpdated,
    refetch: fetchStandings,
  };
}
