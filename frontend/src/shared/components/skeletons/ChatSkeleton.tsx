import { motion } from 'motion/react';

/**
 * Beautiful skeleton loader for chat messages
 */
export const ChatSkeleton = () => {
  return (
    <div className="space-y-4">
      {[1, 2, 3].map((i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.1 }}
          className="flex gap-3"
        >
          {/* Avatar skeleton */}
          <div className="w-8 h-8 rounded-lg bg-white/5 animate-pulse" />

          {/* Message skeleton */}
          <div className="flex-1 space-y-2">
            <div className="h-4 bg-white/5 rounded animate-pulse w-3/4" />
            <div className="h-4 bg-white/5 rounded animate-pulse w-full" />
            <div className="h-4 bg-white/5 rounded animate-pulse w-2/3" />
          </div>
        </motion.div>
      ))}
    </div>
  );
};
