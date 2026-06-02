import { useEffect, useState } from "react";
import { Minus, Square, X, Copy } from "lucide-react";

declare global {
  interface Window {
    electronAPI?: any;
  }
}

const isElectron = typeof window !== "undefined" && window.electronAPI?.isElectron === true;

export function TitleBar() {
  const [maximized, setMaximized] = useState(false);

  useEffect(() => {
    if (!isElectron) return;
    window.electronAPI.window?.isMaximized?.().then(setMaximized).catch(() => {});
    const off = window.electronAPI.window?.onMaximizeChanged?.((isMax: boolean) => setMaximized(isMax));
    return () => { if (typeof off === "function") off(); };
  }, []);

  if (!isElectron) return null;

  const api = window.electronAPI.window;

  return (
    <div
      className="flex items-center justify-between h-9 select-none bg-[#0A0A0F]/95 backdrop-blur-xl border-b border-white/5 text-white"
      style={{ ['-webkit-app-region' as any]: 'drag' }}
    >
      <div className="flex items-center gap-2 px-3">
        <div className="w-2 h-2 rounded-full bg-gradient-to-br from-blue-400 to-violet-500" />
        <span className="text-xs font-semibold tracking-wide text-white/80">Hyvo.ai · Stream Studio</span>
      </div>
      <div
        className="flex items-center h-full"
        style={{ ['-webkit-app-region' as any]: 'no-drag' }}
      >
        <button
          aria-label="Minimize"
          onClick={() => api?.minimize?.()}
          className="h-full w-12 inline-flex items-center justify-center text-white/70 hover:bg-white/10 transition-colors"
        >
          <Minus className="w-3.5 h-3.5" />
        </button>
        <button
          aria-label={maximized ? "Restore" : "Maximize"}
          onClick={() => api?.maximizeToggle?.()}
          className="h-full w-12 inline-flex items-center justify-center text-white/70 hover:bg-white/10 transition-colors"
        >
          {maximized ? <Copy className="w-3 h-3" /> : <Square className="w-3 h-3" />}
        </button>
        <button
          aria-label="Close"
          onClick={() => api?.close?.()}
          className="h-full w-12 inline-flex items-center justify-center text-white/70 hover:bg-red-500 hover:text-white transition-colors"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}
