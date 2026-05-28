import { motion } from 'motion/react';
import { ReactNode } from 'react';

interface ScaleInProps {
  children: ReactNode;
  delay?: number;
  duration?: number;
  className?: string;
}

/**
 * Smooth scale-in animation wrapper
 */
export const ScaleIn = ({
  children,
  delay = 0,
  duration = 0.4,
  className = '',
}: ScaleInProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration, delay, ease: 'easeOut' }}
      className={className}
    >
      {children}
    </motion.div>
  );
};
