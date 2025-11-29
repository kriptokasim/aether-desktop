# Aether Desktop Architecture Notes

## Repo Layout

### Main Apps
- **`apps/studio`**: The core Electron application.
    - **`electron/`**: Main process and preload scripts.
    - **`src/`**: Renderer process (React application).

### Shared Packages (`packages/`)
- **`ai`**: AI-related utilities and definitions.
- **`foundation`**: Core shared logic and types.
- **`ui`**: Shared UI components (likely used by both studio and potentially other apps).
- **`models`**: Data models and schemas.
- **`supabase`**: Supabase client and integration.
- **`git`**: Git operations helper.
- **`utility`**: General utility functions.

### Plugins
- **`plugins/`**: Directory for extension plugins (structure to be verified).

## Core Desktop Flows

### Electron Shell
- **Entry Point**: `apps/studio/electron/main/index.ts`.
- **Window Management**: Handles creation of the main application window and potentially auxiliary windows (preview, settings).
- **IPC**: Communication between Main and Renderer processes is heavily used for system operations (file system, git, terminal).

### Renderer (React) App
- **Entry Point**: `apps/studio/src/main.tsx`.
- **Routing**: Uses `react-router` (implied by `routes/` directory).
- **UI Framework**: React + TailwindCSS.
- **State Management**: **MobX** (`mobx`, `mobx-react-lite`) is used for global state management.

### Project & Code Integration
- **File System**: `apps/studio/electron/main/storage` handles file reading/writing.
- **Terminal**: `node-pty` is used in `apps/studio/electron/main/run` to spawn and control terminal processes (for running the user's app).
- **Code Editing**: `apps/studio/electron/main/code` likely handles reading code files and applying changes (codemods).

## Data & State Management
- **MobX**: Primary state management solution. Stores are likely defined in `apps/studio/src/stores` (or similar, need to verify if strictly MobX or a mix).
- **Data Flow**:
    1.  User interacts with UI (Renderer).
    2.  Renderer updates MobX state or sends IPC message to Main.
    3.  Main process performs system action (e.g., write file, run command).
    4.  Main process sends result back to Renderer via IPC.

## AI Usage Inventory
For a detailed overview of AI modules, flows, and configuration, see [AETHER_DESKTOP_AI_OVERVIEW.md](AETHER_DESKTOP_AI_OVERVIEW.md).

## Helper Sequence Outlines

### Attach to React App
1.  User opens Aether Desktop.
2.  Selects a local folder (Project).
3.  Main process (`electron/main/storage`) reads folder structure.
4.  Main process (`electron/main/run`) detects package manager and scripts.
5.  User clicks "Run".
6.  Main process spawns dev server via `node-pty`.
7.  Renderer displays terminal output and eventually the app preview (likely via an `iframe` or `BrowserView`).
