const { autoUpdater } = require('electron-updater');
const { dialog, BrowserWindow } = require('electron');

class AutoUpdater {
  constructor() {
    this.isCheckingForUpdate = false;
    
    // Configure auto-updater
    autoUpdater.autoDownload = true;
    autoUpdater.autoInstallOnAppQuit = true;
    
    // Set up event handlers
    this.setupEventHandlers();
  }

  setupEventHandlers() {
    autoUpdater.on('checking-for-update', () => {
      console.log('Checking for updates...');
      this.isCheckingForUpdate = true;
    });

    autoUpdater.on('update-available', (info) => {
      console.log('Update available:', info.version);
      this.notifyUser('Update Available', `A new version (${info.version}) is being downloaded.`);
    });

    autoUpdater.on('update-not-available', (info) => {
      console.log('No updates available. Current version:', info.version);
      this.isCheckingForUpdate = false;
    });

    autoUpdater.on('error', (err) => {
      console.error('Auto-updater error:', err);
      this.isCheckingForUpdate = false;
    });

    autoUpdater.on('download-progress', (progressObj) => {
      const percent = Math.round(progressObj.percent);
      console.log(`Download progress: ${percent}%`);
      
      // Update window title with progress
      const mainWindow = BrowserWindow.getFocusedWindow();
      if (mainWindow) {
        mainWindow.setTitle(`Hyvo Stream Studio - Downloading update ${percent}%`);
      }
    });

    autoUpdater.on('update-downloaded', (info) => {
      console.log('Update downloaded:', info.version);
      this.isCheckingForUpdate = false;
      
      // Reset window title
      const mainWindow = BrowserWindow.getFocusedWindow();
      if (mainWindow) {
        mainWindow.setTitle('Hyvo Stream Studio');
      }
      
      // Prompt user to restart
      this.promptRestart(info.version);
    });
  }

  notifyUser(title, message) {
    const mainWindow = BrowserWindow.getFocusedWindow();
    if (mainWindow) {
      dialog.showMessageBox(mainWindow, {
        type: 'info',
        title: title,
        message: message,
        buttons: ['OK']
      });
    }
  }

  promptRestart(version) {
    const mainWindow = BrowserWindow.getFocusedWindow();
    const options = {
      type: 'info',
      title: 'Update Ready',
      message: `Version ${version} has been downloaded. Restart now to apply the update?`,
      buttons: ['Restart Now', 'Later'],
      defaultId: 0,
      cancelId: 1
    };

    dialog.showMessageBox(mainWindow, options).then((result) => {
      if (result.response === 0) {
        autoUpdater.quitAndInstall(false, true);
      }
    });
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

  // Schedule periodic update checks (every 4 hours)
  startPeriodicChecks() {
    // Check immediately on start
    setTimeout(() => this.checkForUpdates(true), 10000); // 10 seconds after launch
    
    // Then check every 4 hours
    setInterval(() => this.checkForUpdates(true), 4 * 60 * 60 * 1000);
  }
}

module.exports = { AutoUpdater };
