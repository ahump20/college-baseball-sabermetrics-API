import { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
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
  MapPin,
  GraduationCap,
  Ruler,
  Barbell,
  Star,
  Medal,
  Fire,
  Crown,
  Sparkle,
} from '@phosphor-icons/react';
import { mockPlayers, type Player } from '@/lib/playerData';
import { realDataService } from '@/lib/realDataService';
import { toast } from 'sonner';
import { getPlayerPhoto, getTeamLogo } from '@/lib/photoService';

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

interface CareerHighlight {
  id: string;
  type: 'award' | 'milestone' | 'achievement' | 'record';
  season: string;
  title: string;
  description: string;
  icon: React.ElementType;
  variant: 'default' | 'success' | 'warning' | 'primary';
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

  const generateCareerHighlights = (player: Player, seasons: SeasonStats[]): CareerHighlight[] => {
    const highlights: CareerHighlight[] = [];
    const isPitcher = !!player.stats.pitching;
    
    if (isPitcher && player.stats.pitching) {
      if (player.advancedStats.pitching?.war && player.advancedStats.pitching.war >= 3.0) {
        highlights.push({
          id: 'all-conf',
          type: 'award',
          season: '2025',
          title: 'All-Conference Honors',
          description: `${player.advancedStats.pitching.war.toFixed(1)} WAR ranked among conference leaders`,
          icon: Medal,
          variant: 'success',
        });
      }
      
      if (player.stats.pitching.era <= 2.50) {
        highlights.push({
          id: 'elite-era',
          type: 'achievement',
          season: '2025',
          title: 'Elite ERA',
          description: `${player.stats.pitching.era.toFixed(2)} ERA places in top tier nationally`,
          icon: Star,
          variant: 'primary',
        });
      }
      
      if (player.stats.pitching.so >= 100) {
        highlights.push({
          id: 'k-milestone',
          type: 'milestone',
          season: 'Career',
          title: '100+ Strikeout Season',
          description: `${player.stats.pitching.so} strikeouts in current season`,
          icon: Fire,
          variant: 'warning',
        });
      }
      
      if (player.advancedStats.pitching?.k_per_9 && player.advancedStats.pitching.k_per_9 >= 11.0) {
        highlights.push({
          id: 'k-rate',
          type: 'achievement',
          season: '2025',
          title: 'Dominant K Rate',
          description: `${player.advancedStats.pitching.k_per_9.toFixed(1)} K/9 shows elite strikeout ability`,
          icon: Lightning,
          variant: 'warning',
        });
      }
      
      if (player.stats.pitching.whip <= 1.00) {
        highlights.push({
          id: 'whip-master',
          type: 'achievement',
          season: '2025',
          title: 'Command Excellence',
          description: `${player.stats.pitching.whip.toFixed(2)} WHIP demonstrates exceptional control`,
          icon: Target,
          variant: 'success',
        });
      }
      
      if (player.trackingStats?.pitching?.fastball_velo_avg && player.trackingStats.pitching.fastball_velo_avg >= 95) {
        highlights.push({
          id: 'velo',
          type: 'achievement',
          season: '2025',
          title: 'Power Arm',
          description: `${player.trackingStats.pitching.fastball_velo_avg.toFixed(1)} MPH average fastball velocity`,
          icon: Lightning,
          variant: 'warning',
        });
      }
      
    } else if (player.stats.batting) {
      if (player.advancedStats.batting?.war && player.advancedStats.batting.war >= 3.0) {
        highlights.push({
          id: 'all-american',
          type: 'award',
          season: '2025',
          title: 'All-American Candidate',
          description: `${player.advancedStats.batting.war.toFixed(1)} WAR among nation's elite`,
          icon: Crown,
          variant: 'success',
        });
      }
      
      if (player.stats.batting.avg >= 0.350) {
        highlights.push({
          id: 'avg-leader',
          type: 'achievement',
          season: '2025',
          title: 'Batting Title Contender',
          description: `.${Math.floor(player.stats.batting.avg * 1000)} average ranks among conference leaders`,
          icon: Trophy,
          variant: 'primary',
        });
      }
      
      if (player.stats.batting.hr >= 15) {
        highlights.push({
          id: 'power-threat',
          type: 'milestone',
          season: '2025',
          title: 'Power Threat',
          description: `${player.stats.batting.hr} home runs shows elite power`,
          icon: Fire,
          variant: 'warning',
        });
      }
      
      if (player.stats.batting.ops >= 1.000) {
        highlights.push({
          id: 'ops-elite',
          type: 'achievement',
          season: '2025',
          title: 'Elite OPS',
          description: `${player.stats.batting.ops.toFixed(3)} OPS demonstrates complete offensive package`,
          icon: Star,
          variant: 'primary',
        });
      }
      
      if (player.advancedStats.batting?.wrc_plus && player.advancedStats.batting.wrc_plus >= 150) {
        highlights.push({
          id: 'wrc-leader',
          type: 'achievement',
          season: '2025',
          title: 'Run Creation Leader',
          description: `${player.advancedStats.batting.wrc_plus} wRC+ shows elite offensive production`,
          icon: ChartBar,
          variant: 'success',
        });
      }
      
      if (player.stats.batting.sb >= 20 && player.stats.batting.cs <= 5) {
        highlights.push({
          id: 'speed-demon',
          type: 'achievement',
          season: '2025',
          title: 'Base Stealing Threat',
          description: `${player.stats.batting.sb} stolen bases with excellent success rate`,
          icon: Lightning,
          variant: 'warning',
        });
      }
      
      if (player.trackingStats?.batting?.exit_velo_avg && player.trackingStats.batting.exit_velo_avg >= 92) {
        highlights.push({
          id: 'exit-velo',
          type: 'achievement',
          season: '2025',
          title: 'Hard Contact',
          description: `${player.trackingStats.batting.exit_velo_avg.toFixed(1)} MPH avg exit velo shows raw power`,
          icon: Target,
          variant: 'warning',
        });
      }
      
      const careerHits = seasons.reduce((total, s) => total + (s.stats.batting?.h || 0), 0);
      if (careerHits >= 200) {
        highlights.push({
          id: 'hit-milestone',
          type: 'milestone',
          season: 'Career',
          title: '200+ Career Hits',
          description: `${careerHits} career hits milestone achieved`,
          icon: Sparkle,
          variant: 'primary',
        });
      }
    }
    
    return highlights;
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
                          <div className="space-y-3">
                            <div className="flex items-start gap-3">
                              <Avatar className="h-12 w-12 border-2 border-primary/20">
                                <AvatarImage 
                                  src={player.photo || getPlayerPhoto(player.id, player.name, player.team).headshot} 
                                  alt={player.name}
                                  onError={(e) => {
                                    const target = e.target as HTMLImageElement;
                                    target.src = getPlayerPhoto(player.id, player.name, player.team).fallback;
                                  }}
                                />
                                <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                                  {player.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                                </AvatarFallback>
                              </Avatar>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2">
                                  <h3 className="font-semibold text-base truncate">{player.name}</h3>
                                </div>
                                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                                  <img 
                                    src={getTeamLogo(player.team).primary} 
                                    alt={player.team}
                                    className="h-4 w-4 object-contain"
                                    onError={(e) => {
                                      const target = e.target as HTMLImageElement;
                                      target.style.display = 'none';
                                    }}
                                  />
                                  <span className="truncate">{player.team} • {player.conference}</span>
                                </div>
                              </div>
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
  const careerHighlights = generateCareerHighlights(selectedPlayer, seasonHistory);

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
            <div className="flex-shrink-0">
              <Avatar className="h-32 w-32 border-4 border-primary/20">
                <AvatarImage src={selectedPlayer.photo} alt={selectedPlayer.name} />
                <AvatarFallback className="bg-primary/10 text-primary font-bold text-3xl">
                  {selectedPlayer.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                </AvatarFallback>
              </Avatar>
            </div>
            
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

              {selectedPlayer.bio && (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-4 p-3 bg-muted/30 rounded-lg border border-border/50">
                  {selectedPlayer.bio.height && (
                    <div className="flex items-center gap-2 text-sm">
                      <Ruler size={16} className="text-primary" />
                      <div>
                        <span className="text-muted-foreground">Height:</span>{' '}
                        <span className="font-semibold">{selectedPlayer.bio.height}</span>
                      </div>
                    </div>
                  )}
                  {selectedPlayer.bio.weight && (
                    <div className="flex items-center gap-2 text-sm">
                      <Barbell size={16} className="text-primary" />
                      <div>
                        <span className="text-muted-foreground">Weight:</span>{' '}
                        <span className="font-semibold">{selectedPlayer.bio.weight} lbs</span>
                      </div>
                    </div>
                  )}
                  {selectedPlayer.bio.hometown && (
                    <div className="flex items-center gap-2 text-sm">
                      <MapPin size={16} className="text-primary" />
                      <div>
                        <span className="text-muted-foreground">From:</span>{' '}
                        <span className="font-semibold">{selectedPlayer.bio.hometown}</span>
                      </div>
                    </div>
                  )}
                  {selectedPlayer.bio.highSchool && (
                    <div className="flex items-center gap-2 text-sm col-span-2">
                      <GraduationCap size={16} className="text-primary" />
                      <div>
                        <span className="text-muted-foreground">High School:</span>{' '}
                        <span className="font-semibold">{selectedPlayer.bio.highSchool}</span>
                      </div>
                    </div>
                  )}
                  {selectedPlayer.bio.major && (
                    <div className="flex items-center gap-2 text-sm">
                      <GraduationCap size={16} className="text-primary" />
                      <div>
                        <span className="text-muted-foreground">Major:</span>{' '}
                        <span className="font-semibold">{selectedPlayer.bio.major}</span>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {careerHighlights.length > 0 && (
                <div className="mb-4">
                  <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
                    <Trophy size={16} className="text-warning" />
                    Career Highlights
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {careerHighlights.slice(0, 4).map((highlight) => {
                      const Icon = highlight.icon;
                      const variantClasses = {
                        default: 'border-border bg-card',
                        success: 'border-success/30 bg-success/10 text-success',
                        warning: 'border-warning/30 bg-warning/10 text-warning',
                        primary: 'border-primary/30 bg-primary/10 text-primary',
                      };
                      return (
                        <Badge
                          key={highlight.id}
                          variant="outline"
                          className={`gap-1.5 ${variantClasses[highlight.variant]}`}
                        >
                          <Icon size={14} weight="bold" />
                          {highlight.title}
                        </Badge>
                      );
                    })}
                  </div>
                </div>
              )}

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
        <TabsList className="grid w-full max-w-2xl grid-cols-5">
          <TabsTrigger value="seasons" className="gap-2">
            <CalendarBlank size={16} />
            Seasons
          </TabsTrigger>
          <TabsTrigger value="career" className="gap-2">
            <Trophy size={16} />
            Career
          </TabsTrigger>
          <TabsTrigger value="highlights" className="gap-2">
            <Star size={16} />
            Highlights
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

        <TabsContent value="highlights" className="mt-6">
          <div className="grid gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Trophy size={20} className="text-warning" />
                  Career Highlights & Achievements
                </CardTitle>
                <CardDescription>
                  Notable accomplishments and milestones throughout the player's career
                </CardDescription>
              </CardHeader>
              <CardContent>
                {careerHighlights.length > 0 ? (
                  <div className="grid gap-4 md:grid-cols-2">
                    {careerHighlights.map((highlight) => {
                      const Icon = highlight.icon;
                      const variantColors = {
                        default: 'border-border bg-card',
                        success: 'border-success/30 bg-success/5',
                        warning: 'border-warning/30 bg-warning/5',
                        primary: 'border-primary/30 bg-primary/5',
                      };
                      const iconColors = {
                        default: 'text-muted-foreground',
                        success: 'text-success',
                        warning: 'text-warning',
                        primary: 'text-primary',
                      };
                      return (
                        <div
                          key={highlight.id}
                          className={`p-4 rounded-lg border-2 ${variantColors[highlight.variant]} transition-all hover:shadow-md`}
                        >
                          <div className="flex items-start gap-3">
                            <div className={`p-2 rounded-lg bg-background/50 ${iconColors[highlight.variant]}`}>
                              <Icon size={24} weight="bold" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <h3 className="font-semibold">{highlight.title}</h3>
                                <Badge variant="outline" className="text-xs">
                                  {highlight.season}
                                </Badge>
                              </div>
                              <p className="text-sm text-muted-foreground">
                                {highlight.description}
                              </p>
                              <div className="mt-2">
                                <Badge variant="secondary" className="text-xs capitalize">
                                  {highlight.type}
                                </Badge>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <Trophy size={48} className="mx-auto text-muted-foreground/50 mb-3" />
                    <p className="text-muted-foreground">
                      Continue building your career to unlock achievements
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ChartBar size={20} className="text-primary" />
                  Season Progression
                </CardTitle>
                <CardDescription>
                  Year-over-year performance trends
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {seasonHistory.map((season, idx) => {
                    const isCurrentSeason = idx === seasonHistory.length - 1;
                    const prevSeason = idx > 0 ? seasonHistory[idx - 1] : null;
                    
                    let improvements: string[] = [];
                    if (prevSeason) {
                      if (!isPitcher && season.stats.batting && prevSeason.stats.batting) {
                        if (season.stats.batting.avg > prevSeason.stats.batting.avg) {
                          improvements.push(`AVG +${((season.stats.batting.avg - prevSeason.stats.batting.avg) * 1000).toFixed(0)} pts`);
                        }
                        if (season.stats.batting.hr > prevSeason.stats.batting.hr) {
                          improvements.push(`+${season.stats.batting.hr - prevSeason.stats.batting.hr} HR`);
                        }
                        if (season.stats.batting.ops > prevSeason.stats.batting.ops) {
                          improvements.push(`OPS +${((season.stats.batting.ops - prevSeason.stats.batting.ops) * 1000).toFixed(0)} pts`);
                        }
                      } else if (isPitcher && season.stats.pitching && prevSeason.stats.pitching) {
                        if (season.stats.pitching.era < prevSeason.stats.pitching.era) {
                          improvements.push(`ERA -${(prevSeason.stats.pitching.era - season.stats.pitching.era).toFixed(2)}`);
                        }
                        if (season.stats.pitching.so > prevSeason.stats.pitching.so) {
                          improvements.push(`+${season.stats.pitching.so - prevSeason.stats.pitching.so} K`);
                        }
                        if (season.stats.pitching.whip < prevSeason.stats.pitching.whip) {
                          improvements.push(`WHIP -${(prevSeason.stats.pitching.whip - season.stats.pitching.whip).toFixed(2)}`);
                        }
                      }
                    }

                    return (
                      <div
                        key={season.season}
                        className={`p-4 rounded-lg border ${isCurrentSeason ? 'border-primary bg-primary/5' : 'border-border'}`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <span className="font-semibold">{season.season}</span>
                            {isCurrentSeason && (
                              <Badge className="text-xs">Current</Badge>
                            )}
                          </div>
                          <span className="text-sm text-muted-foreground">{season.games}G</span>
                        </div>
                        
                        {improvements.length > 0 && (
                          <div className="flex flex-wrap gap-2 mt-2">
                            {improvements.map((improvement, i) => (
                              <Badge key={i} variant="outline" className="text-xs gap-1 border-success/30 bg-success/10 text-success">
                                <TrendUp size={12} weight="bold" />
                                {improvement}
                              </Badge>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>
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
