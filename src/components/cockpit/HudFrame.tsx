/**
 * Immersive HUD chrome for the desktop command centre: corner brackets,
 * scanning sweep, fine grid and vignette. Purely decorative.
 */
export function HudFrame() {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
      <div className="absolute inset-0 opacity-[0.12] bg-[linear-gradient(hsl(var(--accent)/0.24)_1px,transparent_1px),linear-gradient(90deg,hsl(var(--accent)/0.24)_1px,transparent_1px)] [background-size:72px_72px]" />

      {/* corner brackets */}
      {[
        "left-4 top-4 border-l-2 border-t-2",
        "right-4 top-4 border-r-2 border-t-2",
        "left-4 bottom-4 border-l-2 border-b-2",
        "right-4 bottom-4 border-r-2 border-b-2",
      ].map((cls) => (
        <span key={cls} className={`absolute h-8 w-8 border-accent/40 ${cls}`} />
      ))}

    </div>
  );
}
