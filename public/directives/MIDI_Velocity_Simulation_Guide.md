# 🎹 MIDI Velocity Simulation Guide (Without Multi-Sample Layers)

## 1. Overview

When multi-sampled velocity layers are unavailable, the dynamics of a
performance can be simulated using MIDI performance data (velocity,
duration, and control changes) combined with audio filtering and
envelope modulation.

This guide explains: - Which MIDI parameters approximate ADSR envelope
behavior. - How to use filters, volume scaling, and dynamics processing
to simulate low-velocity response.

------------------------------------------------------------------------

## 2. MIDI Parameters That Approximate ADSR

### Attack

-   **Proxy:** `Note On` velocity and/or Mod Wheel (CC1)
-   **Explanation:** Higher velocity produces a sharper onset; lower
    velocity results in a softer, slower attack.
-   **Optional mapping:** Velocity → Envelope Attack Time

### Decay

-   **Proxy:** Expression (CC11) or Volume (CC7)
-   **Explanation:** Create volume fade after note-on to simulate energy
    loss.
-   **Optional mapping:** Velocity → Shorter decay for high velocities

### Sustain

-   **Proxy:** Note duration and Sustain Pedal (CC64)
-   **Explanation:** How long the note is held before release, and
    whether CC64 extends the sustain.
-   **Typical MIDI Behavior:** Note On → Hold → Note Off (or CC64=127)

### Release

-   **Proxy:** Note-off timing and instrument release time.
-   **Explanation:** The synth's or sampler's release parameter defines
    how long sound continues after Note Off.
-   **Optional mapping:** Velocity → Longer release for high velocities

------------------------------------------------------------------------

## 3. Simulating Velocity Layers with Filters

If a sampler uses a single sample per note, velocity can be emulated
using an **audio filter** and **volume scaling** to mimic the tonal and
dynamic differences between soft and hard key strikes.

### 3.1 Low-Pass Filter (LPF) Modulation

-   **Purpose:** Softer notes contain fewer high frequencies.
-   **Implementation:** Map velocity to LPF cutoff frequency.

  Velocity   LPF Cutoff (Hz)   Resonance   Notes
  ---------- ----------------- ----------- --------------------
  120--127   10,000--12,000    0.2--0.4    Bright, sharp tone
  80--100    5,000--8,000      0.3--0.5    Natural tone
  40--70     2,000--4,000      0.4--0.6    Softer tone
  0--30      800--1,500        0.5--0.7    Muted, mellow tone

**Mapping formula example:**

    Cutoff = 1000 + (Velocity / 127) ^ 2 * 10000

### 3.2 Volume Scaling

-   **Purpose:** Control loudness curve to match velocity.
-   **Implementation:** Map velocity to amplitude using a curve, not
    linear scaling.

**Recommended dB curve:** \| Velocity \| Output Gain (dB) \|
\|-----------\|------------------\| \| 127 \| 0 dB \| \| 96 \| -3 dB \|
\| 64 \| -6 dB \| \| 32 \| -12 dB \| \| 16 \| -18 dB \|

**Formula example:**

    Gain_dB = -18 + (Velocity / 127) * 18

### 3.3 Envelope Modulation (Optional)

-   **Purpose:** Refine attack/decay behavior.
-   **Mapping suggestions:**
    -   Velocity → Shorter Attack at high velocity
    -   Velocity → Longer Decay at low velocity
    -   Velocity → Shorter Release at low velocity

Example: \| Velocity \| Attack (ms) \| Decay (ms) \| Release (ms) \|
\|-----------\|--------------\|-------------\|---------------\| \| 120
\| 5 \| 300 \| 400 \| \| 80 \| 15 \| 400 \| 500 \| \| 40 \| 30 \| 500 \|
600 \| \| 10 \| 50 \| 600 \| 700 \|

------------------------------------------------------------------------

## 4. Optional Post-Processing

### Light Compression

-   **Purpose:** Even out tonal energy between simulated velocities.
-   **Settings:**
    -   Ratio: 2:1\
    -   Threshold: −18 dB\
    -   Attack: 10 ms\
    -   Release: 80 ms\
    -   Makeup gain: +3 dB

### Signal Chain Example

    Instrument Output
       → Velocity-Modulated LPF
       → Volume Scaling Curve
       → Optional Envelope Modulation
       → Light Compressor
       → Output

------------------------------------------------------------------------

## 5. Practical Implementation Notes

-   **MIDI Inputs Used:**
    -   Note On velocity
    -   CC11 (Expression)
    -   CC7 (Volume)
    -   CC64 (Sustain pedal)
    -   Optional: CC1 (Mod Wheel), Aftertouch
-   **Output:**
    -   Dynamic filter cutoff
    -   Dynamic amplitude
    -   Dynamic envelope shaping
-   **Recommended Integration:**
    -   Implement modulation routing via a synth engine or DAW plugin.
    -   Ensure filter and amplitude respond in real time to incoming
        MIDI velocity.

------------------------------------------------------------------------

## 6. Summary

  ADSR Stage   MIDI Proxy                        Simulation Technique
  ------------ --------------------------------- -------------------------------------
  Attack       Velocity / Mod Wheel              Map velocity → faster/slower attack
  Decay        Volume (CC7), Expression (CC11)   Volume fade after note-on
  Sustain      Note length / CC64                Extend sustain via pedal
  Release      Note-off timing                   Adjust release time by velocity
  Timbre       ---                               Velocity → LPF cutoff modulation
  Loudness     ---                               Velocity → volume scaling curve

------------------------------------------------------------------------

**Result:**\
You'll achieve realistic expressive dynamics from a single-sample piano
or synth patch by combining **MIDI-driven filtering**, **volume
scaling**, and **light compression**, all reacting naturally to how the
notes are played.
