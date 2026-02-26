import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Table, Database, GitFork, ShieldCheck } from '@phosphor-icons/react';
import { PageHeader } from '@/components/PageHeader';
import { schemaTables } from '@/lib/data';
import type { SchemaTable } from '@/lib/types';

export function SchemaViewer() {
  const [selectedTable, setSelectedTable] = useState<SchemaTable | null>(null);

  const layerTables = {
    'Rights & Provenance': ['source_system', 'provenance_field'],
    'Canonical Data': [
      'canonical_team',
      'canonical_player',
      'canonical_game',
      'entity_mapping',
    ],
    'Game Data': ['box_player_batting_game', 'pbp_event'],
  };

  const layerIcons = {
    'Rights & Provenance': ShieldCheck,
    'Canonical Data': GitFork,
    'Game Data': Database,
  };

  return (
    <div className="space-y-12">
      <PageHeader
        title="Data Model & Schema"
        description="Interactive visualization of the three-layer architecture: rights/provenance tracking, canonical entity resolution with ID mapping, and game data with NCAA compliance."
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {Object.entries(layerTables).map(([layer, tableNames]) => {
          const Icon = layerIcons[layer as keyof typeof layerIcons];
          return (
            <Card key={layer} className="border-2 hover:border-primary/20 transition-colors">
              <CardHeader className="p-6">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                    <Icon size={20} className="text-primary" weight="bold" />
                  </div>
                  <CardTitle className="text-[1.125rem] font-semibold leading-tight">{layer}</CardTitle>
                </div>
                <CardDescription className="text-[0.875rem] leading-[1.5]">
                  {layer === 'Rights & Provenance' &&
                    'Track data sources, licensing, and field lineage'}
                  {layer === 'Canonical Data' &&
                    'Resolve identities across systems with confidence scoring'}
                  {layer === 'Game Data' && 'Store box scores, play-by-play, and tracking data'}
                </CardDescription>
              </CardHeader>
              <CardContent className="p-6 pt-0">
                <div className="space-y-2">
                  {tableNames.map((tableName) => {
                    const table = schemaTables.find((t) => t.name === tableName);
                    if (!table) return null;
                    return (
                      <button
                        key={table.name}
                        onClick={() => setSelectedTable(table)}
                        className={`w-full text-left p-4 rounded-lg border transition-all ${
                          selectedTable?.name === table.name
                            ? 'bg-primary/10 border-primary shadow-sm'
                            : 'bg-card hover:bg-muted/50 border-border hover:border-border/80'
                        }`}
                      >
                        <div className="flex items-center gap-2 mb-1">
                          <Table size={16} weight="bold" className="shrink-0" />
                          <code className="text-[0.8125rem] font-mono font-semibold">{table.name}</code>
                        </div>
                        <p className="text-xs text-muted-foreground leading-[1.4] line-clamp-2">
                          {table.purpose}
                        </p>
                      </button>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {selectedTable && (
        <Card className="border-2">
          <CardHeader className="p-6 border-b border-border">
            <div className="flex items-start justify-between gap-6">
              <div className="flex-1">
                <CardTitle className="font-mono text-[1.5rem] leading-tight tracking-[-0.01em] mb-2">
                  {selectedTable.name}
                </CardTitle>
                <CardDescription className="text-[0.875rem] leading-[1.5]">
                  {selectedTable.purpose}
                </CardDescription>
              </div>
              <Badge variant="outline" className="font-mono text-xs px-3 py-1.5 shrink-0">
                PK: {selectedTable.primaryKey}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-8">
              <div>
                <h3 className="text-[1.125rem] font-medium text-foreground mb-4">Fields</h3>
                <ScrollArea className="h-80">
                  <div className="space-y-3 pr-4">
                    {selectedTable.fields.map((field) => (
                      <div
                        key={field.name}
                        className="p-4 rounded-lg border bg-card hover:bg-muted/30 transition-colors"
                      >
                        <div className="flex items-start gap-3">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 flex-wrap mb-2">
                              <code className="font-mono text-[0.875rem] font-semibold text-foreground">
                                {field.name}
                              </code>
                              <Badge variant="secondary" className="text-xs font-mono px-2 py-0.5">
                                {field.type}
                              </Badge>
                              {field.nullable && (
                                <Badge variant="outline" className="text-xs px-2 py-0.5">
                                  nullable
                                </Badge>
                              )}
                            </div>
                            <p className="text-[0.875rem] text-muted-foreground leading-[1.5]">
                              {field.description}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </div>

              {selectedTable.relationships.length > 0 && (
                <div>
                  <h3 className="text-[1.125rem] font-medium text-foreground mb-4">Relationships</h3>
                  <div className="space-y-3">
                    {selectedTable.relationships.map((rel, idx) => (
                      <div key={idx} className="p-4 rounded-lg border bg-muted/30">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge variant="default" className="text-xs font-mono px-2 py-0.5">
                            {rel.type}
                          </Badge>
                          <span className="text-sm text-muted-foreground">→</span>
                          <code className="text-[0.875rem] font-mono font-semibold text-foreground">
                            {rel.target}
                          </code>
                        </div>
                        <p className="text-[0.875rem] text-muted-foreground leading-[1.5]">
                          {rel.description}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {selectedTable.notes && (
                <div className="p-4 rounded-lg bg-accent/10 border border-accent/20">
                  <p className="text-[0.875rem] leading-[1.6]">
                    <span className="font-semibold text-foreground">Note:</span>{' '}
                    <span className="text-muted-foreground">{selectedTable.notes}</span>
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
