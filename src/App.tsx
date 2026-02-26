import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Code, Database, Calculator, GitBranch, ChartBar, Pulse, Shapes, ArrowsLeftRight, Users, Trophy, Gear } from '@phosphor-icons/react';
import { APIExplorer } from '@/components/APIExplorer';
import { SchemaViewer } from '@/components/SchemaViewer';
import { MetricsCalculator } from '@/components/MetricsCalculator';
import { ProvenanceTracker } from '@/components/ProvenanceTracker';
import { CoverageDashboard } from '@/components/CoverageDashboard';
import { LiveAPISimulator } from '@/components/LiveAPISimulator';
import { InteractiveERD } from '@/components/InteractiveERD';
import { ComparisonTool } from '@/components/ComparisonTool';
import { PlayerComparison } from '@/components/PlayerComparison';
import { Scoreboard } from '@/components/Scoreboard';
import { KVNamespaceManager } from '@/components/KVNamespaceManager';
import { APISecretsManager } from '@/components/APISecretsManager';

function App() {
  const [activeTab, setActiveTab] = useState('api');

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="sticky top-0 z-50 w-full border-b border-border bg-card/95 backdrop-blur-sm supports-[backdrop-filter]:bg-card/90 shadow-sm">
        <div className="container mx-auto px-6 lg:px-8">
          <div className="flex h-[72px] items-center justify-between gap-6">
            <div className="flex items-center gap-4 flex-1 min-w-0">
              <div className="w-11 h-11 rounded-lg bg-primary flex items-center justify-center shadow-sm shrink-0">
                <Database className="text-primary-foreground" size={24} weight="bold" />
              </div>
              <div className="min-w-0">
                <h1 className="text-[1.125rem] font-semibold tracking-tight text-foreground leading-tight truncate">
                  College Baseball Sabermetrics API
                </h1>
                <p className="text-[0.8125rem] text-muted-foreground font-mono tracking-wide mt-0.5">
                  NCAA Analytics Platform Architecture
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3 shrink-0">
              <Badge variant="outline" className="font-mono text-[0.75rem] px-2.5 py-1 border-success/30 bg-success/10 text-success gap-1.5">
                <Pulse size={12} weight="bold" />
                Mock Environment
              </Badge>
              <Badge variant="outline" className="font-mono text-[0.75rem] px-2.5 py-1">
                v1.0.0
              </Badge>
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1 container mx-auto px-6 lg:px-8 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full space-y-8">
          <TabsList className="inline-flex h-12 w-auto gap-1 bg-muted/50 p-1 rounded-lg">
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
            <TabsTrigger value="players" className="gap-2 px-4 data-[state=active]:bg-card data-[state=active]:shadow-sm rounded-md transition-all">
              <Users size={18} weight="bold" />
              <span className="font-medium text-[0.875rem]">Players</span>
            </TabsTrigger>
            <TabsTrigger value="scoreboard" className="gap-2 px-4 data-[state=active]:bg-card data-[state=active]:shadow-sm rounded-md transition-all">
              <Trophy size={18} weight="bold" />
              <span className="font-medium text-[0.875rem]">Scoreboard</span>
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
            <TabsTrigger value="config" className="gap-2 px-4 data-[state=active]:bg-card data-[state=active]:shadow-sm rounded-md transition-all">
              <Gear size={18} weight="bold" />
              <span className="font-medium text-[0.875rem]">Config</span>
            </TabsTrigger>
          </TabsList>

          <div>
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

            <TabsContent value="players" className="mt-0 space-y-6">
              <PlayerComparison />
            </TabsContent>

            <TabsContent value="scoreboard" className="mt-0 space-y-6">
              <Scoreboard />
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

            <TabsContent value="config" className="mt-0 space-y-6">
              <div className="space-y-6">
                <KVNamespaceManager />
                <APISecretsManager />
              </div>
            </TabsContent>
          </div>
        </Tabs>
      </main>

      <footer className="border-t border-border bg-muted/30 mt-auto">
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
        </div>
      </footer>
    </div>
  );
}

export default App;