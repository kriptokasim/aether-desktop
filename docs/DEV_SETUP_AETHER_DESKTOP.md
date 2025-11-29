# Developer Setup: Aether Desktop

## Prerequisites

- **Node.js**: Recommended LTS version (managed by Bun or system).
- **Bun**: v1.3.3 or later.
- **OS**: macOS, Windows, or Linux (Linux requires `libfuse2` for AppImage if building).

## Setup

1.  **Clone the repository**:
    ```bash
    git clone https://github.com/kriptokasim/aether-desktop.git
    cd aether-desktop
    ```

2.  **Install dependencies**:
    ```bash
    bun install
    ```

3.  **Run in development mode**:
    ```bash
    bun dev
    ```
    This will start the Electron app and the Vite dev server.

## Build & Package

To build the production application:

```bash
bun run build
bun run package
```

## Testing & Linting

We use `bun test` for testing and `eslint` for linting.

### Multi-Provider AI Setup

Aether Desktop supports Anthropic, OpenAI, and Gemini. To configure them:

1.  **Environment Variables**:
    *   **Anthropic**: Set `VITE_ANTHROPIC_API_KEY` in `.env.local`.
    *   **OpenAI**: Set `VITE_OPENAI_API_KEY` in `.env.local`.
    *   **Gemini**: Set `VITE_GEMINI_API_KEY` in `.env.local`.

2.  **Settings**:
    *   Go to **Settings > AI** in the app.
    *   Select your desired **AI Provider**.
    *   Configure the **Model** string if needed.

3.  **Misconfiguration**:
    *   If a provider is selected but not configured (missing API key), the chat will display an error message prompting you to set the key.
    *   If you don't have a direct key, you can use the Supabase proxy (requires authentication). Ensure `VITE_SUPABASE_API_URL` is set.
    ```bash
    VITE_SUPABASE_API_URL=https://your-supabase-url.co
    ```

If neither is configured, the AI features will be disabled, and you will see a configuration error in the chat.

### Running Tests
```bash
bun test
```
*Current Status*: 161 tests passed, 0 failures.

### Linting
```bash
bun lint
```
*Current Status*: Passed with warnings (mostly unused variables).

## Notes

- **Attaching to Projects**: The app allows you to open local React projects. Ensure the project uses a supported package manager (npm, pnpm, bun, yarn).
- **Troubleshooting**:
    - If you encounter "No backend connected" errors in the console, this is expected in the current baseline as the backend integration is minimal/mocked or requires further configuration not yet covered.
