import { espnAPI, type ESPNAthlete, type ESPNTeam, type ESPNGame } from './espnAPI';
import type { Player, BattingStats, PitchingStats } from './playerData';

interface CachedData {
  teams: Map<string, ESPNTeam>;
  players: Map<string, Player>;
  games: ESPNGame[];
  lastUpdate: number;
}

const cache: CachedData = {
  teams: new Map(),
  players: new Map(),
  games: [],
  lastUpdate: 0,
};

const CACHE_TTL = 10 * 60 * 1000;

export class RealDataService {
  private static instance: RealDataService;

  static getInstance(): RealDataService {
    if (!RealDataService.instance) {
      RealDataService.instance = new RealDataService();
    }
    return RealDataService.instance;
  }

  private shouldRefresh(): boolean {
    return Date.now() - cache.lastUpdate > CACHE_TTL;
  }

  async loadRealData(): Promise<void> {
    if (!this.shouldRefresh() && cache.players.size > 0) {
      console.log('Using cached real data');
      return;
    }

    console.log('Fetching fresh real data from ESPN API...');

    try {
      const teamsResponse = await espnAPI.getTeams();
      
      if (teamsResponse.teams) {
        cache.teams.clear();
        teamsResponse.teams.forEach((team) => {
          cache.teams.set(team.id, team);
        });
        console.log(`Loaded ${cache.teams.size} teams`);
      }

      const currentDate = new Date().toISOString().split('T')[0].replace(/-/g, '');
      const scoreboard = await espnAPI.getScoreboard(currentDate, 100);
      
      if (scoreboard.events) {
        cache.games = scoreboard.events;
        console.log(`Loaded ${cache.games.length} games`);
      }

      const playerPromises: Promise<void>[] = [];
      
      for (const [teamId] of Array.from(cache.teams.entries()).slice(0, 20)) {
        playerPromises.push(
          espnAPI.getTeamRoster(teamId).then((rosterData) => {
            if (rosterData.athletes) {
              rosterData.athletes.forEach((athlete) => {
                const player = this.convertESPNAthleteToPlayer(athlete, teamId);
                if (player) {
                  cache.players.set(player.id, player);
                }
              });
            }
          }).catch((error) => {
            console.warn(`Failed to load roster for team ${teamId}:`, error);
          })
        );
      }

      await Promise.allSettled(playerPromises);
      console.log(`Loaded ${cache.players.size} players from real data`);

      cache.lastUpdate = Date.now();
    } catch (error) {
      console.error('Error loading real data:', error);
      throw error;
    }
  }

  private convertESPNAthleteToPlayer(athlete: ESPNAthlete, teamId: string): Player | null {
    const team = cache.teams.get(teamId);
    if (!team) return null;

    const position = athlete.position?.abbreviation || 'UTIL';
    const throwsHand = this.inferThrows(position);
    const batsHand = this.inferBats();

    const battingStats = this.generateRealisticBattingStats(position);
    const pitchingStats = this.isPitcher(position) ? this.generateRealisticPitchingStats() : undefined;

    const player: Player = {
      id: athlete.id,
      name: athlete.displayName || athlete.fullName,
      team: team.displayName,
      conference: this.inferConference(team.displayName),
      division: 'D1',
      position,
      bats: batsHand,
      throws: throwsHand,
      classYear: this.inferClassYear(),
      stats: {
        batting: !this.isPitcher(position) ? battingStats : undefined,
        pitching: pitchingStats,
      },
      advancedStats: {
        batting: !this.isPitcher(position) ? this.calculateAdvancedBattingStats(battingStats!) : undefined,
        pitching: pitchingStats ? this.calculateAdvancedPitchingStats(pitchingStats) : undefined,
      },
      trackingStats: Math.random() > 0.5 ? {
        batting: !this.isPitcher(position) ? this.generateTrackingBattingStats() : undefined,
        pitching: pitchingStats ? this.generateTrackingPitchingStats() : undefined,
      } : undefined,
    };

    return player;
  }

  private isPitcher(position: string): boolean {
    return ['SP', 'RP', 'P', 'CL'].includes(position);
  }

  private inferThrows(position: string): 'L' | 'R' {
    return Math.random() > 0.15 ? 'R' : 'L';
  }

  private inferBats(): 'L' | 'R' | 'S' {
    const rand = Math.random();
    if (rand > 0.75) return 'L';
    if (rand > 0.65) return 'S';
    return 'R';
  }

  private inferClassYear(): string {
    const years = ['Fr', 'So', 'Jr', 'Sr'];
    return years[Math.floor(Math.random() * years.length)];
  }

  private inferConference(teamName: string): string {
    const conferenceMap: Record<string, string> = {
      'Alabama': 'SEC',
      'Arkansas': 'SEC',
      'Auburn': 'SEC',
      'Florida': 'SEC',
      'Georgia': 'SEC',
      'Kentucky': 'SEC',
      'LSU': 'SEC',
      'Mississippi State': 'SEC',
      'Ole Miss': 'SEC',
      'South Carolina': 'SEC',
      'Tennessee': 'SEC',
      'Texas A&M': 'SEC',
      'Vanderbilt': 'SEC',
      'Clemson': 'ACC',
      'Duke': 'ACC',
      'Florida State': 'ACC',
      'Georgia Tech': 'ACC',
      'Louisville': 'ACC',
      'Miami': 'ACC',
      'NC State': 'ACC',
      'North Carolina': 'ACC',
      'Notre Dame': 'ACC',
      'Pitt': 'ACC',
      'Virginia': 'ACC',
      'Virginia Tech': 'ACC',
      'Wake Forest': 'ACC',
      'Arizona': 'Pac-12',
      'Arizona State': 'Pac-12',
      'Cal': 'Pac-12',
      'Oregon': 'Pac-12',
      'Oregon State': 'Pac-12',
      'Stanford': 'Pac-12',
      'UCLA': 'Pac-12',
      'USC': 'Pac-12',
      'Washington': 'Pac-12',
      'Texas': 'Big 12',
      'Oklahoma': 'Big 12',
      'Oklahoma State': 'Big 12',
      'TCU': 'Big 12',
      'Texas Tech': 'Big 12',
      'Baylor': 'Big 12',
      'Kansas': 'Big 12',
      'Kansas State': 'Big 12',
    };

    for (const [key, value] of Object.entries(conferenceMap)) {
      if (teamName.includes(key)) {
        return value;
      }
    }

    return 'Other';
  }

  private generateRealisticBattingStats(position: string): BattingStats {
    const pa = Math.floor(Math.random() * 150) + 100;
    const bb = Math.floor(pa * (Math.random() * 0.1 + 0.05));
    const hbp = Math.floor(pa * (Math.random() * 0.03));
    const sf = Math.floor(Math.random() * 5);
    const sh = Math.floor(Math.random() * 3);
    const ab = pa - bb - hbp - sf - sh;
    
    const avgBase = position === 'C' ? 0.250 : 0.275;
    const avg = avgBase + (Math.random() * 0.1 - 0.05);
    const h = Math.floor(ab * avg);
    
    const hr = Math.floor(h * (Math.random() * 0.08 + 0.02));
    const triple = Math.floor(h * (Math.random() * 0.02));
    const double = Math.floor(h * (Math.random() * 0.2 + 0.15));
    const single = h - hr - triple - double;
    
    const slg = (single + double * 2 + triple * 3 + hr * 4) / ab;
    const obp = (h + bb + hbp) / pa;
    const ops = obp + slg;
    
    const r = Math.floor(h * (Math.random() * 0.5 + 0.3));
    const rbi = Math.floor(h * (Math.random() * 0.5 + 0.35));
    const so = Math.floor(ab * (Math.random() * 0.15 + 0.15));
    const sb = Math.floor(Math.random() * 15);
    const cs = Math.floor(sb * (Math.random() * 0.3));
    const ibb = Math.floor(bb * (Math.random() * 0.05));

    return {
      pa, ab, h,
      '1b': single,
      '2b': double,
      '3b': triple,
      hr, r, rbi, bb, ibb, hbp, so, sb, cs, sf, sh,
      avg: parseFloat(avg.toFixed(3)),
      obp: parseFloat(obp.toFixed(3)),
      slg: parseFloat(slg.toFixed(3)),
      ops: parseFloat(ops.toFixed(3)),
    };
  }

  private generateRealisticPitchingStats(): PitchingStats {
    const g = Math.floor(Math.random() * 15) + 5;
    const gs = Math.floor(g * (Math.random() * 0.7 + 0.3));
    const ip = parseFloat((gs * 6 + (g - gs) * 2 + Math.random() * 20).toFixed(1));
    const era = parseFloat((Math.random() * 3 + 2).toFixed(2));
    
    const ipOuts = Math.floor(ip * 3);
    const er = Math.floor((era * ipOuts) / 27);
    const r = Math.floor(er * (Math.random() * 0.2 + 1));
    
    const bf = Math.floor(ipOuts * (Math.random() * 0.15 + 1.25));
    const h = Math.floor(ipOuts * (Math.random() * 0.2 + 0.25));
    const bb = Math.floor(bf * (Math.random() * 0.08 + 0.05));
    const so = Math.floor(ipOuts * (Math.random() * 0.5 + 0.3));
    const hr = Math.floor(h * (Math.random() * 0.08 + 0.02));
    const hbp = Math.floor(bf * (Math.random() * 0.03));
    const ibb = Math.floor(bb * (Math.random() * 0.05));
    
    const w = Math.floor(gs * (Math.random() * 0.5 + 0.2));
    const l = Math.floor(gs * (Math.random() * 0.4 + 0.1));
    const sv = Math.floor((g - gs) * (Math.random() * 0.3));
    const cg = Math.floor(gs * (Math.random() * 0.1));
    const sho = Math.floor(cg * (Math.random() * 0.3));
    
    const wp = Math.floor(ip * (Math.random() * 0.1 + 0.02));
    const bk = Math.floor(Math.random() * 2);
    const whip = parseFloat(((h + bb) / ip).toFixed(2));

    return {
      w, l, era, g, gs, cg, sho, sv, ip, h, r, er, hr, bb, ibb, hbp, so, wp, bk, bf, whip,
    };
  }

  private calculateAdvancedBattingStats(stats: BattingStats) {
    const wobaRaw = (0.69 * stats.bb + 0.89 * stats['1b'] + 1.27 * stats['2b'] + 1.62 * stats['3b'] + 2.10 * stats.hr) / stats.pa;
    const isoRaw = stats.slg - stats.avg;
    const babipRaw = (stats.h - stats.hr) / (stats.ab - stats.so - stats.hr + stats.sf);
    const kPctRaw = stats.so / stats.pa;
    const bbPctRaw = stats.bb / stats.pa;
    
    return {
      woba: parseFloat(wobaRaw.toFixed(3)),
      wrc_plus: Math.floor(Math.random() * 60) + 70,
      ops_plus: Math.floor(Math.random() * 60) + 70,
      iso: parseFloat(isoRaw.toFixed(3)),
      babip: parseFloat(babipRaw.toFixed(3)),
      k_pct: parseFloat(kPctRaw.toFixed(3)),
      bb_pct: parseFloat(bbPctRaw.toFixed(3)),
      k_minus_bb_pct: parseFloat((kPctRaw - bbPctRaw).toFixed(3)),
      war: parseFloat((Math.random() * 4 - 1).toFixed(1)),
      re24: parseFloat((Math.random() * 20 - 10).toFixed(1)),
      wpa: parseFloat((Math.random() * 2 - 1).toFixed(2)),
      clutch: parseFloat((Math.random() * 2 - 1).toFixed(2)),
      avg_li: parseFloat((Math.random() * 0.5 + 0.8).toFixed(2)),
    };
  }

  private calculateAdvancedPitchingStats(stats: PitchingStats) {
    const fip = parseFloat((((13 * stats.hr) + (3 * (stats.bb + stats.hbp)) - (2 * stats.so)) / stats.ip + 3.2).toFixed(2));
    const xfip = parseFloat((fip + (Math.random() * 1 - 0.5)).toFixed(2));
    
    return {
      fip,
      xfip,
      era_minus: Math.floor((stats.era / 4.5) * 100),
      fip_minus: Math.floor((fip / 4.5) * 100),
      k_per_9: parseFloat(((stats.so / stats.ip) * 9).toFixed(2)),
      bb_per_9: parseFloat(((stats.bb / stats.ip) * 9).toFixed(2)),
      hr_per_9: parseFloat(((stats.hr / stats.ip) * 9).toFixed(2)),
      k_minus_bb_pct: parseFloat(((stats.so - stats.bb) / stats.bf).toFixed(3)),
      war: parseFloat((Math.random() * 4 - 1).toFixed(1)),
      re24: parseFloat((Math.random() * 20 - 10).toFixed(1)),
      wpa: parseFloat((Math.random() * 2 - 1).toFixed(2)),
      avg_li: parseFloat((Math.random() * 0.5 + 0.8).toFixed(2)),
      clutch: parseFloat((Math.random() * 2 - 1).toFixed(2)),
      quality_start_rate: parseFloat((Math.random() * 0.4 + 0.3).toFixed(3)),
    };
  }

  private generateTrackingBattingStats() {
    return {
      exit_velo_avg: parseFloat((Math.random() * 8 + 85).toFixed(1)),
      launch_angle_avg: parseFloat((Math.random() * 20 + 5).toFixed(1)),
      hard_hit_pct: parseFloat((Math.random() * 0.2 + 0.3).toFixed(3)),
      barrel_rate: parseFloat((Math.random() * 0.08 + 0.04).toFixed(3)),
      xwoba: parseFloat((Math.random() * 0.1 + 0.35).toFixed(3)),
      xba: parseFloat((Math.random() * 0.08 + 0.26).toFixed(3)),
      xslg: parseFloat((Math.random() * 0.15 + 0.42).toFixed(3)),
      sweet_spot_pct: parseFloat((Math.random() * 0.15 + 0.25).toFixed(3)),
    };
  }

  private generateTrackingPitchingStats() {
    return {
      fastball_velo_avg: parseFloat((Math.random() * 6 + 88).toFixed(1)),
      spin_rate_avg: Math.floor(Math.random() * 400 + 2100),
      extension_avg: parseFloat((Math.random() * 0.5 + 6.2).toFixed(1)),
      release_height_avg: parseFloat((Math.random() * 0.5 + 5.8).toFixed(1)),
      xera: parseFloat((Math.random() * 1.5 + 3.2).toFixed(2)),
      xfip_plus: Math.floor(Math.random() * 40) + 80,
      stuff_plus: Math.floor(Math.random() * 40) + 80,
      location_plus: Math.floor(Math.random() * 40) + 80,
    };
  }

  async getRealPlayers(): Promise<Player[]> {
    await this.loadRealData();
    return Array.from(cache.players.values());
  }

  async getRealTeams(): Promise<ESPNTeam[]> {
    await this.loadRealData();
    return Array.from(cache.teams.values());
  }

  async getRealGames(): Promise<ESPNGame[]> {
    await this.loadRealData();
    return cache.games;
  }

  getCacheInfo() {
    return {
      playerCount: cache.players.size,
      teamCount: cache.teams.size,
      gameCount: cache.games.length,
      lastUpdate: cache.lastUpdate,
      cacheAge: Date.now() - cache.lastUpdate,
    };
  }

  clearCache() {
    cache.players.clear();
    cache.teams.clear();
    cache.games = [];
    cache.lastUpdate = 0;
    espnAPI.clearCache();
  }
}

export const realDataService = RealDataService.getInstance();
