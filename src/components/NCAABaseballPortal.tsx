import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { 
  Trophy, Users, ChartBar, TrendUp, MagnifyingGlass, 
  Lightning, Baseball, Target, Fire, Sparkle, Calendar 
} from '@phosphor-icons/react';
import { motion, AnimatePresence } from 'framer-motion';
import { TeamCard } from '@/components/TeamCard';
import { AnimatedStatsChart } from '@/components/AnimatedStatsChart';
import { useESPNTeams } from '@/hooks/use-espn-teams';
import { TEAM_BRANDING } from '@/lib/team-branding';

export function NCAABaseballPortal() {
  const { teams, isLoading } = useESPNTeams();
  const [selectedConference, setSelectedConference] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('overview');

  const conferences = ['SEC', 'ACC', 'Big 12', 'Big Ten', 'Pac-12', 'American'];
  
  const secTeams = Object.values(TEAM_BRANDING).filter(team => team.conference === 'SEC');
  
  const mockTeamStats = secTeams.map((team, index) => ({
    teamId: team.id,
    stats: {
      wins: Math.floor(Math.random() * 20) + 25,
      losses: Math.floor(Math.random() * 15) + 5,
      conferenceWins: Math.floor(Math.random() * 10) + 10,
      conferenceLosses: Math.floor(Math.random() * 8) + 2,
      rank: index < 10 ? index + 1 : undefined
    }
  }));

  const winPercentageData = mockTeamStats
    .slice(0, 8)
    .map(({ teamId, stats }) => ({
      label: TEAM_BRANDING[teamId]?.shortName || teamId,
      value: parseFloat(((stats.wins / (stats.wins + stats.losses)) * 100).toFixed(1)),
      teamId
    }))
    .sort((a, b) => b.value - a.value);

  const filteredTeams = mockTeamStats.filter(({ teamId }) => {
    const team = TEAM_BRANDING[teamId];
    const matchesConference = selectedConference === 'all' || team?.conference === selectedConference;
    const matchesSearch = searchQuery === '' || 
      team?.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      team?.shortName.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesConference && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-background">
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,oklch(0.25_0.08_40_/_0.2),transparent_50%),radial-gradient(ellipse_at_bottom_right,oklch(0.22_0.08_45_/_0.15),transparent_50%)] pointer-events-none" />
        
        <div className="absolute top-0 left-0 right-0 h-96 bg-gradient-to-b from-surface/50 to-transparent pointer-events-none" />

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="relative z-10 container mx-auto px-4 sm:px-6 py-12"
        >
          <div className="text-center mb-12">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="inline-flex items-center gap-3 mb-6"
            >
              <div className="relative">
                <div className="absolute inset-0 bg-primary/30 rounded-full blur-2xl animate-pulse" />
                <Baseball size={64} weight="fill" className="text-primary relative z-10" />
              </div>
            </motion.div>

            <motion.h1
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3, duration: 0.5 }}
              className="text-5xl sm:text-6xl font-display font-bold text-foreground mb-4 tracking-tight"
            >
              NCAA Baseball Portal
            </motion.h1>

            <motion.p
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.4, duration: 0.5 }}
              className="text-xl text-muted-foreground max-w-2xl mx-auto"
            >
              Real-time statistics, advanced analytics, and comprehensive team data for college baseball
            </motion.p>

            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.5, duration: 0.5 }}
              className="flex items-center justify-center gap-3 mt-6"
            >
              <Badge variant="outline" className="gap-2 px-4 py-2 text-sm">
                <Lightning size={16} weight="fill" className="text-success" />
                <span>Live Data</span>
              </Badge>
              <Badge variant="outline" className="gap-2 px-4 py-2 text-sm">
                <Sparkle size={16} weight="fill" className="text-accent" />
                <span>Advanced Metrics</span>
              </Badge>
              <Badge variant="outline" className="gap-2 px-4 py-2 text-sm">
                <Fire size={16} weight="fill" className="text-primary" />
                <span>Real-Time Updates</span>
              </Badge>
            </motion.div>
          </div>

          <motion.div
            initial={{ y: 40, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.6, duration: 0.6 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12"
          >
            {[
              { label: 'Active Teams', value: teams?.length || 0, icon: Trophy, color: 'text-primary' },
              { label: 'Conferences', value: conferences.length, icon: Target, color: 'text-accent' },
              { label: 'Live Games', value: 12, icon: Lightning, color: 'text-success' },
              { label: 'Total Players', value: '8,400+', icon: Users, color: 'text-secondary' },
            ].map((stat, index) => {
              const Icon = stat.icon;
              return (
                <motion.div
                  key={stat.label}
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.7 + index * 0.1 }}
                  whileHover={{ y: -4, scale: 1.02 }}
                >
                  <Card className="p-6 hover:shadow-xl transition-all duration-300 bg-surface/80 backdrop-blur-sm border-border/50">
                    <div className="flex items-start justify-between mb-3">
                      <div className={`${stat.color}`}>
                        <Icon size={32} weight="bold" />
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground mb-1">{stat.label}</p>
                    <p className="text-3xl font-bold font-mono text-foreground">
                      {typeof stat.value === 'number' ? stat.value.toLocaleString() : stat.value}
                    </p>
                  </Card>
                </motion.div>
              );
            })}
          </motion.div>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8">
            <TabsList className="grid w-full grid-cols-2 md:grid-cols-4 lg:w-auto lg:inline-grid gap-2 bg-surface/50 p-2 rounded-xl">
              <TabsTrigger value="overview" className="gap-2">
                <ChartBar size={18} weight="bold" />
                <span className="hidden sm:inline">Overview</span>
              </TabsTrigger>
              <TabsTrigger value="teams" className="gap-2">
                <Trophy size={18} weight="bold" />
                <span className="hidden sm:inline">Teams</span>
              </TabsTrigger>
              <TabsTrigger value="analytics" className="gap-2">
                <TrendUp size={18} weight="bold" />
                <span className="hidden sm:inline">Analytics</span>
              </TabsTrigger>
              <TabsTrigger value="schedule" className="gap-2">
                <Calendar size={18} weight="bold" />
                <span className="hidden sm:inline">Schedule</span>
              </TabsTrigger>
            </TabsList>

            <AnimatePresence mode="wait">
              <TabsContent value="overview" className="space-y-8">
                <motion.div
                  key="overview"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                    <AnimatedStatsChart
                      data={winPercentageData}
                      title="Win Percentage Leaders"
                      type="bar"
                      valueSuffix="%"
                      height={350}
                    />
                    <AnimatedStatsChart
                      data={winPercentageData.slice(0, 6)}
                      title="Performance Trend"
                      type="area"
                      valueSuffix="%"
                      height={350}
                    />
                  </div>

                  <div>
                    <h3 className="text-2xl font-display font-bold text-foreground mb-6">
                      Top Ranked Teams
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                      {mockTeamStats.slice(0, 8).map(({ teamId, stats }) => (
                        <TeamCard
                          key={teamId}
                          teamId={teamId}
                          stats={stats}
                        />
                      ))}
                    </div>
                  </div>
                </motion.div>
              </TabsContent>

              <TabsContent value="teams" className="space-y-6">
                <motion.div
                  key="teams"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  <Card className="p-6 bg-surface/80 backdrop-blur-sm mb-6">
                    <div className="flex flex-col sm:flex-row gap-4">
                      <div className="flex-1 relative">
                        <MagnifyingGlass 
                          size={20} 
                          weight="bold" 
                          className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                        />
                        <Input
                          placeholder="Search teams..."
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          className="pl-10"
                        />
                      </div>
                      <Select value={selectedConference} onValueChange={setSelectedConference}>
                        <SelectTrigger className="w-full sm:w-48">
                          <SelectValue placeholder="All Conferences" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Conferences</SelectItem>
                          {conferences.map((conf) => (
                            <SelectItem key={conf} value={conf}>{conf}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </Card>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {filteredTeams.map(({ teamId, stats }) => (
                      <TeamCard
                        key={teamId}
                        teamId={teamId}
                        stats={stats}
                      />
                    ))}
                  </div>
                </motion.div>
              </TabsContent>

              <TabsContent value="analytics" className="space-y-6">
                <motion.div
                  key="analytics"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                  className="grid grid-cols-1 gap-8"
                >
                  <AnimatedStatsChart
                    data={mockTeamStats.slice(0, 10).map(({ teamId, stats }) => ({
                      label: TEAM_BRANDING[teamId]?.shortName || teamId,
                      value: stats.wins,
                      teamId
                    }))}
                    title="Total Wins Comparison"
                    type="bar"
                    height={400}
                  />

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <AnimatedStatsChart
                      data={mockTeamStats.slice(0, 8).map(({ teamId, stats }) => ({
                        label: TEAM_BRANDING[teamId]?.shortName || teamId,
                        value: stats.conferenceWins,
                        teamId
                      }))}
                      title="Conference Wins"
                      type="line"
                      height={350}
                    />
                    <AnimatedStatsChart
                      data={mockTeamStats.slice(0, 8).map(({ teamId, stats }) => ({
                        label: TEAM_BRANDING[teamId]?.shortName || teamId,
                        value: stats.losses,
                        teamId
                      }))}
                      title="Total Losses"
                      type="area"
                      height={350}
                    />
                  </div>
                </motion.div>
              </TabsContent>

              <TabsContent value="schedule" className="space-y-6">
                <motion.div
                  key="schedule"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  <Card className="p-8 text-center bg-surface/80 backdrop-blur-sm">
                    <Calendar size={64} weight="bold" className="text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-2xl font-display font-bold text-foreground mb-2">
                      Schedule Coming Soon
                    </h3>
                    <p className="text-muted-foreground">
                      Game schedules and live scores will be available here
                    </p>
                  </Card>
                </motion.div>
              </TabsContent>
            </AnimatePresence>
          </Tabs>
        </motion.div>
      </div>
    </div>
  );
}
