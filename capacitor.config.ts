import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.lovable.016291d698de4ca99131b756a44a0c02',
  appName: 'Hyvo Stream Studio',
  webDir: 'dist',
  bundledWebRuntime: false,
  electron: {
    hiddenInset: false,
    tabbingIdentifier: 'com.hyvo.stream',
    windowOptions: {
      width: 1600,
      height: 900,
      minWidth: 1200,
      minHeight: 700,
      titleBarStyle: 'default',
      backgroundColor: '#0A0A0F',
      webPreferences: {
        nodeIntegration: false,
        contextIsolation: true,
        sandbox: true
      }
    }
  }
};

export default config;