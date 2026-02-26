import { motion } from 'framer-motion';

interface FlameLoaderProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function FlameLoader({ size = 'md', className = '' }: FlameLoaderProps) {
  const sizeMap = {
    sm: 'w-16 h-16',
    md: 'w-24 h-24',
    lg: 'w-32 h-32',
  };

  return (
    <div className={`relative ${sizeMap[size]} ${className}`}>
      <svg viewBox="0 0 120 140" className="w-full h-full">
        <defs>
          <linearGradient id="flameGradient" x1="0%" y1="100%" x2="0%" y2="0%">
            <stop offset="0%" stopColor="#ff4500" stopOpacity="1" />
            <stop offset="40%" stopColor="#ff8c00" stopOpacity="1" />
            <stop offset="70%" stopColor="#ffd700" stopOpacity="1" />
            <stop offset="100%" stopColor="#ffffe0" stopOpacity="1" />
          </linearGradient>
          <filter id="glowEffect">
            <feGaussianBlur stdDeviation="2" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        <motion.path
          d="M60 20 C50 20, 45 30, 45 40 C45 55, 52 70, 60 90 C68 70, 75 55, 75 40 C75 30, 70 20, 60 20 Z"
          fill="url(#flameGradient)"
          filter="url(#glowEffect)"
          opacity="0.4"
          animate={{
            opacity: [0.4, 0.7, 0.4],
            scale: [1, 1.05, 1],
          }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />

        <motion.path
          d="M60 30 C52 30, 48 38, 48 46 C48 58, 54 72, 60 95 C66 72, 72 58, 72 46 C72 38, 68 30, 60 30 Z"
          fill="url(#flameGradient)"
          filter="url(#glowEffect)"
          opacity="0.6"
          animate={{
            opacity: [0.6, 0.9, 0.6],
            scale: [1, 1.08, 1],
          }}
          transition={{
            duration: 1.2,
            repeat: Infinity,
            ease: 'easeInOut',
            delay: 0.2,
          }}
        />

        <motion.path
          d="M60 40 C54 40, 50 46, 50 54 C50 68, 56 85, 60 110 C64 85, 70 68, 70 54 C70 46, 66 40, 60 40 Z"
          fill="url(#flameGradient)"
          filter="url(#glowEffect)"
          animate={{
            d: [
              'M60 40 C54 40, 50 46, 50 54 C50 68, 56 85, 60 110 C64 85, 70 68, 70 54 C70 46, 66 40, 60 40 Z',
              'M60 36 C53 36, 48 44, 48 52 C48 70, 54 90, 60 118 C66 90, 72 70, 72 52 C72 44, 67 36, 60 36 Z',
              'M60 40 C54 40, 50 46, 50 54 C50 68, 56 85, 60 110 C64 85, 70 68, 70 54 C70 46, 66 40, 60 40 Z',
            ],
            opacity: [1, 0.95, 1],
          }}
          transition={{
            duration: 1,
            repeat: Infinity,
            ease: 'easeInOut',
            delay: 0.4,
          }}
        />

        <motion.circle
          cx="60"
          cy="100"
          r="6"
          fill="#ffffe0"
          animate={{
            opacity: [0.8, 1, 0.8],
            scale: [1, 1.2, 1],
          }}
          transition={{
            duration: 0.8,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />

        <motion.circle
          cx="55"
          cy="95"
          r="4"
          fill="#ffd700"
          animate={{
            opacity: [0.6, 0.9, 0.6],
            x: [0, 2, 0],
            y: [0, -2, 0],
          }}
          transition={{
            duration: 1.2,
            repeat: Infinity,
            ease: 'easeInOut',
            delay: 0.1,
          }}
        />

        <motion.circle
          cx="65"
          cy="95"
          r="4"
          fill="#ffd700"
          animate={{
            opacity: [0.6, 0.9, 0.6],
            x: [0, -2, 0],
            y: [0, -2, 0],
          }}
          transition={{
            duration: 1.2,
            repeat: Infinity,
            ease: 'easeInOut',
            delay: 0.2,
          }}
        />
      </svg>
    </div>
  );
}
