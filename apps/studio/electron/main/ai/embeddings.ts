import { createOpenAI } from '@ai-sdk/openai';
import { embedMany } from 'ai';
import supabase from '@aether/supabase/clients';

let openai: ReturnType<typeof createOpenAI> | null = null;
let embeddingModel: any = null;

function getEmbeddingModel() {
    if (!embeddingModel) {
        if (!process.env.OPENAI_API_KEY) {
            console.error('OPENAI_API_KEY is missing');
            throw new Error('OPENAI_API_KEY is missing');
        }
        openai = createOpenAI({
            apiKey: process.env.OPENAI_API_KEY,
        });
        embeddingModel = openai.embedding('text-embedding-3-small');
    }
    return embeddingModel;
}

export async function indexFile(filePath: string, content: string) {
    if (!supabase) {
        console.error('Supabase client not initialized');
        return;
    }

    const model = getEmbeddingModel();

    try {
        // Split content into chunks (simple splitting for now)
        const chunks = splitIntoChunks(content, 1000);

        const { embeddings } = await embedMany({
            model: embeddingModel,
            values: chunks,
        });

        const records = chunks.map((chunk, i) => ({
            content: chunk,
            metadata: { filePath, chunkIndex: i },
            embedding: embeddings[i],
        }));

        const { error } = await supabase.from('project_documents').upsert(records as any);

        if (error) {
            console.error('Error indexing file:', error);
        } else {
            console.log(`Indexed file: ${filePath}`);
        }
    } catch (error) {
        console.error('Error generating embeddings:', error);
    }
}

function splitIntoChunks(text: string, chunkSize: number): string[] {
    const chunks = [];
    for (let i = 0; i < text.length; i += chunkSize) {
        chunks.push(text.slice(i, i + chunkSize));
    }
    return chunks;
}
