import * as React from "react";
import { cn } from "@/lib/utils";
import { motion, HTMLMotionProps } from "framer-motion";

interface LiquidGlassCardProps extends Omit<HTMLMotionProps<"div">, "children"> {
  children: React.ReactNode;
  variant?: "default" | "elevated" | "panel" | "glow-primary" | "glow-accent";
  shimmer?: boolean;
  animatedBorder?: boolean;
  hoverEffect?: boolean;
  className?: string;
}

const LiquidGlassCard = React.forwardRef<HTMLDivElement, LiquidGlassCardProps>(
  (
    {
      children,
      variant = "default",
      shimmer = false,
      animatedBorder = false,
      hoverEffect = true,
      className,
      ...props
    },
    ref
  ) => {
    const baseClasses = cn(
      "relative overflow-hidden",
      {
        "liquid-glass-card": variant === "default",
        "liquid-glass-elevated": variant === "elevated",
        "liquid-glass-panel": variant === "panel",
        "liquid-glass-card liquid-glass-glow-primary": variant === "glow-primary",
        "liquid-glass-card liquid-glass-glow-accent": variant === "glow-accent",
      },
      shimmer && "liquid-glass-shimmer",
      animatedBorder && "liquid-glass-border-animated",
      !hoverEffect && "hover:transform-none hover:shadow-none",
      className
    );

    return (
      <motion.div
        ref={ref}
        className={baseClasses}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        whileHover={hoverEffect ? { scale: 1.02 } : undefined}
        {...props}
      >
        {children}
      </motion.div>
    );
  }
);
LiquidGlassCard.displayName = "LiquidGlassCard";

interface LiquidGlassIconProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: "sm" | "md" | "lg" | "xl";
}

const LiquidGlassIcon = React.forwardRef<HTMLDivElement, LiquidGlassIconProps>(
  ({ children, size = "md", className, ...props }, ref) => {
    const sizeClasses = {
      sm: "w-10 h-10",
      md: "w-14 h-14",
      lg: "w-18 h-18",
      xl: "w-24 h-24",
    };

    return (
      <div
        ref={ref}
        className={cn("liquid-glass-icon", sizeClasses[size], className)}
        {...props}
      >
        {children}
      </div>
    );
  }
);
LiquidGlassIcon.displayName = "LiquidGlassIcon";

interface LiquidGlassButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "primary" | "accent";
}

const LiquidGlassButton = React.forwardRef<
  HTMLButtonElement,
  LiquidGlassButtonProps
>(({ children, variant = "default", className, ...props }, ref) => {
  return (
    <motion.button
      ref={ref}
      className={cn(
        "liquid-glass-button px-6 py-3 font-medium text-foreground cursor-pointer",
        variant === "primary" && "bg-primary/20 border-primary/40 text-primary",
        variant === "accent" && "bg-accent/20 border-accent/40 text-accent",
        className
      )}
      whileHover={{ scale: 1.03 }}
      whileTap={{ scale: 0.97 }}
      {...(props as any)}
    >
      {children}
    </motion.button>
  );
});
LiquidGlassButton.displayName = "LiquidGlassButton";

const LiquidGlassBadge = React.forwardRef<
  HTMLSpanElement,
  React.HTMLAttributes<HTMLSpanElement>
>(({ children, className, ...props }, ref) => {
  return (
    <span ref={ref} className={cn("liquid-glass-badge", className)} {...props}>
      {children}
    </span>
  );
});
LiquidGlassBadge.displayName = "LiquidGlassBadge";

interface LiquidGlassNavProps extends React.HTMLAttributes<HTMLElement> {
  sticky?: boolean;
}

const LiquidGlassNav = React.forwardRef<HTMLElement, LiquidGlassNavProps>(
  ({ children, sticky = true, className, ...props }, ref) => {
    return (
      <nav
        ref={ref}
        className={cn(
          "liquid-glass-nav",
          sticky && "sticky top-0 z-50",
          className
        )}
        {...props}
      >
        {children}
      </nav>
    );
  }
);
LiquidGlassNav.displayName = "LiquidGlassNav";

export {
  LiquidGlassCard,
  LiquidGlassIcon,
  LiquidGlassButton,
  LiquidGlassBadge,
  LiquidGlassNav,
};
