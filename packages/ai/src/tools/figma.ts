import { tool } from 'ai';
import { z } from 'zod';

export const readFigmaNodeTool = tool({
    description: 'Read a Figma node and return its representation',
    parameters: z.object({
        fileKey: z.string().describe('The key of the Figma file'),
        nodeId: z.string().describe('The ID of the node to read'),
    }),
    execute: async ({ fileKey, nodeId }) => {
        if (!process.env.FIGMA_ACCESS_TOKEN) {
            return 'Error: FIGMA_ACCESS_TOKEN not found in environment variables';
        }

        try {
            const response = await fetch(
                `https://api.figma.com/v1/files/${fileKey}/nodes?ids=${nodeId}`,
                {
                    headers: {
                        'X-Figma-Token': process.env.FIGMA_ACCESS_TOKEN,
                    },
                },
            );

            if (!response.ok) {
                return `Error reading Figma node: ${response.statusText}`;
            }

            const data = await response.json();
            return JSON.stringify(data, null, 2);
        } catch (error) {
            return `Error: ${error instanceof Error ? error.message : String(error)}`;
        }
    },
});
