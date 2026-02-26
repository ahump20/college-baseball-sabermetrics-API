import { motion, AnimatePresence } from 'framer-motion';
import { useEffect, useState } from 'react';
import { FlameLoader } from './FlameLoader';

interface PageLoadingProps {
  isLoading: boolean;
  message?: string;
}

export function PageLoading({ isLoading, message = 'Loading...' }: PageLoadingProps) {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (!isLoading) {
      setProgress(100);
      return;
    }

    setProgress(0);
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 90) return prev;
        return prev + Math.random() * 10;
      });
    }, 300);

    return () => clearInterval(interval);
  }, [isLoading]);

  return (
    <AnimatePresence>
      {isLoading && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-background/95 backdrop-blur-sm"
        >
          <div className="flex flex-col items-center gap-6">
            <FlameLoader size="lg" />
            
            <div className="flex flex-col items-center gap-3">
              <motion.p
                className="text-lg font-medium text-foreground"
                animate={{ opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              >
                {message}
              </motion.p>

              <div className="w-64 h-1 bg-muted rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-gradient-to-r from-primary via-accent to-secondary rounded-full"
                  initial={{ width: '0%' }}
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 0.3 }}
                />
              </div>

              <p className="text-xs font-mono text-muted-foreground">
                {Math.round(progress)}%
              </p>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

interface InlineLoadingProps {
  size?: 'sm' | 'md' | 'lg';
  message?: string;
  className?: string;
}

export function InlineLoading({ size = 'md', message, className = '' }: InlineLoadingProps) {
  return (
    <div className={`flex flex-col items-center justify-center gap-4 py-12 ${className}`}>
      <FlameLoader size={size} />
      {message && (
        <motion.p
          className="text-sm text-muted-foreground"
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 1.5, repeat: Infinity }}
        >
          {message}
        </motion.p>
      )}
    </div>
  );
}

export function FlameSpinner({ className = '' }: { className?: string }) {
  return (
    <motion.div
      className={`inline-block ${className}`}
      animate={{ rotate: 360 }}
      transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
    >
      <svg viewBox="0 0 24 24" className="w-5 h-5">
        <defs>
          <linearGradient id="spinnerGradient" x1="0%" y1="100%" x2="0%" y2="0%">
            <stop offset="0%" stopColor="#ff4500" />
            <stop offset="50%" stopColor="#ff8c00" />
            <stop offset="100%" stopColor="#ffd700" />
          </linearGradient>
        </defs>
        <path
          d="M12 2 C10 2, 9 4, 9 6 C9 8, 10 10, 12 14 C14 10, 15 8, 15 6 C15 4, 14 2, 12 2 Z"
          fill="url(#spinnerGradient)"
          opacity="0.9"
        />
        <circle cx="12" cy="12" r="2" fill="#ffffe0" />
      </svg>
    </motion.div>
  );
}
