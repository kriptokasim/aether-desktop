import { glob } from 'glob';
import { readFile } from 'fs/promises';
import { join } from 'path';
import * as dotenv from 'dotenv';

dotenv.config();

async function indexUILibrary() {
    // Dynamically import embeddings after dotenv config
    const { indexFile } = await import('../electron/main/ai/embeddings');

    const uiPackagePath = join(process.cwd(), '../../packages/ui/src/components');
    console.log(`Indexing UI library from: ${uiPackagePath}`);

    const files = await glob('**/*.{tsx,ts}', {
        cwd: uiPackagePath,
        ignore: ['**/*.stories.tsx', '**/*.test.tsx'],
    });

    console.log(`Found ${files.length} files to index.`);

    for (const file of files) {
        const fullPath = join(uiPackagePath, file);
        const content = await readFile(fullPath, 'utf-8');
        // Use a special prefix or path to indicate this is part of the UI library
        const virtualPath = `packages/ui/src/components/${file}`;

        console.log(`Indexing ${virtualPath}...`);
        await indexFile(virtualPath, content);
    }

    console.log('UI Library indexing complete.');
}

indexUILibrary().catch(console.error);
