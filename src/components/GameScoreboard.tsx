import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { ArrowClockwise, Baseball, Calendar, MapPin, Users, Pulse, ChatText } from '@phosphor-icons/react';
import { espnGameData, type GameBoxScore, type PlayByPlayEvent } from '@/lib/espnGameData';
import type { ESPNGame } from '@/lib/espnAPI';
import { toast } from 'sonner';
import { getTeamLogo } from '@/lib/photoService';

export function GameScoreboard() {
  const [games, setGames] = useState<ESPNGame[]>([]);
  const [selectedGame, setSelectedGame] = useState<ESPNGame | null>(null);
  const [boxScore, setBoxScore] = useState<GameBoxScore | null>(null);
  const [playByPlay, setPlayByPlay] = useState<PlayByPlayEvent[]>([]);
  const [loading, setLoading] = useState(false);
  const [boxScoreLoading, setBoxScoreLoading] = useState(false);
  const [pbpLoading, setPbpLoading] = useState(false);
  const [daysBack, setDaysBack] = useState(3);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [refreshInterval, setRefreshInterval] = useState(30);
  const [secondsUntilRefresh, setSecondsUntilRefresh] = useState(30);
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null);
  
  const refreshTimerRef = useRef<number | null>(null);
  const countdownTimerRef = useRef<number | null>(null);
  const previousScoresRef = useRef<Map<string, { home: string; away: string }>>(new Map());

  useEffect(() => {
    loadGames();
  }, [daysBack]);

  useEffect(() => {
    if (autoRefresh && hasLiveGames()) {
      startAutoRefresh();
    } else {
      stopAutoRefresh();
    }
    
    return () => {
      stopAutoRefresh();
    };
  }, [autoRefresh, refreshInterval, games]);

  const hasLiveGames = () => {
    return games.some(game => game.status?.type?.state === 'in');
  };

  const startAutoRefresh = () => {
    stopAutoRefresh();
    
    setSecondsUntilRefresh(refreshInterval);
    
    refreshTimerRef.current = window.setInterval(() => {
      refreshLiveGames();
    }, refreshInterval * 1000);
    
    countdownTimerRef.current = window.setInterval(() => {
      setSecondsUntilRefresh((prev) => {
        if (prev <= 1) {
          return refreshInterval;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const stopAutoRefresh = () => {
    if (refreshTimerRef.current !== null) {
      clearInterval(refreshTimerRef.current);
      refreshTimerRef.current = null;
    }
    if (countdownTimerRef.current !== null) {
      clearInterval(countdownTimerRef.current);
      countdownTimerRef.current = null;
    }
  };

  const refreshLiveGames = async () => {
    try {
      const fetchedGames = await espnGameData.getRecentGames(daysBack);
      
      const scoreChanges: string[] = [];
      fetchedGames.forEach(game => {
        const competition = game.competitions?.[0];
        const homeTeam = competition?.competitors?.find(c => c.homeAway === 'home');
        const awayTeam = competition?.competitors?.find(c => c.homeAway === 'away');
        
        const currentScore = {
          home: homeTeam?.score || '0',
          away: awayTeam?.score || '0'
        };
        
        const previousScore = previousScoresRef.current.get(game.id);
        if (previousScore && 
            (previousScore.home !== currentScore.home || previousScore.away !== currentScore.away)) {
          const homeAbbr = homeTeam?.team.abbreviation || 'Home';
          const awayAbbr = awayTeam?.team.abbreviation || 'Away';
          scoreChanges.push(`${awayAbbr} ${currentScore.away} - ${homeAbbr} ${currentScore.home}`);
        }
        
        previousScoresRef.current.set(game.id, currentScore);
      });
      
      setGames(fetchedGames);
      setLastRefresh(new Date());
      
      if (scoreChanges.length > 0) {
        toast.success(`Score update: ${scoreChanges.join(' | ')}`);
      }
      
      if (selectedGame) {
        const updatedSelectedGame = fetchedGames.find(g => g.id === selectedGame.id);
        if (updatedSelectedGame) {
          setSelectedGame(updatedSelectedGame);
          await loadBoxScore(updatedSelectedGame.id);
        }
      }
    } catch (error) {
      console.error('Error refreshing games:', error);
    }
  };

  const loadGames = async () => {
    setLoading(true);
    try {
      const fetchedGames = await espnGameData.getRecentGames(daysBack);
      setGames(fetchedGames);
      setLastRefresh(new Date());
      
      fetchedGames.forEach(game => {
        const competition = game.competitions?.[0];
        const homeTeam = competition?.competitors?.find(c => c.homeAway === 'home');
        const awayTeam = competition?.competitors?.find(c => c.homeAway === 'away');
        previousScoresRef.current.set(game.id, {
          home: homeTeam?.score || '0',
          away: awayTeam?.score || '0'
        });
      });
      
      toast.success(`Loaded ${fetchedGames.length} games from the last ${daysBack} days`);
      
      if (fetchedGames.length > 0 && !selectedGame) {
        const liveGame = fetchedGames.find(g => g.status?.type?.state === 'in');
        const gameToSelect = liveGame || fetchedGames.find(g => g.status?.type?.completed === true) || fetchedGames[0];
        
        if (gameToSelect) {
          setSelectedGame(gameToSelect);
          loadBoxScore(gameToSelect.id);
        }
      }
    } catch (error) {
      console.error('Error loading games:', error);
      toast.error('Failed to load games from ESPN');
    } finally {
      setLoading(false);
    }
  };

  const loadBoxScore = async (gameId: string) => {
    setBoxScoreLoading(true);
    try {
      const score = await espnGameData.getGameBoxScore(gameId);
      setBoxScore(score);
      if (!score) {
        toast.warning('Box score not available for this game');
      }
    } catch (error) {
      console.error('Error loading box score:', error);
      toast.error('Failed to load box score');
    } finally {
      setBoxScoreLoading(false);
    }
  };

  const loadPlayByPlay = async (gameId: string) => {
    setPbpLoading(true);
    try {
      const plays = await espnGameData.getPlayByPlay(gameId);
      setPlayByPlay(plays);
      if (plays.length === 0) {
        toast.info('No play-by-play data available for this game');
      }
    } catch (error) {
      console.error('Error loading play-by-play:', error);
      toast.error('Failed to load play-by-play data');
    } finally {
      setPbpLoading(false);
    }
  };

  const handleGameClick = (game: ESPNGame) => {
    setSelectedGame(game);
    loadBoxScore(game.id);
    loadPlayByPlay(game.id);
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit'
    });
  };

  const getStatusBadge = (game: ESPNGame) => {
    const status = game.status?.type;
    if (!status) return null;

    if (status.completed) {
      return <Badge variant="secondary">Final</Badge>;
    } else if (status.state === 'in') {
      return <Badge className="bg-success text-success-foreground">Live</Badge>;
    } else {
      return <Badge variant="outline">{status.shortDetail}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between gap-4">
            <div>
              <CardTitle className="flex items-center gap-2.5">
                <Baseball size={24} weight="bold" className="text-primary" />
                Real Game Data & Box Scores
              </CardTitle>
              <CardDescription className="mt-1.5">
                Live NCAA baseball games and box scores from ESPN
                {lastRefresh && (
                  <span className="ml-2 text-xs">
                    • Last updated: {lastRefresh.toLocaleTimeString()}
                  </span>
                )}
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <select
                value={daysBack}
                onChange={(e) => setDaysBack(parseInt(e.target.value))}
                className="h-9 rounded-md border border-input bg-background px-3 text-sm"
              >
                <option value={1}>Today</option>
                <option value={3}>Last 3 days</option>
                <option value={7}>Last 7 days</option>
                <option value={14}>Last 14 days</option>
              </select>
              <Button
                onClick={() => loadGames()}
                disabled={loading}
                size="sm"
                variant="outline"
              >
                <ArrowClockwise size={16} weight="bold" className={loading ? 'animate-spin' : ''} />
                Refresh
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {hasLiveGames() && (
        <Card className="border-success/30 bg-success/5">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2">
                  <Pulse size={20} weight="bold" className="text-success animate-pulse" />
                  <span className="font-semibold text-sm">Live Games Auto-Refresh</span>
                </div>
                {autoRefresh && (
                  <Badge variant="outline" className="border-success/30 bg-success/10 text-success font-mono text-xs">
                    Next: {secondsUntilRefresh}s
                  </Badge>
                )}
              </div>
              
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <Label htmlFor="auto-refresh" className="text-sm cursor-pointer">
                    Auto-refresh
                  </Label>
                  <Switch
                    id="auto-refresh"
                    checked={autoRefresh}
                    onCheckedChange={setAutoRefresh}
                  />
                </div>
                
                <select
                  value={refreshInterval}
                  onChange={(e) => setRefreshInterval(parseInt(e.target.value))}
                  disabled={!autoRefresh}
                  className="h-9 rounded-md border border-input bg-background px-3 text-sm disabled:opacity-50"
                >
                  <option value={15}>Every 15s</option>
                  <option value={30}>Every 30s</option>
                  <option value={60}>Every 1m</option>
                  <option value={120}>Every 2m</option>
                  <option value={300}>Every 5m</option>
                </select>
              </div>
            </div>
          </CardHeader>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="text-base">Games ({games.length})</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <ScrollArea className="h-[600px]">
              <div className="space-y-1 p-4 pt-0">
                {loading ? (
                  <div className="text-center py-8 text-muted-foreground">
                    Loading games...
                  </div>
                ) : games.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    No games found
                  </div>
                ) : (
                  games.map((game) => {
                    const competition = game.competitions?.[0];
                    const homeTeam = competition?.competitors?.find(c => c.homeAway === 'home');
                    const awayTeam = competition?.competitors?.find(c => c.homeAway === 'away');
                    const isSelected = selectedGame?.id === game.id;

                    return (
                      <button
                        key={game.id}
                        onClick={() => handleGameClick(game)}
                        className={`w-full text-left p-3 rounded-lg border transition-colors ${
                          isSelected
                            ? 'border-primary bg-primary/5'
                            : 'border-border hover:border-primary/50 hover:bg-muted/50'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs text-muted-foreground flex items-center gap-1.5">
                            <Calendar size={12} />
                            {formatDate(game.date)}
                          </span>
                          {getStatusBadge(game)}
                        </div>
                        
                        <div className="space-y-1.5">
                          <div className="flex items-center justify-between gap-2">
                            <div className="flex items-center gap-2 flex-1 min-w-0">
                              <img 
                                src={getTeamLogo(awayTeam?.team.displayName || 'Away').primary}
                                alt={awayTeam?.team.abbreviation}
                                className="h-5 w-5 object-contain flex-shrink-0"
                                onError={(e) => {
                                  const target = e.target as HTMLImageElement;
                                  target.style.display = 'none';
                                }}
                              />
                              <span className="text-sm font-medium truncate">
                                {awayTeam?.team.abbreviation || 'Away'}
                              </span>
                            </div>
                            <span className="text-sm font-bold tabular-nums">
                              {awayTeam?.score || '0'}
                            </span>
                          </div>
                          <div className="flex items-center justify-between gap-2">
                            <div className="flex items-center gap-2 flex-1 min-w-0">
                              <img 
                                src={getTeamLogo(homeTeam?.team.displayName || 'Home').primary}
                                alt={homeTeam?.team.abbreviation}
                                className="h-5 w-5 object-contain flex-shrink-0"
                                onError={(e) => {
                                  const target = e.target as HTMLImageElement;
                                  target.style.display = 'none';
                                }}
                              />
                              <span className="text-sm font-medium truncate">
                                {homeTeam?.team.abbreviation || 'Home'}
                              </span>
                            </div>
                            <span className="text-sm font-bold tabular-nums">
                              {homeTeam?.score || '0'}
                            </span>
                          </div>
                        </div>
                      </button>
                    );
                  })
                )}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base">Box Score</CardTitle>
          </CardHeader>
          <CardContent>
            {boxScoreLoading ? (
              <div className="text-center py-12 text-muted-foreground">
                Loading box score...
              </div>
            ) : !boxScore ? (
              <div className="text-center py-12 text-muted-foreground">
                Select a game to view box score
              </div>
            ) : (
              <div className="space-y-6">
                <div className="flex items-center justify-between p-4 rounded-lg bg-muted/50 border">
                  <div>
                    <h3 className="font-semibold text-lg">
                      {boxScore.away.displayName} vs {boxScore.home.displayName}
                    </h3>
                    <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                      {boxScore.venue && (
                        <span className="flex items-center gap-1.5">
                          <MapPin size={14} />
                          {boxScore.venue}
                        </span>
                      )}
                      {boxScore.attendance && (
                        <span className="flex items-center gap-1.5">
                          <Users size={14} />
                          {boxScore.attendance.toLocaleString()}
                        </span>
                      )}
                    </div>
                  </div>
                  <Badge>{boxScore.status}</Badge>
                </div>

                <div>
                  <h4 className="font-semibold mb-3">Line Score</h4>
                  <div className="border rounded-lg overflow-hidden">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="w-[200px]">Team</TableHead>
                          {Array.from({ length: boxScore.inningCount }, (_, i) => (
                            <TableHead key={i} className="text-center w-10">
                              {i + 1}
                            </TableHead>
                          ))}
                          <TableHead className="text-center font-bold">R</TableHead>
                          <TableHead className="text-center">H</TableHead>
                          <TableHead className="text-center">E</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        <TableRow>
                          <TableCell className="font-medium">
                            {boxScore.away.abbreviation}
                          </TableCell>
                          {boxScore.away.runs.map((runs, i) => (
                            <TableCell key={i} className="text-center font-mono">
                              {runs}
                            </TableCell>
                          ))}
                          {Array.from({ 
                            length: boxScore.inningCount - boxScore.away.runs.length 
                          }).map((_, i) => (
                            <TableCell key={`empty-${i}`} className="text-center text-muted-foreground">
                              -
                            </TableCell>
                          ))}
                          <TableCell className="text-center font-bold">
                            {boxScore.away.score}
                          </TableCell>
                          <TableCell className="text-center">
                            {boxScore.away.hits}
                          </TableCell>
                          <TableCell className="text-center">
                            {boxScore.away.errors}
                          </TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell className="font-medium">
                            {boxScore.home.abbreviation}
                          </TableCell>
                          {boxScore.home.runs.map((runs, i) => (
                            <TableCell key={i} className="text-center font-mono">
                              {runs}
                            </TableCell>
                          ))}
                          {Array.from({ 
                            length: boxScore.inningCount - boxScore.home.runs.length 
                          }).map((_, i) => (
                            <TableCell key={`empty-${i}`} className="text-center text-muted-foreground">
                              -
                            </TableCell>
                          ))}
                          <TableCell className="text-center font-bold">
                            {boxScore.home.score}
                          </TableCell>
                          <TableCell className="text-center">
                            {boxScore.home.hits}
                          </TableCell>
                          <TableCell className="text-center">
                            {boxScore.home.errors}
                          </TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                  </div>
                </div>

                {(boxScore.homeRoster || boxScore.awayRoster) && (
                  <Tabs defaultValue="batting">
                    <TabsList>
                      <TabsTrigger value="batting">Batting</TabsTrigger>
                      <TabsTrigger value="pitching">Pitching</TabsTrigger>
                      <TabsTrigger value="playbyplay">
                        <ChatText size={16} weight="bold" className="mr-1.5" />
                        Play-by-Play
                      </TabsTrigger>
                    </TabsList>
                    
                    <TabsContent value="batting" className="space-y-4">
                      {boxScore.awayRoster && (
                        <div>
                          <h5 className="font-semibold mb-2">{boxScore.away.displayName}</h5>
                          <div className="border rounded-lg overflow-auto">
                            <Table>
                              <TableHeader>
                                <TableRow>
                                  <TableHead className="sticky left-0 bg-background z-10">Player</TableHead>
                                  <TableHead className="text-center">AB</TableHead>
                                  <TableHead className="text-center">R</TableHead>
                                  <TableHead className="text-center">H</TableHead>
                                  <TableHead className="text-center">2B</TableHead>
                                  <TableHead className="text-center">3B</TableHead>
                                  <TableHead className="text-center">HR</TableHead>
                                  <TableHead className="text-center">RBI</TableHead>
                                  <TableHead className="text-center">BB</TableHead>
                                  <TableHead className="text-center">SO</TableHead>
                                  <TableHead className="text-center">SB</TableHead>
                                  <TableHead className="text-center">LOB</TableHead>
                                  <TableHead className="text-right">AVG</TableHead>
                                  <TableHead className="text-right">OBP</TableHead>
                                  <TableHead className="text-right">SLG</TableHead>
                                </TableRow>
                              </TableHeader>
                              <TableBody>
                                {boxScore.awayRoster
                                  .filter(p => p.stats.batting)
                                  .map((player) => (
                                    <TableRow key={player.id}>
                                      <TableCell className="font-medium sticky left-0 bg-background">
                                        {player.displayName}
                                        {player.position && (
                                          <span className="ml-2 text-xs text-muted-foreground">
                                            {player.position}
                                          </span>
                                        )}
                                      </TableCell>
                                      <TableCell className="text-center font-mono">{player.stats.batting?.AB || 0}</TableCell>
                                      <TableCell className="text-center font-mono">{player.stats.batting?.R || 0}</TableCell>
                                      <TableCell className="text-center font-mono">{player.stats.batting?.H || 0}</TableCell>
                                      <TableCell className="text-center font-mono">{player.stats.batting?.['2B'] || 0}</TableCell>
                                      <TableCell className="text-center font-mono">{player.stats.batting?.['3B'] || 0}</TableCell>
                                      <TableCell className="text-center font-mono">{player.stats.batting?.HR || 0}</TableCell>
                                      <TableCell className="text-center font-mono">{player.stats.batting?.RBI || 0}</TableCell>
                                      <TableCell className="text-center font-mono">{player.stats.batting?.BB || 0}</TableCell>
                                      <TableCell className="text-center font-mono">{player.stats.batting?.SO || 0}</TableCell>
                                      <TableCell className="text-center font-mono">{player.stats.batting?.SB || 0}</TableCell>
                                      <TableCell className="text-center font-mono">{player.stats.batting?.LOB || 0}</TableCell>
                                      <TableCell className="text-right font-mono">{player.stats.batting?.AVG || '.000'}</TableCell>
                                      <TableCell className="text-right font-mono">{player.stats.batting?.OBP || '.000'}</TableCell>
                                      <TableCell className="text-right font-mono">{player.stats.batting?.SLG || '.000'}</TableCell>
                                    </TableRow>
                                  ))}
                              </TableBody>
                            </Table>
                          </div>
                        </div>
                      )}

                      {boxScore.homeRoster && (
                        <div>
                          <h5 className="font-semibold mb-2">{boxScore.home.displayName}</h5>
                          <div className="border rounded-lg overflow-auto">
                            <Table>
                              <TableHeader>
                                <TableRow>
                                  <TableHead className="sticky left-0 bg-background z-10">Player</TableHead>
                                  <TableHead className="text-center">AB</TableHead>
                                  <TableHead className="text-center">R</TableHead>
                                  <TableHead className="text-center">H</TableHead>
                                  <TableHead className="text-center">2B</TableHead>
                                  <TableHead className="text-center">3B</TableHead>
                                  <TableHead className="text-center">HR</TableHead>
                                  <TableHead className="text-center">RBI</TableHead>
                                  <TableHead className="text-center">BB</TableHead>
                                  <TableHead className="text-center">SO</TableHead>
                                  <TableHead className="text-center">SB</TableHead>
                                  <TableHead className="text-center">LOB</TableHead>
                                  <TableHead className="text-right">AVG</TableHead>
                                  <TableHead className="text-right">OBP</TableHead>
                                  <TableHead className="text-right">SLG</TableHead>
                                </TableRow>
                              </TableHeader>
                              <TableBody>
                                {boxScore.homeRoster
                                  .filter(p => p.stats.batting)
                                  .map((player) => (
                                    <TableRow key={player.id}>
                                      <TableCell className="font-medium sticky left-0 bg-background">
                                        {player.displayName}
                                        {player.position && (
                                          <span className="ml-2 text-xs text-muted-foreground">
                                            {player.position}
                                          </span>
                                        )}
                                      </TableCell>
                                      <TableCell className="text-center font-mono">{player.stats.batting?.AB || 0}</TableCell>
                                      <TableCell className="text-center font-mono">{player.stats.batting?.R || 0}</TableCell>
                                      <TableCell className="text-center font-mono">{player.stats.batting?.H || 0}</TableCell>
                                      <TableCell className="text-center font-mono">{player.stats.batting?.['2B'] || 0}</TableCell>
                                      <TableCell className="text-center font-mono">{player.stats.batting?.['3B'] || 0}</TableCell>
                                      <TableCell className="text-center font-mono">{player.stats.batting?.HR || 0}</TableCell>
                                      <TableCell className="text-center font-mono">{player.stats.batting?.RBI || 0}</TableCell>
                                      <TableCell className="text-center font-mono">{player.stats.batting?.BB || 0}</TableCell>
                                      <TableCell className="text-center font-mono">{player.stats.batting?.SO || 0}</TableCell>
                                      <TableCell className="text-center font-mono">{player.stats.batting?.SB || 0}</TableCell>
                                      <TableCell className="text-center font-mono">{player.stats.batting?.LOB || 0}</TableCell>
                                      <TableCell className="text-right font-mono">{player.stats.batting?.AVG || '.000'}</TableCell>
                                      <TableCell className="text-right font-mono">{player.stats.batting?.OBP || '.000'}</TableCell>
                                      <TableCell className="text-right font-mono">{player.stats.batting?.SLG || '.000'}</TableCell>
                                    </TableRow>
                                  ))}
                              </TableBody>
                            </Table>
                          </div>
                        </div>
                      )}
                    </TabsContent>

                    <TabsContent value="pitching" className="space-y-4">
                      {boxScore.awayRoster && (
                        <div>
                          <h5 className="font-semibold mb-2">{boxScore.away.displayName}</h5>
                          <div className="border rounded-lg overflow-hidden">
                            <Table>
                              <TableHeader>
                                <TableRow>
                                  <TableHead>Player</TableHead>
                                  <TableHead className="text-center">IP</TableHead>
                                  <TableHead className="text-center">H</TableHead>
                                  <TableHead className="text-center">R</TableHead>
                                  <TableHead className="text-center">ER</TableHead>
                                  <TableHead className="text-center">BB</TableHead>
                                  <TableHead className="text-center">SO</TableHead>
                                  <TableHead className="text-right">ERA</TableHead>
                                </TableRow>
                              </TableHeader>
                              <TableBody>
                                {boxScore.awayRoster
                                  .filter(p => p.stats.pitching)
                                  .map((player) => (
                                    <TableRow key={player.id}>
                                      <TableCell className="font-medium">
                                        {player.displayName}
                                      </TableCell>
                                      <TableCell className="text-center font-mono">
                                        {player.stats.pitching?.IP}
                                      </TableCell>
                                      <TableCell className="text-center font-mono">
                                        {player.stats.pitching?.H}
                                      </TableCell>
                                      <TableCell className="text-center font-mono">
                                        {player.stats.pitching?.R}
                                      </TableCell>
                                      <TableCell className="text-center font-mono">
                                        {player.stats.pitching?.ER}
                                      </TableCell>
                                      <TableCell className="text-center font-mono">
                                        {player.stats.pitching?.BB}
                                      </TableCell>
                                      <TableCell className="text-center font-mono">
                                        {player.stats.pitching?.SO}
                                      </TableCell>
                                      <TableCell className="text-right font-mono">
                                        {player.stats.pitching?.ERA}
                                      </TableCell>
                                    </TableRow>
                                  ))}
                              </TableBody>
                            </Table>
                          </div>
                        </div>
                      )}

                      {boxScore.homeRoster && (
                        <div>
                          <h5 className="font-semibold mb-2">{boxScore.home.displayName}</h5>
                          <div className="border rounded-lg overflow-hidden">
                            <Table>
                              <TableHeader>
                                <TableRow>
                                  <TableHead>Player</TableHead>
                                  <TableHead className="text-center">IP</TableHead>
                                  <TableHead className="text-center">H</TableHead>
                                  <TableHead className="text-center">R</TableHead>
                                  <TableHead className="text-center">ER</TableHead>
                                  <TableHead className="text-center">BB</TableHead>
                                  <TableHead className="text-center">SO</TableHead>
                                  <TableHead className="text-right">ERA</TableHead>
                                </TableRow>
                              </TableHeader>
                              <TableBody>
                                {boxScore.homeRoster
                                  .filter(p => p.stats.pitching)
                                  .map((player) => (
                                    <TableRow key={player.id}>
                                      <TableCell className="font-medium">
                                        {player.displayName}
                                      </TableCell>
                                      <TableCell className="text-center font-mono">
                                        {player.stats.pitching?.IP}
                                      </TableCell>
                                      <TableCell className="text-center font-mono">
                                        {player.stats.pitching?.H}
                                      </TableCell>
                                      <TableCell className="text-center font-mono">
                                        {player.stats.pitching?.R}
                                      </TableCell>
                                      <TableCell className="text-center font-mono">
                                        {player.stats.pitching?.ER}
                                      </TableCell>
                                      <TableCell className="text-center font-mono">
                                        {player.stats.pitching?.BB}
                                      </TableCell>
                                      <TableCell className="text-center font-mono">
                                        {player.stats.pitching?.SO}
                                      </TableCell>
                                      <TableCell className="text-right font-mono">
                                        {player.stats.pitching?.ERA}
                                      </TableCell>
                                    </TableRow>
                                  ))}
                              </TableBody>
                            </Table>
                          </div>
                        </div>
                      )}
                    </TabsContent>

                    <TabsContent value="playbyplay" className="space-y-4">
                      {pbpLoading ? (
                        <div className="text-center py-12 text-muted-foreground">
                          Loading play-by-play...
                        </div>
                      ) : playByPlay.length === 0 ? (
                        <div className="text-center py-12 text-muted-foreground">
                          No play-by-play data available for this game
                        </div>
                      ) : (
                        <ScrollArea className="h-[600px]">
                          <div className="space-y-3 pr-4">
                            {playByPlay.map((play, index) => (
                              <div
                                key={play.id || index}
                                className={`p-3 rounded-lg border ${
                                  play.scoringPlay
                                    ? 'border-primary/50 bg-primary/5'
                                    : 'border-border bg-card'
                                }`}
                              >
                                <div className="flex items-start justify-between gap-3 mb-2">
                                  <div className="flex items-center gap-2">
                                    <Badge variant="outline" className="font-mono text-xs">
                                      {play.half === 'top' ? '▲' : '▼'} {play.inning}
                                    </Badge>
                                    <span className="text-xs text-muted-foreground">
                                      {play.outs} out{play.outs !== 1 ? 's' : ''}
                                    </span>
                                    {play.balls !== undefined && play.strikes !== undefined && (
                                      <span className="text-xs text-muted-foreground font-mono">
                                        {play.balls}-{play.strikes}
                                      </span>
                                    )}
                                  </div>
                                  {play.scoringPlay && (
                                    <Badge className="bg-primary text-primary-foreground">
                                      Score
                                    </Badge>
                                  )}
                                </div>
                                <p className="text-sm leading-relaxed">{play.text}</p>
                                {play.timestamp && (
                                  <p className="text-xs text-muted-foreground mt-2">
                                    {new Date(play.timestamp).toLocaleTimeString()}
                                  </p>
                                )}
                              </div>
                            ))}
                          </div>
                        </ScrollArea>
                      )}
                    </TabsContent>
                  </Tabs>
                )}

                {boxScore.notes && boxScore.notes.length > 0 && (
                  <div className="p-4 rounded-lg bg-muted/50 border">
                    <h5 className="font-semibold mb-2 text-sm">Notes</h5>
                    <ul className="space-y-1 text-sm text-muted-foreground">
                      {boxScore.notes.map((note, i) => (
                        <li key={i}>• {note}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
