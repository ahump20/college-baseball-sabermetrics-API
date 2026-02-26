import { useState, useEffect } from 'react';
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

export function useESPNScoreboard(date?: string) {
  const cacheKey = date ? `espn-scoreboard-${date}` : 'espn-scoreboard-today';
  const [games, setGames] = useKV<ESPNGame[]>(cacheKey, []);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useKV<number>(`${cacheKey}-last-updated`, 0);

  const fetchScoreboard = async () => {
    setIsLoading(true);
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
      
      if (data.events) {
        setGames(data.events);
        setLastUpdated(Date.now());
      } else {
        setGames([]);
        setLastUpdated(Date.now());
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch scoreboard');
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
      fetchScoreboard();
    }
  }, [date]);

  return {
    games,
    isLoading,
    error,
    lastUpdated,
    refetch: fetchScoreboard,
  };
}
