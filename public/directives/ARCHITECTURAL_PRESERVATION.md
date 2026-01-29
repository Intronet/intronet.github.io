# Directive 9.0: The Architectural Preservation Mandate

## 1. Preamble
This directive codifies the successful refactoring of the application's state management system. The architecture has shifted from a monolithic React Context model to a performant, decoupled **Store + Manager** pattern using Zustand. This structure is critical for maintaining 60fps UI performance alongside the audio engine. Regression to previous patterns (prop-drilling, fat contexts, "God Components") is strictly prohibited.

## 2. The Core Pattern: Store + Manager + Component

All new features must adhere to this tripartite structure:

### A. The Store (`src/stores/`)
*   **Role:** Holds pure state and atomic actions.
*   **Technology:** Zustand.
*   **Rules:**
    *   Stores must be domain-specific (e.g., `transportStore`, `arrangementStore`).
    *   Stores must **not** contain side effects (no API calls, no Tone.js manipulation).
    *   Stores must provide granular selectors to consumers to prevent unnecessary re-renders.

### B. The Logic Manager (`src/managers/`)
*   **Role:** Handles side effects and bridges the reactive state with the imperative audio engine.
*   **Technology:** React Component (returning `null`) or Custom Hook.
*   **Rules:**
    *   Managers subscribe to store state via `useEffect`.
    *   Managers are the **only** place allowed to interact directly with `Tone.js` objects or global window events.
    *   Managers are mounted once in `AudioCore.tsx`.

### C. The UI Component (`src/features/`)
*   **Role:** Pure visual representation and user interaction.
*   **Technology:** React Functional Component (memoized).
*   **Rules:**
    *   Components must pull state directly from Stores using specific selectors.
    *   **Prohibited:** Passing complex objects or callbacks deep down the tree (Prop-Drilling).
    *   **Prohibited:** Calculating heavy logic during render.

## 3. The "God File" Prohibition

### 3.1. Protected Files
The following files are high-risk zones. Adding logic to them requires a specific, written justification in the `TIMEOUT` phase.
*   `src/App.tsx`
*   `src/components/MainLayout.tsx`
*   `src/audio/AudioEngine.ts`

### 3.2. Violation Criteria
Any proposed change that introduces the following into a protected file is a violation:
*   `useState` or `useEffect` hooks for feature-specific logic.
*   New Context Providers.
*   Inline definition of helper functions exceeding 5 lines.

## 4. Context API Usage
React Context is now deprecated for high-frequency state. It is permitted **only** for:
*   Dependency Injection (e.g., passing a service instance).
*   Low-frequency configuration data (e.g., Theme, User Preferences).
*   Compatibility shims for legacy code (gradually to be phased out).

## 5. Conclusion
Performance is a feature. This architecture guarantees it. Do not compromise the structural integrity of the application for the sake of a quick implementation. Respect the separation of concerns.