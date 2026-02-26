import { motion, AnimatePresence } from 'framer-motion';
import { useEffect, useState } from 'react';
import { FlameLoader } from './FlameLoader';
import blazeLogo from '@/assets/images/bsi-shield-blaze.webp';

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
        if (prev >= 95) return prev;
        const increment = Math.random() * 15;
        return Math.min(prev + increment, 95);
      });
    }, 200);

    return () => clearInterval(interval);
  }, [isLoading]);

  return (
    <AnimatePresence>
      {isLoading && (
        <motion.div
          initial={{ opacity: 1 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.6, ease: 'easeInOut' }}
          className="fixed inset-0 z-[100] flex items-center justify-center bg-gradient-to-br from-background via-card to-background"
        >
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-primary/5 via-transparent to-transparent" />
          
          <div className="relative flex flex-col items-center gap-8 sm:gap-12 px-4">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.5, ease: 'easeOut' }}
              className="relative"
            >
              <div className="absolute inset-0 bg-primary/20 blur-3xl rounded-full" />
              <motion.img
                src={blazeLogo}
                alt="Blaze Sports Intel"
                className="relative w-24 h-24 sm:w-32 sm:h-32 lg:w-40 lg:h-40 object-contain"
                animate={{ 
                  filter: [
                    'drop-shadow(0 0 20px rgba(255,107,53,0.3))',
                    'drop-shadow(0 0 40px rgba(255,107,53,0.6))',
                    'drop-shadow(0 0 20px rgba(255,107,53,0.3))',
                  ]
                }}
                transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
              />
            </motion.div>

            <div className="flex flex-col items-center gap-4 sm:gap-6">
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.2, duration: 0.5 }}
                className="text-center"
              >
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-foreground mb-2">
                  BLAZE SPORTS INTEL
                </h1>
                <p className="text-xs sm:text-sm font-mono text-muted-foreground tracking-wider">
                  Production-Grade NCAA Analytics Platform
                </p>
              </motion.div>

              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.4, duration: 0.5 }}
                className="flex flex-col items-center gap-4 w-full max-w-sm"
              >
                <div className="relative w-full">
                  <FlameLoader size="md" className="mx-auto" />
                </div>

                <motion.p
                  className="text-sm sm:text-base font-medium text-foreground/80"
                  animate={{ opacity: [0.5, 1, 0.5] }}
                  transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                >
                  {message}
                </motion.p>

                <div className="w-full h-1.5 bg-muted/30 rounded-full overflow-hidden backdrop-blur-sm">
                  <motion.div
                    className="h-full rounded-full"
                    style={{
                      background: 'linear-gradient(90deg, #ff4500 0%, #ff8c00 50%, #ffd700 100%)',
                    }}
                    initial={{ width: '0%' }}
                    animate={{ width: `${progress}%` }}
                    transition={{ duration: 0.3, ease: 'easeOut' }}
                  />
                </div>

                <p className="text-xs font-mono text-muted-foreground tabular-nums">
                  {Math.round(progress)}%
                </p>
              </motion.div>
            </div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6, duration: 0.5 }}
              className="absolute bottom-8 text-center"
            >
              <p className="text-[0.6875rem] sm:text-xs font-mono text-muted-foreground tracking-wider">
                COURAGE · GRIT · LEADERSHIP
              </p>
            </motion.div>
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
