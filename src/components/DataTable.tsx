import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { ScrollArea } from '@/components/ui/scroll-area';

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
}

export function DataTable({ columns, data, maxHeight = '600px', stickyHeader = true }: DataTableProps) {
  return (
    <div className="rounded-md border border-border overflow-hidden">
      <ScrollArea className={`w-full ${maxHeight ? `max-h-[${maxHeight}]` : ''}`}>
        <Table>
          <TableHeader className={stickyHeader ? 'sticky top-0 bg-muted z-10' : ''}>
            <TableRow>
              {columns.map((col) => (
                <TableHead
                  key={col.key}
                  className={`${col.align === 'right' ? 'text-right' : col.align === 'center' ? 'text-center' : 'text-left'} ${col.mono ? 'font-mono' : ''} ${col.width ? col.width : ''}`}
                >
                  {col.label}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.length === 0 ? (
              <TableRow>
                <TableCell colSpan={columns.length} className="text-center py-8 text-muted-foreground">
                  No data available
                </TableCell>
              </TableRow>
            ) : (
              data.map((row, idx) => (
                <TableRow key={idx} className="hover:bg-muted/30">
                  {columns.map((col) => (
                    <TableCell
                      key={col.key}
                      className={`${col.align === 'right' ? 'text-right' : col.align === 'center' ? 'text-center' : 'text-left'} ${col.mono ? 'font-mono text-sm' : ''}`}
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
