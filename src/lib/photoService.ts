export interface TeamLogo {
  primary: string;
  alt?: string;
  name: string;
}

export interface PlayerPhoto {
  headshot: string;
  action?: string;
  fallback: string;
}

const ESPN_CDN = 'https://a.espncdn.com';

const TEAM_LOGOS: Record<string, TeamLogo> = {
  'Texas': {
    primary: `${ESPN_CDN}/i/teamlogos/ncaa/500/251.png`,
    alt: `${ESPN_CDN}/i/teamlogos/ncaa/500-dark/251.png`,
    name: 'Texas Longhorns'
  },
  'Tennessee': {
    primary: `${ESPN_CDN}/i/teamlogos/ncaa/500/2633.png`,
    alt: `${ESPN_CDN}/i/teamlogos/ncaa/500-dark/2633.png`,
    name: 'Tennessee Volunteers'
  },
  'LSU': {
    primary: `${ESPN_CDN}/i/teamlogos/ncaa/500/99.png`,
    alt: `${ESPN_CDN}/i/teamlogos/ncaa/500-dark/99.png`,
    name: 'LSU Tigers'
  },
  'Florida': {
    primary: `${ESPN_CDN}/i/teamlogos/ncaa/500/57.png`,
    alt: `${ESPN_CDN}/i/teamlogos/ncaa/500-dark/57.png`,
    name: 'Florida Gators'
  },
  'Vanderbilt': {
    primary: `${ESPN_CDN}/i/teamlogos/ncaa/500/238.png`,
    alt: `${ESPN_CDN}/i/teamlogos/ncaa/500-dark/238.png`,
    name: 'Vanderbilt Commodores'
  },
  'Arkansas': {
    primary: `${ESPN_CDN}/i/teamlogos/ncaa/500/8.png`,
    alt: `${ESPN_CDN}/i/teamlogos/ncaa/500-dark/8.png`,
    name: 'Arkansas Razorbacks'
  },
  'Kentucky': {
    primary: `${ESPN_CDN}/i/teamlogos/ncaa/500/96.png`,
    alt: `${ESPN_CDN}/i/teamlogos/ncaa/500-dark/96.png`,
    name: 'Kentucky Wildcats'
  },
  'Ole Miss': {
    primary: `${ESPN_CDN}/i/teamlogos/ncaa/500/145.png`,
    alt: `${ESPN_CDN}/i/teamlogos/ncaa/500-dark/145.png`,
    name: 'Ole Miss Rebels'
  },
  'Mississippi State': {
    primary: `${ESPN_CDN}/i/teamlogos/ncaa/500/344.png`,
    alt: `${ESPN_CDN}/i/teamlogos/ncaa/500-dark/344.png`,
    name: 'Mississippi State Bulldogs'
  },
  'Alabama': {
    primary: `${ESPN_CDN}/i/teamlogos/ncaa/500/333.png`,
    alt: `${ESPN_CDN}/i/teamlogos/ncaa/500-dark/333.png`,
    name: 'Alabama Crimson Tide'
  },
  'Auburn': {
    primary: `${ESPN_CDN}/i/teamlogos/ncaa/500/2.png`,
    alt: `${ESPN_CDN}/i/teamlogos/ncaa/500-dark/2.png`,
    name: 'Auburn Tigers'
  },
  'Georgia': {
    primary: `${ESPN_CDN}/i/teamlogos/ncaa/500/61.png`,
    alt: `${ESPN_CDN}/i/teamlogos/ncaa/500-dark/61.png`,
    name: 'Georgia Bulldogs'
  },
  'South Carolina': {
    primary: `${ESPN_CDN}/i/teamlogos/ncaa/500/2579.png`,
    alt: `${ESPN_CDN}/i/teamlogos/ncaa/500-dark/2579.png`,
    name: 'South Carolina Gamecocks'
  },
  'Missouri': {
    primary: `${ESPN_CDN}/i/teamlogos/ncaa/500/142.png`,
    alt: `${ESPN_CDN}/i/teamlogos/ncaa/500-dark/142.png`,
    name: 'Missouri Tigers'
  },
  'Texas A&M': {
    primary: `${ESPN_CDN}/i/teamlogos/ncaa/500/245.png`,
    alt: `${ESPN_CDN}/i/teamlogos/ncaa/500-dark/245.png`,
    name: 'Texas A&M Aggies'
  },
  'Oklahoma': {
    primary: `${ESPN_CDN}/i/teamlogos/ncaa/500/201.png`,
    alt: `${ESPN_CDN}/i/teamlogos/ncaa/500-dark/201.png`,
    name: 'Oklahoma Sooners'
  },
};

export function getTeamLogo(teamName: string, useDark = false): TeamLogo {
  const normalizedName = Object.keys(TEAM_LOGOS).find(
    key => key.toLowerCase() === teamName.toLowerCase()
  );
  
  if (normalizedName && TEAM_LOGOS[normalizedName]) {
    const logo = TEAM_LOGOS[normalizedName];
    return {
      ...logo,
      primary: useDark && logo.alt ? logo.alt : logo.primary
    };
  }
  
  return {
    primary: `https://via.placeholder.com/100x100/1a1a1a/ff6b35?text=${encodeURIComponent(teamName.substring(0, 3))}`,
    name: teamName,
  };
}

export function getPlayerPhoto(playerId: string, playerName: string, team?: string): PlayerPhoto {
  const nameParts = playerName.split(' ');
  const initials = nameParts.map(n => n[0]).join('').toUpperCase().substring(0, 2);
  
  const fallback = `https://ui-avatars.com/api/?name=${encodeURIComponent(playerName)}&background=1a1a1a&color=ff6b35&bold=true&size=200`;
  
  if (playerId && playerId.match(/^\d+$/)) {
    return {
      headshot: `${ESPN_CDN}/i/headshots/college-baseball/players/full/${playerId}.png`,
      action: `${ESPN_CDN}/i/headshots/college-baseball/players/action/${playerId}.jpg`,
      fallback
    };
  }
  
  return {
    headshot: fallback,
    fallback
  };
}

export function getConferenceLogo(conference: string): string {
  const conferenceLogos: Record<string, string> = {
    'SEC': `${ESPN_CDN}/i/teamlogos/leagues/500/sec.png`,
    'ACC': `${ESPN_CDN}/i/teamlogos/leagues/500/acc.png`,
    'Big 12': `${ESPN_CDN}/i/teamlogos/leagues/500/big12.png`,
    'Big Ten': `${ESPN_CDN}/i/teamlogos/leagues/500/bigten.png`,
    'Pac-12': `${ESPN_CDN}/i/teamlogos/leagues/500/pac12.png`,
  };
  
  return conferenceLogos[conference] || `https://via.placeholder.com/80x80/1a1a1a/ff6b35?text=${encodeURIComponent(conference)}`;
}

export function preloadImage(src: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve();
    img.onerror = () => reject();
    img.src = src;
  });
}

export function getImageWithFallback(primarySrc: string, fallbackSrc: string): Promise<string> {
  return preloadImage(primarySrc)
    .then(() => primarySrc)
    .catch(() => fallbackSrc);
}
