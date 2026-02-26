import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Badge } from '@/components/ui/badge';
import { CodeBlock } from '@/components/CodeBlock';
import { Key, CaretDown, Info } from '@phosphor-icons/react';
import { useState } from 'react';

export function APIAccessDocs() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Card className="border-primary/20 bg-card/50">
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CardHeader className="cursor-pointer" onClick={() => setIsOpen(!isOpen)}>
          <CollapsibleTrigger asChild>
            <div className="flex items-start justify-between w-full">
              <div className="flex items-start gap-3 flex-1">
                <Key size={24} weight="bold" className="text-primary mt-1 shrink-0" />
                <div className="flex-1 min-w-0">
                  <CardTitle className="text-xl flex items-center gap-2">
                    API Access & Authentication
                    <Badge variant="outline" className="font-mono text-xs">
                      Authenticated
                    </Badge>
                  </CardTitle>
                  <CardDescription className="mt-1.5">
                    Connect to the College Baseball Sabermetrics API from Claude.ai, custom agents, or direct HTTP requests
                  </CardDescription>
                </div>
              </div>
              <CaretDown
                size={20}
                weight="bold"
                className={`text-muted-foreground transition-transform shrink-0 ${isOpen ? 'rotate-180' : ''}`}
              />
            </div>
          </CollapsibleTrigger>
        </CardHeader>

        <CollapsibleContent>
          <CardContent className="space-y-6 pt-0">
            <div className="flex items-start gap-3 p-4 bg-primary/5 border border-primary/20 rounded-lg">
              <Info size={20} weight="bold" className="text-primary mt-0.5 shrink-0" />
              <div className="text-sm space-y-1">
                <p className="font-medium text-foreground">Protected API Endpoint</p>
                <p className="text-muted-foreground">
                  All <code className="px-1.5 py-0.5 bg-muted/50 rounded font-mono text-xs">/api/*</code> and{' '}
                  <code className="px-1.5 py-0.5 bg-muted/50 rounded font-mono text-xs">/mcp</code> routes require a valid API key.
                  Public endpoints like <code className="px-1.5 py-0.5 bg-muted/50 rounded font-mono text-xs">/health</code> remain accessible without authentication.
                </p>
              </div>
            </div>

            <div className="space-y-3">
              <h4 className="font-semibold text-foreground flex items-center gap-2">
                <span className="text-primary">1.</span>
                Base URL
              </h4>
              <div className="pl-6">
                <CodeBlock
                  language="plaintext"
                  code="https://sabermetrics.blazesportsintel.com"
                />
              </div>
            </div>

            <div className="space-y-3">
              <h4 className="font-semibold text-foreground flex items-center gap-2">
                <span className="text-primary">2.</span>
                Authentication Header
              </h4>
              <div className="pl-6 space-y-3">
                <p className="text-sm text-muted-foreground">
                  Include your BSI API key in the <code className="px-1.5 py-0.5 bg-muted/50 rounded font-mono text-xs">Authorization</code> header:
                </p>
                <CodeBlock
                  language="http"
                  code={`Authorization: Bearer YOUR_BSI_API_KEY`}
                />
              </div>
            </div>

            <div className="space-y-3">
              <h4 className="font-semibold text-foreground flex items-center gap-2">
                <span className="text-primary">3.</span>
                cURL Example
              </h4>
              <div className="pl-6">
                <CodeBlock
                  language="bash"
                  code={`curl -H "Authorization: Bearer YOUR_BSI_API_KEY" \\
  https://sabermetrics.blazesportsintel.com/api/games`}
                />
              </div>
            </div>

            <div className="space-y-3">
              <h4 className="font-semibold text-foreground flex items-center gap-2">
                <span className="text-primary">4.</span>
                JavaScript Fetch Example
              </h4>
              <div className="pl-6">
                <CodeBlock
                  language="javascript"
                  code={`const response = await fetch('/api/games', {
  headers: {
    'Authorization': 'Bearer YOUR_BSI_API_KEY'
  }
});
const data = await response.json();`}
                />
              </div>
            </div>

            <div className="space-y-3">
              <h4 className="font-semibold text-foreground flex items-center gap-2">
                <span className="text-primary">5.</span>
                Claude.ai MCP Configuration
              </h4>
              <div className="pl-6 space-y-3">
                <p className="text-sm text-muted-foreground">
                  Add this MCP server in Claude.ai Settings → Connectors:
                </p>
                <div className="space-y-2">
                  <div className="text-sm">
                    <span className="font-medium text-foreground">Server URL:</span>
                    <CodeBlock
                      language="plaintext"
                      code="https://sabermetrics.blazesportsintel.com/mcp"
                    />
                  </div>
                  <div className="text-sm">
                    <span className="font-medium text-foreground">Custom Header:</span>
                    <div className="grid grid-cols-2 gap-3 mt-2">
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">Header Key:</p>
                        <CodeBlock language="plaintext" code="Authorization" />
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">Header Value:</p>
                        <CodeBlock language="plaintext" code="Bearer YOUR_BSI_API_KEY" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <h4 className="font-semibold text-foreground flex items-center gap-2">
                <span className="text-primary">6.</span>
                AI Agent Environment Variable
              </h4>
              <div className="pl-6 space-y-3">
                <p className="text-sm text-muted-foreground">
                  For automated agents and scripts, export your API key:
                </p>
                <CodeBlock
                  language="bash"
                  code="export BSI_API_KEY=your_key_here"
                />
              </div>
            </div>

            <div className="space-y-3">
              <h4 className="font-semibold text-foreground flex items-center gap-2">
                <span className="text-primary">7.</span>
                Rate Limits
              </h4>
              <div className="pl-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="p-3 bg-muted/30 rounded-md border border-border/50">
                    <p className="text-xs text-muted-foreground mb-1">Request Limit</p>
                    <p className="text-lg font-mono font-semibold text-foreground">60 requests</p>
                  </div>
                  <div className="p-3 bg-muted/30 rounded-md border border-border/50">
                    <p className="text-xs text-muted-foreground mb-1">Time Window</p>
                    <p className="text-lg font-mono font-semibold text-foreground">Per minute</p>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground mt-3">
                  When rate limit is exceeded, you'll receive HTTP 429 with a{' '}
                  <code className="px-1 py-0.5 bg-muted/50 rounded font-mono">Retry-After: 60</code> header.
                </p>
              </div>
            </div>
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
}
