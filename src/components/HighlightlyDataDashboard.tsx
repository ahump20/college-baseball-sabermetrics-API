import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Database, ArrowsClockwise, CheckCircle, WarningCircle, Sparkle } from '@phosphor-icons/react';
import { useHighlightlyGames, useHighlightlyTeams, useHighlightlyPlayers } from '@/hooks/use-highlightly-api';
import { useESPNTeams } from '@/hooks/use-espn-teams';
import { useESPNScoreboard } from '@/hooks/use-espn-scoreboard';
import { toast } from 'sonner';
import { Skeleton } from '@/components/ui/skeleton';
import { motion } from 'framer-motion';

export function HighlightlyDataDashboard() {
  const [activeTab, setActiveTab] = useState('overview');
  
  const { games: highlightlyGames, isLoading: gamesLoading, error: gamesError, refetch: refetchGames } = useHighlightlyGames();
  const { teams: highlightlyTeams, isLoading: teamsLoading, error: teamsError, refetch: refetchTeams } = useHighlightlyTeams();
  const { players: highlightlyPlayers, isLoading: playersLoading, error: playersError, refetch: refetchPlayers } = useHighlightlyPlayers();
  
  const { teams: espnTeams, isLoading: espnTeamsLoading } = useESPNTeams();
  const { games: espnGames, isLoading: espnGamesLoading } = useESPNScoreboard();

  const handleRefreshAll = async () => {
    toast.promise(
      Promise.all([refetchGames(), refetchTeams(), refetchPlayers()]),
      {
        loading: 'Refreshing Highlightly data...',
        success: 'All data refreshed successfully',
        error: 'Failed to refresh data',
      }
    );
  };

  const DataSourceCard = ({ 
    title, 
    source, 
    count, 
    isLoading, 
    error, 
    onRefresh 
  }: { 
    title: string; 
    source: string; 
    count: number; 
    isLoading: boolean; 
    error: string | null; 
    onRefresh: () => void;
  }) => (
    <Card className="border-border/50 hover:border-primary/30 transition-all">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-base">{title}</CardTitle>
            <CardDescription className="text-xs mt-1">
              <span className="font-mono">{source}</span>
            </CardDescription>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onRefresh}
            disabled={isLoading}
            className="h-7 w-7 p-0"
          >
            <ArrowsClockwise 
              size={14} 
              weight="bold" 
              className={isLoading ? 'animate-spin' : ''} 
            />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <Skeleton className="h-12 w-full" />
        ) : error ? (
          <div className="flex items-center gap-2 text-destructive">
            <WarningCircle size={16} weight="bold" />
            <span className="text-xs">Error loading</span>
          </div>
        ) : (
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold text-foreground">{count.toLocaleString()}</span>
            <Badge variant="outline" className="gap-1 border-success/30 bg-success/10 text-success">
              <CheckCircle size={12} weight="bold" />
              Active
            </Badge>
          </div>
        )}
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-sm">
            <Sparkle className="text-primary-foreground" size={20} weight="bold" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-foreground">Highlightly Integration</h3>
            <p className="text-sm text-muted-foreground">MLB & College Baseball data from Highlightly API</p>
          </div>
        </div>
        <Button onClick={handleRefreshAll} className="gap-2" size="sm">
          <ArrowsClockwise size={16} weight="bold" />
          Refresh All
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="comparison">Data Comparison</TabsTrigger>
          <TabsTrigger value="endpoints">Endpoints</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <DataSourceCard
              title="Games"
              source="Highlightly API"
              count={highlightlyGames?.length || 0}
              isLoading={gamesLoading}
              error={gamesError}
              onRefresh={refetchGames}
            />
            <DataSourceCard
              title="Teams"
              source="Highlightly API"
              count={highlightlyTeams?.length || 0}
              isLoading={teamsLoading}
              error={teamsError}
              onRefresh={refetchTeams}
            />
            <DataSourceCard
              title="Players"
              source="Highlightly API"
              count={highlightlyPlayers?.length || 0}
              isLoading={playersLoading}
              error={playersError}
              onRefresh={refetchPlayers}
            />
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database size={20} weight="bold" className="text-primary" />
                API Configuration
              </CardTitle>
              <CardDescription>
                Highlightly API access configuration and status
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-3">
                <div className="flex items-center justify-between p-3 rounded-lg border border-border bg-muted/30">
                  <div>
                    <p className="font-medium text-sm">API Key</p>
                    <p className="text-xs text-muted-foreground font-mono mt-0.5">HIGHLIGHTLY_API_KEY</p>
                  </div>
                  <Badge variant="outline" className="gap-1 border-success/30 bg-success/10 text-success">
                    <CheckCircle size={12} weight="bold" />
                    Configured
                  </Badge>
                </div>
                <div className="flex items-center justify-between p-3 rounded-lg border border-border bg-muted/30">
                  <div>
                    <p className="font-medium text-sm">Base URL</p>
                    <p className="text-xs text-muted-foreground font-mono mt-0.5">api.highlightly.net</p>
                  </div>
                  <Badge variant="outline" className="gap-1 border-success/30 bg-success/10 text-success">
                    <CheckCircle size={12} weight="bold" />
                    Active
                  </Badge>
                </div>
                <div className="flex items-center justify-between p-3 rounded-lg border border-border bg-muted/30">
                  <div>
                    <p className="font-medium text-sm">Supported Leagues</p>
                    <p className="text-xs text-muted-foreground font-mono mt-0.5">MLB, College Baseball</p>
                  </div>
                  <Badge variant="outline" className="gap-1 border-success/30 bg-success/10 text-success">
                    <CheckCircle size={12} weight="bold" />
                    Available
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="comparison" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Data Source Comparison</CardTitle>
              <CardDescription>
                Compare data availability across Highlightly API and ESPN API
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-3 gap-4 text-xs font-semibold text-muted-foreground border-b border-border pb-2">
                  <div>Data Type</div>
                  <div className="text-center">Highlightly</div>
                  <div className="text-center">ESPN</div>
                </div>
                
                <DataComparisonRow
                  label="Games"
                  highlightly={highlightlyGames?.length || 0}
                  espn={espnGames?.length || 0}
                  highlightlyLoading={gamesLoading}
                  espnLoading={espnGamesLoading}
                />
                <DataComparisonRow
                  label="Teams"
                  highlightly={highlightlyTeams?.length || 0}
                  espn={espnTeams?.length || 0}
                  highlightlyLoading={teamsLoading}
                  espnLoading={espnTeamsLoading}
                />
                <DataComparisonRow
                  label="Players"
                  highlightly={highlightlyPlayers?.length || 0}
                  espn={0}
                  highlightlyLoading={playersLoading}
                  espnLoading={false}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="endpoints" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Available Highlightly Endpoints</CardTitle>
              <CardDescription>
                Integrated API endpoints for MLB and college baseball data
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <EndpointCard
                method="GET"
                path="/v1/games"
                description="Retrieve games by date and league"
                params={['date', 'league']}
              />
              <EndpointCard
                method="GET"
                path="/v1/games/:gameId"
                description="Get detailed game information and highlights"
                params={['gameId']}
              />
              <EndpointCard
                method="GET"
                path="/v1/teams"
                description="List all teams in a specific league"
                params={['league']}
              />
              <EndpointCard
                method="GET"
                path="/v1/players"
                description="Get player roster and basic info"
                params={['league', 'teamId']}
              />
              <EndpointCard
                method="GET"
                path="/v1/players/:playerId/stats"
                description="Retrieve comprehensive player statistics"
                params={['playerId', 'season']}
              />
              <EndpointCard
                method="GET"
                path="/v1/standings"
                description="Get conference and division standings"
                params={['league', 'conference']}
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function DataComparisonRow({ 
  label, 
  highlightly, 
  espn, 
  highlightlyLoading, 
  espnLoading 
}: { 
  label: string; 
  highlightly: number; 
  espn: number; 
  highlightlyLoading: boolean; 
  espnLoading: boolean;
}) {
  return (
    <div className="grid grid-cols-3 gap-4 items-center py-2">
      <div className="font-medium text-sm">{label}</div>
      <div className="text-center">
        {highlightlyLoading ? (
          <Skeleton className="h-6 w-16 mx-auto" />
        ) : (
          <Badge variant="secondary" className="font-mono">
            {highlightly.toLocaleString()}
          </Badge>
        )}
      </div>
      <div className="text-center">
        {espnLoading ? (
          <Skeleton className="h-6 w-16 mx-auto" />
        ) : (
          <Badge variant="outline" className="font-mono">
            {espn.toLocaleString()}
          </Badge>
        )}
      </div>
    </div>
  );
}

function EndpointCard({ 
  method, 
  path, 
  description, 
  params 
}: { 
  method: string; 
  path: string; 
  description: string; 
  params: string[];
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-3 rounded-lg border border-border bg-card hover:bg-muted/30 transition-colors"
    >
      <div className="flex items-start gap-3">
        <Badge variant="secondary" className="font-mono text-xs shrink-0 mt-0.5">
          {method}
        </Badge>
        <div className="flex-1 min-w-0">
          <p className="font-mono text-sm font-medium text-foreground mb-1">
            {path}
          </p>
          <p className="text-xs text-muted-foreground mb-2">
            {description}
          </p>
          {params.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {params.map((param) => (
                <Badge 
                  key={param} 
                  variant="outline" 
                  className="font-mono text-xs px-2 py-0"
                >
                  {param}
                </Badge>
              ))}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
