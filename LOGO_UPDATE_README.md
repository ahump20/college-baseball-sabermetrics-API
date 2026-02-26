# Logo Update Instructions

## Main Application Logo

The attached Blaze Sports Intel logo image needs to be saved to the project manually:

1. Save the attached image (the dog with flames and "BLAZE SPORTS INTEL" text) to: 
   `/workspaces/spark-template/src/assets/images/blaze-sports-intel-logo.png`

2. The App.tsx file has already been updated to reference this new logo file.

3. Alternatively, if you have a different format (webp, jpg, etc.), save it and update the import in `src/App.tsx` line 25:
   ```typescript
   import blazeLogo from '@/assets/images/blaze-sports-intel-logo.png';
   ```

## Photo Service Implementation

I've created a comprehensive photo service (`src/lib/photoService.ts`) that provides:

- **Team Logos**: Automatically fetches real team logos from ESPN's CDN for all SEC teams and other major college baseball programs
- **Player Photos**: Attempts to load real player headshots from ESPN, with graceful fallbacks to generated avatars
- **Conference Logos**: Displays conference logos for SEC, ACC, Big 12, Big Ten, and Pac-12

## Components Updated

The following components now display real photos/logos where available:

1. **PlayerProfile.tsx** - Shows player headshots and team logos on player cards
2. **GameScoreboard.tsx** - Displays team logos next to team names in game listings  
3. **PlayerComparison.tsx** - Ready to show player photos and team logos (imports added)

## How It Works

- Photos load from ESPN's CDN using player/team IDs when available
- If a photo fails to load, the system falls back to:
  - Auto-generated avatars with player initials for players
  - Placeholder logos for teams
- Team logos are mapped for all 16 SEC teams plus other major programs
- All images have error handling to hide broken image icons

## Next Steps

To add photos to more components:

```typescript
import { getPlayerPhoto, getTeamLogo } from '@/lib/photoService';

// For player photos:
const photo = getPlayerPhoto(player.id, player.name, player.team);
<img src={photo.headshot} onError={(e) => e.currentTarget.src = photo.fallback} />

// For team logos:
const logo = getTeamLogo(teamName);
<img src={logo.primary} alt={teamName} />
```
