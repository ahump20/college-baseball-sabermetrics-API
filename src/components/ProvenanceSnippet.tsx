import { Card } from '@/components/ui/card';
import { GitBranch, Clock } from '@phosphor-icons/react';

interface ProvenanceSnippetProps {
  sources: string[];
  lastUpdated: string;
  compact?: boolean;
}

export function ProvenanceSnippet({ sources, lastUpdated, compact = false }: ProvenanceSnippetProps) {
  if (compact) {
    return (
      <div className="flex items-center gap-3 text-xs text-muted-foreground">
        <div className="flex items-center gap-1.5">
          <GitBranch size={12} />
          <span className="font-mono">{sources.join(', ')}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <Clock size={12} />
          <span>{lastUpdated}</span>
        </div>
      </div>
    );
  }

  return (
    <Card className="p-3 bg-muted/30 border-border/50">
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-2 text-xs font-semibold text-foreground">
          <GitBranch size={14} />
          Provenance
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
          <div>
            <div className="text-muted-foreground mb-1">Source Systems</div>
            <div className="font-mono text-foreground">{sources.join(', ')}</div>
          </div>
          <div>
            <div className="text-muted-foreground mb-1">Last Updated</div>
            <div className="font-mono text-foreground">{lastUpdated}</div>
          </div>
        </div>
      </div>
    </Card>
  );
}
