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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Separator } from '@/components/ui/separator';
import { ArrowsLeftRight, TrendUp, TrendDown, Equals, ChartBar } from '@phosphor-icons/react';
import { comparisonData, type DivisionStats, type ConferenceStats } from '@/lib/comparisonData';

export function ComparisonTool() {
  const [selectedDivision1, setSelectedDivision1] = useState<string>('D1');
  const [selectedDivision2, setSelectedDivision2] = useState<string>('D2');
  const [selectedConference1, setSelectedConference1] = useState<string>('sec');
  const [selectedConference2, setSelectedConference2] = useState<string>('acc');
  const [selectedMetric, setSelectedMetric] = useState<string>('batting');

  const divisions = ['D1', 'D2', 'D3'];
  const conferences = comparisonData.conferences.map((c) => c.id);

  const getDivisionStats = (division: string): DivisionStats | undefined => {
    return comparisonData.divisions.find((d) => d.division === division);
  };

  const getConferenceStats = (conferenceId: string): ConferenceStats | undefined => {
    return comparisonData.conferences.find((c) => c.id === conferenceId);
  };

  const renderComparisonIndicator = (value1: number, value2: number, reverse = false) => {
    const diff = ((value1 - value2) / value2) * 100;
    const isHigher = reverse ? diff < 0 : diff > 0;
    const absValue = Math.abs(diff);

    if (absValue < 1) {
      return (
        <div className="flex items-center gap-1 text-muted-foreground">
          <Equals size={16} />
          <span className="text-xs">~equal</span>
        </div>
      );
    }

    return (
      <div className={`flex items-center gap-1 ${isHigher ? 'text-success' : 'text-warning'}`}>
        {isHigher ? <TrendUp size={16} /> : <TrendDown size={16} />}
        <span className="text-xs font-medium">{absValue.toFixed(1)}%</span>
      </div>
    );
  };

  const renderDivisionComparison = () => {
    const div1 = getDivisionStats(selectedDivision1);
    const div2 = getDivisionStats(selectedDivision2);

    if (!div1 || !div2) return null;

    type BattingKey = keyof typeof div1.batting;
    type PitchingKey = keyof typeof div1.pitching;

    const metrics = {
      batting: [
        { label: 'AVG', key: 'avg' as BattingKey, reverse: false },
        { label: 'OBP', key: 'obp' as BattingKey, reverse: false },
        { label: 'SLG', key: 'slg' as BattingKey, reverse: false },
        { label: 'wOBA', key: 'woba' as BattingKey, reverse: false },
        { label: 'ISO', key: 'iso' as BattingKey, reverse: false },
        { label: 'BABIP', key: 'babip' as BattingKey, reverse: false },
        { label: 'K%', key: 'k_pct' as BattingKey, reverse: true },
        { label: 'BB%', key: 'bb_pct' as BattingKey, reverse: false },
      ],
      pitching: [
        { label: 'ERA', key: 'era' as PitchingKey, reverse: true },
        { label: 'WHIP', key: 'whip' as PitchingKey, reverse: true },
        { label: 'FIP', key: 'fip' as PitchingKey, reverse: true },
        { label: 'K/9', key: 'k_per_9' as PitchingKey, reverse: false },
        { label: 'BB/9', key: 'bb_per_9' as PitchingKey, reverse: true },
        { label: 'HR/9', key: 'hr_per_9' as PitchingKey, reverse: true },
        { label: 'K-BB%', key: 'k_minus_bb_pct' as PitchingKey, reverse: false },
      ],
    };

    const metricSet = selectedMetric === 'batting' ? metrics.batting : metrics.pitching;
    const stats1 = selectedMetric === 'batting' ? div1.batting : div1.pitching;
    const stats2 = selectedMetric === 'batting' ? div2.batting : div2.pitching;

    return (
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
          <Card className="border-2 border-primary/20">
            <CardHeader className="pb-3">
              <Badge className="w-fit mb-2">{selectedDivision1}</Badge>
              <CardTitle className="text-xl">Division {selectedDivision1}</CardTitle>
              <CardDescription>{div1.teams} teams • {div1.games} games</CardDescription>
            </CardHeader>
          </Card>

          <div className="flex justify-center">
            <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center">
              <ArrowsLeftRight size={24} className="text-muted-foreground" />
            </div>
          </div>

          <Card className="border-2 border-accent/20">
            <CardHeader className="pb-3">
              <Badge className="w-fit mb-2" variant="secondary">
                {selectedDivision2}
              </Badge>
              <CardTitle className="text-xl">Division {selectedDivision2}</CardTitle>
              <CardDescription>{div2.teams} teams • {div2.games} games</CardDescription>
            </CardHeader>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">
              {selectedMetric === 'batting' ? 'Batting Metrics' : 'Pitching Metrics'}
            </CardTitle>
            <CardDescription>
              League-wide averages with context adjustments applied
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[120px]">Metric</TableHead>
                  <TableHead className="text-right font-mono">{selectedDivision1}</TableHead>
                  <TableHead className="text-center w-[100px]">Comparison</TableHead>
                  <TableHead className="text-right font-mono">{selectedDivision2}</TableHead>
                  <TableHead className="text-right">Difference</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {metricSet.map((metric) => {
                  const val1 = stats1[metric.key as keyof typeof stats1] as number;
                  const val2 = stats2[metric.key as keyof typeof stats2] as number;
                  const diff = val1 - val2;

                  return (
                    <TableRow key={metric.label}>
                      <TableCell className="font-medium">{metric.label}</TableCell>
                      <TableCell className="text-right font-mono text-sm">
                        {val1.toFixed(3)}
                      </TableCell>
                      <TableCell className="text-center">
                        {renderComparisonIndicator(val1, val2, metric.reverse)}
                      </TableCell>
                      <TableCell className="text-right font-mono text-sm">
                        {val2.toFixed(3)}
                      </TableCell>
                      <TableCell className="text-right font-mono text-sm text-muted-foreground">
                        {diff > 0 ? '+' : ''}
                        {diff.toFixed(3)}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <ChartBar size={16} className="text-primary" />
                Park Factor Context
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Avg Park Factor</span>
                <div className="flex gap-4">
                  <span className="font-mono text-sm">{div1.parkFactor.toFixed(2)}</span>
                  <span className="text-muted-foreground">vs</span>
                  <span className="font-mono text-sm">{div2.parkFactor.toFixed(2)}</span>
                </div>
              </div>
              <Separator />
              <p className="text-xs text-muted-foreground">
                Park factors above 1.00 indicate hitter-friendly environments. Division averages
                help normalize cross-division comparisons.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <TrendUp size={16} className="text-success" />
                Sample Size Context
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Avg PA per Team</span>
                <div className="flex gap-4">
                  <span className="font-mono text-sm">{div1.avgPaPerTeam}</span>
                  <span className="text-muted-foreground">vs</span>
                  <span className="font-mono text-sm">{div2.avgPaPerTeam}</span>
                </div>
              </div>
              <Separator />
              <p className="text-xs text-muted-foreground">
                Larger samples provide more stable estimates. Metrics from divisions with fewer
                games include higher uncertainty.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  };

  const renderConferenceComparison = () => {
    const conf1 = getConferenceStats(selectedConference1);
    const conf2 = getConferenceStats(selectedConference2);

    if (!conf1 || !conf2) return null;

    type ConfBattingKey = keyof typeof conf1.batting;
    type ConfPitchingKey = keyof typeof conf1.pitching;

    const metrics = {
      batting: [
        { label: 'AVG', key: 'avg' as ConfBattingKey, reverse: false },
        { label: 'OBP', key: 'obp' as ConfBattingKey, reverse: false },
        { label: 'SLG', key: 'slg' as ConfBattingKey, reverse: false },
        { label: 'wOBA', key: 'woba' as ConfBattingKey, reverse: false },
        { label: 'wRC+', key: 'wrc_plus' as ConfBattingKey, reverse: false },
      ],
      pitching: [
        { label: 'ERA', key: 'era' as ConfPitchingKey, reverse: true },
        { label: 'FIP', key: 'fip' as ConfPitchingKey, reverse: true },
        { label: 'K/9', key: 'k_per_9' as ConfPitchingKey, reverse: false },
        { label: 'BB/9', key: 'bb_per_9' as ConfPitchingKey, reverse: true },
        { label: 'ERA-', key: 'era_minus' as ConfPitchingKey, reverse: true },
      ],
    };

    const metricSet = selectedMetric === 'batting' ? metrics.batting : metrics.pitching;
    const stats1 = selectedMetric === 'batting' ? conf1.batting : conf1.pitching;
    const stats2 = selectedMetric === 'batting' ? conf2.batting : conf2.pitching;

    return (
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
          <Card className="border-2 border-primary/20">
            <CardHeader className="pb-3">
              <Badge className="w-fit mb-2">{conf1.name}</Badge>
              <CardTitle className="text-xl">{conf1.fullName}</CardTitle>
              <CardDescription>
                {conf1.teams} teams • Division {conf1.division}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="text-xs">
                  {conf1.trackingCoverage}% tracking
                </Badge>
                {conf1.trackingVendor && (
                  <Badge variant="outline" className="text-xs">
                    {conf1.trackingVendor}
                  </Badge>
                )}
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-center">
            <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center">
              <ArrowsLeftRight size={24} className="text-muted-foreground" />
            </div>
          </div>

          <Card className="border-2 border-accent/20">
            <CardHeader className="pb-3">
              <Badge className="w-fit mb-2" variant="secondary">
                {conf2.name}
              </Badge>
              <CardTitle className="text-xl">{conf2.fullName}</CardTitle>
              <CardDescription>
                {conf2.teams} teams • Division {conf2.division}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="text-xs">
                  {conf2.trackingCoverage}% tracking
                </Badge>
                {conf2.trackingVendor && (
                  <Badge variant="outline" className="text-xs">
                    {conf2.trackingVendor}
                  </Badge>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">
              {selectedMetric === 'batting' ? 'Batting Metrics' : 'Pitching Metrics'}
            </CardTitle>
            <CardDescription>Conference averages with strength-of-schedule adjustments</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[120px]">Metric</TableHead>
                  <TableHead className="text-right font-mono">{conf1.name}</TableHead>
                  <TableHead className="text-center w-[100px]">Comparison</TableHead>
                  <TableHead className="text-right font-mono">{conf2.name}</TableHead>
                  <TableHead className="text-right">Difference</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {metricSet.map((metric) => {
                  const val1 = stats1[metric.key as keyof typeof stats1] as number;
                  const val2 = stats2[metric.key as keyof typeof stats2] as number;
                  const diff = val1 - val2;

                  return (
                    <TableRow key={metric.label}>
                      <TableCell className="font-medium">{metric.label}</TableCell>
                      <TableCell className="text-right font-mono text-sm">
                        {val1 > 10 ? val1.toFixed(0) : val1.toFixed(3)}
                      </TableCell>
                      <TableCell className="text-center">
                        {renderComparisonIndicator(val1, val2, metric.reverse || false)}
                      </TableCell>
                      <TableCell className="text-right font-mono text-sm">
                        {val2 > 10 ? val2.toFixed(0) : val2.toFixed(3)}
                      </TableCell>
                      <TableCell className="text-right font-mono text-sm text-muted-foreground">
                        {diff > 0 ? '+' : ''}
                        {Math.abs(diff) > 10 ? diff.toFixed(0) : diff.toFixed(3)}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">RPI Context</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-xs text-muted-foreground">Avg RPI</span>
                <div className="flex gap-3">
                  <span className="font-mono text-sm">{conf1.avgRpi.toFixed(3)}</span>
                  <span className="text-muted-foreground text-xs">vs</span>
                  <span className="font-mono text-sm">{conf2.avgRpi.toFixed(3)}</span>
                </div>
              </div>
              <p className="text-xs text-muted-foreground pt-2">
                Lower RPI indicates stronger schedule performance
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Strength of Schedule</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-xs text-muted-foreground">SOS Rating</span>
                <div className="flex gap-3">
                  <span className="font-mono text-sm">{conf1.strengthOfSchedule.toFixed(2)}</span>
                  <span className="text-muted-foreground text-xs">vs</span>
                  <span className="font-mono text-sm">{conf2.strengthOfSchedule.toFixed(2)}</span>
                </div>
              </div>
              <p className="text-xs text-muted-foreground pt-2">
                Higher values indicate tougher competition
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Park Factors</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-xs text-muted-foreground">Avg Park</span>
                <div className="flex gap-3">
                  <span className="font-mono text-sm">{conf1.avgParkFactor.toFixed(2)}</span>
                  <span className="text-muted-foreground text-xs">vs</span>
                  <span className="font-mono text-sm">{conf2.avgParkFactor.toFixed(2)}</span>
                </div>
              </div>
              <p className="text-xs text-muted-foreground pt-2">
                Conference-wide park environment baseline
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold mb-2">Metrics Comparison Tool</h2>
        <p className="text-muted-foreground">
          Benchmark sabermetric performance across divisions and conferences with context-adjusted
          metrics, park factors, and strength-of-schedule normalization.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Comparison Settings</CardTitle>
          <CardDescription>Select metric category to compare</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            <Button
              variant={selectedMetric === 'batting' ? 'default' : 'outline'}
              onClick={() => setSelectedMetric('batting')}
              className="flex-1"
            >
              Batting Metrics
            </Button>
            <Button
              variant={selectedMetric === 'pitching' ? 'default' : 'outline'}
              onClick={() => setSelectedMetric('pitching')}
              className="flex-1"
            >
              Pitching Metrics
            </Button>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="divisions" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="divisions">Division Comparison</TabsTrigger>
          <TabsTrigger value="conferences">Conference Comparison</TabsTrigger>
        </TabsList>

        <TabsContent value="divisions" className="mt-6 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Select Divisions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Division 1</Label>
                  <Select value={selectedDivision1} onValueChange={setSelectedDivision1}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {divisions.map((div) => (
                        <SelectItem key={div} value={div} disabled={div === selectedDivision2}>
                          Division {div}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Division 2</Label>
                  <Select value={selectedDivision2} onValueChange={setSelectedDivision2}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {divisions.map((div) => (
                        <SelectItem key={div} value={div} disabled={div === selectedDivision1}>
                          Division {div}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {renderDivisionComparison()}
        </TabsContent>

        <TabsContent value="conferences" className="mt-6 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Select Conferences</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Conference 1</Label>
                  <Select value={selectedConference1} onValueChange={setSelectedConference1}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {comparisonData.conferences.map((conf) => (
                        <SelectItem
                          key={conf.id}
                          value={conf.id}
                          disabled={conf.id === selectedConference2}
                        >
                          {conf.fullName} ({conf.name})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Conference 2</Label>
                  <Select value={selectedConference2} onValueChange={setSelectedConference2}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {comparisonData.conferences.map((conf) => (
                        <SelectItem
                          key={conf.id}
                          value={conf.id}
                          disabled={conf.id === selectedConference1}
                        >
                          {conf.fullName} ({conf.name})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {renderConferenceComparison()}
        </TabsContent>
      </Tabs>
    </div>
  );
}

function Label({ className, children }: { className?: string; children: React.ReactNode }) {
  return <label className={className}>{children}</label>;
}
