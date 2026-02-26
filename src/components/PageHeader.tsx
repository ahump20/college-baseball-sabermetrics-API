import { ReactNode } from 'react';

interface PageHeaderProps {
  title: string;
  description?: string;
  badges?: ReactNode;
  actions?: ReactNode;
}

export function PageHeader({ title, description, badges, actions }: PageHeaderProps) {
  return (
    <div className="space-y-3 mb-8">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <h1 className="text-[2rem] font-semibold tracking-tight text-foreground leading-tight">
            {title}
          </h1>
          {description && (
            <p className="text-[0.9375rem] text-muted-foreground mt-2 leading-relaxed max-w-3xl">
              {description}
            </p>
          )}
        </div>
        {actions && <div className="flex items-center gap-2">{actions}</div>}
      </div>
      {badges && <div className="flex items-center gap-2 flex-wrap">{badges}</div>}
    </div>
  );
}
