import chokidar from 'chokidar';
import { indexFile } from '../ai/embeddings';
import * as fs from 'fs';
import { debounce } from 'lodash';

export class ProjectWatcher {
    private watcher: chokidar.FSWatcher | null = null;

    constructor() {}

    public watch(projectPath: string) {
        if (this.watcher) {
            this.watcher.close();
        }

        this.watcher = chokidar.watch(projectPath, {
            // eslint-disable-next-line no-useless-escape
            ignored: [/(^|[\/\\])\../, '**/node_modules/**', '**/.git/**'],
            persistent: true,
            ignoreInitial: true,
        });

        this.watcher
            .on('add', (path: string) => this.handleFileChange(path))
            .on('change', (path: string) => this.handleFileChange(path));

        console.log(`Started watching project at ${projectPath}`);
    }

    private handleFileChange = debounce(async (filePath: string) => {
        try {
            const content = await fs.promises.readFile(filePath, 'utf-8');
            await indexFile(filePath, content);
        } catch (error) {
            console.error(`Error processing file ${filePath}:`, error);
        }
    }, 1000);

    public close() {
        if (this.watcher) {
            this.watcher.close();
            this.watcher = null;
        }
    }
}

export const projectWatcher = new ProjectWatcher();
