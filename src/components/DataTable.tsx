import { useState, useRef, useEffect } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';

interface Column {
  key: string;
  label: string;
  align?: 'left' | 'right' | 'center';
  mono?: boolean;
  width?: string;
}

interface DataTableProps {
  columns: Column[];
  data: Record<string, any>[];
  maxHeight?: string;
  stickyHeader?: boolean;
  className?: string;
}

export function DataTable({ 
  columns, 
  data, 
  maxHeight = '600px', 
  stickyHeader = true,
  className 
}: DataTableProps) {
  const [isScrolled, setIsScrolled] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const scrollEl = scrollRef.current?.querySelector('[data-radix-scroll-area-viewport]');
    if (!scrollEl) return;

    const handleScroll = () => {
      setIsScrolled(scrollEl.scrollTop > 0);
    };

    scrollEl.addEventListener('scroll', handleScroll);
    return () => scrollEl.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className={cn("rounded-md border border-border overflow-hidden bg-card", className)}>
      <ScrollArea 
        ref={scrollRef}
        className="w-full" 
        style={{ maxHeight }}
      >
        <Table>
          <TableHeader 
            className={cn(
              stickyHeader && "sticky top-0 bg-muted/80 backdrop-blur-sm z-10",
              isScrolled && stickyHeader && "shadow-sm"
            )}
          >
            <TableRow className="hover:bg-transparent">
              {columns.map((col) => (
                <TableHead
                  key={col.key}
                  className={cn(
                    "text-[0.8125rem] font-medium",
                    col.align === 'right' && 'text-right',
                    col.align === 'center' && 'text-center',
                    col.align === 'left' && 'text-left',
                    col.mono && 'font-mono'
                  )}
                  style={{ width: col.width }}
                >
                  {col.label}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.length === 0 ? (
              <TableRow className="hover:bg-transparent">
                <TableCell 
                  colSpan={columns.length} 
                  className="text-center py-12 text-muted-foreground text-[0.875rem]"
                >
                  No data available
                </TableCell>
              </TableRow>
            ) : (
              data.map((row, idx) => (
                <TableRow 
                  key={idx} 
                  className="hover:bg-muted/40 transition-colors"
                >
                  {columns.map((col) => (
                    <TableCell
                      key={col.key}
                      className={cn(
                        "text-[0.875rem]",
                        col.align === 'right' && 'text-right tabular-nums',
                        col.align === 'center' && 'text-center',
                        col.align === 'left' && 'text-left',
                        col.mono && 'font-mono text-[0.8125rem]'
                      )}
                    >
                      {row[col.key] ?? '—'}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </ScrollArea>
    </div>
  );
}
