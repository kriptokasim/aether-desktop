import { Configuration, TargetConfiguration } from 'electron-builder';

/**
 * @see https://www.electron.build/#documentation
 */
const config: Configuration = {
    appId: 'dev.aether.studio',
    asar: true,
    directories: {
        output: 'release/${version}',
    },
    files: ['dist-electron', 'dist'],
    extraResources: [
        {
            from: 'resources/bun',
            to: 'bun',
            filter: ['**/*'],
        },
    ],
    mac: {
        artifactName: '${productName}-${arch}.${ext}',
        category: 'public.app-category.developer-tools',
        hardenedRuntime: true,
        gatekeeperAssess: false,
        target: [
            {
                target: 'dmg',
                arch: ['x64', 'arm64'],
            } as TargetConfiguration,
            {
                target: 'zip',
                arch: ['x64', 'arm64'],
            } as TargetConfiguration,
        ],
    },
    win: {
        target: [
            {
                target: 'nsis',
                arch: ['x64'],
            } as TargetConfiguration,
        ],
        artifactName: '${productName}-setup.${ext}',
        azureSignOptions: {
            publisherName: 'On Off, Inc',
            certificateProfileName: 'public-trust-aether',
            codeSigningAccountName: 'trusted-aether',
            endpoint: 'https://eus.codesigning.azure.net',
            timestampDigest: 'SHA256',
            timestampRfc3161: 'http://timestamp.acs.microsoft.com',
        },
    },
    linux: {
        target: [
            {
                target: 'AppImage',
                arch: ['x64', 'arm64'],
            } as TargetConfiguration,
            {
                target: 'deb',
                arch: ['x64', 'arm64'],
            } as TargetConfiguration,
        ],
        artifactName: '${productName}-${arch}.${ext}',
        category: 'Utility',
        executableName: 'Aether',
        icon: 'build/icon.icns',
        protocols: [
            {
                name: 'aether',
                schemes: ['aether'],
            },
        ],
    },
    nsis: {},
    publish: {
        provider: 'github',
        owner: 'aether-dev',
        repo: 'aether',
    },
};

export default config;
