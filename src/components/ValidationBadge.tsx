import { Badge } from '@/components/ui/badge';
import { ShieldCheck, Flag, ShieldWarning } from '@phosphor-icons/react';

type ValidationType = 'proofed' | 'flagged' | 'pending';

interface ValidationBadgeProps {
  validation: ValidationType;
  size?: 'sm' | 'md';
}

export function ValidationBadge({ validation, size = 'md' }: ValidationBadgeProps) {
  const config = {
    proofed: {
      label: 'Proofed',
      icon: ShieldCheck,
      className: 'bg-success/10 text-success border-success/20',
    },
    flagged: {
      label: 'Flagged',
      icon: Flag,
      className: 'bg-destructive/10 text-destructive border-destructive/20',
    },
    pending: {
      label: 'Pending',
      icon: ShieldWarning,
      className: 'bg-warning/10 text-warning border-warning/20',
    },
  };

  const { label, icon: Icon, className } = config[validation];
  const iconSize = size === 'sm' ? 12 : 14;

  return (
    <Badge variant="outline" className={`gap-1.5 font-mono text-xs ${className}`}>
      <Icon size={iconSize} weight="bold" />
      {label}
    </Badge>
  );
}
