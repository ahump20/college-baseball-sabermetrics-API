# Blaze Sports Intel - Brand Assets Guide

## Overview
This document provides a complete reference for all Blaze Sports Intel brand assets and their proper usage across the platform.

## Primary Logo Assets

### Main Circular Logo (Primary)
**File:** `src/assets/images/blaze-roundel-tight.png`
**Usage:** Main application logo in sidebar, headers, and primary branding
**Description:** Circular badge featuring the Blaze mascot (dachshund) with flames and "BLAZE SPORTS INTEL" text
**Dimensions:** Optimized for circular/square contexts
**Current Implementation:** App.tsx sidebar (64x64px with rounded styling)

### Alternative Logo Versions
- **blaze-crest.png** - Crest/shield style variant
- **blaze-dachshund-mark.png** - Mascot-only mark
- **blaze-portrait.png** - Vertical portrait orientation
- **blaze-wordmark-wide.png** - Horizontal wordmark for wide spaces
- **bsi-logo-primary.webp** - Legacy primary logo (square format)
- **bsi-shield-blaze.png/webp** - Shield variant with mascot

## Hero & Banner Assets

### Stadium Background
**File:** `src/assets/images/bsi-hero-stadium.webp`
**Usage:** Hero sections, backgrounds
**Description:** Baseball stadium imagery for atmospheric backgrounds

### Horizontal Banner
**File:** `src/assets/images/bsi-banner-horizontal.webp`
**Usage:** Wide header sections, email signatures
**Description:** Full-width branding banner

## Logo Usage Guidelines

### Sidebar Logo (Current Implementation)
```tsx
<img 
  src={blazeLogo} 
  alt="Blaze Sports Intel" 
  className="h-16 w-16 relative z-10 rounded-full ring-2 ring-primary/20"
/>
```

### Recommended Sizes
- **Sidebar/Navigation:** 48-64px
- **Header:** 32-48px  
- **Favicon:** 16px, 32px, 64px
- **Touch Icons:** 180px, 192px, 512px

### Color Specifications
Based on `index.css` theme:
- **Primary:** `oklch(0.65 0.15 40)` - Warm orange-gold
- **Secondary:** `oklch(0.78 0.12 60)` - Golden yellow
- **Accent:** `oklch(0.72 0.18 45)` - Vibrant orange

## Brand Voice & Messaging

### Tagline
"Born to Blaze the Path Less Beaten"

### Application Subtitle
"NCAA Baseball Analytics"

### Description
"Advanced NCAA baseball analytics platform powered by Blaze Sports Intel - real-time data, sabermetrics, and comprehensive statistics."

## File Locations

All brand assets are stored in:
```
/src/assets/images/
├── blaze-roundel-tight.png       (PRIMARY - Circular logo)
├── blaze-crest.png               (Alternative - Crest variant)
├── blaze-dachshund-mark.png      (Icon - Mascot only)
├── blaze-portrait.png            (Alternative - Portrait)
├── blaze-wordmark-wide.png       (Alternative - Horizontal)
├── bsi-logo-primary.webp         (Legacy - Square format)
├── bsi-shield-blaze.png          (Alternative - Shield)
├── bsi-shield-blaze.webp         (Alternative - Shield optimized)
├── bsi-hero-stadium.webp         (Background - Stadium)
└── bsi-banner-horizontal.webp    (Banner - Horizontal)
```

## Component Integration

### Current Usage
1. **App.tsx** - Main sidebar logo (blaze-roundel-tight.png)
2. **index.html** - Page title and meta descriptions updated
3. Future: Add to loading screens, error pages, email templates

### Fonts
- **Display:** Space Grotesk - Headlines, logos, emphasis
- **Body:** Inter - Body text, UI elements
- **Monospace:** JetBrains Mono - Stats, code, technical data

## Video Assets

Video highlights are stored in:
```
/src/assets/video/
```

Note: Video directory structure created for player highlight clips and promotional content.

## Best Practices

1. **Always use the circular logo** (blaze-roundel-tight.png) as the primary brand mark
2. **Maintain aspect ratio** - Never stretch or skew the logo
3. **Clear space** - Keep minimum padding of 20% of logo height around the mark
4. **Background contrast** - Ensure logo has sufficient contrast on all backgrounds
5. **File format** - Use PNG for logos with transparency, WebP for photos/banners
6. **Accessibility** - Always include descriptive alt text

## Future Enhancements

- [ ] Add favicon set (16x16, 32x32, etc.)
- [ ] Create loading animation using logo
- [ ] Design error state branded graphics
- [ ] Develop social media share images
- [ ] Create email header template
