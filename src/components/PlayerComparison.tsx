import { useState } from 'react';
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
import { Separator } from '@/components/ui/separator';
import {
  Users,
  TrendUp,
  ArrowsLeftRight,
  Baseball,
  ChartBar,
  Target,
  Lightning,
} from '@phosphor-icons/react';
import { mockPlayers, type Player } from '@/lib/playerData';

export function PlayerComparison() {
  const [selectedDivision, setSelectedDivision] = useState<string>('all');
  const [selectedConference, setSelectedConference] = useState<string>('all');
  const [selectedPosition, setSelectedPosition] = useState<string>('all');
  const [selectedMetric, setSelectedMetric] = useState<string>('wrc_plus');
  const [playerType, setPlayerType] = useState<'batting' | 'pitching'>('batting');
  const [compareMode, setCompareMode] = useState(false);
  const [selectedPlayers, setSelectedPlayers] = useState<string[]>([]);

  const divisions = ['all', 'D1', 'D2', 'D3'];
  const conferences = [
    'all',
    ...Array.from(new Set(mockPlayers.map((p) => p.conference))),
  ];
  const battingPositions = ['all', 'C', '1B', '2B', '3B', 'SS', 'OF'];
  const pitchingPositions = ['all', 'SP', 'RP', 'CL'];

  const battingMetrics = [
    { id: 'wrc_plus', label: 'wRC+', desc: 'Weighted Runs Created Plus' },
    { id: 'war', label: 'WAR', desc: 'Wins Above Replacement' },
    { id: 'woba', label: 'wOBA', desc: 'Weighted On-Base Average' },
    { id: 'ops_plus', label: 'OPS+', desc: 'OPS Plus' },
    { id: 'iso', label: 'ISO', desc: 'Isolated Power' },
    { id: 'k_minus_bb_pct', label: 'K-BB%', desc: 'Strikeout minus Walk Rate' },
    { id: 'wpa', label: 'WPA', desc: 'Win Probability Added' },
    { id: 'exit_velo_avg', label: 'Avg EV', desc: 'Average Exit Velocity', tracking: true },
    { id: 'barrel_rate', label: 'Barrel%', desc: 'Barrel Rate', tracking: true },
  ];

  const pitchingMetrics = [
    { id: 'era_minus', label: 'ERA-', desc: 'ERA Minus (lower is better)' },
    { id: 'fip', label: 'FIP', desc: 'Fielding Independent Pitching' },
    { id: 'war', label: 'WAR', desc: 'Wins Above Replacement' },
    { id: 'k_per_9', label: 'K/9', desc: 'Strikeouts per 9 innings' },
    { id: 'k_minus_bb_pct', label: 'K-BB%', desc: 'Strikeout minus Walk Rate' },
    { id: 'wpa', label: 'WPA', desc: 'Win Probability Added' },
    { id: 'fastball_velo_avg', label: 'Avg FB', desc: 'Average Fastball Velocity', tracking: true },
    { id: 'stuff_plus', label: 'Stuff+', desc: 'Stuff Plus', tracking: true },
  ];

  const filterPlayers = (): Player[] => {
    return mockPlayers.filter((player) => {
      if (selectedDivision !== 'all' && player.division !== selectedDivision) return false;
      if (selectedConference !== 'all' && player.conference !== selectedConference) return false;
      if (selectedPosition !== 'all' && player.position !== selectedPosition) return false;
      if (playerType === 'batting' && !player.stats.batting) return false;
      if (playerType === 'pitching' && !player.stats.pitching) return false;
      return true;
    });
  };

  const getMetricValue = (player: Player, metricId: string): number | null => {
    if (playerType === 'batting') {
      if (metricId === 'exit_velo_avg' || metricId === 'barrel_rate') {
        return player.trackingStats?.batting?.[metricId as keyof typeof player.trackingStats.batting] ?? null;
      }
      return player.advancedStats.batting?.[metricId as keyof typeof player.advancedStats.batting] ?? null;
    } else {
      if (metricId === 'fastball_velo_avg' || metricId === 'stuff_plus') {
        return player.trackingStats?.pitching?.[metricId as keyof typeof player.trackingStats.pitching] ?? null;
      }
      return player.advancedStats.pitching?.[metricId as keyof typeof player.advancedStats.pitching] ?? null;
    }
  };

  const sortPlayers = (players: Player[]): Player[] => {
    const reverseMetrics = ['era_minus', 'fip', 'xfip', 'k_minus_bb_pct'];
    const isReverse = reverseMetrics.includes(selectedMetric);

    return [...players].sort((a, b) => {
      const aVal = getMetricValue(a, selectedMetric) ?? -Infinity;
      const bVal = getMetricValue(b, selectedMetric) ?? -Infinity;
      return isReverse ? aVal - bVal : bVal - aVal;
    });
  };

  const togglePlayerSelection = (playerId: string) => {
    if (selectedPlayers.includes(playerId)) {
      setSelectedPlayers(selectedPlayers.filter((id) => id !== playerId));
    } else if (selectedPlayers.length < 4) {
      setSelectedPlayers([...selectedPlayers, playerId]);
    }
  };

  const filteredPlayers = filterPlayers();
  const sortedPlayers = sortPlayers(filteredPlayers);
  const topPlayers = sortedPlayers.slice(0, 20);

  const renderLeaderboard = () => {
    const metrics = playerType === 'batting' ? battingMetrics : pitchingMetrics;
    const currentMetric = metrics.find((m) => m.id === selectedMetric);

    return (
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Users size={16} className="text-primary" />
                Players Displayed
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold font-mono">{topPlayers.length}</div>
              <p className="text-xs text-muted-foreground mt-1">of {filteredPlayers.length} matching</p>
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
              {topPlayers[0] && (
                <>
                  <div className="font-semibold">{topPlayers[0].name}</div>
                  <p className="text-xs text-muted-foreground">
                    {topPlayers[0].team} • {topPlayers[0].conference}
                  </p>
                </>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <ChartBar size={16} className="text-accent" />
                Metric Range
              </CardTitle>
            </CardHeader>
            <CardContent>
              {topPlayers.length > 0 && (
                <>
                  <div className="font-mono text-sm">
                    {getMetricValue(topPlayers[0], selectedMetric)?.toFixed(1)} →{' '}
                    {getMetricValue(topPlayers[topPlayers.length - 1], selectedMetric)?.toFixed(1)}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">{currentMetric?.label} range</p>
                </>
              )}
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">
              Top {playerType === 'batting' ? 'Hitters' : 'Pitchers'} by {currentMetric?.label}
            </CardTitle>
            <CardDescription>{currentMetric?.desc}</CardDescription>
            {currentMetric?.tracking && (
              <Badge variant="outline" className="w-fit mt-2">
                <Lightning size={12} className="mr-1" />
                Tracking Data Required
              </Badge>
            )}
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[50px]">Rank</TableHead>
                  {compareMode && <TableHead className="w-[50px]">Select</TableHead>}
                  <TableHead>Player</TableHead>
                  <TableHead>Team</TableHead>
                  <TableHead>Conf</TableHead>
                  <TableHead>Div</TableHead>
                  <TableHead>Pos</TableHead>
                  <TableHead className="text-right font-mono">{currentMetric?.label}</TableHead>
                  {playerType === 'batting' ? (
                    <>
                      <TableHead className="text-right font-mono">AVG</TableHead>
                      <TableHead className="text-right font-mono">OPS</TableHead>
                      <TableHead className="text-right font-mono">HR</TableHead>
                    </>
                  ) : (
                    <>
                      <TableHead className="text-right font-mono">ERA</TableHead>
                      <TableHead className="text-right font-mono">IP</TableHead>
                      <TableHead className="text-right font-mono">K</TableHead>
                    </>
                  )}
                </TableRow>
              </TableHeader>
              <TableBody>
                {topPlayers.map((player, idx) => {
                  const metricValue = getMetricValue(player, selectedMetric);
                  const isSelected = selectedPlayers.includes(player.id);

                  return (
                    <TableRow
                      key={player.id}
                      className={isSelected ? 'bg-primary/5 border-l-2 border-l-primary' : ''}
                    >
                      <TableCell className="font-medium">#{idx + 1}</TableCell>
                      {compareMode && (
                        <TableCell>
                          <Button
                            variant={isSelected ? 'default' : 'outline'}
                            size="sm"
                            className="h-7 w-7 p-0"
                            onClick={() => togglePlayerSelection(player.id)}
                            disabled={!isSelected && selectedPlayers.length >= 4}
                          >
                            {isSelected ? '✓' : '+'}
                          </Button>
                        </TableCell>
                      )}
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="font-semibold">{player.name}</span>
                          <span className="text-xs text-muted-foreground">{player.classYear}</span>
                        </div>
                      </TableCell>
                      <TableCell>{player.team}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className="text-xs">
                          {player.conference}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary" className="text-xs">
                          {player.division}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge className="text-xs">{player.position}</Badge>
                      </TableCell>
                      <TableCell className="text-right font-mono font-semibold">
                        {metricValue !== null ? metricValue.toFixed(1) : 'N/A'}
                      </TableCell>
                      {playerType === 'batting' ? (
                        <>
                          <TableCell className="text-right font-mono text-sm">
                            {player.stats.batting?.avg.toFixed(3)}
                          </TableCell>
                          <TableCell className="text-right font-mono text-sm">
                            {player.stats.batting?.ops.toFixed(3)}
                          </TableCell>
                          <TableCell className="text-right font-mono text-sm">
                            {player.stats.batting?.hr}
                          </TableCell>
                        </>
                      ) : (
                        <>
                          <TableCell className="text-right font-mono text-sm">
                            {player.stats.pitching?.era.toFixed(2)}
                          </TableCell>
                          <TableCell className="text-right font-mono text-sm">
                            {player.stats.pitching?.ip.toFixed(1)}
                          </TableCell>
                          <TableCell className="text-right font-mono text-sm">
                            {player.stats.pitching?.so}
                          </TableCell>
                        </>
                      )}
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    );
  };

  const renderComparison = () => {
    const selectedPlayerObjs = mockPlayers.filter((p) => selectedPlayers.includes(p.id));
    const metrics = playerType === 'batting' ? battingMetrics : pitchingMetrics;

    if (selectedPlayerObjs.length === 0) {
      return (
        <Card>
          <CardContent className="py-12 text-center">
            <ArrowsLeftRight size={48} className="mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">Select Players to Compare</h3>
            <p className="text-muted-foreground">
              Enable comparison mode and select 2-4 players from the leaderboard to compare their
              advanced stats
            </p>
          </CardContent>
        </Card>
      );
    }

    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {selectedPlayerObjs.map((player) => (
            <Card key={player.id} className="border-2 border-primary/20">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-base">{player.name}</CardTitle>
                    <CardDescription className="text-xs">
                      {player.team} • {player.conference}
                    </CardDescription>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 w-6 p-0 text-muted-foreground hover:text-destructive"
                    onClick={() => togglePlayerSelection(player.id)}
                  >
                    ×
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">Position</span>
                    <Badge className="text-xs">{player.position}</Badge>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">Division</span>
                    <Badge variant="secondary" className="text-xs">
                      {player.division}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">Class</span>
                    <span className="font-mono">{player.classYear}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Advanced Metrics Comparison</CardTitle>
            <CardDescription>
              Side-by-side comparison of key performance indicators
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[180px]">Metric</TableHead>
                  {selectedPlayerObjs.map((player) => (
                    <TableHead key={player.id} className="text-right font-mono">
                      {player.name.split(' ')[0]}
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {metrics
                  .filter((m) => !m.tracking)
                  .map((metric) => {
                    const values = selectedPlayerObjs.map((p) => getMetricValue(p, metric.id));
                    const maxValue = Math.max(...values.filter((v) => v !== null) as number[]);
                    const reverseMetrics = ['era_minus', 'fip', 'xfip'];
                    const minValue = Math.min(...values.filter((v) => v !== null) as number[]);

                    return (
                      <TableRow key={metric.id}>
                        <TableCell>
                          <div className="flex flex-col">
                            <span className="font-semibold">{metric.label}</span>
                            <span className="text-xs text-muted-foreground">{metric.desc}</span>
                          </div>
                        </TableCell>
                        {selectedPlayerObjs.map((player, idx) => {
                          const value = values[idx];
                          const isBest =
                            value !== null &&
                            (reverseMetrics.includes(metric.id)
                              ? value === minValue
                              : value === maxValue);

                          return (
                            <TableCell
                              key={player.id}
                              className={`text-right font-mono ${
                                isBest ? 'bg-success/10 font-bold' : ''
                              }`}
                            >
                              {value !== null ? value.toFixed(metric.id.includes('pct') ? 3 : 1) : 'N/A'}
                            </TableCell>
                          );
                        })}
                      </TableRow>
                    );
                  })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {selectedPlayerObjs.every((p) => p.trackingStats) && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lightning size={20} className="text-accent" />
                Tracking Stats Comparison
              </CardTitle>
              <CardDescription>Advanced tracking data from TrackMan/HawkEye</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[180px]">Metric</TableHead>
                    {selectedPlayerObjs.map((player) => (
                      <TableHead key={player.id} className="text-right font-mono">
                        {player.name.split(' ')[0]}
                      </TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {metrics
                    .filter((m) => m.tracking)
                    .map((metric) => {
                      const values = selectedPlayerObjs.map((p) => getMetricValue(p, metric.id));
                      const maxValue = Math.max(...values.filter((v) => v !== null) as number[]);

                      return (
                        <TableRow key={metric.id}>
                          <TableCell>
                            <div className="flex flex-col">
                              <span className="font-semibold">{metric.label}</span>
                              <span className="text-xs text-muted-foreground">{metric.desc}</span>
                            </div>
                          </TableCell>
                          {selectedPlayerObjs.map((player, idx) => {
                            const value = values[idx];
                            const isBest = value !== null && value === maxValue;

                            return (
                              <TableCell
                                key={player.id}
                                className={`text-right font-mono ${
                                  isBest ? 'bg-accent/10 font-bold' : ''
                                }`}
                              >
                                {value !== null ? value.toFixed(1) : 'N/A'}
                              </TableCell>
                            );
                          })}
                        </TableRow>
                      );
                    })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold mb-2">Player Performance Comparison</h2>
        <p className="text-muted-foreground">
          Compare top performers across divisions with advanced sabermetrics, context-adjusted
          metrics, and tracking data. View leaderboards or select players for head-to-head analysis.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Filters & Settings</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Button
              variant={playerType === 'batting' ? 'default' : 'outline'}
              onClick={() => {
                setPlayerType('batting');
                setSelectedPlayers([]);
                setSelectedMetric('wrc_plus');
              }}
              className="flex-1 gap-2"
            >
              <Baseball size={16} />
              Batters
            </Button>
            <Button
              variant={playerType === 'pitching' ? 'default' : 'outline'}
              onClick={() => {
                setPlayerType('pitching');
                setSelectedPlayers([]);
                setSelectedMetric('era_minus');
              }}
              className="flex-1 gap-2"
            >
              <TrendUp size={16} />
              Pitchers
            </Button>
          </div>

          <Separator />

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Division</label>
              <Select value={selectedDivision} onValueChange={setSelectedDivision}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {divisions.map((div) => (
                    <SelectItem key={div} value={div}>
                      {div === 'all' ? 'All Divisions' : `Division ${div}`}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Conference</label>
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
              <label className="text-sm font-medium">Position</label>
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
              <label className="text-sm font-medium">Sort By</label>
              <Select value={selectedMetric} onValueChange={setSelectedMetric}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {(playerType === 'batting' ? battingMetrics : pitchingMetrics).map((metric) => (
                    <SelectItem key={metric.id} value={metric.id}>
                      {metric.label} {metric.tracking && '⚡'}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs value={compareMode ? 'compare' : 'leaderboard'} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="leaderboard" onClick={() => setCompareMode(false)}>
            Leaderboard View
          </TabsTrigger>
          <TabsTrigger value="compare" onClick={() => setCompareMode(true)}>
            <ArrowsLeftRight size={16} className="mr-2" />
            Compare Players {selectedPlayers.length > 0 && `(${selectedPlayers.length})`}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="leaderboard" className="mt-6">
          {renderLeaderboard()}
        </TabsContent>

        <TabsContent value="compare" className="mt-6">
          {!compareMode && renderLeaderboard()}
          {compareMode && renderComparison()}
        </TabsContent>
      </Tabs>
    </div>
  );
}
