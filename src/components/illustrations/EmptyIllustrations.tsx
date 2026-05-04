import { cn } from "@/lib/utils";

interface IllustrationProps {
  className?: string;
}

const baseGradients = (
  <defs>
    <linearGradient id="empty-grad-primary" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity="0.9" />
      <stop offset="100%" stopColor="hsl(var(--accent))" stopOpacity="0.6" />
    </linearGradient>
    <linearGradient id="empty-grad-soft" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity="0.18" />
      <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity="0" />
    </linearGradient>
  </defs>
);

export function NoStreamsIllustration({ className }: IllustrationProps) {
  return (
    <svg viewBox="0 0 160 120" className={cn("w-32 h-24", className)} fill="none">
      {baseGradients}
      <rect x="20" y="20" width="120" height="70" rx="10" fill="url(#empty-grad-soft)" stroke="hsl(var(--border))" />
      <circle cx="80" cy="55" r="14" fill="url(#empty-grad-primary)" className="animate-pulse" />
      <path d="M75 49l12 6-12 6V49z" fill="hsl(var(--background))" />
      <rect x="50" y="98" width="60" height="4" rx="2" fill="hsl(var(--muted))" />
    </svg>
  );
}

export function NoChatIllustration({ className }: IllustrationProps) {
  return (
    <svg viewBox="0 0 160 120" className={cn("w-32 h-24", className)} fill="none">
      {baseGradients}
      <rect x="20" y="25" width="80" height="40" rx="12" fill="url(#empty-grad-primary)" opacity="0.85" />
      <rect x="60" y="55" width="80" height="40" rx="12" fill="hsl(var(--muted))" stroke="hsl(var(--border))" />
      <circle cx="40" cy="45" r="3" fill="hsl(var(--background))" />
      <circle cx="55" cy="45" r="3" fill="hsl(var(--background))" />
      <circle cx="70" cy="45" r="3" fill="hsl(var(--background))" />
    </svg>
  );
}

export function NoAnalyticsIllustration({ className }: IllustrationProps) {
  return (
    <svg viewBox="0 0 160 120" className={cn("w-32 h-24", className)} fill="none">
      {baseGradients}
      <rect x="20" y="20" width="120" height="80" rx="10" fill="url(#empty-grad-soft)" stroke="hsl(var(--border))" />
      {[40, 65, 50, 80, 55].map((h, i) => (
        <rect
          key={i}
          x={32 + i * 22}
          y={90 - h}
          width="14"
          height={h}
          rx="3"
          fill="url(#empty-grad-primary)"
          opacity={0.55 + i * 0.08}
        />
      ))}
    </svg>
  );
}

export function NoScheduleIllustration({ className }: IllustrationProps) {
  return (
    <svg viewBox="0 0 160 120" className={cn("w-32 h-24", className)} fill="none">
      {baseGradients}
      <rect x="25" y="25" width="110" height="80" rx="10" fill="hsl(var(--card))" stroke="hsl(var(--border))" />
      <rect x="25" y="25" width="110" height="18" rx="10" fill="url(#empty-grad-primary)" />
      {[0, 1, 2].map((row) =>
        [0, 1, 2, 3, 4].map((col) => (
          <rect
            key={`${row}-${col}`}
            x={35 + col * 19}
            y={52 + row * 16}
            width="14"
            height="10"
            rx="2"
            fill={row === 1 && col === 2 ? "url(#empty-grad-primary)" : "hsl(var(--muted))"}
          />
        ))
      )}
    </svg>
  );
}
