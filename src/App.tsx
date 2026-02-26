import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Code, Database, Calculator, GitBranch, ChartBar, Pulse, Shapes, ArrowsLeftRight, Users, Baseball, Flame, Key, ListNumbers, User } from '@phosphor-icons/react';
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
import { PageLoading } from '@/components/Loading';
import { usePageLoading } from '@/hooks/use-loading';
import blazeLogo from '@/assets/images/bsi-shield-blaze.webp';

function App() {
  const [activeTab, setActiveTab] = useState('games');
  const [isInitialLoading] = usePageLoading(true, 1200);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="sticky top-0 z-50 w-full border-b border-border bg-card/95 backdrop-blur-md supports-[backdrop-filter]:bg-card/90">
        <div className="container mx-auto px-6 lg:px-8">
          <div className="flex h-24 items-center justify-between gap-8">
            <div className="flex items-center gap-4 flex-1 min-w-0">
              <img 
                src={blazeLogo} 
                alt="Blaze Sports Intel" 
                className="h-16 w-auto shrink-0"
              />
              <div className="min-w-0 border-l border-border/50 pl-4">
                <h1 className="text-[1.25rem] font-semibold tracking-tight text-foreground leading-tight truncate">
                  College Baseball Sabermetrics API
                </h1>
                <p className="text-[0.8125rem] text-muted-foreground font-mono mt-0.5">
                  Production-Grade NCAA Analytics Platform
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3 shrink-0">
              <Badge variant="outline" className="font-mono text-[0.75rem] px-3 py-1.5 border-success/30 bg-success/10 text-success gap-1.5 hidden sm:flex">
                <Pulse size={12} weight="bold" />
                Live Data
              </Badge>
              <Badge variant="outline" className="font-mono text-[0.75rem] px-3 py-1.5 border-primary/30 bg-primary/10 text-primary gap-1.5 hidden sm:flex">
                <Flame size={12} weight="bold" />
                v1.0.0
              </Badge>
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1 container mx-auto px-6 lg:px-8 py-12">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <div className="mb-8 overflow-x-auto">
            <TabsList className="inline-flex h-12 w-auto gap-1 bg-muted/50 p-1 rounded-lg">
              <TabsTrigger value="games" className="gap-2 px-4 data-[state=active]:bg-card data-[state=active]:shadow-sm rounded-md transition-all">
                <Baseball size={18} weight="bold" />
                <span className="font-medium text-[0.875rem]">Games</span>
              </TabsTrigger>
              <TabsTrigger value="api-docs" className="gap-2 px-4 data-[state=active]:bg-card data-[state=active]:shadow-sm rounded-md transition-all">
                <Key size={18} weight="bold" />
                <span className="font-medium text-[0.875rem]">API Docs</span>
              </TabsTrigger>
              <TabsTrigger value="api" className="gap-2 px-4 data-[state=active]:bg-card data-[state=active]:shadow-sm rounded-md transition-all">
                <Code size={18} weight="bold" />
                <span className="font-medium text-[0.875rem]">API Explorer</span>
              </TabsTrigger>
              <TabsTrigger value="schema" className="gap-2 px-4 data-[state=active]:bg-card data-[state=active]:shadow-sm rounded-md transition-all">
                <Database size={18} weight="bold" />
                <span className="font-medium text-[0.875rem]">Schema</span>
              </TabsTrigger>
              <TabsTrigger value="erd" className="gap-2 px-4 data-[state=active]:bg-card data-[state=active]:shadow-sm rounded-md transition-all">
                <Shapes size={18} weight="bold" />
                <span className="font-medium text-[0.875rem]">ERD</span>
              </TabsTrigger>
              <TabsTrigger value="metrics" className="gap-2 px-4 data-[state=active]:bg-card data-[state=active]:shadow-sm rounded-md transition-all">
                <Calculator size={18} weight="bold" />
                <span className="font-medium text-[0.875rem]">Analytics</span>
              </TabsTrigger>
              <TabsTrigger value="comparison" className="gap-2 px-4 data-[state=active]:bg-card data-[state=active]:shadow-sm rounded-md transition-all">
                <ArrowsLeftRight size={18} weight="bold" />
                <span className="font-medium text-[0.875rem]">Compare</span>
              </TabsTrigger>
              <TabsTrigger value="leaderboards" className="gap-2 px-4 data-[state=active]:bg-card data-[state=active]:shadow-sm rounded-md transition-all">
                <ListNumbers size={18} weight="bold" />
                <span className="font-medium text-[0.875rem]">Leaderboards</span>
              </TabsTrigger>
              <TabsTrigger value="players" className="gap-2 px-4 data-[state=active]:bg-card data-[state=active]:shadow-sm rounded-md transition-all">
                <Users size={18} weight="bold" />
                <span className="font-medium text-[0.875rem]">Players</span>
              </TabsTrigger>
              <TabsTrigger value="profiles" className="gap-2 px-4 data-[state=active]:bg-card data-[state=active]:shadow-sm rounded-md transition-all">
                <User size={18} weight="bold" />
                <span className="font-medium text-[0.875rem]">Profiles</span>
              </TabsTrigger>
              <TabsTrigger value="live" className="gap-2 px-4 data-[state=active]:bg-card data-[state=active]:shadow-sm rounded-md transition-all">
                <Pulse size={18} weight="bold" />
                <span className="font-medium text-[0.875rem]">Live API</span>
              </TabsTrigger>
              <TabsTrigger value="provenance" className="gap-2 px-4 data-[state=active]:bg-card data-[state=active]:shadow-sm rounded-md transition-all">
                <GitBranch size={18} weight="bold" />
                <span className="font-medium text-[0.875rem]">Provenance</span>
              </TabsTrigger>
              <TabsTrigger value="coverage" className="gap-2 px-4 data-[state=active]:bg-card data-[state=active]:shadow-sm rounded-md transition-all">
                <ChartBar size={18} weight="bold" />
                <span className="font-medium text-[0.875rem]">Coverage</span>
              </TabsTrigger>
            </TabsList>
          </div>

          <div>
            <TabsContent value="games" className="mt-0 space-y-6">
              <GameScoreboard />
            </TabsContent>

            <TabsContent value="api-docs" className="mt-0 space-y-6">
              <APIAccessDocs />
            </TabsContent>

            <TabsContent value="api" className="mt-0 space-y-6">
              <APIExplorer />
            </TabsContent>

            <TabsContent value="schema" className="mt-0 space-y-6">
              <SchemaViewer />
            </TabsContent>

            <TabsContent value="erd" className="mt-0 space-y-6">
              <InteractiveERD />
            </TabsContent>

            <TabsContent value="metrics" className="mt-0 space-y-6">
              <MetricsCalculator />
            </TabsContent>

            <TabsContent value="comparison" className="mt-0 space-y-6">
              <ComparisonTool />
            </TabsContent>

            <TabsContent value="leaderboards" className="mt-0 space-y-6">
              <PlayerLeaderboards />
            </TabsContent>

            <TabsContent value="players" className="mt-0 space-y-6">
              <PlayerComparison />
            </TabsContent>

            <TabsContent value="profiles" className="mt-0 space-y-6">
              <PlayerProfile />
            </TabsContent>

            <TabsContent value="live" className="mt-0 space-y-6">
              <LiveAPISimulator />
            </TabsContent>

            <TabsContent value="provenance" className="mt-0 space-y-6">
              <ProvenanceTracker />
            </TabsContent>

            <TabsContent value="coverage" className="mt-0 space-y-6">
              <CoverageDashboard />
            </TabsContent>
          </div>
        </Tabs>
      </main>

      <footer className="border-t border-border bg-card/50 mt-auto">
        <div className="container mx-auto px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            <div>
              <h3 className="font-semibold text-[1rem] mb-4 text-foreground">Architecture Layers</h3>
              <ul className="space-y-3 text-[0.875rem] text-muted-foreground">
                <li className="flex items-start gap-2.5">
                  <span className="text-primary mt-0.5 font-bold">•</span>
                  <span>Rights & Provenance Tracking</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="text-primary mt-0.5 font-bold">•</span>
                  <span>Canonical ID Mapping</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="text-primary mt-0.5 font-bold">•</span>
                  <span>Advanced Sabermetrics</span>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-[1rem] mb-4 text-foreground">NCAA Compliance</h3>
              <ul className="space-y-3 text-[0.875rem] text-muted-foreground">
                <li className="flex items-start gap-2.5">
                  <span className="text-primary mt-0.5 font-bold">•</span>
                  <span>Host-Official Rule</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="text-primary mt-0.5 font-bold">•</span>
                  <span>Box Score Proofing</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="text-primary mt-0.5 font-bold">•</span>
                  <span>Correction Workflows</span>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-[1rem] mb-4 text-foreground">Key Features</h3>
              <ul className="space-y-3 text-[0.875rem] text-muted-foreground">
                <li className="flex items-start gap-2.5">
                  <span className="text-primary mt-0.5 font-bold">•</span>
                  <span>Coverage-Aware Metrics</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="text-primary mt-0.5 font-bold">•</span>
                  <span>Context Adjustments</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="text-primary mt-0.5 font-bold">•</span>
                  <span>Model Versioning</span>
                </li>
              </ul>
            </div>
          </div>
          <div className="mt-12 pt-8 border-t border-border/50 flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <img 
                src={blazeLogo} 
                alt="Blaze Sports Intel" 
                className="h-12 w-auto opacity-80"
              />
              <div className="text-[0.75rem] text-muted-foreground">
                <div className="font-mono">COURAGE · GRIT · LEADERSHIP</div>
                <div className="mt-1">© 2026 Blaze Sports Intel. All rights reserved.</div>
              </div>
            </div>
            <div className="flex items-center gap-2 text-[0.75rem] text-muted-foreground">
              <span className="font-mono">MCP Server:</span>
              <code className="px-2 py-1 bg-muted/30 rounded font-mono text-primary">
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