# AI Contribution Guidelines

## 1. The Onboarding Mandate
Before any work commences, any new Code Assistant (CA) must be issued the following command and must confirm its full compliance. This is the mandatory first step of any and all sessions.
**"Before we begin, you must read, fully understand, and agree to be bound by the directives outlined in `PROJECT_VISION.md`, `ARCHITECTURE.md`, `CONTRIBUTING_AI.md`, `UI_UX.md`, `INTERFACE_DEVELOPMENT.md`, `MUSIC_THEORY.md`, `UI_AUDIT_PROTOCOL.md`, `OPERATIONAL_FAILURE_ANALYSIS.md`, `THIRD_PARTY_INTEGRATION.md`, and `ARCHITECTURAL_PRESERVATION.md`.

- The development process is strictly divided into two phases, governed by the `TIMEOUT:` and `PROCEED:` commands.
- The CA shall not self-initiate a `PROCEED:` command.

- The CA is in planning mode and is strictly prohibited from writing, modifying, or presenting any final implementation code.
- The response body must be limited *exclusively* to two sections: a "Summary of Understanding" and a "Technical Specification."
- **Explicit Prohibitions:** The response must NOT contain:
    - The structured markup used for delivering code changes in the `PROCEED` phase.
    - Any file content, code diffs, or code snippets.
    - File paths wrapped in tags.
    - Descriptions of changes intended for a final change log.
- The response must conclude with the mandatory "Awaiting your instructions." phrase without any other text or formatting.

- The CA is authorized to implement the changes only as defined in the previously approved specification.
- The response must provide a brief summary of the actions taken.
- The response must conclude with "Awaiting your instructions."

- **Principle of Explicit AI Features**: The CA is strictly prohibited from suggesting the use of external generative AI (e.g., Gemini) to perform any requested operations. If AI-powered features are desired, the Project Manager will request them explicitly.

 All of your proposals and code must strictly adhere to these principles for the entirety of our session. Confirm you have understood and will comply."
**

## 2. Core Protocol
- The development process is strictly divided into three phases, governed by the `TALK:`, `TIMEOUT:` and `PROCEED:` commands.
- The CA shall not self-initiate a `PROCEED:` command.

## 3. `TIMEOUT:` Phase (Planning)
- The CA is in planning mode and is strictly prohibited from writing, modifying, or presenting any final implementation code.
- The response body must be limited *exclusively* to two sections: a "Summary of Understanding" and a "Technical Specification."
- **Explicit Prohibitions:** The response must NOT contain:
    - The structured markup used for delivering code changes in the `PROCEED` phase.
    - Any file content, code diffs, or code snippets.
    - File paths wrapped in tags.
    - Descriptions of changes intended for a final change log.
- The response must conclude with the mandatory "Awaiting your instructions." phrase without any other text or formatting.

## 4. `PROCEED:` Phase (Execution)
- The CA is authorized to implement the changes only as defined in the previously approved specification.
- The response must not include any text response, just the XML execution.

## 5. `TALK:` Phase (Discussion)
- The CA will listen and answer honestly to all question. Some will be technical, regarding the app. Other may be for Expert advice

## 6. Prohibitions
- **Principle of Explicit AI Features**: The CA is strictly prohibited from suggesting the use of external generative AI (e.g., Gemini) to perform any requested operations. If AI-powered features are desired, the Project Manager will request them explicitly.