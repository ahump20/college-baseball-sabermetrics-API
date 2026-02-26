import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Code, Database, Calculator, GitBranch, ChartBar, Pulse, Shapes, ArrowsLeftRight, Users, Baseball, Flame, Key, ListNumbers, User, FileText, List } from '@phosphor-icons/react';
import { APIExplorer } from '@/components/APIExplorer';
import { SchemaViewer } from '@/components/SchemaViewer';
import { MetricsCalculator } from '@/components/MetricsCalculator';
import { ProvenanceTracker } from '@/components/ProvenanceTracker';
import { CoverageDashboard } from '@/components/CoverageDashboard';
import { LiveAPISimulator } from '@/components/LiveAPISimulator';
import { InteractiveERD } from '@/components/InteractiveERD';
import { ComparisonTool } from '@/components/ComparisonTool';
import { PlayerComparison } from '@/components/PlayerComparison';
import { GameScoreboard } from '@/components/GameScoreboard';
import { APIAccessDocs } from '@/components/APIAccessDocs';
import { PlayerLeaderboards } from '@/components/PlayerLeaderboards';
import { PlayerProfile } from '@/components/PlayerProfile';
import { TexasLonghornsData } from '@/components/TexasLonghornsData';
import { PageLoading } from '@/components/Loading';
import { usePageLoading } from '@/hooks/use-loading';
import { useIsMobile } from '@/hooks/use-mobile';
import blazeLogo from '@/assets/images/bsi-shield-blaze.webp';

interface TabConfig {
  value: string;
  label: string;
  icon: React.ElementType;
  component: React.ReactNode;
}

function App() {
  const [activeTab, setActiveTab] = useState('games');
  const [isInitialLoading] = usePageLoading(true, 1200);
  const isMobile = useIsMobile();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const tabs: TabConfig[] = [
    { value: 'games', label: 'Games', icon: Baseball, component: <GameScoreboard /> },
    { value: 'api-docs', label: 'API Docs', icon: Key, component: <APIAccessDocs /> },
    { value: 'api', label: 'API Explorer', icon: Code, component: <APIExplorer /> },
    { value: 'schema', label: 'Schema', icon: Database, component: <SchemaViewer /> },
    { value: 'erd', label: 'ERD', icon: Shapes, component: <InteractiveERD /> },
    { value: 'metrics', label: 'Analytics', icon: Calculator, component: <MetricsCalculator /> },
    { value: 'comparison', label: 'Compare', icon: ArrowsLeftRight, component: <ComparisonTool /> },
    { value: 'leaderboards', label: 'Leaderboards', icon: ListNumbers, component: <PlayerLeaderboards /> },
    { value: 'players', label: 'Players', icon: Users, component: <PlayerComparison /> },
    { value: 'profiles', label: 'Profiles', icon: User, component: <PlayerProfile /> },
    { value: 'live', label: 'Live API', icon: Pulse, component: <LiveAPISimulator /> },
    { value: 'provenance', label: 'Provenance', icon: GitBranch, component: <ProvenanceTracker /> },
    { value: 'coverage', label: 'Coverage', icon: ChartBar, component: <CoverageDashboard /> },
    { value: 'texas', label: 'Texas Stats', icon: FileText, component: <TexasLonghornsData /> },
  ];

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="sticky top-0 z-50 w-full border-b border-border bg-card/95 backdrop-blur-md supports-[backdrop-filter]:bg-card/90">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 sm:h-20 lg:h-24 items-center justify-between gap-2 sm:gap-4">
            <div className="flex items-center gap-2 sm:gap-4 flex-1 min-w-0">
              <img 
                src={blazeLogo} 
                alt="Blaze Sports Intel" 
                className="h-10 sm:h-12 lg:h-16 w-auto shrink-0"
              />
              <div className="min-w-0 border-l border-border/50 pl-2 sm:pl-4">
                <h1 className="text-sm sm:text-base lg:text-[1.25rem] font-semibold tracking-tight text-foreground leading-tight truncate">
                  College Baseball Sabermetrics API
                </h1>
                <p className="text-[0.625rem] sm:text-[0.75rem] lg:text-[0.8125rem] text-muted-foreground font-mono mt-0.5 hidden sm:block">
                  Production-Grade NCAA Analytics Platform
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 sm:gap-3 shrink-0">
              <Badge variant="outline" className="font-mono text-[0.625rem] sm:text-[0.75rem] px-2 py-1 sm:px-3 sm:py-1.5 border-success/30 bg-success/10 text-success gap-1 sm:gap-1.5 hidden md:flex">
                <Pulse size={12} weight="bold" />
                <span className="hidden lg:inline">Live Data</span>
              </Badge>
              <Badge variant="outline" className="font-mono text-[0.625rem] sm:text-[0.75rem] px-2 py-1 sm:px-3 sm:py-1.5 border-primary/30 bg-primary/10 text-primary gap-1 sm:gap-1.5">
                <Flame size={12} weight="bold" className="hidden sm:inline" />
                v1.0
              </Badge>
              {isMobile && (
                <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
                  <SheetTrigger asChild>
                    <Button variant="outline" size="icon" className="sm:hidden">
                      <List size={20} weight="bold" />
                    </Button>
                  </SheetTrigger>
                  <SheetContent side="right" className="w-[280px] sm:w-[340px] p-0">
                    <div className="py-6">
                      <h2 className="px-6 text-lg font-semibold mb-4">Navigation</h2>
                      <ScrollArea className="h-[calc(100vh-120px)]">
                        <div className="space-y-1 px-3">
                          {tabs.map(tab => {
                            const Icon = tab.icon;
                            return (
                              <Button
                                key={tab.value}
                                variant={activeTab === tab.value ? 'secondary' : 'ghost'}
                                className="w-full justify-start gap-3 h-12"
                                onClick={() => {
                                  setActiveTab(tab.value);
                                  setMobileMenuOpen(false);
                                }}
                              >
                                <Icon size={20} weight="bold" />
                                <span className="font-medium">{tab.label}</span>
                              </Button>
                            );
                          })}
                        </div>
                      </ScrollArea>
                    </div>
                  </SheetContent>
                </Sheet>
              )}
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1 container mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-12">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          {!isMobile && (
            <div className="mb-6 sm:mb-8">
              <ScrollArea className="w-full">
                <TabsList className="inline-flex h-10 sm:h-12 w-auto gap-1 bg-muted/50 p-1 rounded-lg">
                  {tabs.map(tab => {
                    const Icon = tab.icon;
                    return (
                      <TabsTrigger 
                        key={tab.value}
                        value={tab.value} 
                        className="gap-2 px-3 sm:px-4 data-[state=active]:bg-card data-[state=active]:shadow-sm rounded-md transition-all whitespace-nowrap"
                      >
                        <Icon size={16} weight="bold" className="sm:w-[18px] sm:h-[18px]" />
                        <span className="font-medium text-[0.8125rem] sm:text-[0.875rem] hidden lg:inline">{tab.label}</span>
                        <span className="font-medium text-[0.8125rem] sm:text-[0.875rem] lg:hidden">
                          {tab.label.split(' ')[0]}
                        </span>
                      </TabsTrigger>
                    );
                  })}
                </TabsList>
              </ScrollArea>
            </div>
          )}

          {isMobile && (
            <div className="mb-4 p-3 bg-muted/30 rounded-lg border border-border/50">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {(() => {
                    const currentTab = tabs.find(t => t.value === activeTab);
                    const Icon = currentTab?.icon || Baseball;
                    return (
                      <>
                        <Icon size={20} weight="bold" className="text-primary" />
                        <span className="font-semibold text-sm">{currentTab?.label}</span>
                      </>
                    );
                  })()}
                </div>
                <Badge variant="secondary" className="text-[0.6875rem]">
                  {tabs.findIndex(t => t.value === activeTab) + 1} / {tabs.length}
                </Badge>
              </div>
            </div>
          )}

          <div>
            {tabs.map(tab => (
              <TabsContent key={tab.value} value={tab.value} className="mt-0 space-y-4 sm:space-y-6">
                {tab.component}
              </TabsContent>
            ))}
          </div>
        </Tabs>
      </main>

      <footer className="border-t border-border bg-card/50 mt-auto">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10 lg:py-12">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 sm:gap-10 lg:gap-12">
            <div>
              <h3 className="font-semibold text-sm sm:text-base mb-3 sm:mb-4 text-foreground">Architecture Layers</h3>
              <ul className="space-y-2 sm:space-y-3 text-xs sm:text-sm text-muted-foreground">
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-0.5 font-bold">•</span>
                  <span>Rights & Provenance Tracking</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-0.5 font-bold">•</span>
                  <span>Canonical ID Mapping</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-0.5 font-bold">•</span>
                  <span>Advanced Sabermetrics</span>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-sm sm:text-base mb-3 sm:mb-4 text-foreground">NCAA Compliance</h3>
              <ul className="space-y-2 sm:space-y-3 text-xs sm:text-sm text-muted-foreground">
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-0.5 font-bold">•</span>
                  <span>Host-Official Rule</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-0.5 font-bold">•</span>
                  <span>Box Score Proofing</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-0.5 font-bold">•</span>
                  <span>Correction Workflows</span>
                </li>
              </ul>
            </div>
            <div className="sm:col-span-2 lg:col-span-1">
              <h3 className="font-semibold text-sm sm:text-base mb-3 sm:mb-4 text-foreground">Key Features</h3>
              <ul className="space-y-2 sm:space-y-3 text-xs sm:text-sm text-muted-foreground">
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-0.5 font-bold">•</span>
                  <span>Coverage-Aware Metrics</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-0.5 font-bold">•</span>
                  <span>Context Adjustments</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-0.5 font-bold">•</span>
                  <span>Model Versioning</span>
                </li>
              </ul>
            </div>
          </div>
          <div className="mt-8 sm:mt-10 lg:mt-12 pt-6 sm:pt-8 border-t border-border/50 flex flex-col sm:flex-row items-center justify-between gap-4 sm:gap-6">
            <div className="flex items-center gap-2 sm:gap-3">
              <img 
                src={blazeLogo} 
                alt="Blaze Sports Intel" 
                className="h-10 sm:h-12 w-auto opacity-80"
              />
              <div className="text-[0.6875rem] sm:text-xs text-muted-foreground text-center sm:text-left">
                <div className="font-mono">COURAGE · GRIT · LEADERSHIP</div>
                <div className="mt-1">© 2026 Blaze Sports Intel. All rights reserved.</div>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row items-center gap-1 sm:gap-2 text-[0.6875rem] sm:text-xs text-muted-foreground">
              <span className="font-mono hidden sm:inline">MCP Server:</span>
              <code className="px-2 py-1 bg-muted/30 rounded font-mono text-primary text-center break-all">
                sabermetrics.blazesportsintel.com
              </code>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;