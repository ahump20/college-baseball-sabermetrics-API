# Design System Enhancement - College Baseball Sabermetrics API

## Typography Scale (Strict)

```css
Page Title:     32px / 2rem     Inter SemiBold   -0.02em tracking
Section Title:  24px / 1.5rem   Inter SemiBold   -0.01em tracking
Subsection:     20px / 1.25rem  Inter SemiBold   normal
Component Head: 18px / 1.125rem Inter Medium     normal
Body Large:     16px / 1rem     Inter Regular    1.6 line-height
Body:           15px / 0.9375rem Inter Regular   1.6 line-height
Body Small:     14px / 0.875rem Inter Regular    1.5 line-height
Code/Data:      14px / 0.875rem JetBrains Mono   1.5 line-height
Label:          13px / 0.8125rem Inter Medium    0.005em tracking
Meta:           12px / 0.75rem  Inter Regular    0.01em tracking
```

## Spacing Scale (Strict - No Exceptions)

```
4px  = 0.25rem = space-1
8px  = 0.5rem  = space-2
12px = 0.75rem = space-3
16px = 1rem    = space-4
24px = 1.5rem  = space-6
32px = 2rem    = space-8
48px = 3rem    = space-12
```

## Component Inventory

### Shared UI Components (New/Enhanced)

1. **ContextPanel** - Right-side detail drawer
   - Width: 400px desktop, full-width mobile
   - Slide animation: 250ms ease-out
   - Close on overlay click + ESC key

2. **DataTable** (Enhanced)
   - Sticky header with shadow on scroll
   - Monospace for IDs, endpoints, numeric values
   - Right-align numeric columns
   - Row hover state
   - Sortable columns

3. **SectionCard** (Enhanced)
   - Consistent 24px padding
   - 8px border radius
   - Subtle shadow: 0 1px 3px rgba(0,0,0,0.05)
   - Header with title (20px) + description (14px)
   - Optional actions (right-aligned)

4. **StatusPill** (Existing - ensure consistency)
   - provisional | official | corrected
   - Icon + label
   - 12px font size, monospace

5. **CoveragePill** (Existing - ensure consistency)
   - box-only | pbp | tracking
   - Color-coded
   - 12px font size, monospace

6. **ProvenanceSnippet** (Existing - ensure consistency)
   - Source systems list
   - Last updated timestamp
   - 12px meta text

7. **CodeBlock** (Enhanced)
   - JetBrains Mono 14px
   - Syntax highlighting
   - Copy button (top-right)
   - Line numbers optional
   - Max height with scroll

8. **PageHeader**
   - 32px title
   - 15px description
   - Optional badges (status, version)
   - 48px bottom margin

## Layout Grid

- Max content width: 1440px
- Gutter: 24px (desktop), 16px (mobile)
- Columns: 12-column grid
- Main content: 8 columns (66.67%)
- Context panel: 4 columns (33.33%)

## Trust Surfaces Pattern

Every data display must include:
1. **Status** - provisional/official/corrected badge
2. **Coverage** - data availability level
3. **Provenance** - source + timestamp
4. **Validation** - NCAA compliance status (where applicable)

## Color Usage Rules

- Primary (`oklch(0.45 0.15 250)`): CTAs, links, active states
- Success (`oklch(0.55 0.12 145)`): Official status, valid data, success states
- Warning (`oklch(0.70 0.15 75)`): Provisional status, corrections needed
- Accent (`oklch(0.65 0.20 30)`): Highlights, important metrics, interactive focus
- Destructive (`oklch(0.55 0.22 25)`): Errors, flagged data, delete actions

## Implementation Checklist

- [x] Create ContextPanel component
- [x] Enhance DataTable with sticky headers
- [x] Create PageHeader component
- [x] Refactor SectionCard padding to 24px
- [x] Enhance CodeBlock with line numbers
- [x] Update App shell with new header design
- [ ] Add Context Panel integration to ERD
- [ ] Add Context Panel integration to API Explorer
- [x] Refactor all pages to use consistent spacing
- [x] Update typography classes across all components
- [x] Add trust surfaces to all data displays
- [x] Create ValidationBadge component
- [ ] Test responsive behavior
- [ ] Verify accessibility (contrast, keyboard nav)

## Recent Updates (UI Enhancement Pass)

### App Shell
- Enhanced header with 20px height (was 72px)
- Added gradient to logo background
- Improved badge spacing and mobile responsiveness
- Increased main content padding from py-8 to py-12
- Wrapped TabsList in scrollable container for mobile

### Component Updates
- **PageHeader**: Updated to 12px bottom margin, 32px title with -0.02em tracking, 15px body text
- **SectionCard**: 24px section title (was 20px), 6px padding with border-b separator between header/content
- **ValidationBadge**: NEW - trust surface for NCAA compliance validation (proofed/flagged/pending)

### Page Updates
- **APIExplorer**: 
  - Now uses PageHeader component
  - Added "Trust Surfaces" section with StatusPill, CoveragePill, ValidationBadge
  - Added "Data Provenance" section heading
  - Improved spacing: 8pt between sections (was 6px)
  - Better typography hierarchy with 18px component headers
  - Enhanced hover states on endpoints
  
- **SchemaViewer**:
  - Now uses PageHeader component
  - Added icon backgrounds to layer cards
  - Improved card hover states
  - Better spacing in field lists (h-80 ScrollArea)
  - Enhanced typography with 24px section titles

### Typography Polish
- All page titles: 32px (2rem) with -0.02em tracking
- Section titles: 24px (1.5rem) with -0.01em tracking
- Component headers: 18px (1.125rem) medium weight
- Body text: 15px (0.9375rem) with 1.6 line-height
- Meta text: 13px (0.8125rem) uppercase with wider tracking for labels
