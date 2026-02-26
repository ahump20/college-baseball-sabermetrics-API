import { Badge } from '@/components/ui/badge';
import { ShieldCheck, Clock, Flag } from '@phosphor-icons/react';

type StatusType = 'provisional' | 'official' | 'corrected';

interface StatusPillProps {
  status: StatusType;
  size?: 'sm' | 'md';
}

export function StatusPill({ status, size = 'md' }: StatusPillProps) {
  const config = {
    provisional: {
      label: 'Provisional',
      icon: Clock,
      className: 'bg-warning/10 text-warning border-warning/20',
    },
    official: {
      label: 'Official',
      icon: ShieldCheck,
      className: 'bg-success/10 text-success border-success/20',
    },
    corrected: {
      label: 'Corrected',
      icon: Flag,
      className: 'bg-accent/10 text-accent border-accent/20',
    },
  };

  const { label, icon: Icon, className } = config[status];
  const iconSize = size === 'sm' ? 12 : 14;

  return (
    <Badge variant="outline" className={`gap-1.5 font-mono text-xs ${className}`}>
      <Icon size={iconSize} weight="bold" />
      {label}
    </Badge>
  );
}
