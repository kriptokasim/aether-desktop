# Aether Desktop Baseline Roadmap

- [ ] **Multi-Provider AI Support**:
    -   Refactor `LlmManager` to support multiple providers (Gemini, OpenAI).
    -   Add configuration UI for selecting providers.
    -   Implement provider-specific logic.

## Potential Improvements (Later)

- **AI Brain Improvements**:
    - Integrate multi-provider model selection (OpenAI, Anthropic, Gemini, Local).
    - Enhance context awareness for better code generation.
- **Project Onboarding**:
    - Streamline the "Attach to Project" flow.
    - Better detection of project frameworks and configurations.
- **Code Editor Integration**:
    - Deeper integration with VS Code (extensions, bi-directional syncing).
    - Enhanced internal Monaco editor features.
- **Aether AI Core**:
    - Integration with future "Aether AI Core" services for advanced reasoning and agents.

## Questions to Discuss

- **AI Flow Integration**:
    - How should chat, restyle, and other AI flows be architected within the desktop app?
    - Should we move AI logic to a separate local server or keep it in the main process?
- **Settings Structure**:
    - How to best structure settings for managing multiple AI models and providers?
    - Where should API keys be stored securely?
- **Tool Sync**:
    - How will Aether Desktop sync with other tools like Synapse and Fluxion in the future?
