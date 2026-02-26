import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Play,
  VideoCamera,
  Lightning,
  Baseball,
  Target,
  Fire,
  TrendUp,
  Star,
  FilmStrip,
  SlidersHorizontal,
} from '@phosphor-icons/react';

export interface VideoClip {
  id: string;
  title: string;
  description: string;
  type: 'hit' | 'pitch' | 'defensive' | 'base-running' | 'highlight';
  category: 'home-run' | 'strikeout' | 'double' | 'triple' | 'stolen-base' | 'defensive-play' | 'game-winning' | 'season-best';
  date: string;
  opponent: string;
  thumbnailUrl: string;
  videoUrl: string;
  duration: number;
  stats?: {
    exitVelo?: number;
    launchAngle?: number;
    distance?: number;
    pitchVelo?: number;
    pitchType?: string;
  };
}

interface VideoHighlightsProps {
  playerName: string;
  playerPosition: string;
  clips: VideoClip[];
}

export function VideoHighlights({ playerName, playerPosition, clips }: VideoHighlightsProps) {
  const [selectedClip, setSelectedClip] = useState<VideoClip | null>(null);
  const [filterCategory, setFilterCategory] = useState<string>('all');

  const filteredClips = clips.filter(
    (clip) => filterCategory === 'all' || clip.category === filterCategory
  );

  const categoryIcons: Record<string, React.ElementType> = {
    'home-run': Fire,
    'strikeout': Lightning,
    'double': Baseball,
    'triple': TrendUp,
    'stolen-base': Target,
    'defensive-play': Star,
    'game-winning': Star,
    'season-best': Fire,
  };

  const categoryLabels: Record<string, string> = {
    'home-run': 'Home Runs',
    'strikeout': 'Strikeouts',
    'double': 'Doubles',
    'triple': 'Triples',
    'stolen-base': 'Stolen Bases',
    'defensive-play': 'Defensive Plays',
    'game-winning': 'Game Winners',
    'season-best': 'Season Best',
  };

  const groupedClips = clips.reduce((acc, clip) => {
    if (!acc[clip.category]) {
      acc[clip.category] = [];
    }
    acc[clip.category].push(clip);
    return acc;
  }, {} as Record<string, VideoClip[]>);

  const formatDuration = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <VideoCamera size={24} weight="bold" className="text-primary" />
            Video Highlights
          </CardTitle>
          <CardDescription>
            Watch {playerName}'s top plays and performances from the season
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="all" onValueChange={setFilterCategory} className="w-full">
            <div className="mb-4">
              <ScrollArea className="w-full">
                <TabsList className="inline-flex w-auto gap-1 bg-muted/50 p-1 rounded-lg">
                  <TabsTrigger value="all" className="gap-2 whitespace-nowrap">
                    <FilmStrip size={16} weight="bold" />
                    All Clips ({clips.length})
                  </TabsTrigger>
                  {Object.entries(groupedClips).map(([category, categoryClips]) => {
                    const Icon = categoryIcons[category] || Baseball;
                    return (
                      <TabsTrigger
                        key={category}
                        value={category}
                        className="gap-2 whitespace-nowrap"
                      >
                        <Icon size={16} weight="bold" />
                        {categoryLabels[category]} ({categoryClips.length})
                      </TabsTrigger>
                    );
                  })}
                </TabsList>
              </ScrollArea>
            </div>

            <TabsContent value={filterCategory} className="mt-0">
              {selectedClip ? (
                <div className="space-y-4">
                  <div className="relative aspect-video bg-black rounded-lg overflow-hidden border-2 border-primary/20">
                    <video
                      key={selectedClip.id}
                      controls
                      autoPlay
                      className="w-full h-full"
                      poster={selectedClip.thumbnailUrl}
                    >
                      <source src={selectedClip.videoUrl} type="video/mp4" />
                      Your browser does not support the video tag.
                    </video>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <h3 className="text-xl font-semibold mb-1">{selectedClip.title}</h3>
                        <p className="text-sm text-muted-foreground">{selectedClip.description}</p>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setSelectedClip(null)}
                      >
                        Close
                      </Button>
                    </div>

                    <div className="flex items-center gap-2 flex-wrap">
                      <Badge variant="secondary" className="gap-1.5">
                        <Baseball size={14} weight="bold" />
                        vs {selectedClip.opponent}
                      </Badge>
                      <Badge variant="outline">{selectedClip.date}</Badge>
                      <Badge variant="outline">{formatDuration(selectedClip.duration)}</Badge>
                      {selectedClip.stats && (
                        <>
                          {selectedClip.stats.exitVelo && (
                            <Badge className="gap-1.5 bg-warning/10 text-warning border-warning/30">
                              <Lightning size={14} weight="bold" />
                              {selectedClip.stats.exitVelo} mph
                            </Badge>
                          )}
                          {selectedClip.stats.distance && (
                            <Badge className="gap-1.5 bg-primary/10 text-primary border-primary/30">
                              <Target size={14} weight="bold" />
                              {selectedClip.stats.distance} ft
                            </Badge>
                          )}
                          {selectedClip.stats.pitchVelo && (
                            <Badge className="gap-1.5 bg-success/10 text-success border-success/30">
                              <Fire size={14} weight="bold" />
                              {selectedClip.stats.pitchVelo} mph {selectedClip.stats.pitchType}
                            </Badge>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredClips.length > 0 ? (
                    filteredClips.map((clip) => {
                      const CategoryIcon = categoryIcons[clip.category] || Baseball;
                      return (
                        <Card
                          key={clip.id}
                          className="group cursor-pointer hover:border-primary/50 hover:shadow-lg transition-all overflow-hidden"
                          onClick={() => setSelectedClip(clip)}
                        >
                          <div className="relative aspect-video bg-muted overflow-hidden">
                            <img
                              src={clip.thumbnailUrl}
                              alt={clip.title}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            />
                            <div className="absolute inset-0 bg-black/40 group-hover:bg-black/60 transition-colors flex items-center justify-center">
                              <div className="bg-primary/90 rounded-full p-4 group-hover:scale-110 transition-transform">
                                <Play size={32} weight="fill" className="text-white" />
                              </div>
                            </div>
                            <div className="absolute top-2 right-2">
                              <Badge className="bg-black/70 text-white border-none">
                                {formatDuration(clip.duration)}
                              </Badge>
                            </div>
                            <div className="absolute bottom-2 left-2">
                              <Badge
                                variant="secondary"
                                className="gap-1.5 bg-primary/90 text-primary-foreground border-none"
                              >
                                <CategoryIcon size={14} weight="bold" />
                                {categoryLabels[clip.category]}
                              </Badge>
                            </div>
                          </div>
                          <CardContent className="p-3">
                            <h3 className="font-semibold text-sm mb-1 line-clamp-1">
                              {clip.title}
                            </h3>
                            <p className="text-xs text-muted-foreground mb-2 line-clamp-2">
                              {clip.description}
                            </p>
                            <div className="flex items-center justify-between text-xs">
                              <span className="text-muted-foreground">vs {clip.opponent}</span>
                              <span className="text-muted-foreground">{clip.date}</span>
                            </div>
                            {clip.stats && (
                              <div className="flex items-center gap-2 mt-2 pt-2 border-t">
                                {clip.stats.exitVelo && (
                                  <div className="text-xs font-mono">
                                    <span className="text-muted-foreground">EV: </span>
                                    <span className="font-semibold text-warning">
                                      {clip.stats.exitVelo}
                                    </span>
                                  </div>
                                )}
                                {clip.stats.distance && (
                                  <div className="text-xs font-mono">
                                    <span className="text-muted-foreground">Dist: </span>
                                    <span className="font-semibold text-primary">
                                      {clip.stats.distance}ft
                                    </span>
                                  </div>
                                )}
                                {clip.stats.pitchVelo && (
                                  <div className="text-xs font-mono">
                                    <span className="text-muted-foreground">Velo: </span>
                                    <span className="font-semibold text-success">
                                      {clip.stats.pitchVelo}
                                    </span>
                                  </div>
                                )}
                              </div>
                            )}
                          </CardContent>
                        </Card>
                      );
                    })
                  ) : (
                    <div className="col-span-full text-center py-12">
                      <VideoCamera size={48} className="mx-auto text-muted-foreground/50 mb-3" />
                      <p className="text-muted-foreground">No video clips available</p>
                    </div>
                  )}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {!selectedClip && clips.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <SlidersHorizontal size={20} className="text-primary" />
              Quick Stats
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <div className="text-xs text-muted-foreground mb-1">Total Clips</div>
                <div className="text-2xl font-mono font-bold">{clips.length}</div>
              </div>
              {clips.some((c) => c.stats?.exitVelo) && (
                <div>
                  <div className="text-xs text-muted-foreground mb-1">Max Exit Velo</div>
                  <div className="text-2xl font-mono font-bold text-warning">
                    {Math.max(...clips.filter((c) => c.stats?.exitVelo).map((c) => c.stats!.exitVelo!))}
                    <span className="text-sm text-muted-foreground ml-1">mph</span>
                  </div>
                </div>
              )}
              {clips.some((c) => c.stats?.distance) && (
                <div>
                  <div className="text-xs text-muted-foreground mb-1">Longest HR</div>
                  <div className="text-2xl font-mono font-bold text-primary">
                    {Math.max(...clips.filter((c) => c.stats?.distance).map((c) => c.stats!.distance!))}
                    <span className="text-sm text-muted-foreground ml-1">ft</span>
                  </div>
                </div>
              )}
              {clips.some((c) => c.stats?.pitchVelo) && (
                <div>
                  <div className="text-xs text-muted-foreground mb-1">Max Pitch Velo</div>
                  <div className="text-2xl font-mono font-bold text-success">
                    {Math.max(...clips.filter((c) => c.stats?.pitchVelo).map((c) => c.stats!.pitchVelo!))}
                    <span className="text-sm text-muted-foreground ml-1">mph</span>
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
