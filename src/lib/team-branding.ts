export interface TeamBranding {
  id: string;
  name: string;
  shortName: string;
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  logoUrl?: string;
  conference: string;
  division: string;
}

export const TEAM_BRANDING: Record<string, TeamBranding> = {
  'texas': {
    id: 'texas',
    name: 'Texas Longhorns',
    shortName: 'Texas',
    primaryColor: 'oklch(0.45 0.15 30)',
    secondaryColor: 'oklch(0.98 0.01 60)',
    accentColor: 'oklch(0.45 0.15 30)',
    conference: 'SEC',
    division: 'D1'
  },
  'tennessee': {
    id: 'tennessee',
    name: 'Tennessee Volunteers',
    shortName: 'Tennessee',
    primaryColor: 'oklch(0.62 0.20 25)',
    secondaryColor: 'oklch(0.98 0.01 60)',
    accentColor: 'oklch(0.62 0.20 25)',
    conference: 'SEC',
    division: 'D1'
  },
  'florida': {
    id: 'florida',
    name: 'Florida Gators',
    shortName: 'Florida',
    primaryColor: 'oklch(0.50 0.18 250)',
    secondaryColor: 'oklch(0.65 0.20 30)',
    accentColor: 'oklch(0.50 0.18 250)',
    conference: 'SEC',
    division: 'D1'
  },
  'lsu': {
    id: 'lsu',
    name: 'LSU Tigers',
    shortName: 'LSU',
    primaryColor: 'oklch(0.50 0.18 280)',
    secondaryColor: 'oklch(0.78 0.18 85)',
    accentColor: 'oklch(0.78 0.18 85)',
    conference: 'SEC',
    division: 'D1'
  },
  'arkansas': {
    id: 'arkansas',
    name: 'Arkansas Razorbacks',
    shortName: 'Arkansas',
    primaryColor: 'oklch(0.48 0.22 20)',
    secondaryColor: 'oklch(0.98 0.01 60)',
    accentColor: 'oklch(0.48 0.22 20)',
    conference: 'SEC',
    division: 'D1'
  },
  'vanderbilt': {
    id: 'vanderbilt',
    name: 'Vanderbilt Commodores',
    shortName: 'Vanderbilt',
    primaryColor: 'oklch(0.25 0.05 50)',
    secondaryColor: 'oklch(0.78 0.18 70)',
    accentColor: 'oklch(0.78 0.18 70)',
    conference: 'SEC',
    division: 'D1'
  },
  'ole-miss': {
    id: 'ole-miss',
    name: 'Ole Miss Rebels',
    shortName: 'Ole Miss',
    primaryColor: 'oklch(0.40 0.18 15)',
    secondaryColor: 'oklch(0.55 0.12 240)',
    accentColor: 'oklch(0.55 0.12 240)',
    conference: 'SEC',
    division: 'D1'
  },
  'mississippi-state': {
    id: 'mississippi-state',
    name: 'Mississippi State Bulldogs',
    shortName: 'Miss State',
    primaryColor: 'oklch(0.35 0.08 30)',
    secondaryColor: 'oklch(0.98 0.01 60)',
    accentColor: 'oklch(0.35 0.08 30)',
    conference: 'SEC',
    division: 'D1'
  },
  'georgia': {
    id: 'georgia',
    name: 'Georgia Bulldogs',
    shortName: 'Georgia',
    primaryColor: 'oklch(0.42 0.18 15)',
    secondaryColor: 'oklch(0.20 0.02 30)',
    accentColor: 'oklch(0.42 0.18 15)',
    conference: 'SEC',
    division: 'D1'
  },
  'south-carolina': {
    id: 'south-carolina',
    name: 'South Carolina Gamecocks',
    shortName: 'S Carolina',
    primaryColor: 'oklch(0.35 0.15 20)',
    secondaryColor: 'oklch(0.20 0.02 30)',
    accentColor: 'oklch(0.35 0.15 20)',
    conference: 'SEC',
    division: 'D1'
  },
  'auburn': {
    id: 'auburn',
    name: 'Auburn Tigers',
    shortName: 'Auburn',
    primaryColor: 'oklch(0.35 0.10 30)',
    secondaryColor: 'oklch(0.65 0.18 40)',
    accentColor: 'oklch(0.65 0.18 40)',
    conference: 'SEC',
    division: 'D1'
  },
  'alabama': {
    id: 'alabama',
    name: 'Alabama Crimson Tide',
    shortName: 'Alabama',
    primaryColor: 'oklch(0.45 0.22 18)',
    secondaryColor: 'oklch(0.98 0.01 60)',
    accentColor: 'oklch(0.45 0.22 18)',
    conference: 'SEC',
    division: 'D1'
  },
  'texas-am': {
    id: 'texas-am',
    name: 'Texas A&M Aggies',
    shortName: 'Texas A&M',
    primaryColor: 'oklch(0.35 0.08 25)',
    secondaryColor: 'oklch(0.98 0.01 60)',
    accentColor: 'oklch(0.35 0.08 25)',
    conference: 'SEC',
    division: 'D1'
  },
  'missouri': {
    id: 'missouri',
    name: 'Missouri Tigers',
    shortName: 'Missouri',
    primaryColor: 'oklch(0.25 0.05 50)',
    secondaryColor: 'oklch(0.78 0.18 70)',
    accentColor: 'oklch(0.78 0.18 70)',
    conference: 'SEC',
    division: 'D1'
  },
  'kentucky': {
    id: 'kentucky',
    name: 'Kentucky Wildcats',
    shortName: 'Kentucky',
    primaryColor: 'oklch(0.45 0.18 260)',
    secondaryColor: 'oklch(0.98 0.01 60)',
    accentColor: 'oklch(0.45 0.18 260)',
    conference: 'SEC',
    division: 'D1'
  },
  'oklahoma': {
    id: 'oklahoma',
    name: 'Oklahoma Sooners',
    shortName: 'Oklahoma',
    primaryColor: 'oklch(0.45 0.22 15)',
    secondaryColor: 'oklch(0.92 0.02 60)',
    accentColor: 'oklch(0.45 0.22 15)',
    conference: 'SEC',
    division: 'D1'
  }
};

export function getTeamBranding(teamId: string): TeamBranding {
  const normalizedId = teamId.toLowerCase().replace(/\s+/g, '-');
  return TEAM_BRANDING[normalizedId] || {
    id: normalizedId,
    name: teamId,
    shortName: teamId,
    primaryColor: 'oklch(0.65 0.15 40)',
    secondaryColor: 'oklch(0.98 0.01 60)',
    accentColor: 'oklch(0.72 0.18 45)',
    conference: 'Unknown',
    division: 'Unknown'
  };
}

export function getTeamGradient(teamId: string): string {
  const branding = getTeamBranding(teamId);
  return `linear-gradient(135deg, ${branding.primaryColor}, ${branding.accentColor})`;
}

export function getConferenceColor(conference: string): string {
  const conferenceColors: Record<string, string> = {
    'SEC': 'oklch(0.45 0.18 260)',
    'ACC': 'oklch(0.50 0.18 250)',
    'Big 12': 'oklch(0.62 0.20 25)',
    'Big Ten': 'oklch(0.42 0.18 15)',
    'Pac-12': 'oklch(0.50 0.12 145)',
    'American': 'oklch(0.65 0.15 40)',
  };
  return conferenceColors[conference] || 'oklch(0.65 0.15 40)';
}
