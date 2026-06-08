const { app, BrowserWindow, Menu, Tray, nativeImage, ipcMain, globalShortcut, dialog, screen, session, shell } = require('electron');
const path = require('path');
const fs = require('fs');
const { URL } = require('url');
const { AutoUpdater } = require('./auto-updater');

// ===== Allowlists =====
const EXTERNAL_HOST_ALLOWLIST = [
  'stripe.com', 'checkout.stripe.com', 'billing.stripe.com',
  'supabase.co', 'supabase.com',
  'twitch.tv', 'www.twitch.tv', 'id.twitch.tv',
  'youtube.com', 'www.youtube.com', 'studio.youtube.com', 'accounts.google.com',
  'hyvoai.lovable.app', 'lovable.app',
  'github.com', 'api.github.com',
  'discord.com', 'discord.gg',
];
function isAllowedExternalUrl(rawUrl) {
  try {
    const u = new URL(rawUrl);
    if (u.protocol !== 'https:' && u.protocol !== 'http:') return false;
    return EXTERNAL_HOST_ALLOWLIST.some((host) => u.hostname === host || u.hostname.endsWith('.' + host));
  } catch { return false; }
}

// ===== IPC sender validation =====
// Only accept IPC from our own packaged file:// origin or the dev server.
function isValidSender(event) {
  try {
    if (!event || !event.senderFrame) return false;
    const url = event.senderFrame.url || '';
    if (app.isPackaged) {
      return url.startsWith('file://');
    }
    return url.startsWith('http://localhost:5173') || url.startsWith('http://127.0.0.1:5173') || url.startsWith('file://');
  } catch { return false; }
}
function secureHandle(channel, handler) {
  ipcMain.handle(channel, async (event, ...args) => {
    if (!isValidSender(event)) {
      console.warn(`[IPC] Rejected ${channel} from untrusted sender: ${event?.senderFrame?.url}`);
      throw new Error('Untrusted IPC sender');
    }
    return handler(event, ...args);
  });
}

// ---- Window state persistence ----
function getStateFile() { return path.join(app.getPath('userData'), 'window-state.json'); }
function loadWindowState() {
  try { return JSON.parse(fs.readFileSync(getStateFile(), 'utf8')); } catch { return null; }
}
let saveTimer = null;
function saveWindowState(win) {
  if (!win || win.isDestroyed()) return;
  if (saveTimer) clearTimeout(saveTimer);
  saveTimer = setTimeout(() => {
    try {
      const isMax = win.isMaximized();
      const isFs = win.isFullScreen();
      const bounds = win.getNormalBounds ? win.getNormalBounds() : win.getBounds();
      fs.writeFileSync(getStateFile(), JSON.stringify({ ...bounds, maximized: isMax, fullScreen: isFs }));
    } catch (e) { /* ignore */ }
  }, 300);
}
function validateBounds(b) {
  if (!b) return null;
  const displays = screen.getAllDisplays();
  const onScreen = displays.some((d) => {
    const wa = d.workArea;
    return b.x + b.width > wa.x && b.x < wa.x + wa.width &&
           b.y + b.height > wa.y && b.y < wa.y + wa.height;
  });
  return onScreen ? b : null;
}

let mainWindow;
let splashWindow;
let tray;
let autoUpdater;
let registeredShortcuts = new Map();

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

// ===== Content Security Policy =====
const CSP = [
  "default-src 'self'",
  "script-src 'self' 'wasm-unsafe-eval'",
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
  "font-src 'self' https://fonts.gstatic.com data:",
  "img-src 'self' data: blob: https:",
  "media-src 'self' blob:",
  "connect-src 'self' https://*.supabase.co wss://*.supabase.co https://api.stripe.com https://api.github.com",
  "frame-src https://js.stripe.com https://checkout.stripe.com",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
].join('; ');

function applyCspHeaders() {
  session.defaultSession.webRequest.onHeadersReceived((details, callback) => {
    callback({
      responseHeaders: {
        ...details.responseHeaders,
        'Content-Security-Policy': [CSP],
        'X-Content-Type-Options': ['nosniff'],
        'X-Frame-Options': ['DENY'],
        'Referrer-Policy': ['strict-origin-when-cross-origin'],
      },
    });
  });
}

function createSplash() {
  splashWindow = new BrowserWindow({
    width: 420, height: 260,
    frame: false, transparent: true, alwaysOnTop: true,
    resizable: false, movable: false, skipTaskbar: true,
    backgroundColor: '#00000000',
    webPreferences: { nodeIntegration: false, contextIsolation: true, sandbox: true },
  });
  splashWindow.loadFile(path.join(__dirname, '..', 'splash.html')).catch(() => {});
  splashWindow.on('closed', () => { splashWindow = null; });
}

function createWindow() {
  const saved = loadWindowState();
  const validBounds = validateBounds(saved);

  mainWindow = new BrowserWindow({
    width: validBounds?.width || 1400,
    height: validBounds?.height || 900,
    x: validBounds?.x,
    y: validBounds?.y,
    minWidth: 1024,
    minHeight: 768,
    title: 'Hyvo Stream Studio',
    icon: path.join(__dirname, '../app/icons/appIcon.png'),
    frame: false,
    titleBarStyle: process.platform === 'darwin' ? 'hiddenInset' : 'hidden',
    ...(process.platform !== 'darwin' && {
      titleBarOverlay: { color: '#0A0A0F', symbolColor: '#ffffff', height: 36 },
    }),
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      sandbox: true,
      webSecurity: true,
      allowRunningInsecureContent: false,
      experimentalFeatures: false,
      preload: path.join(__dirname, 'preload.js'),
    },
    show: false,
    backgroundColor: '#0a0a0f',
  });

  // Block all in-app navigation away from our origin.
  mainWindow.webContents.on('will-navigate', (e, url) => {
    const allowed = url.startsWith('file://') || url.startsWith('http://localhost:5173');
    if (!allowed) {
      e.preventDefault();
      if (isAllowedExternalUrl(url)) shell.openExternal(url);
    }
  });
  // Force any window.open to the system browser (and only if allowlisted).
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    if (isAllowedExternalUrl(url)) shell.openExternal(url);
    return { action: 'deny' };
  });
  // Deny any permission request (camera/mic come via getUserMedia which is
  // handled by the renderer; OS-level prompts are not needed here).
  mainWindow.webContents.session.setPermissionRequestHandler((_wc, _perm, cb) => cb(false));

  if (saved?.maximized) mainWindow.maximize();
  if (saved?.fullScreen) mainWindow.setFullScreen(true);

  if (app.isPackaged) {
    const indexPath = path.join(__dirname, '../app/index.html');
    mainWindow.loadFile(indexPath).catch((err) => {
      dialog.showErrorBox('Failed to Load App', `Could not load the application.\n\n${err.message}`);
    });
  } else {
    mainWindow.loadURL('http://localhost:5173');
  }

  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
    if (splashWindow && !splashWindow.isDestroyed()) {
      try { splashWindow.webContents.executeJavaScript("document.body.classList.add('fade-out')"); } catch {}
    }
    setTimeout(() => {
      if (splashWindow && !splashWindow.isDestroyed()) splashWindow.close();
    }, 350);
  });

  mainWindow.on('maximize', () => { mainWindow.webContents.send('window-maximize-changed', true); saveWindowState(mainWindow); });
  mainWindow.on('unmaximize', () => { mainWindow.webContents.send('window-maximize-changed', false); saveWindowState(mainWindow); });
  mainWindow.on('resize', () => saveWindowState(mainWindow));
  mainWindow.on('move', () => saveWindowState(mainWindow));
  mainWindow.on('enter-full-screen', () => saveWindowState(mainWindow));
  mainWindow.on('leave-full-screen', () => saveWindowState(mainWindow));

  mainWindow.on('close', (event) => {
    saveWindowState(mainWindow);
    if (process.platform === 'darwin') { event.preventDefault(); mainWindow.hide(); }
  });
  mainWindow.on('closed', () => { mainWindow = null; });

  createMenu();
  createTray();
}

function createMenu() {
  const template = [
    { label: 'File', submenu: [{ role: 'quit' }] },
    { label: 'Edit', submenu: [
      { role: 'undo' }, { role: 'redo' }, { type: 'separator' },
      { role: 'cut' }, { role: 'copy' }, { role: 'paste' }, { role: 'selectAll' }
    ] },
    { label: 'View', submenu: [
      { role: 'reload' }, { role: 'forceReload' }, { role: 'toggleDevTools' },
      { type: 'separator' },
      { role: 'resetZoom' }, { role: 'zoomIn' }, { role: 'zoomOut' },
      { type: 'separator' }, { role: 'togglefullscreen' }
    ] },
    { label: 'Help', submenu: [
      { label: 'Check for Updates', click: () => { if (autoUpdater) autoUpdater.checkForUpdates(false); } },
      { type: 'separator' },
      { label: 'About Hyvo Stream Studio', click: () => {
        dialog.showMessageBox(mainWindow, {
          type: 'info',
          title: 'About Hyvo Stream Studio',
          message: 'Hyvo Stream Studio',
          detail: `Version: ${app.getVersion()}\n\nAI-powered streaming assistant for professional broadcasters.`,
        });
      } }
    ] }
  ];

  if (process.platform === 'darwin') {
    template.unshift({
      label: app.name,
      submenu: [
        { role: 'about' }, { type: 'separator' },
        { label: 'Check for Updates', click: () => { if (autoUpdater) autoUpdater.checkForUpdates(false); } },
        { type: 'separator' }, { role: 'services' }, { type: 'separator' },
        { role: 'hide' }, { role: 'hideOthers' }, { role: 'unhide' },
        { type: 'separator' }, { role: 'quit' }
      ]
    });
  }

  Menu.setApplicationMenu(Menu.buildFromTemplate(template));
}

function createTray() {
  const iconPath = path.join(__dirname, '../app/icons/appIcon.png');
  const icon = nativeImage.createFromPath(iconPath).resize({ width: 16, height: 16 });
  tray = new Tray(icon);
  const contextMenu = Menu.buildFromTemplate([
    { label: 'Open Hyvo Stream Studio', click: () => { if (mainWindow) mainWindow.show(); } },
    { type: 'separator' },
    { label: 'Check for Updates', click: () => { if (autoUpdater) autoUpdater.checkForUpdates(false); } },
    { type: 'separator' },
    { label: 'Quit', click: () => app.quit() }
  ]);
  tray.setToolTip('Hyvo Stream Studio');
  tray.setContextMenu(contextMenu);
  tray.on('click', () => { if (mainWindow) mainWindow.show(); });
}

app.whenReady().then(() => {
  applyCspHeaders();
  createSplash();
  createWindow();

  if (app.isPackaged) {
    autoUpdater = new AutoUpdater(mainWindow);
    autoUpdater.startPeriodicChecks();
  }

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
    else if (mainWindow) mainWindow.show();
  });
});

// Process-level hardening
app.on('web-contents-created', (_e, contents) => {
  contents.on('will-attach-webview', (e) => e.preventDefault());
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

// ===== IPC Handlers (all sender-validated) =====
secureHandle('check-for-updates', () => { if (autoUpdater) autoUpdater.checkForUpdates(false); });
secureHandle('get-app-version', () => app.getVersion());
secureHandle('install-update', () => { if (autoUpdater) autoUpdater.installUpdate(); });
secureHandle('get-update-status', () => autoUpdater ? autoUpdater.getStatus() : { status: 'idle' });

// Local Recording
secureHandle('save-recording', async (_event, { buffer, filename }) => {
  try {
    if (typeof filename !== 'string' || !/^[\w\-. ]+\.(webm|mp4|mkv)$/i.test(filename)) {
      throw new Error('Invalid filename');
    }
    const recordingsDir = path.join(app.getPath('documents'), 'Hyvo Recordings');
    if (!fs.existsSync(recordingsDir)) fs.mkdirSync(recordingsDir, { recursive: true });
    const filePath = path.join(recordingsDir, filename);
    // Prevent directory traversal escapes
    if (!filePath.startsWith(recordingsDir)) throw new Error('Invalid path');
    fs.writeFileSync(filePath, Buffer.from(buffer));
    return { success: true, path: filePath };
  } catch (error) {
    return { success: false, error: error.message };
  }
});
secureHandle('get-recordings-path', () => path.join(app.getPath('documents'), 'Hyvo Recordings'));
secureHandle('open-recordings-folder', async () => {
  const recordingsDir = path.join(app.getPath('documents'), 'Hyvo Recordings');
  if (!fs.existsSync(recordingsDir)) fs.mkdirSync(recordingsDir, { recursive: true });
  await shell.openPath(recordingsDir);
  return true;
});

// Global Hotkeys
secureHandle('register-hotkey', (_event, { id, accelerator }) => {
  try {
    if (typeof id !== 'string' || typeof accelerator !== 'string') throw new Error('Invalid args');
    if (registeredShortcuts.has(id)) globalShortcut.unregister(registeredShortcuts.get(id));
    const success = globalShortcut.register(accelerator, () => {
      if (mainWindow) mainWindow.webContents.send('hotkey-triggered', { id });
    });
    if (success) registeredShortcuts.set(id, accelerator);
    return { success, accelerator };
  } catch (error) {
    return { success: false, error: error.message };
  }
});
secureHandle('unregister-hotkey', (_event, { id }) => {
  if (registeredShortcuts.has(id)) {
    globalShortcut.unregister(registeredShortcuts.get(id));
    registeredShortcuts.delete(id);
    return true;
  }
  return false;
});
secureHandle('unregister-all-hotkeys', () => {
  globalShortcut.unregisterAll();
  registeredShortcuts.clear();
  return true;
});

secureHandle('get-gpu-info', async () => app.getGPUInfo('complete'));

// Window controls (custom title bar)
secureHandle('window-minimize', () => { if (mainWindow) mainWindow.minimize(); });
secureHandle('window-maximize-toggle', () => {
  if (!mainWindow) return false;
  if (mainWindow.isMaximized()) mainWindow.unmaximize(); else mainWindow.maximize();
  return mainWindow.isMaximized();
});
secureHandle('window-close', () => { if (mainWindow) mainWindow.close(); });
secureHandle('window-is-maximized', () => mainWindow ? mainWindow.isMaximized() : false);

// Open external URL — restricted to allowlist
secureHandle('open-external', async (_event, url) => {
  if (typeof url !== 'string') return false;
  if (!isAllowedExternalUrl(url)) {
    console.warn('[IPC] open-external blocked for non-allowlisted host:', url);
    return false;
  }
  await shell.openExternal(url);
  return true;
});

app.on('will-quit', () => globalShortcut.unregisterAll());
