import { tool } from 'ai';
import { z } from 'zod';
import { chromium } from 'playwright';

export const takeScreenshotTool = tool({
    description: 'Take a screenshot of a URL or the current page',
    parameters: z.object({
        url: z.string().describe('The URL to take a screenshot of'),
        width: z.number().optional().default(1280).describe('Viewport width'),
        height: z.number().optional().default(800).describe('Viewport height'),
    }),
    execute: async ({ url, width, height }) => {
        try {
            const browser = await chromium.launch();
            const page = await browser.newPage();
            await page.setViewportSize({ width, height });
            await page.goto(url);
            const buffer = await page.screenshot();
            await browser.close();

            // Convert buffer to base64 string
            const base64Image = buffer.toString('base64');
            return `data:image/png;base64,${base64Image}`;
        } catch (error) {
            return `Error taking screenshot: ${error instanceof Error ? error.message : String(error)}`;
        }
    },
});
