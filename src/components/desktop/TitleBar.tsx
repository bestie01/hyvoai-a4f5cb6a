import { useEffect, useState } from "react";
import { Minus, Square, X, Copy } from "lucide-react";
import { motion } from "framer-motion";

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

  const btnBase =
    "h-full w-12 inline-flex items-center justify-center text-white/70 transition-all duration-150 ease-out active:scale-90";

  return (
    <div
      className="flex items-center justify-between h-9 select-none bg-[#0A0A0F]/95 backdrop-blur-xl border-b border-white/5 text-white"
      style={{ ['-webkit-app-region' as any]: 'drag' }}
    >
      <div className="flex items-center gap-2 px-3">
        <div className="w-2 h-2 rounded-full bg-gradient-to-br from-blue-400 to-violet-500 shadow-[0_0_8px_rgba(96,165,250,0.6)]" />
        <span className="text-xs font-semibold tracking-wide text-white/80">Hyvo.ai · Stream Studio</span>
      </div>
      <div
        className="flex items-center h-full"
        style={{ ['-webkit-app-region' as any]: 'no-drag' }}
      >
        <motion.button
          aria-label="Minimize"
          whileHover={{ backgroundColor: "rgba(255,255,255,0.10)" }}
          whileTap={{ scale: 0.88 }}
          onClick={() => api?.minimize?.()}
          className={btnBase}
        >
          <Minus className="w-3.5 h-3.5" />
        </motion.button>
        <motion.button
          aria-label={maximized ? "Restore" : "Maximize"}
          whileHover={{ backgroundColor: "rgba(255,255,255,0.10)" }}
          whileTap={{ scale: 0.88 }}
          onClick={() => api?.maximizeToggle?.()}
          className={btnBase}
        >
          {maximized ? <Copy className="w-3 h-3" /> : <Square className="w-3 h-3" />}
        </motion.button>
        <motion.button
          aria-label="Close"
          whileHover={{ backgroundColor: "rgb(239,68,68)", color: "#fff" }}
          whileTap={{ scale: 0.88 }}
          onClick={() => api?.close?.()}
          className={btnBase + " hover:text-white"}
        >
          <X className="w-3.5 h-3.5" />
        </motion.button>
      </div>
    </div>
  );
}
