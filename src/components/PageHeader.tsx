import { ReactNode } from 'react';

interface PageHeaderProps {
  title: string;
  description?: string;
  badges?: ReactNode;
  actions?: ReactNode;
}

export function PageHeader({ title, description, badges, actions }: PageHeaderProps) {
  return (
    <div className="mb-12">
      <div className="flex items-start justify-between gap-6 mb-4">
        <div className="flex-1">
          <h1 className="text-[2rem] font-semibold tracking-[-0.02em] text-foreground leading-tight mb-3">
            {title}
          </h1>
          {description && (
            <p className="text-[0.9375rem] text-muted-foreground leading-[1.6] max-w-3xl">
              {description}
            </p>
          )}
        </div>
        {actions && <div className="flex items-center gap-2 shrink-0">{actions}</div>}
      </div>
      {badges && <div className="flex items-center gap-2 flex-wrap">{badges}</div>}
    </div>
  );
}
