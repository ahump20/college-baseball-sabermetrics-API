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
    <Card className="bg-muted/30 border-border overflow-hidden">
      {title && (
        <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-muted/50">
          <span className="text-[0.8125rem] font-mono text-muted-foreground font-medium">{title}</span>
          <Button variant="ghost" size="sm" onClick={handleCopy} className="h-7 gap-1.5 -mr-2">
            {copied ? <Check size={14} weight="bold" /> : <Copy size={14} weight="bold" />}
            <span className="text-[0.8125rem]">{copied ? 'Copied' : 'Copy'}</span>
          </Button>
        </div>
      )}
      <div className="relative">
        {!title && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleCopy}
            className="absolute right-3 top-3 h-8 gap-1.5 z-10 bg-muted/80 backdrop-blur-sm hover:bg-muted"
          >
            {copied ? <Check size={14} weight="bold" /> : <Copy size={14} weight="bold" />}
            <span className="text-[0.8125rem]">{copied ? 'Copied' : 'Copy'}</span>
          </Button>
        )}
        <pre className="p-4 overflow-x-auto text-[0.875rem] font-mono leading-[1.5] max-h-[500px] overflow-y-auto">
          <code className={`language-${language}`}>{code}</code>
        </pre>
      </div>
    </Card>
  );
}
