import { Badge } from '@/components/ui/badge';
import { ChartBar, ListBullets, Target } from '@phosphor-icons/react';

type CoverageType = 'box-only' | 'pbp' | 'tracking';

interface CoveragePillProps {
  coverage: CoverageType;
  size?: 'sm' | 'md';
}

export function CoveragePill({ coverage, size = 'md' }: CoveragePillProps) {
  const config = {
    'box-only': {
      label: 'Box Only',
      icon: ListBullets,
      className: 'bg-muted text-muted-foreground border-border',
    },
    pbp: {
      label: 'Play-by-Play',
      icon: ChartBar,
      className: 'bg-primary/10 text-primary border-primary/20',
    },
    tracking: {
      label: 'Tracking',
      icon: Target,
      className: 'bg-accent/10 text-accent border-accent/20',
    },
  };

  const { label, icon: Icon, className } = config[coverage];
  const iconSize = size === 'sm' ? 12 : 14;

  return (
    <Badge variant="outline" className={`gap-1.5 font-mono text-xs ${className}`}>
      <Icon size={iconSize} weight="bold" />
      {label}
    </Badge>
  );
}
