import { useState } from 'react';
import { useKV } from '@github/spark/hooks';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Database, Check, Copy, Eye, EyeSlash, Key } from '@phosphor-icons/react';
import { toast } from 'sonner';

interface KVNamespace {
  name: string;
  binding: string;
  id: string;
  description: string;
}

const defaultNamespaces: KVNamespace[] = [
  {
    name: 'Rate Limiting',
    binding: 'RATE_LIMIT_KV',
    id: '',
    description: 'Token bucket state and API quota tracking'
  },
  {
    name: 'Team Statistics Cache',
    binding: 'TEAM_STATS_KV',
    id: '',
    description: 'Cached team and player statistics with TTL'
  },
  {
    name: 'BSI General Cache',
    binding: 'BSI_CACHE',
    id: '',
    description: 'General purpose cache for API responses and computed metrics'
  }
];

export function KVNamespaceManager() {
  const [namespaces, setNamespaces] = useKV<KVNamespace[]>('kv-namespaces', defaultNamespaces);

  const handleUpdateNamespace = (index: number, id: string) => {
    setNamespaces((current) => {
      const currentArray = current || defaultNamespaces;
      const updated = [...currentArray];
      updated[index] = { ...updated[index], id };
      return updated;
    });
  };

  const handleCopyWranglerConfig = () => {
    const config = (namespaces || [])
      .filter(ns => ns.id)
      .map(ns => `[[kv_namespaces]]\nbinding = "${ns.binding}"\nid = "${ns.id}"`)
      .join('\n\n');
    
    navigator.clipboard.writeText(config);
    toast.success('Wrangler configuration copied to clipboard');
  };

  const handleCopyCreateCommands = () => {
    if (!namespaces) return;
    const commands = namespaces
      .map(ns => `wrangler kv:namespace create ${ns.binding}`)
      .join('\n');
    
    navigator.clipboard.writeText(commands);
    toast.success('KV creation commands copied to clipboard');
  };

  const allConfigured = namespaces?.every(ns => ns.id.trim() !== '') ?? false;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Database size={24} weight="bold" className="text-primary" />
              KV Namespace Configuration
            </CardTitle>
            <CardDescription className="mt-2">
              Configure Cloudflare KV namespaces for data persistence and caching
            </CardDescription>
          </div>
          {allConfigured && (
            <Badge variant="outline" className="gap-1.5 border-success/30 bg-success/10 text-success">
              <Check size={14} weight="bold" />
              All Configured
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={handleCopyCreateCommands}
            className="gap-2"
          >
            <Copy size={16} weight="bold" />
            Copy Create Commands
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleCopyWranglerConfig}
            disabled={!allConfigured}
            className="gap-2"
          >
            <Copy size={16} weight="bold" />
            Copy Wrangler Config
          </Button>
        </div>

        <div className="space-y-4">
          {namespaces?.map((namespace, index) => (
            <div
              key={namespace.binding}
              className="rounded-lg border border-border bg-muted/30 p-4 space-y-3"
            >
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-semibold text-foreground">{namespace.name}</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    {namespace.description}
                  </p>
                </div>
                {namespace.id && (
                  <Badge variant="outline" className="gap-1.5 border-success/30 bg-success/10 text-success">
                    <Check size={12} weight="bold" />
                    Set
                  </Badge>
                )}
              </div>

              <div className="grid gap-3">
                <div className="grid gap-2">
                  <Label htmlFor={`binding-${index}`} className="text-xs font-mono text-muted-foreground">
                    Binding Name
                  </Label>
                  <Input
                    id={`binding-${index}`}
                    value={namespace.binding}
                    readOnly
                    className="font-mono text-sm bg-background"
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor={`id-${index}`} className="text-xs font-mono text-muted-foreground">
                    Namespace ID
                  </Label>
                  <Input
                    id={`id-${index}`}
                    value={namespace.id}
                    onChange={(e) => handleUpdateNamespace(index, e.target.value)}
                    placeholder="e.g., 1234567890abcdef1234567890abcdef"
                    className="font-mono text-sm"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="rounded-lg border border-border bg-muted/50 p-4">
          <h4 className="font-semibold text-sm mb-3">Setup Instructions</h4>
          <ol className="space-y-2 text-sm text-muted-foreground">
            <li className="flex gap-2">
              <span className="font-bold text-primary">1.</span>
              <span>Copy the create commands and run them in your terminal</span>
            </li>
            <li className="flex gap-2">
              <span className="font-bold text-primary">2.</span>
              <span>Paste the returned namespace IDs into the fields above</span>
            </li>
            <li className="flex gap-2">
              <span className="font-bold text-primary">3.</span>
              <span>Copy the wrangler config and add it to your wrangler.toml file</span>
            </li>
          </ol>
        </div>
      </CardContent>
    </Card>
  );
}
