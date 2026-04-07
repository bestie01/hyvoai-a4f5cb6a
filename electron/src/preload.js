const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  // Identity
  isElectron: true,
  platform: process.platform,

  // Auto-updates
  checkForUpdates: () => ipcRenderer.invoke('check-for-updates'),
  getAppVersion: () => ipcRenderer.invoke('get-app-version'),
  installUpdate: () => ipcRenderer.invoke('install-update'),
  getUpdateStatus: () => ipcRenderer.invoke('get-update-status'),
  onUpdateAvailable: (callback) => {
    const handler = (_event, info) => callback(info);
    ipcRenderer.on('update-available', handler);
    return () => ipcRenderer.removeListener('update-available', handler);
  },
  onUpdateDownloaded: (callback) => {
    const handler = (_event, info) => callback(info);
    ipcRenderer.on('update-downloaded', handler);
    return () => ipcRenderer.removeListener('update-downloaded', handler);
  },
  onUpdateProgress: (callback) => {
    const handler = (_event, info) => callback(info);
    ipcRenderer.on('update-progress', handler);
    return () => ipcRenderer.removeListener('update-progress', handler);
  },
  onUpdateError: (callback) => {
    const handler = (_event, error) => callback(error);
    ipcRenderer.on('update-error', handler);
    return () => ipcRenderer.removeListener('update-error', handler);
  },
  onUpdateChecking: (callback) => {
    const handler = () => callback();
    ipcRenderer.on('update-checking', handler);
    return () => ipcRenderer.removeListener('update-checking', handler);
  },
  onUpdateNotAvailable: (callback) => {
    const handler = () => callback();
    ipcRenderer.on('update-not-available', handler);
    return () => ipcRenderer.removeListener('update-not-available', handler);
  },

  // Local Recording
  saveRecording: (buffer, filename) => ipcRenderer.invoke('save-recording', { buffer, filename }),
  getRecordingsPath: () => ipcRenderer.invoke('get-recordings-path'),
  openRecordingsFolder: () => ipcRenderer.invoke('open-recordings-folder'),

  // Hotkeys
  registerHotkey: (id, accelerator, action) => ipcRenderer.invoke('register-hotkey', { id, accelerator, action }),
  unregisterHotkey: (id) => ipcRenderer.invoke('unregister-hotkey', { id }),
  unregisterAllHotkeys: () => ipcRenderer.invoke('unregister-all-hotkeys'),
  onHotkeyTriggered: (callback) => ipcRenderer.on('hotkey-triggered', (_event, data) => callback(data)),

  // Hardware Info
  getGPUInfo: () => ipcRenderer.invoke('get-gpu-info'),
});
