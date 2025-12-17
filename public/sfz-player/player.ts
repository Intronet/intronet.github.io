import { useState, useEffect } from 'react';
import { noteToMidi } from '../musicUtils';

declare const Tone: any;

interface UseSfzPlayerProps {
    url: string;
    load: boolean;
    onLoad: () => void;
}

const sfzCache: { [key: string]: { player: any } } = {};

const processRegion = (region: Record<string, string>, urls: Record<string, string>, baseUrl: string) => {
    const { sample, pitch_keycenter } = region;
    if (!sample || !pitch_keycenter) return;

    const getMidi = (note: string): number | null => {
        // First, check if it's a plain MIDI number
        const asInt = parseInt(note, 10);
        if (!isNaN(asInt) && asInt >= 0 && asInt <= 127) {
            return asInt;
        }

        // Regex to capture note parts: letter, optional accidental, and octave.
        // It handles upper/lower case letters and 's' for sharp.
        const match = note.match(/^([a-gA-G])([#bs]?)(\-?\d+)$/);
        
        if (match) {
            const name = match[1].toUpperCase();
            // Normalize 's' to '#' and 'b' to 'b'. Default to empty string.
            const accidental = (match[2] || '').toLowerCase().replace('s', '#');
            const octave = match[3];
            
            // Reconstruct into the format expected by noteToMidi (e.g., "C#4")
            const formattedNote = `${name}${accidental}${octave}`;
            return noteToMidi(formattedNote);
        }

        // Could not parse the note string.
        console.warn(`[SFZ Parser] Could not parse note name: ${note}`);
        return null;
    };


    const keycenterMidi = getMidi(pitch_keycenter);
    if (keycenterMidi === null) return;
    
    const keyCenterNoteName = Tone.Frequency(keycenterMidi, 'midi').toNote();
    
    // Construct absolute URL for the sample
    const sampleUrl = new URL(sample.replace(/\\/g, '/'), baseUrl).href;

    // If multiple regions define the same keycenter (e.g., for different velocity layers),
    // this simple parser will let the last one win.
    urls[keyCenterNoteName] = sampleUrl;
};

const parseSfz = async (sfzUrl: string): Promise<Record<string, string>> => {
    const response = await fetch(sfzUrl);
    if (!response.ok) {
        throw new Error(`Failed to fetch SFZ file: ${sfzUrl} (${response.status})`);
    }
    const sfzText = await response.text();
    const baseUrl = sfzUrl; // Use the full URL as the base for URL constructor

    const urls: Record<string, string> = {};
    const lines = sfzText.split('\n');

    let currentRegion: Record<string, string> = {};

    for (const line of lines) {
        const trimmedLine = line.split('//')[0].trim(); // Handle comments
        if (trimmedLine.length === 0) continue;

        if (trimmedLine.startsWith('<region>')) {
            if (Object.keys(currentRegion).length > 0) {
                processRegion(currentRegion, urls, baseUrl);
            }
            currentRegion = {};
        } else if (trimmedLine.includes('=')) {
            const parts = trimmedLine.split('=');
            const opcode = parts[0].trim();
            const value = parts.slice(1).join('=').trim();
            currentRegion[opcode] = value;
        }
    }
    // Process the last region in the file
    if (Object.keys(currentRegion).length > 0) {
        processRegion(currentRegion, urls, baseUrl);
    }

    return urls;
}


export const useSfzPlayer = ({ url, load, onLoad }: UseSfzPlayerProps) => {
    const [player, setPlayer] = useState<any | null>(null);
    const [isLoaded, setIsLoaded] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        let mounted = true;
        
        const loadInstrument = async () => {
            if (!url || !load) return;

            if (sfzCache[url]) {
                if (mounted) {
                    setPlayer(sfzCache[url].player);
                    setIsLoaded(true);
                    onLoad();
                }
                return;
            }

            if (mounted) {
                setIsLoaded(false);
                setError(null);
            }

            try {
                const urls = await parseSfz(url);
                if (Object.keys(urls).length === 0) {
                    throw new Error("SFZ file parsed, but no valid sample regions were found.");
                }

                const sampler = new Tone.Sampler({
                    urls,
                    release: 1,
                });
                
                await Tone.loaded();

                if (mounted) {
                    sfzCache[url] = { player: sampler };
                    setPlayer(sampler);
                    setIsLoaded(true);
                    onLoad();
                }

            } catch (e) {
                const errorMessage = e instanceof Error ? e.message : String(e);
                console.error(`[SFZ Player Error] Failed to load or parse instrument. URL: ${url}. Reason: ${errorMessage}`, e);
                if (mounted) {
                    setError(errorMessage);
                    setPlayer(null);
                    setIsLoaded(false);
                }
            }
        };

        loadInstrument();

        return () => { mounted = false; };
    }, [url, load, onLoad]);

    return { player, isLoaded, error };
}