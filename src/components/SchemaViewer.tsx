import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Table, Database, GitFork, ShieldCheck } from '@phosphor-icons/react';
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

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold mb-2">Data Model & Schema</h2>
        <p className="text-muted-foreground">
          Interactive visualization of the three-layer architecture: rights/provenance tracking,
          canonical entity resolution with ID mapping, and game data with NCAA compliance.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {Object.entries(layerTables).map(([layer, tableNames]) => (
          <Card key={layer} className="border-2">
            <CardHeader>
              <div className="flex items-center gap-2">
                {layer === 'Rights & Provenance' && <ShieldCheck size={20} />}
                {layer === 'Canonical Data' && <GitFork size={20} />}
                {layer === 'Game Data' && <Database size={20} />}
                <CardTitle className="text-lg">{layer}</CardTitle>
              </div>
              <CardDescription>
                {layer === 'Rights & Provenance' &&
                  'Track data sources, licensing, and field lineage'}
                {layer === 'Canonical Data' &&
                  'Resolve identities across systems with confidence scoring'}
                {layer === 'Game Data' && 'Store box scores, play-by-play, and tracking data'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {tableNames.map((tableName) => {
                  const table = schemaTables.find((t) => t.name === tableName);
                  if (!table) return null;
                  return (
                    <button
                      key={table.name}
                      onClick={() => setSelectedTable(table)}
                      className={`w-full text-left p-3 rounded-lg border transition-all ${
                        selectedTable?.name === table.name
                          ? 'bg-primary/10 border-primary'
                          : 'bg-card hover:bg-muted border-border'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <Table size={16} />
                        <code className="text-sm font-mono">{table.name}</code>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                        {table.purpose}
                      </p>
                    </button>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {selectedTable && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="font-mono">{selectedTable.name}</CardTitle>
                <CardDescription>{selectedTable.purpose}</CardDescription>
              </div>
              <Badge variant="outline" className="font-mono">
                PK: {selectedTable.primaryKey}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-3">Fields</h3>
              <ScrollArea className="h-64">
                <div className="space-y-2">
                  {selectedTable.fields.map((field) => (
                    <div
                      key={field.name}
                      className="p-3 rounded-lg border bg-card flex items-start gap-3"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <code className="font-mono text-sm font-semibold">{field.name}</code>
                          <Badge variant="secondary" className="text-xs font-mono">
                            {field.type}
                          </Badge>
                          {field.nullable && (
                            <Badge variant="outline" className="text-xs">
                              nullable
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">{field.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </div>

            {selectedTable.relationships.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold mb-3">Relationships</h3>
                <div className="space-y-2">
                  {selectedTable.relationships.map((rel, idx) => (
                    <div key={idx} className="p-3 rounded-lg border bg-muted/50">
                      <div className="flex items-center gap-2">
                        <Badge className="text-xs font-mono">{rel.type}</Badge>
                        <span className="text-sm">→</span>
                        <code className="text-sm font-mono font-semibold">{rel.target}</code>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">{rel.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {selectedTable.notes && (
              <div className="p-4 rounded-lg bg-accent/10 border border-accent/20">
                <p className="text-sm">
                  <span className="font-semibold">Note:</span> {selectedTable.notes}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
