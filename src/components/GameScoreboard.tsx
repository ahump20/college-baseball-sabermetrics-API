import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { ArrowClockwise, Baseball, Calendar, MapPin, Users } from '@phosphor-icons/react';
import { espnGameData, type GameBoxScore } from '@/lib/espnGameData';
import type { ESPNGame } from '@/lib/espnAPI';
import { toast } from 'sonner';

export function GameScoreboard() {
  const [games, setGames] = useState<ESPNGame[]>([]);
  const [selectedGame, setSelectedGame] = useState<ESPNGame | null>(null);
  const [boxScore, setBoxScore] = useState<GameBoxScore | null>(null);
  const [loading, setLoading] = useState(false);
  const [boxScoreLoading, setBoxScoreLoading] = useState(false);
  const [daysBack, setDaysBack] = useState(3);

  useEffect(() => {
    loadGames();
  }, [daysBack]);

  const loadGames = async () => {
    setLoading(true);
    try {
      const fetchedGames = await espnGameData.getRecentGames(daysBack);
      setGames(fetchedGames);
      toast.success(`Loaded ${fetchedGames.length} games from the last ${daysBack} days`);
      
      if (fetchedGames.length > 0 && !selectedGame) {
        const completedGame = fetchedGames.find(g => 
          g.status?.type?.completed === true
        );
        if (completedGame) {
          setSelectedGame(completedGame);
          loadBoxScore(completedGame.id);
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

  const handleGameClick = (game: ESPNGame) => {
    setSelectedGame(game);
    loadBoxScore(game.id);
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
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium">
                              {awayTeam?.team.abbreviation || 'Away'}
                            </span>
                            <span className="text-sm font-bold">
                              {awayTeam?.score || '0'}
                            </span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium">
                              {homeTeam?.team.abbreviation || 'Home'}
                            </span>
                            <span className="text-sm font-bold">
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
                    </TabsList>
                    
                    <TabsContent value="batting" className="space-y-4">
                      {boxScore.awayRoster && (
                        <div>
                          <h5 className="font-semibold mb-2">{boxScore.away.displayName}</h5>
                          <div className="border rounded-lg overflow-hidden">
                            <Table>
                              <TableHeader>
                                <TableRow>
                                  <TableHead>Player</TableHead>
                                  <TableHead className="text-center">AB</TableHead>
                                  <TableHead className="text-center">R</TableHead>
                                  <TableHead className="text-center">H</TableHead>
                                  <TableHead className="text-center">RBI</TableHead>
                                  <TableHead className="text-center">BB</TableHead>
                                  <TableHead className="text-center">SO</TableHead>
                                  <TableHead className="text-right">AVG</TableHead>
                                </TableRow>
                              </TableHeader>
                              <TableBody>
                                {boxScore.awayRoster
                                  .filter(p => p.stats.batting)
                                  .map((player) => (
                                    <TableRow key={player.id}>
                                      <TableCell className="font-medium">
                                        {player.displayName}
                                        {player.position && (
                                          <span className="ml-2 text-xs text-muted-foreground">
                                            {player.position}
                                          </span>
                                        )}
                                      </TableCell>
                                      <TableCell className="text-center font-mono">
                                        {player.stats.batting?.AB}
                                      </TableCell>
                                      <TableCell className="text-center font-mono">
                                        {player.stats.batting?.R}
                                      </TableCell>
                                      <TableCell className="text-center font-mono">
                                        {player.stats.batting?.H}
                                      </TableCell>
                                      <TableCell className="text-center font-mono">
                                        {player.stats.batting?.RBI}
                                      </TableCell>
                                      <TableCell className="text-center font-mono">
                                        {player.stats.batting?.BB}
                                      </TableCell>
                                      <TableCell className="text-center font-mono">
                                        {player.stats.batting?.SO}
                                      </TableCell>
                                      <TableCell className="text-right font-mono">
                                        {player.stats.batting?.AVG}
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
                                  <TableHead className="text-center">AB</TableHead>
                                  <TableHead className="text-center">R</TableHead>
                                  <TableHead className="text-center">H</TableHead>
                                  <TableHead className="text-center">RBI</TableHead>
                                  <TableHead className="text-center">BB</TableHead>
                                  <TableHead className="text-center">SO</TableHead>
                                  <TableHead className="text-right">AVG</TableHead>
                                </TableRow>
                              </TableHeader>
                              <TableBody>
                                {boxScore.homeRoster
                                  .filter(p => p.stats.batting)
                                  .map((player) => (
                                    <TableRow key={player.id}>
                                      <TableCell className="font-medium">
                                        {player.displayName}
                                        {player.position && (
                                          <span className="ml-2 text-xs text-muted-foreground">
                                            {player.position}
                                          </span>
                                        )}
                                      </TableCell>
                                      <TableCell className="text-center font-mono">
                                        {player.stats.batting?.AB}
                                      </TableCell>
                                      <TableCell className="text-center font-mono">
                                        {player.stats.batting?.R}
                                      </TableCell>
                                      <TableCell className="text-center font-mono">
                                        {player.stats.batting?.H}
                                      </TableCell>
                                      <TableCell className="text-center font-mono">
                                        {player.stats.batting?.RBI}
                                      </TableCell>
                                      <TableCell className="text-center font-mono">
                                        {player.stats.batting?.BB}
                                      </TableCell>
                                      <TableCell className="text-center font-mono">
                                        {player.stats.batting?.SO}
                                      </TableCell>
                                      <TableCell className="text-right font-mono">
                                        {player.stats.batting?.AVG}
                                      </TableCell>
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
