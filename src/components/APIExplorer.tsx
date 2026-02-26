import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Copy, CheckCircle } from '@phosphor-icons/react';
import { apiEndpoints } from '@/lib/data';
import type { APIEndpoint } from '@/lib/types';

const methodColors = {
  GET: 'bg-success/10 text-success border-success/20',
  POST: 'bg-primary/10 text-primary border-primary/20',
  PUT: 'bg-warning/10 text-warning border-warning/20',
  DELETE: 'bg-destructive/10 text-destructive border-destructive/20',
};

export function APIExplorer() {
  const [copiedPath, setCopiedPath] = useState<string | null>(null);
  const categories = Array.from(new Set(apiEndpoints.map((e) => e.category)));

  const copyToClipboard = (text: string, path: string) => {
    navigator.clipboard.writeText(text);
    setCopiedPath(path);
    setTimeout(() => setCopiedPath(null), 2000);
  };

  const renderEndpoint = (endpoint: APIEndpoint) => {
    const curlExample = `curl -H "Authorization: Bearer <API_KEY>" \\
  "https://api.baseball-analytics.dev${endpoint.path}"`;

    return (
      <AccordionItem key={endpoint.path} value={endpoint.path}>
        <AccordionTrigger className="hover:no-underline">
          <div className="flex items-center gap-3 w-full pr-4">
            <Badge className={`${methodColors[endpoint.method]} font-mono text-xs px-2 py-0.5 border`}>
              {endpoint.method}
            </Badge>
            <code className="font-mono text-sm flex-1 text-left">{endpoint.path}</code>
          </div>
        </AccordionTrigger>
        <AccordionContent>
          <div className="space-y-4 pt-2">
            <p className="text-sm text-muted-foreground">{endpoint.description}</p>

            {endpoint.params && endpoint.params.length > 0 && (
              <div>
                <h4 className="text-sm font-semibold mb-2">Parameters</h4>
                <div className="space-y-2">
                  {endpoint.params.map((param) => (
                    <div key={param.name} className="flex gap-3 text-sm">
                      <code className="font-mono text-xs bg-muted px-2 py-1 rounded">
                        {param.name}
                      </code>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="text-muted-foreground">{param.type}</span>
                          {param.required && (
                            <Badge variant="outline" className="text-xs">
                              required
                            </Badge>
                          )}
                        </div>
                        <p className="text-muted-foreground text-xs mt-0.5">
                          {param.description}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div>
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-sm font-semibold">Example Response</h4>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 text-xs"
                  onClick={() =>
                    copyToClipboard(JSON.stringify(endpoint.response, null, 2), endpoint.path)
                  }
                >
                  {copiedPath === endpoint.path ? (
                    <>
                      <CheckCircle className="mr-1" size={14} />
                      Copied
                    </>
                  ) : (
                    <>
                      <Copy className="mr-1" size={14} />
                      Copy
                    </>
                  )}
                </Button>
              </div>
              <ScrollArea className="h-64 w-full rounded-md border">
                <pre className="p-4 text-xs font-mono">
                  {JSON.stringify(endpoint.response, null, 2)}
                </pre>
              </ScrollArea>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-sm font-semibold">cURL Example</h4>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 text-xs"
                  onClick={() =>
                    copyToClipboard(curlExample, `curl-${endpoint.path}`)
                  }
                >
                  {copiedPath === `curl-${endpoint.path}` ? (
                    <>
                      <CheckCircle className="mr-1" size={14} />
                      Copied
                    </>
                  ) : (
                    <>
                      <Copy className="mr-1" size={14} />
                      Copy
                    </>
                  )}
                </Button>
              </div>
              <pre className="p-4 text-xs font-mono bg-muted rounded-md overflow-x-auto">
                {curlExample}
              </pre>
            </div>
          </div>
        </AccordionContent>
      </AccordionItem>
    );
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold mb-2">API Explorer</h2>
        <p className="text-muted-foreground">
          Browse the complete API surface with authentication patterns, request parameters, and
          response structures demonstrating NCAA policy compliance and provenance tracking.
        </p>
      </div>

      {categories.map((category) => {
        const categoryEndpoints = apiEndpoints.filter((e) => e.category === category);
        return (
          <Card key={category}>
            <CardHeader>
              <CardTitle>{category} Endpoints</CardTitle>
              <CardDescription>
                {categoryEndpoints.length} endpoint{categoryEndpoints.length !== 1 ? 's' : ''}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Accordion type="single" collapsible className="w-full">
                {categoryEndpoints.map(renderEndpoint)}
              </Accordion>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
