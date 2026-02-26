import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { X } from '@phosphor-icons/react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ReactNode } from 'react';

interface ContextPanelProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
}

export function ContextPanel({ isOpen, onClose, title, children }: ContextPanelProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-y-0 right-0 w-full sm:w-[480px] bg-background border-l border-border shadow-2xl z-50 flex flex-col">
      <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-muted/30">
        <h3 className="text-lg font-semibold">{title}</h3>
        <Button variant="ghost" size="sm" onClick={onClose} className="h-8 w-8 p-0">
          <X size={18} />
        </Button>
      </div>
      <ScrollArea className="flex-1">
        <div className="p-6 space-y-6">{children}</div>
      </ScrollArea>
    </div>
  );
}
