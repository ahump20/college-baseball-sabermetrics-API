import { useState, useEffect } from 'react';
import { useKV } from '@github/spark/hooks';

export interface TeamRoster {
  id: string;
  uid: string;
  guid: string;
  firstName: string;
  lastName: string;
  fullName: string;
  displayName: string;
  shortName: string;
  weight: number;
  displayWeight: string;
  height: number;
  displayHeight: string;
  age: number;
  dateOfBirth: string;
  headshot?: {
    href: string;
    alt: string;
  };
  jersey: string;
  position: {
    id: string;
    name: string;
    displayName: string;
    abbreviation: string;
  };
  experience?: {
    years: number;
  };
}

export interface TeamStats {
  name: string;
  displayName: string;
  shortDisplayName: string;
  description: string;
  abbreviation: string;
  type: string;
  value: number;
  displayValue: string;
}

export interface TeamDetailsResponse {
  team: {
    id: string;
    uid: string;
    slug: string;
    location: string;
    name: string;
    nickname: string;
    abbreviation: string;
    displayName: string;
    shortDisplayName: string;
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
    record?: {
      items: Array<{
        summary: string;
        stats: Array<{
          name: string;
          value: number;
        }>;
      }>;
    };
    standingSummary?: string;
    links: Array<{
      language: string;
      rel: string[];
      href: string;
      text: string;
      shortText: string;
      isExternal: boolean;
      isPremium: boolean;
    }>;
    nextEvent?: Array<{
      id: string;
      date: string;
      name: string;
      shortName: string;
      competitions: Array<{
        competitors: Array<{
          id: string;
          team: {
            location: string;
          };
        }>;
      }>;
    }>;
  };
  athletes?: TeamRoster[];
  statistics?: TeamStats[];
}

export function useTeamDetails(teamId: string | null) {
  const cacheKey = teamId ? `team-details-${teamId}` : 'no-team';
  const [teamDetails, setTeamDetails] = useKV<TeamDetailsResponse | null>(cacheKey, null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useKV<number>(`${cacheKey}-last-updated`, 0);

  const fetchTeamDetails = async () => {
    if (!teamId) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch(
        `https://site.api.espn.com/apis/site/v2/sports/baseball/college-baseball/teams/${teamId}`
      );
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data: TeamDetailsResponse = await response.json();
      setTeamDetails(data);
      setLastUpdated(Date.now());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch team details');
    } finally {
      setIsLoading(false);
    }
  };

  const shouldRefresh = () => {
    const ONE_HOUR = 60 * 60 * 1000;
    return !lastUpdated || Date.now() - lastUpdated > ONE_HOUR;
  };

  useEffect(() => {
    if (teamId && shouldRefresh()) {
      fetchTeamDetails();
    }
  }, [teamId]);

  return {
    teamDetails,
    isLoading,
    error,
    lastUpdated,
    refetch: fetchTeamDetails,
  };
}
