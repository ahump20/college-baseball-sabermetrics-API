import { useState, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  ArrowClockwise,
  CalendarBlank,
  CaretLeft,
  Trophy,
  Pulse,
  WarningCircle,
} from '@phosphor-icons/react';
import { espnAPI, type ESPNGame } from '@/lib/espnAPI';

interface BoxScoreTeam {
  displayName: string;
  abbreviation: string;
  score: string;
  homeAway: string;
  winner: boolean;
  record?: string;
}

interface BoxScorePlayer {
  name: string;
  position: string;
  stats: string[];
}

interface BoxScoreCategory {
  name: string;
  displayName: string;
  labels: string[];
  athletes: BoxScorePlayer[];
}

interface BoxScore {
  teams: BoxScoreTeam[];
  categories: BoxScoreCategory[];
}

function formatGameDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    timeZoneName: 'short',
  });
}

function getStatusBadgeProps(state: string, description: string) {
  switch (state) {
    case 'in':
      return { label: description || 'Live', className: 'bg-success/10 text-success border-success/30 animate-pulse' };
    case 'post':
      return { label: 'Final', className: 'bg-muted/50 text-muted-foreground border-border' };
    default:
      return { label: description || 'Scheduled', className: 'bg-primary/10 text-primary border-primary/20' };
  }
}

function GameCard({ game, onSelect }: { game: ESPNGame; onSelect: (game: ESPNGame) => void }) {
  const competition = game.competitions?.[0];
  if (!competition) return null;

  const homeTeam = competition.competitors.find((c) => c.homeAway === 'home');
  const awayTeam = competition.competitors.find((c) => c.homeAway === 'away');
  const statusState = game.status?.type?.state ?? 'pre';
  const statusDesc = game.status?.type?.shortDetail ?? game.status?.type?.description ?? '';
  const badge = getStatusBadgeProps(statusState, statusDesc);
  const isCompleted = game.status?.type?.completed;

  return (
    <Card
      className="cursor-pointer hover:border-primary/40 transition-colors"
      onClick={() => onSelect(game)}
      role="button"
      tabIndex={0}
      aria-label={`View details for ${awayTeam?.team?.displayName ?? 'away team'} at ${homeTeam?.team?.displayName ?? 'home team'} on ${formatGameDate(game.date)}`}
      onKeyDown={(event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          onSelect(game);
        }
      }}
    >
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-3">
          <Badge variant="outline" className={`text-xs font-mono ${badge.className}`}>
            {badge.label}
          </Badge>
          <span className="text-xs text-muted-foreground font-mono">
            {formatGameDate(game.date)}
          </span>
        </div>

        <div className="space-y-2">
          {[awayTeam, homeTeam].map((team) => {
            if (!team) return null;
            const record = team.records?.find((r) => r.type === 'total')?.summary;
            return (
              <div key={team.id} className="flex items-center justify-between">
                <div className="flex items-center gap-2 min-w-0">
                  {isCompleted && team.winner && (
                    <Trophy size={14} className="text-warning shrink-0" />
                  )}
                  <span className={`font-medium truncate ${isCompleted && team.winner ? 'text-foreground' : 'text-muted-foreground'}`}>
                    {team.team.displayName}
                  </span>
                  {record && (
                    <span className="text-xs text-muted-foreground font-mono shrink-0">
                      ({record})
                    </span>
                  )}
                </div>
                <span className={`font-mono text-lg font-bold tabular-nums ml-4 ${isCompleted && team.winner ? 'text-foreground' : 'text-muted-foreground'}`}>
                  {team.score ?? '—'}
                </span>
              </div>
            );
          })}
        </div>

        {competition.notes && competition.notes.length > 0 && (
          <p className="text-xs text-muted-foreground mt-2 truncate">
            {competition.notes[0].headline}
          </p>
        )}
      </CardContent>
    </Card>
  );
}

function BoxScoreView({
  game,
  boxScore,
  onBack,
}: {
  game: ESPNGame;
  boxScore: BoxScore | null;
  onBack: () => void;
}) {
  const competition = game.competitions?.[0];
  const homeTeam = competition?.competitors.find((c) => c.homeAway === 'home');
  const awayTeam = competition?.competitors.find((c) => c.homeAway === 'away');
  const statusDesc = game.status?.type?.detail ?? game.status?.type?.description ?? '';
  const isCompleted = game.status?.type?.completed;

  const battingCategories = boxScore?.categories?.filter(
    (c) => c.name === 'batting' || c.name === 'hitting'
  ) ?? [];
  const pitchingCategories = boxScore?.categories?.filter((c) => c.name === 'pitching') ?? [];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="outline" size="sm" onClick={onBack} className="gap-2">
          <CaretLeft size={14} />
          Back
        </Button>
        <div>
          <h3 className="font-semibold">{game.name}</h3>
          <p className="text-xs text-muted-foreground">{statusDesc}</p>
        </div>
      </div>

      {/* Linescore */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-stretch gap-6 justify-center">
            {[awayTeam, homeTeam].map((team) => {
              if (!team) return null;
              const record = team.records?.find((r) => r.type === 'total')?.summary;
              return (
                <div key={team.id} className="flex-1 text-center">
                  <div className="text-sm text-muted-foreground mb-1">
                    {team.homeAway === 'home' ? 'HOME' : 'AWAY'}
                  </div>
                  <div className={`text-xl font-bold mb-1 ${isCompleted && team.winner ? 'text-foreground' : 'text-muted-foreground'}`}>
                    {team.team.displayName}
                  </div>
                  {record && (
                    <div className="text-xs text-muted-foreground font-mono mb-2">({record})</div>
                  )}
                  <div className={`text-5xl font-mono font-bold tabular-nums ${isCompleted && team.winner ? 'text-primary' : 'text-muted-foreground'}`}>
                    {team.score ?? '—'}
                  </div>
                  {isCompleted && team.winner && (
                    <div className="mt-2">
                      <Trophy size={18} className="text-warning mx-auto" />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Batting stats */}
      {battingCategories.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Batting</CardTitle>
          </CardHeader>
          <CardContent>
            {battingCategories.map((cat, idx) => (
              <div key={idx} className="mb-4 last:mb-0">
                {cat.athletes && cat.athletes.length > 0 && (
                  <ScrollArea className="h-auto max-h-64">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Player</TableHead>
                          <TableHead>Pos</TableHead>
                          {cat.labels?.map((label) => (
                            <TableHead key={label} className="text-right font-mono text-xs">
                              {label}
                            </TableHead>
                          ))}
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {cat.athletes.map((athlete, aidx) => (
                          <TableRow key={aidx}>
                            <TableCell className="font-medium">{athlete.name}</TableCell>
                            <TableCell className="text-muted-foreground text-xs">{athlete.position}</TableCell>
                            {athlete.stats?.map((stat, sidx) => (
                              <TableCell key={sidx} className="text-right font-mono text-sm">
                                {stat}
                              </TableCell>
                            ))}
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </ScrollArea>
                )}
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Pitching stats */}
      {pitchingCategories.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Pitching</CardTitle>
          </CardHeader>
          <CardContent>
            {pitchingCategories.map((cat, idx) => (
              <div key={idx} className="mb-4 last:mb-0">
                {cat.athletes && cat.athletes.length > 0 && (
                  <ScrollArea className="h-auto max-h-64">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Pitcher</TableHead>
                          {cat.labels?.map((label) => (
                            <TableHead key={label} className="text-right font-mono text-xs">
                              {label}
                            </TableHead>
                          ))}
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {cat.athletes.map((athlete, aidx) => (
                          <TableRow key={aidx}>
                            <TableCell className="font-medium">{athlete.name}</TableCell>
                            {athlete.stats?.map((stat, sidx) => (
                              <TableCell key={sidx} className="text-right font-mono text-sm">
                                {stat}
                              </TableCell>
                            ))}
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </ScrollArea>
                )}
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {boxScore && battingCategories.length === 0 && pitchingCategories.length === 0 && (
        <Card>
          <CardContent className="py-8 text-center text-muted-foreground text-sm">
            Detailed player stats are not yet available for this game.
          </CardContent>
        </Card>
      )}
    </div>
  );
}

export function Scoreboard() {
  const [games, setGames] = useState<ESPNGame[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dateInput, setDateInput] = useState(
    new Date().toISOString().split('T')[0]
  );
  const [selectedGame, setSelectedGame] = useState<ESPNGame | null>(null);
  const [boxScore, setBoxScore] = useState<BoxScore | null>(null);
  const [boxScoreLoading, setBoxScoreLoading] = useState(false);

  const fetchGames = useCallback(async (date: string) => {
    setLoading(true);
    setError(null);
    setSelectedGame(null);
    setBoxScore(null);
    try {
      const dateFormatted = date.replace(/-/g, '');
      const response = await espnAPI.getScoreboard(dateFormatted, 50);
      setGames(response.events ?? []);
    } catch (err) {
      setError('Unable to load games from ESPN. Please try again later or check your network connection.');
      setGames([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleSelectGame = useCallback(async (game: ESPNGame) => {
    setSelectedGame(game);
    setBoxScore(null);
    setBoxScoreLoading(true);
    try {
      const data = await espnAPI.getGameBoxScore(game.id);
      if (data) {
        // Normalize ESPN box score structure into our BoxScore interface
        const normalized: BoxScore = {
          teams: (game.competitions?.[0]?.competitors ?? []).map((c) => ({
            displayName: c.team.displayName,
            abbreviation: c.team.abbreviation,
            score: c.score,
            homeAway: c.homeAway,
            winner: c.winner,
            record: c.records?.find((r) => r.type === 'total')?.summary,
          })),
          categories: [],
        };

        // ESPN boxscore structure: data.teams[].statistics[] or data.players[].statistics[]
        if (data.players) {
          for (const teamData of data.players) {
            const teamName = teamData.team?.displayName ?? '';
            for (const statGroup of teamData.statistics ?? []) {
              const labels: string[] = statGroup.labels ?? statGroup.names ?? [];
              const athletes: BoxScorePlayer[] = (statGroup.athletes ?? []).map((a: any) => ({
                name: a.athlete?.displayName ?? a.athlete?.shortName ?? 'Name Not Available',
                position: a.athlete?.position?.abbreviation ?? '',
                stats: a.stats ?? [],
              }));
              if (athletes.length > 0) {
                normalized.categories.push({
                  name: statGroup.name ?? 'batting',
                  displayName: `${teamName} — ${statGroup.displayName ?? statGroup.name ?? 'Stats'}`,
                  labels,
                  athletes,
                });
              }
            }
          }
        }

        setBoxScore(normalized);
      }
    } catch {
      // Box score unavailable; we still show the linescore from the game object
      setBoxScore(null);
    } finally {
      setBoxScoreLoading(false);
    }
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold mb-2">ESPN Scoreboard</h2>
        <p className="text-muted-foreground">
          Live game scores and box scores sourced directly from the ESPN college baseball scoreboard API.
        </p>
      </div>

      {/* Date picker + fetch */}
      <div className="flex items-center gap-3">
        <CalendarBlank size={18} className="text-muted-foreground shrink-0" />
        <Input
          type="date"
          value={dateInput}
          onChange={(e) => setDateInput(e.target.value)}
          className="w-44 font-mono"
        />
        <Button onClick={() => fetchGames(dateInput)} disabled={loading} className="gap-2">
          {loading ? (
            <>
              <Pulse size={16} className="animate-spin" />
              Loading…
            </>
          ) : (
            <>
              <ArrowClockwise size={16} />
              Load Games
            </>
          )}
        </Button>
        {games.length > 0 && !selectedGame && (
          <span className="text-sm text-muted-foreground ml-2">
            {games.length} game{games.length !== 1 ? 's' : ''} found
          </span>
        )}
      </div>

      <Separator />

      {/* Error state */}
      {error && (
        <Card className="border-destructive/30 bg-destructive/5">
          <CardContent className="py-6 flex items-start gap-3">
            <WarningCircle size={20} className="text-destructive shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-sm text-destructive mb-1">Failed to load games</p>
              <p className="text-sm text-muted-foreground">{error}</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Empty state */}
      {!loading && !error && games.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center">
            <CalendarBlank size={40} className="mx-auto text-muted-foreground mb-3 opacity-50" />
            <p className="text-muted-foreground text-sm">
              Select a date and click <strong>Load Games</strong> to fetch the ESPN college baseball scoreboard.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Box score detail */}
      {selectedGame && (
        <div>
          {boxScoreLoading ? (
            <Card>
              <CardContent className="py-8 text-center">
                <Pulse size={24} className="mx-auto text-muted-foreground mb-2 animate-spin" />
                <p className="text-sm text-muted-foreground">Loading box score…</p>
              </CardContent>
            </Card>
          ) : (
            <BoxScoreView
              game={selectedGame}
              boxScore={boxScore}
              onBack={() => {
                setSelectedGame(null);
                setBoxScore(null);
              }}
            />
          )}
        </div>
      )}

      {/* Game grid */}
      {!selectedGame && games.length > 0 && (
        <div>
          <p className="text-xs text-muted-foreground mb-4">
            Click on a game to view its box score.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {games.map((game) => (
              <GameCard key={game.id} game={game} onSelect={handleSelectGame} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
