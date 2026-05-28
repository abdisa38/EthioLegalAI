import { motion } from 'motion/react';

/**
 * Beautiful skeleton loader for dashboard
 */
export const DashboardSkeleton = () => {
  return (
    <div className="space-y-6 p-6">
      {/* Header skeleton */}
      <div className="space-y-2">
        <div className="h-8 bg-white/5 rounded animate-pulse w-64" />
        <div className="h-4 bg-white/5 rounded animate-pulse w-96" />
      </div>

      {/* Stats skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[1, 2, 3].map((i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="p-6 bg-white/5 border border-white/10 rounded-xl space-y-3"
          >
            <div className="h-4 bg-white/10 rounded animate-pulse w-24" />
            <div className="h-8 bg-white/10 rounded animate-pulse w-32" />
            <div className="h-3 bg-white/10 rounded animate-pulse w-20" />
          </motion.div>
        ))}
      </div>

      {/* Content skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {[1, 2].map((i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 + i * 0.1 }}
            className="p-6 bg-white/5 border border-white/10 rounded-xl space-y-4"
          >
            <div className="h-5 bg-white/10 rounded animate-pulse w-40" />
            <div className="space-y-3">
              {[1, 2, 3].map((j) => (
                <div key={j} className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-white/10 animate-pulse" />
                  <div className="flex-1 space-y-2">
                    <div className="h-3 bg-white/10 rounded animate-pulse w-3/4" />
                    <div className="h-3 bg-white/10 rounded animate-pulse w-1/2" />
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};
