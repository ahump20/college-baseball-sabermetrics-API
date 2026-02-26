import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { useESPNScoreboard, ESPNGame } from '@/hooks/use-espn-scoreboard';
import { Calendar, Clock, MapPin, Trophy, ArrowClockwise, Broadcast, Circle } from '@phosphor-icons/react';
import { motion, AnimatePresence } from 'framer-motion';
import { format, formatDistanceToNow } from 'date-fns';
import { toast } from 'sonner';

export function LiveGameScores() {
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [autoRefreshEnabled, setAutoRefreshEnabled] = useState(true);
  const { games, isLoading, error, refetch, liveGameCount, hasLiveGames, lastUpdated } = useESPNScoreboard(selectedDate, autoRefreshEnabled);
  const [previousLiveCount, setPreviousLiveCount] = useState(0);

  useEffect(() => {
    if (liveGameCount > previousLiveCount && previousLiveCount > 0) {
      toast.success(`New live game started!`, {
        description: `${liveGameCount} ${liveGameCount === 1 ? 'game' : 'games'} in progress`,
      });
    }
    setPreviousLiveCount(liveGameCount);
  }, [liveGameCount]);

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const dateValue = e.target.value;
    setSelectedDate(dateValue ? dateValue.replace(/-/g, '') : '');
  };

  const getGameStatus = (game: ESPNGame) => {
    const status = game.status.type;
    if (status.completed) return { label: 'Final', variant: 'secondary' as const, isLive: false };
    if (status.state === 'in') return { label: 'Live', variant: 'default' as const, isLive: true };
    return { label: status.detail, variant: 'outline' as const, isLive: false };
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4">
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <div>
            <h3 className="text-xl font-semibold text-foreground mb-1">
              Live Game Scores & Schedules
            </h3>
            <p className="text-sm text-muted-foreground">
              Real-time updates from ESPN College Baseball
            </p>
          </div>
          <div className="flex gap-3 items-center flex-wrap">
            <div className="flex items-center gap-2">
              <Calendar size={18} className="text-muted-foreground" />
              <Input
                type="date"
                onChange={handleDateChange}
                className="w-auto font-mono text-sm"
              />
            </div>
            <Button 
              onClick={() => refetch()} 
              variant="outline" 
              size="sm"
              className="gap-2"
            >
              <ArrowClockwise size={16} />
              Refresh
            </Button>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between bg-card border border-border rounded-lg p-4">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Switch 
                id="auto-refresh" 
                checked={autoRefreshEnabled}
                onCheckedChange={setAutoRefreshEnabled}
              />
              <Label htmlFor="auto-refresh" className="text-sm font-medium cursor-pointer">
                Auto-refresh {autoRefreshEnabled && hasLiveGames && '(every 30s)'}
                {autoRefreshEnabled && !hasLiveGames && '(every 5m)'}
              </Label>
            </div>
            {hasLiveGames && (
              <Badge variant="default" className="gap-1.5 bg-success text-white animate-pulse">
                <Circle size={8} weight="fill" />
                {liveGameCount} Live
              </Badge>
            )}
          </div>
          {lastUpdated && lastUpdated > 0 && (
            <div className="text-xs text-muted-foreground font-mono">
              Updated {formatDistanceToNow(new Date(lastUpdated), { addSuffix: true })}
            </div>
          )}
        </div>
      </div>

      {isLoading ? (
        <div className="grid gap-4">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="p-6">
              <Skeleton className="h-24 w-full" />
            </Card>
          ))}
        </div>
      ) : error ? (
        <Card className="p-12">
          <p className="text-center text-muted-foreground">{error}</p>
        </Card>
      ) : !games || games.length === 0 ? (
        <Card className="p-12">
          <p className="text-center text-muted-foreground">
            No games scheduled for this date
          </p>
        </Card>
      ) : (
        <AnimatePresence mode="wait">
          <motion.div 
            className="grid gap-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            {games.map((game) => {
              const competition = game.competitions[0];
              const homeTeam = competition.competitors.find(c => c.homeAway === 'home');
              const awayTeam = competition.competitors.find(c => c.homeAway === 'away');
              const status = getGameStatus(game);

              if (!homeTeam || !awayTeam) return null;

              return (
                <motion.div
                  key={game.id}
                  layout
                  initial={{ scale: 0.95, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.2 }}
                >
                  <Card 
                    className={`p-5 transition-all ${
                      status.isLive 
                        ? 'ring-2 ring-success shadow-lg shadow-success/20' 
                        : 'hover:shadow-md'
                    }`}
                  >
                    <div className="flex flex-col gap-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Clock size={14} />
                          <span>{format(new Date(game.date), 'MMM d, yyyy h:mm a')}</span>
                        </div>
                        <Badge 
                          variant={status.variant} 
                          className={`gap-1.5 ${
                            status.isLive 
                              ? 'bg-success text-white border-success' 
                              : ''
                          }`}
                        >
                          {status.isLive && <Circle size={8} weight="fill" className="animate-pulse" />}
                          {status.label}
                        </Badge>
                      </div>

                      <div className="grid gap-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3 flex-1">
                            {awayTeam.team.logos?.[0] && (
                              <div 
                                className="w-10 h-10 rounded-lg p-1.5 flex items-center justify-center"
                                style={{ backgroundColor: `#${awayTeam.team.color}15` }}
                              >
                                <img 
                                  src={awayTeam.team.logos[0].href} 
                                  alt={awayTeam.team.displayName}
                                  className="w-full h-full object-contain"
                                />
                              </div>
                            )}
                            <div className="flex-1">
                              <p className="font-semibold text-foreground">
                                {awayTeam.team.displayName}
                              </p>
                              {awayTeam.records?.[0] && (
                                <p className="text-xs text-muted-foreground font-mono">
                                  {awayTeam.records[0].summary}
                                </p>
                              )}
                            </div>
                          </div>
                          <span className="text-2xl font-bold text-foreground tabular-nums min-w-[3rem] text-right">
                            {awayTeam.score || '-'}
                          </span>
                        </div>

                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3 flex-1">
                            {homeTeam.team.logos?.[0] && (
                              <div 
                                className="w-10 h-10 rounded-lg p-1.5 flex items-center justify-center"
                                style={{ backgroundColor: `#${homeTeam.team.color}15` }}
                              >
                                <img 
                                  src={homeTeam.team.logos[0].href} 
                                  alt={homeTeam.team.displayName}
                                  className="w-full h-full object-contain"
                                />
                              </div>
                            )}
                            <div className="flex-1">
                              <p className="font-semibold text-foreground">
                                {homeTeam.team.displayName}
                              </p>
                              {homeTeam.records?.[0] && (
                                <p className="text-xs text-muted-foreground font-mono">
                                  {homeTeam.records[0].summary}
                                </p>
                              )}
                            </div>
                          </div>
                          <span className="text-2xl font-bold text-foreground tabular-nums min-w-[3rem] text-right">
                            {homeTeam.score || '-'}
                          </span>
                        </div>
                      </div>

                      {competition.venue && (
                        <div className="flex items-center gap-2 text-xs text-muted-foreground pt-2 border-t border-border">
                          <MapPin size={14} />
                          <span>
                            {competition.venue.fullName} - {competition.venue.address.city}, {competition.venue.address.state}
                          </span>
                        </div>
                      )}

                      {competition.status.type.detail && (
                        <div className="text-xs text-center text-muted-foreground pt-2 border-t border-border font-medium">
                          {competition.status.type.detail}
                        </div>
                      )}
                    </div>
                  </Card>
                </motion.div>
              );
            })}
          </motion.div>
        </AnimatePresence>
      )}
    </div>
  );
}
