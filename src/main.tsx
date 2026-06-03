import React from 'react'
import { createRoot } from 'react-dom/client'
import { HelmetProvider } from 'react-helmet-async'
import App from './App.tsx'
import './index.css'

const root = document.getElementById("root")!;
createRoot(root).render(
  <HelmetProvider>
    <App />
  </HelmetProvider>
);

// Crossfade: reveal root and fade splash on the same frame for a seamless hand-off.
const reveal = () => {
  root.classList.add('ready');
  const el = document.getElementById('boot-splash');
  if (el) {
    el.classList.add('hide');
    setTimeout(() => el.remove(), 500);
  }
};
const schedule: (cb: () => void) => void =
  (window as any).requestIdleCallback?.bind(window) ?? ((cb) => setTimeout(cb, 50));
requestAnimationFrame(() => schedule(reveal));
