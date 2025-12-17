# Mandate 8.4: The Mandate for Professional Third-Party Library Integration

## 1. Preamble & Origin
This directive is a direct and permanent consequence of a previous operational failure involving the `soundfont-player` library. It codifies the lesson learned: assuming the internal behavior of a third-party library without consulting its public API is a critical failure of professional diligence. This protocol is mandatory for all future integrations to prevent a repeat of this amateur-level error.

## 2. The Core Tenet: "The Principle of Assumed Foreignness"
Third-party libraries must be treated as foreign, opaque systems. Their internal workings cannot be assumed to follow common patterns, and they must not be manipulated via internal state unless all other options are exhausted. The public, documented API is the only sanctioned point of interaction.

## 3. The "Hierarchy of Truth" for Diagnostics
For any task involving the integration or debugging of a third-party library, the CA must follow this mandatory, four-step diagnostic hierarchy. The chosen approach must be justified by referencing which step of the hierarchy it falls under.

### Step 1: Official API Documentation & Configuration
This is the highest source of truth. The first action is always to search the library's public API for a configuration-based solution. The CA must prove it has looked for an intended method (e.g., passing an option during initialization, like the `destination` property in `soundfont-player`) before attempting any other method.

### Step 2: Type Definitions
If documentation is sparse, the second source of truth is the library's TypeScript type definitions. The CA must inspect the types for configuration objects, function signatures, and optional parameters to discover undocumented features.

### Step 3: Source Code Analysis
If and only if the first two steps yield no solution, the CA is authorized to analyze the library's source code to understand its internal mechanisms. This is a last resort for discovering undocumented behavior.

### Step 4: Post-Facto Manipulation
This is the lowest, least desirable, and most fragile option. Modifying a library's internal state after it has been initialized (e.g., attempting to manually `.disconnect()` and `.reconnect()` an audio node) is explicitly prohibited unless the CA can prove that the first three steps in the hierarchy have been exhausted and have failed to provide a solution.
