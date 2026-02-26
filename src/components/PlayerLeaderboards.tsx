import { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import {
  Users,
  Target,
  ArrowUp,
  ArrowDown,
  MagnifyingGlass,
  Lightning,
  ChartBar,
  Baseball,
  TrendUp,
  CloudArrowDown,
  FunnelSimple,
} from '@phosphor-icons/react';
import { mockPlayers, type Player } from '@/lib/playerData';
import { realDataService } from '@/lib/realDataService';
import { toast } from 'sonner';

type SortDirection = 'asc' | 'desc';

interface SortConfig {
  key: string;
  direction: SortDirection;
}

export function PlayerLeaderboards() {
  const [playerType, setPlayerType] = useState<'batting' | 'pitching'>('batting');
  const [selectedDivision, setSelectedDivision] = useState<string>('all');
  const [selectedConference, setSelectedConference] = useState<string>('all');
  const [selectedPosition, setSelectedPosition] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortConfig, setSortConfig] = useState<SortConfig>({ key: 'wrc_plus', direction: 'desc' });
  const [useRealData, setUseRealData] = useState(false);
  const [realPlayers, setRealPlayers] = useState<Player[]>([]);
  const [loading, setLoading] = useState(false);
  const [displayLimit, setDisplayLimit] = useState(50);

  const currentPlayers = useRealData ? realPlayers : mockPlayers;

  const divisions = ['all', 'D1', 'D2', 'D3'];
  const conferences = useMemo(
    () => ['all', ...Array.from(new Set(currentPlayers.map((p) => p.conference))).sort()],
    [currentPlayers]
  );
  const battingPositions = ['all', 'C', '1B', '2B', '3B', 'SS', 'OF', 'DH'];
  const pitchingPositions = ['all', 'SP', 'RP', 'CL'];

  useEffect(() => {
    if (useRealData && realPlayers.length === 0) {
      loadRealPlayerData();
    }
  }, [useRealData, realPlayers.length]);

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

  const battingColumns = [
    { id: 'wrc_plus', label: 'wRC+', desc: 'Weighted Runs Created Plus', advanced: true },
    { id: 'war', label: 'WAR', desc: 'Wins Above Replacement', advanced: true },
    { id: 'woba', label: 'wOBA', desc: 'Weighted On-Base Average', advanced: true },
    { id: 'ops_plus', label: 'OPS+', desc: 'On-Base Plus Slugging Plus', advanced: true },
    { id: 'iso', label: 'ISO', desc: 'Isolated Power', advanced: true },
    { id: 'babip', label: 'BABIP', desc: 'Batting Avg on Balls in Play', advanced: true },
    { id: 'k_pct', label: 'K%', desc: 'Strikeout Percentage', advanced: true },
    { id: 'bb_pct', label: 'BB%', desc: 'Walk Percentage', advanced: true },
    { id: 'k_minus_bb_pct', label: 'K-BB%', desc: 'Strikeout minus Walk Rate', advanced: true },
    { id: 'wpa', label: 'WPA', desc: 'Win Probability Added', advanced: true },
    { id: 're24', label: 'RE24', desc: 'Run Expectancy 24', advanced: true },
    { id: 'clutch', label: 'Clutch', desc: 'Clutch Rating', advanced: true },
    { id: 'avg_li', label: 'avgLI', desc: 'Average Leverage Index', advanced: true },
    { id: 'exit_velo_avg', label: 'Avg EV', desc: 'Average Exit Velocity', tracking: true },
    { id: 'launch_angle_avg', label: 'Avg LA', desc: 'Average Launch Angle', tracking: true },
    { id: 'hard_hit_pct', label: 'HH%', desc: 'Hard Hit Percentage', tracking: true },
    { id: 'barrel_rate', label: 'Barrel%', desc: 'Barrel Rate', tracking: true },
    { id: 'xwoba', label: 'xwOBA', desc: 'Expected wOBA', tracking: true },
    { id: 'xba', label: 'xBA', desc: 'Expected Batting Average', tracking: true },
    { id: 'xslg', label: 'xSLG', desc: 'Expected Slugging', tracking: true },
    { id: 'sweet_spot_pct', label: 'Sweet%', desc: 'Sweet Spot Percentage', tracking: true },
    { id: 'avg', label: 'AVG', desc: 'Batting Average', basic: true },
    { id: 'obp', label: 'OBP', desc: 'On-Base Percentage', basic: true },
    { id: 'slg', label: 'SLG', desc: 'Slugging Percentage', basic: true },
    { id: 'ops', label: 'OPS', desc: 'On-Base Plus Slugging', basic: true },
    { id: 'hr', label: 'HR', desc: 'Home Runs', basic: true },
    { id: 'rbi', label: 'RBI', desc: 'Runs Batted In', basic: true },
    { id: 'r', label: 'R', desc: 'Runs Scored', basic: true },
    { id: 'sb', label: 'SB', desc: 'Stolen Bases', basic: true },
  ];

  const pitchingColumns = [
    { id: 'era_minus', label: 'ERA-', desc: 'ERA Minus (lower is better)', advanced: true },
    { id: 'fip', label: 'FIP', desc: 'Fielding Independent Pitching', advanced: true },
    { id: 'xfip', label: 'xFIP', desc: 'Expected FIP', advanced: true },
    { id: 'fip_minus', label: 'FIP-', desc: 'FIP Minus (lower is better)', advanced: true },
    { id: 'war', label: 'WAR', desc: 'Wins Above Replacement', advanced: true },
    { id: 'k_per_9', label: 'K/9', desc: 'Strikeouts per 9 innings', advanced: true },
    { id: 'bb_per_9', label: 'BB/9', desc: 'Walks per 9 innings', advanced: true },
    { id: 'hr_per_9', label: 'HR/9', desc: 'Home Runs per 9 innings', advanced: true },
    { id: 'k_minus_bb_pct', label: 'K-BB%', desc: 'Strikeout minus Walk Rate', advanced: true },
    { id: 'wpa', label: 'WPA', desc: 'Win Probability Added', advanced: true },
    { id: 're24', label: 'RE24', desc: 'Run Expectancy 24', advanced: true },
    { id: 'avg_li', label: 'avgLI', desc: 'Average Leverage Index', advanced: true },
    { id: 'fastball_velo_avg', label: 'FB Velo', desc: 'Average Fastball Velocity', tracking: true },
    { id: 'spin_rate_avg', label: 'Spin', desc: 'Average Spin Rate', tracking: true },
    { id: 'extension_avg', label: 'Ext', desc: 'Average Extension', tracking: true },
    { id: 'release_height_avg', label: 'Rel H', desc: 'Average Release Height', tracking: true },
    { id: 'xera', label: 'xERA', desc: 'Expected ERA', tracking: true },
    { id: 'xfip_plus', label: 'xFIP+', desc: 'Expected FIP Plus', tracking: true },
    { id: 'stuff_plus', label: 'Stuff+', desc: 'Stuff Plus', tracking: true },
    { id: 'location_plus', label: 'Loc+', desc: 'Location Plus', tracking: true },
    { id: 'era', label: 'ERA', desc: 'Earned Run Average', basic: true },
    { id: 'whip', label: 'WHIP', desc: 'Walks + Hits per IP', basic: true },
    { id: 'ip', label: 'IP', desc: 'Innings Pitched', basic: true },
    { id: 'so', label: 'K', desc: 'Strikeouts', basic: true },
    { id: 'w', label: 'W', desc: 'Wins', basic: true },
    { id: 'sv', label: 'SV', desc: 'Saves', basic: true },
  ];

  const getMetricValue = (player: Player, metricId: string): number | null => {
    if (playerType === 'batting') {
      if (metricId in (player.trackingStats?.batting || {})) {
        return player.trackingStats?.batting?.[metricId as keyof typeof player.trackingStats.batting] ?? null;
      }
      if (metricId in (player.advancedStats.batting || {})) {
        return player.advancedStats.batting?.[metricId as keyof typeof player.advancedStats.batting] ?? null;
      }
      return player.stats.batting?.[metricId as keyof typeof player.stats.batting] ?? null;
    } else {
      if (metricId in (player.trackingStats?.pitching || {})) {
        return player.trackingStats?.pitching?.[metricId as keyof typeof player.trackingStats.pitching] ?? null;
      }
      if (metricId in (player.advancedStats.pitching || {})) {
        return player.advancedStats.pitching?.[metricId as keyof typeof player.advancedStats.pitching] ?? null;
      }
      return player.stats.pitching?.[metricId as keyof typeof player.stats.pitching] ?? null;
    }
  };

  const filteredPlayers = useMemo(() => {
    return currentPlayers.filter((player) => {
      if (selectedDivision !== 'all' && player.division !== selectedDivision) return false;
      if (selectedConference !== 'all' && player.conference !== selectedConference) return false;
      if (selectedPosition !== 'all' && player.position !== selectedPosition) return false;
      if (playerType === 'batting' && !player.stats.batting) return false;
      if (playerType === 'pitching' && !player.stats.pitching) return false;
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        return (
          player.name.toLowerCase().includes(query) ||
          player.team.toLowerCase().includes(query) ||
          player.conference.toLowerCase().includes(query)
        );
      }
      return true;
    });
  }, [currentPlayers, selectedDivision, selectedConference, selectedPosition, playerType, searchQuery]);

  const sortedPlayers = useMemo(() => {
    const reverseMetrics = ['era_minus', 'fip', 'xfip', 'fip_minus', 'k_minus_bb_pct', 'bb_per_9', 'hr_per_9', 'era', 'whip', 'xera', 'k_pct'];
    const isReverse = reverseMetrics.includes(sortConfig.key);

    return [...filteredPlayers].sort((a, b) => {
      const aVal = getMetricValue(a, sortConfig.key);
      const bVal = getMetricValue(b, sortConfig.key);

      if (aVal === null && bVal === null) return 0;
      if (aVal === null) return 1;
      if (bVal === null) return -1;

      const comparison = isReverse ? aVal - bVal : bVal - aVal;
      return sortConfig.direction === 'desc' ? comparison : -comparison;
    });
  }, [filteredPlayers, sortConfig, playerType]);

  const displayedPlayers = sortedPlayers.slice(0, displayLimit);

  const handleSort = (key: string) => {
    setSortConfig((prev) => ({
      key,
      direction: prev.key === key && prev.direction === 'desc' ? 'asc' : 'desc',
    }));
  };

  const getCurrentColumns = () => {
    return playerType === 'batting' ? battingColumns : pitchingColumns;
  };

  const getColumnInfo = (columnId: string) => {
    return getCurrentColumns().find((col) => col.id === columnId);
  };

  const formatValue = (value: number | null, columnId: string): string => {
    if (value === null) return '-';
    
    const percentageMetrics = ['k_pct', 'bb_pct', 'k_minus_bb_pct', 'hard_hit_pct', 'barrel_rate', 'sweet_spot_pct'];
    if (percentageMetrics.includes(columnId)) {
      return `${(value * 100).toFixed(1)}%`;
    }

    const integerMetrics = ['hr', 'rbi', 'r', 'sb', 'w', 'sv', 'so', 'wrc_plus', 'ops_plus', 'era_minus', 'fip_minus', 'stuff_plus', 'location_plus', 'xfip_plus'];
    if (integerMetrics.includes(columnId)) {
      return Math.round(value).toString();
    }

    if (columnId === 'ip') {
      const wholePart = Math.floor(value);
      const fraction = value - wholePart;
      const outs = Math.round(fraction * 10);
      return outs === 0 ? wholePart.toString() : `${wholePart}.${outs}`;
    }

    return value.toFixed(3);
  };

  const SortableHeader = ({ columnId, label }: { columnId: string; label: string }) => {
    const isSorted = sortConfig.key === columnId;
    const columnInfo = getColumnInfo(columnId);

    return (
      <TableHead
        className="cursor-pointer select-none hover:bg-muted/50 transition-colors"
        onClick={() => handleSort(columnId)}
      >
        <div className="flex items-center gap-1.5 justify-end font-mono text-xs">
          <span className="flex items-center gap-1">
            {label}
            {columnInfo?.tracking && <Lightning size={10} className="text-warning" />}
          </span>
          {isSorted && (
            <span className="text-primary">
              {sortConfig.direction === 'desc' ? <ArrowDown size={12} weight="bold" /> : <ArrowUp size={12} weight="bold" />}
            </span>
          )}
        </div>
      </TableHead>
    );
  };

  const currentMetrics = getCurrentColumns();
  const advancedMetrics = currentMetrics.filter((m) => m.advanced);
  const trackingMetrics = currentMetrics.filter((m) => m.tracking);
  const basicMetrics = currentMetrics.filter((m) => m.basic);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <h2 className="text-2xl font-semibold tracking-tight flex items-center gap-3">
              <ChartBar size={28} weight="bold" className="text-primary" />
              Player Leaderboards
            </h2>
            <p className="text-sm text-muted-foreground mt-1">
              Sortable rankings for all advanced sabermetric and tracking metrics
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant={useRealData ? 'default' : 'outline'}
              size="sm"
              onClick={() => setUseRealData(!useRealData)}
              disabled={loading}
              className="gap-2"
            >
              <CloudArrowDown size={16} />
              {loading ? 'Loading...' : useRealData ? 'Real Data' : 'Mock Data'}
            </Button>
          </div>
        </div>

        <Tabs value={playerType} onValueChange={(v) => setPlayerType(v as 'batting' | 'pitching')}>
          <TabsList className="grid w-full max-w-md grid-cols-2">
            <TabsTrigger value="batting" className="gap-2">
              <Baseball size={18} weight="bold" />
              Batting
            </TabsTrigger>
            <TabsTrigger value="pitching" className="gap-2">
              <TrendUp size={18} weight="bold" />
              Pitching
            </TabsTrigger>
          </TabsList>

          <TabsContent value={playerType} className="space-y-4 mt-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between gap-4 flex-wrap">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <FunnelSimple size={20} className="text-primary" />
                      Filters & Search
                    </CardTitle>
                    <CardDescription>Refine the leaderboard display</CardDescription>
                  </div>
                  <Badge variant="outline" className="font-mono">
                    {displayedPlayers.length} / {filteredPlayers.length} players
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                  <div className="space-y-2">
                    <Label className="text-xs font-medium">Search</Label>
                    <div className="relative">
                      <MagnifyingGlass size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        placeholder="Player, team, conf..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-9"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-xs font-medium">Division</Label>
                    <Select value={selectedDivision} onValueChange={setSelectedDivision}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {divisions.map((div) => (
                          <SelectItem key={div} value={div}>
                            {div === 'all' ? 'All Divisions' : div}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-xs font-medium">Conference</Label>
                    <Select value={selectedConference} onValueChange={setSelectedConference}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {conferences.map((conf) => (
                          <SelectItem key={conf} value={conf}>
                            {conf === 'all' ? 'All Conferences' : conf}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-xs font-medium">Position</Label>
                    <Select value={selectedPosition} onValueChange={setSelectedPosition}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {(playerType === 'batting' ? battingPositions : pitchingPositions).map((pos) => (
                          <SelectItem key={pos} value={pos}>
                            {pos === 'all' ? 'All Positions' : pos}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-xs font-medium">Show Top</Label>
                    <Select value={displayLimit.toString()} onValueChange={(v) => setDisplayLimit(parseInt(v))}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="25">25 players</SelectItem>
                        <SelectItem value="50">50 players</SelectItem>
                        <SelectItem value="100">100 players</SelectItem>
                        <SelectItem value="250">250 players</SelectItem>
                        <SelectItem value="999999">All players</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <Users size={16} className="text-primary" />
                    Total Players
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold font-mono">{displayedPlayers.length}</div>
                  <p className="text-xs text-muted-foreground mt-1">
                    of {filteredPlayers.length} matching filters
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <Target size={16} className="text-success" />
                    Leader
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {displayedPlayers[0] && (
                    <>
                      <div className="font-semibold truncate">{displayedPlayers[0].name}</div>
                      <p className="text-xs text-muted-foreground truncate">
                        {displayedPlayers[0].team} • {displayedPlayers[0].conference}
                      </p>
                    </>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <ChartBar size={16} className="text-accent" />
                    Sorted By
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="font-mono text-sm font-semibold">{getColumnInfo(sortConfig.key)?.label}</div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {getColumnInfo(sortConfig.key)?.desc}
                  </p>
                </CardContent>
              </Card>
            </div>

            <Tabs defaultValue="advanced" className="w-full">
              <TabsList className="grid w-full max-w-md grid-cols-3">
                <TabsTrigger value="advanced">Advanced</TabsTrigger>
                <TabsTrigger value="tracking">
                  <Lightning size={14} className="mr-1" />
                  Tracking
                </TabsTrigger>
                <TabsTrigger value="basic">Traditional</TabsTrigger>
              </TabsList>

              <TabsContent value="advanced" className="mt-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Advanced Sabermetrics</CardTitle>
                    <CardDescription>
                      Context-adjusted metrics including wRC+, WAR, wOBA, and more
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="relative overflow-x-auto rounded-lg border">
                      <Table>
                        <TableHeader className="bg-muted/50">
                          <TableRow>
                            <TableHead className="sticky left-0 bg-muted/50 z-10 w-[60px]">Rank</TableHead>
                            <TableHead className="sticky left-[60px] bg-muted/50 z-10 min-w-[180px]">Player</TableHead>
                            <TableHead className="min-w-[120px]">Team</TableHead>
                            <TableHead className="min-w-[100px]">Conf</TableHead>
                            {advancedMetrics.map((metric) => (
                              <SortableHeader key={metric.id} columnId={metric.id} label={metric.label} />
                            ))}
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {displayedPlayers.map((player, idx) => (
                            <TableRow key={player.id} className="hover:bg-muted/30">
                              <TableCell className="sticky left-0 bg-background font-medium border-r">
                                #{idx + 1}
                              </TableCell>
                              <TableCell className="sticky left-[60px] bg-background border-r">
                                <div className="flex flex-col min-w-[180px]">
                                  <span className="font-semibold">{player.name}</span>
                                  <span className="text-xs text-muted-foreground">
                                    {player.position} • {player.classYear}
                                  </span>
                                </div>
                              </TableCell>
                              <TableCell>{player.team}</TableCell>
                              <TableCell>
                                <Badge variant="outline" className="text-xs">
                                  {player.conference}
                                </Badge>
                              </TableCell>
                              {advancedMetrics.map((metric) => (
                                <TableCell
                                  key={metric.id}
                                  className={`text-right font-mono text-sm ${
                                    sortConfig.key === metric.id ? 'bg-primary/5 font-semibold' : ''
                                  }`}
                                >
                                  {formatValue(getMetricValue(player, metric.id), metric.id)}
                                </TableCell>
                              ))}
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="tracking" className="mt-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Lightning size={20} className="text-warning" />
                      Tracking Metrics (Statcast-Style)
                    </CardTitle>
                    <CardDescription>
                      TrackMan and PitchCom derived metrics including exit velocity, spin rate, and xStats
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="relative overflow-x-auto rounded-lg border">
                      <Table>
                        <TableHeader className="bg-muted/50">
                          <TableRow>
                            <TableHead className="sticky left-0 bg-muted/50 z-10 w-[60px]">Rank</TableHead>
                            <TableHead className="sticky left-[60px] bg-muted/50 z-10 min-w-[180px]">Player</TableHead>
                            <TableHead className="min-w-[120px]">Team</TableHead>
                            <TableHead className="min-w-[100px]">Conf</TableHead>
                            {trackingMetrics.map((metric) => (
                              <SortableHeader key={metric.id} columnId={metric.id} label={metric.label} />
                            ))}
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {displayedPlayers.map((player, idx) => (
                            <TableRow key={player.id} className="hover:bg-muted/30">
                              <TableCell className="sticky left-0 bg-background font-medium border-r">
                                #{idx + 1}
                              </TableCell>
                              <TableCell className="sticky left-[60px] bg-background border-r">
                                <div className="flex flex-col min-w-[180px]">
                                  <span className="font-semibold">{player.name}</span>
                                  <span className="text-xs text-muted-foreground">
                                    {player.position} • {player.classYear}
                                  </span>
                                </div>
                              </TableCell>
                              <TableCell>{player.team}</TableCell>
                              <TableCell>
                                <Badge variant="outline" className="text-xs">
                                  {player.conference}
                                </Badge>
                              </TableCell>
                              {trackingMetrics.map((metric) => (
                                <TableCell
                                  key={metric.id}
                                  className={`text-right font-mono text-sm ${
                                    sortConfig.key === metric.id ? 'bg-warning/5 font-semibold' : ''
                                  }`}
                                >
                                  {formatValue(getMetricValue(player, metric.id), metric.id)}
                                </TableCell>
                              ))}
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="basic" className="mt-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Traditional Statistics</CardTitle>
                    <CardDescription>
                      Classic box score statistics including AVG, ERA, HR, and RBI
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="relative overflow-x-auto rounded-lg border">
                      <Table>
                        <TableHeader className="bg-muted/50">
                          <TableRow>
                            <TableHead className="sticky left-0 bg-muted/50 z-10 w-[60px]">Rank</TableHead>
                            <TableHead className="sticky left-[60px] bg-muted/50 z-10 min-w-[180px]">Player</TableHead>
                            <TableHead className="min-w-[120px]">Team</TableHead>
                            <TableHead className="min-w-[100px]">Conf</TableHead>
                            {basicMetrics.map((metric) => (
                              <SortableHeader key={metric.id} columnId={metric.id} label={metric.label} />
                            ))}
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {displayedPlayers.map((player, idx) => (
                            <TableRow key={player.id} className="hover:bg-muted/30">
                              <TableCell className="sticky left-0 bg-background font-medium border-r">
                                #{idx + 1}
                              </TableCell>
                              <TableCell className="sticky left-[60px] bg-background border-r">
                                <div className="flex flex-col min-w-[180px]">
                                  <span className="font-semibold">{player.name}</span>
                                  <span className="text-xs text-muted-foreground">
                                    {player.position} • {player.classYear}
                                  </span>
                                </div>
                              </TableCell>
                              <TableCell>{player.team}</TableCell>
                              <TableCell>
                                <Badge variant="outline" className="text-xs">
                                  {player.conference}
                                </Badge>
                              </TableCell>
                              {basicMetrics.map((metric) => (
                                <TableCell
                                  key={metric.id}
                                  className={`text-right font-mono text-sm ${
                                    sortConfig.key === metric.id ? 'bg-primary/5 font-semibold' : ''
                                  }`}
                                >
                                  {formatValue(getMetricValue(player, metric.id), metric.id)}
                                </TableCell>
                              ))}
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>

            {sortedPlayers.length > displayLimit && (
              <Card className="bg-muted/30">
                <CardContent className="py-6">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="font-medium">
                        Showing {displayLimit} of {sortedPlayers.length} players
                      </p>
                      <p className="text-sm text-muted-foreground mt-1">
                        Increase the display limit to see more results
                      </p>
                    </div>
                    <Button
                      variant="outline"
                      onClick={() => setDisplayLimit((prev) => Math.min(prev + 50, 999999))}
                    >
                      Load More
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

function Label({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return <label className={`text-sm font-medium ${className}`}>{children}</label>;
}
