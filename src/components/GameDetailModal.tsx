import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ESPNGame } from '@/hooks/use-espn-scoreboard';
import { GameHighlightsPanel } from '@/components/GameHighlightsPanel';
import { Clock, MapPin, Circle, ArrowClockwise, Baseball, Trophy, ChartBar, ListBullets, VideoCamera } from '@phosphor-icons/react';
import { format } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';

interface GameDetailModalProps {
  game: ESPNGame | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface PlayByPlayItem {
  id: string;
  type: {
    id: string;
    text: string;
  };
  text: string;
  shortText: string;
  awayScore: number;
  homeScore: number;
  period: {
    number: number;
    displayValue: string;
  };
  scoringPlay: boolean;
  wallclock: string;
  team?: {
    id: string;
  };
}

interface BoxScorePlayer {
  athlete: {
    id: string;
    displayName: string;
    shortName: string;
    jersey?: string;
    position?: {
      abbreviation: string;
    };
  };
  stats: string[];
}

interface BoxScoreTeam {
  team: {
    id: string;
    displayName: string;
    abbreviation: string;
    logos: Array<{ href: string }>;
  };
  statistics: Array<{
    name: string;
    displayValue: string;
    label: string;
  }>;
  players?: Array<{
    displayName: string;
    labels: string[];
    athletes: BoxScorePlayer[];
  }>;
}

interface GameDetails {
  boxScore?: {
    teams: BoxScoreTeam[];
    players: BoxScoreTeam[];
  };
  plays?: PlayByPlayItem[];
  scoringPlays?: PlayByPlayItem[];
  leaders?: Array<{
    name: string;
    displayName: string;
    leaders: Array<{
      displayValue: string;
      athlete: {
        id: string;
        displayName: string;
        shortName: string;
      };
      team: {
        id: string;
      };
    }>;
  }>;
}

export function GameDetailModal({ game, open, onOpenChange }: GameDetailModalProps) {
  const [details, setDetails] = useState<GameDetails | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [autoRefresh, setAutoRefresh] = useState(true);

  useEffect(() => {
    if (!game || !open) {
      setDetails(null);
      return;
    }

    fetchGameDetails();

    const isLive = game.status.type.state === 'in';
    if (isLive && autoRefresh) {
      const interval = setInterval(fetchGameDetails, 30000);
      return () => clearInterval(interval);
    }
  }, [game, open, autoRefresh]);

  const fetchGameDetails = async () => {
    if (!game) return;

    setIsLoading(true);
    setError(null);

    try {
      const gameId = game.id;
      const summaryUrl = `https://site.api.espn.com/apis/site/v2/sports/baseball/college-baseball/summary?event=${gameId}`;
      
      const response = await fetch(summaryUrl);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch game details: ${response.status}`);
      }

      const data = await response.json();
      
      setDetails({
        boxScore: data.boxscore,
        plays: data.plays,
        scoringPlays: data.scoringPlays,
        leaders: data.leaders,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load game details');
    } finally {
      setIsLoading(false);
    }
  };

  if (!game) return null;

  const competition = game.competitions[0];
  const homeTeam = competition.competitors.find(c => c.homeAway === 'home');
  const awayTeam = competition.competitors.find(c => c.homeAway === 'away');
  const isLive = game.status.type.state === 'in';
  const isFinal = game.status.type.completed;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl max-h-[90vh] p-0">
        <DialogHeader className="p-6 pb-0">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <DialogTitle className="text-2xl">Game Details</DialogTitle>
              <div className="flex items-center gap-3 mt-2 text-sm text-muted-foreground">
                <div className="flex items-center gap-1.5">
                  <Clock size={14} />
                  <span>{format(new Date(game.date), 'MMM d, yyyy h:mm a')}</span>
                </div>
                {competition.venue && (
                  <div className="flex items-center gap-1.5">
                    <MapPin size={14} />
                    <span>{competition.venue.fullName}</span>
                  </div>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2">
              {isLive && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={fetchGameDetails}
                  className="gap-2"
                >
                  <ArrowClockwise size={16} />
                  Refresh
                </Button>
              )}
              <Badge 
                variant={isFinal ? 'secondary' : isLive ? 'default' : 'outline'}
                className={`gap-1.5 ${isLive ? 'bg-success text-white border-success' : ''}`}
              >
                {isLive && <Circle size={8} weight="fill" className="animate-pulse" />}
                {isFinal ? 'Final' : isLive ? 'Live' : game.status.type.detail}
              </Badge>
            </div>
          </div>
        </DialogHeader>

        <div className="px-6">
          <Card className="p-6 bg-muted/30 border-2">
            <div className="grid grid-cols-[1fr_auto_1fr] gap-6 items-center">
              <div className="flex flex-col items-center text-center gap-3">
                {awayTeam?.team.logos?.[0] && (
                  <div 
                    className="w-20 h-20 rounded-lg p-3 flex items-center justify-center"
                    style={{ backgroundColor: `#${awayTeam.team.color}20` }}
                  >
                    <img 
                      src={awayTeam.team.logos[0].href} 
                      alt={awayTeam.team.displayName}
                      className="w-full h-full object-contain"
                    />
                  </div>
                )}
                <div>
                  <p className="font-bold text-lg text-foreground">{awayTeam?.team.displayName}</p>
                  {awayTeam?.records?.[0] && (
                    <p className="text-sm text-muted-foreground font-mono">{awayTeam.records[0].summary}</p>
                  )}
                </div>
              </div>

              <div className="flex flex-col items-center gap-2 min-w-[120px]">
                <div className="flex items-baseline gap-4">
                  <span className="text-5xl font-bold text-foreground tabular-nums">{awayTeam?.score || '0'}</span>
                  <span className="text-3xl font-bold text-muted-foreground">-</span>
                  <span className="text-5xl font-bold text-foreground tabular-nums">{homeTeam?.score || '0'}</span>
                </div>
                {isLive && game.status.type.detail && (
                  <p className="text-sm font-medium text-muted-foreground">{game.status.type.detail}</p>
                )}
              </div>

              <div className="flex flex-col items-center text-center gap-3">
                {homeTeam?.team.logos?.[0] && (
                  <div 
                    className="w-20 h-20 rounded-lg p-3 flex items-center justify-center"
                    style={{ backgroundColor: `#${homeTeam.team.color}20` }}
                  >
                    <img 
                      src={homeTeam.team.logos[0].href} 
                      alt={homeTeam.team.displayName}
                      className="w-full h-full object-contain"
                    />
                  </div>
                )}
                <div>
                  <p className="font-bold text-lg text-foreground">{homeTeam?.team.displayName}</p>
                  {homeTeam?.records?.[0] && (
                    <p className="text-sm text-muted-foreground font-mono">{homeTeam.records[0].summary}</p>
                  )}
                </div>
              </div>
            </div>
          </Card>
        </div>

        <Tabs defaultValue="highlights" className="flex-1 flex flex-col px-6 pb-6">
          <TabsList className="grid w-full grid-cols-4 mb-4">
            <TabsTrigger value="highlights" className="gap-2">
              <VideoCamera size={16} />
              Highlights
            </TabsTrigger>
            <TabsTrigger value="box-score" className="gap-2">
              <ChartBar size={16} />
              Box Score
            </TabsTrigger>
            <TabsTrigger value="play-by-play" className="gap-2">
              <ListBullets size={16} />
              Play-by-Play
            </TabsTrigger>
            <TabsTrigger value="stats" className="gap-2">
              <Trophy size={16} />
              Team Stats
            </TabsTrigger>
          </TabsList>

          <TabsContent value="highlights" className="flex-1 m-0">
            <ScrollArea className="h-[500px] pr-4">
              <GameHighlightsPanel 
                gameId={game.id} 
                completed={isFinal}
                compact={true}
              />
            </ScrollArea>
          </TabsContent>

          <TabsContent value="box-score" className="flex-1 m-0">
            <ScrollArea className="h-[500px] pr-4">
              {isLoading ? (
                <div className="space-y-4">
                  {[1, 2, 3].map(i => <Skeleton key={i} className="h-24 w-full" />)}
                </div>
              ) : error ? (
                <Card className="p-8">
                  <p className="text-center text-muted-foreground">{error}</p>
                </Card>
              ) : !details?.boxScore?.players || details.boxScore.players.length === 0 ? (
                <Card className="p-8">
                  <p className="text-center text-muted-foreground">Box score not available</p>
                </Card>
              ) : (
                <div className="space-y-6">
                  {details.boxScore.players.map((teamData, idx) => (
                    <Card key={idx} className="overflow-hidden">
                      <div 
                        className="px-4 py-3 font-semibold text-white flex items-center gap-3"
                        style={{ backgroundColor: `#${competition.competitors[idx].team.color}` }}
                      >
                        {teamData.team.logos?.[0] && (
                          <img src={teamData.team.logos[0].href} alt="" className="w-6 h-6" />
                        )}
                        {teamData.team.displayName}
                      </div>
                      <div className="overflow-x-auto">
                        {teamData.players?.map((playerGroup, groupIdx) => (
                          <div key={groupIdx} className="mb-4 last:mb-0">
                            <div className="px-4 py-2 bg-muted font-medium text-sm">
                              {playerGroup.displayName}
                            </div>
                            <Table>
                              <TableHeader>
                                <TableRow>
                                  <TableHead className="w-[200px]">Player</TableHead>
                                  {playerGroup.labels?.map((label, i) => (
                                    <TableHead key={i} className="text-center font-mono text-xs">
                                      {label}
                                    </TableHead>
                                  ))}
                                </TableRow>
                              </TableHeader>
                              <TableBody>
                                {playerGroup.athletes?.map((player) => (
                                  <TableRow key={player.athlete.id}>
                                    <TableCell className="font-medium">
                                      <div className="flex items-center gap-2">
                                        {player.athlete.jersey && (
                                          <span className="text-xs font-mono text-muted-foreground w-6">
                                            #{player.athlete.jersey}
                                          </span>
                                        )}
                                        <span>{player.athlete.shortName}</span>
                                        {player.athlete.position && (
                                          <Badge variant="outline" className="text-xs">
                                            {player.athlete.position.abbreviation}
                                          </Badge>
                                        )}
                                      </div>
                                    </TableCell>
                                    {player.stats?.map((stat, i) => (
                                      <TableCell key={i} className="text-center font-mono text-sm">
                                        {stat || '-'}
                                      </TableCell>
                                    ))}
                                  </TableRow>
                                ))}
                              </TableBody>
                            </Table>
                          </div>
                        ))}
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </ScrollArea>
          </TabsContent>

          <TabsContent value="play-by-play" className="flex-1 m-0">
            <ScrollArea className="h-[500px] pr-4">
              {isLoading ? (
                <div className="space-y-2">
                  {[1, 2, 3, 4, 5].map(i => <Skeleton key={i} className="h-16 w-full" />)}
                </div>
              ) : error ? (
                <Card className="p-8">
                  <p className="text-center text-muted-foreground">{error}</p>
                </Card>
              ) : !details?.plays || details.plays.length === 0 ? (
                <Card className="p-8">
                  <p className="text-center text-muted-foreground">Play-by-play not available</p>
                </Card>
              ) : (
                <div className="space-y-1">
                  <AnimatePresence>
                    {details.plays.map((play, idx) => {
                      const isScoring = play.scoringPlay;
                      return (
                        <motion.div
                          key={play.id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: idx * 0.02 }}
                        >
                          <Card 
                            className={`p-4 ${
                              isScoring 
                                ? 'bg-primary/5 border-l-4 border-l-primary' 
                                : 'border-l-4 border-l-transparent'
                            }`}
                          >
                            <div className="flex items-start justify-between gap-4">
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                  {isScoring && (
                                    <Badge variant="default" className="gap-1">
                                      <Baseball size={12} weight="fill" />
                                      Score
                                    </Badge>
                                  )}
                                  <span className="text-xs font-mono text-muted-foreground">
                                    {play.period?.displayValue || 'Unknown Inning'}
                                  </span>
                                  {play.type?.text && (
                                    <Badge variant="outline" className="text-xs">
                                      {play.type.text}
                                    </Badge>
                                  )}
                                </div>
                                <p className="text-sm text-foreground">
                                  {play.text}
                                </p>
                              </div>
                              <div className="text-right shrink-0">
                                <div className="text-sm font-mono font-semibold text-foreground">
                                  {play.awayScore} - {play.homeScore}
                                </div>
                                {play.wallclock && (
                                  <div className="text-xs text-muted-foreground font-mono">
                                    {play.wallclock}
                                  </div>
                                )}
                              </div>
                            </div>
                          </Card>
                        </motion.div>
                      );
                    })}
                  </AnimatePresence>
                </div>
              )}
            </ScrollArea>
          </TabsContent>

          <TabsContent value="stats" className="flex-1 m-0">
            <ScrollArea className="h-[500px] pr-4">
              {isLoading ? (
                <div className="space-y-4">
                  {[1, 2].map(i => <Skeleton key={i} className="h-48 w-full" />)}
                </div>
              ) : error ? (
                <Card className="p-8">
                  <p className="text-center text-muted-foreground">{error}</p>
                </Card>
              ) : !details?.boxScore?.teams || details.boxScore.teams.length === 0 ? (
                <Card className="p-8">
                  <p className="text-center text-muted-foreground">Team statistics not available</p>
                </Card>
              ) : (
                <div className="space-y-6">
                  {details.boxScore.teams.map((teamData, idx) => (
                    <Card key={idx} className="overflow-hidden">
                      <div 
                        className="px-4 py-3 font-semibold text-white flex items-center gap-3"
                        style={{ backgroundColor: `#${competition.competitors[idx].team.color}` }}
                      >
                        {teamData.team.logos?.[0] && (
                          <img src={teamData.team.logos[0].href} alt="" className="w-6 h-6" />
                        )}
                        {teamData.team.displayName}
                      </div>
                      <div className="p-4">
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                          {teamData.statistics?.map((stat, statIdx) => (
                            <div key={statIdx} className="flex flex-col">
                              <span className="text-xs text-muted-foreground mb-1">
                                {stat.label}
                              </span>
                              <span className="text-2xl font-bold text-foreground font-mono">
                                {stat.displayValue}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </Card>
                  ))}

                  {details.leaders && details.leaders.length > 0 && (
                    <Card className="p-4">
                      <h4 className="font-semibold mb-4 flex items-center gap-2">
                        <Trophy size={18} className="text-primary" />
                        Game Leaders
                      </h4>
                      <div className="space-y-4">
                        {details.leaders.map((leader, idx) => (
                          <div key={idx}>
                            <p className="text-sm font-medium text-muted-foreground mb-2">
                              {leader.displayName}
                            </p>
                            <div className="space-y-2">
                              {leader.leaders.map((l, lIdx) => (
                                <div key={lIdx} className="flex items-center justify-between">
                                  <span className="text-sm text-foreground">
                                    {l.athlete.displayName}
                                  </span>
                                  <span className="text-sm font-mono font-semibold text-foreground">
                                    {l.displayValue}
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    </Card>
                  )}
                </div>
              )}
            </ScrollArea>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
