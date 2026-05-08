import { ReactNode } from "react";
import { HyvoSidebar } from "./HyvoSidebar";

interface AppShellProps {
  children: ReactNode;
  /** Set true for cockpit pages (Studio) that should be edge-to-edge with no padding. */
  bleed?: boolean;
}

/**
 * Persistent desktop-app shell: fixed branded sidebar + content area.
 * Used for all authenticated, in-app routes. No marketing chrome.
 */
export function AppShell({ children, bleed = false }: AppShellProps) {
  return (
    <div className="h-screen w-screen overflow-hidden flex liquid-glass-mesh text-white">
      <HyvoSidebar />
      <main className={`flex-1 h-full overflow-auto ${bleed ? "" : "p-6"}`}>
        {children}
      </main>
    </div>
  );
}
