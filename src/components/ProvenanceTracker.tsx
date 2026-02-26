import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Clock, FileText, ShieldCheck, GitBranch } from '@phosphor-icons/react';
import { gameProvenance } from '@/lib/data';

export function ProvenanceTracker() {
  const statusColors = {
    provisional: 'bg-warning/10 text-warning border-warning/20',
    official: 'bg-success/10 text-success border-success/20',
    corrected: 'bg-accent/10 text-accent border-accent/20',
  };

  const eventTypeIcons = {
    initial: <FileText size={20} />,
    correction: <GitBranch size={20} />,
    validation: <ShieldCheck size={20} />,
  };

  const sourceTypeColors = {
    licensed: 'bg-primary/10 text-primary border-primary/20',
    public: 'bg-secondary text-secondary-foreground',
    internal: 'bg-muted text-muted-foreground',
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold mb-2">Provenance & Correction Tracking</h2>
        <p className="text-muted-foreground">
          Visualize data lineage and correction history demonstrating NCAA's host-official rule and
          the progression from provisional to official status with full audit trail.
        </p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="font-mono">Game {gameProvenance.gameId}</CardTitle>
              <CardDescription className="mt-2">
                Texas Longhorns vs Oklahoma Sooners • March 1, 2026
              </CardDescription>
            </div>
            <Badge className={`${statusColors[gameProvenance.status]} border text-sm px-3 py-1`}>
              {gameProvenance.status.charAt(0).toUpperCase() + gameProvenance.status.slice(1)}
            </Badge>
          </div>
        </CardHeader>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {gameProvenance.sources.map((source) => (
          <Card key={source.id}>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="text-base">{source.name}</CardTitle>
                  <CardDescription className="text-xs mt-1">
                    Last updated: {new Date(source.lastUpdated).toLocaleString()}
                  </CardDescription>
                </div>
                <Badge
                  className={`${sourceTypeColors[source.type]} text-xs border`}
                  variant="outline"
                >
                  {source.type}
                </Badge>
              </div>
            </CardHeader>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Event Timeline</CardTitle>
          <CardDescription>
            Complete history of data ingestion, validation, and corrections
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {gameProvenance.events.map((event, index) => (
              <div key={index}>
                <div className="flex gap-4">
                  <div className="flex flex-col items-center">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                      {eventTypeIcons[event.type]}
                    </div>
                    {index < gameProvenance.events.length - 1 && (
                      <div className="w-0.5 h-12 bg-border my-1" />
                    )}
                  </div>

                  <div className="flex-1 pb-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <Badge variant="outline" className="text-xs font-mono">
                            {event.type}
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            {event.source}
                          </span>
                        </div>
                        <p className="text-sm font-medium">{event.description}</p>

                        {event.changes && Object.keys(event.changes).length > 0 && (
                          <div className="mt-3 p-3 rounded-lg bg-muted/50 border">
                            <p className="text-xs font-semibold mb-2">Changes:</p>
                            <div className="space-y-1">
                              {Object.entries(event.changes).map(([key, change]) => (
                                <div key={key} className="text-xs font-mono flex items-center gap-2">
                                  <code className="text-muted-foreground">{key}:</code>
                                  <span className="text-destructive line-through">
                                    {String(change.old)}
                                  </span>
                                  <span>→</span>
                                  <span className="text-success font-semibold">
                                    {String(change.new)}
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>

                      <div className="flex items-center gap-1.5 text-xs text-muted-foreground ml-4">
                        <Clock size={14} />
                        {new Date(event.timestamp).toLocaleString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card className="border-accent/50 bg-accent/5">
        <CardHeader>
          <CardTitle className="text-base">NCAA Compliance Notes</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <div>
            <span className="font-semibold">Host Control:</span> Texas Longhorns (home team) SID
            maintains official statistics authority. Away-team corrections require host consent.
          </div>
          <Separator />
          <div>
            <span className="font-semibold">Correction Window:</span> Changes should be submitted
            within one week of game completion. NCAA may withhold posting until accuracy is
            substantiated.
          </div>
          <Separator />
          <div>
            <span className="font-semibold">Validation:</span> Box score proofing checks verify PA
            reconciliation (team PA = runs + LOB + opponent putouts).
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
