import React from 'react'
import { createRoot } from 'react-dom/client'
import { HelmetProvider } from 'react-helmet-async'
import App from './App.tsx'
import './index.css'

createRoot(document.getElementById("root")!).render(
  <HelmetProvider>
    <App />
  </HelmetProvider>
);

// Fade out the boot splash once React paints.
requestAnimationFrame(() => {
  setTimeout(() => {
    const el = document.getElementById('boot-splash');
    if (el) {
      el.classList.add('hide');
      setTimeout(() => el.remove(), 400);
    }
  }, 150);
});
