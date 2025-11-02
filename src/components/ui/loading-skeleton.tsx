import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

interface LoadingSkeletonProps {
  className?: string;
  count?: number;
}

export const LoadingSkeleton = ({ 
  className = "", 
  count = 1 
}: LoadingSkeletonProps) => {
  return (
    <>
      {Array.from({ length: count }).map((_, index) => (
        <motion.div
          key={index}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: index * 0.1 }}
          className={cn("relative overflow-hidden rounded-md bg-muted", className)}
        >
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-transparent via-muted-foreground/10 to-transparent"
            animate={{
              x: ["-100%", "100%"]
            }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
        </motion.div>
      ))}
    </>
  );
};
