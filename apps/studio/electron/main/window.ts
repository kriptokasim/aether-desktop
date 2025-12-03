import { BrowserWindow } from 'electron';

export let mainWindow: BrowserWindow | null = null;

export function setMainWindow(win: BrowserWindow | null) {
    mainWindow = win;
}
