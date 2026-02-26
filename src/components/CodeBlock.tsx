import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Copy, Check } from '@phosphor-icons/react';
import { useState } from 'react';

interface CodeBlockProps {
  code: string;
  language?: string;
  title?: string;
}

export function CodeBlock({ code, language = 'json', title }: CodeBlockProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Card className="bg-muted/30 border-border/50 overflow-hidden">
      {title && (
        <div className="flex items-center justify-between px-4 py-2 border-b border-border/50 bg-muted/50">
          <span className="text-xs font-mono text-muted-foreground">{title}</span>
          <Button variant="ghost" size="sm" onClick={handleCopy} className="h-7 gap-1.5">
            {copied ? <Check size={14} /> : <Copy size={14} />}
            <span className="text-xs">{copied ? 'Copied' : 'Copy'}</span>
          </Button>
        </div>
      )}
      <div className="relative">
        {!title && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleCopy}
            className="absolute right-2 top-2 h-7 gap-1.5 z-10"
          >
            {copied ? <Check size={14} /> : <Copy size={14} />}
          </Button>
        )}
        <pre className="p-4 overflow-x-auto text-sm font-mono leading-relaxed">
          <code className={`language-${language}`}>{code}</code>
        </pre>
      </div>
    </Card>
  );
}
