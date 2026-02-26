import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Database, Users, Trophy, ChartLine, ArrowClockwise } from '@phosphor-icons/react';
import { useESPNTeams } from '@/hooks/use-espn-teams';
import { motion } from 'framer-motion';
import { formatDistanceToNow } from 'date-fns';

export function RealTimeDashboard() {
  const { teams, isLoading, error, lastUpdated, refetch } = useESPNTeams();

  const activeTeams = teams?.filter(team => team.isActive) || [];
  const totalLogos = teams?.reduce((sum, team) => sum + (team.logos?.length || 0), 0) || 0;
  const totalLinks = teams?.reduce((sum, team) => sum + (team.links?.length || 0), 0) || 0;

  const platformStats = [
    { 
      label: 'Active Teams', 
      value: activeTeams.length.toString(), 
      icon: Trophy, 
      color: 'text-primary',
      trend: '+12',
      trendLabel: 'from last season'
    },
    { 
      label: 'Total Programs', 
      value: (teams?.length || 0).toString(), 
      icon: Database, 
      color: 'text-accent',
      trend: '100%',
      trendLabel: 'coverage'
    },
    { 
      label: 'Team Resources', 
      value: totalLinks.toString(), 
      icon: ChartLine, 
      color: 'text-secondary',
      trend: `${totalLogos}`,
      trendLabel: 'brand assets'
    },
    { 
      label: 'Data Sources', 
      value: '3', 
      icon: Users, 
      color: 'text-success',
      trend: 'ESPN',
      trendLabel: 'API integrated'
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-[1.25rem] font-semibold text-foreground">Real-Time Metrics</h3>
          <p className="text-[0.875rem] text-muted-foreground mt-1">
            {lastUpdated 
              ? `Updated ${formatDistanceToNow(lastUpdated, { addSuffix: true })}`
              : 'No data loaded yet'
            }
          </p>
        </div>
        <Button 
          onClick={refetch} 
          disabled={isLoading}
          variant="outline"
          size="sm"
          className="gap-2"
        >
          <ArrowClockwise 
            size={16} 
            weight="bold" 
            className={isLoading ? 'animate-spin' : ''} 
          />
          Refresh
        </Button>
      </div>

      {error && (
        <Card className="p-4 border-destructive/50 bg-destructive/5">
          <p className="text-[0.875rem] text-destructive">
            Error loading data: {error}
          </p>
        </Card>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {platformStats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="p-6 hover:shadow-lg transition-all duration-300">
                <div className="flex items-start justify-between mb-4">
                  <div className={`${stat.color}`}>
                    <Icon size={24} weight="bold" />
                  </div>
                  <Badge variant="outline" className="text-[0.6875rem] px-2 py-0.5">
                    LIVE
                  </Badge>
                </div>
                <div>
                  <p className="text-[0.8125rem] text-muted-foreground font-medium mb-2">
                    {stat.label}
                  </p>
                  <p className="text-[2.5rem] font-semibold text-foreground leading-none mb-2">
                    {isLoading ? '...' : stat.value}
                  </p>
                  <div className="flex items-center gap-2 text-[0.75rem]">
                    <span className="text-success font-medium">{stat.trend}</span>
                    <span className="text-muted-foreground">{stat.trendLabel}</span>
                  </div>
                </div>
              </Card>
            </motion.div>
          );
        })}
      </div>

      {teams && teams.length > 0 && (
        <Card className="p-6">
          <h4 className="text-[1rem] font-semibold text-foreground mb-4">
            Featured Teams
          </h4>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {teams.slice(0, 12).map((team) => (
              <motion.div
                key={team.id}
                whileHover={{ scale: 1.05 }}
                className="flex flex-col items-center gap-2 p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors cursor-pointer"
              >
                {team.logos?.[0]?.href && (
                  <img 
                    src={team.logos[0].href} 
                    alt={team.displayName}
                    className="w-12 h-12 object-contain"
                  />
                )}
                <p className="text-[0.75rem] text-center font-medium text-foreground line-clamp-2">
                  {team.shortDisplayName}
                </p>
              </motion.div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}
