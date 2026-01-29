# Audible Architecture Directive

## 1. The Core Axiom: Chord Track Supremacy
The **Arrangement Sequencer's Chord Track** is the single source of harmonic truth for the application.
*   **Time-Slice Authority:** At any playback time `t`, the active `ChordBlock` determines the valid harmonic context (Root, Scale/Mode, Chord Tones).
*   **Fallback:** If no `ChordBlock` exists at `t`, the system falls back to the **Global Project Key** defined in the Transport/Arrangement store.
*   **Override:** The Global Project Key is *descriptive*, not prescriptive, when a Chord Block is present. The Chord Block's local harmonic context (e.g., a secondary dominant) always takes precedence over the Global Key.

## 2. The Harmonic Grid (Visual Architecture)
The Sequencer's "Harmonic Mode" is a dynamic abstraction layer, not a static piano roll.
*   **Relative Y-Axis:** The vertical rows do not represent fixed MIDI notes (e.g., C4, C#4). Instead, they represent **Scale Degrees** relative to the *current* Chord Track authority.
    *   **Row 0 (Base):** Represents the **Root** of the active Chord Block.
    *   **Rows +2, +4:** Represent the **3rd** and **5th** of the active Chord Block (regardless of quality).
*   **Visual Rendering (`RenderedStep`):**
    *   To render a note at time `t`, the system queries the Chord Track for the block at `t`.
    *   It calculates the interval between the stored note (Scale Degree) and the Block's Root.
    *   It projects this onto the screen. If the chord changes from C Major to F Major, a "Root" step (Degree 0) visually remains on the center line, but audibly shifts pitch from C to F.

## 3. Key Quantization (Input Architecture)
"Smart Quantization" is the transformation layer between raw MIDI input and the Harmonic Grid.
*   **The Input Vector:** `(Raw MIDI Pitch, Velocity, Time)`
*   **The Context Query:** The system queries the Chord Track at `Time`.
*   **The Transformation:**
    1.  **Normalization:** The Raw MIDI Pitch is analyzed against the Chord Block's Root.
    2.  **Degree Extraction:** The engine determines which Scale Degree the input represents (e.g., "This C# is the Major 3rd of the current A Major chord").
    3.  **Storage:** The system stores the **Degree** (e.g., `2` for 3rd) and the **Octave Offset**, *not* the absolute MIDI pitch.
*   **Playback Reconstruction:** When played back, the stored Degree is re-projected through the *current* Chord Block (which may have changed since recording), ensuring the melody always matches the harmony.

## 4. The Harmony Engine (Generative Architecture)
The Harmony Engine (`harmonization.ts`) acts as a "Conformance Filter" for monophonic sequences.
*   **Input:** A source melody (Note array).
*   **The Filter Chain:**
    1.  **Block Map:** The melody is segmented based on the Chord Track's block boundaries.
    2.  **Gravity Application:** For each note, the engine applies "Gravity" based on settings (Scale vs. Chord vs. Rhythm):
        *   **Chord Gravity:** Pulls the pitch to the nearest constituent tone of the active Chord Block (1-3-5-7).
        *   **Scale Gravity:** Pulls the pitch to the nearest valid scale degree derived from the active Chord Block's implied mode.
    3.  **Voice Leading:** The engine calculates the path of least resistance to the next Chord Block, modifying pitches to ensure smooth transitions (e.g., 7th resolving to 3rd) while strictly adhering to the harmonic definition of the Chord Track.

## 5. Data Flow Diagram (Textual)
`User Input (MIDI)` -> `SmartQuantization` -> **[CHORD TRACK LOOKUP]** -> `Stored Step (Degree)` -> `Sequencer Engine` -> **[CHORD TRACK LOOKUP]** -> `Audio Output (Frequency)`
