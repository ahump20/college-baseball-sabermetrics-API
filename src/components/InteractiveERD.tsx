import { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Database, Table, GitFork, Shuffle, MagnifyingGlassPlus, MagnifyingGlassMinus } from '@phosphor-icons/react';

interface ERDNode {
  id: string;
  name: string;
  layer: 'rights' | 'canonical' | 'game';
  x: number;
  y: number;
  fields: number;
  relationships: number;
}

interface ERDConnection {
  from: string;
  to: string;
  type: 'one-to-many' | 'many-to-one' | 'many-to-many';
}

const nodes: ERDNode[] = [
  { id: 'source_system', name: 'source_system', layer: 'rights', x: 100, y: 100, fields: 5, relationships: 1 },
  { id: 'provenance_field', name: 'provenance_field', layer: 'rights', x: 100, y: 250, fields: 6, relationships: 1 },
  { id: 'canonical_team', name: 'canonical_team', layer: 'canonical', x: 350, y: 50, fields: 5, relationships: 2 },
  { id: 'canonical_player', name: 'canonical_player', layer: 'canonical', x: 350, y: 200, fields: 6, relationships: 2 },
  { id: 'canonical_game', name: 'canonical_game', layer: 'canonical', x: 350, y: 350, fields: 6, relationships: 2 },
  { id: 'entity_mapping', name: 'entity_mapping', layer: 'canonical', x: 350, y: 500, fields: 7, relationships: 3 },
  { id: 'box_player_batting', name: 'box_player_batting_game', layer: 'game', x: 650, y: 150, fields: 8, relationships: 2 },
  { id: 'pbp_event', name: 'pbp_event', layer: 'game', x: 650, y: 350, fields: 8, relationships: 1 },
];

const connections: ERDConnection[] = [
  { from: 'source_system', to: 'entity_mapping', type: 'one-to-many' },
  { from: 'source_system', to: 'provenance_field', type: 'one-to-many' },
  { from: 'canonical_team', to: 'canonical_game', type: 'one-to-many' },
  { from: 'canonical_player', to: 'box_player_batting', type: 'one-to-many' },
  { from: 'canonical_player', to: 'entity_mapping', type: 'one-to-many' },
  { from: 'canonical_game', to: 'box_player_batting', type: 'one-to-many' },
  { from: 'canonical_game', to: 'pbp_event', type: 'one-to-many' },
  { from: 'entity_mapping', to: 'canonical_player', type: 'many-to-one' },
];

export function InteractiveERD() {
  const [selectedNode, setSelectedNode] = useState<string | null>(null);
  const [draggingNode, setDraggingNode] = useState<string | null>(null);
  const [nodePositions, setNodePositions] = useState<Record<string, { x: number; y: number }>>(
    nodes.reduce((acc, node) => ({ ...acc, [node.id]: { x: node.x, y: node.y } }), {})
  );
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const canvasRef = useRef<HTMLDivElement>(null);

  const layerColors = {
    rights: { bg: 'bg-primary/10', border: 'border-primary', text: 'text-primary' },
    canonical: { bg: 'bg-accent/10', border: 'border-accent', text: 'text-accent' },
    game: { bg: 'bg-success/10', border: 'border-success', text: 'text-success' },
  };

  const handleNodeMouseDown = (nodeId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setDraggingNode(nodeId);
    setSelectedNode(nodeId);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (draggingNode && canvasRef.current) {
      const rect = canvasRef.current.getBoundingClientRect();
      const x = (e.clientX - rect.left - pan.x) / zoom;
      const y = (e.clientY - rect.top - pan.y) / zoom;
      
      setNodePositions(prev => ({
        ...prev,
        [draggingNode]: { x, y }
      }));
    }
  };

  const handleMouseUp = () => {
    setDraggingNode(null);
  };

  const getConnectionPath = (from: string, to: string): string => {
    const fromPos = nodePositions[from] || { x: 0, y: 0 };
    const toPos = nodePositions[to] || { x: 0, y: 0 };
    
    const fromX = fromPos.x + 120;
    const fromY = fromPos.y + 40;
    const toX = toPos.x;
    const toY = toPos.y + 40;
    
    const midX = (fromX + toX) / 2;
    
    return `M ${fromX} ${fromY} C ${midX} ${fromY}, ${midX} ${toY}, ${toX} ${toY}`;
  };

  const selectedNodeData = nodes.find(n => n.id === selectedNode);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold mb-2">Interactive Entity-Relationship Diagram</h2>
        <p className="text-muted-foreground">
          Drag nodes to explore the database schema. Visualizes the three-layer architecture with canonical ID mapping and NCAA compliance.
        </p>
      </div>

      <div className="flex items-center gap-3">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setZoom(prev => Math.min(prev + 0.1, 2))}
          className="gap-2"
        >
          <MagnifyingGlassPlus size={16} />
          Zoom In
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setZoom(prev => Math.max(prev - 0.1, 0.5))}
          className="gap-2"
        >
          <MagnifyingGlassMinus size={16} />
          Zoom Out
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            setZoom(1);
            setPan({ x: 0, y: 0 });
            setNodePositions(nodes.reduce((acc, node) => ({ ...acc, [node.id]: { x: node.x, y: node.y } }), {}));
          }}
          className="gap-2"
        >
          <Shuffle size={16} />
          Reset
        </Button>
        <div className="ml-auto text-sm text-muted-foreground">
          Zoom: {(zoom * 100).toFixed(0)}%
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle>Schema Diagram</CardTitle>
            <CardDescription>Click and drag nodes to rearrange</CardDescription>
          </CardHeader>
          <CardContent>
            <div
              ref={canvasRef}
              className="relative w-full h-[600px] border rounded-lg bg-muted/20 overflow-hidden cursor-move"
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
            >
              <div style={{ transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`, transformOrigin: '0 0' }}>
                <svg className="absolute inset-0 w-full h-full pointer-events-none">
                  {connections.map((conn, idx) => (
                    <path
                      key={idx}
                      d={getConnectionPath(conn.from, conn.to)}
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      className="text-border"
                      markerEnd="url(#arrowhead)"
                    />
                  ))}
                  <defs>
                    <marker
                      id="arrowhead"
                      markerWidth="10"
                      markerHeight="7"
                      refX="9"
                      refY="3.5"
                      orient="auto"
                    >
                      <polygon points="0 0, 10 3.5, 0 7" className="fill-border" />
                    </marker>
                  </defs>
                </svg>

                {nodes.map(node => {
                  const pos = nodePositions[node.id] || { x: node.x, y: node.y };
                  const colors = layerColors[node.layer];
                  const isSelected = selectedNode === node.id;
                  
                  return (
                    <div
                      key={node.id}
                      className={`absolute w-60 rounded-lg border-2 ${colors.border} ${colors.bg} cursor-grab active:cursor-grabbing transition-shadow ${
                        isSelected ? 'shadow-lg ring-2 ring-primary' : 'shadow'
                      }`}
                      style={{
                        left: pos.x,
                        top: pos.y,
                      }}
                      onMouseDown={(e) => handleNodeMouseDown(node.id, e)}
                    >
                      <div className="p-3 border-b">
                        <div className="flex items-center gap-2">
                          <Table size={16} className={colors.text} />
                          <code className="text-sm font-mono font-semibold">{node.name}</code>
                        </div>
                        <Badge variant="outline" className="mt-2 text-xs">
                          {node.layer}
                        </Badge>
                      </div>
                      <div className="p-3 text-xs space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="text-muted-foreground">Fields:</span>
                          <span className="font-mono font-semibold">{node.fields}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-muted-foreground">Relationships:</span>
                          <span className="font-mono font-semibold">{node.relationships}</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Legend</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-2">
                <div className={`w-4 h-4 rounded border-2 ${layerColors.rights.border} ${layerColors.rights.bg}`} />
                <span className="text-sm">Rights & Provenance</span>
              </div>
              <div className="flex items-center gap-2">
                <div className={`w-4 h-4 rounded border-2 ${layerColors.canonical.border} ${layerColors.canonical.bg}`} />
                <span className="text-sm">Canonical Data</span>
              </div>
              <div className="flex items-center gap-2">
                <div className={`w-4 h-4 rounded border-2 ${layerColors.game.border} ${layerColors.game.bg}`} />
                <span className="text-sm">Game Data</span>
              </div>
            </CardContent>
          </Card>

          {selectedNodeData && (
            <Card className="border-primary/50 bg-primary/5">
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Database size={16} />
                  Selected Table
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <code className="text-sm font-mono font-semibold">{selectedNodeData.name}</code>
                </div>
                <div className="space-y-1 text-xs">
                  <div>
                    <span className="text-muted-foreground">Layer:</span>{' '}
                    <Badge variant="outline" className="ml-1">{selectedNodeData.layer}</Badge>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Fields:</span>{' '}
                    <span className="font-mono font-semibold">{selectedNodeData.fields}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Relationships:</span>{' '}
                    <span className="font-mono font-semibold">{selectedNodeData.relationships}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <GitFork size={16} />
                Relationships
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-48">
                <div className="space-y-2 text-xs">
                  {connections.map((conn, idx) => (
                    <div key={idx} className="p-2 rounded bg-muted/50 border">
                      <code className="font-mono text-xs">
                        {conn.from} → {conn.to}
                      </code>
                      <div className="text-muted-foreground mt-1">
                        {conn.type}
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </div>
      </div>

      <Card className="border-accent/50 bg-accent/5">
        <CardHeader>
          <CardTitle className="text-base">Key Design Principles</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <div>
            <span className="font-semibold">Canonical IDs:</span> Persistent identifiers for players, teams, and games that never change - only mappings change
          </div>
          <div>
            <span className="font-semibold">ID Mapping Strategy:</span> entity_mapping table tracks cross-source reconciliation with confidence scores and merge history
          </div>
          <div>
            <span className="font-semibold">Provenance Tracking:</span> Field-level lineage showing data source, method (raw/derived/model), and last update timestamp
          </div>
          <div className="pt-2 border-t">
            <span className="font-semibold text-primary">NCAA Compliance:</span> Host-control workflow embedded in canonical_game structure; correction ledger prevents overwrites
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
