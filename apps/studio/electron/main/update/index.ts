import electronUpdater from 'electron-updater';

import { MainChannels } from '@aether/models/constants';
import log from 'electron-log';
import { mainWindow } from '../window';

class AppUpdater {
    static instance: AppUpdater | null = null;

    static getInstance() {
        if (!AppUpdater.instance) {
            AppUpdater.instance = new AppUpdater();
        }
        return AppUpdater.instance;
    }

    private constructor() {
        if (AppUpdater.instance) {
            return AppUpdater.instance;
        }

        log.transports.file.level = 'info';
        electronUpdater.autoUpdater.logger = log;
        electronUpdater.autoUpdater.autoDownload = true;
        AppUpdater.instance = this;
    }

    async quitAndInstall() {
        electronUpdater.autoUpdater.quitAndInstall();
    }

    listen() {
        const checkForUpdates = () => {
            electronUpdater.autoUpdater.checkForUpdates().catch((err) => {
                log.error('Error checking for updates:', err);
            });
        };

        checkForUpdates();
        setInterval(checkForUpdates, 60 * 60 * 1000);

        electronUpdater.autoUpdater.on('update-available', () => {
            log.info('Update available');
        });

        electronUpdater.autoUpdater.on('update-not-available', () => {
            log.info('Update not available');
            mainWindow?.webContents.send(MainChannels.UPDATE_NOT_AVAILABLE);
        });

        electronUpdater.autoUpdater.on('download-progress', (progress) => {
            let log_message = 'Download speed: ' + progress.bytesPerSecond;
            log_message = log_message + ' - Downloaded ' + progress.percent + '%';
            log_message = log_message + ' (' + progress.transferred + '/' + progress.total + ')';
            log.info(log_message);
        });

        electronUpdater.autoUpdater.on('update-downloaded', () => {
            log.info('Update downloaded');
            mainWindow?.webContents.send(MainChannels.UPDATE_DOWNLOADED);
        });

        electronUpdater.autoUpdater.on('error', (err) => {
            log.error('AutoUpdater error:', err);
        });
    }
}

export default AppUpdater;
