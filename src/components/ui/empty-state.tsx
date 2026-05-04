import { ReactNode } from "react";
import { LucideIcon } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface EmptyStateProps {
  icon?: LucideIcon;
  illustration?: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
  className?: string;
}

/**
 * Standardized empty state used across dashboards, lists, and panels.
 * Pass either `illustration` (custom SVG) or `icon` (Lucide).
 */
export function EmptyState({
  icon: Icon,
  illustration,
  title,
  description,
  action,
  className,
}: EmptyStateProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className={cn(
        "flex flex-col items-center justify-center text-center px-6 py-14 rounded-[var(--radius-lg)] border border-dashed border-border/60 bg-muted/20 backdrop-blur-sm",
        className
      )}
    >
      {illustration ? (
        <div className="relative mb-5">
          <div className="absolute inset-0 -z-10 blur-2xl opacity-40 bg-gradient-to-br from-primary/40 to-accent/30 rounded-full animate-pulse" />
          {illustration}
        </div>
      ) : (
        Icon && (
          <div className="relative w-14 h-14 rounded-full bg-muted/60 flex items-center justify-center mb-4">
            <div className="absolute inset-0 -z-10 blur-xl opacity-50 bg-primary/30 rounded-full animate-pulse" />
            <Icon className="w-6 h-6 text-muted-foreground" />
          </div>
        )
      )}
      <h3 className="text-base font-semibold text-foreground">{title}</h3>
      {description && (
        <p className="text-sm text-muted-foreground mt-1.5 max-w-sm leading-relaxed">
          {description}
        </p>
      )}
      {action && <div className="mt-5">{action}</div>}
    </motion.div>
  );
}
