import { useState, useEffect } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent } from '@/components/ui/sheet';
import { Separator } from '@/components/ui/separator';
import { Database, ChartBar, Users, Trophy, Code, Calculator, ChartLine, Gear, List, Flame, Sparkle, Lightning, Baseball } from '@phosphor-icons/react';
import { APIExplorer } from '@/components/APIExplorer';
import { SchemaViewer } from '@/components/SchemaViewer';
import { MetricsCalculator } from '@/components/MetricsCalculator';
import { CoverageDashboard } from '@/components/CoverageDashboard';
import { PlayerComparison } from '@/components/PlayerComparison';
import { Scoreboard } from '@/components/Scoreboard';
import { KVNamespaceManager } from '@/components/KVNamespaceManager';
import { APISecretsManager } from '@/components/APISecretsManager';
import { RealTimeDashboard } from '@/components/RealTimeDashboard';
import { TeamDetailView } from '@/components/TeamDetailView';
import { LiveGameScores } from '@/components/LiveGameScores';
import { TeamPerformanceCharts } from '@/components/TeamPerformanceCharts';
import { HighlightlyDataDashboard } from '@/components/HighlightlyDataDashboard';
import { NCAABaseballPortal } from '@/components/NCAABaseballPortal';
import { motion, AnimatePresence } from 'framer-motion';
import { useIsMobile } from '@/hooks/use-mobile';
import blazeLogo from '@/assets/images/bsi-logo-primary.webp';

type ViewType = 'dashboard' | 'api' | 'schema' | 'analytics' | 'players' | 'games' | 'coverage' | 'config' | 'teams' | 'live-scores' | 'trends' | 'highlightly' | 'portal';

interface NavItem {
  id: ViewType;
  label: string;
  icon: typeof ChartLine;
}

interface NavGroup {
  title: string;
  items: NavItem[];
}

function App() {
  const [currentView, setCurrentView] = useState<ViewType>('dashboard');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [selectedTeamId, setSelectedTeamId] = useState<string | null>(null);
  const [isOwner, setIsOwner] = useState<boolean>(false);
  const isMobile = useIsMobile();

  useEffect(() => {
    window.spark.user().then(user => {
      setIsOwner(user?.isOwner || false);
    }).catch(() => {
      setIsOwner(false);
    });
  }, []);

  const navGroups: NavGroup[] = [
    {
      title: 'Overview',
      items: [
        { id: 'portal', label: 'NCAA Portal', icon: Baseball },
        { id: 'dashboard', label: 'Dashboard', icon: ChartLine },
        { id: 'live-scores', label: 'Live Scores', icon: Lightning },
        { id: 'highlightly', label: 'Highlightly Data', icon: Sparkle },
      ],
    },
    {
      title: 'Analytics',
      items: [
        { id: 'analytics', label: 'Metrics', icon: Calculator },
        { id: 'trends', label: 'Trends', icon: ChartBar },
        { id: 'players', label: 'Players', icon: Users },
        { id: 'games', label: 'Games', icon: Trophy },
      ],
    },
    {
      title: 'Platform',
      items: [
        { id: 'api', label: 'API Explorer', icon: Code },
        { id: 'schema', label: 'Data Model', icon: Database },
        { id: 'coverage', label: 'Coverage', icon: ChartBar },
      ],
    },
  ];

  if (isOwner) {
    navGroups.push({
      title: 'Settings',
      items: [{ id: 'config', label: 'Configuration', icon: Gear }],
    });
  }

  const handleNavClick = (view: ViewType) => {
    setCurrentView(view);
    setMobileMenuOpen(false);
  };

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      <div className="p-6">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/30 to-accent/30 rounded-xl blur-lg" />
            <img 
              src={blazeLogo} 
              alt="Blaze Sports Intel" 
              className="h-12 w-auto relative z-10"
            />
          </div>
        </div>
        <div className="mt-4">
          <h1 className="text-lg font-display font-semibold text-foreground leading-tight">
            Blaze Sports Intel
          </h1>
          <p className="text-xs text-muted-foreground font-mono mt-1">
            Sabermetrics Platform
          </p>
        </div>
      </div>

      <Separator className="opacity-50" />

      <nav className="flex-1 p-4 space-y-6 overflow-y-auto">
        {navGroups.map((group, groupIndex) => (
          <div key={group.title}>
            {groupIndex > 0 && <Separator className="my-4 opacity-30" />}
            <div className="space-y-1">
              <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-3 mb-2">
                {group.title}
              </h2>
              {group.items.map((item) => {
                const Icon = item.icon;
                const isActive = currentView === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => handleNavClick(item.id)}
                    className={`
                      w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group
                      ${isActive 
                        ? 'bg-gradient-to-r from-primary to-accent text-primary-foreground shadow-lg shadow-primary/25' 
                        : 'text-muted-foreground hover:text-foreground hover:bg-surface-elevated'
                      }
                    `}
                  >
                    <Icon 
                      size={20} 
                      weight={isActive ? 'fill' : 'regular'} 
                      className={isActive ? '' : 'group-hover:scale-110 transition-transform'}
                    />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      <Separator className="opacity-50" />

      <div className="p-4">
        <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-success/20 to-success/10 border border-success/30 p-3">
          <div className="absolute top-0 right-0 w-16 h-16 bg-success/20 rounded-full blur-2xl" />
          <div className="relative flex items-center gap-2">
            <div className="flex-shrink-0">
              <div className="w-2 h-2 rounded-full bg-success animate-pulse" />
            </div>
            <div>
              <div className="text-xs font-mono font-semibold text-success">LIVE DATA</div>
              <div className="text-[10px] text-success/70 mt-0.5">Real-time updates</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const viewTitles: Record<ViewType, string> = {
    portal: 'NCAA Baseball Portal',
    dashboard: 'Dashboard',
    highlightly: 'Highlightly API Integration',
    'live-scores': 'Live Scores & Schedules',
    trends: 'Performance Trends',
    teams: 'Team Details',
    api: 'API Explorer',
    analytics: 'Analytics & Metrics',
    players: 'Player Performance',
    games: 'Game Scoreboard',
    schema: 'Data Model & Architecture',
    coverage: 'Data Coverage',
    config: 'Configuration & Settings',
  };

  const viewDescriptions: Record<ViewType, string> = {
    portal: 'Comprehensive NCAA baseball analytics and team portal',
    dashboard: 'Real-time NCAA baseball analytics and platform metrics',
    highlightly: 'MLB & College Baseball data from Highlightly API',
    'live-scores': 'Live game scores and schedules from ESPN',
    trends: 'Data visualization charts for team performance analysis',
    teams: 'Detailed team information with roster and statistics',
    api: 'Interactive endpoint documentation with live examples',
    analytics: 'Advanced sabermetrics with context adjustments',
    players: 'Compare and analyze player statistics',
    games: 'Live scores and game results',
    schema: 'Three-layer architecture with provenance tracking',
    coverage: 'Data availability across divisions and conferences',
    config: 'KV namespaces and API authentication',
  };

  return (
    <div className="min-h-screen bg-background flex relative">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,oklch(0.22_0.08_40_/_0.15),transparent_50%),radial-gradient(ellipse_at_bottom_left,oklch(0.22_0.08_45_/_0.15),transparent_50%)] pointer-events-none" />
      
      {!isMobile && (
        <aside className="w-72 border-r border-border/50 bg-card/50 backdrop-blur-xl flex flex-col shrink-0 relative z-10">
          <SidebarContent />
        </aside>
      )}

      {isMobile && (
        <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
          <SheetContent side="left" className="p-0 w-72 bg-card/95 backdrop-blur-xl">
            <SidebarContent />
          </SheetContent>
        </Sheet>
      )}

      <main className="flex-1 flex flex-col overflow-hidden relative z-10">
        <header className="border-b border-border/50 bg-card/30 backdrop-blur-xl px-4 sm:px-8 py-5 sm:py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              {isMobile && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setMobileMenuOpen(true)}
                  className="shrink-0 hover:bg-surface-elevated"
                >
                  <List size={24} weight="bold" />
                </Button>
              )}
              <div>
                <h2 className="text-2xl sm:text-3xl font-display font-bold text-foreground tracking-tight flex items-center gap-3">
                  {viewTitles[currentView]}
                  {currentView === 'dashboard' && (
                    <Flame size={28} weight="fill" className="text-primary animate-pulse" />
                  )}
                </h2>
                <p className="text-sm sm:text-base text-muted-foreground mt-1.5">
                  {viewDescriptions[currentView]}
                </p>
              </div>
            </div>
            <Badge variant="outline" className="font-mono text-xs px-3 py-1.5 shrink-0 bg-surface/50 border-border/50">
              v1.0.0
            </Badge>
          </div>
        </header>

        <div className="flex-1 overflow-auto p-4 sm:p-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentView}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.35, ease: [0.4, 0, 0.2, 1] }}
              className="h-full"
            >
              {currentView === 'portal' && <NCAABaseballPortal />}
              {currentView === 'dashboard' && <RealTimeDashboard />}
              {currentView === 'highlightly' && <HighlightlyDataDashboard />}
              {currentView === 'live-scores' && <LiveGameScores />}
              {currentView === 'trends' && <TeamPerformanceCharts />}
              {currentView === 'teams' && selectedTeamId && (
                <TeamDetailView teamId={selectedTeamId} onBack={() => setSelectedTeamId(null)} />
              )}
              {currentView === 'api' && <APIExplorer />}
              {currentView === 'schema' && (
                <div className="space-y-8">
                  <SchemaViewer />
                </div>
              )}
              {currentView === 'analytics' && (
                <div className="space-y-8">
                  <MetricsCalculator />
                </div>
              )}
              {currentView === 'players' && <PlayerComparison />}
              {currentView === 'games' && <Scoreboard />}
              {currentView === 'coverage' && <CoverageDashboard />}
              {currentView === 'config' && (
                <div className="space-y-8 max-w-5xl">
                  <KVNamespaceManager />
                  <APISecretsManager />
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}

export default App;
