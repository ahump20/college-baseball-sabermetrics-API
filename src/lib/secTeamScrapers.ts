import { corsProxy } from './corsProxy';

export interface SECTeamConfig {
  id: string;
  name: string;
  shortName: string;
  baseUrl: string;
  statsPdfPattern?: string;
  statsWebPath?: string;
  colors: {
    primary: string;
    secondary: string;
  };
}

export const SEC_TEAMS: Record<string, SECTeamConfig> = {
  TEXAS: {
    id: 'texas',
    name: 'Texas Longhorns',
    shortName: 'Texas',
    baseUrl: 'https://texaslonghorns.com',
    statsPdfPattern: '/documents/*/Season-Stats-*.pdf',
    statsWebPath: '/sports/baseball/stats',
    colors: { primary: '#BF5700', secondary: '#FFFFFF' },
  },
  ALABAMA: {
    id: 'alabama',
    name: 'Alabama Crimson Tide',
    shortName: 'Alabama',
    baseUrl: 'https://rolltide.com',
    statsWebPath: '/sports/baseball/stats',
    colors: { primary: '#9E1B32', secondary: '#FFFFFF' },
  },
  ARKANSAS: {
    id: 'arkansas',
    name: 'Arkansas Razorbacks',
    shortName: 'Arkansas',
    baseUrl: 'https://arkansasrazorbacks.com',
    statsWebPath: '/sports/baseball/stats',
    colors: { primary: '#9D2235', secondary: '#FFFFFF' },
  },
  AUBURN: {
    id: 'auburn',
    name: 'Auburn Tigers',
    shortName: 'Auburn',
    baseUrl: 'https://auburntigers.com',
    statsWebPath: '/sports/baseball/stats',
    colors: { primary: '#0C2340', secondary: '#DD550C' },
  },
  FLORIDA: {
    id: 'florida',
    name: 'Florida Gators',
    shortName: 'Florida',
    baseUrl: 'https://floridagators.com',
    statsWebPath: '/sports/baseball/stats',
    colors: { primary: '#0021A5', secondary: '#FA4616' },
  },
  GEORGIA: {
    id: 'georgia',
    name: 'Georgia Bulldogs',
    shortName: 'Georgia',
    baseUrl: 'https://georgiadogs.com',
    statsWebPath: '/sports/baseball/stats',
    colors: { primary: '#BA0C2F', secondary: '#000000' },
  },
  KENTUCKY: {
    id: 'kentucky',
    name: 'Kentucky Wildcats',
    shortName: 'Kentucky',
    baseUrl: 'https://ukathletics.com',
    statsWebPath: '/sports/baseball/stats',
    colors: { primary: '#0033A0', secondary: '#FFFFFF' },
  },
  LSU: {
    id: 'lsu',
    name: 'LSU Tigers',
    shortName: 'LSU',
    baseUrl: 'https://lsusports.net',
    statsWebPath: '/sports/baseball/stats',
    colors: { primary: '#461D7C', secondary: '#FDD023' },
  },
  MISSISSIPPI_STATE: {
    id: 'mississippi-state',
    name: 'Mississippi State Bulldogs',
    shortName: 'Miss State',
    baseUrl: 'https://hailstate.com',
    statsWebPath: '/sports/baseball/stats',
    colors: { primary: '#5D1725', secondary: '#FFFFFF' },
  },
  MISSOURI: {
    id: 'missouri',
    name: 'Missouri Tigers',
    shortName: 'Missouri',
    baseUrl: 'https://mutigers.com',
    statsWebPath: '/sports/baseball/stats',
    colors: { primary: '#F1B82D', secondary: '#000000' },
  },
  OLE_MISS: {
    id: 'ole-miss',
    name: 'Ole Miss Rebels',
    shortName: 'Ole Miss',
    baseUrl: 'https://olemisssports.com',
    statsWebPath: '/sports/baseball/stats',
    colors: { primary: '#CE1126', secondary: '#14213D' },
  },
  SOUTH_CAROLINA: {
    id: 'south-carolina',
    name: 'South Carolina Gamecocks',
    shortName: 'S Carolina',
    baseUrl: 'https://gamecocksonline.com',
    statsWebPath: '/sports/baseball/stats',
    colors: { primary: '#73000A', secondary: '#000000' },
  },
  TENNESSEE: {
    id: 'tennessee',
    name: 'Tennessee Volunteers',
    shortName: 'Tennessee',
    baseUrl: 'https://utsports.com',
    statsWebPath: '/sports/baseball/stats',
    colors: { primary: '#FF8200', secondary: '#FFFFFF' },
  },
  TEXAS_AM: {
    id: 'texas-am',
    name: 'Texas A&M Aggies',
    shortName: 'Texas A&M',
    baseUrl: 'https://12thman.com',
    statsWebPath: '/sports/baseball/stats',
    colors: { primary: '#500000', secondary: '#FFFFFF' },
  },
  VANDERBILT: {
    id: 'vanderbilt',
    name: 'Vanderbilt Commodores',
    shortName: 'Vanderbilt',
    baseUrl: 'https://vucommodores.com',
    statsWebPath: '/sports/baseball/stats',
    colors: { primary: '#866D4B', secondary: '#000000' },
  },
  OKLAHOMA: {
    id: 'oklahoma',
    name: 'Oklahoma Sooners',
    shortName: 'Oklahoma',
    baseUrl: 'https://soonersports.com',
    statsWebPath: '/sports/baseball/stats',
    colors: { primary: '#841617', secondary: '#FFC72C' },
  },
};

export interface TeamPlayerStats {
  playerId: string;
  name: string;
  position: string;
  year?: string;
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
    sb?: number;
    cs?: number;
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
}

export interface TeamStats {
  teamId: string;
  teamName: string;
  season: string;
  lastUpdated: string;
  record?: {
    overall: string;
    conference: string;
    home?: string;
    away?: string;
  };
  players: TeamPlayerStats[];
  source: 'pdf' | 'web' | 'mock';
}

export class SECTeamScraper {
  private team: SECTeamConfig;
  private pdfjsLib: any = null;

  constructor(teamId: string) {
    const team = Object.values(SEC_TEAMS).find(t => t.id === teamId);
    if (!team) {
      throw new Error(`Team not found: ${teamId}`);
    }
    this.team = team;
  }

  private async ensurePdfJs() {
    if (!this.pdfjsLib) {
      this.pdfjsLib = await import('pdfjs-dist');
      this.pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${this.pdfjsLib.version}/pdf.worker.min.js`;
    }
    return this.pdfjsLib;
  }

  async scrapeTeamStats(): Promise<TeamStats> {
    try {
      const pdfStats = await this.scrapePdfStats();
      if (pdfStats) {
        return pdfStats;
      }
    } catch (error) {
      console.warn(`PDF scraping failed for ${this.team.name}:`, error);
    }

    try {
      const webStats = await this.scrapeWebStats();
      if (webStats) {
        return webStats;
      }
    } catch (error) {
      console.warn(`Web scraping failed for ${this.team.name}:`, error);
    }

    return this.generateMockData();
  }

  private async scrapePdfStats(): Promise<TeamStats | null> {
    if (!this.team.statsPdfPattern) {
      return null;
    }

    try {
      const pdfUrl = await this.discoverPdfUrl();
      if (!pdfUrl) {
        return null;
      }

      const pdfText = await this.fetchPdfText(pdfUrl);
      const players = this.parsePdfStats(pdfText);

      return {
        teamId: this.team.id,
        teamName: this.team.name,
        season: '2026',
        lastUpdated: new Date().toISOString(),
        players,
        source: 'pdf',
      };
    } catch (error) {
      console.error(`PDF scraping failed for ${this.team.name}:`, error);
      return null;
    }
  }

  private async discoverPdfUrl(): Promise<string | null> {
    const year = new Date().getFullYear();
    const month = new Date().getMonth() + 1;
    const day = new Date().getDate();
    
    const possibleUrls = [
      `${this.team.baseUrl}/documents/${year}/${month}/${day}/Season-Stats.pdf`,
      `${this.team.baseUrl}/documents/${year}/${month}/${day}/Baseball-Stats.pdf`,
      `${this.team.baseUrl}/documents/${year}/${month}/${day - 1}/Season-Stats.pdf`,
      `${this.team.baseUrl}/sports/baseball/stats.pdf`,
    ];

    for (const url of possibleUrls) {
      try {
        const response = await fetch(`/api/proxy`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ url, method: 'HEAD' }),
        });
        
        if (response.ok) {
          return url;
        }
      } catch {
        continue;
      }
    }

    return null;
  }

  private async fetchPdfText(url: string): Promise<string> {
    const response = await fetch(`/api/proxy`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url, responseType: 'arrayBuffer' }),
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch PDF: ${response.status}`);
    }

    const result = await response.json();
    if (result.error) {
      throw new Error(result.error);
    }

    const arrayBuffer = this.base64ToArrayBuffer(result.data);
    return await this.extractTextFromPdf(arrayBuffer);
  }

  private base64ToArrayBuffer(base64: string): ArrayBuffer {
    const binaryString = atob(base64);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes.buffer;
  }

  private async extractTextFromPdf(arrayBuffer: ArrayBuffer): Promise<string> {
    try {
      const pdfjs = await this.ensurePdfJs();
      const loadingTask = pdfjs.getDocument({ data: arrayBuffer });
      const pdf = await loadingTask.promise;
      
      let fullText = '';
      
      for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
        const page = await pdf.getPage(pageNum);
        const textContent = await page.getTextContent();
        
        const pageText = textContent.items
          .map((item: any) => item.str)
          .join(' ');
        
        fullText += pageText + '\n';
      }
      
      return fullText;
    } catch (error) {
      console.error('PDF.js extraction failed:', error);
      throw error;
    }
  }

  private parsePdfStats(text: string): TeamPlayerStats[] {
    const players: TeamPlayerStats[] = [];
    const lines = text.split('\n').map(l => l.trim()).filter(l => l.length > 0);
    
    let isBattingSection = false;
    let isPitchingSection = false;

    for (const line of lines) {
      if (line.match(/BATTING\s+STATISTICS/i)) {
        isBattingSection = true;
        isPitchingSection = false;
        continue;
      }
      if (line.match(/PITCHING\s+STATISTICS/i)) {
        isBattingSection = false;
        isPitchingSection = true;
        continue;
      }

      if (isBattingSection) {
        const player = this.parseBattingLine(line);
        if (player) players.push(player);
      } else if (isPitchingSection) {
        const player = this.parsePitchingLine(line);
        if (player) {
          const existing = players.find(p => p.name === player.name);
          if (existing) {
            existing.pitching = player.pitching;
          } else {
            players.push(player);
          }
        }
      }
    }

    return players;
  }

  private parseBattingLine(line: string): TeamPlayerStats | null {
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
      playerId: `${this.team.id}-${name.toLowerCase().replace(/\s+/g, '-')}`,
      name,
      position: stats[0] || 'UTIL',
      year: stats[1],
      jerseyNumber,
      batting: {
        gp: parseInt(stats[2]) || 0,
        ab: parseInt(stats[3]) || 0,
        r: parseInt(stats[4]) || 0,
        h: parseInt(stats[5]) || 0,
        doubles: parseInt(stats[6]) || 0,
        triples: parseInt(stats[7]) || 0,
        hr: parseInt(stats[8]) || 0,
        rbi: parseInt(stats[9]) || 0,
        bb: parseInt(stats[10]) || 0,
        so: parseInt(stats[11]) || 0,
        sb: parseInt(stats[12]) || 0,
        cs: parseInt(stats[13]) || 0,
        avg: parseFloat(stats[14]) || 0.000,
        obp: parseFloat(stats[15]) || 0.000,
        slg: parseFloat(stats[16]) || 0.000,
        ops: parseFloat(stats[17]) || 0.000,
      },
    };
  }

  private parsePitchingLine(line: string): TeamPlayerStats | null {
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
      playerId: `${this.team.id}-${name.toLowerCase().replace(/\s+/g, '-')}`,
      name,
      position: 'P',
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

  private async scrapeWebStats(): Promise<TeamStats | null> {
    const url = `${this.team.baseUrl}${this.team.statsWebPath}`;
    
    try {
      const response = await corsProxy.get(url);
      
      if (!response.ok) {
        return null;
      }

      const html = response.text || '';
      const players = this.parseHtmlStats(html);

      return {
        teamId: this.team.id,
        teamName: this.team.name,
        season: '2026',
        lastUpdated: new Date().toISOString(),
        players,
        source: 'web',
      };
    } catch (error) {
      console.error(`Failed to scrape ${this.team.name}:`, error);
      return null;
    }
  }

  private parseHtmlStats(html: string): TeamPlayerStats[] {
    const players: TeamPlayerStats[] = [];
    
    const tableMatch = html.match(/<table[^>]*class="[^"]*stats[^"]*"[^>]*>(.*?)<\/table>/is);
    if (!tableMatch) return players;

    const rowMatches = tableMatch[1].matchAll(/<tr[^>]*>(.*?)<\/tr>/gis);
    
    for (const rowMatch of rowMatches) {
      const row = rowMatch[1];
      const cells = Array.from(row.matchAll(/<td[^>]*>(.*?)<\/td>/gis)).map(m => 
        m[1].replace(/<[^>]+>/g, '').trim()
      );

      if (cells.length > 5) {
        players.push({
          playerId: `${this.team.id}-${cells[0]?.replace(/\s+/g, '-').toLowerCase() || Math.random()}`,
          name: cells[0] || 'Unknown',
          position: cells[1] || 'UTIL',
          year: cells[2],
          batting: {
            gp: parseInt(cells[3]) || 0,
            ab: parseInt(cells[4]) || 0,
            r: parseInt(cells[5]) || 0,
            h: parseInt(cells[6]) || 0,
            doubles: parseInt(cells[7]) || 0,
            triples: parseInt(cells[8]) || 0,
            hr: parseInt(cells[9]) || 0,
            rbi: parseInt(cells[10]) || 0,
            bb: parseInt(cells[11]) || 0,
            so: parseInt(cells[12]) || 0,
            sb: parseInt(cells[13]) || 0,
            cs: parseInt(cells[14]) || 0,
            avg: parseFloat(cells[15]) || 0,
            obp: parseFloat(cells[16]) || 0,
            slg: parseFloat(cells[17]) || 0,
            ops: parseFloat(cells[18]) || 0,
          },
        });
      }
    }

    return players;
  }

  private generateMockData(): TeamStats {
    const players: TeamPlayerStats[] = [];
    const positions = ['C', '1B', '2B', '3B', 'SS', 'LF', 'CF', 'RF', 'DH', 'P'];
    const years = ['FR', 'SO', 'JR', 'SR'];

    for (let i = 0; i < 25; i++) {
      const isPitcher = i >= 15;
      const firstName = ['Jake', 'Mike', 'Chris', 'Ryan', 'Tyler', 'Josh', 'Matt', 'Brandon', 'Derek', 'Kevin'][i % 10];
      const lastName = ['Johnson', 'Smith', 'Williams', 'Brown', 'Davis', 'Miller', 'Wilson', 'Moore', 'Taylor', 'Anderson'][i % 10];
      
      const player: TeamPlayerStats = {
        playerId: `${this.team.id}-player-${i + 1}`,
        name: `${firstName} ${lastName}`,
        position: positions[i % positions.length],
        year: years[i % years.length],
        jerseyNumber: String(i + 1),
      };

      if (!isPitcher) {
        const ab = 80 + Math.floor(Math.random() * 60);
        const h = Math.floor(ab * (0.200 + Math.random() * 0.200));
        const bb = Math.floor(Math.random() * 20);
        const doubles = Math.floor(h * 0.25);
        const hr = Math.floor(Math.random() * 8);
        const avg = h / ab;
        const obp = (h + bb) / (ab + bb);
        const slg = (h + doubles + hr * 3) / ab;

        player.batting = {
          gp: 25 + Math.floor(Math.random() * 15),
          ab,
          r: Math.floor(Math.random() * 30),
          h,
          doubles,
          triples: Math.floor(Math.random() * 3),
          hr,
          rbi: Math.floor(Math.random() * 35),
          bb,
          so: Math.floor(Math.random() * 40),
          sb: Math.floor(Math.random() * 10),
          cs: Math.floor(Math.random() * 3),
          avg: parseFloat(avg.toFixed(3)),
          obp: parseFloat(obp.toFixed(3)),
          slg: parseFloat(slg.toFixed(3)),
          ops: parseFloat((obp + slg).toFixed(3)),
        };
      } else {
        const ip = 15 + Math.random() * 30;
        const h = Math.floor(ip * (0.8 + Math.random() * 0.4));
        const er = Math.floor(h * 0.3);
        const bb = Math.floor(Math.random() * 15);
        const so = Math.floor(ip * (0.8 + Math.random() * 0.5));
        const era = (er * 9) / ip;
        const whip = (h + bb) / ip;

        player.pitching = {
          gp: 8 + Math.floor(Math.random() * 10),
          gs: Math.floor(Math.random() * 8),
          w: Math.floor(Math.random() * 5),
          l: Math.floor(Math.random() * 4),
          sv: Math.floor(Math.random() * 3),
          ip: parseFloat(ip.toFixed(1)),
          h,
          r: Math.floor(er * 1.2),
          er,
          bb,
          so,
          era: parseFloat(era.toFixed(2)),
          whip: parseFloat(whip.toFixed(2)),
        };
      }

      players.push(player);
    }

    return {
      teamId: this.team.id,
      teamName: this.team.name,
      season: '2026',
      lastUpdated: new Date().toISOString(),
      record: {
        overall: '15-5',
        conference: '3-0',
        home: '10-2',
        away: '5-3',
      },
      players,
      source: 'mock',
    };
  }
}

export async function scrapeAllSECTeams(): Promise<TeamStats[]> {
  const results: TeamStats[] = [];
  
  for (const team of Object.values(SEC_TEAMS)) {
    try {
      const scraper = new SECTeamScraper(team.id);
      const stats = await scraper.scrapeTeamStats();
      results.push(stats);
    } catch (error) {
      console.error(`Failed to scrape ${team.name}:`, error);
    }
  }
  
  return results;
}
