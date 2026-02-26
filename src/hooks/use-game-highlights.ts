import { useState, useEffect } from 'react';
import { useKV } from '@github/spark/hooks';

export interface VideoHighlight {
  id: string;
  title: string;
  description: string;
  thumbnailUrl: string;
  videoUrl: string;
  duration: number;
  timestamp?: string;
  type: 'espn' | 'highlightly' | 'youtube';
  category: 'scoring' | 'defensive' | 'pitching' | 'highlight';
  playType?: string;
  inning?: number;
  score?: {
    away: number;
    home: number;
  };
}

export interface GameHighlights {
  gameId: string;
  hasHighlights: boolean;
  highlights: VideoHighlight[];
  recapUrl?: string;
  condensedGameUrl?: string;
}

const HIGHLIGHTLY_API_KEY = '0dd6501d-bd0f-4c6c-b653-084cafa3a995';
const HIGHLIGHTLY_BASE_URL = 'https://api.highlightly.net';

async function fetchESPNHighlights(gameId: string): Promise<VideoHighlight[]> {
  try {
    const summaryUrl = `https://site.api.espn.com/apis/site/v2/sports/baseball/college-baseball/summary?event=${gameId}`;
    const response = await fetch(summaryUrl);
    
    if (!response.ok) {
      return [];
    }

    const data = await response.json();
    const highlights: VideoHighlight[] = [];

    if (data.videos && Array.isArray(data.videos)) {
      data.videos.forEach((video: any, index: number) => {
        if (video.links?.source?.href) {
          highlights.push({
            id: `espn-${gameId}-${index}`,
            title: video.headline || video.title || 'Game Highlight',
            description: video.description || '',
            thumbnailUrl: video.thumbnail || video.images?.[0]?.url || '',
            videoUrl: video.links.source.href,
            duration: video.duration || 0,
            timestamp: video.timeRestrictions?.embargoDate,
            type: 'espn',
            category: determineCategory(video.headline || video.title || ''),
            playType: video.type,
          });
        }
      });
    }

    if (data.header?.video) {
      const headerVideo = data.header.video;
      if (headerVideo.links?.source?.href) {
        highlights.unshift({
          id: `espn-${gameId}-header`,
          title: headerVideo.headline || 'Game Recap',
          description: headerVideo.description || 'Watch the full game recap',
          thumbnailUrl: headerVideo.thumbnail || '',
          videoUrl: headerVideo.links.source.href,
          duration: headerVideo.duration || 0,
          type: 'espn',
          category: 'highlight',
        });
      }
    }

    return highlights;
  } catch (error) {
    console.error('Error fetching ESPN highlights:', error);
    return [];
  }
}

async function fetchHighlightlyHighlights(gameId: string): Promise<VideoHighlight[]> {
  try {
    const response = await fetch(`${HIGHLIGHTLY_BASE_URL}/v1/games/${gameId}/highlights`, {
      headers: {
        'Authorization': `Bearer ${HIGHLIGHTLY_API_KEY}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      return [];
    }

    const data = await response.json();
    const highlights: VideoHighlight[] = [];

    if (data.highlights && Array.isArray(data.highlights)) {
      data.highlights.forEach((highlight: any, index: number) => {
        highlights.push({
          id: `highlightly-${gameId}-${index}`,
          title: highlight.title || highlight.play_description || 'Play Highlight',
          description: highlight.description || highlight.play_description || '',
          thumbnailUrl: highlight.thumbnail_url || highlight.image_url || '',
          videoUrl: highlight.video_url || highlight.url || '',
          duration: highlight.duration || 0,
          timestamp: highlight.timestamp || highlight.time,
          type: 'highlightly',
          category: highlight.category || 'highlight',
          playType: highlight.play_type,
          inning: highlight.inning,
          score: highlight.score ? {
            away: highlight.score.away,
            home: highlight.score.home,
          } : undefined,
        });
      });
    }

    return highlights;
  } catch (error) {
    console.error('Error fetching Highlightly highlights:', error);
    return [];
  }
}

function determineCategory(text: string): 'scoring' | 'defensive' | 'pitching' | 'highlight' {
  const lower = text.toLowerCase();
  
  if (lower.includes('home run') || lower.includes('rbi') || lower.includes('score') || lower.includes('run')) {
    return 'scoring';
  }
  
  if (lower.includes('catch') || lower.includes('out') || lower.includes('throw') || lower.includes('defense')) {
    return 'defensive';
  }
  
  if (lower.includes('strikeout') || lower.includes('pitch') || lower.includes('k\'s') || lower.includes('inning')) {
    return 'pitching';
  }
  
  return 'highlight';
}

export function useGameHighlights(gameId: string | null, completed: boolean = false) {
  const cacheKey = gameId ? `game-highlights-${gameId}` : 'no-game';
  const [highlightsData, setHighlightsData] = useKV<GameHighlights | null>(cacheKey, null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useKV<number>(`${cacheKey}-last-updated`, 0);

  const fetchHighlights = async () => {
    if (!gameId) {
      setHighlightsData(null);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const [espnHighlights, highlightlyHighlights] = await Promise.allSettled([
        fetchESPNHighlights(gameId),
        fetchHighlightlyHighlights(gameId),
      ]);

      const allHighlights: VideoHighlight[] = [];

      if (espnHighlights.status === 'fulfilled') {
        allHighlights.push(...espnHighlights.value);
      }

      if (highlightlyHighlights.status === 'fulfilled') {
        allHighlights.push(...highlightlyHighlights.value);
      }

      allHighlights.sort((a, b) => {
        if (a.category === 'highlight' && b.category !== 'highlight') return -1;
        if (a.category !== 'highlight' && b.category === 'highlight') return 1;
        if (a.inning && b.inning) return a.inning - b.inning;
        return 0;
      });

      const gameHighlights: GameHighlights = {
        gameId,
        hasHighlights: allHighlights.length > 0,
        highlights: allHighlights,
      };

      setHighlightsData(gameHighlights);
      setLastUpdated(Date.now());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch highlights');
      setHighlightsData({
        gameId,
        hasHighlights: false,
        highlights: [],
      });
    } finally {
      setIsLoading(false);
    }
  };

  const shouldRefresh = () => {
    if (!completed) {
      const FIVE_MINUTES = 5 * 60 * 1000;
      return !lastUpdated || Date.now() - lastUpdated > FIVE_MINUTES;
    }
    const ONE_HOUR = 60 * 60 * 1000;
    return !lastUpdated || Date.now() - lastUpdated > ONE_HOUR;
  };

  useEffect(() => {
    if (gameId && shouldRefresh()) {
      fetchHighlights();
    }
  }, [gameId, completed]);

  return {
    highlightsData,
    isLoading,
    error,
    lastUpdated,
    refetch: fetchHighlights,
  };
}
