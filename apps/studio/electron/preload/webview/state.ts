import { WebviewChannels } from '@aether/models/constants';
import { ipcRenderer } from 'electron';

export function setWebviewId(webviewId: string) {
    (window as any)._aetherWebviewId = webviewId;
}

export function getWebviewId(): string {
    const webviewId = (window as any)._aetherWebviewId;
    if (!webviewId) {
        console.warn('Webview id not found');
        ipcRenderer.sendToHost(WebviewChannels.GET_WEBVIEW_ID);
        return '';
    }
    return webviewId;
}
