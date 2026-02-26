/**
 * VIRTUOSO ENGINE — Single ESM Build
 * Consolidated from: types.ts, sfz-parser.ts, midi-parser.ts, audio-engine.ts, index.ts
 * All logic preserved exactly from the working multi-file version.
 */

// ============================================================================
// TYPES (from types.ts)
// ============================================================================

export const InstrumentArchetype = Object.freeze({
  PIANO: 'PIANO',
  ORGAN: 'ORGAN',
  PAD: 'PAD',
  PERCUSSION: 'PERCUSSION',
  DEFAULT: 'DEFAULT'
});

// ============================================================================
// SFZ PARSER (from kernel/sfz-parser.ts)
// ============================================================================

class SfzParser {
  static noteMap = {
    c: 0, 'c#': 1, db: 1, d: 2, 'd#': 3, eb: 3, e: 4, f: 5, 'f#': 6, gb: 6, g: 7, 'g#': 8, ab: 8, a: 9, 'a#': 10, bb: 10, b: 11
  };

  static parseNote(val) {
    if (val === undefined || val === null) return 60;
    const trimmed = String(val).trim().toLowerCase();
    if (!isNaN(parseInt(trimmed))) return parseInt(trimmed);
    const m = trimmed.match(/^([a-g][#b]?)(-?\d+)$/);
    if (!m) return 60;
    return (parseInt(m[2]) + 1) * 12 + this.noteMap[m[1]];
  }

  static parseOpcodes(text) {
    const ops = {};
    const parts = text.match(/"[^"]*"|[^\s]+/g) || [];
    for (let i = 0; i < parts.length; i++) {
      let p = parts[i]; let k = ""; let v = "";
      if (p.includes('=')) { const eq = p.indexOf('='); k = p.substring(0, eq); v = p.substring(eq + 1); } else { k = p; v = ""; }
      while (i + 1 < parts.length && !parts[i + 1].includes('=')) v += (v === '' ? '' : ' ') + parts[++i];
      if (k) { const cleanK = k.toLowerCase(); if (v.startsWith('"') && v.endsWith('"')) v = v.slice(1, -1); ops[cleanK] = v; }
    }
    return ops;
  }

  static parse(text, logCallback) {
    const regions = [];
    const clean = text.replace(/\/\/.*/g, '').replace(/\/\*[\s\S]*?\*\//g, '').replace(/\r?\n/g, ' ');
    const sections = clean.split(/(?=<[a-zA-Z0-9]+>)/gi);
    let gState = {}; let grpState = {}; let dPath = "";
    const castN = (v, d) => { const n = parseFloat(v); return isNaN(n) ? d : n; };
    for (let section of sections) {
      const trimmed = section.trim(); if (!trimmed) continue;
      const hMatch = trimmed.match(/^<([a-zA-Z0-9]+)>/i); if (!hMatch) continue;
      const type = hMatch[1].toLowerCase(); const ops = this.parseOpcodes(trimmed.replace(/<[^>]+>/, '').trim());
      if (type === 'control' && ops.default_path) { dPath = ops.default_path.replace(/\\/g, '/'); if (dPath && !dPath.endsWith('/')) dPath += '/'; }
      else if (type === 'global') { gState = ops; grpState = {}; }
      else if (type === 'group') grpState = ops;
      else if (type === 'region') {
        const c = { ...gState, ...grpState, ...ops }; let lo = 0, hi = 127, p = 60;
        if (c.key !== undefined) lo = hi = p = this.parseNote(c.key);
        else { lo = c.lokey !== undefined ? this.parseNote(c.lokey) : 0; hi = c.hikey !== undefined ? this.parseNote(c.hikey) : 127; p = c.pitch_keycenter !== undefined ? this.parseNote(c.pitch_keycenter) : 60; }
        const r = {
          sample: c.sample?.replace(/\\/g, '/'),
          lokey: lo,
          hikey: hi,
          lovel: castN(c.lovel, 0),
          hivel: castN(c.hivel, 127),
          pitch_keycenter: p,
          pitch_keytrack: castN(c.pitch_keytrack, 100),
          volume: castN(c.volume, 0),
          pan: castN(c.pan, 0),
          position: castN(c.position, 0),
          width: castN(c.width, 100),
          tune: castN(c.tune, 0),
          offset: castN(c.offset, 0),
          delay: castN(c.delay, 0),
          delay_random: castN(c.delay_random, 0),
          loop_mode: c.loop_mode,
          loop_start: c.loop_start !== undefined ? parseInt(c.loop_start) : undefined,
          loop_end: c.loop_end !== undefined ? parseInt(c.loop_end) : undefined,
          trigger: c.trigger || 'attack',
          seq_length: c.seq_length !== undefined ? parseInt(c.seq_length) : undefined,
          seq_position: c.seq_position !== undefined ? parseInt(c.seq_position) : undefined,
          lorand: castN(c.lorand, 0),
          hirand: castN(c.hirand, 1),
          ampeg_attack: castN(c.ampeg_attack, 0),
          ampeg_decay: castN(c.ampeg_decay, 0),
          ampeg_sustain: castN(c.ampeg_sustain, 100),
          ampeg_release: castN(c.ampeg_release, 0.1),
          ampeg_vel2attack: castN(c.ampeg_vel2attack, 0),
          transpose: castN(c.transpose, 0),
          cutoff: castN(c.cutoff, 0),
          resonance: castN(c.resonance, 0),
          fil_veltrack: castN(c.fil_veltrack, 0),
          fil_keytrack: castN(c.fil_keytrack, 0),
          amp_veltrack: castN(c.amp_veltrack, 100),
          group: c.group !== undefined ? parseInt(c.group) : 0,
          off_by: c.off_by !== undefined ? parseInt(c.off_by) : undefined,
          bend_up: castN(c.bend_up, 200),
          bend_down: castN(c.bend_down, -200),
          amp_random: castN(c.amp_random, 0),
          pitch_random: castN(c.pitch_random, 0),
          lfo_freq: castN(c.lfo_freq, 0),
          lfo_delay: castN(c.lfo_delay, 0),
          lfo_fade: castN(c.lfo_fade, 0),
          pitch_lfo: castN(c.pitch_lfo, 0),
          cutoff_lfo: castN(c.cutoff_lfo, 0),
          fillfo_depth: castN(c.fillfo_depth, 0),
          file_env_attack: castN(c.file_env_attack, 0),
          file_env_decay: castN(c.file_env_decay, 0),
          file_env_sustain: castN(c.file_env_sustain, 100),
          file_env_release: castN(c.file_env_release, 0.1),
          file_env_depth: castN(c.file_env_depth, 0),
        };
        if (r.sample && dPath && !(r.sample.startsWith('/') || r.sample.includes(':'))) r.sample = dPath + r.sample;
        regions.push(r);
      }
    }
    logCallback(`Parsed ${regions.length} regions.`);
    return regions;
  }
}

// ============================================================================
// MIDI PARSER (from kernel/midi-parser.ts)
// ============================================================================

export class MidiParser {
  static async parse(buffer) {
    const data = new DataView(buffer);
    let offset = 0;

    if (this.readString(data, offset, 4) !== 'MThd') throw new Error('Invalid SMF');
    const headerSize = data.getUint32(offset + 4);
    offset += 8;
    const format = data.getUint16(offset);
    const tracksCount = data.getUint16(offset + 2);
    const division = data.getUint16(offset + 4);
    offset += headerSize;

    const tracks = [];
    for (let i = 0; i < tracksCount; i++) {
      if (this.readString(data, offset, 4) !== 'MTrk') break;
      const trackSize = data.getUint32(offset + 4);
      const trackEnd = offset + 8 + trackSize;
      offset += 8;

      const events = [];
      let absoluteTime = 0;
      let lastStatus = 0;

      while (offset < trackEnd) {
        const delta = this.readVLQ(data, offset);
        offset = delta.newOffset;
        absoluteTime += delta.value;

        let status = data.getUint8(offset);
        if (status < 0x80) status = lastStatus;
        else { offset++; lastStatus = status; }

        const type = status >> 4;
        const channel = status & 0x0F;

        if (status === 0xFF) {
          const metaType = data.getUint8(offset++);
          const len = this.readVLQ(data, offset);
          const dataStart = len.newOffset;

          let tempo;
          let timeSignature;

          if (metaType === 0x51) {
            tempo = (data.getUint8(dataStart) << 16) | (data.getUint8(dataStart + 1) << 8) | data.getUint8(dataStart + 2);
          } else if (metaType === 0x58) {
            timeSignature = { num: data.getUint8(dataStart), den: Math.pow(2, data.getUint8(dataStart + 1)) };
          }

          events.push({ deltaTime: delta.value, absoluteTime, type: 'meta', channel, metaType, tempo, timeSignature });
          offset = len.newOffset + len.value;
        } else {
          switch (type) {
            case 0x8: events.push({ type: 'noteOff', deltaTime: delta.value, absoluteTime, channel, note: data.getUint8(offset++), velocity: data.getUint8(offset++) }); break;
            case 0x9:
              const v = data.getUint8(offset + 1);
              events.push({ type: v > 0 ? 'noteOn' : 'noteOff', deltaTime: delta.value, absoluteTime, channel, note: data.getUint8(offset), velocity: v });
              offset += 2;
              break;
            case 0xB: events.push({ type: 'cc', deltaTime: delta.value, absoluteTime, channel, controller: data.getUint8(offset++), value: data.getUint8(offset++) }); break;
            default: offset++;
          }
        }
      }
      tracks.push({ events });
      offset = trackEnd;
    }
    return { header: { format, tracks: tracksCount, division }, tracks };
  }

  static readString(data, offset, len) {
    let s = '';
    for (let i = 0; i < len; i++) s += String.fromCharCode(data.getUint8(offset + i));
    return s;
  }

  static readVLQ(data, offset) {
    let v = 0;
    while (true) {
      const b = data.getUint8(offset++);
      v = (v << 7) | (b & 0x7F);
      if (!(b & 0x80)) break;
    }
    return { value: v, newOffset: offset };
  }
}

// ============================================================================
// PERSISTENT CACHE (from kernel/audio-engine.ts)
// ============================================================================

class PersistentCache {
  constructor() {
    this.db = null;
    this.dbPromise = null;
    this.DB_NAME = 'Virtuoso_L2_Cache_v3';
    this.STORE_NAME = 'segments';
  }

  async init() {
    if (this.db) return this.db;
    if (this.dbPromise) return this.dbPromise;

    this.dbPromise = new Promise((resolve, reject) => {
      const request = indexedDB.open(this.DB_NAME, 1);
      request.onupgradeneeded = () => {
        if (!request.result.objectStoreNames.contains(this.STORE_NAME)) {
          request.result.createObjectStore(this.STORE_NAME);
        }
      };
      request.onsuccess = () => {
        this.db = request.result;
        resolve(this.db);
      };
      request.onerror = () => reject(request.error);
    });
    return this.dbPromise;
  }

  async get(key) {
    try {
      const db = await this.init();
      return new Promise((resolve) => {
        const tx = db.transaction(this.STORE_NAME, 'readonly');
        const store = tx.objectStore(this.STORE_NAME);
        const req = store.get(key);
        req.onsuccess = () => resolve(req.result || null);
        req.onerror = () => resolve(null);
      });
    } catch (e) { return null; }
  }

  async set(key, data) {
    try {
      const db = await this.init();
      const tx = db.transaction(this.STORE_NAME, 'readwrite');
      tx.objectStore(this.STORE_NAME).put(data, key);
      return new Promise((r) => { tx.oncomplete = () => r(); });
    } catch (e) { return; }
  }

  async clear() {
    const db = await this.init();
    const tx = db.transaction(this.STORE_NAME, 'readwrite');
    tx.objectStore(this.STORE_NAME).clear();
    return new Promise((r) => { tx.oncomplete = () => r(); });
  }
}

// ============================================================================
// AUDIO ENGINE (from kernel/audio-engine.ts)
// ============================================================================

class AudioEngine {
  constructor(config = {}) {
    this.onTelemetryUpdate = config.onTelemetryUpdate;
    this.onHealthUpdate = config.onHealthUpdate;
    this.onLog = config.onLog;
    this.onBytesUpdate = config.onBytesUpdate;
    this.onHydrationProgress = config.onHydrationProgress;
    this.onPeakUpdate = config.onPeakUpdate;

    this.trackID = config.trackID || 'v-track-1';
    this.lastUrl = null;
    this.instrument = null;
    this.activeVoices = new Map();
    this.noteToVoiceIds = new Map();
    this.normalizationFactors = new Map();
    this.sustainActive = false;

    this.l2Cache = new PersistentCache();
    this.headRawCache = new Map();
    this.bodyCache = new Map();
    this.bodyUsageOrder = [];
    this.ioRegistry = new Map();

    this.hydrationAbort = new AbortController();

    this.underflowCount = 0;
    this.deltaViolationCount = 0;
    this.totalStitches = 0;
    this.jitterCount = 0;
    this.ioErrorCount = 0;

    this.TIER1_HEAD_SIZE = 512 * 1024;
    this.STITCH_CROSSFADE_MS = 100;
    this.CONCURRENCY_CAP = 12;
    this.DECODE_CONCURRENCY_CAP = 4;
    this.CACHE_EVICTION_THRESHOLD = 128;

    this.activeFetches = 0;
    this.interactiveFetches = 0;
    this.activeDecodes = 0;
    this.fetchQueue = [];
    this.decodeQueue = [];

    this.totalBytesFetched = 0;
    this.totalBytesFromCache = 0;
    this.totalVfsSize = 0;

    this.ctx = config.context || new (window.AudioContext || window.webkitAudioContext)({
      latencyHint: 'interactive',
      sampleRate: 44100
    });

    this.masterGain = this.ctx.createGain();
    this.limiter = this.ctx.createDynamicsCompressor();
    this.analyzer = this.ctx.createAnalyser();
    this.analyzer.fftSize = 512;

    this.masterGain.connect(this.limiter);
    this.limiter.connect(this.analyzer);
    this.analyzer.connect(this.ctx.destination);

    this.limiter.threshold.setValueAtTime(-3.0, this.ctx.currentTime);
    this.limiter.knee.setValueAtTime(10, this.ctx.currentTime);
    this.masterGain.gain.value = 0.45;

    setInterval(() => this.backgroundRefreshMetrics(), 120);
  }

  get outputNode() { return this.analyzer; }

  resetHealth() {
    this.underflowCount = 0; this.deltaViolationCount = 0; this.totalStitches = 0;
    this.jitterCount = 0; this.ioErrorCount = 0; this.totalBytesFetched = 0; this.totalBytesFromCache = 0;
  }

  backgroundRefreshMetrics() {
    if (this.onHealthUpdate) {
      const totalActivity = this.totalBytesFetched + this.totalBytesFromCache;
      const hitRate = totalActivity > 0 ? (this.totalBytesFromCache / totalActivity) * 100 : 0;
      this.onHealthUpdate({
        underflows: this.underflowCount, deltaViolations: this.deltaViolationCount, staleBlocks: this.totalStitches,
        alignmentViolations: 0, loopCycles: 0, midiLoopCount: 0, jitters: this.jitterCount, ioErrors: this.ioErrorCount,
        cacheHitRate: hitRate, activeTransactions: this.activeFetches, memoryUsageMB: (this.bodyCache.size * 2),
        l2MemoryUsageMB: 0, tailLatencyMS: 0, zombieKills: 0
      });
    }
    if (this.onBytesUpdate) this.onBytesUpdate(this.totalBytesFetched, this.totalBytesFromCache, this.totalVfsSize);
    if (this.onTelemetryUpdate) this.onTelemetryUpdate(this.getActiveVoiceTelemetry());

    if (this.onPeakUpdate) {
      const timeData = new Uint8Array(this.analyzer.fftSize);
      this.analyzer.getByteTimeDomainData(timeData);
      let max = 0;
      for (let i = 0; i < timeData.length; i++) {
        const v = Math.abs(timeData[i] - 128);
        if (v > max) max = v;
      }
      this.onPeakUpdate(max / 128);
    }
  }

  async semaphoreDecode(ab, key) {
    const registryKey = `decode:${key}`;
    if (this.ioRegistry.has(registryKey)) return this.ioRegistry.get(registryKey);

    const promise = (async () => {
      if (this.activeDecodes >= this.DECODE_CONCURRENCY_CAP) {
        await new Promise(r => this.decodeQueue.push(r));
      }
      this.activeDecodes++;
      try {
        const buffer = await this.ctx.decodeAudioData(ab);
        this.updateCache(key, buffer);
        return buffer;
      } finally {
        this.activeDecodes--;
        this.ioRegistry.delete(registryKey);
        if (this.decodeQueue.length > 0) this.decodeQueue.shift()();
      }
    })();
    this.ioRegistry.set(registryKey, promise);
    return promise;
  }

  updateCache(key, buffer) {
    if (this.bodyCache.has(key)) {
      this.bodyUsageOrder = this.bodyUsageOrder.filter(k => k !== key);
    } else if (this.bodyCache.size >= this.CACHE_EVICTION_THRESHOLD) {
      const oldest = this.bodyUsageOrder.shift();
      if (oldest) this.bodyCache.delete(oldest);
    }
    this.bodyCache.set(key, buffer);
    this.bodyUsageOrder.push(key);
  }

  resolveUrl(base, path) {
    if (path.startsWith('http')) return path;
    const cleanPath = path.replace(/\\/g, '/');
    const encodedPath = cleanPath.split('/').map(part => encodeURIComponent(part)).join('/');
    return base + encodedPath;
  }

  async binaryFetch(url, signal, rangeStr, isPriority = false) {
    const registryKey = `vfs:${url}:${rangeStr || 'full'}`;
    if (this.ioRegistry.has(registryKey)) return this.ioRegistry.get(registryKey);

    const cached = await this.l2Cache.get(registryKey);
    if (cached) { this.totalBytesFromCache += cached.byteLength; return cached; }

    const fetchTask = (async () => {
      if (!isPriority && (this.activeFetches >= this.CONCURRENCY_CAP || this.interactiveFetches > 0)) {
        await new Promise(resolve => this.fetchQueue.push(resolve));
      }

      if (isPriority) this.interactiveFetches++;
      this.activeFetches++;

      try {
        const headers = {};
        if (rangeStr) headers['Range'] = rangeStr;
        const res = await fetch(url, { signal, headers });

        if (res.status === 416 && rangeStr) {
          return await this.binaryFetch(url, signal, undefined, isPriority);
        }

        if (!res.ok && res.status !== 206) {
          this.ioErrorCount++;
          throw new Error(`HTTP_${res.status}_${url}`);
        }
        const buffer = await res.arrayBuffer();
        this.totalBytesFetched += buffer.byteLength;
        await this.l2Cache.set(registryKey, buffer.slice(0));
        return buffer;
      } catch (e) {
        if (e.name !== 'AbortError') this.ioErrorCount++;
        throw e;
      } finally {
        this.activeFetches--;
        if (isPriority) this.interactiveFetches--;
        this.ioRegistry.delete(registryKey);
        if (this.fetchQueue.length > 0) this.fetchQueue.shift()();
      }
    })();
    this.ioRegistry.set(registryKey, fetchTask);
    return fetchTask;
  }

  async resume() { if (this.ctx.state === 'suspended') await this.ctx.resume(); }

  async hydrateAsync(paths, loader, isPriority = false) {
    const prioritized = [...paths].sort((a, b) => {
      const getNote = (p) => {
        const m = p.match(/\d+/);
        return m ? parseInt(m[0]) : 60;
      };
      const nA = getNote(a), nB = getNote(b);
      const isAPrio = nA >= 48 && nA <= 72;
      const isBPrio = nB >= 48 && nB <= 72;
      if (isAPrio && !isBPrio) return -1;
      if (!isAPrio && isBPrio) return 1;
      return 0;
    });

    let hydratedCount = 0;
    const pool = [...prioritized];
    const total = paths.length;

    const workers = Array.from({ length: isPriority ? 8 : 4 }).map(async () => {
      while (pool.length > 0) {
        const path = pool.shift();
        if (!path) break;
        try {
          await loader(path);
          hydratedCount++;
          if (this.onHydrationProgress) this.onHydrationProgress((hydratedCount / total) * 100);
        } catch (e) {
          if (e.name === 'AbortError') pool.unshift(path);
        }
      }
    });

    await Promise.all(workers);
  }

  async loadRemoteVfs(url) {
    this.panic();
    this.lastUrl = url;
    this.bodyCache.clear();
    this.headRawCache.clear();
    this.ioRegistry.clear();
    this.hydrationAbort.abort();
    this.hydrationAbort = new AbortController();

    const isSfz = url.toLowerCase().endsWith('.sfz') || url.includes('.txt');
    let regions = [];
    let sampleHeads = new Map();
    let storageHandles = new Map();
    let name = url.split('/').pop() || 'Remote Instrument';

    if (isSfz) {
      const res = await fetch(url);
      const text = await res.text();
      regions = SfzParser.parse(text, msg => this.onLog?.(msg));
      const baseUrl = url.substring(0, url.lastIndexOf('/') + 1);

      this.instrument = {
        name, regions, sampleHeads, sampleSources: new Map(), storageHandles, samples: sampleHeads, archetype: InstrumentArchetype.PIANO,
        diagnostics: { parsingLogs: [], mappingLogs: [], runtimeLogs: [], stats: { totalRegions: regions.length, mappedSamples: 0, unmappedSamples: regions.length } }
      };

      const uniqueSamples = Array.from(new Set(regions.map(r => r.sample).filter(Boolean)));

      this.hydrateAsync(uniqueSamples, async (path) => {
        const sampleUrl = this.resolveUrl(baseUrl, path);
        const ab = await this.binaryFetch(sampleUrl, this.hydrationAbort.signal, `bytes=0-${this.TIER1_HEAD_SIZE - 1}`);
        const buffer = await this.semaphoreDecode(ab.slice(0), `head:${path}`);
        sampleHeads.set(path, buffer);
        this.normalizationFactors.set(path, this.calculateNormalization(buffer));
        storageHandles.set(path, { type: 'remote', url: sampleUrl, byteSize: 0, isVfs: false });
      }, false);

    } else {
      const probeBuffer = await this.binaryFetch(url, undefined, 'bytes=0-7', true);
      const manifestOffset = Number(new DataView(probeBuffer).getBigUint64(0, true));
      const manifestBuffer = await this.binaryFetch(url, undefined, `bytes=${manifestOffset}-`, true);
      const manifest = JSON.parse(new TextDecoder().decode(manifestBuffer));
      regions = SfzParser.parse(manifest.sfz, msg => this.onLog?.(msg));
      const paths = Object.keys(manifest.samples);

      this.instrument = {
        name, regions, sampleHeads, sampleSources: new Map(), storageHandles, samples: sampleHeads, archetype: InstrumentArchetype.PIANO,
        diagnostics: { parsingLogs: [], mappingLogs: [], runtimeLogs: [], stats: { totalRegions: regions.length, mappedSamples: 0, unmappedSamples: paths.length } }
      };

      this.totalVfsSize = paths.reduce((a, p) => a + manifest.samples[p].length, 0);

      this.hydrateAsync(paths, async (path) => {
        const entry = manifest.samples[path];
        const headSize = Math.min(entry.length, this.TIER1_HEAD_SIZE);
        const ab = await this.binaryFetch(url, this.hydrationAbort.signal, `bytes=${entry.offset}-${entry.offset + headSize - 1}`);
        const buffer = await this.semaphoreDecode(ab.slice(0), `head:${path}`);
        sampleHeads.set(path, buffer);
        this.normalizationFactors.set(path, this.calculateNormalization(buffer));
        storageHandles.set(path, { type: 'remote', url, byteSize: entry.length, isVfs: true, vfsOffset: entry.offset });
      }, true);
    }

    return this.instrument;
  }

  calculateNormalization(buffer) {
    let maxPeak = 0;
    for (let i = 0; i < buffer.numberOfChannels; i++) {
      const data = buffer.getChannelData(i);
      for (let j = 0; j < data.length; j += 100) {
        const abs = Math.abs(data[j]); if (abs > maxPeak) maxPeak = abs;
      }
    }
    return maxPeak > 0 ? 0.5 / maxPeak : 1.0;
  }

  killVoice(id, fadeTime = 0.05) {
    const v = this.activeVoices.get(id); if (!v) return;
    v.stage = 'R'; v.isDead = true; v.abortController?.abort();
    const now = this.ctx.currentTime;
    v.gain.gain.cancelScheduledValues(now);
    v.gain.gain.setTargetAtTime(0.0001, now, fadeTime / 4.6);
    setTimeout(() => {
      try { v.headSource.stop(); v.bodySource?.stop(); v.headSource.disconnect(); v.bodySource?.disconnect(); v.gain.disconnect(); } catch (e) {}
      this.activeVoices.delete(id);
    }, (fadeTime + 0.1) * 1000);
  }

  controlChange(cc, value, time = this.ctx.currentTime) {
    if (cc === 64) {
      const active = value >= 64;
      if (this.sustainActive && !active) this.activeVoices.forEach((v, id) => { if (v.isSustained) { v.isSustained = false; this.triggerRelease(id, time); } });
      this.sustainActive = active;
    }
  }

  noteOn(note, velocity, time = this.ctx.currentTime, sourceId = 'EXTERNAL') {
    if (!this.instrument) return;
    const matches = this.instrument.regions.filter(r => note >= r.lokey && note <= r.hikey && velocity >= r.lovel && velocity <= r.hivel && r.trigger === 'attack');

    matches.forEach(region => {
      const uuid = `${sourceId}-${note}-${Math.random().toString(36).substring(2, 8)}`;
      const samplePath = region.sample || "";
      const buf = this.instrument?.sampleHeads.get(samplePath);
      if (!buf) return;

      const headSource = this.ctx.createBufferSource(); headSource.buffer = buf;
      const playbackRate = Math.pow(2, ((note - region.pitch_keycenter) * (region.pitch_keytrack / 100) + region.transpose + region.tune / 100) / 12);
      headSource.playbackRate.setValueAtTime(playbackRate, time);

      const filter = this.ctx.createBiquadFilter(); filter.frequency.value = region.cutoff || 20000;
      const panner = this.ctx.createStereoPanner(); panner.pan.value = region.pan / 100;

      const voiceGain = this.ctx.createGain();
      const norm = this.normalizationFactors.get(samplePath) || 1.0;
      const targetGain = (velocity / 127) * norm;

      voiceGain.gain.setValueAtTime(0, time);
      voiceGain.gain.linearRampToValueAtTime(targetGain, time + Math.max(0.002, region.ampeg_attack));

      const headGain = this.ctx.createGain();
      headSource.connect(headGain); headGain.connect(filter);
      filter.connect(panner); panner.connect(voiceGain); voiceGain.connect(this.masterGain);
      headSource.start(time);

      const voice = {
        uuid, sourceId, headSource, headGain, filter, panner, gain: voiceGain, region,
        startTime: time, note, velocity, isSustained: false, isReleased: false,
        isStreaming: false, isStitched: false, isDead: false, archetype: this.instrument.archetype,
        stage: 'A', playbackRate
      };
      this.activeVoices.set(uuid, voice);
      if (!this.noteToVoiceIds.has(note)) this.noteToVoiceIds.set(note, []);
      this.noteToVoiceIds.get(note).push(uuid);

      this.streamTier2Body(uuid, voice, playbackRate, time);
    });
  }

  async streamTier2Body(uuid, voice, playbackRate, startTime) {
    const samplePath = voice.region.sample || "";
    const handle = this.instrument?.storageHandles.get(samplePath);
    if (!handle) return;
    const cacheKey = `${samplePath}:${handle.isVfs ? handle.vfsOffset : 'local'}:body`;

    try {
      let buffer;
      if (this.bodyCache.has(cacheKey)) {
        buffer = this.bodyCache.get(cacheKey);
      } else {
        const controller = new AbortController(); voice.abortController = controller;
        const headRaw = this.headRawCache.get(samplePath);
        let fullBytes;

        if (handle.isVfs && headRaw && headRaw.byteLength < handle.byteSize) {
          const url = handle.url;
          const tailRange = `bytes=${(handle.vfsOffset || 0) + headRaw.byteLength}-${(handle.vfsOffset || 0) + handle.byteSize - 1}`;
          const tailBytes = await this.binaryFetch(url, controller.signal, tailRange, false);
          const combined = new Uint8Array(headRaw.byteLength + tailBytes.byteLength);
          combined.set(new Uint8Array(headRaw), 0);
          combined.set(new Uint8Array(tailBytes), headRaw.byteLength);
          fullBytes = combined.buffer;
        } else {
          const url = handle.url;
          const range = handle.isVfs ? `bytes=${handle.vfsOffset}-${handle.vfsOffset + handle.byteSize - 1}` : undefined;
          fullBytes = await this.binaryFetch(url, controller.signal, range, false);
        }
        buffer = await this.semaphoreDecode(fullBytes, cacheKey);
      }

      if (voice.isDead) return;

      const headDurationSec = voice.headSource.buffer.duration;
      const stitchTime = startTime + (headDurationSec / playbackRate);
      const crossfadeDuration = this.STITCH_CROSSFADE_MS / 1000;
      const fadeStartTime = stitchTime - crossfadeDuration;
      const now = this.ctx.currentTime;

      if (now > fadeStartTime + 0.05) {
        this.underflowCount++;
        if (headDurationSec > 2.0) this.killVoice(voice.uuid, 0.04);
        return;
      }

      const bodySource = this.ctx.createBufferSource();
      bodySource.buffer = buffer;
      bodySource.playbackRate.setValueAtTime(playbackRate, startTime);
      const bodyGain = this.ctx.createGain();
      const bodyOffset = headDurationSec - (crossfadeDuration * playbackRate);

      bodyGain.gain.setValueAtTime(0, fadeStartTime);
      bodyGain.gain.linearRampToValueAtTime(1, stitchTime);
      voice.headGain.gain.setValueAtTime(1, fadeStartTime);
      voice.headGain.gain.linearRampToValueAtTime(0, stitchTime);

      bodySource.connect(bodyGain);
      bodyGain.connect(voice.filter);
      bodySource.start(fadeStartTime, Math.max(0, bodyOffset));

      voice.bodySource = bodySource;
      voice.bodyGain = bodyGain;
      voice.isStreaming = true;
      voice.isStitched = true;
      this.totalStitches++;
      voice.headSource.stop(stitchTime + 0.01);
    } catch (e) { if (e.name !== 'AbortError') this.killVoice(voice.uuid, 0.05); }
  }

  triggerRelease(id, time) {
    const v = this.activeVoices.get(id); if (!v) return;
    v.stage = 'R'; v.isReleased = true; v.isDead = true;
    const relS = Math.max(0.01, v.region.ampeg_release);
    v.gain.gain.cancelScheduledValues(time);
    v.gain.gain.setTargetAtTime(0.0001, time, relS / 4.6);
    setTimeout(() => this.activeVoices.delete(id), (relS + 0.5) * 1000);
  }

  noteOff(note, time = this.ctx.currentTime, sourceId = 'EXTERNAL') {
    const ids = this.noteToVoiceIds.get(note); if (!ids) return;
    ids.forEach(id => {
      const v = this.activeVoices.get(id);
      if (v && v.sourceId === sourceId && v.stage === 'A') {
        if (this.sustainActive) v.isSustained = true;
        else this.triggerRelease(id, time);
      }
    });
  }

  panic() {
    this.activeVoices.forEach((v, id) => this.killVoice(id, 0.02));
    this.activeVoices.clear();
    this.noteToVoiceIds.clear();
  }

  getAnalyzer() { return this.analyzer; }

  getActiveVoiceTelemetry() {
    const now = this.ctx.currentTime;
    return Array.from(this.activeVoices.values()).map(v => ({
      id: v.uuid, sample: v.region.sample || "", note: v.note, velocity: v.velocity,
      startTime: v.startTime, envLevel: 1, stage: v.stage, archetype: this.instrument?.archetype || InstrumentArchetype.DEFAULT,
      cutoff: v.filter.frequency.value, isStreaming: v.isStreaming,
      sourceId: v.sourceId,
      bufferFill: v.isStitched ? 1.0 : (now - v.startTime) / (v.headSource.buffer?.duration || 1),
      driftSamples: 0,
      trackID: this.trackID
    }));
  }

  getState() {
    return {
      instrumentUrl: this.lastUrl,
      masterGain: this.masterGain.gain.value,
      trackID: this.trackID
    };
  }

  async loadState(state) {
    this.trackID = state.trackID;
    this.masterGain.gain.value = state.masterGain;
    if (state.instrumentUrl) {
      await this.loadRemoteVfs(state.instrumentUrl);
    }
  }
}

// ============================================================================
// VIRTUOSO PUBLIC API (from index.ts)
// ============================================================================

export class Virtuoso {
  constructor(config = {}) {
    this.kernel = new AudioEngine(config);
  }

  // --- ASSET PILLAR ---

  async load(url) {
    await this.kernel.loadRemoteVfs(url);
  }

  async parseMidi(buffer) {
    return MidiParser.parse(buffer);
  }

  // --- TRANSPORT PILLAR ---

  async resume() {
    await this.kernel.resume();
  }

  noteOn(note, velocity, time) {
    this.kernel.noteOn(note, velocity, time);
  }

  noteOff(note, time) {
    this.kernel.noteOff(note, time);
  }

  controlChange(cc, value, time) {
    this.kernel.controlChange(cc, value, time);
  }

  panic() {
    this.kernel.panic();
  }

  // --- TELEMETRY PILLAR ---

  subscribe(observer) {
    if (observer.onTelemetryUpdate) this.kernel.onTelemetryUpdate = observer.onTelemetryUpdate;
    if (observer.onHealthUpdate) this.kernel.onHealthUpdate = observer.onHealthUpdate;
    if (observer.onLog) this.kernel.onLog = observer.onLog;
    if (observer.onHydrationProgress) this.kernel.onHydrationProgress = observer.onHydrationProgress;
    if (observer.onBytesUpdate) this.kernel.onBytesUpdate = observer.onBytesUpdate;
    if (observer.onPeakUpdate) this.kernel.onPeakUpdate = observer.onPeakUpdate;
  }

  resetHealth() {
    this.kernel.resetHealth();
  }

  getTelemetry() {
    return this.kernel.getActiveVoiceTelemetry();
  }

  // --- DSP PILLAR ---

  getAnalyzer() {
    return this.kernel.getAnalyzer();
  }

  getOutputNode() {
    return this.kernel.outputNode;
  }

  get context() {
    return this.kernel.ctx;
  }

  // --- STATE PILLAR ---

  getState() {
    return this.kernel.getState();
  }

  async loadState(state) {
    await this.kernel.loadState(state);
  }

  // --- COMMAND INTERPRETER ---

  execute(cmdLine) {
    const [action, ...args] = cmdLine.trim().toLowerCase().split(/\s+/);
    switch (action) {
      case 'note':
        const n = parseInt(args[0]);
        const v = parseInt(args[1]) || 100;
        if (!isNaN(n)) this.noteOn(n, v);
        break;
      case 'off':
        const noff = parseInt(args[0]);
        if (!isNaN(noff)) this.noteOff(noff);
        break;
      case 'panic':
        this.panic();
        break;
      case 'load':
        if (args[0]) this.load(args[0]);
        break;
      default:
        console.warn(`Virtuoso: Unknown command [${action}]`);
    }
  }
}

export const createVirtuoso = (config) => {
  return new Virtuoso(config);
};

// ============================================================================
// INSTRUMENTS (from instruments.ts)
// ============================================================================

export const SFZ_INSTRUMENT_BASE_URL = 'https://intronet.github.io/SFZ/';

export const SFZ_INSTRUMENTS = [
  {
    category: 'Featured VFS (GCP Stream)',
    instruments: [
      { name: 'Session Grand', value: 'https://storage.googleapis.com/sfzengine-vfs/VFS/Session%20Grand.vfs' },
      { name: 'C7 - Cinematic', value: 'https://storage.googleapis.com/sfzengine-vfs/VFS/C7%20-%20Cinematic.vfs' },
      { name: 'Helsinki1967 PRO', value: 'https://storage.googleapis.com/sfzengine-vfs/VFS/Helsinki1967%20PRO.vfs' },
    ]
  },
  {
    category: 'Piano & Keys',
    instruments: [
      { name: 'Acoustic Grand Piano', value: 'GM/001_Acoustic_Grand_Piano.sfz' },
      { name: 'Upright Piano', value: 'UprightPiano/UprightPianoKW-20220221.sfz' },
      { name: 'Glory Piano', value: 'Timbres_of_Heaven.4.0/Glory Piano.sfz' },
      { name: 'Grand Piano', value: 'SGM-v2.01-CompactGrand-Guit-Bass-v2.7/Grand Piano.sfz' },
      { name: 'CS House Piano', value: 'Fox/CS House Piano.sfz' },
      { name: 'BrGrand Piano', value: 'OmegaGMGS2/Grand Piano.sfz' },
      { name: 'Bright Piano', value: 'OmegaGMGS2/Bright Piano.sfz' },
      { name: 'Dark Grand Piano', value: 'DSoundFontV4/Dark Grand Piano.sfz' },
      { name: 'Bright Piano', value: 'DSoundFontV4/Bright Piano.sfz' },
      { name: 'Electric Piano 1', value: 'DSF_Lite/Electric Piano 1.sfz' },
      { name: 'Bright Piano', value: 'DSF_Lite/Bright Piano.sfz' },
      { name: '88 Stage Grand', value: '88StageGrandPiano/88StageGrand.sfz' },
      { name: 'Session Grand Piano', value: '/session-grand.txt' },
      { name: 'ELECTRIC GRAND', value: 'UHD/ELECTRIC GRAND.sfz' },
      { name: 'ELECTRIC PIANO', value: 'UHD/E_PIANO 2.sfz' },
      { name: 'RHODES PIANO', value: 'UHD/E_PIANO 1 (Rhodes).sfz' },
      { name: 'Piano', value: 'GM/001_Piano.sfz' },
      { name: 'Bright Piano', value: 'GM/002_BrightPiano.sfz' },
      { name: 'Honky Tonk Piano', value: 'GM/004_HonkyTonkPiano.sfz' },
      { name: 'Electric Piano 1', value: 'GM/005_ElectricPiano1.sfz' },
      { name: 'Electric Piano 2', value: 'GM/006_ElectricPiano2.sfz' },
      { name: 'Xylophone', value: 'GM/014_Xylophone.sfz' },
      { name: 'Tubular Bells', value: 'GM/015_TubularBells.sfz' },
      { name: 'Kalimba', value: 'GM/109_Kalimba.sfz' },
    ],
  },
  {
    category: 'Organ',
    instruments: [
      { name: 'Drawbar Organ', value: 'GM/017_DrawbarOrgan.sfz' },
      { name: 'Percussive Organ', value: 'GM/018_PercussiveOrgan.sfz' },
      { name: 'Rock Organ', value: 'GM/019_RockOrgan.sfz' },
      { name: 'Church Organ', value: 'GM/020_ChurchOrgan.sfz' },
    ],
  },
  {
    category: 'Guitar',
    instruments: [
      { name: 'Guitar Nylon', value: 'GM/025_GuitarNylon.sfz' },
      { name: 'Guitar Steel', value: 'GM/026_GuitarSteel.sfz' },
      { name: 'Electric Guitar Jazz', value: 'GM/027_ElectricGuitarJazz.sfz' },
      { name: 'Electric Guitar Clean', value: 'GM/028_ElectricGuitarClean.sfz' },
      { name: 'Electric Guitar Muted', value: 'GM/029_ElectricGuitarMuted.sfz' },
      { name: 'Distortion Guitar', value: 'GM/031_DistortionGuitar.sfz' },
    ],
  },
  {
    category: 'Bass',
    instruments: [
      { name: 'Acoustic Bass', value: 'Bass/AcousBass/acous_bass.sfz' },
      { name: 'Analog Bass', value: 'Bass/AnalogBass/analog_bass.sfz' },
      { name: 'Bright Bass', value: 'Bass/BrightBass/brightbass.sfz' },
      { name: 'Deep Bass', value: 'Bass/DeepBass/bass.sfz' },
      { name: 'Synth Bass', value: 'Bass/SynthBass/synthbass.sfz' },
      { name: 'Fat Synth Bass', value: 'Bass/FatSynthBass/fatbass.sfz' },
      { name: 'Fender Mono Bass', value: 'Bass/FenderBass2/bass_mono.sfz' },
      { name: 'Fender Stereo Bass', value: 'Bass/FenderBass2/stereo_bass.sfz' },
      { name: 'Ibanez Finger Bass', value: 'Bass/Ibanez/finger/Ibanez_finger_bass.sfz' },
      { name: 'Ibanez Pick Bass', value: 'Bass/Ibanez/pick/Ibanez_pick_bass.sfz' },
      { name: 'Moog Bass', value: 'Bass/MoogBass/moog_bass.sfz' },
      { name: 'Pasta Bass', value: 'Bass/pastabass/bass.sfz' },
      { name: 'Rickenbacker Bass', value: 'Bass/Rickenbacker/bass.sfz' },
      { name: 'Rickenbacker legato I Bass', value: 'Bass/Rickenbacker/bass_legmode.sfz' },
      { name: 'Electro Bass 001', value: 'Bass/Electro Bass  001/Electro Bass 001.sfz' },
      { name: 'Electric Bass Finger', value: 'GM/034_ElectricBassFinger.sfz' },
    ]
  },
  {
    category: 'Synth Bass',
    instruments: [
      { name: 'Synth Bass 1', value: 'GM/039_SynthBass1.sfz' },
      { name: 'Synth Bass 2', value: 'GM/040_SynthBass2.sfz' },
      { name: 'Synth Bass & Lead', value: 'GM/088_SynthBassLead.sfz' },
    ],
  },
  {
    category: 'Orchestral & Ethnic',
    instruments: [
      { name: 'Orchestral Harp', value: 'GM/047_OrchestralHarp.sfz' },
      { name: 'Timpani', value: 'GM/048_Timpani.sfz' },
      { name: 'Tenor Saxophone', value: 'GM/067_TenorSaxophone.sfz' },
      { name: 'Clarinet', value: 'GM/072_Clarinet.sfz' },
      { name: 'Recorder', value: 'GM/075_Recorder.sfz' },
      { name: 'Ocarina', value: 'GM/080_Ocarina.sfz' },
      { name: 'Bagpipe', value: 'GM/110_Bagpipe.sfz' },
    ],
  },
  {
    category: 'Synth Strings & Pads',
    instruments: [
      { name: 'Synth Strings 1', value: 'GM/051_SynthStrings1.sfz' },
      { name: 'Synth Strings 2', value: 'GM/052_SynthStrings2.sfz' },
      { name: 'Synth Pad New Age', value: 'GM/089_SynthNewAge.sfz' },
      { name: 'Synth Pad Choir', value: 'GM/092_SynthPadChoir.sfz' },
      { name: 'Synth Pad Bowed', value: 'GM/093_SynthPadBowed.sfz' },
      { name: 'Synth Pad Sweep', value: 'GM/096_SynthPadSweep.sfz' },
    ]
  },
  {
    category: 'Synth Lead & Brass',
    instruments: [
      { name: 'Synth Brass 1', value: 'GM/063_SynthBrass1.sfz' },
      { name: 'Synth Brass 2', value: 'GM/064_SynthBrass2.sfz' },
      { name: 'Synth Square', value: 'GM/081_SynthSquare.sfz' },
      { name: 'Synth Calliope', value: 'GM/083_SynthCalliope.sfz' },
      { name: 'Synth Fifths', value: 'GM/087_SynthFifths.sfz' },
    ],
  },
  {
    category: 'Synth Effects & Misc',
    instruments: [
      { name: 'Synth Soundtrack', value: 'GM/098_SynthSoundtrack.sfz' },
      { name: 'Synth Crystal', value: 'GM/099_SynthCrystal.sfz' },
      { name: 'Synth Goblins', value: 'GM/102_SynthGoblins.sfz' },
      { name: 'Synth SciFi', value: 'GM/104_SynthSciFi.sfz' },
      { name: 'Applause', value: 'GM/127_Applause.sfz' },
      { name: 'Percussion', value: 'GM/129_Percussion.sfz' },
    ],
  },
];
