# Directive 7.4: The Mandatory UI Audit Protocol

## 1. Preamble & Mandate
This directive codifies a non-negotiable, procedural checklist for the analysis of all UI layout tasks. Its purpose is to eliminate structural layout errors by mandating a specific, systematic order of operations. This protocol is a direct response to a previous failure to identify a static layout flaw, an oversight deemed a "schoolboy error." Adherence is mandatory to prevent recurrence.

## 2. The Mandatory Protocol
Before any other analysis, the CA must execute the following steps in this exact order. The findings must be documented in the `TIMEOUT:` phase specification.

### Step 1: Global Physicality Audit
- Perform a complete "Container Identification & Constraint Analysis" (as defined in `UI_UX.md`) on **all** top-level layout containers within the relevant view (e.g., each column in a multi-column layout, header, footer, main content area).
- Explicitly document the dimensional constraints (fixed, flexible, min/max) of each container.

### Step 2: Prioritize Static Flaws
- Based on the audit, identify and prioritize any **static, structural layout flaws**. These are issues guaranteed to exist on render, regardless of user interaction.
- Examples include:
    - Conflicting child sizing declarations within a constrained parent (e.g., two children with `h-full` in a `flex-col` container of fixed height).
    - Fixed-size containers holding dynamic content without a declared overflow strategy (`overflow-y-auto`, etc.).
- Static flaws must be addressed before any other aspect of the prompt.

### Step 3: Targeted Analysis
- Only after the global audit is complete and all static flaws have been identified may the CA proceed to analyze the specific components, user interactions, or dynamic states mentioned in the user's prompt.

## 3. Conclusion
This protocol is not a guideline; it is a required operational procedure. By front-loading a rigorous, full-scope physical audit, we build a foundation of structural integrity, ensuring that our interfaces are proactively resilient by design.