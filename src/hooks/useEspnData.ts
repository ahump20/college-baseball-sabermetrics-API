import { useState, useEffect } from 'react';
import { type Player, realPlayers } from '@/lib/playerData';
import { espnAPI, type ESPNTeam } from '@/lib/espnAPI';

interface UseEspnDataResult {
  players: Player[];
  teams: ESPNTeam[];
  isLoading: boolean;
  /** Indicates whether the ESPN team list was successfully fetched ('espn') or only embedded data is used ('embedded'). Players are always from the embedded 2024 dataset. */
  teamsSource: 'espn' | 'embedded';
  error: string | null;
}

/**
 * Hook that provides real player data.
 * Attempts to fetch team list from ESPN at runtime to enrich data.
 * Falls back to embedded real data (sourced from 2024 NCAA season) if ESPN is unreachable.
 */
export function useEspnData(): UseEspnDataResult {
  const [teams, setTeams] = useState<ESPNTeam[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [teamsSource, setTeamsSource] = useState<'espn' | 'embedded'>('embedded');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function loadData() {
      try {
        const response = await espnAPI.getTeams();
        if (!cancelled && response.teams?.length > 0) {
          setTeams(response.teams);
          setTeamsSource('espn');
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Failed to fetch ESPN data');
          setTeamsSource('embedded');
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    }

    loadData();

    return () => {
      cancelled = true;
    };
  }, []);

  return {
    players: realPlayers,
    teams,
    isLoading,
    teamsSource,
    error,
  };
}
