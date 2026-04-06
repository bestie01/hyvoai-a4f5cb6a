const { app, BrowserWindow, Menu, Tray, nativeImage, ipcMain, globalShortcut, dialog } = require('electron');
const path = require('path');
const fs = require('fs');
const { AutoUpdater } = require('./auto-updater');

let mainWindow;
let tray;
let autoUpdater;
let isRecording = false;
let registeredShortcuts = new Map();

// Prevent multiple instances
const gotTheLock = app.requestSingleInstanceLock();

if (!gotTheLock) {
  app.quit();
} else {
  app.on('second-instance', () => {
    if (mainWindow) {
      if (mainWindow.isMinimized()) mainWindow.restore();
      mainWindow.focus();
    }
  });
}

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 1024,
    minHeight: 768,
    title: 'Hyvo Stream Studio',
    icon: path.join(__dirname, '../app/icons/appIcon.png'),
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js')
    },
    show: false,
    backgroundColor: '#0a0a0f'
  });

  // Load the app
  const indexPath = path.join(__dirname, '../app/index.html');
  if (app.isPackaged) {
    console.log('[Electron] Loading file:', indexPath);
    mainWindow.loadFile(indexPath).catch((err) => {
      console.error('[Electron] Failed to load index.html:', err);
      dialog.showErrorBox(
        'Failed to Load App',
        `Could not load the application.\n\nExpected file: ${indexPath}\n\nError: ${err.message}`
      );
    });
  } else {
    // In development, load from localhost
    mainWindow.loadURL('http://localhost:5173');
  }

  // Show window when ready
  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
  });

  // Handle window close
  mainWindow.on('close', (event) => {
    if (process.platform === 'darwin') {
      event.preventDefault();
      mainWindow.hide();
    }
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  // Create application menu
  createMenu();
  
  // Create system tray
  createTray();
}

function createMenu() {
  const template = [
    {
      label: 'File',
      submenu: [
        { role: 'quit' }
      ]
    },
    {
      label: 'Edit',
      submenu: [
        { role: 'undo' },
        { role: 'redo' },
        { type: 'separator' },
        { role: 'cut' },
        { role: 'copy' },
        { role: 'paste' },
        { role: 'selectAll' }
      ]
    },
    {
      label: 'View',
      submenu: [
        { role: 'reload' },
        { role: 'forceReload' },
        { role: 'toggleDevTools' },
        { type: 'separator' },
        { role: 'resetZoom' },
        { role: 'zoomIn' },
        { role: 'zoomOut' },
        { type: 'separator' },
        { role: 'togglefullscreen' }
      ]
    },
    {
      label: 'Help',
      submenu: [
        {
          label: 'Check for Updates',
          click: () => {
            if (autoUpdater) {
              autoUpdater.checkForUpdates(false);
            }
          }
        },
        { type: 'separator' },
        {
          label: 'About Hyvo Stream Studio',
          click: () => {
            const { dialog } = require('electron');
            dialog.showMessageBox(mainWindow, {
              type: 'info',
              title: 'About Hyvo Stream Studio',
              message: 'Hyvo Stream Studio',
              detail: `Version: ${app.getVersion()}\n\nAI-powered streaming assistant for professional broadcasters.`
            });
          }
        }
      ]
    }
  ];

  // macOS specific menu
  if (process.platform === 'darwin') {
    template.unshift({
      label: app.name,
      submenu: [
        { role: 'about' },
        { type: 'separator' },
        {
          label: 'Check for Updates',
          click: () => {
            if (autoUpdater) {
              autoUpdater.checkForUpdates(false);
            }
          }
        },
        { type: 'separator' },
        { role: 'services' },
        { type: 'separator' },
        { role: 'hide' },
        { role: 'hideOthers' },
        { role: 'unhide' },
        { type: 'separator' },
        { role: 'quit' }
      ]
    });
  }

  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);
}

function createTray() {
  const iconPath = path.join(__dirname, '../app/icons/appIcon.png');
  const icon = nativeImage.createFromPath(iconPath).resize({ width: 16, height: 16 });
  
  tray = new Tray(icon);
  
  const contextMenu = Menu.buildFromTemplate([
    { 
      label: 'Open Hyvo Stream Studio', 
      click: () => {
        if (mainWindow) {
          mainWindow.show();
        }
      }
    },
    { type: 'separator' },
    {
      label: 'Check for Updates',
      click: () => {
        if (autoUpdater) {
          autoUpdater.checkForUpdates(false);
        }
      }
    },
    { type: 'separator' },
    { 
      label: 'Quit', 
      click: () => {
        app.quit();
      }
    }
  ]);
  
  tray.setToolTip('Hyvo Stream Studio');
  tray.setContextMenu(contextMenu);
  
  tray.on('click', () => {
    if (mainWindow) {
      mainWindow.show();
    }
  });
}

// App lifecycle
app.whenReady().then(() => {
  createWindow();
  
  // Initialize auto-updater (only in production)
  if (app.isPackaged) {
    autoUpdater = new AutoUpdater();
    autoUpdater.startPeriodicChecks();
  }

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    } else if (mainWindow) {
      mainWindow.show();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// Handle IPC for manual update checks from renderer
ipcMain.handle('check-for-updates', () => {
  if (autoUpdater) {
    autoUpdater.checkForUpdates(false);
  }
});

ipcMain.handle('get-app-version', () => {
  return app.getVersion();
});

// ===== Local Recording Support =====
ipcMain.handle('save-recording', async (event, { buffer, filename }) => {
  try {
    const documentsPath = app.getPath('documents');
    const recordingsDir = path.join(documentsPath, 'Hyvo Recordings');
    
    if (!fs.existsSync(recordingsDir)) {
      fs.mkdirSync(recordingsDir, { recursive: true });
    }
    
    const filePath = path.join(recordingsDir, filename);
    fs.writeFileSync(filePath, Buffer.from(buffer));
    
    return { success: true, path: filePath };
  } catch (error) {
    console.error('Error saving recording:', error);
    return { success: false, error: error.message };
  }
});

ipcMain.handle('get-recordings-path', () => {
  const documentsPath = app.getPath('documents');
  return path.join(documentsPath, 'Hyvo Recordings');
});

ipcMain.handle('open-recordings-folder', async () => {
  const { shell } = require('electron');
  const documentsPath = app.getPath('documents');
  const recordingsDir = path.join(documentsPath, 'Hyvo Recordings');
  
  if (!fs.existsSync(recordingsDir)) {
    fs.mkdirSync(recordingsDir, { recursive: true });
  }
  
  await shell.openPath(recordingsDir);
  return true;
});

// ===== Global Hotkey System =====
ipcMain.handle('register-hotkey', (event, { id, accelerator, action }) => {
  try {
    // Unregister if already exists
    if (registeredShortcuts.has(id)) {
      globalShortcut.unregister(registeredShortcuts.get(id));
    }
    
    const success = globalShortcut.register(accelerator, () => {
      if (mainWindow) {
        mainWindow.webContents.send('hotkey-triggered', { id, action });
      }
    });
    
    if (success) {
      registeredShortcuts.set(id, accelerator);
    }
    
    return { success, accelerator };
  } catch (error) {
    console.error('Error registering hotkey:', error);
    return { success: false, error: error.message };
  }
});

ipcMain.handle('unregister-hotkey', (event, { id }) => {
  if (registeredShortcuts.has(id)) {
    globalShortcut.unregister(registeredShortcuts.get(id));
    registeredShortcuts.delete(id);
    return true;
  }
  return false;
});

ipcMain.handle('unregister-all-hotkeys', () => {
  globalShortcut.unregisterAll();
  registeredShortcuts.clear();
  return true;
});

// ===== Hardware Acceleration =====
ipcMain.handle('get-gpu-info', async () => {
  const gpuInfo = await app.getGPUInfo('complete');
  return gpuInfo;
});

// Clean up shortcuts on quit
app.on('will-quit', () => {
  globalShortcut.unregisterAll();
});
