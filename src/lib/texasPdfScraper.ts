export interface TexasPlayerStats {
  playerId: string;
  name: string;
  position: string;
  year: string;
  jerseyNumber?: string;
  batting?: {
    gp: number;
    ab: number;
    r: number;
    h: number;
    doubles: number;
    triples: number;
    hr: number;
    rbi: number;
    bb: number;
    so: number;
    sb: number;
    cs: number;
    avg: number;
    obp: number;
    slg: number;
    ops: number;
  };
  pitching?: {
    gp: number;
    gs: number;
    w: number;
    l: number;
    sv: number;
    ip: number;
    h: number;
    r: number;
    er: number;
    bb: number;
    so: number;
    era: number;
    whip: number;
  };
  bio?: {
    height?: string;
    weight?: string;
    hometown?: string;
    highSchool?: string;
    previousSchool?: string;
  };
}

export interface TexasGameResult {
  date: string;
  opponent: string;
  isHome: boolean;
  score: string;
  result: 'W' | 'L';
  innings?: number;
  attendance?: number;
}

export interface TexasTeamStats {
  season: string;
  record: {
    overall: string;
    conference: string;
    home: string;
    away: string;
    neutral: string;
  };
  teamBatting: {
    avg: number;
    obp: number;
    slg: number;
    ops: number;
    runs: number;
    hits: number;
    hr: number;
    rbi: number;
    sb: number;
  };
  teamPitching: {
    era: number;
    whip: number;
    so: number;
    bb: number;
    saves: number;
  };
  players: TexasPlayerStats[];
  schedule: TexasGameResult[];
}

export class TexasPdfScraper {
  private readonly TEXAS_BASE_URL = 'https://texaslonghorns.com';
  private readonly DOCUMENTS_PATH = '/documents';
  
  async fetchPdfText(url: string): Promise<string> {
    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'User-Agent': 'Mozilla/5.0 (compatible; BSI-Scraper/1.0)',
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch PDF: ${response.status} ${response.statusText}`);
      }

      const arrayBuffer = await response.arrayBuffer();
      
      return await this.extractTextFromPdf(arrayBuffer);
    } catch (error) {
      console.error('Error fetching PDF:', error);
      throw error;
    }
  }

  private async extractTextFromPdf(arrayBuffer: ArrayBuffer): Promise<string> {
    const bytes = new Uint8Array(arrayBuffer);
    let text = '';
    
    const decoder = new TextDecoder('utf-8');
    const pdfContent = decoder.decode(bytes);
    
    const streamRegex = /stream\s*([\s\S]*?)\s*endstream/g;
    let match;
    
    while ((match = streamRegex.exec(pdfContent)) !== null) {
      const streamData = match[1];
      const cleanedData = streamData.replace(/[^\x20-\x7E\n\r\t]/g, ' ');
      text += cleanedData + '\n';
    }
    
    const textObjectRegex = /\((.*?)\)\s*Tj/g;
    while ((match = textObjectRegex.exec(pdfContent)) !== null) {
      text += match[1] + ' ';
    }
    
    const textArrayRegex = /\[(.*?)\]\s*TJ/g;
    while ((match = textArrayRegex.exec(pdfContent)) !== null) {
      const items = match[1].split(/\)\s*\(/);
      items.forEach(item => {
        text += item.replace(/[()]/g, '') + ' ';
      });
    }
    
    return text.replace(/\s+/g, ' ').trim();
  }

  async scrapeSeasonStats(pdfUrl: string): Promise<TexasPlayerStats[]> {
    const text = await this.fetchPdfText(pdfUrl);
    return this.parsePlayerStats(text);
  }

  private parsePlayerStats(text: string): TexasPlayerStats[] {
    const players: TexasPlayerStats[] = [];
    
    const lines = text.split('\n').map(line => line.trim()).filter(line => line.length > 0);
    
    let currentSection: 'batting' | 'pitching' | 'bio' | null = null;
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      
      if (line.match(/BATTING\s+STATISTICS/i)) {
        currentSection = 'batting';
        continue;
      }
      if (line.match(/PITCHING\s+STATISTICS/i)) {
        currentSection = 'pitching';
        continue;
      }
      
      if (currentSection === 'batting') {
        const battingMatch = this.parseBattingLine(line);
        if (battingMatch) {
          players.push(battingMatch);
        }
      } else if (currentSection === 'pitching') {
        const pitchingMatch = this.parsePitchingLine(line);
        if (pitchingMatch) {
          const existingPlayer = players.find(p => p.name === pitchingMatch.name);
          if (existingPlayer) {
            existingPlayer.pitching = pitchingMatch.pitching;
          } else {
            players.push(pitchingMatch);
          }
        }
      }
    }
    
    return players;
  }

  private parseBattingLine(line: string): TexasPlayerStats | null {
    const parts = line.split(/\s+/);
    
    if (parts.length < 15) return null;
    
    const nameMatch = line.match(/^(\d+)?\s*([A-Z][a-z]+(?:\s+[A-Z][a-z]+)+)/);
    if (!nameMatch) return null;
    
    const jerseyNumber = nameMatch[1];
    const name = nameMatch[2];
    
    const statsStart = line.indexOf(name) + name.length;
    const statsText = line.substring(statsStart).trim();
    const stats = statsText.split(/\s+/).map(s => s.replace(/[^\d.]/g, '')).filter(s => s.length > 0);
    
    if (stats.length < 15) return null;
    
    return {
      playerId: `texas-${name.toLowerCase().replace(/\s+/g, '-')}`,
      name,
      position: stats[0] || 'Unknown',
      year: 'So',
      jerseyNumber,
      batting: {
        gp: parseInt(stats[1]) || 0,
        ab: parseInt(stats[2]) || 0,
        r: parseInt(stats[3]) || 0,
        h: parseInt(stats[4]) || 0,
        doubles: parseInt(stats[5]) || 0,
        triples: parseInt(stats[6]) || 0,
        hr: parseInt(stats[7]) || 0,
        rbi: parseInt(stats[8]) || 0,
        bb: parseInt(stats[9]) || 0,
        so: parseInt(stats[10]) || 0,
        sb: parseInt(stats[11]) || 0,
        cs: parseInt(stats[12]) || 0,
        avg: parseFloat(stats[13]) || 0.000,
        obp: parseFloat(stats[14]) || 0.000,
        slg: parseFloat(stats[15]) || 0.000,
        ops: parseFloat(stats[16]) || 0.000,
      },
    };
  }

  private parsePitchingLine(line: string): TexasPlayerStats | null {
    const parts = line.split(/\s+/);
    
    if (parts.length < 12) return null;
    
    const nameMatch = line.match(/^(\d+)?\s*([A-Z][a-z]+(?:\s+[A-Z][a-z]+)+)/);
    if (!nameMatch) return null;
    
    const jerseyNumber = nameMatch[1];
    const name = nameMatch[2];
    
    const statsStart = line.indexOf(name) + name.length;
    const statsText = line.substring(statsStart).trim();
    const stats = statsText.split(/\s+/).map(s => s.replace(/[^\d.]/g, '')).filter(s => s.length > 0);
    
    if (stats.length < 12) return null;
    
    return {
      playerId: `texas-${name.toLowerCase().replace(/\s+/g, '-')}`,
      name,
      position: 'P',
      year: 'So',
      jerseyNumber,
      pitching: {
        gp: parseInt(stats[0]) || 0,
        gs: parseInt(stats[1]) || 0,
        w: parseInt(stats[2]) || 0,
        l: parseInt(stats[3]) || 0,
        sv: parseInt(stats[4]) || 0,
        ip: parseFloat(stats[5]) || 0.0,
        h: parseInt(stats[6]) || 0,
        r: parseInt(stats[7]) || 0,
        er: parseInt(stats[8]) || 0,
        bb: parseInt(stats[9]) || 0,
        so: parseInt(stats[10]) || 0,
        era: parseFloat(stats[11]) || 0.00,
        whip: parseFloat(stats[12]) || 0.00,
      },
    };
  }

  async scrapeMediaGuide(pdfUrl: string): Promise<Partial<TexasTeamStats>> {
    const text = await this.fetchPdfText(pdfUrl);
    
    return {
      season: '2026',
      players: this.parsePlayerBios(text),
    };
  }

  private parsePlayerBios(text: string): TexasPlayerStats[] {
    const players: TexasPlayerStats[] = [];
    
    const playerSections = text.split(/(?=\d+\s+[A-Z][A-Z\s]+\n)/);
    
    for (const section of playerSections) {
      const bioMatch = this.parsePlayerBio(section);
      if (bioMatch) {
        players.push(bioMatch);
      }
    }
    
    return players;
  }

  private parsePlayerBio(text: string): TexasPlayerStats | null {
    const nameMatch = text.match(/(\d+)\s+([A-Z][A-Z\s]+)/);
    if (!nameMatch) return null;
    
    const jerseyNumber = nameMatch[1];
    const name = nameMatch[2].trim();
    
    const positionMatch = text.match(/Position:\s*([A-Z]+)/i) || text.match(/\b(P|C|1B|2B|3B|SS|OF|DH|RHP|LHP)\b/);
    const yearMatch = text.match(/Year:\s*(Fr|So|Jr|Sr)/i) || text.match(/\b(Freshman|Sophomore|Junior|Senior)\b/i);
    const heightMatch = text.match(/Height:\s*(\d+[-']\d+)/i) || text.match(/(\d+[-']\d+"?)/);
    const weightMatch = text.match(/Weight:\s*(\d+)/i) || text.match(/(\d{3})\s*lbs?/i);
    const hometownMatch = text.match(/Hometown:\s*([^;\n]+)/i) || text.match(/([A-Z][a-z]+,\s*[A-Z]{2})/);
    const highSchoolMatch = text.match(/High School:\s*([^;\n]+)/i);
    const previousSchoolMatch = text.match(/Previous School:\s*([^;\n]+)/i);
    
    return {
      playerId: `texas-${name.toLowerCase().replace(/\s+/g, '-')}`,
      name,
      position: positionMatch ? positionMatch[1] : 'Unknown',
      year: yearMatch ? this.normalizeYear(yearMatch[1]) : 'So',
      jerseyNumber,
      bio: {
        height: heightMatch ? heightMatch[1] : undefined,
        weight: weightMatch ? weightMatch[1] : undefined,
        hometown: hometownMatch ? hometownMatch[1].trim() : undefined,
        highSchool: highSchoolMatch ? highSchoolMatch[1].trim() : undefined,
        previousSchool: previousSchoolMatch ? previousSchoolMatch[1].trim() : undefined,
      },
    };
  }

  private normalizeYear(year: string): string {
    const yearMap: Record<string, string> = {
      'Freshman': 'Fr',
      'Sophomore': 'So',
      'Junior': 'Jr',
      'Senior': 'Sr',
      'FR': 'Fr',
      'SO': 'So',
      'JR': 'Jr',
      'SR': 'Sr',
    };
    return yearMap[year] || year;
  }

  async scrapeFullTeamData(): Promise<TexasTeamStats> {
    const seasonStatsUrl = `${this.TEXAS_BASE_URL}/documents/2026/2/25/Season-Stats-Feb-24.pdf`;
    const mediaGuideUrl = `${this.TEXAS_BASE_URL}/documents/2026/2/12/2026_Baseball_Media_Guide.pdf`;
    
    const [statsData, bioData] = await Promise.all([
      this.scrapeSeasonStats(seasonStatsUrl).catch(() => [] as TexasPlayerStats[]),
      this.scrapeMediaGuide(mediaGuideUrl).catch(() => ({ players: [] as TexasPlayerStats[] })),
    ]);
    
    const mergedPlayers = this.mergePlayers(statsData, bioData.players || []);
    
    return {
      season: '2026',
      record: {
        overall: '0-0',
        conference: '0-0',
        home: '0-0',
        away: '0-0',
        neutral: '0-0',
      },
      teamBatting: this.calculateTeamBatting(mergedPlayers),
      teamPitching: this.calculateTeamPitching(mergedPlayers),
      players: mergedPlayers,
      schedule: [],
    };
  }

  private mergePlayers(statsPlayers: TexasPlayerStats[], bioPlayers: TexasPlayerStats[]): TexasPlayerStats[] {
    const playerMap = new Map<string, TexasPlayerStats>();
    
    statsPlayers.forEach(player => {
      playerMap.set(player.playerId, player);
    });
    
    bioPlayers.forEach(bioPlayer => {
      const existing = playerMap.get(bioPlayer.playerId);
      if (existing) {
        playerMap.set(bioPlayer.playerId, {
          ...existing,
          bio: bioPlayer.bio,
          year: bioPlayer.year || existing.year,
          position: bioPlayer.position || existing.position,
        });
      } else {
        playerMap.set(bioPlayer.playerId, bioPlayer);
      }
    });
    
    return Array.from(playerMap.values());
  }

  private calculateTeamBatting(players: TexasPlayerStats[]) {
    const battingPlayers = players.filter(p => p.batting);
    
    if (battingPlayers.length === 0) {
      return {
        avg: 0,
        obp: 0,
        slg: 0,
        ops: 0,
        runs: 0,
        hits: 0,
        hr: 0,
        rbi: 0,
        sb: 0,
      };
    }
    
    const totals = battingPlayers.reduce(
      (acc, p) => ({
        ab: acc.ab + (p.batting?.ab || 0),
        h: acc.h + (p.batting?.h || 0),
        r: acc.r + (p.batting?.r || 0),
        hr: acc.hr + (p.batting?.hr || 0),
        rbi: acc.rbi + (p.batting?.rbi || 0),
        sb: acc.sb + (p.batting?.sb || 0),
        bb: acc.bb + (p.batting?.bb || 0),
        tb: acc.tb + ((p.batting?.h || 0) + (p.batting?.doubles || 0) + (p.batting?.triples || 0) * 2 + (p.batting?.hr || 0) * 3),
      }),
      { ab: 0, h: 0, r: 0, hr: 0, rbi: 0, sb: 0, bb: 0, tb: 0 }
    );
    
    const avg = totals.ab > 0 ? totals.h / totals.ab : 0;
    const obp = (totals.ab + totals.bb) > 0 ? (totals.h + totals.bb) / (totals.ab + totals.bb) : 0;
    const slg = totals.ab > 0 ? totals.tb / totals.ab : 0;
    
    return {
      avg: parseFloat(avg.toFixed(3)),
      obp: parseFloat(obp.toFixed(3)),
      slg: parseFloat(slg.toFixed(3)),
      ops: parseFloat((obp + slg).toFixed(3)),
      runs: totals.r,
      hits: totals.h,
      hr: totals.hr,
      rbi: totals.rbi,
      sb: totals.sb,
    };
  }

  private calculateTeamPitching(players: TexasPlayerStats[]) {
    const pitchingPlayers = players.filter(p => p.pitching);
    
    if (pitchingPlayers.length === 0) {
      return {
        era: 0,
        whip: 0,
        so: 0,
        bb: 0,
        saves: 0,
      };
    }
    
    const totals = pitchingPlayers.reduce(
      (acc, p) => ({
        ip: acc.ip + (p.pitching?.ip || 0),
        er: acc.er + (p.pitching?.er || 0),
        h: acc.h + (p.pitching?.h || 0),
        bb: acc.bb + (p.pitching?.bb || 0),
        so: acc.so + (p.pitching?.so || 0),
        sv: acc.sv + (p.pitching?.sv || 0),
      }),
      { ip: 0, er: 0, h: 0, bb: 0, so: 0, sv: 0 }
    );
    
    const era = totals.ip > 0 ? (totals.er * 9) / totals.ip : 0;
    const whip = totals.ip > 0 ? (totals.h + totals.bb) / totals.ip : 0;
    
    return {
      era: parseFloat(era.toFixed(2)),
      whip: parseFloat(whip.toFixed(2)),
      so: totals.so,
      bb: totals.bb,
      saves: totals.sv,
    };
  }

  generateMockData(): TexasTeamStats {
    return {
      season: '2026',
      record: {
        overall: '8-2',
        conference: '2-1',
        home: '5-1',
        away: '3-1',
        neutral: '0-0',
      },
      teamBatting: {
        avg: 0.312,
        obp: 0.398,
        slg: 0.487,
        ops: 0.885,
        runs: 87,
        hits: 112,
        hr: 14,
        rbi: 81,
        sb: 18,
      },
      teamPitching: {
        era: 3.42,
        whip: 1.18,
        so: 98,
        bb: 32,
        saves: 5,
      },
      players: [
        {
          playerId: 'texas-jace-laviolette',
          name: 'Jace LaViolette',
          position: 'OF',
          year: 'Jr',
          jerseyNumber: '17',
          batting: {
            gp: 10,
            ab: 42,
            r: 12,
            h: 18,
            doubles: 4,
            triples: 1,
            hr: 5,
            rbi: 15,
            bb: 8,
            so: 9,
            sb: 3,
            cs: 0,
            avg: 0.429,
            obp: 0.520,
            slg: 0.881,
            ops: 1.401,
          },
          bio: {
            height: '6-2',
            weight: '205',
            hometown: 'Orange, TX',
            highSchool: 'Bridge City HS',
          },
        },
        {
          playerId: 'texas-will-gasparino',
          name: 'Will Gasparino',
          position: 'C',
          year: 'So',
          jerseyNumber: '14',
          batting: {
            gp: 10,
            ab: 38,
            r: 9,
            h: 15,
            doubles: 3,
            triples: 0,
            hr: 2,
            rbi: 11,
            bb: 6,
            so: 7,
            sb: 1,
            cs: 1,
            avg: 0.395,
            obp: 0.467,
            slg: 0.605,
            ops: 1.072,
          },
          bio: {
            height: '6-1',
            weight: '195',
            hometown: 'Katy, TX',
            highSchool: 'Katy HS',
          },
        },
        {
          playerId: 'texas-max-grubbs',
          name: 'Max Grubbs',
          position: 'RHP',
          year: 'Jr',
          jerseyNumber: '19',
          pitching: {
            gp: 3,
            gs: 3,
            w: 2,
            l: 0,
            sv: 0,
            ip: 18.1,
            h: 12,
            r: 4,
            er: 3,
            bb: 4,
            so: 23,
            era: 1.47,
            whip: 0.87,
          },
          bio: {
            height: '6-4',
            weight: '215',
            hometown: 'Austin, TX',
            highSchool: 'Westlake HS',
          },
        },
        {
          playerId: 'texas-lebarron-johnson',
          name: 'Lebarron Johnson Jr.',
          position: 'OF',
          year: 'Jr',
          jerseyNumber: '9',
          batting: {
            gp: 10,
            ab: 36,
            r: 8,
            h: 11,
            doubles: 2,
            triples: 1,
            hr: 1,
            rbi: 7,
            bb: 5,
            so: 8,
            sb: 4,
            cs: 0,
            avg: 0.306,
            obp: 0.390,
            slg: 0.472,
            ops: 0.862,
          },
          bio: {
            height: '6-0',
            weight: '190',
            hometown: 'Houston, TX',
            highSchool: 'Ridge Point HS',
          },
        },
        {
          playerId: 'texas-trey-woosley',
          name: 'Trey Woosley',
          position: 'RHP',
          year: 'So',
          jerseyNumber: '33',
          pitching: {
            gp: 4,
            gs: 0,
            w: 1,
            l: 0,
            sv: 2,
            ip: 6.2,
            h: 3,
            r: 1,
            er: 1,
            bb: 2,
            so: 11,
            era: 1.35,
            whip: 0.75,
          },
          bio: {
            height: '6-3',
            weight: '200',
            hometown: 'Frisco, TX',
            highSchool: 'Wakeland HS',
          },
        },
      ],
      schedule: [
        {
          date: '2026-02-14',
          opponent: 'Louisiana Tech',
          isHome: true,
          score: '7-3',
          result: 'W',
          innings: 9,
          attendance: 7128,
        },
        {
          date: '2026-02-15',
          opponent: 'Louisiana Tech',
          isHome: true,
          score: '12-5',
          result: 'W',
          innings: 9,
          attendance: 6842,
        },
        {
          date: '2026-02-16',
          opponent: 'Louisiana Tech',
          isHome: true,
          score: '8-4',
          result: 'W',
          innings: 9,
          attendance: 7356,
        },
        {
          date: '2026-02-21',
          opponent: 'Rice',
          isHome: false,
          score: '5-4',
          result: 'W',
          innings: 9,
          attendance: 4521,
        },
        {
          date: '2026-02-22',
          opponent: 'Rice',
          isHome: false,
          score: '3-6',
          result: 'L',
          innings: 9,
          attendance: 4187,
        },
        {
          date: '2026-02-23',
          opponent: 'Rice',
          isHome: false,
          score: '9-2',
          result: 'W',
          innings: 9,
          attendance: 3942,
        },
        {
          date: '2026-02-28',
          opponent: 'Oklahoma State',
          isHome: true,
          score: '6-5',
          result: 'W',
          innings: 10,
          attendance: 8234,
        },
        {
          date: '2026-03-01',
          opponent: 'Oklahoma State',
          isHome: true,
          score: '4-8',
          result: 'L',
          innings: 9,
          attendance: 7945,
        },
        {
          date: '2026-03-02',
          opponent: 'Oklahoma State',
          isHome: true,
          score: '11-3',
          result: 'W',
          innings: 9,
          attendance: 8512,
        },
        {
          date: '2026-03-07',
          opponent: 'TCU',
          isHome: false,
          score: '7-6',
          result: 'W',
          innings: 9,
          attendance: 5234,
        },
      ],
    };
  }
}

export const texasPdfScraper = new TexasPdfScraper();
