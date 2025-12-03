import { tool } from 'ai';
import { z } from 'zod';
import fs from 'fs/promises';
import path from 'path';

const UI_COMPONENTS_PATH = path.join(process.cwd(), 'packages/ui/src/components');

export const readComponentSchema = tool({
    description:
        "Reads the code and props definition of a UI component from the project's design system.",
    parameters: z.object({
        componentName: z
            .string()
            .describe('The name of the component to read (e.g., "Button", "Input").'),
    }),
    execute: async ({ componentName }) => {
        try {
            // Normalize component name (e.g., "button" -> "button.tsx")
            // Try exact match first, then lowercase
            let filename = componentName;
            if (!filename.endsWith('.tsx')) {
                filename += '.tsx';
            }

            let filePath = path.join(UI_COMPONENTS_PATH, filename);

            // Check if file exists
            try {
                await fs.access(filePath);
            } catch {
                // Try lowercase
                filename = componentName.toLowerCase();
                if (!filename.endsWith('.tsx')) {
                    filename += '.tsx';
                }
                filePath = path.join(UI_COMPONENTS_PATH, filename);
                await fs.access(filePath);
            }

            const content = await fs.readFile(filePath, 'utf-8');
            return content;
        } catch (error) {
            // If file not found, list available components
            try {
                const files = await fs.readdir(UI_COMPONENTS_PATH);
                const components = files
                    .filter((f) => f.endsWith('.tsx') && f !== 'index.tsx')
                    .map((f) => f.replace('.tsx', ''));

                return `Component "${componentName}" not found. Available components:\n${components.join('\n')}`;
            } catch (listError) {
                return `Error reading component: ${error instanceof Error ? error.message : String(error)}`;
            }
        }
    },
});
