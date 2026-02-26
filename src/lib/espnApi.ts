// ESPN Public API integration for college baseball data
// Uses the unofficial but publicly accessible ESPN API endpoints

const ESPN_BASE_URL = 'https://site.api.espn.com/apis/site/v2/sports/baseball/college-baseball';

export interface ESPNTeam {
  id: string;
  displayName: string;
  shortDisplayName: string;
  abbreviation: string;
  conference?: string;
  logos?: { href: string }[];
}

export interface ESPNAthlete {
  id: string;
  displayName: string;
  position: { abbreviation: string };
  team?: { displayName: string; shortDisplayName: string };
  jersey?: string;
  experience?: { displayName: string };
}

export interface ESPNTeamsResponse {
  sports: {
    leagues: {
      teams: { team: ESPNTeam }[];
    }[];
  }[];
}

export interface ESPNRosterResponse {
  athletes: {
    items: ESPNAthlete[];
    position: string;
  }[];
  team: ESPNTeam;
  season: { year: number; displayName: string };
}

export interface ESPNScoreboardResponse {
  events: {
    id: string;
    name: string;
    date: string;
    competitions: {
      competitors: {
        team: { displayName: string; abbreviation: string };
        score: string;
        homeAway: string;
      }[];
      status: { type: { completed: boolean } };
    }[];
  }[];
}

/**
 * Fetch all college baseball teams from ESPN
 */
export async function fetchTeams(): Promise<ESPNTeam[]> {
  const response = await fetch(`${ESPN_BASE_URL}/teams?limit=400`);
  if (!response.ok) {
    throw new Error(`ESPN API error: ${response.status}`);
  }
  const data: ESPNTeamsResponse = await response.json();
  return data.sports?.[0]?.leagues?.[0]?.teams?.map(t => t.team) ?? [];
}

/**
 * Fetch roster for a specific team
 */
export async function fetchTeamRoster(teamId: string, season?: number): Promise<ESPNRosterResponse> {
  const params = season ? `?season=${season}` : '';
  const response = await fetch(`${ESPN_BASE_URL}/teams/${teamId}/roster${params}`);
  if (!response.ok) {
    throw new Error(`ESPN API error: ${response.status}`);
  }
  return response.json();
}

/**
 * Fetch today's scoreboard
 */
export async function fetchScoreboard(date?: string): Promise<ESPNScoreboardResponse> {
  const params = date ? `?dates=${date}` : '';
  const response = await fetch(`${ESPN_BASE_URL}/scoreboard${params}`);
  if (!response.ok) {
    throw new Error(`ESPN API error: ${response.status}`);
  }
  return response.json();
}

/**
 * Known ESPN team IDs for major college baseball programs
 * These map to the ESPN API's internal numeric team IDs
 */
export const KNOWN_TEAM_IDS: Record<string, string> = {
  'Georgia': '61',
  'Oregon State': '204',
  'Florida': '57',
  'North Carolina': '153',
  'Wake Forest': '154',
  'Texas A&M': '245',
  'Arkansas': '8',
  'Mississippi State': '344',
  'LSU': '99',
  'Vanderbilt': '238',
  'Tennessee': '2633',
  'Texas': '251',
  'Clemson': '228',
  'Stanford': '24',
  'Virginia': '258',
  'Ole Miss': '145',
};
