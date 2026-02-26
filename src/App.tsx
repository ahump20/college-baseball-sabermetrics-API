import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 w-full border-b bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/60">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center">
                <Database className="text-primary-foreground" size={24} />
              </div>
              <div>
                <h1 className="text-lg font-semibold">College Baseball Sabermetrics API</h1>
                <p className="text-xs text-muted-foreground">
                  NCAA Analytics Platform Architecture
                </p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-9 lg:w-auto lg:inline-grid">
            <TabsTrigger value="api" className="gap-2">
              <Code size={16} />
              <span className="hidden sm:inline">API</span>
            </TabsTrigger>
            <TabsTrigger value="schema" className="gap-2">
              <Database size={16} />
              <span className="hidden sm:inline">Schema</span>
            </TabsTrigger>
            <TabsTrigger value="erd" className="gap-2">
              <Shapes size={16} />
              <span className="hidden sm:inline">ERD</span>
            </TabsTrigger>
            <TabsTrigger value="metrics" className="gap-2">
              <Calculator size={16} />
              <span className="hidden sm:inline">Analytics</span>
            </TabsTrigger>
            <TabsTrigger value="comparison" className="gap-2">
              <ArrowsLeftRight size={16} />
              <span className="hidden sm:inline">Compare</span>
            </TabsTrigger>
            <TabsTrigger value="players" className="gap-2">
              <Users size={16} />
              <span className="hidden sm:inline">Players</span>
            </TabsTrigger>
            <TabsTrigger value="live" className="gap-2">
              <Pulse size={16} />
              <span className="hidden sm:inline">Live API</span>
            </TabsTrigger>
            <TabsTrigger value="provenance" className="gap-2">
              <GitBranch size={16} />
              <span className="hidden sm:inline">Provenance</span>
            </TabsTrigger>
            <TabsTrigger value="coverage" className="gap-2">
              <ChartBar size={16} />
              <span className="hidden sm:inline">Coverage</span>
            </TabsTrigger>
          </TabsList>

          <div className="mt-8">
            <TabsContent value="api" className="mt-0">
              <APIExplorer />
            </TabsContent>

            <TabsContent value="schema" className="mt-0">
              <SchemaViewer />
            </TabsContent>

            <TabsContent value="erd" className="mt-0">
              <InteractiveERD />
            </TabsContent>

            <TabsContent value="metrics" className="mt-0">
              <MetricsCalculator />
            </TabsContent>

            <TabsContent value="comparison" className="mt-0">
              <ComparisonTool />
            </TabsContent>

            <TabsContent value="players" className="mt-0">
              <PlayerComparison />
            </TabsContent>

            <TabsContent value="live" className="mt-0">
              <LiveAPISimulator />
            </TabsContent>

            <TabsContent value="provenance" className="mt-0">
              <ProvenanceTracker />
            </TabsContent>

            <TabsContent value="coverage" className="mt-0">
              <CoverageDashboard />
            </TabsContent>
          </div>
        </Tabs>
      </main>

      <footer className="border-t mt-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-sm">
            <div>
              <h3 className="font-semibold mb-3">Architecture Layers</h3>
              <ul className="space-y-2 text-muted-foreground">
                <li>• Rights & Provenance Tracking</li>
                <li>• Canonical ID Mapping</li>
                <li>• Advanced Sabermetrics</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-3">NCAA Compliance</h3>
              <ul className="space-y-2 text-muted-foreground">
                <li>• Host-Official Rule</li>
                <li>• Box Score Proofing</li>
                <li>• Correction Workflows</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-3">Key Features</h3>
              <ul className="space-y-2 text-muted-foreground">
                <li>• Coverage-Aware Metrics</li>
                <li>• Context Adjustments</li>
                <li>• Model Versioning</li>
              </ul>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;