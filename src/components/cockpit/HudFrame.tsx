import { motion } from "framer-motion";

/**
 * Immersive HUD chrome for the desktop command centre: corner brackets,
 * scanning sweep, fine grid and vignette. Purely decorative.
 */
export function HudFrame() {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
      {/* fine grid */}
      <div className="absolute inset-0 opacity-[0.18] bg-[linear-gradient(hsl(var(--neon-cyan)/0.25)_1px,transparent_1px),linear-gradient(90deg,hsl(var(--neon-cyan)/0.25)_1px,transparent_1px)] [background-size:64px_64px]" />

      {/* core bloom */}
      <div className="absolute left-1/2 top-1/2 h-[52rem] w-[52rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(circle,hsl(var(--neon-cyan)/0.14),transparent_62%)]" />
      <div className="absolute -left-40 bottom-0 h-[30rem] w-[30rem] rounded-full bg-[radial-gradient(circle,hsl(var(--primary)/0.12),transparent_65%)]" />

      {/* scan sweep */}
      <motion.div
        className="absolute inset-x-0 h-40 bg-[linear-gradient(to_bottom,transparent,hsl(var(--neon-cyan)/0.07),transparent)]"
        initial={{ y: "-20%" }}
        animate={{ y: ["-20%", "120%"] }}
        transition={{ duration: 9, repeat: Infinity, ease: "linear" }}
      />

      {/* scanlines */}
      <div className="absolute inset-0 opacity-[0.07] bg-[repeating-linear-gradient(to_bottom,hsl(var(--neon-cyan)/0.6)_0px,hsl(var(--neon-cyan)/0.6)_1px,transparent_1px,transparent_4px)]" />

      {/* vignette */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_45%,hsl(var(--background))_100%)]" />

      {/* corner brackets */}
      {[
        "left-4 top-4 border-l-2 border-t-2",
        "right-4 top-4 border-r-2 border-t-2",
        "left-4 bottom-4 border-l-2 border-b-2",
        "right-4 bottom-4 border-r-2 border-b-2",
      ].map((cls) => (
        <span key={cls} className={`absolute h-10 w-10 rounded-[3px] border-[hsl(var(--neon-cyan)/0.45)] ${cls}`} />
      ))}

      {/* edge ticks */}
      <div className="absolute left-0 top-1/2 h-40 w-px -translate-y-1/2 bg-[repeating-linear-gradient(to_bottom,hsl(var(--neon-cyan)/0.5)_0px,hsl(var(--neon-cyan)/0.5)_2px,transparent_2px,transparent_10px)]" />
      <div className="absolute right-0 top-1/2 h-40 w-px -translate-y-1/2 bg-[repeating-linear-gradient(to_bottom,hsl(var(--neon-cyan)/0.5)_0px,hsl(var(--neon-cyan)/0.5)_2px,transparent_2px,transparent_10px)]" />
    </div>
  );
}
