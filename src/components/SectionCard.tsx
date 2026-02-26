import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ReactNode } from 'react';

interface SectionCardProps {
  title: string;
  description?: string;
  children: ReactNode;
  actions?: ReactNode;
  className?: string;
}

export function SectionCard({ title, description, children, actions, className = '' }: SectionCardProps) {
  return (
    <Card className={className}>
      <CardHeader className="pb-6">
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-1 flex-1">
            <CardTitle className="text-[1.25rem] font-semibold leading-tight">{title}</CardTitle>
            {description && (
              <CardDescription className="text-[0.875rem] leading-relaxed">{description}</CardDescription>
            )}
          </div>
          {actions && <div className="flex items-center gap-2 shrink-0">{actions}</div>}
        </div>
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  );
}
