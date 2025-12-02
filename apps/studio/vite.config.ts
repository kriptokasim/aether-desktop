import react from '@vitejs/plugin-react';
import { cpSync, rmSync } from 'node:fs';
import path from 'node:path';
import { defineConfig } from 'vite';
import electron from 'vite-plugin-electron/simple';
import pkg from './package.json';

// https://vitejs.dev/config/
export default defineConfig(({ command }) => {
    rmSync('dist-electron', {
        recursive: true,
        force: true,
    });
    const isServe = command === 'serve';
    const isBuild = command === 'build';
    const sourcemap = isServe || !!process.env.VSCODE_DEBUG;

    try {
        cpSync('resources', 'dist-electron/main/resources', { recursive: true });
        console.log('✓ Resources folder copied to dist-electron');
    } catch (err) {
        console.error('Failed to copy resources folder:', err);
    }

    return {
        resolve: {
            alias: {
                '@': path.join(__dirname, 'src'),
                common: path.join(__dirname, 'common'),
                '@aether/ai': path.join(__dirname, '../../packages/ai'),
            },
        },
        optimizeDeps: {
            exclude: ['node_modules/.vite/deps'],
        },
        plugins: [
            react(),
            electron({
                main: {
                    // Shortcut of `build.lib.entry`
                    entry: 'electron/main/index.ts',
                    onstart(args) {
                        if (process.env.VSCODE_DEBUG) {
                            console.log(
                                /* For `.vscode/.debug.script.mjs` */ '[startup] Electron App',
                            );
                        } else {
                            args.startup();
                        }
                    },
                    vite: {
                        build: {
                            sourcemap: sourcemap ? 'inline' : undefined,
                            minify: isBuild,
                            outDir: 'dist-electron/main',
                            rollupOptions: {
                                external: (id) => {
                                    if (id.startsWith('@aether/')) {
                                        return false;
                                    }
                                    if (id === 'nanoid' || id.startsWith('nanoid/')) {
                                        return false;
                                    }
                                    if (id === 'electron') {
                                        return true;
                                    }
                                    if (
                                        id === 'fast-glob' ||
                                        id.startsWith('fast-glob/') ||
                                        id.includes('/node_modules/fast-glob/') ||
                                        id.includes('\\node_modules\\fast-glob\\')
                                    ) {
                                        return true;
                                    }
                                    if (
                                        id === 'micromatch' ||
                                        id.startsWith('micromatch/') ||
                                        id.includes('/node_modules/micromatch/') ||
                                        id.includes('\\node_modules\\micromatch\\')
                                    ) {
                                        return true;
                                    }
                                    const deps = Object.keys(
                                        'dependencies' in pkg ? pkg.dependencies : {},
                                    );
                                    return deps.some((d) => id === d || id.startsWith(`${d}/`));
                                },
                                output: {
                                    format: 'cjs',
                                    entryFileNames: '[name].cjs',
                                },
                            },
                        },
                    },
                },
                preload: {
                    input: {
                        index: 'electron/preload/browserview/index.ts',
                        webview: 'electron/preload/webview/index.ts',
                    },
                    vite: {
                        build: {
                            sourcemap: sourcemap ? 'inline' : undefined,
                            minify: isBuild,
                            outDir: 'dist-electron/preload',
                            rollupOptions: {
                                external: Object.keys(pkg.dependencies ?? {}),
                                output: {
                                    format: 'cjs',
                                    entryFileNames: '[name].js',
                                    inlineDynamicImports: false,
                                },
                            },
                        },
                    },
                },
                // Ployfill the Electron and Node.js API for Renderer process.
                // If you want use Node.js in Renderer process, the `nodeIntegration` needs to be enabled in the Main process.
                // See 👉 https://github.com/electron-vite/vite-plugin-electron-renderer
                renderer: {},
            }),
        ],
        server: process.env.VSCODE_DEBUG
            ? (() => {
                  const url = new URL(pkg.debug.env.VITE_DEV_SERVER_URL);
                  return {
                      host: url.hostname,
                      port: +url.port,
                  };
              })()
            : undefined,
        clearScreen: false,
    };
});
