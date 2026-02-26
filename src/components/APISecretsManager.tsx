import { useState, useEffect } from 'react';
import { useKV } from '@github/spark/hooks';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Key, Check, Copy, Eye, EyeSlash, ShieldCheck, LockKey } from '@phosphor-icons/react';
import { toast } from 'sonner';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface APISecret {
  name: string;
  key: string;
  value: string;
  description: string;
  required: boolean;
}

const defaultSecrets: APISecret[] = [
  {
    name: 'BSI API Key',
    key: 'BSI_API_KEY',
    value: '',
    description: 'Primary API authentication key for MCP server access',
    required: true
  },
  {
    name: 'Highlightly API Key',
    key: 'HIGHLIGHTLY_API_KEY',
    value: '',
    description: 'Highlightly MLB & College Baseball API access key',
    required: true
  },
  {
    name: 'Blaze Client ID',
    key: 'BLAZE_CLIENT_ID',
    value: '',
    description: 'Blaze Sports Intel client identifier',
    required: false
  },
  {
    name: 'Blaze Client Secret',
    key: 'BLAZE_CLIENT_SECRET',
    value: '',
    description: 'Blaze Sports Intel client secret key',
    required: false
  },
  {
    name: 'Blaze Production API Key',
    key: 'BLAZE_PRODUCTION_API_KEY',
    value: '',
    description: 'Production environment API key',
    required: false
  }
];

export function APISecretsManager() {
  const [secrets, setSecrets] = useKV<APISecret[]>('api-secrets', defaultSecrets);
  const [visibleSecrets, setVisibleSecrets] = useState<Set<string>>(new Set());
  const [isOwner, setIsOwner] = useState<boolean | null>(null);

  useEffect(() => {
    window.spark.user().then(user => {
      setIsOwner(user?.isOwner || false);
    }).catch(() => {
      setIsOwner(false);
    });
  }, []);

  const handleUpdateSecret = (index: number, value: string) => {
    setSecrets((current) => {
      const currentArray = current || defaultSecrets;
      const updated = [...currentArray];
      updated[index] = { ...updated[index], value };
      return updated;
    });
  };

  const toggleSecretVisibility = (key: string) => {
    setVisibleSecrets((current) => {
      const newSet = new Set(current);
      if (newSet.has(key)) {
        newSet.delete(key);
      } else {
        newSet.add(key);
      }
      return newSet;
    });
  };

  const handleCopyWranglerCommands = () => {
    const commands = (secrets || [])
      .filter(s => s.value)
      .map(s => `wrangler secret put ${s.key}`)
      .join('\n# Then paste: ' + (secrets?.find(sec => sec.key === 'BSI_API_KEY')?.value || '<value>') + '\n');
    
    navigator.clipboard.writeText(commands);
    toast.success('Wrangler secret commands copied to clipboard');
  };

  const handleGenerateAPIKey = () => {
    const randomKey = Array.from(crypto.getRandomValues(new Uint8Array(32)))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');
    
    const bsiIndex = (secrets || defaultSecrets).findIndex(s => s.key === 'BSI_API_KEY');
    if (bsiIndex !== -1) {
      handleUpdateSecret(bsiIndex, randomKey);
      toast.success('Generated new BSI API key');
    }
  };

  const requiredSecretsConfigured = (secrets || [])
    .filter(s => s.required)
    .every(s => s.value.trim() !== '');

  if (isOwner === null) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-center py-8">
            <p className="text-muted-foreground">Loading...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!isOwner) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <LockKey size={24} weight="bold" className="text-destructive" />
            Access Restricted
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Alert>
            <LockKey className="h-4 w-4" />
            <AlertDescription>
              This section contains sensitive API credentials and is only accessible to the application owner. API keys are never exposed publicly and are securely stored in environment variables.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <ShieldCheck size={24} weight="bold" className="text-primary" />
              API Authentication Secrets
            </CardTitle>
            <CardDescription className="mt-2">
              Configure API keys and authentication credentials for secure access
            </CardDescription>
          </div>
          {requiredSecretsConfigured && (
            <Badge variant="outline" className="gap-1.5 border-success/30 bg-success/10 text-success">
              <Check size={14} weight="bold" />
              Required Set
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={handleGenerateAPIKey}
            className="gap-2"
          >
            <Key size={16} weight="bold" />
            Generate BSI API Key
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleCopyWranglerCommands}
            className="gap-2"
          >
            <Copy size={16} weight="bold" />
            Copy Wrangler Commands
          </Button>
        </div>

        <div className="space-y-4">
          {(secrets || defaultSecrets).map((secret, index) => {
            const isVisible = visibleSecrets.has(secret.key);
            const hasValue = secret.value.trim() !== '';

            return (
              <div
                key={secret.key}
                className="rounded-lg border border-border bg-muted/30 p-4 space-y-3"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-foreground">{secret.name}</h3>
                      {secret.required && (
                        <Badge variant="outline" className="text-xs">Required</Badge>
                      )}
                      {hasValue && (
                        <Badge variant="outline" className="gap-1 text-xs border-success/30 bg-success/10 text-success">
                          <Check size={10} weight="bold" />
                          Set
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">
                      {secret.description}
                    </p>
                  </div>
                </div>

                <div className="grid gap-3">
                  <div className="grid gap-2">
                    <Label htmlFor={`secret-key-${index}`} className="text-xs font-mono text-muted-foreground">
                      Environment Variable
                    </Label>
                    <Input
                      id={`secret-key-${index}`}
                      value={secret.key}
                      readOnly
                      className="font-mono text-sm bg-background"
                    />
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor={`secret-value-${index}`} className="text-xs font-mono text-muted-foreground">
                      Secret Value
                    </Label>
                    <div className="relative">
                      <Input
                        id={`secret-value-${index}`}
                        type={isVisible ? 'text' : 'password'}
                        value={secret.value}
                        onChange={(e) => handleUpdateSecret(index, e.target.value)}
                        placeholder={secret.required ? 'Required' : 'Optional'}
                        className="font-mono text-sm pr-10"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7 p-0"
                        onClick={() => toggleSecretVisibility(secret.key)}
                      >
                        {isVisible ? (
                          <EyeSlash size={16} weight="bold" />
                        ) : (
                          <Eye size={16} weight="bold" />
                        )}
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="rounded-lg border border-border bg-muted/50 p-4">
          <h4 className="font-semibold text-sm mb-3">Deployment Instructions</h4>
          <ol className="space-y-2 text-sm text-muted-foreground">
            <li className="flex gap-2">
              <span className="font-bold text-primary">1.</span>
              <span>Generate or enter your API keys above</span>
            </li>
            <li className="flex gap-2">
              <span className="font-bold text-primary">2.</span>
              <span>Copy the wrangler commands and run them in your terminal</span>
            </li>
            <li className="flex gap-2">
              <span className="font-bold text-primary">3.</span>
              <span>When prompted, paste the corresponding secret value</span>
            </li>
            <li className="flex gap-2">
              <span className="font-bold text-primary">4.</span>
              <span>Secrets are stored securely in Cloudflare and never exposed in code</span>
            </li>
          </ol>
        </div>
      </CardContent>
    </Card>
  );
}
