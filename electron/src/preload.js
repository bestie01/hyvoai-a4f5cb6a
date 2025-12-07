const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  // Auto-updates
  checkForUpdates: () => ipcRenderer.invoke('check-for-updates'),
  getAppVersion: () => ipcRenderer.invoke('get-app-version'),
  onUpdateAvailable: (callback) => ipcRenderer.on('update-available', callback),
  onUpdateDownloaded: (callback) => ipcRenderer.on('update-downloaded', callback),
  onUpdateProgress: (callback) => ipcRenderer.on('update-progress', callback),
  onUpdateError: (callback) => ipcRenderer.on('update-error', callback),
  
  // Local Recording
  saveRecording: (buffer, filename) => ipcRenderer.invoke('save-recording', { buffer, filename }),
  getRecordingsPath: () => ipcRenderer.invoke('get-recordings-path'),
  openRecordingsFolder: () => ipcRenderer.invoke('open-recordings-folder'),
  
  // Hotkeys
  registerHotkey: (id, accelerator, action) => ipcRenderer.invoke('register-hotkey', { id, accelerator, action }),
  unregisterHotkey: (id) => ipcRenderer.invoke('unregister-hotkey', { id }),
  unregisterAllHotkeys: () => ipcRenderer.invoke('unregister-all-hotkeys'),
  onHotkeyTriggered: (callback) => ipcRenderer.on('hotkey-triggered', (event, data) => callback(data)),
  
  // Hardware Info
  getGPUInfo: () => ipcRenderer.invoke('get-gpu-info'),
  
  // Platform detection
  isElectron: true,
  platform: process.platform,
});