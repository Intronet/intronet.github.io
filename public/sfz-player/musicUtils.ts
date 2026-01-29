// --- CONSTANTS ---
export const NOTES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

export const ROOT_NOTE_DISPLAY_MAP: { [key: string]: string } = {
    'C': 'C', 'C#': 'C♯/D♭', 'D': 'D', 'D#': 'D♯/E♭', 'E': 'E', 'F': 'F',
    'F#': 'F♯/G♭', 'G': 'G', 'G#': 'G♯/A♭', 'A': 'A', 'A#': 'A♯/B♭', 'B': 'B'
};

export const PITCH_CLASS_MAP: { [key: string]: number } = {
    'C': 0, 'C#': 1, 'Db': 1, 'D': 2, 'D#': 3, 'Eb': 3, 'E': 4, 'F': 5,
    'F#': 6, 'Gb': 6, 'G': 7, 'G#': 8, 'Ab': 8, 'A': 9, 'A#': 10, 'Bb': 10, 'B': 11
};

export const MIDI_NOTE_MAP = Object.fromEntries(Object.entries(PITCH_CLASS_MAP).map(([k, v]) => [v, k.endsWith('b') ? NOTES[v] : k]));

export const CHORD_QUALITIES: { [key: string]: number[] } = {
    'Maj': [0, 4, 7], 'min': [0, 3, 7], 'dim': [0, 3, 6], 'aug': [0, 4, 8],
    'Maj7': [0, 4, 7, 11], 'min7': [0, 3, 7, 10], '7': [0, 4, 7, 10],
    'min7b5': [0, 3, 6, 10], 'dim7': [0, 3, 6, 9], 'sus4': [0, 5, 7],
    'sus2': [0, 2, 7], 'add11': [0, 4, 7, 17], 'Maj9': [0, 4, 7, 11, 14],
    'min9': [0, 3, 7, 10, 14], '9': [0, 4, 7, 10, 14], '': [0, 4, 7],
    'add9': [0, 4, 7, 14], 'add13': [0, 4, 7, 21], '6': [0, 4, 7, 9],
    'min11': [0, 3, 7, 10, 14, 17], '13': [0, 4, 7, 10, 14, 21], '7sus4': [0, 5, 7, 10],
    // Add variations for better parsing
    'm': [0, 3, 7], 'm7': [0, 3, 7, 10], 'maj7': [0, 4, 7, 11], 'm9': [0, 3, 7, 10, 14], 'maj9': [0, 4, 7, 11, 14],
    'sus': [0, 5, 7], '7alt': [0, 4, 10, 13], '7#9': [0, 4, 10, 15], '7b9': [0, 4, 10, 13],
    'm7b5': [0, 3, 6, 10], 'alt': [0, 4, 10, 13], '#9': [0, 4, 10, 15], 'b9': [0, 4, 10, 13],
    '11': [0, 4, 7, 10, 14, 17], '#11': [0, 4, 7, 11, 18],
    'maj7#11': [0, 4, 7, 11, 18], '7#11': [0, 4, 7, 10, 18], 'add2': [0, 2, 4, 7],
};


// --- UTILITY FUNCTIONS ---
export const noteToMidi = (noteName: string): number | null => {
    if (!noteName) return null;
    const match = noteName.match(/^([A-G][#b]?)(-?\d+)$/);
    if (!match) {
        console.warn(`Invalid note name format: ${noteName}`);
        return null;
    }
    const [, name, octaveStr] = match;
    const octave = parseInt(octaveStr, 10);
    
    // Normalize flats to sharps for PITCH_CLASS_MAP
    let pitchName = name;
    if (name.includes('b')) {
        const pc = PITCH_CLASS_MAP[name];
        if (pc !== undefined) pitchName = NOTES[pc];
    }
    
    const pitchValue = PITCH_CLASS_MAP[pitchName];

    if (pitchValue === undefined) {
        console.warn(`Could not find pitch value for: ${pitchName}`);
        return null;
    }
    return (octave + 1) * 12 + pitchValue;
};

export const midiToNote = (midi: number): string => {
    if (midi < 0 || midi > 127 || !Number.isInteger(midi)) {
        console.warn(`Invalid MIDI number: ${midi}`);
        return '';
    }
    const octave = Math.floor(midi / 12) - 1;
    const noteIndex = midi % 12;
    return NOTES[noteIndex] + octave;
};

export const timeToSeconds = (time: string | number, bpm = 120, timeSignature = "4/4"): number => {
    if (typeof time === 'number') {
        return time;
    }
    if (typeof time === 'string') {
        const parts = time.split(':').map(Number);
        if (parts.length === 3 && !parts.some(isNaN)) {
            const [bars, beats, sixteenths] = parts;
            const beatsPerBar = parseInt(timeSignature.split('/')[0], 10) || 4;
            const secondsPerBeat = 60 / bpm;
            return (bars * beatsPerBar + beats + sixteenths / 4) * secondsPerBeat;
        }
        // Handle notation like '4n', '8t' etc. as a fallback
        const secondsPerBeat = 60 / bpm;
        switch(time) {
            case '1m': return (parseInt(timeSignature.split('/')[0], 10) || 4) * secondsPerBeat;
            case '2n': return 2 * secondsPerBeat;
            case '4n': return secondsPerBeat;
            case '8n': return secondsPerBeat / 2;
            case '16n': return secondsPerBeat / 4;
            case '32n': return secondsPerBeat / 8;
            default: return 0.1; // Fallback for unknown strings
        }
    }
    return 0;
};

export const secondsToBBS = (seconds: number, bpm = 120, timeSignature = "4/4"): string => {
    const beatsPerBar = parseInt(timeSignature.split('/')[0], 10) || 4;
    const secondsPerBeat = 60 / bpm;
    if (secondsPerBeat === 0) return '0:0:0';

    const totalBeats = seconds / secondsPerBeat;
    const bars = Math.floor(totalBeats / beatsPerBar);
    const remainingBeats = totalBeats % beatsPerBar;
    const beats = Math.floor(remainingBeats);
    const sixteenths = Math.round((remainingBeats - beats) * 4);
    
    // Handle rounding up to the next beat/bar
    if (sixteenths === 4) {
        const newBeats = beats + 1;
        if (newBeats === beatsPerBar) {
            return `${bars + 1}:0:0`;
        }
        return `${bars}:${newBeats}:0`;
    }

    return `${bars}:${beats}:${sixteenths}`;
};

export const transposeNoteName = (noteName: string, semitones: number): string => {
    const midi = noteToMidi(noteName);
    if (midi === null) return noteName;

    const newMidi = midi + semitones;
    if (newMidi < 0 || newMidi > 127) return noteName;

    return midiToNote(newMidi);
};

export const applyChordInversion = (notes: string[], inversion: number): string[] => {
    if (!notes || notes.length < 2 || inversion === 0) {
        return notes;
    }

    const sortedMidi = notes
        .map(noteToMidi)
        .filter((midi): midi is number => midi !== null)
        .sort((a, b) => a - b);
    
    if (sortedMidi.length < 2) {
        return notes; // Not enough valid notes to invert
    }

    let processingInversion = inversion;
    let newMidiNotes = [...sortedMidi];

    // Handle positive inversions (move bottom notes up)
    while (processingInversion > 0) {
        const firstNote = newMidiNotes.shift();
        if (firstNote) {
            newMidiNotes.push(firstNote + 12);
        }
        processingInversion--;
    }

    // Handle negative inversions (move top notes down)
    while (processingInversion < 0) {
        const lastNote = newMidiNotes.pop();
        if (lastNote) {
            newMidiNotes.unshift(lastNote - 12);
        }
        processingInversion++;
    }

    return newMidiNotes.map(midiToNote);
};

export const parseChordNameSimple = (name: string) => {
    const Cb = name.match(/^([A-G][#b]?)(.*)/);
    if (!Cb) return { root: 'C', quality: '', bass: null };
    const root = Cb[1];
    let qualityAndBass = Cb[2];
    let bass = null;

    const slash = qualityAndBass.indexOf('/');
    if (slash !== -1) {
        bass = qualityAndBass.substring(slash + 1).trim();
        qualityAndBass = qualityAndBass.substring(0, slash).trim();
    }
    
    // Find the longest matching quality name first
    const quality = Object.keys(CHORD_QUALITIES)
        .sort((a, b) => b.length - a.length)
        .find(q => qualityAndBass === q) || '';

    return { root, quality, bass };
};

export const generateChordNotes = (rootNote: string, quality: string, baseOctave: number = 4): string[] => {
    const intervals = CHORD_QUALITIES[quality];
    if (!intervals) {
        console.warn(`Unknown chord quality: ${quality}`);
        // Fallback to major triad if quality is unknown
        return generateChordNotes(rootNote, 'Maj', baseOctave);
    }

    const rootMidi = noteToMidi(`${rootNote}${baseOctave}`);
    if (rootMidi === null) return [];

    return intervals.map(interval => midiToNote(rootMidi + interval));
};

export const MODE_INTERVALS: { [key: string]: number[] } = {
    'Major': [0, 2, 4, 5, 7, 9, 11],
    'Minor': [0, 2, 3, 5, 7, 8, 10], // Natural Minor
    'Dorian': [0, 2, 3, 5, 7, 9, 10],
    'Phrygian': [0, 1, 3, 5, 7, 8, 10],
    'Lydian': [0, 2, 4, 6, 7, 9, 11],
    'Mixolydian': [0, 2, 4, 5, 7, 9, 10],
    'Locrian': [0, 1, 3, 5, 6, 8, 10],
    'Harmonic Minor': [0, 2, 3, 5, 7, 8, 11],
    'Harmonic Major': [0, 2, 4, 5, 7, 8, 11],
    'Melodic Minor': [0, 2, 3, 5, 7, 9, 11], // Ascending
    'Major Pentatonic': [0, 2, 4, 7, 9],
    'Minor Pentatonic': [0, 3, 5, 7, 10],
    'Minor Blues': [0, 3, 5, 6, 7, 10],
    'Whole Tone': [0, 2, 4, 6, 8, 10],
    'Whole-half Dim.': [0, 2, 3, 5, 6, 8, 9, 11],
    'Half-whole Dim.': [0, 1, 3, 4, 6, 7, 9, 10],
    'Phrygian Dominant': [0, 1, 4, 5, 7, 8, 10],
    'Lydian Augmented': [0, 2, 4, 6, 8, 9, 11],
    'Lydian Dominant': [0, 2, 4, 6, 7, 9, 10],
    'Dorian #4': [0, 2, 3, 6, 7, 9, 10]
};

export const getScaleNotes = (root: string, mode: string): string[] => {
    const intervals = MODE_INTERVALS[mode];
    if (!intervals) {
        console.warn(`Unknown mode: ${mode}. Defaulting to Major.`);
        return getScaleNotes(root, 'Major');
    }

    const rootIndex = PITCH_CLASS_MAP[root];
    if (rootIndex === undefined) {
        console.error(`Invalid root note: ${root}`);
        return [];
    }
    
    return intervals.map(interval => NOTES[(rootIndex + interval) % 12]);
};

export const getDiatonicChordInScale = (degree: number, scaleNotes: string[], baseOctave: number = 4): { name: string, notes: string[] } => {
    if (degree < 0 || degree >= scaleNotes.length || scaleNotes.length === 0) {
        // Return a default or error state if inputs are invalid
        return { name: 'N/A', notes: [] };
    }
    
    const rootNote = scaleNotes[degree];
    
    // Build a triad by stacking thirds *within the scale*
    const thirdNote = scaleNotes[(degree + 2) % scaleNotes.length];
    const fifthNote = scaleNotes[(degree + 4) % scaleNotes.length];

    const rootMidi = noteToMidi(`${rootNote}${baseOctave}`);
    let thirdMidi = noteToMidi(`${thirdNote}${baseOctave}`);
    let fifthMidi = noteToMidi(`${fifthNote}${baseOctave}`);
    
    if (rootMidi === null || thirdMidi === null || fifthMidi === null) {
         return { name: 'Error', notes: [] };
    }

    if (thirdMidi < rootMidi) thirdMidi += 12;
    if (fifthMidi < thirdMidi) fifthMidi += 12;
    if (fifthMidi < rootMidi) fifthMidi += 12;

    const notes = [midiToNote(rootMidi), midiToNote(thirdMidi), midiToNote(fifthMidi)];

    const interval1 = (thirdMidi - rootMidi) % 12;
    const interval2 = (fifthMidi - rootMidi) % 12;

    let quality = '';
    if (interval1 === 4 && interval2 === 7) {
        quality = ''; // Major
    } else if (interval1 === 3 && interval2 === 7) {
        quality = 'min';
    } else if (interval1 === 3 && interval2 === 6) {
        quality = 'dim';
    } else if (interval1 === 4 && interval2 === 8) {
        quality = 'aug';
    } else {
        quality = `(${thirdNote},${fifthNote})`;
    }

    const chordName = `${rootNote}${quality}`;

    return { name: chordName, notes };
};