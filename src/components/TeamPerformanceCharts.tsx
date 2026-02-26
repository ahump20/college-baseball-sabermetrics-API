import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useESPNTeams, ESPNTeam } from '@/hooks/use-espn-teams';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts';
import { TrendUp, ChartLine, ChartBar } from '@phosphor-icons/react';
import { useState } from 'react';
import { motion } from 'framer-motion';

const generateMockPerformanceData = (teamName: string) => {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
  return months.map((month, i) => ({
    month,
    wins: Math.floor(Math.random() * 15) + 5,
    losses: Math.floor(Math.random() * 10) + 2,
    runs: Math.floor(Math.random() * 80) + 40,
    hits: Math.floor(Math.random() * 120) + 60,
  }));
};

const generateMockRadarData = (teamName: string) => {
  return [
    { stat: 'Offense', value: Math.floor(Math.random() * 40) + 60 },
    { stat: 'Defense', value: Math.floor(Math.random() * 40) + 60 },
    { stat: 'Pitching', value: Math.floor(Math.random() * 40) + 60 },
    { stat: 'Fielding', value: Math.floor(Math.random() * 40) + 60 },
    { stat: 'Speed', value: Math.floor(Math.random() * 40) + 60 },
    { stat: 'Power', value: Math.floor(Math.random() * 40) + 60 },
  ];
};

export function TeamPerformanceCharts() {
  const { teams, isLoading } = useESPNTeams();
  const [selectedTeamId, setSelectedTeamId] = useState<string>('');
  const [chartType, setChartType] = useState<'line' | 'bar' | 'radar'>('line');

  const selectedTeam = teams?.find(t => t.id === selectedTeamId);
  const performanceData = selectedTeam ? generateMockPerformanceData(selectedTeam.displayName) : [];
  const radarData = selectedTeam ? generateMockRadarData(selectedTeam.displayName) : [];

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Card className="p-6">
          <Skeleton className="h-64 w-full" />
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div>
          <h3 className="text-xl font-semibold text-foreground mb-1 flex items-center gap-2">
            <TrendUp size={24} weight="bold" className="text-primary" />
            Team Performance Trends
          </h3>
          <p className="text-sm text-muted-foreground">
            Visualize team statistics and performance over time
          </p>
        </div>
        <div className="flex gap-3 items-center flex-wrap">
          <Select value={selectedTeamId} onValueChange={setSelectedTeamId}>
            <SelectTrigger className="w-[240px]">
              <SelectValue placeholder="Select a team" />
            </SelectTrigger>
            <SelectContent>
              {teams?.slice(0, 50).map((team) => (
                <SelectItem key={team.id} value={team.id}>
                  {team.displayName}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <div className="flex gap-2">
            <Button
              variant={chartType === 'line' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setChartType('line')}
              className="gap-2"
            >
              <ChartLine size={16} />
              Line
            </Button>
            <Button
              variant={chartType === 'bar' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setChartType('bar')}
              className="gap-2"
            >
              <ChartBar size={16} />
              Bar
            </Button>
            <Button
              variant={chartType === 'radar' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setChartType('radar')}
              className="gap-2"
            >
              <TrendUp size={16} />
              Radar
            </Button>
          </div>
        </div>
      </div>

      {!selectedTeam ? (
        <Card className="p-16">
          <p className="text-center text-muted-foreground">
            Select a team to view performance trends
          </p>
        </Card>
      ) : (
        <motion.div
          key={selectedTeamId + chartType}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          <Card className="p-6 border-2" style={{ borderColor: selectedTeam.color ? `#${selectedTeam.color}` : undefined }}>
            <div className="flex items-center gap-4 mb-6">
              {selectedTeam.logos?.[0] && (
                <div className="w-16 h-16 rounded-lg p-2 bg-white flex items-center justify-center shadow-sm">
                  <img
                    src={selectedTeam.logos[0].href}
                    alt={selectedTeam.displayName}
                    className="w-full h-full object-contain"
                  />
                </div>
              )}
              <div>
                <h4 className="text-2xl font-bold text-foreground">{selectedTeam.displayName}</h4>
                <p className="text-sm text-muted-foreground font-mono">{selectedTeam.abbreviation}</p>
              </div>
            </div>

            {chartType !== 'radar' && (
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  {chartType === 'line' ? (
                    <LineChart data={performanceData}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                      <XAxis dataKey="month" className="text-xs" />
                      <YAxis className="text-xs" />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: 'oklch(var(--card))',
                          border: '1px solid oklch(var(--border))',
                          borderRadius: '0.5rem',
                        }}
                      />
                      <Legend />
                      <Line
                        type="monotone"
                        dataKey="wins"
                        stroke={selectedTeam.color ? `#${selectedTeam.color}` : 'oklch(var(--primary))'}
                        strokeWidth={3}
                        dot={{ r: 5 }}
                        name="Wins"
                      />
                      <Line
                        type="monotone"
                        dataKey="losses"
                        stroke={selectedTeam.alternateColor ? `#${selectedTeam.alternateColor}` : 'oklch(var(--destructive))'}
                        strokeWidth={3}
                        dot={{ r: 5 }}
                        name="Losses"
                      />
                      <Line
                        type="monotone"
                        dataKey="runs"
                        stroke="oklch(var(--accent))"
                        strokeWidth={2}
                        dot={{ r: 4 }}
                        name="Runs"
                      />
                    </LineChart>
                  ) : (
                    <BarChart data={performanceData}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                      <XAxis dataKey="month" className="text-xs" />
                      <YAxis className="text-xs" />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: 'oklch(var(--card))',
                          border: '1px solid oklch(var(--border))',
                          borderRadius: '0.5rem',
                        }}
                      />
                      <Legend />
                      <Bar
                        dataKey="wins"
                        fill={selectedTeam.color ? `#${selectedTeam.color}` : 'oklch(var(--primary))'}
                        name="Wins"
                      />
                      <Bar
                        dataKey="losses"
                        fill={selectedTeam.alternateColor ? `#${selectedTeam.alternateColor}` : 'oklch(var(--destructive))'}
                        name="Losses"
                      />
                      <Bar dataKey="hits" fill="oklch(var(--accent))" name="Hits" />
                    </BarChart>
                  )}
                </ResponsiveContainer>
              </div>
            )}

            {chartType === 'radar' && (
              <div className="h-96 flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart data={radarData}>
                    <PolarGrid className="stroke-border" />
                    <PolarAngleAxis dataKey="stat" className="text-sm" />
                    <PolarRadiusAxis angle={90} domain={[0, 100]} className="text-xs" />
                    <Radar
                      name={selectedTeam.displayName}
                      dataKey="value"
                      stroke={selectedTeam.color ? `#${selectedTeam.color}` : 'oklch(var(--primary))'}
                      fill={selectedTeam.color ? `#${selectedTeam.color}` : 'oklch(var(--primary))'}
                      fillOpacity={0.6}
                      strokeWidth={3}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'oklch(var(--card))',
                        border: '1px solid oklch(var(--border))',
                        borderRadius: '0.5rem',
                      }}
                    />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            )}
          </Card>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {performanceData.slice(-1).map((data, index) => (
              <Card key={index} className="p-5">
                <p className="text-xs text-muted-foreground mb-1">Latest Month ({data.month})</p>
                <div className="grid grid-cols-2 gap-3 mt-3">
                  <div>
                    <p className="text-2xl font-bold text-foreground">{data.wins}</p>
                    <p className="text-xs text-muted-foreground">Wins</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-foreground">{data.losses}</p>
                    <p className="text-xs text-muted-foreground">Losses</p>
                  </div>
                  <div>
                    <p className="text-xl font-bold text-foreground">{data.runs}</p>
                    <p className="text-xs text-muted-foreground">Runs</p>
                  </div>
                  <div>
                    <p className="text-xl font-bold text-foreground">{data.hits}</p>
                    <p className="text-xs text-muted-foreground">Hits</p>
                  </div>
                </div>
              </Card>
            ))}
            <Card className="p-5 col-span-full sm:col-span-1 lg:col-span-3">
              <p className="text-xs text-muted-foreground mb-3">Season Summary</p>
              <div className="grid grid-cols-3 gap-6">
                <div>
                  <Badge variant="secondary" className="mb-2">Total Wins</Badge>
                  <p className="text-3xl font-bold text-foreground">
                    {performanceData.reduce((sum, d) => sum + d.wins, 0)}
                  </p>
                </div>
                <div>
                  <Badge variant="outline" className="mb-2">Total Losses</Badge>
                  <p className="text-3xl font-bold text-foreground">
                    {performanceData.reduce((sum, d) => sum + d.losses, 0)}
                  </p>
                </div>
                <div>
                  <Badge variant="outline" className="mb-2" style={{ 
                    borderColor: selectedTeam.color ? `#${selectedTeam.color}` : undefined,
                    color: selectedTeam.color ? `#${selectedTeam.color}` : undefined
                  }}>
                    Win Rate
                  </Badge>
                  <p className="text-3xl font-bold" style={{ color: selectedTeam.color ? `#${selectedTeam.color}` : undefined }}>
                    {Math.round(
                      (performanceData.reduce((sum, d) => sum + d.wins, 0) /
                        (performanceData.reduce((sum, d) => sum + d.wins + d.losses, 0))) *
                        100
                    )}%
                  </p>
                </div>
              </div>
            </Card>
          </div>
        </motion.div>
      )}
    </div>
  );
}
