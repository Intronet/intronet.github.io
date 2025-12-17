# Musical Enhancements Technical Specification

## Preamble

This document provides a comprehensive technical and music-theoretical specification for the intelligent music engines powering this application. The overarching goal is to create a sophisticated, musically-aware assistant for composition, capable of harmonization, melody generation, and accompaniment. All algorithms are designed to follow "The Most Musical Path," prioritizing harmonic sophistication, melodic nuance, and structural integrity.

---

## Section 1: The Harmonization Engine (`src/harmonization.ts`)

### Musical Goal

The Harmonization Engine conforms a monophonic melodic line to a given harmonic context (defined by a series of `ChordBlock` objects). It can operate in several distinct styles, offering a range of creative options from subtle correction to complex reharmonization.

### Core Logic

The engine processes a sequence of `Note` objects against a timeline of `ChordBlock` objects. For each note, it determines the active chord and the overall key signature. Based on the selected `style`, it decides whether and how to alter the note's pitch or transform it into a chord. A `strength` parameter (0-100) adds a probabilistic element, allowing for a blend of original and harmonized material.

### Algorithmic Breakdown of Harmonization Styles

1.  **Corrective:**
    *   **Musical Goal:** The most subtle mode. It nudges "wrong" notes to the nearest chord tone, but only if they are rhythmically prominent (e.g., on a strong beat). It preserves the original melody's character by allowing for musically valid passing tones and neighbor tones on weak beats.
    *   **Algorithm:**
        1.  Identify if the note is a chord tone or a scale tone.
        2.  If it is a chord tone, it remains unchanged.
        3.  If it is not a chord tone, analyze its metric position.
        4.  **Strong Beats (e.g., 1 and 3):** The note is considered harmonically significant and is moved to the nearest valid chord tone using the `findClosestNoteInPool` function, which minimizes melodic distance.
        5.  **Weak Beats:** The note is treated as a potential non-chord tone. It is left unchanged if it functions as a valid passing tone (stepwise motion between two other notes) or a neighbor tone (stepwise motion away from and back to a note). Otherwise, it is corrected.

2.  **Chordal (Arpeggiate):**
    *   **Musical Goal:** To strictly outline the harmony by forcing every melodic note to be a member of the current chord. This is effective for creating arpeggiated or broken-chord textures.
    *   **Algorithm:**
        1.  For every note, check if its pitch class is present in the active `ChordBlock`.
        2.  If it is not a chord tone, it is unconditionally moved to the nearest valid chord tone via `findClosestNoteInPool`.

3.  **Modal (Scale Tones):**
    *   **Musical Goal:** To ensure the melody stays within the primary key signature of the piece, even if the underlying chords are borrowed or non-diatonic. This creates a consistent, modal flavor.
    *   **Algorithm:**
        1.  For every note, check if its pitch class is a member of the overall scale (e.g., C Major).
        2.  If it is not a scale tone, it is moved to the nearest valid scale tone. The pool of target notes includes all scale notes across multiple octaves.

4.  **Four-Part (Chorale):**
    *   **Musical Goal:** To create a full, four-part chorale (SATB) texture where the original melody note serves as the Soprano voice.
    *   **Algorithm (`generateFourPartHarmony`):**
        1.  The incoming `note` is designated as the Soprano.
        2.  The Alto voice is found by selecting the nearest chord tone below the Soprano, within a reasonable interval (e.g., an octave).
        3.  The Tenor voice is found by selecting the nearest chord tone below the newly placed Alto, avoiding parallel octaves/fifths and respecting vocal ranges.
        4.  The Bass voice is found similarly, below the Tenor, often prioritizing the root of the chord.
        5.  The resulting notes are returned as a chord.
        6.  **Voicing Options:**
            *   `closed`: Voices are as close together as possible.
            *   `drop2`: The second voice from the top (Alto) is dropped by an octave, creating a more open, professional-sounding voicing common in jazz and contemporary music.

5.  **Parallel Harmony:**
    *   **Musical Goal:** To add a secondary voice that moves in parallel motion with the melody at a specified diatonic interval (e.g., 3rds, 6ths).
    *   **Algorithm (`generateParallelHarmony`):**
        1.  Identify the scale degree of the melody note within the overall key.
        2.  Calculate the target scale degree for the harmony note (e.g., for harmony in 3rds, if the melody is on the 5th degree, the harmony will be on the 3rd degree).
        3.  Find the corresponding harmony pitch class.
        4.  Construct the harmony note's MIDI value by placing it in the correct octave below the melody note.
        5.  The original melody note and the new harmony note are returned as a two-note chord.

6.  **Counter-Melody:**
    *   **Musical Goal:** To generate an independent, complementary melody that follows the principles of basic counterpoint.
    *   **Algorithm:**
        1.  Maintains a memory of the last generated counter-melody note (`lastCounterMidi`).
        2.  For each new melody note, it evaluates a pool of candidate notes from the current scale.
        3.  Each candidate is scored based on several criteria:
            *   **Contour:** The highest score is given to notes that move in contrary motion to the main melody.
            *   **Harmonic Interval:** Consonant intervals (3rds, 6ths) are rewarded over dissonant ones.
            *   **Voice Leading:** Smaller, stepwise movements from the `lastCounterMidi` are preferred.
        4.  The candidate with the highest score is chosen as the new counter-melody note.
        5.  The original melody and the new counter-melody note are returned as a two-note chord.

---

## Section 2: The Generative Melody Engine (`src/generativeEngine.ts`)

### Musical Goal
To generate stylistically coherent and musically pleasing melodies over a given chord progression. The engine's core innovation is the **"Most Musical Path"** algorithm, which uses a forward-looking approach to make more intelligent pitch choices.

### Core Logic

Instead of generating a melody one chord block at a time, the engine first creates a single, cohesive rhythmic phrase for the entire duration of the chord progression. Then, it iterates through this rhythmic phrase, selecting a pitch for each rhythmic event. This separation of rhythm and pitch generation avoids the common pitfall of generative music sounding like a series of disconnected fragments.

### Algorithmic Breakdown

1.  **Rhythmic Phrase Generation (`generateRhythmicPhrase`):**
    *   A single rhythmic skeleton is created based on the total beat duration of the progression and the parameters in the `StyleKit`.
    *   `rhythm_density` controls the subdivisions used (e.g., 'sparse' uses half and whole notes, 'dense' uses 16th notes).
    *   `rhythm_syncopation` controls the probability of shifting a note off the beat to create a more groovy, less mechanical feel.

2.  **Pitch Selection (`selectNextPitch`): The "Most Musical Path"**
    *   This is the core of the engine's intelligence. For each rhythmic event, it doesn't just look at the *current* chord; it looks at the *next* chord to inform its decision.
    *   **Process:**
        1.  **Candidate Pool:** Based on the `note_selection` parameter in the `StyleKit` (`chord_tones`, `scale_tones`, or `mixed`), a pool of valid pitch classes for the current chord is determined.
        2.  **Candidate Scoring:** All possible notes within the `octaveRange` are evaluated and scored based on a weighted system:
            *   **Leap Preference (Weight: Low):** The distance from the previous note is penalized based on the `leap_preference` ('stepwise' heavily penalizes large jumps, 'wide' is more permissive).
            *   **Contour (Weight: Medium):** The direction of the melodic leap is rewarded if it matches the desired `contour` ('ascending', 'arch', etc.) for the current position in the phrase.
            *   **Voice Leading to Next Chord (Weight: High):** This is the key innovation. The algorithm calculates the melodic distance from the candidate note to the *nearest note in the upcoming chord*. Candidates that resolve smoothly (by a small interval, like a step or half-step) into the next chord receive a significant score bonus.
        3.  **Selection:** The candidate note with the highest score is selected as the next note in the melody.

### The `StyleKit` API

The `StyleKit` is a JSON object that provides the aesthetic and theoretical parameters for the generative engine.

*   `name` (string): The display name of the style.
*   `rhythm_density` ('sparse' | 'moderate' | 'dense' | 'flowing' | 'consistent' | string): Controls the overall number of notes.
*   `rhythm_syncopation` ('none' | 'low' | 'medium' | 'high' | 'minimal' | 'subtle' | string): Controls rhythmic complexity.
*   `contour` ('ascending' | 'descending' | 'arch' | 'valley' | 'random' | 'undulating' | 'smooth' | string): Defines the overall melodic shape.
*   `note_selection` ('chord_tones' | 'scale_tones' | 'mixed' | 'diatonic' | 'classical' | 'functional' | string): Determines the pool of available notes relative to the harmony.
*   `leap_preference` ('stepwise' | 'narrow' | 'wide' | 'small leaps' | 'conjunct' | string): Controls the size of melodic intervals.
*   `octaveRange` ([number, number]): Defines the minimum and maximum octave for the melody.

---

## Section 3: The Accompaniment Engine (`src/accompanimentEngine.ts`)

### Musical Goal
To generate rhythmic and harmonic accompaniment that supports the provided `ChordBlock` progression, using either pre-defined patterns or specialized melodic generators.

### Algorithmic Breakdown

1.  **Pattern-Based Accompaniment:**
    *   **Logic:** This is the primary mode. It applies a rhythmic/voicing pattern defined in an `AccompanimentPattern` JSON object to each `ChordBlock`.
    *   **Process:**
        1.  The engine iterates through each `ChordBlock`.
        2.  For each block, it repeatedly loops through the `steps` defined in the `AccompanimentPattern`.
        3.  For each `step`, it creates a musical event at the specified `time_offset` and `duration`.
        4.  The `voicing` parameter determines which notes of the chord are played:
            *   `"all"`: Plays all notes of the chord.
            *   `"rest"`: Plays all notes *except* the root (i.e., the upper structure).
            *   `[0, 2]`: Plays specific notes from the chord, sorted by pitch (0=root, 1=3rd, 2=5th, etc.).
        5.  `octave_offset` transposes the selected notes.

2.  **Melodic Generators:**
    *   These are special functions triggered by specific `AccompanimentPattern` configurations. They generate melodic lines rather than applying static patterns.
    *   **`generateWalkingBass`:**
        *   **Musical Goal:** Create a classic jazz-style walking bassline with one note per beat.
        *   **Algorithm:**
            1.  Iterates through the `ChordBlock` progression.
            2.  For each beat within a block:
                *   Beat 1 is always the root of the chord.
                *   Intermediate beats are chosen algorithmically, usually by stepwise motion (diatonic or chromatic) from the previous note.
                *   The final beat of a chord block is a "leading tone" that smoothly approaches the root of the *next* chord, typically by a half-step from above or below.
    *   **`generateWalkingTenths`:**
        *   **Musical Goal:** Creates a richer, two-voice texture by adding a note a tenth above the generated walking bassline.
        *   **Algorithm:** Follows the same logic as `generateWalkingBass` but adds a second `Note` event for each bass note, pitched a major or minor tenth above it.
