# Directive 9.1: The Humble View Protocol

## 1. Preamble & Mandate
This directive addresses the "Logic Creep" phenomenon, where UI components gradually accumulate business logic, state management, and side effects, rendering them brittle, untestable, and difficult to restyle. To maintain a "World-Class" codebase, we strictly enforce the **Humble View** architecture.

## 2. The Core Definition
A **Humble View** is a UI component that does nothing but render data provided to it and emit events. It contains **zero** knowledge of *how* the application works, *where* the data comes from, or *what* happens when a button is clicked.

## 3. The Architecture: Controller vs. View

### A. The Controller (The Brain)
*   **Naming:** `use[Feature]Controller.ts` (Custom Hook)
*   **Responsibility:**
    *   Subscribes to Global Stores (Zustand).
    *   Accesses Contexts.
    *   Performs domain calculations (Math, Music Theory, Grid Geometry).
    *   Manages Side Effects (Audio Engine calls).
    *   Formats data specifically for the View.
*   **Output:** Returns a single object containing `uiState` (primitive values for rendering) and `handlers` (bound callback functions).

### B. The View (The Face)
*   **Naming:** `[Feature]View.tsx` (Functional Component)
*   **Responsibility:**
    *   Takes pure props (Primitives, Arrays, or simple Objects).
    *   Renders JSX/HTML/Canvas.
    *   Binds user interactions (Clicks, Drags) directly to prop handlers.
*   **Output:** `JSX.Element`.

## 4. The "Three Prohibitions"
A Component ending in `View.tsx` is **strictly prohibited** from containing:

1.  **No Global State Imports:**
    *   **Forbidden:** `useStore()`, `useContext(AudioContext)`.
    *   **Reason:** Ties the view to the app's specific data implementation.

2.  **No Engine Dependencies:**
    *   **Forbidden:** `import * as Tone from 'tone'`, `audioEngine.triggerAttack()`.
    *   **Reason:** Prevents visual refactors from breaking audio.

3.  **No Domain Calculations:**
    *   **Forbidden:** `const width = beat * pixelsPerBeat`, `const isMajor = scale.includes(note)`.
    *   **Reason:** Geometric and theoretical logic belongs in the Controller to ensure the View remains "dumb" and purely presentational.

## 5. The "Storybook" Standard
When writing a View, ask: *"Could I render this component in an isolated Storybook environment by simply passing it JSON props, without wrapping it in any Providers?"*
If the answer is **No**, the View is not Humble. Refactor immediately.

## 6. Implementation Checklist
For every complex UI feature:
1.  [ ] Create `use[Feature]Controller.ts`.
2.  [ ] Move **ALL** `useStore`, `useEffect` (logic), and calculations into the Controller.
3.  [ ] Create `[Feature]View.tsx`.
4.  [ ] Define a clean Interface for the View's props.
5.  [ ] Verify the View imports **no** logic libraries.
