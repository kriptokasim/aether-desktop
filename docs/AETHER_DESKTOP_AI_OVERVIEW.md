# Aether Desktop AI Overview

This document provides a high-level overview of the AI integration within Aether Desktop (formerly Onlook Desktop). It describes the architecture, key modules, UI entry points, and configuration.

## Overview

Aether Desktop implements AI functionality primarily for:
- **Chat**: A conversational interface to discuss the project, ask for changes, and get code suggestions.
- **Code Generation/Modification**: The AI can suggest code changes which can be applied directly to the project.
- **Error Resolution**: The AI can analyze error logs and suggest fixes.
- **Suggestions**: Proactive suggestions based on the conversation context.

The AI logic is split between the **Renderer process** (UI, state management) and the **Main process** (LLM communication, file operations).

## AI Modules & Key Symbols

### Renderer Process (`apps/studio/src`)

*   **`ChatManager`** (`apps/studio/src/lib/editor/engine/chat/index.ts`)
    *   **Purpose**: The central coordinator for chat functionality in the renderer.
    *   **Key Functions**:
        *   `sendNewMessage(content)`: Sends a user message to the AI.
        *   `sendFixErrorToAi(errors)`: Sends error details to the AI for resolution.
        *   `sendChatToAi(requestType)`: Initiates the streaming request to the main process via IPC.
        *   `handleChatResponse(res)`: Processes the streaming response from the main process.
        *   `autoApplyCode(assistantMessage)`: Automatically applies code suggestions if enabled.

*   **`ChatContext`** (`apps/studio/src/lib/editor/engine/chat/context.ts`)
    *   **Purpose**: Gathers context for the AI, including file contents, selected elements, errors, and project info.

*   **`ConversationManager`** (`apps/studio/src/lib/editor/engine/chat/conversation/conversation.ts`)
    *   **Purpose**: Manages the state of the current conversation (messages, history).

### Main Process (`apps/studio/electron/main`)

*   **`Chat` (LlmManager)** (`apps/studio/electron/main/chat/index.ts`)
    *   **Purpose**: Handles the actual communication with the LLM provider (Anthropic).
    *   **Key Functions**:
        *   `stream(messages, requestType)`: Streams the chat response from the LLM.
        *   `generateSuggestions(messages)`: Generates follow-up suggestions.
        *   `generateChatSummary(messages)`: Summarizes the conversation.

*   **`initModel`** (`apps/studio/electron/main/chat/llmProvider.ts`)
    *   **Purpose**: Initializes the LLM provider (currently Anthropic) with the appropriate API key or proxy configuration.

*   **IPC Handlers** (`apps/studio/electron/main/events/chat.ts`)
    *   **Purpose**: Listens for IPC messages from the renderer and calls the appropriate `Chat` methods.
    *   **Key Channels**: `SEND_CHAT_MESSAGES_STREAM`, `SEND_STOP_STREAM_REQUEST`.

### Shared Packages (`packages/ai`)

*   **`PromptProvider`** (`packages/ai/src/prompt/provider.ts`)
    *   **Purpose**: Constructs the system prompts and user messages, including context (files, errors, etc.).
    *   **Key Functions**: `getSystemPrompt`, `getHydratedUserMessage`.

*   **`chatToolSet`** (`packages/ai/src/tools/index.ts`)
    *   **Purpose**: Defines the tools available to the LLM (likely for file reading/writing, though not fully detailed here).

## UI Entry Points

1.  **Overlay Chat**
    *   **Location**: `apps/studio/src/routes/editor/Canvas/Overlay/Chat.tsx`
    *   **Trigger**: A floating chat button/input that appears near selected elements on the canvas.
    *   **Interaction**: User types a message -> `editorEngine.chat.sendNewMessage`.

2.  **Chat Tab**
    *   **Location**: `apps/studio/src/routes/editor/EditPanel/ChatTab`
    *   **Trigger**: The "Chat" tab in the editor panel.
    *   **Interaction**: Full chat history and input area.

## Configuration & Settings

### Environment Variables
The AI provider configuration is handled in `apps/studio/electron/main/chat/llmProvider.ts`.

*   **`VITE_ANTHROPIC_API_KEY`**: If set, the application communicates directly with Anthropic API.
*   **`VITE_SUPABASE_API_URL`**: If no API key is provided, the application uses a proxy via Supabase functions (`/functions/v1/proxy/anthropic`). Authentication tokens are required in this case.

### User Settings
*   **`autoApplyCode`**: A setting (likely in `PersistentStorage`) that controls whether code suggestions are automatically applied.

## End-to-End Flow Examples

### 1. User Sends a Chat Message
1.  **UI**: User types "Change the button color to red" in `OverlayChat` and hits Enter.
2.  **Renderer**: `OverlayChat` calls `editorEngine.chat.sendNewMessage("Change the button color to red")`.
3.  **Renderer**: `ChatManager` gathers context (selected element, file content) via `ChatContext`.
4.  **Renderer**: `ChatManager` sends `MainChannels.SEND_CHAT_MESSAGES_STREAM` via IPC to the main process.
5.  **Main**: `ipcMain` handler in `events/chat.ts` receives the request and calls `Chat.stream()`.
6.  **Main**: `LlmManager` initializes the Anthropic model (using API key or proxy).
7.  **Main**: `LlmManager` calls `streamText` from `ai` SDK.
8.  **Main**: Stream parts are sent back to renderer via `MainChannels.CHAT_STREAM_PARTIAL`.
9.  **Renderer**: `ChatManager` receives the stream and updates the `ConversationManager` state, which updates the UI.

### 2. Error Resolution
1.  **Renderer**: The application detects errors (e.g., from a build log or console).
2.  **Renderer**: `ChatManager.sendFixErrorToAi(errors)` is called.
3.  **Renderer**: A prompt is constructed: "How can I resolve these errors?..." with error context.
4.  **Flow**: Follows the same IPC -> Main -> LLM flow as above.

## Current Limitations / Observations

*   **Provider Lock-in**: The code currently hardcodes `LLMProvider.ANTHROPIC` and `CLAUDE_MODELS` in `LlmManager`.
*   **Proxy Dependency**: Without a direct API key, it relies on a specific Supabase proxy structure.
*   **Tooling**: The `chatToolSet` is imported from `@onlook/ai`, suggesting that tool definitions are shared but the execution logic resides in the main process (or is handled by the `ai` SDK's `experimental_repairToolCall`).
