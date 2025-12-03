import { tool } from 'ai';
import { z } from 'zod';
import supabase from '@aether/supabase/clients';
import { createOpenAI } from '@ai-sdk/openai';
import { embed } from 'ai';

const openai = createOpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

const embeddingModel = openai.embedding('text-embedding-3-small') as any;

export const searchCodebaseTool = tool({
    description: 'Search the codebase using semantic search',
    parameters: z.object({
        query: z.string().describe('The search query to find relevant code'),
        match_count: z.number().optional().default(5).describe('Number of results to return'),
        match_threshold: z.number().optional().default(0.7).describe('Similarity threshold'),
    }),
    execute: async ({ query, match_count, match_threshold }) => {
        if (!supabase) {
            return 'Error: Supabase client not initialized';
        }

        try {
            const { embedding } = await embed({
                model: embeddingModel,
                value: query,
            });

            const { data, error } = await supabase.rpc('match_documents', {
                query_embedding: embedding,
                match_threshold,
                match_count,
            } as any);

            if (error) {
                return `Error searching codebase: ${error.message}`;
            }

            return JSON.stringify(data, null, 2);
        } catch (error) {
            return `Error: ${error instanceof Error ? error.message : String(error)}`;
        }
    },
});
