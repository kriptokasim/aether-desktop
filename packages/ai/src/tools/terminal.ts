import { tool } from 'ai';
import { z } from 'zod';
import { Sandbox } from '@e2b/code-interpreter';

export const runTerminalCommandSafeTool = tool({
    description: 'Run a terminal command safely in a cloud sandbox',
    parameters: z.object({
        command: z.string().describe('The terminal command to execute'),
    }),
    execute: async ({ command }) => {
        if (!process.env.E2B_API_KEY) {
            return 'Error: E2B_API_KEY not found in environment variables';
        }

        try {
            const sandbox = await Sandbox.create();
            const execution = await sandbox.runCode(command);

            let output = '';
            if (execution.logs.stdout) output += `STDOUT:\n${execution.logs.stdout.join('\n')}\n`;
            if (execution.logs.stderr) output += `STDERR:\n${execution.logs.stderr.join('\n')}\n`;

            await sandbox.kill();

            return output || 'Command executed successfully with no output';
        } catch (error) {
            return `Error executing command: ${error instanceof Error ? error.message : String(error)}`;
        }
    },
});
