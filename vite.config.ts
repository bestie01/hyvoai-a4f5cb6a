 import { defineConfig } from "vite";
 import react from "@vitejs/plugin-react-swc";
 import path from "path";
 import { componentTagger } from "lovable-tagger";
 import { VitePWA } from "vite-plugin-pwa";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [
    react(),
    mode === 'development' &&
    componentTagger(),
     VitePWA({
       registerType: "autoUpdate",
       includeAssets: ["favicon.ico", "hyvo-logo.png", "app-icon-1024.png"],
       manifest: {
         name: "Hyvo.ai - AI-Powered Streaming Assistant",
         short_name: "Hyvo.ai",
         description: "Automate streaming with AI. Schedule smarter, engage in real-time, create highlights automatically.",
         theme_color: "#8b5cf6",
         background_color: "#0A0A0F",
         display: "standalone",
         orientation: "portrait",
         start_url: "/dashboard",
         scope: "/",
         icons: [
           {
             src: "/app-icon-1024.png",
             sizes: "192x192",
             type: "image/png",
           },
           {
             src: "/app-icon-1024.png",
             sizes: "512x512",
             type: "image/png",
           },
           {
             src: "/app-icon-1024.png",
             sizes: "1024x1024",
             type: "image/png",
             purpose: "any maskable",
           },
         ],
       },
       workbox: {
         globPatterns: ["**/*.{js,css,html,ico,png,svg,woff2}"],
         runtimeCaching: [
           {
             urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
             handler: "CacheFirst",
             options: {
               cacheName: "google-fonts-cache",
               expiration: {
                 maxEntries: 10,
                 maxAgeSeconds: 60 * 60 * 24 * 365, // 1 year
               },
               cacheableResponse: {
                 statuses: [0, 200],
               },
             },
           },
           {
             urlPattern: /^https:\/\/fonts\.gstatic\.com\/.*/i,
             handler: "CacheFirst",
             options: {
               cacheName: "gstatic-fonts-cache",
               expiration: {
                 maxEntries: 10,
                 maxAgeSeconds: 60 * 60 * 24 * 365, // 1 year
               },
               cacheableResponse: {
                 statuses: [0, 200],
               },
             },
           },
         ],
       },
     }),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));
