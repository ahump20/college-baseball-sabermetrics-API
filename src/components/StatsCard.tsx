import { ReactNode } from 'react';
import { Card } from '@/components/ui/card';
import { TrendUp, TrendDown, Minus } from '@phosphor-icons/react';
import { motion } from 'framer-motion';

interface StatsCardProps {
  icon: ReactNode;
  label: string;
  value: string | number;
  trend?: 'up' | 'down' | 'neutral';
  trendValue?: string;
  iconColor?: string;
  delay?: number;
}

export function StatsCard({ 
  icon, 
  label, 
  value, 
  trend, 
  trendValue, 
  iconColor = 'text-primary',
  delay = 0 
}: StatsCardProps) {
  const getTrendIcon = () => {
    if (!trend) return null;
    switch (trend) {
      case 'up':
        return <TrendUp size={16} weight="bold" className="text-success" />;
      case 'down':
        return <TrendDown size={16} weight="bold" className="text-destructive" />;
      case 'neutral':
        return <Minus size={16} weight="bold" className="text-muted-foreground" />;
    }
  };

  const getTrendColor = () => {
    switch (trend) {
      case 'up':
        return 'text-success';
      case 'down':
        return 'text-destructive';
      default:
        return 'text-muted-foreground';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay, ease: 'easeOut' }}
    >
      <Card className="relative overflow-hidden border-border/50 bg-gradient-to-br from-card to-card/80 hover:shadow-lg hover:shadow-primary/5 transition-all duration-300 hover:scale-[1.02]">
        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-primary/10 to-transparent rounded-full blur-2xl" />
        
        <div className="relative p-6">
          <div className="flex items-start justify-between mb-4">
            <div className={`p-3 rounded-xl bg-gradient-to-br from-surface-elevated to-surface ${iconColor}`}>
              {icon}
            </div>
            {trend && trendValue && (
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-surface-elevated">
                {getTrendIcon()}
                <span className={`text-xs font-medium ${getTrendColor()}`}>
                  {trendValue}
                </span>
              </div>
            )}
          </div>
          
          <div className="space-y-1">
            <div className="text-3xl font-bold font-display tracking-tight">
              {value}
            </div>
            <div className="text-sm text-muted-foreground font-medium">
              {label}
            </div>
          </div>
        </div>
      </Card>
    </motion.div>
  );
}
