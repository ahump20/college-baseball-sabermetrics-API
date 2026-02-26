# College Baseball Sabermetrics & Performance Analytics API

An interactive platform demonstrating a production-grade API architecture for NCAA baseball analytics that prioritizes data provenance, licensing compliance, and advanced sabermetrics.

**Mission**: Showcase how a credible proprietary college baseball analytics API should be architected with rights-aware data layers, canonical ID mapping, NCAA policy compliance, and sophisticated context-adjusted metrics.

**Experience Qualities**:
1. **Professional** - Enterprise-grade developer platform with clear hierarchy, consistent spacing, and production-ready components
2. **Transparent** - Trust surfaces displaying provenance, coverage, validation state, and data lineage at every level
3. **Scannable** - Optimized for 10-second comprehension with strong typography, data tables, and visual rhythm

**Complexity Level**: Complex Application (advanced functionality with multiple views)
This is a comprehensive data platform demonstration featuring API explorer, schema visualization, metrics calculator, provenance tracking, and interactive analytics - requiring sophisticated state management, multiple coordinated views, and technical depth.

## UI Enhancement Summary

The platform now implements a strict, testable design system with:

**Shared Component Library**:
- `StatusPill` - Provisional/Official/Corrected status badges with icons
- `CoveragePill` - Box-only/PBP/Tracking coverage indicators
- `ProvenanceSnippet` - Data source and timestamp display
- `SectionCard` - Consistent card wrapper with 24px padding, title/description/actions
- `CodeBlock` - Syntax-highlighted code with copy functionality and improved styling
- `DataTable` - Enhanced table with sticky headers, scroll shadows, and monospace support
- `ContextPanel` - Right-side detail drawer for entity exploration (400px desktop, full mobile)
- `PageHeader` - Standardized page titles with 32px heading and optional badges/actions

**Typography & Spacing System** (Strict Adherence):
- Page Title: 32px (2rem) Inter SemiBold, -0.02em tracking
- Section Title: 24px (1.5rem) Inter SemiBold, -0.01em tracking
- Subsection: 20px (1.25rem) Inter SemiBold
- Component Header: 18px (1.125rem) Inter Medium
- Body: 15px (0.9375rem) Inter Regular, 1.6 line-height
- Body Small: 14px (0.875rem) Inter Regular
- Code/Data: 14px (0.875rem) JetBrains Mono Regular, 1.5 line-height
- Label: 13px (0.8125rem) Inter Medium, 0.005em tracking
- Meta: 12px (0.75rem) Inter Regular, 0.01em tracking
- Spacing scale: 4px, 8px, 12px, 16px, 24px, 32px, 48px (no arbitrary values)

**Trust Surfaces** (visible across all pages):
- Status indicators on every data point
- Coverage metadata showing data availability
- Provenance snippets with source systems
- Validation badges for NCAA compliance

## Essential Features

### API Explorer & Documentation
- **Functionality**: Interactive API endpoint browser with live request/response examples
- **Purpose**: Demonstrate the complete API surface, authentication patterns, and response structures
- **Trigger**: User navigates to API Explorer tab
- **Progression**: Browse endpoint categories → Select specific endpoint → View parameters → See example response with provenance metadata → Copy code snippets
- **Success**: Users understand the API contract, versioning strategy, and how provenance/coverage is surfaced

### Data Model Visualizer
- **Functionality**: Interactive entity-relationship diagram of the canonical schema with table details
- **Purpose**: Show the three-layer architecture (rights/provenance, canonical data, analytics)
- **Trigger**: User navigates to Schema tab
- **Progression**: View ERD overview → Select table entity → Inspect fields and relationships → Understand NCAA compliance points → See mapping strategy
- **Success**: Users grasp the ID mapping approach, correction ledger design, and NCAA policy alignment

### Metrics Calculator
- **Functionality**: Interactive calculator for computing advanced metrics from sample data
- **Purpose**: Demonstrate metric formulas, context adjustments, and uncertainty quantification
- **Trigger**: User navigates to Analytics tab
- **Progression**: Select metric category (box-only/PBP/tracking-based) → Input sample stats → View calculation steps → See park/opponent adjustments → Compare raw vs context-adjusted
- **Success**: Users understand wOBA weights, FIP constants, park factors, and Bayesian shrinkage approaches

### Provenance Tracker
- **Functionality**: Visualize data lineage and correction history for sample games
- **Purpose**: Show how "official" status evolves and corrections are tracked per NCAA policy
- **Trigger**: User explores a sample game
- **Progression**: View game header → See initial box score → Inspect correction events → Track source systems → Verify host-control compliance
- **Success**: Users see how the system implements NCAA's host-official rule and maintains audit trails

### Coverage Dashboard
- **Functionality**: Visual representation of data availability across divisions, conferences, and data types
- **Purpose**: Illustrate the uneven tracking landscape and how the system handles partial coverage
- **Trigger**: User navigates to Coverage tab
- **Progression**: View division overview → Drill into conferences → See tracking penetration (TrackMan/PitchCom) → Understand graceful degradation
- **Success**: Users understand why coverage-aware analytics matter and how metrics adapt

## Edge Case Handling

- **Missing tracking data** - Gracefully degrade to box-only or PBP-only metrics with clear coverage flags
- **Suspended/forfeited games** - Special status handling with NCAA rule alignment for "official date of site"
- **Correction conflicts** - Enforce away-team change consent requirement per NCAA host-control policy
- **ID collisions** - Merge history tracking with confidence scoring and manual review flags
- **Rate limit scenarios** - Display token bucket state and quota exhaustion guidance

## Design Direction

The design should evoke **technical credibility meets baseball tradition** - combining the precision of financial/developer tools with the warmth of baseball analytics. Think: FanGraphs meets Stripe Docs meets Baseball Reference. Clean data tables, monospace code blocks, and statistical rigor balanced with accessible color coding for metrics and clear visual hierarchies for complex relationships.

## Color Selection

**Primary Color**: `oklch(0.45 0.15 250)` - Deep analytical blue that communicates data integrity and technical depth, evoking both night games and trustworthy dashboards

**Secondary Colors**:
- Field Green: `oklch(0.55 0.12 145)` - Subtle nod to baseball diamonds, used for success states and valid data
- Warning Amber: `oklch(0.70 0.15 75)` - Provisional/correction states
- Slate Gray: `oklch(0.35 0.02 250)` - Supporting backgrounds and secondary text

**Accent Color**: `oklch(0.65 0.20 30)` - Baseball orange for CTAs, highlighting important metrics, and interactive elements

**Foreground/Background Pairings**:
- Primary on White: `oklch(0.45 0.15 250)` on `oklch(1 0 0)` - Ratio 7.2:1 ✓
- Accent on White: `oklch(0.65 0.20 30)` on `oklch(1 0 0)` - Ratio 4.9:1 ✓
- White on Primary: `oklch(1 0 0)` on `oklch(0.45 0.15 250)` - Ratio 7.2:1 ✓
- Background: `oklch(0.98 0.005 250)` with Foreground: `oklch(0.20 0.01 250)` - Ratio 14.8:1 ✓

## Font Selection

Typography should balance technical precision with readability - using a modern coding font for data/code and a clean sans-serif for content.

**Primary**: JetBrains Mono for code, API responses, stat tables, and technical content
**Secondary**: Inter for UI labels, body text, and documentation prose

- **H1 (Section Titles)**: Inter SemiBold / 32px / -0.02em tracking
- **H2 (Subsections)**: Inter SemiBold / 24px / -0.01em tracking
- **H3 (Component Headers)**: Inter Medium / 18px / normal tracking
- **Body**: Inter Regular / 15px / 1.6 line height
- **Code/Data**: JetBrains Mono Regular / 14px / 1.5 line height
- **Stat Labels**: JetBrains Mono Medium / 13px / monospace alignment
- **Captions**: Inter Regular / 13px / 0.005em tracking / muted color

## Animations

Animations should feel precise and purposeful, like a well-executed defensive play. Use subtle transitions for state changes (200-300ms) with smooth easing. Highlight data updates with brief accent color flashes (150ms). Tab transitions should slide horizontally with slight parallax. Metric calculations should show progressive disclosure of computation steps. Avoid flashy effects - everything should feel measured and professional.

## Component Selection

**Components**:
- **Tabs** - Primary navigation between Explorer/Schema/Analytics/Coverage sections
- **Card** - Container for API endpoints, table definitions, metric calculators
- **Table** - Display schema fields, stat lines, and leaderboards with sortable columns
- **Badge** - Indicate status (provisional/official/corrected), coverage level, data tiers
- **Accordion** - Collapsible sections for endpoint parameters, calculation steps, schema details
- **Select** - Dropdown for metric selection, division/conference filters
- **Input** - Numeric inputs for metric calculator
- **Button** - CTAs for "Calculate", "View Example", "Copy Code"
- **Separator** - Visual breaks between logical sections
- **Scroll Area** - For long API responses and data tables

**Customizations**:
- Custom syntax-highlighted code blocks using JetBrains Mono
- Custom ERD diagram component with interactive node selection
- Custom metric formula display with LaTeX-style notation
- Custom timeline component for correction history

**States**:
- Buttons: Distinct hover with slight lift (2px), active state with accent border
- Inputs: Focus state with primary color ring, validation states (green/amber/red)
- Cards: Subtle hover elevation for interactive cards
- Tabs: Animated underline indicator with accent color

**Icon Selection**:
- Database, Table, Link (for schema/mapping concepts)
- Code, Terminal (for API/technical elements)
- ChartBar, TrendUp, Calculator (for metrics/analytics)
- ShieldCheck, Clock (for provenance/status)
- Baseball (contextual sport references)

**Spacing**:
- Section padding: `p-8` (2rem)
- Card padding: `p-6` (1.5rem)
- Element gaps: `gap-4` (1rem) for related items, `gap-8` (2rem) for section breaks
- Grid columns: 12-column grid with responsive breakpoints

**Mobile**:
- Tabs convert to vertical stack with sticky header
- Tables scroll horizontally within cards with sticky first column
- ERD diagram supports pinch-zoom and pan gestures
- Metric calculator stacks inputs vertically with preserved context
- Code blocks use horizontal scroll with copy button always visible
