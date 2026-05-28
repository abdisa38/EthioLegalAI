import { motion } from 'motion/react';

/**
 * Beautiful skeleton loader for document cards
 */
export const DocumentSkeleton = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {[1, 2, 3, 4, 5, 6].map((i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: i * 0.05 }}
          className="p-4 bg-white/5 border border-white/10 rounded-xl space-y-3"
        >
          {/* Icon skeleton */}
          <div className="w-12 h-12 rounded-lg bg-white/10 animate-pulse" />

          {/* Title skeleton */}
          <div className="space-y-2">
            <div className="h-4 bg-white/10 rounded animate-pulse w-3/4" />
            <div className="h-3 bg-white/10 rounded animate-pulse w-1/2" />
          </div>

          {/* Footer skeleton */}
          <div className="flex items-center justify-between pt-2">
            <div className="h-3 bg-white/10 rounded animate-pulse w-20" />
            <div className="h-3 bg-white/10 rounded animate-pulse w-16" />
          </div>
        </motion.div>
      ))}
    </div>
  );
};
