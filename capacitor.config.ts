import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.lovable.016291d698de4ca99131b756a44a0c02',
  appName: 'hyvo-stream-assist',
  webDir: 'dist',
  server: {
    url: 'https://016291d6-98de-4ca9-9131-b756a44a0c02.lovableproject.com?forceHideBadge=true',
    cleartext: true
  },
  bundledWebRuntime: false
};

export default config;