import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Database, ChartBar, Users, Trophy, Pulse, Code, Calculator, Shapes, GitBranch, ArrowsLeftRight, ChartLine, Baseball, Gear } from '@phosphor-icons/react';
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

type ViewType = 'dashboard' | 'api' | 'schema' | 'erd' | 'analytics' | 'comparison' | 'players' | 'games' | 'live' | 'provenance' | 'coverage' | 'config';

function App() {
  const [currentView, setCurrentView] = useState<ViewType>('dashboard');

  const navItems = [
    { id: 'dashboard' as ViewType, label: 'Overview', icon: ChartLine },
    { id: 'api' as ViewType, label: 'API', icon: Code },
    { id: 'analytics' as ViewType, label: 'Analytics', icon: Calculator },
    { id: 'players' as ViewType, label: 'Players', icon: Users },
    { id: 'games' as ViewType, label: 'Games', icon: Trophy },
    { id: 'schema' as ViewType, label: 'Data Model', icon: Database },
    { id: 'coverage' as ViewType, label: 'Coverage', icon: ChartBar },
    { id: 'config' as ViewType, label: 'Settings', icon: Gear },
  ];

  const quickActions = [
    { label: 'Explore API Endpoints', view: 'api' as ViewType, icon: Code, description: 'Interactive API documentation with live examples' },
    { label: 'Calculate Metrics', view: 'analytics' as ViewType, icon: Calculator, description: 'Advanced sabermetrics with context adjustments' },
    { label: 'Compare Players', view: 'players' as ViewType, icon: ArrowsLeftRight, description: 'Side-by-side player performance analysis' },
    { label: 'View Data Model', view: 'schema' as ViewType, icon: Shapes, description: 'Explore the three-layer architecture' },
  ];

  const platformStats = [
    { label: 'Total Endpoints', value: '47', icon: Code, color: 'text-primary' },
    { label: 'Data Tables', value: '23', icon: Database, color: 'text-accent' },
    { label: 'Advanced Metrics', value: '38', icon: Calculator, color: 'text-secondary' },
    { label: 'Active Players', value: '1,247', icon: Users, color: 'text-success' },
  ];

  return (
    <div className="min-h-screen bg-background flex">
      <aside className="w-64 border-r border-border bg-card flex flex-col shrink-0">
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
                onClick={() => setCurrentView(item.id)}
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
            Mock Environment
          </Badge>
        </div>
      </aside>

      <main className="flex-1 flex flex-col overflow-hidden">
        <header className="border-b border-border bg-card px-8 py-5">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-[1.5rem] font-semibold text-foreground tracking-tight">
                {currentView === 'dashboard' && 'Platform Overview'}
                {currentView === 'api' && 'API Explorer'}
                {currentView === 'analytics' && 'Analytics & Metrics'}
                {currentView === 'players' && 'Player Performance'}
                {currentView === 'games' && 'Game Scoreboard'}
                {currentView === 'schema' && 'Data Model & Architecture'}
                {currentView === 'coverage' && 'Data Coverage Dashboard'}
                {currentView === 'config' && 'Configuration & Settings'}
              </h2>
              <p className="text-[0.875rem] text-muted-foreground mt-1">
                {currentView === 'dashboard' && 'NCAA Baseball Analytics Platform Architecture'}
                {currentView === 'api' && 'Interactive endpoint documentation with live examples'}
                {currentView === 'analytics' && 'Advanced sabermetrics with context adjustments'}
                {currentView === 'players' && 'Compare and analyze player statistics'}
                {currentView === 'games' && 'Live scores and game results'}
                {currentView === 'schema' && 'Three-layer architecture with provenance tracking'}
                {currentView === 'coverage' && 'Data availability across divisions and conferences'}
                {currentView === 'config' && 'KV namespaces and API authentication'}
              </p>
            </div>
            <Badge variant="outline" className="font-mono text-[0.75rem] px-2.5 py-1">
              v1.0.0
            </Badge>
          </div>
        </header>

        <div className="flex-1 overflow-auto p-8">
          {currentView === 'dashboard' && (
            <div className="space-y-8 max-w-7xl">
              <div className="grid grid-cols-4 gap-6">
                {platformStats.map((stat) => {
                  const Icon = stat.icon;
                  return (
                    <Card key={stat.label} className="p-6">
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="text-[0.8125rem] text-muted-foreground font-medium mb-1">
                            {stat.label}
                          </p>
                          <p className="text-[2rem] font-semibold text-foreground leading-none">
                            {stat.value}
                          </p>
                        </div>
                        <div className={`${stat.color}`}>
                          <Icon size={24} weight="bold" />
                        </div>
                      </div>
                    </Card>
                  );
                })}
              </div>

              <div>
                <h3 className="text-[1.25rem] font-semibold text-foreground mb-4">Quick Actions</h3>
                <div className="grid grid-cols-2 gap-6">
                  {quickActions.map((action) => {
                    const Icon = action.icon;
                    return (
                      <Card key={action.label} className="p-6 hover:shadow-lg transition-shadow cursor-pointer" onClick={() => setCurrentView(action.view)}>
                        <div className="flex items-start gap-4">
                          <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                            <Icon className="text-primary" size={24} weight="bold" />
                          </div>
                          <div className="flex-1">
                            <h4 className="text-[1rem] font-semibold text-foreground mb-1">
                              {action.label}
                            </h4>
                            <p className="text-[0.875rem] text-muted-foreground">
                              {action.description}
                            </p>
                          </div>
                        </div>
                      </Card>
                    );
                  })}
                </div>
              </div>

              <div>
                <h3 className="text-[1.25rem] font-semibold text-foreground mb-4">Platform Architecture</h3>
                <Card className="p-8">
                  <div className="grid grid-cols-3 gap-8">
                    <div>
                      <div className="flex items-center gap-2 mb-4">
                        <div className="w-8 h-8 rounded-md bg-primary/10 flex items-center justify-center">
                          <GitBranch className="text-primary" size={16} weight="bold" />
                        </div>
                        <h4 className="text-[1rem] font-semibold text-foreground">Provenance Layer</h4>
                      </div>
                      <ul className="space-y-2 text-[0.875rem] text-muted-foreground">
                        <li className="flex items-start gap-2">
                          <span className="text-primary mt-0.5">•</span>
                          <span>Rights & source tracking</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-primary mt-0.5">•</span>
                          <span>NCAA compliance workflows</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-primary mt-0.5">•</span>
                          <span>Correction audit trails</span>
                        </li>
                      </ul>
                    </div>

                    <div>
                      <div className="flex items-center gap-2 mb-4">
                        <div className="w-8 h-8 rounded-md bg-accent/10 flex items-center justify-center">
                          <Database className="text-accent" size={16} weight="bold" />
                        </div>
                        <h4 className="text-[1rem] font-semibold text-foreground">Canonical Data</h4>
                      </div>
                      <ul className="space-y-2 text-[0.875rem] text-muted-foreground">
                        <li className="flex items-start gap-2">
                          <span className="text-primary mt-0.5">•</span>
                          <span>Universal ID mapping</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-primary mt-0.5">•</span>
                          <span>Multi-source reconciliation</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-primary mt-0.5">•</span>
                          <span>Host-official status</span>
                        </li>
                      </ul>
                    </div>

                    <div>
                      <div className="flex items-center gap-2 mb-4">
                        <div className="w-8 h-8 rounded-md bg-secondary/10 flex items-center justify-center">
                          <Calculator className="text-secondary" size={16} weight="bold" />
                        </div>
                        <h4 className="text-[1rem] font-semibold text-foreground">Analytics Engine</h4>
                      </div>
                      <ul className="space-y-2 text-[0.875rem] text-muted-foreground">
                        <li className="flex items-start gap-2">
                          <span className="text-primary mt-0.5">•</span>
                          <span>Context-adjusted metrics</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-primary mt-0.5">•</span>
                          <span>Coverage-aware calculations</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-primary mt-0.5">•</span>
                          <span>Model versioning</span>
                        </li>
                      </ul>
                    </div>
                  </div>
                </Card>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <Card className="p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <ChartBar className="text-primary" size={20} weight="bold" />
                    <h4 className="text-[1rem] font-semibold text-foreground">Data Coverage</h4>
                  </div>
                  <p className="text-[0.875rem] text-muted-foreground mb-4">
                    Track data availability across divisions, conferences, and tracking systems
                  </p>
                  <Button onClick={() => setCurrentView('coverage')} variant="outline" size="sm" className="w-full">
                    View Coverage Dashboard
                  </Button>
                </Card>

                <Card className="p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <Pulse className="text-accent" size={20} weight="bold" />
                    <h4 className="text-[1rem] font-semibold text-foreground">Live API Simulator</h4>
                  </div>
                  <p className="text-[0.875rem] text-muted-foreground mb-4">
                    Test real-time API requests with mock data and response examples
                  </p>
                  <Button onClick={() => setCurrentView('live')} variant="outline" size="sm" className="w-full">
                    Launch Simulator
                  </Button>
                </Card>
              </div>
            </div>
          )}

          {currentView === 'api' && <APIExplorer />}
          {currentView === 'schema' && (
            <div className="space-y-6">
              <div className="flex gap-4 border-b border-border pb-4">
                <Button variant="outline" size="sm" onClick={() => setCurrentView('schema')}>
                  Schema Details
                </Button>
                <Button variant="outline" size="sm" onClick={() => setCurrentView('erd')}>
                  ERD Diagram
                </Button>
              </div>
              <SchemaViewer />
            </div>
          )}
          {currentView === 'erd' && <InteractiveERD />}
          {currentView === 'analytics' && (
            <div className="space-y-6">
              <div className="flex gap-4 border-b border-border pb-4">
                <Button variant="outline" size="sm">
                  Metrics Calculator
                </Button>
                <Button variant="outline" size="sm" onClick={() => setCurrentView('comparison')}>
                  Comparison Tool
                </Button>
              </div>
              <MetricsCalculator />
            </div>
          )}
          {currentView === 'comparison' && <ComparisonTool />}
          {currentView === 'players' && <PlayerComparison />}
          {currentView === 'games' && <Scoreboard />}
          {currentView === 'live' && <LiveAPISimulator />}
          {currentView === 'provenance' && <ProvenanceTracker />}
          {currentView === 'coverage' && <CoverageDashboard />}
          {currentView === 'config' && (
            <div className="space-y-6 max-w-5xl">
              <KVNamespaceManager />
              <APISecretsManager />
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

export default App;