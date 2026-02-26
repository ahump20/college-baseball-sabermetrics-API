import { useState, useEffect, useRef, useCallback } from 'react';
import { useKV } from '@github/spark/hooks';

export interface ESPNCompetitor {
  id: string;
  uid: string;
  type: string;
  order: number;
  homeAway: 'home' | 'away';
  team: {
    id: string;
    uid: string;
    location: string;
    name: string;
    abbreviation: string;
    displayName: string;
    shortDisplayName: string;
    color: string;
    alternateColor: string;
    logos: Array<{
      href: string;
      width: number;
      height: number;
      alt: string;
      rel: string[];
    }>;
  };
  score: string;
  records?: Array<{
    name: string;
    abbreviation: string;
    type: string;
    summary: string;
  }>;
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
    venue?: {
      id: string;
      fullName: string;
      address: {
        city: string;
        state: string;
      };
    };
    competitors: ESPNCompetitor[];
    status: {
      clock: number;
      displayClock: string;
      period: number;
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
  }>;
  status: {
    clock: number;
    displayClock: string;
    period: number;
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
}

export interface ESPNScoreboardResponse {
  leagues: Array<{
    id: string;
    uid: string;
    name: string;
    abbreviation: string;
    slug: string;
    season: {
      year: number;
      startDate: string;
      endDate: string;
      type: {
        id: string;
        type: number;
        name: string;
        abbreviation: string;
      };
    };
    calendar: string[];
  }>;
  events: ESPNGame[];
}

const REFRESH_INTERVALS = {
  LIVE: 30 * 1000,
  SCHEDULED: 5 * 60 * 1000,
  COMPLETED: 30 * 60 * 1000,
} as const;

export function useESPNScoreboard(date?: string, enableAutoRefresh: boolean = true) {
  const cacheKey = date ? `espn-scoreboard-${date}` : 'espn-scoreboard-today';
  const [games, setGames] = useKV<ESPNGame[]>(cacheKey, []);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useKV<number>(`${cacheKey}-last-updated`, 0);
  const [liveGameCount, setLiveGameCount] = useState(0);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const mountedRef = useRef(true);

  const hasLiveGames = useCallback((gamesList: ESPNGame[]) => {
    return gamesList.some(game => 
      game.status.type.state === 'in' || 
      game.competitions[0]?.status?.type?.state === 'in'
    );
  }, []);

  const getRefreshInterval = useCallback((gamesList: ESPNGame[]) => {
    if (hasLiveGames(gamesList)) {
      return REFRESH_INTERVALS.LIVE;
    }
    
    const hasUpcomingGames = gamesList.some(game => 
      !game.status.type.completed && game.status.type.state === 'pre'
    );
    
    if (hasUpcomingGames) {
      return REFRESH_INTERVALS.SCHEDULED;
    }
    
    return REFRESH_INTERVALS.COMPLETED;
  }, [hasLiveGames]);

  const fetchScoreboard = useCallback(async (silent: boolean = false) => {
    if (!silent) {
      setIsLoading(true);
    }
    setError(null);
    
    try {
      let url = 'https://site.api.espn.com/apis/site/v2/sports/baseball/college-baseball/scoreboard';
      
      if (date) {
        url += `?dates=${date}`;
      }
      
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data: ESPNScoreboardResponse = await response.json();
      
      if (mountedRef.current) {
        if (data.events) {
          setGames(data.events);
          setLastUpdated(Date.now());
          
          const liveCount = data.events.filter(game => 
            game.status.type.state === 'in' || 
            game.competitions[0]?.status?.type?.state === 'in'
          ).length;
          setLiveGameCount(liveCount);
        } else {
          setGames([]);
          setLastUpdated(Date.now());
          setLiveGameCount(0);
        }
      }
    } catch (err) {
      if (mountedRef.current) {
        setError(err instanceof Error ? err.message : 'Failed to fetch scoreboard');
      }
    } finally {
      if (mountedRef.current && !silent) {
        setIsLoading(false);
      }
    }
  }, [date, setGames, setLastUpdated]);

  const setupAutoRefresh = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    if (!enableAutoRefresh || !games) return;

    const interval = getRefreshInterval(games);
    
    intervalRef.current = setInterval(() => {
      fetchScoreboard(true);
    }, interval);
  }, [enableAutoRefresh, games, getRefreshInterval, fetchScoreboard]);

  useEffect(() => {
    mountedRef.current = true;
    fetchScoreboard();

    return () => {
      mountedRef.current = false;
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [date]);

  useEffect(() => {
    setupAutoRefresh();

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [games, enableAutoRefresh, setupAutoRefresh]);

  return {
    games,
    isLoading,
    error,
    lastUpdated,
    liveGameCount,
    hasLiveGames: hasLiveGames(games || []),
    refetch: () => fetchScoreboard(false),
  };
}
