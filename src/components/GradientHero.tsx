import { ReactNode } from 'react';
import { motion } from 'framer-motion';

interface GradientHeroProps {
  title: string;
  description?: string;
  badge?: ReactNode;
  action?: ReactNode;
}

export function GradientHero({ title, description, badge, action }: GradientHeroProps) {
  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-card via-surface to-surface-elevated border border-border/50 mb-8">
      <div className="absolute inset-0">
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-primary/20 via-accent/10 to-transparent rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-gradient-to-tr from-secondary/20 via-primary/10 to-transparent rounded-full blur-3xl" />
      </div>
      
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,oklch(0.25_0.04_40),transparent_50%),radial-gradient(circle_at_80%_80%,oklch(0.25_0.04_45),transparent_50%)]" />
      
      <div className="absolute inset-0 bg-[linear-gradient(to_right,oklch(0.18_0.02_35_/_0.1)_1px,transparent_1px),linear-gradient(to_bottom,oklch(0.18_0.02_35_/_0.1)_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_50%,black,transparent)]" />
      
      <div className="relative px-8 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          className="max-w-4xl"
        >
          {badge && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4, delay: 0.1, ease: 'easeOut' }}
              className="mb-4"
            >
              {badge}
            </motion.div>
          )}
          
          <h1 className="text-5xl font-bold font-display tracking-tight mb-4 bg-gradient-to-br from-foreground via-foreground/90 to-foreground/70 bg-clip-text text-transparent">
            {title}
          </h1>
          
          {description && (
            <p className="text-lg text-muted-foreground max-w-2xl mb-6">
              {description}
            </p>
          )}
          
          {action && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.2, ease: 'easeOut' }}
            >
              {action}
            </motion.div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
