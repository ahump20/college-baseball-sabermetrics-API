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
import { 
  Download, 
  FileText, 
  TrendUp, 
  User, 
  Baseball,
  MapPin,
  Ruler,
  GraduationCap,
} from '@phosphor-icons/react';
import { texasPdfScraper, type TexasTeamStats, type TexasPlayerStats } from '@/lib/texasPdfScraper';
import { toast } from 'sonner';
import { Skeleton } from '@/components/ui/skeleton';

export function TexasLonghornsData() {
  const [teamData, setTeamData] = useState<TexasTeamStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [selectedPlayer, setSelectedPlayer] = useState<TexasPlayerStats | null>(null);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    loadMockData();
  }, []);

  const loadMockData = () => {
    setLoading(true);
    setTimeout(() => {
      const mockData = texasPdfScraper.generateMockData();
      setTeamData(mockData);
      setLoading(false);
      toast.success('Texas Longhorns data loaded successfully');
    }, 800);
  };

  const scrapeRealData = async () => {
    setLoading(true);
    toast.info('Attempting to scrape live PDF data from texaslonghorns.com...');
    
    try {
      const data = await texasPdfScraper.scrapeFullTeamData();
      setTeamData(data);
      toast.success('Successfully scraped Texas Longhorns data from official PDFs');
    } catch (error) {
      console.error('PDF scraping error:', error);
      toast.error('PDF scraping failed. Using mock data instead. Live scraping requires CORS configuration.');
      loadMockData();
    } finally {
      setLoading(false);
    }
  };

  const battingPlayers = teamData?.players.filter(p => p.batting) || [];
  const pitchingPlayers = teamData?.players.filter(p => p.pitching) || [];

  const sortPlayersByBatting = (players: TexasPlayerStats[], stat: keyof NonNullable<TexasPlayerStats['batting']>) => {
    return [...players].sort((a, b) => {
      const aValue = a.batting?.[stat] || 0;
      const bValue = b.batting?.[stat] || 0;
      return (bValue as number) - (aValue as number);
    });
  };

  const sortPlayersByPitching = (players: TexasPlayerStats[], stat: keyof NonNullable<TexasPlayerStats['pitching']>) => {
    return [...players].sort((a, b) => {
      const aValue = a.pitching?.[stat] || 0;
      const bValue = b.pitching?.[stat] || 0;
      if (stat === 'era' || stat === 'whip') {
        return (aValue as number) - (bValue as number);
      }
      return (bValue as number) - (aValue as number);
    });
  };

  if (loading && !teamData) {
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <Skeleton className="h-8 w-64" />
            <Skeleton className="h-4 w-96 mt-2" />
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card className="border-primary/20 bg-gradient-to-br from-card via-card to-primary/5">
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-xl bg-primary/20 flex items-center justify-center">
                <Baseball size={32} weight="bold" className="text-primary" />
              </div>
              <div>
                <CardTitle className="text-2xl flex items-center gap-3">
                  Texas Longhorns Baseball
                  <Badge variant="outline" className="font-mono text-xs px-2 py-1">
                    {teamData?.season || '2026'}
                  </Badge>
                </CardTitle>
                <CardDescription className="mt-1.5 flex items-center gap-4 text-base">
                  <span className="font-semibold text-foreground">
                    Record: {teamData?.record.overall || '0-0'}
                  </span>
                  <span className="text-muted-foreground">•</span>
                  <span>Conference: {teamData?.record.conference || '0-0'}</span>
                  <span className="text-muted-foreground">•</span>
                  <span>Home: {teamData?.record.home || '0-0'}</span>
                </CardDescription>
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                onClick={loadMockData}
                variant="outline"
                size="sm"
                disabled={loading}
                className="gap-2"
              >
                <FileText size={16} weight="bold" />
                Mock Data
              </Button>
              <Button
                onClick={scrapeRealData}
                variant="default"
                size="sm"
                disabled={loading}
                className="gap-2"
              >
                <Download size={16} weight="bold" />
                {loading ? 'Scraping PDFs...' : 'Scrape Live PDFs'}
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Team Batting</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex justify-between items-baseline">
              <span className="text-xs text-muted-foreground">AVG</span>
              <span className="text-2xl font-bold text-foreground">{teamData?.teamBatting.avg.toFixed(3) || '.000'}</span>
            </div>
            <div className="flex justify-between items-baseline">
              <span className="text-xs text-muted-foreground">OPS</span>
              <span className="text-xl font-semibold text-primary">{teamData?.teamBatting.ops.toFixed(3) || '.000'}</span>
            </div>
            <div className="grid grid-cols-3 gap-2 pt-2 border-t border-border/50">
              <div>
                <div className="text-xs text-muted-foreground">HR</div>
                <div className="text-lg font-bold">{teamData?.teamBatting.hr || 0}</div>
              </div>
              <div>
                <div className="text-xs text-muted-foreground">RBI</div>
                <div className="text-lg font-bold">{teamData?.teamBatting.rbi || 0}</div>
              </div>
              <div>
                <div className="text-xs text-muted-foreground">SB</div>
                <div className="text-lg font-bold">{teamData?.teamBatting.sb || 0}</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Team Pitching</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex justify-between items-baseline">
              <span className="text-xs text-muted-foreground">ERA</span>
              <span className="text-2xl font-bold text-foreground">{teamData?.teamPitching.era.toFixed(2) || '0.00'}</span>
            </div>
            <div className="flex justify-between items-baseline">
              <span className="text-xs text-muted-foreground">WHIP</span>
              <span className="text-xl font-semibold text-primary">{teamData?.teamPitching.whip.toFixed(2) || '0.00'}</span>
            </div>
            <div className="grid grid-cols-3 gap-2 pt-2 border-t border-border/50">
              <div>
                <div className="text-xs text-muted-foreground">K</div>
                <div className="text-lg font-bold">{teamData?.teamPitching.so || 0}</div>
              </div>
              <div>
                <div className="text-xs text-muted-foreground">BB</div>
                <div className="text-lg font-bold">{teamData?.teamPitching.bb || 0}</div>
              </div>
              <div>
                <div className="text-xs text-muted-foreground">SV</div>
                <div className="text-lg font-bold">{teamData?.teamPitching.saves || 0}</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Data Source</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-start gap-2">
              <FileText size={16} weight="bold" className="text-primary mt-0.5 shrink-0" />
              <div className="space-y-1">
                <div className="text-xs font-medium">Season Stats PDF</div>
                <div className="text-xs text-muted-foreground font-mono break-all">
                  /documents/.../Season-Stats-Feb-24.pdf
                </div>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <FileText size={16} weight="bold" className="text-secondary mt-0.5 shrink-0" />
              <div className="space-y-1">
                <div className="text-xs font-medium">Media Guide PDF</div>
                <div className="text-xs text-muted-foreground font-mono break-all">
                  /documents/.../2026_Baseball_Media_Guide.pdf
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="batting">Batting Leaders</TabsTrigger>
          <TabsTrigger value="pitching">Pitching Leaders</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4 mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendUp size={20} weight="bold" className="text-primary" />
                Recent Results
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[400px] pr-4">
                <div className="space-y-2">
                  {teamData?.schedule.map((game, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between p-3 rounded-lg border border-border bg-card hover:bg-muted/30 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <Badge
                          variant={game.result === 'W' ? 'default' : 'destructive'}
                          className="w-6 h-6 flex items-center justify-center p-0 font-bold"
                        >
                          {game.result}
                        </Badge>
                        <div>
                          <div className="font-semibold">
                            {game.isHome ? 'vs' : '@'} {game.opponent}
                          </div>
                          <div className="text-xs text-muted-foreground">{game.date}</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-mono text-lg font-bold">{game.score}</div>
                        {game.attendance && (
                          <div className="text-xs text-muted-foreground">
                            Att: {game.attendance.toLocaleString()}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="batting" className="space-y-4 mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Batting Statistics</CardTitle>
              <CardDescription>Top performers by batting average and key offensive stats</CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[500px]">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Player</TableHead>
                      <TableHead className="text-center">Pos</TableHead>
                      <TableHead className="text-center">GP</TableHead>
                      <TableHead className="text-center">AVG</TableHead>
                      <TableHead className="text-center">OPS</TableHead>
                      <TableHead className="text-center">HR</TableHead>
                      <TableHead className="text-center">RBI</TableHead>
                      <TableHead className="text-center">H</TableHead>
                      <TableHead className="text-center">BB</TableHead>
                      <TableHead className="text-center">SO</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {sortPlayersByBatting(battingPlayers, 'avg').map((player, idx) => (
                      <TableRow
                        key={player.playerId}
                        className="cursor-pointer hover:bg-muted/50"
                        onClick={() => setSelectedPlayer(player)}
                      >
                        <TableCell className="font-medium">
                          <div className="flex items-center gap-2">
                            {player.jerseyNumber && (
                              <Badge variant="outline" className="w-6 h-6 flex items-center justify-center p-0 text-xs">
                                {player.jerseyNumber}
                              </Badge>
                            )}
                            <span>{player.name}</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-center font-mono text-xs">{player.position}</TableCell>
                        <TableCell className="text-center">{player.batting?.gp}</TableCell>
                        <TableCell className="text-center font-mono font-bold">
                          {player.batting?.avg.toFixed(3)}
                        </TableCell>
                        <TableCell className="text-center font-mono text-primary font-semibold">
                          {player.batting?.ops.toFixed(3)}
                        </TableCell>
                        <TableCell className="text-center font-semibold">{player.batting?.hr}</TableCell>
                        <TableCell className="text-center">{player.batting?.rbi}</TableCell>
                        <TableCell className="text-center">{player.batting?.h}</TableCell>
                        <TableCell className="text-center text-muted-foreground">{player.batting?.bb}</TableCell>
                        <TableCell className="text-center text-muted-foreground">{player.batting?.so}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="pitching" className="space-y-4 mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Pitching Statistics</CardTitle>
              <CardDescription>Top performers by ERA and key pitching metrics</CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[500px]">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Player</TableHead>
                      <TableHead className="text-center">GP</TableHead>
                      <TableHead className="text-center">GS</TableHead>
                      <TableHead className="text-center">W-L</TableHead>
                      <TableHead className="text-center">ERA</TableHead>
                      <TableHead className="text-center">WHIP</TableHead>
                      <TableHead className="text-center">IP</TableHead>
                      <TableHead className="text-center">SO</TableHead>
                      <TableHead className="text-center">BB</TableHead>
                      <TableHead className="text-center">SV</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {sortPlayersByPitching(pitchingPlayers, 'era').map((player) => (
                      <TableRow
                        key={player.playerId}
                        className="cursor-pointer hover:bg-muted/50"
                        onClick={() => setSelectedPlayer(player)}
                      >
                        <TableCell className="font-medium">
                          <div className="flex items-center gap-2">
                            {player.jerseyNumber && (
                              <Badge variant="outline" className="w-6 h-6 flex items-center justify-center p-0 text-xs">
                                {player.jerseyNumber}
                              </Badge>
                            )}
                            <span>{player.name}</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-center">{player.pitching?.gp}</TableCell>
                        <TableCell className="text-center">{player.pitching?.gs}</TableCell>
                        <TableCell className="text-center font-mono">
                          {player.pitching?.w}-{player.pitching?.l}
                        </TableCell>
                        <TableCell className="text-center font-mono font-bold text-primary">
                          {player.pitching?.era.toFixed(2)}
                        </TableCell>
                        <TableCell className="text-center font-mono font-semibold">
                          {player.pitching?.whip.toFixed(2)}
                        </TableCell>
                        <TableCell className="text-center">{player.pitching?.ip.toFixed(1)}</TableCell>
                        <TableCell className="text-center font-semibold">{player.pitching?.so}</TableCell>
                        <TableCell className="text-center text-muted-foreground">{player.pitching?.bb}</TableCell>
                        <TableCell className="text-center">{player.pitching?.sv}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {selectedPlayer && (
        <Card className="border-primary/30 bg-gradient-to-br from-card to-primary/5">
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
                  <User size={24} weight="bold" className="text-primary" />
                </div>
                <div>
                  <CardTitle className="flex items-center gap-2">
                    {selectedPlayer.jerseyNumber && (
                      <Badge variant="outline" className="font-mono">
                        #{selectedPlayer.jerseyNumber}
                      </Badge>
                    )}
                    {selectedPlayer.name}
                  </CardTitle>
                  <CardDescription className="mt-1 flex items-center gap-3">
                    <span className="font-semibold">{selectedPlayer.position}</span>
                    <span>•</span>
                    <span>{selectedPlayer.year}</span>
                  </CardDescription>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSelectedPlayer(null)}
              >
                Close
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {selectedPlayer.bio && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                {selectedPlayer.bio.height && (
                  <div className="flex items-center gap-2">
                    <Ruler size={16} className="text-muted-foreground" />
                    <div>
                      <div className="text-xs text-muted-foreground">Height</div>
                      <div className="font-semibold">{selectedPlayer.bio.height}</div>
                    </div>
                  </div>
                )}
                {selectedPlayer.bio.weight && (
                  <div className="flex items-center gap-2">
                    <Ruler size={16} className="text-muted-foreground" />
                    <div>
                      <div className="text-xs text-muted-foreground">Weight</div>
                      <div className="font-semibold">{selectedPlayer.bio.weight} lbs</div>
                    </div>
                  </div>
                )}
                {selectedPlayer.bio.hometown && (
                  <div className="flex items-center gap-2">
                    <MapPin size={16} className="text-muted-foreground" />
                    <div>
                      <div className="text-xs text-muted-foreground">Hometown</div>
                      <div className="font-semibold">{selectedPlayer.bio.hometown}</div>
                    </div>
                  </div>
                )}
                {selectedPlayer.bio.highSchool && (
                  <div className="flex items-center gap-2">
                    <GraduationCap size={16} className="text-muted-foreground" />
                    <div>
                      <div className="text-xs text-muted-foreground">High School</div>
                      <div className="font-semibold">{selectedPlayer.bio.highSchool}</div>
                    </div>
                  </div>
                )}
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {selectedPlayer.batting && (
                <div className="space-y-2">
                  <h4 className="font-semibold text-sm text-muted-foreground">Batting Stats</h4>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div className="flex justify-between p-2 bg-muted/30 rounded">
                      <span className="text-muted-foreground">AVG</span>
                      <span className="font-mono font-bold">{selectedPlayer.batting.avg.toFixed(3)}</span>
                    </div>
                    <div className="flex justify-between p-2 bg-muted/30 rounded">
                      <span className="text-muted-foreground">OBP</span>
                      <span className="font-mono font-semibold">{selectedPlayer.batting.obp.toFixed(3)}</span>
                    </div>
                    <div className="flex justify-between p-2 bg-muted/30 rounded">
                      <span className="text-muted-foreground">SLG</span>
                      <span className="font-mono font-semibold">{selectedPlayer.batting.slg.toFixed(3)}</span>
                    </div>
                    <div className="flex justify-between p-2 bg-muted/30 rounded">
                      <span className="text-muted-foreground">OPS</span>
                      <span className="font-mono font-bold text-primary">{selectedPlayer.batting.ops.toFixed(3)}</span>
                    </div>
                  </div>
                </div>
              )}

              {selectedPlayer.pitching && (
                <div className="space-y-2">
                  <h4 className="font-semibold text-sm text-muted-foreground">Pitching Stats</h4>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div className="flex justify-between p-2 bg-muted/30 rounded">
                      <span className="text-muted-foreground">ERA</span>
                      <span className="font-mono font-bold text-primary">{selectedPlayer.pitching.era.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between p-2 bg-muted/30 rounded">
                      <span className="text-muted-foreground">WHIP</span>
                      <span className="font-mono font-semibold">{selectedPlayer.pitching.whip.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between p-2 bg-muted/30 rounded">
                      <span className="text-muted-foreground">K/9</span>
                      <span className="font-mono font-semibold">
                        {selectedPlayer.pitching.ip > 0 
                          ? ((selectedPlayer.pitching.so / selectedPlayer.pitching.ip) * 9).toFixed(2)
                          : '0.00'
                        }
                      </span>
                    </div>
                    <div className="flex justify-between p-2 bg-muted/30 rounded">
                      <span className="text-muted-foreground">W-L</span>
                      <span className="font-mono font-bold">{selectedPlayer.pitching.w}-{selectedPlayer.pitching.l}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
