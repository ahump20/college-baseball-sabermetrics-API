import type { VideoClip } from '@/components/VideoHighlights';
import type { Player } from './playerData';

const opponents = [
  'Alabama', 'Auburn', 'LSU', 'Arkansas', 'Ole Miss', 'Mississippi State',
  'Florida', 'Georgia', 'Tennessee', 'Vanderbilt', 'Kentucky', 'South Carolina',
  'Texas A&M', 'Missouri', 'Oklahoma', 'TCU', 'Baylor', 'Texas Tech'
];

const months = ['Feb', 'Mar', 'Apr', 'May'];

export function generatePlayerVideoClips(player: Player): VideoClip[] {
  const clips: VideoClip[] = [];
  const isPitcher = !!player.stats.pitching;
  
  if (!isPitcher && player.stats.batting) {
    const hrCount = Math.min(player.stats.batting.hr, 8);
    for (let i = 0; i < hrCount; i++) {
      const distance = Math.floor(380 + Math.random() * 70);
      const exitVelo = Math.floor(95 + Math.random() * 15);
      const launchAngle = Math.floor(20 + Math.random() * 15);
      const opponent = opponents[Math.floor(Math.random() * opponents.length)];
      const month = months[Math.floor(Math.random() * months.length)];
      const day = Math.floor(1 + Math.random() * 28);
      
      clips.push({
        id: `hr-${player.id}-${i}`,
        title: `${distance}ft Home Run`,
        description: `Monster shot to ${distance >= 420 ? 'deep' : ''} ${exitVelo >= 105 ? 'left-center' : 'right-center'} field`,
        type: 'hit',
        category: 'home-run',
        date: `${month} ${day}`,
        opponent,
        thumbnailUrl: `https://placehold.co/640x360/1a1a1a/ff6b35/png?text=HR+${distance}ft`,
        videoUrl: `https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4`,
        duration: Math.floor(8 + Math.random() * 7),
        stats: {
          exitVelo,
          launchAngle,
          distance,
        },
      });
    }
    
    const doubleCount = Math.floor(player.stats.batting.hr * 0.4);
    for (let i = 0; i < Math.min(doubleCount, 4); i++) {
      const exitVelo = Math.floor(88 + Math.random() * 12);
      const opponent = opponents[Math.floor(Math.random() * opponents.length)];
      const month = months[Math.floor(Math.random() * months.length)];
      const day = Math.floor(1 + Math.random() * 28);
      
      clips.push({
        id: `2b-${player.id}-${i}`,
        title: 'RBI Double in the Gap',
        description: `Line drive to the gap, plates ${Math.floor(1 + Math.random() * 2)} run${Math.floor(1 + Math.random() * 2) > 1 ? 's' : ''}`,
        type: 'hit',
        category: 'double',
        date: `${month} ${day}`,
        opponent,
        thumbnailUrl: `https://placehold.co/640x360/1a1a1a/ffd700/png?text=Double+${exitVelo}mph`,
        videoUrl: `https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4`,
        duration: Math.floor(10 + Math.random() * 8),
        stats: {
          exitVelo,
          launchAngle: Math.floor(8 + Math.random() * 12),
        },
      });
    }
    
    if (player.stats.batting.sb >= 10) {
      const sbCount = Math.floor(player.stats.batting.sb * 0.3);
      for (let i = 0; i < Math.min(sbCount, 3); i++) {
        const opponent = opponents[Math.floor(Math.random() * opponents.length)];
        const month = months[Math.floor(Math.random() * months.length)];
        const day = Math.floor(1 + Math.random() * 28);
        
        clips.push({
          id: `sb-${player.id}-${i}`,
          title: 'Stolen Base',
          description: `Gets a good jump and beats the throw to ${i % 2 === 0 ? 'second' : 'third'} base`,
          type: 'base-running',
          category: 'stolen-base',
          date: `${month} ${day}`,
          opponent,
          thumbnailUrl: `https://placehold.co/640x360/1a1a1a/62c18f/png?text=SB`,
          videoUrl: `https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4`,
          duration: Math.floor(6 + Math.random() * 4),
        });
      }
    }
    
    if (player.advancedStats.batting?.war && player.advancedStats.batting.war >= 2.5) {
      const opponent = opponents[Math.floor(Math.random() * opponents.length)];
      const month = months[Math.floor(Math.random() * months.length)];
      const day = Math.floor(1 + Math.random() * 28);
      
      clips.push({
        id: `gw-${player.id}`,
        title: 'Game-Winning Hit',
        description: `Walk-off single in the bottom of the 9th to secure the win`,
        type: 'hit',
        category: 'game-winning',
        date: `${month} ${day}`,
        opponent,
        thumbnailUrl: `https://placehold.co/640x360/1a1a1a/ff6b35/png?text=Walk-Off`,
        videoUrl: `https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4`,
        duration: Math.floor(15 + Math.random() * 10),
        stats: {
          exitVelo: Math.floor(85 + Math.random() * 15),
        },
      });
    }
    
  } else if (isPitcher && player.stats.pitching) {
    const kCount = Math.min(Math.floor(player.stats.pitching.so / 15), 6);
    for (let i = 0; i < kCount; i++) {
      const velo = Math.floor(88 + Math.random() * 10);
      const pitchTypes = ['Fastball', 'Slider', 'Curveball', 'Changeup'];
      const pitchType = pitchTypes[Math.floor(Math.random() * pitchTypes.length)];
      const opponent = opponents[Math.floor(Math.random() * opponents.length)];
      const month = months[Math.floor(Math.random() * months.length)];
      const day = Math.floor(1 + Math.random() * 28);
      
      clips.push({
        id: `k-${player.id}-${i}`,
        title: `Strikeout on ${pitchType}`,
        description: `Nasty ${pitchType.toLowerCase()} catches the corner for strike three`,
        type: 'pitch',
        category: 'strikeout',
        date: `${month} ${day}`,
        opponent,
        thumbnailUrl: `https://placehold.co/640x360/1a1a1a/62c18f/png?text=K+${velo}mph`,
        videoUrl: `https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4`,
        duration: Math.floor(6 + Math.random() * 4),
        stats: {
          pitchVelo: velo,
          pitchType,
        },
      });
    }
    
    if (player.stats.pitching.era <= 3.00) {
      const opponent = opponents[Math.floor(Math.random() * opponents.length)];
      const month = months[Math.floor(Math.random() * months.length)];
      const day = Math.floor(1 + Math.random() * 28);
      
      clips.push({
        id: `cgso-${player.id}`,
        title: 'Complete Game Shutout',
        description: `Dominant performance: 9 IP, 0 R, ${Math.floor(8 + Math.random() * 6)} K`,
        type: 'pitch',
        category: 'season-best',
        date: `${month} ${day}`,
        opponent,
        thumbnailUrl: `https://placehold.co/640x360/1a1a1a/ff6b35/png?text=CGSO`,
        videoUrl: `https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerMeltdowns.mp4`,
        duration: Math.floor(120 + Math.random() * 60),
        stats: {
          pitchVelo: Math.floor(90 + Math.random() * 8),
          pitchType: 'Fastball',
        },
      });
    }
  }
  
  clips.sort((a, b) => {
    const dateA = new Date(`2025 ${a.date}`);
    const dateB = new Date(`2025 ${b.date}`);
    return dateB.getTime() - dateA.getTime();
  });
  
  return clips;
}
