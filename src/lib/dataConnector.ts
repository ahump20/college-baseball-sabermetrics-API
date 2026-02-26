/**
 * Multi-source data connector.
 *
 * Accepts a prioritized list of sources (['espn', 'ncaa']) and attempts the
 * primary source first, falling back to the secondary on failure.  Both
 * ESPN and NCAA response shapes are normalised into a single set of unified
 * internal types so callers never have to deal with source-specific details.
 */

import { espnAPI, type ESPNGame } from './espnAPI';
import { espnGameData, type GameBoxScore, type PlayByPlayEvent } from './espnGameData';
import {
  ncaaAPI,
  type NCAAGame,
  type NCAABoxScoreResponse,
  type NCAAPlayByPlayResponse,
  type NCAAStandingEntry,
  type NCAARankingEntry,
} from './ncaaAPI';

// ─── Unified types ────────────────────────────────────────────────────────────

export interface UnifiedTeamScore {
  id: string;
  displayName: string;
  abbreviation: string;
  score: number;
  /** Runs per inning */
  lineScore: number[];
  record?: string;
  logo?: string;
}

export interface UnifiedGame {
  id: string;
  source: 'espn' | 'ncaa';
  date: string;
  /** Human-readable title, e.g. "Team A vs Team B" */
  title: string;
  /** 'pre' | 'in' | 'post' | 'cancelled' */
  state: string;
  /** Detailed status string, e.g. "Final" or "Top 4th" */
  statusDetail: string;
  home: UnifiedTeamScore;
  away: UnifiedTeamScore;
  venue?: string;
}

export interface UnifiedBoxScore extends GameBoxScore {
  source: 'espn' | 'ncaa';
}

export interface UnifiedPlayByPlayEvent extends PlayByPlayEvent {
  source: 'espn' | 'ncaa';
}

export interface UnifiedStandingEntry {
  source: 'espn' | 'ncaa';
  rank?: number;
  teamName: string;
  conference: string;
  wins: number;
  losses: number;
  winPct: number;
  confWins?: number;
  confLosses?: number;
  gamesBack?: number;
  streak?: string;
}

export interface UnifiedRankingEntry {
  source: 'espn' | 'ncaa';
  rank: number;
  teamName: string;
  record: string;
  previousRank?: number;
  trend?: string;
}

// ─── Source type ──────────────────────────────────────────────────────────────

export type DataSource = 'espn' | 'ncaa';

// ─── Normalisers ──────────────────────────────────────────────────────────────

function normaliseESPNGame(game: ESPNGame): UnifiedGame {
  const competition = game.competitions?.[0];
  const homeComp = competition?.competitors?.find((c) => c.homeAway === 'home');
  const awayComp = competition?.competitors?.find((c) => c.homeAway === 'away');

  const homeRecord = homeComp?.records?.find((r) => r.type === 'total')?.summary;
  const awayRecord = awayComp?.records?.find((r) => r.type === 'total')?.summary;

  const home: UnifiedTeamScore = {
    id: homeComp?.team?.id ?? '',
    displayName: homeComp?.team?.displayName ?? 'Home',
    abbreviation: homeComp?.team?.abbreviation ?? 'HOME',
    score: parseInt(homeComp?.score ?? '0', 10),
    lineScore: [],
    record: homeRecord,
    logo: homeComp?.team?.logos?.[0]?.href,
  };

  const away: UnifiedTeamScore = {
    id: awayComp?.team?.id ?? '',
    displayName: awayComp?.team?.displayName ?? 'Away',
    abbreviation: awayComp?.team?.abbreviation ?? 'AWAY',
    score: parseInt(awayComp?.score ?? '0', 10),
    lineScore: [],
    record: awayRecord,
    logo: awayComp?.team?.logos?.[0]?.href,
  };

  const status = game.status?.type;

  return {
    id: game.id,
    source: 'espn',
    date: game.date,
    title: game.name ?? `${away.displayName} at ${home.displayName}`,
    state: status?.state ?? 'pre',
    statusDetail: status?.detail ?? status?.description ?? '',
    home,
    away,
    venue: undefined,
  };
}

function normaliseNCAAGame(game: NCAAGame): UnifiedGame {
  const home: UnifiedTeamScore = {
    id: game.home.nameSeo ?? game.home.nameShort,
    displayName: game.home.nameShort,
    abbreviation: game.home.nameShort.slice(0, 4).toUpperCase(),
    score: parseInt(game.home.score || '0', 10),
    lineScore: [],
    record: game.home.currentRecord,
  };

  const away: UnifiedTeamScore = {
    id: game.away.nameSeo ?? game.away.nameShort,
    displayName: game.away.nameShort,
    abbreviation: game.away.nameShort.slice(0, 4).toUpperCase(),
    score: parseInt(game.away.score || '0', 10),
    lineScore: [],
    record: game.away.currentRecord,
  };

  // Map NCAA gameState → unified state.
  // 'cancelled' is kept as its own value rather than mapped to 'post' so that
  // callers can distinguish cancelled games from completed ones.
  const stateMap: Record<string, string> = {
    live: 'in',
    final: 'post',
    pre: 'pre',
    cancelled: 'cancelled',
    delayed: 'pre',
  };
  const rawState = (game.gameState ?? '').toLowerCase();
  const state = stateMap[rawState] ?? rawState;

  return {
    id: game.gameID,
    source: 'ncaa',
    date: game.startDate,
    title: game.title ?? `${away.displayName} at ${home.displayName}`,
    state,
    statusDetail: game.currentPeriod ?? game.gameState ?? '',
    home,
    away,
  };
}

function normaliseNCAABoxScore(
  gameId: string,
  data: NCAABoxScoreResponse
): UnifiedBoxScore {
  const teams = data.teams ?? [];

  // Prefer explicit home/away flags if available, fall back to positional order.
  let homeData = teams.find((t) => (t as any).homeAway === 'home');
  let awayData = teams.find((t) => (t as any).homeAway === 'away');

  if (!homeData && teams.length > 1) {
    homeData = teams[1];
  } else if (!homeData && teams.length === 1) {
    homeData = teams[0];
  }

  if (!awayData && teams.length > 0) {
    // Choose a team that is not the identified home team, or default to index 0.
    awayData = teams.find((t) => t !== homeData) ?? teams[0];
  }

  const toPeriodScores = (team: (typeof teams)[number]) =>
    (team?.periodScores ?? []).map((ps) => parseInt(ps.score || '0', 10));

  const home: import('./espnGameData').BoxScoreTeam = {
    id: homeData?.names.seo ?? homeData?.names.short ?? '',
    displayName: homeData?.names.full ?? homeData?.names.short ?? '',
    abbreviation: homeData?.names.char6 ?? homeData?.names.short ?? '',
    color: '000000',
    score: parseInt(homeData?.score || '0', 10),
    hits: parseInt(
      homeData?.stats?.['H'] ?? homeData?.stats?.['hits'] ?? '0',
      10
    ),
    errors: parseInt(
      homeData?.stats?.['E'] ?? homeData?.stats?.['errors'] ?? '0',
      10
    ),
    runs: homeData ? toPeriodScores(homeData) : [],
  };

  const away: import('./espnGameData').BoxScoreTeam = {
    id: awayData?.names.seo ?? awayData?.names.short ?? '',
    displayName: awayData?.names.full ?? awayData?.names.short ?? '',
    abbreviation: awayData?.names.char6 ?? awayData?.names.short ?? '',
    color: '000000',
    score: parseInt(awayData?.score || '0', 10),
    hits: parseInt(
      awayData?.stats?.['H'] ?? awayData?.stats?.['hits'] ?? '0',
      10
    ),
    errors: parseInt(
      awayData?.stats?.['E'] ?? awayData?.stats?.['errors'] ?? '0',
      10
    ),
    runs: awayData ? toPeriodScores(awayData) : [],
  };

  return {
    source: 'ncaa',
    gameId,
    date: data.meta.gameDate,
    status: data.meta.gameState,
    statusDetail: data.meta.currentPeriod ?? data.meta.gameState,
    home,
    away,
    inningCount: Math.max(home.runs.length, away.runs.length, 9),
  };
}

function normaliseNCAAPlayByPlay(
  data: NCAAPlayByPlayResponse
): UnifiedPlayByPlayEvent[] {
  const events: UnifiedPlayByPlayEvent[] = [];

  data.periods.forEach((period) => {
    const inning = parseInt(period.period || '1', 10);
    period.plays.forEach((play, idx) => {
      // NCAA play-by-play doesn't always distinguish top/bottom half
      events.push({
        source: 'ncaa',
        id: `${inning}_${idx}`,
        sequenceNumber: events.length,
        inning,
        // TODO: NCAA play-by-play data does not reliably expose top/bottom half
        // for each play.  All events within a period are provisionally tagged
        // as 'top'; consumers that need precise half-inning data should use
        // the ESPN source instead.
        half: 'top' as const,
        outs: 0,
        text: play.description ?? '',
        type: 'play',
        scoringPlay: Boolean(play.score && String(play.score).trim() !== ''),
      });
    });
  });

  return events;
}

function normaliseNCAAStandings(entries: NCAAStandingEntry[]): UnifiedStandingEntry[] {
  return entries.map((e) => ({
    source: 'ncaa' as const,
    rank: e.rank ? parseInt(e.rank, 10) : undefined,
    teamName: e.teamName,
    conference: e.conference,
    wins: parseInt(e.wins || '0', 10),
    losses: parseInt(e.losses || '0', 10),
    winPct: parseFloat(e.pct || '0'),
    confWins: e.confWins ? parseInt(e.confWins, 10) : undefined,
    confLosses: e.confLosses ? parseInt(e.confLosses, 10) : undefined,
    gamesBack: e.gamesBack ? parseFloat(e.gamesBack) : undefined,
    streak: e.streak,
  }));
}

function normaliseNCAARankings(entries: NCAARankingEntry[]): UnifiedRankingEntry[] {
  return entries.map((e) => ({
    source: 'ncaa' as const,
    rank: parseInt(e.rank || '0', 10),
    teamName: e.teamName,
    record: e.record,
    previousRank: e.previousRank ? parseInt(e.previousRank, 10) : undefined,
    trend: e.trend,
  }));
}

// ─── Connector ────────────────────────────────────────────────────────────────

export class DataConnector {
  private sources: DataSource[];

  constructor(sources: DataSource[] = ['espn', 'ncaa']) {
    this.sources = sources;
  }

  /**
   * Update source priority order at runtime.
   */
  setSources(sources: DataSource[]): void {
    this.sources = sources;
  }

  getSources(): DataSource[] {
    return [...this.sources];
  }

  // --- Scoreboard -------------------------------------------------------------

  async getScoreboard(date?: string): Promise<UnifiedGame[]> {
    // Normalise the input date so callers can pass ISO (YYYY-MM-DD),
    // compact (YYYYMMDD) or NCAA-style (YYYY/MM/DD) while internally
    // converting to each source's expected format.
    let espnDate: string;
    let ncaaDate: string | undefined;

    if (!date) {
      // Preserve existing behaviour:
      // - ESPN: explicitly use today's date in YYYYMMDD.
      // - NCAA: pass undefined so the API can apply its own default.
      const todayIso = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
      espnDate = todayIso.replace(/-/g, '');
      ncaaDate = undefined;
    } else {
      const isoMatch = /^(\d{4})-(\d{2})-(\d{2})$/.exec(date);
      const compactMatch = /^(\d{4})(\d{2})(\d{2})$/.exec(date);
      const slashedMatch = /^(\d{4})\/(\d{2})\/(\d{2})$/.exec(date);

      if (isoMatch) {
        const [, y, m, d] = isoMatch;
        espnDate = `${y}${m}${d}`;
        ncaaDate = `${y}/${m}/${d}`;
      } else if (compactMatch) {
        const [, y, m, d] = compactMatch;
        espnDate = `${y}${m}${d}`;
        ncaaDate = `${y}/${m}/${d}`;
      } else if (slashedMatch) {
        const [, y, m, d] = slashedMatch;
        espnDate = `${y}${m}${d}`;
        ncaaDate = `${y}/${m}/${d}`;
      } else {
        // Fallback: pass through unknown formats unchanged to avoid
        // breaking any existing but unconventional callers.
        espnDate = date;
        ncaaDate = date;
      }
    }

    for (const source of this.sources) {
      try {
        if (source === 'espn') {
          const result = await espnAPI.getScoreboard(espnDate, 100);
          if (result?.events?.length) {
            return result.events.map(normaliseESPNGame);
          }
        } else if (source === 'ncaa') {
          const result = await ncaaAPI.getScoreboard(ncaaDate);
          if (result?.games?.length) {
            return result.games.map(normaliseNCAAGame);
          }
        }
      } catch (err) {
        console.warn(`DataConnector: ${source} scoreboard failed, trying next source`, err);
      }
    }
    return [];
  }

  // --- Box score --------------------------------------------------------------

  async getBoxScore(gameId: string, source?: DataSource): Promise<UnifiedBoxScore | null> {
    const sources = source ? [source] : this.sources;

    for (const src of sources) {
      try {
        if (src === 'espn') {
          const result = await espnGameData.getGameBoxScore(gameId);
          if (result) {
            return { ...result, source: 'espn' };
          }
        } else if (src === 'ncaa') {
          const result = await ncaaAPI.getBoxScore(gameId);
          if (result) {
            return normaliseNCAABoxScore(gameId, result);
          }
        }
      } catch (err) {
        console.warn(`DataConnector: ${src} boxScore failed for ${gameId}, trying next`, err);
      }
    }
    return null;
  }

  // --- Play-by-play -----------------------------------------------------------

  async getPlayByPlay(
    gameId: string,
    source?: DataSource
  ): Promise<UnifiedPlayByPlayEvent[]> {
    const sources = source ? [source] : this.sources;

    for (const src of sources) {
      try {
        if (src === 'espn') {
          const result = await espnGameData.getPlayByPlay(gameId);
          if (result.length) {
            return result.map((e) => ({ ...e, source: 'espn' as const }));
          }
        } else if (src === 'ncaa') {
          const result = await ncaaAPI.getPlayByPlay(gameId);
          if (result) {
            const events = normaliseNCAAPlayByPlay(result);
            if (events.length) return events;
          }
        }
      } catch (err) {
        console.warn(`DataConnector: ${src} playByPlay failed for ${gameId}, trying next`, err);
      }
    }
    return [];
  }

  // --- Standings --------------------------------------------------------------

  async getStandings(
    yearOrSeason?: number,
    source?: DataSource
  ): Promise<UnifiedStandingEntry[]> {
    const sources = source ? [source] : this.sources;

    for (const src of sources) {
      try {
        if (src === 'espn') {
          const result = await espnAPI.getStandings(yearOrSeason);
          if (result) {
            // ESPN standings shape is highly nested and varies across seasons.
            // We extract entries from the first available level (children or
            // standings.entries) and map them into UnifiedStandingEntry.  Fields
            // that ESPN embeds deeper than the top-level entry object will
            // default to empty/zero values; the NCAA source yields fully-parsed
            // entries if more complete data is required.
            const groups: unknown[] = result.children ?? result.standings?.entries ?? [];
            if (groups.length) {
              return (groups as Array<Record<string, unknown>>).map((entry) => ({
                source: 'espn' as const,
                // ESPN standings entries may nest team data one level deeper
                teamName: String(
                  (entry.team as Record<string, unknown>)?.displayName ??
                    entry.displayName ??
                    ''
                ),
                conference: String(
                  (entry.team as Record<string, unknown>)?.conferenceId ?? ''
                ),
                // Overall record is often available as a summary string rather
                // than split win/loss numbers at the top level.
                wins: parseInt(String(entry.wins ?? '0'), 10),
                losses: parseInt(String(entry.losses ?? '0'), 10),
                winPct: parseFloat(String(entry.winPercent ?? entry.pct ?? '0')),
              }));
            }
          }
        } else if (src === 'ncaa') {
          const result = await ncaaAPI.getStandings(yearOrSeason);
          if (result?.standings?.length) {
            return normaliseNCAAStandings(result.standings);
          }
        }
      } catch (err) {
        console.warn(`DataConnector: ${src} standings failed, trying next`, err);
      }
    }
    return [];
  }

  // --- Rankings ---------------------------------------------------------------

  async getRankings(
    week?: number,
    source?: DataSource
  ): Promise<UnifiedRankingEntry[]> {
    const sources = source ? [source] : this.sources;

    for (const src of sources) {
      try {
        if (src === 'espn') {
          const result = await espnAPI.getRankings(week);
          if (result) {
            const rankings: unknown[] =
              result.rankings?.[0]?.ranks ?? result.rankings ?? [];
            if (rankings.length) {
              return (rankings as Array<Record<string, unknown>>).map((r, i) => ({
                source: 'espn' as const,
                rank: i + 1,
                teamName: String(
                  (r.team as Record<string, unknown>)?.displayName ?? ''
                ),
                record: String(r.recordSummary ?? ''),
                previousRank: r.previousRank ? Number(r.previousRank) : undefined,
              }));
            }
          }
        } else if (src === 'ncaa') {
          const result = await ncaaAPI.getRankings(week);
          if (result?.rankings?.length) {
            return normaliseNCAARankings(result.rankings);
          }
        }
      } catch (err) {
        console.warn(`DataConnector: ${src} rankings failed, trying next`, err);
      }
    }
    return [];
  }

  // --- Cache helpers ----------------------------------------------------------

  clearAllCaches(): void {
    espnAPI.clearCache();
    ncaaAPI.clearCache();
  }
}

/** Default singleton connector (ESPN primary, NCAA fallback) */
export const dataConnector = new DataConnector(['espn', 'ncaa']);
