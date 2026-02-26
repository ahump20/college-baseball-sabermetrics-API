import { espnAPI, type ESPNGame } from './espnAPI';

export interface BoxScoreTeam {
  id: string;
  displayName: string;
  abbreviation: string;
  color: string;
  logo?: string;
  score: number;
  hits: number;
  errors: number;
  runs: number[];
}

export interface BoxScorePlayer {
  id: string;
  displayName: string;
  jersey?: string;
  position?: string;
  stats: {
    batting?: {
      AB: number;
      R: number;
      H: number;
      RBI: number;
      BB: number;
      SO: number;
      AVG: string;
      '2B'?: number;
      '3B'?: number;
      HR?: number;
      SB?: number;
      CS?: number;
      LOB?: number;
      HBP?: number;
      SF?: number;
      SAC?: number;
      GDP?: number;
      OBP?: string;
      SLG?: string;
      OPS?: string;
    };
    pitching?: {
      IP: string;
      H: number;
      R: number;
      ER: number;
      BB: number;
      SO: number;
      ERA: string;
      pitches?: number;
      strikes?: number;
      HR?: number;
      HBP?: number;
      WP?: number;
      BK?: number;
      WHIP?: string;
      K9?: string;
      BB9?: string;
    };
  };
}

export interface GameBoxScore {
  gameId: string;
  date: string;
  status: string;
  statusDetail: string;
  venue?: string;
  attendance?: number;
  home: BoxScoreTeam;
  away: BoxScoreTeam;
  homeRoster?: BoxScorePlayer[];
  awayRoster?: BoxScorePlayer[];
  inningCount: number;
  notes?: string[];
}

export interface PlayByPlayEvent {
  id: string;
  sequenceNumber: number;
  inning: number;
  half: 'top' | 'bottom';
  outs: number;
  balls?: number;
  strikes?: number;
  text: string;
  shortText?: string;
  type: string;
  scoringPlay: boolean;
  runnerAction?: boolean;
  timestamp?: string;
}

class ESPNGameDataService {
  private static instance: ESPNGameDataService;
  private boxScoreCache: Map<string, { data: GameBoxScore; timestamp: number }> = new Map();
  private pbpCache: Map<string, { data: PlayByPlayEvent[]; timestamp: number }> = new Map();
  private cacheDuration = 2 * 60 * 1000;

  static getInstance(): ESPNGameDataService {
    if (!ESPNGameDataService.instance) {
      ESPNGameDataService.instance = new ESPNGameDataService();
    }
    return ESPNGameDataService.instance;
  }

  async getTodaysGames(): Promise<ESPNGame[]> {
    const today = new Date().toISOString().split('T')[0].replace(/-/g, '');
    const scoreboard = await espnAPI.getScoreboard(today, 100);
    return scoreboard.events || [];
  }

  async getRecentGames(days: number = 7): Promise<ESPNGame[]> {
    const games: ESPNGame[] = [];
    const today = new Date();

    for (let i = 0; i < days; i++) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0].replace(/-/g, '');

      try {
        const scoreboard = await espnAPI.getScoreboard(dateStr, 100);
        if (scoreboard.events) {
          games.push(...scoreboard.events);
        }
      } catch (error) {
        console.warn(`Failed to fetch games for ${dateStr}:`, error);
      }
    }

    return games;
  }

  async getGameBoxScore(gameId: string, useCache: boolean = true): Promise<GameBoxScore | null> {
    if (useCache) {
      const cached = this.boxScoreCache.get(gameId);
      if (cached && Date.now() - cached.timestamp < this.cacheDuration) {
        return cached.data;
      }
    }

    try {
      const summary = await espnAPI.getGameSummary(gameId);
      
      if (!summary || !summary.boxscore) {
        console.warn(`No boxscore data for game ${gameId}`);
        return null;
      }

      const boxScore = this.transformBoxScore(gameId, summary);
      
      this.boxScoreCache.set(gameId, {
        data: boxScore,
        timestamp: Date.now(),
      });

      return boxScore;
    } catch (error) {
      console.error(`Error fetching box score for game ${gameId}:`, error);
      return null;
    }
  }

  private transformBoxScore(gameId: string, summary: any): GameBoxScore {
    const header = summary.header || {};
    const competition = header.competitions?.[0] || {};
    const competitors = competition.competitors || [];
    const boxscore = summary.boxscore || {};
    const teams = boxscore.teams || [];
    const players = boxscore.players || [];

    const homeCompetitor = competitors.find((c: any) => c.homeAway === 'home') || {};
    const awayCompetitor = competitors.find((c: any) => c.homeAway === 'away') || {};
    
    const homeTeamData = teams.find((t: any) => t.team?.id === homeCompetitor.team?.id) || {};
    const awayTeamData = teams.find((t: any) => t.team?.id === awayCompetitor.team?.id) || {};

    const homeStats = homeTeamData.statistics || [];
    const awayStats = awayTeamData.statistics || [];

    const homeRuns = this.extractLinescoreRuns(homeCompetitor.linescores);
    const awayRuns = this.extractLinescoreRuns(awayCompetitor.linescores);

    const home: BoxScoreTeam = {
      id: homeCompetitor.team?.id || '',
      displayName: homeCompetitor.team?.displayName || 'Home',
      abbreviation: homeCompetitor.team?.abbreviation || 'HOME',
      color: homeCompetitor.team?.color || '000000',
      logo: homeCompetitor.team?.logo,
      score: parseInt(homeCompetitor.score || '0', 10),
      hits: this.findStat(homeStats, 'hits') || 0,
      errors: this.findStat(homeStats, 'errors') || 0,
      runs: homeRuns,
    };

    const away: BoxScoreTeam = {
      id: awayCompetitor.team?.id || '',
      displayName: awayCompetitor.team?.displayName || 'Away',
      abbreviation: awayCompetitor.team?.abbreviation || 'AWAY',
      color: awayCompetitor.team?.color || '000000',
      logo: awayCompetitor.team?.logo,
      score: parseInt(awayCompetitor.score || '0', 10),
      hits: this.findStat(awayStats, 'hits') || 0,
      errors: this.findStat(awayStats, 'errors') || 0,
      runs: awayRuns,
    };

    const homeRoster = this.extractPlayerStats(
      players.find((p: any) => p.team?.id === home.id)
    );
    const awayRoster = this.extractPlayerStats(
      players.find((p: any) => p.team?.id === away.id)
    );

    return {
      gameId,
      date: competition.date || header.season?.year || '',
      status: competition.status?.type?.name || 'Unknown',
      statusDetail: competition.status?.type?.detail || '',
      venue: competition.venue?.fullName,
      attendance: competition.attendance,
      home,
      away,
      homeRoster,
      awayRoster,
      inningCount: Math.max(homeRuns.length, awayRuns.length, 9),
      notes: competition.notes?.map((n: any) => n.headline),
    };
  }

  private extractLinescoreRuns(linescores: any[] = []): number[] {
    return linescores.map((ls) => parseInt(ls.value || '0', 10));
  }

  private findStat(statistics: any[], name: string): number | null {
    const stat = statistics.find((s) => s.name === name);
    return stat ? parseFloat(stat.displayValue) : null;
  }

  private extractPlayerStats(teamData: any): BoxScorePlayer[] | undefined {
    if (!teamData || !teamData.statistics) return undefined;

    const players: BoxScorePlayer[] = [];
    
    const battingStats = teamData.statistics.find((s: any) => s.type === 'batting');
    const pitchingStats = teamData.statistics.find((s: any) => s.type === 'pitching');

    if (battingStats?.athletes) {
      battingStats.athletes.forEach((athlete: any) => {
        const stats = athlete.stats || [];
        players.push({
          id: athlete.athlete?.id || '',
          displayName: athlete.athlete?.displayName || 'Unknown',
          jersey: athlete.athlete?.jersey,
          position: athlete.athlete?.position?.abbreviation,
          stats: {
            batting: {
              AB: parseInt(stats[0] || '0', 10),
              R: parseInt(stats[1] || '0', 10),
              H: parseInt(stats[2] || '0', 10),
              RBI: parseInt(stats[3] || '0', 10),
              BB: parseInt(stats[4] || '0', 10),
              SO: parseInt(stats[5] || '0', 10),
              AVG: stats[6] || '.000',
            },
          },
        });
      });
    }

    if (pitchingStats?.athletes) {
      pitchingStats.athletes.forEach((athlete: any) => {
        const stats = athlete.stats || [];
        const existingPlayer = players.find((p) => p.id === athlete.athlete?.id);
        
        const pitchingData = {
          IP: stats[0] || '0.0',
          H: parseInt(stats[1] || '0', 10),
          R: parseInt(stats[2] || '0', 10),
          ER: parseInt(stats[3] || '0', 10),
          BB: parseInt(stats[4] || '0', 10),
          SO: parseInt(stats[5] || '0', 10),
          ERA: stats[6] || '0.00',
          pitches: stats[7] ? parseInt(stats[7], 10) : undefined,
        };

        if (existingPlayer) {
          existingPlayer.stats.pitching = pitchingData;
        } else {
          players.push({
            id: athlete.athlete?.id || '',
            displayName: athlete.athlete?.displayName || 'Unknown',
            jersey: athlete.athlete?.jersey,
            position: athlete.athlete?.position?.abbreviation,
            stats: {
              pitching: pitchingData,
            },
          });
        }
      });
    }

    return players.length > 0 ? players : undefined;
  }

  async getPlayByPlay(gameId: string, useCache: boolean = true): Promise<PlayByPlayEvent[]> {
    if (useCache) {
      const cached = this.pbpCache.get(gameId);
      if (cached && Date.now() - cached.timestamp < this.cacheDuration) {
        return cached.data;
      }
    }

    try {
      const summary = await espnAPI.getGameSummary(gameId);
      
      if (!summary || !summary.plays) {
        console.warn(`No play-by-play data for game ${gameId}`);
        return [];
      }

      const events = this.transformPlayByPlay(summary.plays);
      
      this.pbpCache.set(gameId, {
        data: events,
        timestamp: Date.now(),
      });

      return events;
    } catch (error) {
      console.error(`Error fetching play-by-play for game ${gameId}:`, error);
      return [];
    }
  }

  private transformPlayByPlay(plays: any[]): PlayByPlayEvent[] {
    const events: PlayByPlayEvent[] = [];

    plays.forEach((play, index) => {
      const inning = play.period?.number || 1;
      const half = play.homeAway === 'home' ? 'bottom' : 'top';

      events.push({
        id: play.id || `play_${index}`,
        sequenceNumber: play.sequenceNumber || index,
        inning,
        half,
        outs: play.outsAfterPlay || 0,
        balls: play.ballCount,
        strikes: play.strikeCount,
        text: play.text || '',
        shortText: play.shortText,
        type: play.type?.text || 'Unknown',
        scoringPlay: play.scoringPlay || false,
        runnerAction: play.runnerAction || false,
        timestamp: play.wallclock,
      });
    });

    return events;
  }

  clearCache(): void {
    this.boxScoreCache.clear();
    this.pbpCache.clear();
  }

  getCacheStats(): { boxScores: number; playByPlay: number } {
    return {
      boxScores: this.boxScoreCache.size,
      playByPlay: this.pbpCache.size,
    };
  }
}

export const espnGameData = ESPNGameDataService.getInstance();
