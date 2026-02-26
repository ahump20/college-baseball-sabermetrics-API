import { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import {
  User,
  Baseball,
  TrendUp,
  ChartBar,
  Lightning,
  Target,
  TrendDown,
  ArrowUp,
  ArrowDown,
  CaretDown,
  CalendarBlank,
  Trophy,
  ListNumbers,
  MagnifyingGlass,
  ArrowLeft,
  CloudArrowDown,
} from '@phosphor-icons/react';
import { mockPlayers, type Player } from '@/lib/playerData';
import { realDataService } from '@/lib/realDataService';
import { toast } from 'sonner';

interface SeasonStats {
  season: string;
  year: number;
  team: string;
  conference: string;
  division: string;
  games: number;
  stats: {
    batting?: any;
    pitching?: any;
  };
  advancedStats: {
    batting?: any;
    pitching?: any;
  };
  trackingStats?: {
    batting?: any;
    pitching?: any;
  };
}

export function PlayerProfile() {
  const [selectedPlayer, setSelectedPlayer] = useState<Player | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [playerType, setPlayerType] = useState<'batting' | 'pitching'>('batting');
  const [useRealData, setUseRealData] = useState(false);
  const [realPlayers, setRealPlayers] = useState<Player[]>([]);
  const [loading, setLoading] = useState(false);

  const currentPlayers = useRealData ? realPlayers : mockPlayers;

  const loadRealPlayerData = async () => {
    setLoading(true);
    try {
      const players = await realDataService.getRealPlayers();
      setRealPlayers(players);
      const cacheInfo = realDataService.getCacheInfo();
      toast.success(`Loaded ${cacheInfo.playerCount} real players from ${cacheInfo.teamCount} teams via ESPN API`);
    } catch (error) {
      console.error('Error loading real data:', error);
      toast.error('Failed to load real data. Using mock data instead.');
      setUseRealData(false);
    } finally {
      setLoading(false);
    }
  };

  const filteredPlayers = useMemo(() => {
    if (!searchQuery) return currentPlayers;
    const query = searchQuery.toLowerCase();
    return currentPlayers.filter(
      (p) =>
        p.name.toLowerCase().includes(query) ||
        p.team.toLowerCase().includes(query) ||
        p.conference.toLowerCase().includes(query)
    );
  }, [currentPlayers, searchQuery]);

  const generateSeasonHistory = (player: Player): SeasonStats[] => {
    const currentYear = 2025;
    const yearsActive = player.classYear === 'Fr' ? 1 : player.classYear === 'So' ? 2 : player.classYear === 'Jr' ? 3 : 4;
    
    const seasons: SeasonStats[] = [];
    
    for (let i = 0; i < yearsActive; i++) {
      const year = currentYear - (yearsActive - 1 - i);
      const seasonMultiplier = 0.7 + (i * 0.1);
      const isCurrentSeason = i === yearsActive - 1;
      
      const games = isCurrentSeason ? Math.floor(25 + Math.random() * 15) : Math.floor(40 + Math.random() * 15);
      
      let battingStats = null;
      let advancedBattingStats = null;
      let trackingBattingStats = null;
      
      if (player.stats.batting) {
        const basePa = player.stats.batting.pa * seasonMultiplier;
        battingStats = {
          pa: Math.floor(basePa),
          ab: Math.floor(basePa * 0.88),
          h: Math.floor(basePa * player.stats.batting.avg * seasonMultiplier),
          '1b': Math.floor(basePa * 0.15),
          '2b': Math.floor(basePa * 0.05),
          '3b': Math.floor(basePa * 0.005),
          hr: Math.floor(player.stats.batting.hr * seasonMultiplier),
          r: Math.floor(player.stats.batting.r * seasonMultiplier),
          rbi: Math.floor(player.stats.batting.rbi * seasonMultiplier),
          bb: Math.floor(basePa * 0.1),
          so: Math.floor(basePa * 0.2),
          sb: Math.floor(player.stats.batting.sb * seasonMultiplier),
          cs: Math.floor(player.stats.batting.cs * seasonMultiplier),
          avg: player.stats.batting.avg * seasonMultiplier,
          obp: player.stats.batting.obp * seasonMultiplier,
          slg: player.stats.batting.slg * seasonMultiplier,
          ops: player.stats.batting.ops * seasonMultiplier,
        };
        
        if (player.advancedStats.batting) {
          advancedBattingStats = {
            woba: player.advancedStats.batting.woba * seasonMultiplier,
            wrc_plus: Math.floor(player.advancedStats.batting.wrc_plus * seasonMultiplier),
            ops_plus: Math.floor(player.advancedStats.batting.ops_plus * seasonMultiplier),
            iso: player.advancedStats.batting.iso * seasonMultiplier,
            babip: player.advancedStats.batting.babip,
            k_pct: player.advancedStats.batting.k_pct + (i === 0 ? 0.03 : 0),
            bb_pct: player.advancedStats.batting.bb_pct - (i === 0 ? 0.01 : 0),
            k_minus_bb_pct: player.advancedStats.batting.k_minus_bb_pct,
            war: player.advancedStats.batting.war * seasonMultiplier,
            re24: player.advancedStats.batting.re24 * seasonMultiplier,
            wpa: player.advancedStats.batting.wpa * seasonMultiplier,
            clutch: player.advancedStats.batting.clutch,
            avg_li: player.advancedStats.batting.avg_li,
          };
        }
        
        if (player.trackingStats?.batting) {
          trackingBattingStats = {
            exit_velo_avg: player.trackingStats.batting.exit_velo_avg - (i === 0 ? 1 : 0),
            launch_angle_avg: player.trackingStats.batting.launch_angle_avg,
            hard_hit_pct: player.trackingStats.batting.hard_hit_pct - (i === 0 ? 0.02 : 0),
            barrel_rate: player.trackingStats.batting.barrel_rate - (i === 0 ? 0.01 : 0),
            xwoba: player.trackingStats.batting.xwoba * seasonMultiplier,
            xba: player.trackingStats.batting.xba * seasonMultiplier,
            xslg: player.trackingStats.batting.xslg * seasonMultiplier,
            sweet_spot_pct: player.trackingStats.batting.sweet_spot_pct,
          };
        }
      }
      
      let pitchingStats = null;
      let advancedPitchingStats = null;
      let trackingPitchingStats = null;
      
      if (player.stats.pitching) {
        const baseIp = player.stats.pitching.ip * seasonMultiplier;
        pitchingStats = {
          w: Math.floor(player.stats.pitching.w * seasonMultiplier),
          l: Math.floor(player.stats.pitching.l * seasonMultiplier),
          era: player.stats.pitching.era * (1 + (i === 0 ? 0.3 : 0)),
          g: games,
          gs: Math.floor(player.stats.pitching.gs * seasonMultiplier),
          cg: Math.floor(player.stats.pitching.cg * seasonMultiplier),
          sho: Math.floor(player.stats.pitching.sho * seasonMultiplier),
          sv: Math.floor(player.stats.pitching.sv * seasonMultiplier),
          ip: baseIp,
          h: Math.floor(baseIp * 0.85),
          r: Math.floor(baseIp * 0.4),
          er: Math.floor(baseIp * 0.35),
          hr: Math.floor(player.stats.pitching.hr * seasonMultiplier),
          bb: Math.floor(baseIp * 0.3),
          so: Math.floor(player.stats.pitching.so * seasonMultiplier),
          whip: player.stats.pitching.whip * (1 + (i === 0 ? 0.15 : 0)),
        };
        
        if (player.advancedStats.pitching) {
          advancedPitchingStats = {
            fip: player.advancedStats.pitching.fip * (1 + (i === 0 ? 0.3 : 0)),
            xfip: player.advancedStats.pitching.xfip * (1 + (i === 0 ? 0.25 : 0)),
            era_minus: Math.floor(player.advancedStats.pitching.era_minus * (1 + (i === 0 ? 0.15 : 0))),
            fip_minus: Math.floor(player.advancedStats.pitching.fip_minus * (1 + (i === 0 ? 0.15 : 0))),
            k_per_9: player.advancedStats.pitching.k_per_9 - (i === 0 ? 1 : 0),
            bb_per_9: player.advancedStats.pitching.bb_per_9 + (i === 0 ? 0.5 : 0),
            hr_per_9: player.advancedStats.pitching.hr_per_9,
            k_minus_bb_pct: player.advancedStats.pitching.k_minus_bb_pct,
            war: player.advancedStats.pitching.war * seasonMultiplier,
            re24: player.advancedStats.pitching.re24 * seasonMultiplier,
            wpa: player.advancedStats.pitching.wpa * seasonMultiplier,
            avg_li: player.advancedStats.pitching.avg_li,
          };
        }
        
        if (player.trackingStats?.pitching) {
          trackingPitchingStats = {
            fastball_velo_avg: player.trackingStats.pitching.fastball_velo_avg - (i === 0 ? 1.5 : 0),
            spin_rate_avg: player.trackingStats.pitching.spin_rate_avg - (i === 0 ? 50 : 0),
            extension_avg: player.trackingStats.pitching.extension_avg,
            release_height_avg: player.trackingStats.pitching.release_height_avg,
            xera: player.trackingStats.pitching.xera,
            xfip_plus: player.trackingStats.pitching.xfip_plus,
            stuff_plus: player.trackingStats.pitching.stuff_plus - (i === 0 ? 5 : 0),
            location_plus: player.trackingStats.pitching.location_plus,
          };
        }
      }
      
      seasons.push({
        season: `${year} ${['Fr', 'So', 'Jr', 'Sr'][i] || 'Sr'}`,
        year,
        team: player.team,
        conference: player.conference,
        division: player.division,
        games,
        stats: {
          batting: battingStats,
          pitching: pitchingStats,
        },
        advancedStats: {
          batting: advancedBattingStats,
          pitching: advancedPitchingStats,
        },
        trackingStats: {
          batting: trackingBattingStats,
          pitching: trackingPitchingStats,
        },
      });
    }
    
    return seasons.reverse();
  };

  const calculateCareerTotals = (seasons: SeasonStats[], type: 'batting' | 'pitching'): any => {
    if (type === 'batting') {
      const totals = {
        pa: 0,
        ab: 0,
        h: 0,
        hr: 0,
        r: 0,
        rbi: 0,
        bb: 0,
        so: 0,
        sb: 0,
        avg: 0,
        obp: 0,
        slg: 0,
        ops: 0,
      };
      
      seasons.forEach((season) => {
        if (season.stats.batting) {
          const batting = season.stats.batting;
          totals.pa += batting.pa;
          totals.ab += batting.ab;
          totals.h += batting.h;
          totals.hr += batting.hr;
          totals.r += batting.r;
          totals.rbi += batting.rbi;
          totals.bb += batting.bb;
          totals.so += batting.so;
          totals.sb += batting.sb;
        }
      });
      
      totals.avg = totals.ab > 0 ? totals.h / totals.ab : 0;
      totals.obp = totals.pa > 0 ? (totals.h + totals.bb) / totals.pa : 0;
      const singles = totals.h - totals.hr;
      totals.slg = totals.ab > 0 ? (singles + totals.hr * 4) / totals.ab : 0;
      totals.ops = totals.obp + totals.slg;
      
      return totals;
    } else {
      const totals = {
        w: 0,
        l: 0,
        era: 0,
        g: 0,
        gs: 0,
        sv: 0,
        ip: 0,
        h: 0,
        er: 0,
        so: 0,
        bb: 0,
        whip: 0,
      };
      
      seasons.forEach((season) => {
        if (season.stats.pitching) {
          const pitching = season.stats.pitching;
          totals.w += pitching.w;
          totals.l += pitching.l;
          totals.g += pitching.g;
          totals.gs += pitching.gs;
          totals.sv += pitching.sv;
          totals.ip += pitching.ip;
          totals.h += pitching.h;
          totals.er += pitching.er;
          totals.so += pitching.so;
          totals.bb += pitching.bb;
        }
      });
      
      totals.era = totals.ip > 0 ? (totals.er * 9) / totals.ip : 0;
      totals.whip = totals.ip > 0 ? (totals.h + totals.bb) / totals.ip : 0;
      
      return totals;
    }
  };

  if (!selectedPlayer) {
    return (
      <div className="space-y-6">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <h2 className="text-2xl font-semibold tracking-tight flex items-center gap-3">
              <User size={28} weight="bold" className="text-primary" />
              Player Profiles
            </h2>
            <p className="text-sm text-muted-foreground mt-1">
              Detailed career statistics and season-by-season breakdowns
            </p>
          </div>
          <Button
            variant={useRealData ? 'default' : 'outline'}
            size="sm"
            onClick={() => {
              setUseRealData(!useRealData);
              if (!useRealData && realPlayers.length === 0) {
                loadRealPlayerData();
              }
            }}
            disabled={loading}
            className="gap-2"
          >
            <CloudArrowDown size={16} />
            {loading ? 'Loading...' : useRealData ? 'Real Data' : 'Mock Data'}
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MagnifyingGlass size={20} className="text-primary" />
              Select a Player
            </CardTitle>
            <CardDescription>Search and select a player to view their detailed profile</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="relative">
              <MagnifyingGlass size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search by player name, team, or conference..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>

            <Tabs value={playerType} onValueChange={(v) => setPlayerType(v as 'batting' | 'pitching')}>
              <TabsList className="grid w-full max-w-md grid-cols-2">
                <TabsTrigger value="batting" className="gap-2">
                  <Baseball size={18} weight="bold" />
                  Batters
                </TabsTrigger>
                <TabsTrigger value="pitching" className="gap-2">
                  <TrendUp size={18} weight="bold" />
                  Pitchers
                </TabsTrigger>
              </TabsList>

              <TabsContent value={playerType} className="mt-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 max-h-[600px] overflow-y-auto pr-2">
                  {filteredPlayers
                    .filter((p) =>
                      playerType === 'batting' ? p.stats.batting : p.stats.pitching
                    )
                    .slice(0, 100)
                    .map((player) => (
                      <Card
                        key={player.id}
                        className="cursor-pointer hover:border-primary/50 hover:shadow-md transition-all"
                        onClick={() => setSelectedPlayer(player)}
                      >
                        <CardContent className="p-4">
                          <div className="space-y-2">
                            <div>
                              <h3 className="font-semibold text-base">{player.name}</h3>
                              <p className="text-xs text-muted-foreground">
                                {player.team} • {player.conference}
                              </p>
                            </div>
                            <div className="flex items-center gap-2 flex-wrap">
                              <Badge variant="outline" className="text-xs">
                                {player.position}
                              </Badge>
                              <Badge variant="secondary" className="text-xs">
                                {player.division}
                              </Badge>
                              <Badge className="text-xs">{player.classYear}</Badge>
                            </div>
                            {playerType === 'batting' && player.stats.batting && (
                              <div className="grid grid-cols-3 gap-2 pt-2 border-t text-xs">
                                <div>
                                  <div className="text-muted-foreground">AVG</div>
                                  <div className="font-mono font-semibold">
                                    {player.stats.batting.avg.toFixed(3)}
                                  </div>
                                </div>
                                <div>
                                  <div className="text-muted-foreground">HR</div>
                                  <div className="font-mono font-semibold">
                                    {player.stats.batting.hr}
                                  </div>
                                </div>
                                <div>
                                  <div className="text-muted-foreground">OPS</div>
                                  <div className="font-mono font-semibold">
                                    {player.stats.batting.ops.toFixed(3)}
                                  </div>
                                </div>
                              </div>
                            )}
                            {playerType === 'pitching' && player.stats.pitching && (
                              <div className="grid grid-cols-3 gap-2 pt-2 border-t text-xs">
                                <div>
                                  <div className="text-muted-foreground">ERA</div>
                                  <div className="font-mono font-semibold">
                                    {player.stats.pitching.era.toFixed(2)}
                                  </div>
                                </div>
                                <div>
                                  <div className="text-muted-foreground">K</div>
                                  <div className="font-mono font-semibold">
                                    {player.stats.pitching.so}
                                  </div>
                                </div>
                                <div>
                                  <div className="text-muted-foreground">WHIP</div>
                                  <div className="font-mono font-semibold">
                                    {player.stats.pitching.whip.toFixed(2)}
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    );
  }

  const seasonHistory = generateSeasonHistory(selectedPlayer);
  const isPitcher = !!selectedPlayer.stats.pitching;
  const careerTotals = calculateCareerTotals(seasonHistory, isPitcher ? 'pitching' : 'batting');

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="outline" size="sm" onClick={() => setSelectedPlayer(null)} className="gap-2">
          <ArrowLeft size={16} />
          Back to List
        </Button>
      </div>

      <Card className="border-2 border-primary/20">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-6">
            <div className="flex-1">
              <div className="flex items-start justify-between gap-4 mb-4">
                <div>
                  <h1 className="text-3xl font-bold mb-1">{selectedPlayer.name}</h1>
                  <p className="text-lg text-muted-foreground">
                    {selectedPlayer.team} • {selectedPlayer.conference}
                  </p>
                </div>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                <div>
                  <div className="text-xs text-muted-foreground mb-1">Position</div>
                  <Badge className="text-sm">{selectedPlayer.position}</Badge>
                </div>
                <div>
                  <div className="text-xs text-muted-foreground mb-1">Division</div>
                  <Badge variant="secondary" className="text-sm">
                    {selectedPlayer.division}
                  </Badge>
                </div>
                <div>
                  <div className="text-xs text-muted-foreground mb-1">Class</div>
                  <Badge variant="outline" className="text-sm">
                    {selectedPlayer.classYear}
                  </Badge>
                </div>
                <div>
                  <div className="text-xs text-muted-foreground mb-1">Bats/Throws</div>
                  <div className="font-mono font-semibold">
                    {selectedPlayer.bats}/{selectedPlayer.throws}
                  </div>
                </div>
              </div>

              <Separator className="my-4" />

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {!isPitcher && selectedPlayer.stats.batting && (
                  <>
                    <div>
                      <div className="text-xs text-muted-foreground mb-1">AVG</div>
                      <div className="text-xl font-mono font-bold">
                        {selectedPlayer.stats.batting.avg.toFixed(3)}
                      </div>
                    </div>
                    <div>
                      <div className="text-xs text-muted-foreground mb-1">HR</div>
                      <div className="text-xl font-mono font-bold">
                        {selectedPlayer.stats.batting.hr}
                      </div>
                    </div>
                    <div>
                      <div className="text-xs text-muted-foreground mb-1">RBI</div>
                      <div className="text-xl font-mono font-bold">
                        {selectedPlayer.stats.batting.rbi}
                      </div>
                    </div>
                    <div>
                      <div className="text-xs text-muted-foreground mb-1">OPS</div>
                      <div className="text-xl font-mono font-bold">
                        {selectedPlayer.stats.batting.ops.toFixed(3)}
                      </div>
                    </div>
                  </>
                )}
                {isPitcher && selectedPlayer.stats.pitching && (
                  <>
                    <div>
                      <div className="text-xs text-muted-foreground mb-1">ERA</div>
                      <div className="text-xl font-mono font-bold">
                        {selectedPlayer.stats.pitching.era.toFixed(2)}
                      </div>
                    </div>
                    <div>
                      <div className="text-xs text-muted-foreground mb-1">W-L</div>
                      <div className="text-xl font-mono font-bold">
                        {selectedPlayer.stats.pitching.w}-{selectedPlayer.stats.pitching.l}
                      </div>
                    </div>
                    <div>
                      <div className="text-xs text-muted-foreground mb-1">K</div>
                      <div className="text-xl font-mono font-bold">
                        {selectedPlayer.stats.pitching.so}
                      </div>
                    </div>
                    <div>
                      <div className="text-xs text-muted-foreground mb-1">WHIP</div>
                      <div className="text-xl font-mono font-bold">
                        {selectedPlayer.stats.pitching.whip.toFixed(2)}
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>

            <div className="md:border-l md:pl-6 space-y-3">
              <h3 className="font-semibold flex items-center gap-2">
                <ChartBar size={18} className="text-primary" />
                Advanced Metrics
              </h3>
              {!isPitcher && selectedPlayer.advancedStats.batting && (
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">wRC+</span>
                    <span className="font-mono font-bold">
                      {selectedPlayer.advancedStats.batting.wrc_plus}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">WAR</span>
                    <span className="font-mono font-bold">
                      {selectedPlayer.advancedStats.batting.war.toFixed(1)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">wOBA</span>
                    <span className="font-mono font-bold">
                      {selectedPlayer.advancedStats.batting.woba.toFixed(3)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">ISO</span>
                    <span className="font-mono font-bold">
                      {selectedPlayer.advancedStats.batting.iso.toFixed(3)}
                    </span>
                  </div>
                </div>
              )}
              {isPitcher && selectedPlayer.advancedStats.pitching && (
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">FIP</span>
                    <span className="font-mono font-bold">
                      {selectedPlayer.advancedStats.pitching.fip.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">WAR</span>
                    <span className="font-mono font-bold">
                      {selectedPlayer.advancedStats.pitching.war.toFixed(1)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">K/9</span>
                    <span className="font-mono font-bold">
                      {selectedPlayer.advancedStats.pitching.k_per_9.toFixed(1)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">ERA-</span>
                    <span className="font-mono font-bold">
                      {selectedPlayer.advancedStats.pitching.era_minus}
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="seasons" className="w-full">
        <TabsList className="grid w-full max-w-2xl grid-cols-4">
          <TabsTrigger value="seasons" className="gap-2">
            <CalendarBlank size={16} />
            Seasons
          </TabsTrigger>
          <TabsTrigger value="career" className="gap-2">
            <Trophy size={16} />
            Career
          </TabsTrigger>
          <TabsTrigger value="advanced" className="gap-2">
            <ChartBar size={16} />
            Advanced
          </TabsTrigger>
          {selectedPlayer.trackingStats && (
            <TabsTrigger value="tracking" className="gap-2">
              <Lightning size={16} />
              Tracking
            </TabsTrigger>
          )}
        </TabsList>

        <TabsContent value="seasons" className="mt-6 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ListNumbers size={20} className="text-primary" />
                Season-by-Season Statistics
              </CardTitle>
              <CardDescription>Complete breakdown of each season's performance</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="relative overflow-x-auto rounded-lg border">
                <Table>
                  <TableHeader className="bg-muted/50">
                    <TableRow>
                      <TableHead className="sticky left-0 bg-muted/50 z-10 min-w-[100px]">Season</TableHead>
                      <TableHead className="min-w-[120px]">Team</TableHead>
                      <TableHead className="text-center">G</TableHead>
                      {!isPitcher ? (
                        <>
                          <TableHead className="text-right font-mono">PA</TableHead>
                          <TableHead className="text-right font-mono">AVG</TableHead>
                          <TableHead className="text-right font-mono">OBP</TableHead>
                          <TableHead className="text-right font-mono">SLG</TableHead>
                          <TableHead className="text-right font-mono">OPS</TableHead>
                          <TableHead className="text-right font-mono">HR</TableHead>
                          <TableHead className="text-right font-mono">RBI</TableHead>
                          <TableHead className="text-right font-mono">R</TableHead>
                          <TableHead className="text-right font-mono">SB</TableHead>
                        </>
                      ) : (
                        <>
                          <TableHead className="text-right font-mono">W-L</TableHead>
                          <TableHead className="text-right font-mono">ERA</TableHead>
                          <TableHead className="text-right font-mono">IP</TableHead>
                          <TableHead className="text-right font-mono">K</TableHead>
                          <TableHead className="text-right font-mono">BB</TableHead>
                          <TableHead className="text-right font-mono">WHIP</TableHead>
                          <TableHead className="text-right font-mono">SV</TableHead>
                        </>
                      )}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {seasonHistory.map((season, idx) => (
                      <TableRow key={season.season} className={idx === seasonHistory.length - 1 ? 'bg-primary/5 font-semibold' : ''}>
                        <TableCell className="sticky left-0 bg-background">
                          <div className="flex items-center gap-2">
                            {season.season}
                            {idx === seasonHistory.length - 1 && (
                              <Badge variant="default" className="text-xs">Current</Badge>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="text-sm">{season.team}</TableCell>
                        <TableCell className="text-center font-mono">{season.games}</TableCell>
                        {!isPitcher && season.stats.batting ? (
                          <>
                            <TableCell className="text-right font-mono">{season.stats.batting.pa}</TableCell>
                            <TableCell className="text-right font-mono">{season.stats.batting.avg.toFixed(3)}</TableCell>
                            <TableCell className="text-right font-mono">{season.stats.batting.obp.toFixed(3)}</TableCell>
                            <TableCell className="text-right font-mono">{season.stats.batting.slg.toFixed(3)}</TableCell>
                            <TableCell className="text-right font-mono font-semibold">{season.stats.batting.ops.toFixed(3)}</TableCell>
                            <TableCell className="text-right font-mono">{season.stats.batting.hr}</TableCell>
                            <TableCell className="text-right font-mono">{season.stats.batting.rbi}</TableCell>
                            <TableCell className="text-right font-mono">{season.stats.batting.r}</TableCell>
                            <TableCell className="text-right font-mono">{season.stats.batting.sb}</TableCell>
                          </>
                        ) : isPitcher && season.stats.pitching ? (
                          <>
                            <TableCell className="text-right font-mono">
                              {season.stats.pitching.w}-{season.stats.pitching.l}
                            </TableCell>
                            <TableCell className="text-right font-mono font-semibold">{season.stats.pitching.era.toFixed(2)}</TableCell>
                            <TableCell className="text-right font-mono">{season.stats.pitching.ip.toFixed(1)}</TableCell>
                            <TableCell className="text-right font-mono">{season.stats.pitching.so}</TableCell>
                            <TableCell className="text-right font-mono">{season.stats.pitching.bb}</TableCell>
                            <TableCell className="text-right font-mono">{season.stats.pitching.whip.toFixed(2)}</TableCell>
                            <TableCell className="text-right font-mono">{season.stats.pitching.sv}</TableCell>
                          </>
                        ) : null}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="career" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Trophy size={20} className="text-primary" />
                Career Totals
              </CardTitle>
              <CardDescription>Cumulative statistics across all seasons</CardDescription>
            </CardHeader>
            <CardContent>
              {!isPitcher ? (
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">
                  <div className="space-y-1">
                    <div className="text-sm text-muted-foreground">Plate Appearances</div>
                    <div className="text-2xl font-mono font-bold">{careerTotals.pa}</div>
                  </div>
                  <div className="space-y-1">
                    <div className="text-sm text-muted-foreground">Batting Average</div>
                    <div className="text-2xl font-mono font-bold">{careerTotals.avg.toFixed(3)}</div>
                  </div>
                  <div className="space-y-1">
                    <div className="text-sm text-muted-foreground">On-Base %</div>
                    <div className="text-2xl font-mono font-bold">{careerTotals.obp.toFixed(3)}</div>
                  </div>
                  <div className="space-y-1">
                    <div className="text-sm text-muted-foreground">Slugging %</div>
                    <div className="text-2xl font-mono font-bold">{careerTotals.slg.toFixed(3)}</div>
                  </div>
                  <div className="space-y-1">
                    <div className="text-sm text-muted-foreground">OPS</div>
                    <div className="text-2xl font-mono font-bold text-primary">{careerTotals.ops.toFixed(3)}</div>
                  </div>
                  <div className="space-y-1">
                    <div className="text-sm text-muted-foreground">Home Runs</div>
                    <div className="text-2xl font-mono font-bold">{careerTotals.hr}</div>
                  </div>
                  <div className="space-y-1">
                    <div className="text-sm text-muted-foreground">RBI</div>
                    <div className="text-2xl font-mono font-bold">{careerTotals.rbi}</div>
                  </div>
                  <div className="space-y-1">
                    <div className="text-sm text-muted-foreground">Runs</div>
                    <div className="text-2xl font-mono font-bold">{careerTotals.r}</div>
                  </div>
                  <div className="space-y-1">
                    <div className="text-sm text-muted-foreground">Stolen Bases</div>
                    <div className="text-2xl font-mono font-bold">{careerTotals.sb}</div>
                  </div>
                  <div className="space-y-1">
                    <div className="text-sm text-muted-foreground">Hits</div>
                    <div className="text-2xl font-mono font-bold">{careerTotals.h}</div>
                  </div>
                  <div className="space-y-1">
                    <div className="text-sm text-muted-foreground">Walks</div>
                    <div className="text-2xl font-mono font-bold">{careerTotals.bb}</div>
                  </div>
                  <div className="space-y-1">
                    <div className="text-sm text-muted-foreground">Strikeouts</div>
                    <div className="text-2xl font-mono font-bold">{careerTotals.so}</div>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">
                  <div className="space-y-1">
                    <div className="text-sm text-muted-foreground">Games</div>
                    <div className="text-2xl font-mono font-bold">{careerTotals.g}</div>
                  </div>
                  <div className="space-y-1">
                    <div className="text-sm text-muted-foreground">Wins</div>
                    <div className="text-2xl font-mono font-bold">{careerTotals.w}</div>
                  </div>
                  <div className="space-y-1">
                    <div className="text-sm text-muted-foreground">Losses</div>
                    <div className="text-2xl font-mono font-bold">{careerTotals.l}</div>
                  </div>
                  <div className="space-y-1">
                    <div className="text-sm text-muted-foreground">ERA</div>
                    <div className="text-2xl font-mono font-bold text-primary">{careerTotals.era.toFixed(2)}</div>
                  </div>
                  <div className="space-y-1">
                    <div className="text-sm text-muted-foreground">Innings Pitched</div>
                    <div className="text-2xl font-mono font-bold">{careerTotals.ip.toFixed(1)}</div>
                  </div>
                  <div className="space-y-1">
                    <div className="text-sm text-muted-foreground">Strikeouts</div>
                    <div className="text-2xl font-mono font-bold">{careerTotals.so}</div>
                  </div>
                  <div className="space-y-1">
                    <div className="text-sm text-muted-foreground">Walks</div>
                    <div className="text-2xl font-mono font-bold">{careerTotals.bb}</div>
                  </div>
                  <div className="space-y-1">
                    <div className="text-sm text-muted-foreground">WHIP</div>
                    <div className="text-2xl font-mono font-bold">{careerTotals.whip.toFixed(2)}</div>
                  </div>
                  <div className="space-y-1">
                    <div className="text-sm text-muted-foreground">Saves</div>
                    <div className="text-2xl font-mono font-bold">{careerTotals.sv}</div>
                  </div>
                  <div className="space-y-1">
                    <div className="text-sm text-muted-foreground">Games Started</div>
                    <div className="text-2xl font-mono font-bold">{careerTotals.gs}</div>
                  </div>
                  <div className="space-y-1">
                    <div className="text-sm text-muted-foreground">Hits Allowed</div>
                    <div className="text-2xl font-mono font-bold">{careerTotals.h}</div>
                  </div>
                  <div className="space-y-1">
                    <div className="text-sm text-muted-foreground">Earned Runs</div>
                    <div className="text-2xl font-mono font-bold">{careerTotals.er}</div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="advanced" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ChartBar size={20} className="text-primary" />
                Advanced Metrics by Season
              </CardTitle>
              <CardDescription>Sabermetric stats including wRC+, WAR, FIP, and more</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="relative overflow-x-auto rounded-lg border">
                <Table>
                  <TableHeader className="bg-muted/50">
                    <TableRow>
                      <TableHead className="sticky left-0 bg-muted/50 z-10 min-w-[100px]">Season</TableHead>
                      {!isPitcher ? (
                        <>
                          <TableHead className="text-right font-mono">wRC+</TableHead>
                          <TableHead className="text-right font-mono">WAR</TableHead>
                          <TableHead className="text-right font-mono">wOBA</TableHead>
                          <TableHead className="text-right font-mono">OPS+</TableHead>
                          <TableHead className="text-right font-mono">ISO</TableHead>
                          <TableHead className="text-right font-mono">BABIP</TableHead>
                          <TableHead className="text-right font-mono">K%</TableHead>
                          <TableHead className="text-right font-mono">BB%</TableHead>
                          <TableHead className="text-right font-mono">WPA</TableHead>
                        </>
                      ) : (
                        <>
                          <TableHead className="text-right font-mono">FIP</TableHead>
                          <TableHead className="text-right font-mono">xFIP</TableHead>
                          <TableHead className="text-right font-mono">WAR</TableHead>
                          <TableHead className="text-right font-mono">ERA-</TableHead>
                          <TableHead className="text-right font-mono">K/9</TableHead>
                          <TableHead className="text-right font-mono">BB/9</TableHead>
                          <TableHead className="text-right font-mono">HR/9</TableHead>
                          <TableHead className="text-right font-mono">WPA</TableHead>
                        </>
                      )}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {seasonHistory.map((season, idx) => (
                      <TableRow key={season.season} className={idx === seasonHistory.length - 1 ? 'bg-primary/5 font-semibold' : ''}>
                        <TableCell className="sticky left-0 bg-background">{season.season}</TableCell>
                        {!isPitcher && season.advancedStats.batting ? (
                          <>
                            <TableCell className="text-right font-mono">{season.advancedStats.batting.wrc_plus}</TableCell>
                            <TableCell className="text-right font-mono">{season.advancedStats.batting.war.toFixed(1)}</TableCell>
                            <TableCell className="text-right font-mono">{season.advancedStats.batting.woba.toFixed(3)}</TableCell>
                            <TableCell className="text-right font-mono">{season.advancedStats.batting.ops_plus}</TableCell>
                            <TableCell className="text-right font-mono">{season.advancedStats.batting.iso.toFixed(3)}</TableCell>
                            <TableCell className="text-right font-mono">{season.advancedStats.batting.babip.toFixed(3)}</TableCell>
                            <TableCell className="text-right font-mono">{(season.advancedStats.batting.k_pct * 100).toFixed(1)}%</TableCell>
                            <TableCell className="text-right font-mono">{(season.advancedStats.batting.bb_pct * 100).toFixed(1)}%</TableCell>
                            <TableCell className="text-right font-mono">{season.advancedStats.batting.wpa.toFixed(1)}</TableCell>
                          </>
                        ) : isPitcher && season.advancedStats.pitching ? (
                          <>
                            <TableCell className="text-right font-mono">{season.advancedStats.pitching.fip.toFixed(2)}</TableCell>
                            <TableCell className="text-right font-mono">{season.advancedStats.pitching.xfip.toFixed(2)}</TableCell>
                            <TableCell className="text-right font-mono">{season.advancedStats.pitching.war.toFixed(1)}</TableCell>
                            <TableCell className="text-right font-mono">{season.advancedStats.pitching.era_minus}</TableCell>
                            <TableCell className="text-right font-mono">{season.advancedStats.pitching.k_per_9.toFixed(1)}</TableCell>
                            <TableCell className="text-right font-mono">{season.advancedStats.pitching.bb_per_9.toFixed(1)}</TableCell>
                            <TableCell className="text-right font-mono">{season.advancedStats.pitching.hr_per_9.toFixed(2)}</TableCell>
                            <TableCell className="text-right font-mono">{season.advancedStats.pitching.wpa.toFixed(1)}</TableCell>
                          </>
                        ) : null}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {selectedPlayer.trackingStats && (
          <TabsContent value="tracking" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Lightning size={20} className="text-warning" />
                  Tracking Metrics by Season
                </CardTitle>
                <CardDescription>
                  TrackMan and HawkEye derived statistics including exit velocity, spin rate, and xStats
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="relative overflow-x-auto rounded-lg border">
                  <Table>
                    <TableHeader className="bg-muted/50">
                      <TableRow>
                        <TableHead className="sticky left-0 bg-muted/50 z-10 min-w-[100px]">Season</TableHead>
                        {!isPitcher && selectedPlayer.trackingStats.batting ? (
                          <>
                            <TableHead className="text-right font-mono">Avg EV</TableHead>
                            <TableHead className="text-right font-mono">Avg LA</TableHead>
                            <TableHead className="text-right font-mono">HH%</TableHead>
                            <TableHead className="text-right font-mono">Barrel%</TableHead>
                            <TableHead className="text-right font-mono">xwOBA</TableHead>
                            <TableHead className="text-right font-mono">xBA</TableHead>
                            <TableHead className="text-right font-mono">xSLG</TableHead>
                            <TableHead className="text-right font-mono">Sweet%</TableHead>
                          </>
                        ) : isPitcher && selectedPlayer.trackingStats.pitching ? (
                          <>
                            <TableHead className="text-right font-mono">FB Velo</TableHead>
                            <TableHead className="text-right font-mono">Spin</TableHead>
                            <TableHead className="text-right font-mono">Extension</TableHead>
                            <TableHead className="text-right font-mono">Rel H</TableHead>
                            <TableHead className="text-right font-mono">xERA</TableHead>
                            <TableHead className="text-right font-mono">Stuff+</TableHead>
                            <TableHead className="text-right font-mono">Loc+</TableHead>
                          </>
                        ) : null}
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {seasonHistory.map((season, idx) => (
                        <TableRow key={season.season} className={idx === seasonHistory.length - 1 ? 'bg-warning/5 font-semibold' : ''}>
                          <TableCell className="sticky left-0 bg-background">{season.season}</TableCell>
                          {!isPitcher && season.trackingStats?.batting ? (
                            <>
                              <TableCell className="text-right font-mono">{season.trackingStats.batting.exit_velo_avg.toFixed(1)}</TableCell>
                              <TableCell className="text-right font-mono">{season.trackingStats.batting.launch_angle_avg.toFixed(1)}</TableCell>
                              <TableCell className="text-right font-mono">{(season.trackingStats.batting.hard_hit_pct * 100).toFixed(1)}%</TableCell>
                              <TableCell className="text-right font-mono">{(season.trackingStats.batting.barrel_rate * 100).toFixed(1)}%</TableCell>
                              <TableCell className="text-right font-mono">{season.trackingStats.batting.xwoba.toFixed(3)}</TableCell>
                              <TableCell className="text-right font-mono">{season.trackingStats.batting.xba.toFixed(3)}</TableCell>
                              <TableCell className="text-right font-mono">{season.trackingStats.batting.xslg.toFixed(3)}</TableCell>
                              <TableCell className="text-right font-mono">{(season.trackingStats.batting.sweet_spot_pct * 100).toFixed(1)}%</TableCell>
                            </>
                          ) : isPitcher && season.trackingStats?.pitching ? (
                            <>
                              <TableCell className="text-right font-mono">{season.trackingStats.pitching.fastball_velo_avg.toFixed(1)}</TableCell>
                              <TableCell className="text-right font-mono">{Math.round(season.trackingStats.pitching.spin_rate_avg)}</TableCell>
                              <TableCell className="text-right font-mono">{season.trackingStats.pitching.extension_avg.toFixed(1)}</TableCell>
                              <TableCell className="text-right font-mono">{season.trackingStats.pitching.release_height_avg.toFixed(1)}</TableCell>
                              <TableCell className="text-right font-mono">{season.trackingStats.pitching.xera.toFixed(2)}</TableCell>
                              <TableCell className="text-right font-mono">{Math.round(season.trackingStats.pitching.stuff_plus)}</TableCell>
                              <TableCell className="text-right font-mono">{Math.round(season.trackingStats.pitching.location_plus)}</TableCell>
                            </>
                          ) : null}
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
}
