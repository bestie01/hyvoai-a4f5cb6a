import * as React from "react";
import { cn } from "@/lib/utils";

type Variant = "default" | "neon" | "raised" | "subtle";

interface GlassPanelProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: Variant;
  glow?: "none" | "cyan" | "magenta" | "violet";
  as?: keyof JSX.IntrinsicElements;
}

const variantClasses: Record<Variant, string> = {
  default:
    "bg-white/[0.04] backdrop-blur-2xl border border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.35)]",
  neon:
    "bg-white/[0.04] backdrop-blur-2xl border border-primary/30 shadow-[0_0_40px_-10px_hsl(var(--primary)/0.45)]",
  raised:
    "bg-gradient-to-br from-white/[0.07] to-white/[0.02] backdrop-blur-3xl border border-white/15 shadow-[0_20px_60px_-20px_rgba(0,0,0,0.6)]",
  subtle:
    "bg-white/[0.02] backdrop-blur-xl border border-white/[0.06]",
};

const glowClasses = {
  none: "",
  cyan: "shadow-[0_0_50px_-12px_hsl(var(--neon-cyan)/0.55)]",
  magenta: "shadow-[0_0_50px_-12px_hsl(var(--neon-magenta)/0.55)]",
  violet: "shadow-[0_0_50px_-12px_hsl(var(--neon-violet)/0.55)]",
};

export const GlassPanel = React.forwardRef<HTMLDivElement, GlassPanelProps>(
  ({ className, variant = "default", glow = "none", as: As = "div", ...props }, ref) => {
    const Comp = As as any;
    return (
      <Comp
        ref={ref}
        className={cn(
          "rounded-xl text-white transition-all duration-300",
          variantClasses[variant],
          glowClasses[glow],
          className,
        )}
        {...props}
      />
    );
  },
);
GlassPanel.displayName = "GlassPanel";
