const { autoUpdater } = require('electron-updater');
const { dialog, BrowserWindow } = require('electron');

class AutoUpdater {
  constructor(mainWindow) {
    this.mainWindow = mainWindow;
    this.isCheckingForUpdate = false;
    this.status = { status: 'idle' };
    
    autoUpdater.autoDownload = true;
    autoUpdater.autoInstallOnAppQuit = true;
    
    this.setupEventHandlers();
  }

  sendToRenderer(channel, data) {
    try {
      if (this.mainWindow && !this.mainWindow.isDestroyed()) {
        this.mainWindow.webContents.send(channel, data);
      }
    } catch (e) {
      console.error('[AutoUpdater] Failed to send to renderer:', e);
    }
  }

  setupEventHandlers() {
    autoUpdater.on('checking-for-update', () => {
      console.log('Checking for updates...');
      this.isCheckingForUpdate = true;
      this.status = { status: 'checking' };
      this.sendToRenderer('update-checking');
    });

    autoUpdater.on('update-available', (info) => {
      console.log('Update available:', info.version);
      this.status = { status: 'available', version: info.version };
      this.sendToRenderer('update-available', { version: info.version, releaseNotes: info.releaseNotes });
    });

    autoUpdater.on('update-not-available', (info) => {
      console.log('No updates available. Current version:', info.version);
      this.isCheckingForUpdate = false;
      this.status = { status: 'idle' };
      this.sendToRenderer('update-not-available');
    });

    autoUpdater.on('error', (err) => {
      console.error('Auto-updater error:', err);
      this.isCheckingForUpdate = false;
      this.status = { status: 'error', error: err.message };
      this.sendToRenderer('update-error', { message: err.message });
    });

    autoUpdater.on('download-progress', (progressObj) => {
      const percent = Math.round(progressObj.percent);
      console.log(`Download progress: ${percent}%`);
      this.status = { status: 'downloading', percent };
      this.sendToRenderer('update-progress', { percent, bytesPerSecond: progressObj.bytesPerSecond, total: progressObj.total, transferred: progressObj.transferred });
    });

    autoUpdater.on('update-downloaded', (info) => {
      console.log('Update downloaded:', info.version);
      this.isCheckingForUpdate = false;
      this.status = { status: 'ready', version: info.version };
      this.sendToRenderer('update-downloaded', { version: info.version });
    });
  }

  installUpdate() {
    autoUpdater.quitAndInstall(false, true);
  }

  getStatus() {
    return this.status;
  }

  checkForUpdates(silent = true) {
    if (this.isCheckingForUpdate) {
      console.log('Already checking for updates');
      return;
    }

    if (silent) {
      autoUpdater.checkForUpdates().catch((err) => {
        console.error('Failed to check for updates:', err);
      });
    } else {
      autoUpdater.checkForUpdatesAndNotify().catch((err) => {
        console.error('Failed to check for updates:', err);
      });
    }
  }

  startPeriodicChecks() {
    setTimeout(() => this.checkForUpdates(true), 10000);
    setInterval(() => this.checkForUpdates(true), 4 * 60 * 60 * 1000);
  }
}

module.exports = { AutoUpdater };
