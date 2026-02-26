import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Database, ChartBar, Users, Trophy, Pulse, Code, Calculator, ChartLine, Baseball, Gear, List, X, TrendUp, CalendarDots, ChartLineUp, Sparkle } from '@phosphor-icons/react';
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
import { motion, AnimatePresence } from 'framer-motion';
import { useIsMobile } from '@/hooks/use-mobile';

type ViewType = 'dashboard' | 'api' | 'schema' | 'analytics' | 'players' | 'games' | 'coverage' | 'config' | 'teams' | 'live-scores' | 'trends' | 'highlightly';

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

  const baseNavItems = [
    { id: 'dashboard' as ViewType, label: 'Dashboard', icon: ChartLine },
    { id: 'highlightly' as ViewType, label: 'Highlightly API', icon: Sparkle },
    { id: 'live-scores' as ViewType, label: 'Live Scores', icon: CalendarDots },
    { id: 'trends' as ViewType, label: 'Trends', icon: ChartLineUp },
    { id: 'api' as ViewType, label: 'API', icon: Code },
    { id: 'analytics' as ViewType, label: 'Analytics', icon: Calculator },
    { id: 'players' as ViewType, label: 'Players', icon: Users },
    { id: 'games' as ViewType, label: 'Games', icon: Trophy },
    { id: 'schema' as ViewType, label: 'Data Model', icon: Database },
    { id: 'coverage' as ViewType, label: 'Coverage', icon: ChartBar },
  ];

  const navItems = isOwner 
    ? [...baseNavItems, { id: 'config' as ViewType, label: 'Settings', icon: Gear }]
    : baseNavItems;

  const handleNavClick = (view: ViewType) => {
    setCurrentView(view);
    setMobileMenuOpen(false);
  };

  const SidebarContent = () => (
    <>
      <div className="p-6 border-b border-border">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center shadow-sm">
            <Baseball className="text-primary-foreground" size={20} weight="bold" />
          </div>
          <div>
            <h1 className="text-[0.9375rem] font-semibold text-foreground leading-tight">
              Blaze Sports Intel
            </h1>
            <p className="text-[0.75rem] text-muted-foreground font-mono">
              Sabermetrics API
            </p>
          </div>
        </div>
      </div>

      <nav className="flex-1 p-4 space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentView === item.id;
          return (
            <button
              key={item.id}
              onClick={() => handleNavClick(item.id)}
              className={`
                w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-[0.875rem] font-medium transition-all
                ${isActive 
                  ? 'bg-primary text-primary-foreground shadow-sm' 
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                }
              `}
            >
              <Icon size={18} weight={isActive ? 'bold' : 'regular'} />
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>

      <div className="p-4 border-t border-border">
        <Badge variant="outline" className="w-full justify-center font-mono text-[0.75rem] px-2.5 py-1.5 border-success/30 bg-success/10 text-success gap-1.5">
          <Pulse size={12} weight="bold" />
          Live Data
        </Badge>
      </div>
    </>
  );

  const viewTitles: Record<ViewType, string> = {
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
    <div className="min-h-screen bg-background flex">
      {!isMobile && (
        <aside className="w-64 border-r border-border bg-card flex flex-col shrink-0">
          <SidebarContent />
        </aside>
      )}

      {isMobile && (
        <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
          <SheetContent side="left" className="p-0 w-64">
            <SidebarContent />
          </SheetContent>
        </Sheet>
      )}

      <main className="flex-1 flex flex-col overflow-hidden">
        <header className="border-b border-border bg-card px-4 sm:px-8 py-4 sm:py-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              {isMobile && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setMobileMenuOpen(true)}
                  className="shrink-0"
                >
                  <List size={24} weight="bold" />
                </Button>
              )}
              <div>
                <h2 className="text-[1.25rem] sm:text-[1.5rem] font-semibold text-foreground tracking-tight">
                  {viewTitles[currentView]}
                </h2>
                <p className="text-[0.75rem] sm:text-[0.875rem] text-muted-foreground mt-1">
                  {viewDescriptions[currentView]}
                </p>
              </div>
            </div>
            <Badge variant="outline" className="font-mono text-[0.6875rem] sm:text-[0.75rem] px-2 sm:px-2.5 py-1 shrink-0">
              v1.0.0
            </Badge>
          </div>
        </header>

        <div className="flex-1 overflow-auto p-4 sm:p-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentView}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3, ease: 'easeInOut' }}
              className="h-full"
            >
              {currentView === 'dashboard' && <RealTimeDashboard />}
              {currentView === 'highlightly' && <HighlightlyDataDashboard />}
              {currentView === 'live-scores' && <LiveGameScores />}
              {currentView === 'trends' && <TeamPerformanceCharts />}
              {currentView === 'teams' && selectedTeamId && (
                <TeamDetailView teamId={selectedTeamId} onBack={() => setSelectedTeamId(null)} />
              )}
              {currentView === 'api' && <APIExplorer />}
              {currentView === 'schema' && (
                <div className="space-y-6">
                  <SchemaViewer />
                </div>
              )}
              {currentView === 'analytics' && (
                <div className="space-y-6">
                  <MetricsCalculator />
                </div>
              )}
              {currentView === 'players' && <PlayerComparison />}
              {currentView === 'games' && <Scoreboard />}
              {currentView === 'coverage' && <CoverageDashboard />}
              {currentView === 'config' && (
                <div className="space-y-6 max-w-5xl">
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
