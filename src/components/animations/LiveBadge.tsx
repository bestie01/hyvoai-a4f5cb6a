import { motion } from "framer-motion";

interface LiveBadgeProps {
  viewers?: number;
  className?: string;
}

export const LiveBadge = ({ viewers, className = "" }: LiveBadgeProps) => {
  return (
    <motion.div
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      className={`inline-flex items-center gap-2 ${className}`}
    >
      <motion.div
        animate={{
          scale: [1, 1.2, 1],
          opacity: [1, 0.8, 1]
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: "easeInOut"
        }}
        className="relative flex items-center gap-2"
      >
        <div className="relative">
          <motion.div
            className="w-2 h-2 bg-destructive rounded-full"
            animate={{
              boxShadow: [
                "0 0 0 0 hsl(var(--destructive) / 0.7)",
                "0 0 0 8px hsl(var(--destructive) / 0)",
                "0 0 0 0 hsl(var(--destructive) / 0)"
              ]
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeOut"
            }}
          />
        </div>
        <span className="text-sm font-semibold text-foreground">LIVE</span>
      </motion.div>
      {viewers !== undefined && (
        <motion.span
          key={viewers}
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-sm text-muted-foreground"
        >
          {viewers.toLocaleString()} viewers
        </motion.span>
      )}
    </motion.div>
  );
};
