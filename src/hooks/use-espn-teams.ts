import { useState, useEffect } from 'react';
import { useKV } from '@github/spark/hooks';

export interface ESPNTeam {
  id: string;
  uid: string;
  slug: string;
  abbreviation: string;
  displayName: string;
  shortDisplayName: string;
  name: string;
  nickname: string;
  location: string;
  color: string;
  alternateColor: string;
  isActive: boolean;
  logos: Array<{
    href: string;
    width: number;
    height: number;
    alt: string;
    rel: string[];
  }>;
  links: Array<{
    language: string;
    rel: string[];
    href: string;
    text: string;
    shortText: string;
    isExternal: boolean;
    isPremium: boolean;
  }>;
}

export interface ESPNTeamsResponse {
  sports: Array<{
    leagues: Array<{
      teams: ESPNTeam[];
    }>;
  }>;
}

export function useESPNTeams() {
  const [teams, setTeams] = useKV<ESPNTeam[]>('espn-teams', []);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useKV<number>('espn-teams-last-updated', 0);

  const fetchTeams = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch(
        'https://site.api.espn.com/apis/site/v2/sports/baseball/college-baseball/teams?limit=400'
      );
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data: ESPNTeamsResponse = await response.json();
      
      if (data.sports?.[0]?.leagues?.[0]?.teams) {
        const teamsList = data.sports[0].leagues[0].teams;
        setTeams(teamsList);
        setLastUpdated(Date.now());
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch teams');
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
  }, []);

  return {
    teams,
    isLoading,
    error,
    lastUpdated,
    refetch: fetchTeams,
  };
}
