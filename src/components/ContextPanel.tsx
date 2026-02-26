import { ReactNode } from 'react';
import { X } from '@phosphor-icons/react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';

interface ContextPanelProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children: ReactNode;
  className?: string;
}

export function ContextPanel({ isOpen, onClose, title, description, children, className }: ContextPanelProps) {
  if (!isOpen) return null;

  return (
    <>
      <div 
        className="fixed inset-0 bg-foreground/20 backdrop-blur-sm z-40 animate-in fade-in duration-200"
        onClick={onClose}
        onKeyDown={(e) => {
          if (e.key === 'Escape') onClose();
        }}
        role="button"
        tabIndex={0}
        aria-label="Close context panel"
      />
      
      <div className={cn(
        "fixed right-0 top-0 bottom-0 w-full md:w-[400px] lg:w-[480px] bg-card border-l border-border z-50",
        "animate-in slide-in-from-right duration-250",
        className
      )}>
        <div className="flex flex-col h-full">
          <div className="flex items-start justify-between p-6 border-b border-border">
            <div className="flex-1 pr-4">
              <h2 className="text-xl font-semibold text-foreground leading-tight">{title}</h2>
              {description && (
                <p className="text-sm text-muted-foreground mt-1 leading-relaxed">{description}</p>
              )}
            </div>
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={onClose}
              className="shrink-0 -mt-1 -mr-2"
            >
              <X size={20} weight="bold" />
            </Button>
          </div>
          
          <ScrollArea className="flex-1">
            <div className="p-6">
              {children}
            </div>
          </ScrollArea>
        </div>
      </div>
    </>
  );
}
