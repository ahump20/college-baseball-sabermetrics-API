import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Code, Database, Calculator, GitBranch, ChartBar, Pulse, Shapes, ArrowsLeftRight, Users } from '@phosphor-icons/react';
import { APIExplorer } from '@/components/APIExplorer';
import { SchemaViewer } from '@/components/SchemaViewer';
import { MetricsCalculator } from '@/components/MetricsCalculator';
import { ProvenanceTracker } from '@/components/ProvenanceTracker';
import { CoverageDashboard } from '@/components/CoverageDashboard';
import { LiveAPISimulator } from '@/components/LiveAPISimulator';
import { InteractiveERD } from '@/components/InteractiveERD';
import { ComparisonTool } from '@/components/ComparisonTool';
import { PlayerComparison } from '@/components/PlayerComparison';

function App() {
  const [activeTab, setActiveTab] = useState('api');

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="sticky top-0 z-50 w-full border-b border-border bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/80">
        <div className="container mx-auto px-6 lg:px-8">
          <div className="flex h-20 items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-lg bg-primary flex items-center justify-center shadow-sm">
                <Database className="text-primary-foreground" size={26} weight="bold" />
              </div>
              <div>
                <h1 className="text-xl font-semibold tracking-tight">College Baseball Sabermetrics API</h1>
                <p className="text-sm text-muted-foreground font-mono">
                  NCAA Analytics Platform Architecture
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Badge variant="outline" className="font-mono text-xs border-success/30 bg-success/10 text-success">
                <Pulse size={12} weight="bold" className="mr-1.5" />
                Mock Environment
              </Badge>
              <Badge variant="outline" className="font-mono text-xs">
                v1.0.0
              </Badge>
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1 container mx-auto px-6 lg:px-8 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full space-y-6">
          <TabsList className="inline-flex h-11 w-auto gap-1 bg-muted/50 p-1">
            <TabsTrigger value="api" className="gap-2 data-[state=active]:bg-card data-[state=active]:shadow-sm">
              <Code size={16} weight="bold" />
              <span className="font-medium">API Explorer</span>
            </TabsTrigger>
            <TabsTrigger value="schema" className="gap-2 data-[state=active]:bg-card data-[state=active]:shadow-sm">
              <Database size={16} weight="bold" />
              <span className="font-medium">Schema</span>
            </TabsTrigger>
            <TabsTrigger value="erd" className="gap-2 data-[state=active]:bg-card data-[state=active]:shadow-sm">
              <Shapes size={16} weight="bold" />
              <span className="font-medium">ERD</span>
            </TabsTrigger>
            <TabsTrigger value="metrics" className="gap-2 data-[state=active]:bg-card data-[state=active]:shadow-sm">
              <Calculator size={16} weight="bold" />
              <span className="font-medium">Analytics</span>
            </TabsTrigger>
            <TabsTrigger value="comparison" className="gap-2 data-[state=active]:bg-card data-[state=active]:shadow-sm">
              <ArrowsLeftRight size={16} weight="bold" />
              <span className="font-medium">Compare</span>
            </TabsTrigger>
            <TabsTrigger value="players" className="gap-2 data-[state=active]:bg-card data-[state=active]:shadow-sm">
              <Users size={16} weight="bold" />
              <span className="font-medium">Players</span>
            </TabsTrigger>
            <TabsTrigger value="live" className="gap-2 data-[state=active]:bg-card data-[state=active]:shadow-sm">
              <Pulse size={16} weight="bold" />
              <span className="font-medium">Live API</span>
            </TabsTrigger>
            <TabsTrigger value="provenance" className="gap-2 data-[state=active]:bg-card data-[state=active]:shadow-sm">
              <GitBranch size={16} weight="bold" />
              <span className="font-medium">Provenance</span>
            </TabsTrigger>
            <TabsTrigger value="coverage" className="gap-2 data-[state=active]:bg-card data-[state=active]:shadow-sm">
              <ChartBar size={16} weight="bold" />
              <span className="font-medium">Coverage</span>
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

      <footer className="border-t border-border bg-muted/30 mt-auto">
        <div className="container mx-auto px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            <div>
              <h3 className="font-semibold text-base mb-4">Architecture Layers</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-0.5">•</span>
                  <span>Rights & Provenance Tracking</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-0.5">•</span>
                  <span>Canonical ID Mapping</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-0.5">•</span>
                  <span>Advanced Sabermetrics</span>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-base mb-4">NCAA Compliance</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-0.5">•</span>
                  <span>Host-Official Rule</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-0.5">•</span>
                  <span>Box Score Proofing</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-0.5">•</span>
                  <span>Correction Workflows</span>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-base mb-4">Key Features</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-0.5">•</span>
                  <span>Coverage-Aware Metrics</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-0.5">•</span>
                  <span>Context Adjustments</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-0.5">•</span>
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