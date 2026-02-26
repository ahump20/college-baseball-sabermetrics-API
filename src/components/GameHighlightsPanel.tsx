import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useGameHighlights, VideoHighlight } from '@/hooks/use-game-highlights';
import {
  Play,
  VideoCamera,
  Lightning,
  Baseball,
  Trophy,
  ShieldChevron,
  FilmStrip,
  ArrowClockwise,
  XCircle,
} from '@phosphor-icons/react';
import { motion, AnimatePresence } from 'framer-motion';

interface GameHighlightsPanelProps {
  gameId: string | null;
  completed?: boolean;
  compact?: boolean;
}

export function GameHighlightsPanel({ gameId, completed = false, compact = false }: GameHighlightsPanelProps) {
  const { highlightsData, isLoading, error, refetch } = useGameHighlights(gameId, completed);
  const [selectedHighlight, setSelectedHighlight] = useState<VideoHighlight | null>(null);
  const [filterCategory, setFilterCategory] = useState<string>('all');

  if (!gameId) {
    return (
      <Card className="p-8">
        <div className="text-center text-muted-foreground">
          <VideoCamera size={48} className="mx-auto mb-3 opacity-50" />
          <p>Select a game to view highlights</p>
        </div>
      </Card>
    );
  }

  if (isLoading) {
    return (
      <Card className="p-6">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-8 w-24" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="aspect-video w-full" />
            ))}
          </div>
        </div>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="p-8">
        <div className="text-center">
          <XCircle size={48} className="mx-auto mb-3 text-destructive" />
          <p className="text-muted-foreground mb-4">{error}</p>
          <Button onClick={() => refetch()} variant="outline" className="gap-2">
            <ArrowClockwise size={16} />
            Try Again
          </Button>
        </div>
      </Card>
    );
  }

  if (!highlightsData || !highlightsData.hasHighlights) {
    return (
      <Card className="p-8">
        <div className="text-center">
          <VideoCamera size={48} className="mx-auto mb-3 text-muted-foreground opacity-50" />
          <p className="text-muted-foreground mb-2">No highlights available yet</p>
          <p className="text-xs text-muted-foreground mb-4">
            {completed ? 'Highlights may become available after the game' : 'Highlights will appear as the game progresses'}
          </p>
          <Button onClick={() => refetch()} variant="outline" size="sm" className="gap-2">
            <ArrowClockwise size={14} />
            Refresh
          </Button>
        </div>
      </Card>
    );
  }

  const highlights = highlightsData.highlights;
  const filteredHighlights = filterCategory === 'all' 
    ? highlights 
    : highlights.filter(h => h.category === filterCategory);

  const categoryIcons: Record<string, React.ElementType> = {
    'scoring': Trophy,
    'defensive': ShieldChevron,
    'pitching': Lightning,
    'highlight': FilmStrip,
  };

  const categoryLabels: Record<string, string> = {
    'scoring': 'Scoring Plays',
    'defensive': 'Defense',
    'pitching': 'Pitching',
    'highlight': 'Highlights',
  };

  const groupedHighlights = highlights.reduce((acc, highlight) => {
    if (!acc[highlight.category]) {
      acc[highlight.category] = [];
    }
    acc[highlight.category].push(highlight);
    return acc;
  }, {} as Record<string, VideoHighlight[]>);

  const formatDuration = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getBadgeColor = (type: string) => {
    switch (type) {
      case 'espn':
        return 'bg-red-500/10 text-red-500 border-red-500/30';
      case 'highlightly':
        return 'bg-blue-500/10 text-blue-500 border-blue-500/30';
      case 'youtube':
        return 'bg-primary/10 text-primary border-primary/30';
      default:
        return '';
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <VideoCamera size={24} weight="bold" className="text-primary" />
          <h3 className="text-lg font-semibold">Game Highlights</h3>
          <Badge variant="secondary" className="font-mono">
            {highlights.length} {highlights.length === 1 ? 'clip' : 'clips'}
          </Badge>
        </div>
        <Button onClick={() => refetch()} variant="outline" size="sm" className="gap-2">
          <ArrowClockwise size={14} />
          Refresh
        </Button>
      </div>

      <Tabs defaultValue="all" onValueChange={setFilterCategory} className="w-full">
        <ScrollArea className="w-full">
          <TabsList className="inline-flex w-auto gap-1 bg-muted/50 p-1 rounded-lg mb-4">
            <TabsTrigger value="all" className="gap-2 whitespace-nowrap">
              <FilmStrip size={16} weight="bold" />
              All ({highlights.length})
            </TabsTrigger>
            {Object.entries(groupedHighlights).map(([category, categoryHighlights]) => {
              const Icon = categoryIcons[category] || Baseball;
              return (
                <TabsTrigger
                  key={category}
                  value={category}
                  className="gap-2 whitespace-nowrap"
                >
                  <Icon size={16} weight="bold" />
                  {categoryLabels[category]} ({categoryHighlights.length})
                </TabsTrigger>
              );
            })}
          </TabsList>
        </ScrollArea>

        <TabsContent value={filterCategory} className="mt-0">
          {selectedHighlight ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-4"
            >
              <Card className="overflow-hidden border-2 border-primary/20">
                <div className="relative aspect-video bg-black">
                  <video
                    key={selectedHighlight.id}
                    controls
                    autoPlay
                    className="w-full h-full"
                    poster={selectedHighlight.thumbnailUrl}
                  >
                    <source src={selectedHighlight.videoUrl} type="video/mp4" />
                    Your browser does not support the video tag.
                  </video>
                </div>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-4 mb-3">
                    <div className="flex-1">
                      <h4 className="text-lg font-semibold mb-1">{selectedHighlight.title}</h4>
                      {selectedHighlight.description && (
                        <p className="text-sm text-muted-foreground">{selectedHighlight.description}</p>
                      )}
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setSelectedHighlight(null)}
                    >
                      <XCircle size={20} />
                    </Button>
                  </div>

                  <div className="flex items-center gap-2 flex-wrap">
                    <Badge className={getBadgeColor(selectedHighlight.type)}>
                      {selectedHighlight.type.toUpperCase()}
                    </Badge>
                    {selectedHighlight.duration > 0 && (
                      <Badge variant="outline">{formatDuration(selectedHighlight.duration)}</Badge>
                    )}
                    {selectedHighlight.inning && (
                      <Badge variant="outline">
                        <Baseball size={12} weight="bold" className="mr-1" />
                        Inning {selectedHighlight.inning}
                      </Badge>
                    )}
                    {selectedHighlight.score && (
                      <Badge variant="secondary" className="font-mono">
                        {selectedHighlight.score.away} - {selectedHighlight.score.home}
                      </Badge>
                    )}
                  </div>
                </CardContent>
              </Card>

              <Button
                variant="outline"
                size="sm"
                onClick={() => setSelectedHighlight(null)}
                className="w-full"
              >
                Back to All Highlights
              </Button>
            </motion.div>
          ) : (
            <AnimatePresence mode="wait">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className={`grid gap-4 ${
                  compact 
                    ? 'grid-cols-1 sm:grid-cols-2' 
                    : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3'
                }`}
              >
                {filteredHighlights.length > 0 ? (
                  filteredHighlights.map((highlight) => {
                    const CategoryIcon = categoryIcons[highlight.category] || Baseball;
                    return (
                      <motion.div
                        key={highlight.id}
                        layout
                        initial={{ scale: 0.95, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.95, opacity: 0 }}
                      >
                        <Card
                          className="group cursor-pointer hover:border-primary/50 hover:shadow-lg transition-all overflow-hidden"
                          onClick={() => setSelectedHighlight(highlight)}
                        >
                          <div className="relative aspect-video bg-muted overflow-hidden">
                            {highlight.thumbnailUrl ? (
                              <img
                                src={highlight.thumbnailUrl}
                                alt={highlight.title}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-muted to-muted/50">
                                <VideoCamera size={48} className="text-muted-foreground/30" />
                              </div>
                            )}
                            <div className="absolute inset-0 bg-black/40 group-hover:bg-black/60 transition-colors flex items-center justify-center">
                              <div className="bg-primary/90 rounded-full p-3 group-hover:scale-110 transition-transform">
                                <Play size={24} weight="fill" className="text-white" />
                              </div>
                            </div>
                            <div className="absolute top-2 right-2 flex gap-2">
                              <Badge className={`${getBadgeColor(highlight.type)} text-xs`}>
                                {highlight.type === 'espn' ? 'ESPN' : highlight.type === 'highlightly' ? 'HL' : 'YT'}
                              </Badge>
                              {highlight.duration > 0 && (
                                <Badge className="bg-black/70 text-white border-none text-xs">
                                  {formatDuration(highlight.duration)}
                                </Badge>
                              )}
                            </div>
                            <div className="absolute bottom-2 left-2">
                              <Badge
                                variant="secondary"
                                className="gap-1.5 bg-primary/90 text-primary-foreground border-none"
                              >
                                <CategoryIcon size={12} weight="bold" />
                                {categoryLabels[highlight.category]}
                              </Badge>
                            </div>
                          </div>
                          <CardContent className="p-3">
                            <h4 className="font-semibold text-sm mb-1 line-clamp-2">
                              {highlight.title}
                            </h4>
                            {highlight.description && (
                              <p className="text-xs text-muted-foreground line-clamp-2 mb-2">
                                {highlight.description}
                              </p>
                            )}
                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                              {highlight.inning && (
                                <span className="flex items-center gap-1">
                                  <Baseball size={12} />
                                  Inning {highlight.inning}
                                </span>
                              )}
                              {highlight.score && (
                                <span className="font-mono">
                                  {highlight.score.away}-{highlight.score.home}
                                </span>
                              )}
                            </div>
                          </CardContent>
                        </Card>
                      </motion.div>
                    );
                  })
                ) : (
                  <div className="col-span-full text-center py-12">
                    <VideoCamera size={48} className="mx-auto text-muted-foreground/50 mb-3" />
                    <p className="text-muted-foreground">No highlights in this category</p>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
