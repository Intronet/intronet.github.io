# Application Architecture

## State Management
(e.g., "Global state will be managed by our `AppContext`. Avoid prop-drilling more than two levels deep.")

## Component Structure
(e.g., "Follow Atomic Design principles: Atoms, Molecules, Organisms")

## The Humble View Pattern (Directive 9.1)
- **Strict Separation:** Logic lives in Controllers (Custom Hooks); Presentation lives in Views (Components).
- **The "Dumb" View:** View components must NOT import stores, audio engines, or perform domain calculations. They purely render props.
- **See `HUMBLE_VIEWS.md` for the complete protocol.**

## Styling Philosophy
(e.g., "Use TailwindCSS utility classes for all styling. Avoid inline styles.")

## Performance Mandates
(e.g., "All event handlers passed as props MUST be wrapped in `useCallback`. All static, computationally expensive components MUST be wrapped in `React.memo`.")

## Naming Conventions
(e.g., "Components: PascalCase, Hooks: useCamelCase, Files: camelCase.tsx")
