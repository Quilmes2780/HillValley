import { existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { dirname } from 'node:path';

/**
 * Klangerzeugung im Stil früher Soundkarten: FM-Stimmen, etwas Hall, 8 Bit.
 * Alles ist reproduzierbar und braucht keine fremden Dateien.
 */
export const RATE = 22050;

const SEMITONES: Record<string, number> = { C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11 };

export function noteFreq(name: string): number {
  const m = /^([A-G])([#b]?)(\d)$/.exec(name);
  if (!m) throw new Error(`Unbekannte Note: ${name}`);
  const semis = SEMITONES[m[1]] + (m[2] === '#' ? 1 : m[2] === 'b' ? -1 : 0);
  return 440 * 2 ** ((semis + (Number(m[3]) + 1) * 12 - 69) / 12);
}

export type Wave = 'square' | 'pulse' | 'triangle' | 'sine' | 'saw';

function sample(wave: Wave, phase: number): number {
  const p = phase - Math.floor(phase);
  switch (wave) {
    case 'square':
      return p < 0.5 ? 1 : -1;
    case 'pulse':
      return p < 0.25 ? 1 : -1;
    case 'triangle':
      return 4 * Math.abs(p - 0.5) - 1;
    case 'sine':
      return Math.sin(p * Math.PI * 2);
    case 'saw':
      return 2 * p - 1;
  }
}

/** Eine FM-Stimme: Der Modulator färbt den Ton, sein Anteil klingt meist schnell ab. */
export interface Voice {
  /** Frequenzverhältnis Modulator zu Träger. */
  ratio: number;
  /** Modulationsstärke am Anfang und am Ende des Abklingens. */
  index: number;
  indexEnd?: number;
  attack: number;
  decay: number;
  sustain: number;
  release: number;
  /** Vibrato in Halbtönen und seine Geschwindigkeit. */
  vibrato?: number;
  vibratoHz?: number;
  /** Zweite, leicht verstimmte Stimme in Cent. */
  detune?: number;
  /** Übersteuerung wie bei einer E-Gitarre. */
  drive?: number;
  gain?: number;
}

export const VOICES = {
  piano: { ratio: 1, index: 2.2, indexEnd: 0.4, attack: 0.002, decay: 0.5, sustain: 0.15, release: 0.12 },
  honky: { ratio: 1, index: 2.6, indexEnd: 0.5, attack: 0.002, decay: 0.32, sustain: 0.1, release: 0.1, detune: 16 },
  epiano: { ratio: 2, index: 1.6, indexEnd: 0.2, attack: 0.003, decay: 0.7, sustain: 0.2, release: 0.2 },
  bass: { ratio: 1, index: 1.5, indexEnd: 0.5, attack: 0.004, decay: 0.2, sustain: 0.55, release: 0.05, gain: 1.15 },
  tuba: { ratio: 1, index: 1.4, indexEnd: 0.9, attack: 0.03, decay: 0.2, sustain: 0.6, release: 0.06, gain: 1.1 },
  synthbass: { ratio: 0.5, index: 3, indexEnd: 0.8, attack: 0.002, decay: 0.16, sustain: 0.5, release: 0.04 },
  brass: { ratio: 1, index: 3.4, indexEnd: 2.4, attack: 0.04, decay: 0.2, sustain: 0.75, release: 0.08, vibrato: 0.08, vibratoHz: 5 },
  sax: { ratio: 1, index: 2.4, indexEnd: 1.6, attack: 0.03, decay: 0.2, sustain: 0.7, release: 0.06, vibrato: 0.2, vibratoHz: 5.2 },
  gitarre: { ratio: 1, index: 4, indexEnd: 2.2, attack: 0.003, decay: 0.3, sustain: 0.5, release: 0.05, drive: 3.4 },
  stab: { ratio: 1, index: 3.2, indexEnd: 1.6, attack: 0.002, decay: 0.12, sustain: 0.2, release: 0.03, drive: 2.5 },
  orgel: { ratio: 2, index: 1.1, attack: 0.01, decay: 0.05, sustain: 0.9, release: 0.05 },
  harmonika: { ratio: 1, index: 2.6, indexEnd: 1.8, attack: 0.025, decay: 0.15, sustain: 0.75, release: 0.05, vibrato: 0.14, vibratoHz: 5.6, detune: 8 },
  fiedel: { ratio: 1, index: 2.2, indexEnd: 1.7, attack: 0.05, decay: 0.15, sustain: 0.8, release: 0.08, vibrato: 0.2, vibratoHz: 5.5 },
  banjo: { ratio: 3, index: 2.2, indexEnd: 0.1, attack: 0.001, decay: 0.2, sustain: 0.04, release: 0.04 },
  lead: { ratio: 1, index: 2.1, indexEnd: 1.2, attack: 0.008, decay: 0.2, sustain: 0.7, release: 0.1, vibrato: 0.12, vibratoHz: 5.8, detune: 7 },
  glocke: { ratio: 3.5, index: 2.4, indexEnd: 0.1, attack: 0.001, decay: 0.7, sustain: 0.05, release: 0.25 },
  flaeche: { ratio: 1.002, index: 0.9, attack: 0.25, decay: 0.3, sustain: 0.8, release: 0.3, detune: 10 },
  arp: { ratio: 2, index: 1.3, indexEnd: 0.2, attack: 0.002, decay: 0.12, sustain: 0.12, release: 0.03 },
} as const satisfies Record<string, Voice>;

export type VoiceName = keyof typeof VOICES;

export class Track {
  readonly data: Float32Array;
  private readonly size: number;

  /** Mit `loop` laufen Ausklänge am Ende über den Anfang weiter: So hat die Schleife keine Naht. */
  constructor(
    seconds: number,
    private readonly loop = false,
  ) {
    this.size = Math.ceil(seconds * RATE);
    this.data = new Float32Array(this.size);
  }

  private add(at: number, v: number): void {
    if (at < this.size) this.data[at] += v;
    else if (this.loop) this.data[at % this.size] += v;
  }

  /** Einfacher Ton mit kurzem Anschlag und Ausklang. `slide` ändert die Tonhöhe (Faktor am Ende). */
  tone(start: number, length: number, freq: number, wave: Wave, volume: number, slide = 1): void {
    const from = Math.floor(start * RATE);
    const count = Math.floor(length * RATE);
    const attack = Math.min(40, count / 4);
    const release = Math.min(count / 3, RATE * 0.05);
    let phase = 0;
    for (let i = 0; i < count; i++) {
      const t = i / count;
      const f = freq * (1 + (slide - 1) * t);
      phase += f / RATE;
      let env = 1;
      if (i < attack) env = i / attack;
      else if (i > count - release) env = (count - i) / release;
      this.add(from + i, sample(wave, phase) * env * volume);
    }
  }

  /** Eine gespielte Note mit FM-Stimme. */
  fm(start: number, length: number, freq: number, voice: Voice, volume: number): void {
    const from = Math.floor(start * RATE);
    const hold = Math.floor(length * RATE);
    const rel = Math.floor(voice.release * RATE);
    const atk = Math.max(1, voice.attack * RATE);
    const dec = Math.max(1, voice.decay * RATE);
    const gain = volume * (voice.gain ?? 1);
    const layers = voice.detune ? [1, 2 ** (voice.detune / 1200)] : [1];
    for (const layer of layers) {
      let pc = 0;
      let pm = 0;
      const f = freq * layer;
      const level = gain / layers.length;
      for (let i = 0; i < hold + rel; i++) {
        let env: number;
        if (i < atk) env = i / atk;
        else if (i < atk + dec) env = 1 + (voice.sustain - 1) * ((i - atk) / dec);
        else env = voice.sustain;
        if (i >= hold) env *= 1 - (i - hold) / rel;
        const progress = Math.min(1, i / dec);
        const idx = voice.index + ((voice.indexEnd ?? voice.index) - voice.index) * progress;
        const vib = voice.vibrato && i > RATE * 0.12
          ? 2 ** ((Math.sin((i / RATE) * Math.PI * 2 * (voice.vibratoHz ?? 5)) * voice.vibrato) / 12)
          : 1;
        pm += (f * voice.ratio * vib) / RATE;
        pc += (f * vib) / RATE;
        let v = Math.sin(Math.PI * 2 * pc + idx * Math.sin(Math.PI * 2 * pm));
        if (voice.drive) v = Math.tanh(v * voice.drive) * 0.75;
        this.add(from + i, v * env * level);
      }
    }
  }

  /** Rauschen. Die Lautstärke fällt linear ab; `color` zwischen 0 (dumpf) und 1 (hell). */
  noise(start: number, length: number, volume: number, seed = 1, color = 1): void {
    const from = Math.floor(start * RATE);
    const count = Math.floor(length * RATE);
    let s = (seed * 2654435761) >>> 0;
    let low = 0;
    for (let i = 0; i < count; i++) {
      s = (Math.imul(s, 1664525) + 1013904223) >>> 0;
      const white = s / 2147483648 - 1;
      low += (white - low) * Math.max(0.02, color);
      this.add(from + i, low * (1 - i / count) * volume);
    }
  }

  /** Dauerrauschen mit eigener Hüllkurve, gefiltert. `high` nimmt die Tiefen weg. Für Raumklang. */
  texture(start: number, length: number, volume: number, seed: number, color: number, env: (t: number) => number, high = false): void {
    const from = Math.floor(start * RATE);
    const count = Math.floor(length * RATE);
    let s = (seed * 2654435761) >>> 0;
    let low = 0;
    for (let i = 0; i < count; i++) {
      s = (Math.imul(s, 1664525) + 1013904223) >>> 0;
      const white = s / 2147483648 - 1;
      low += (white - low) * color;
      this.add(from + i, (high ? white - low : low) * env(i / count) * volume);
    }
  }

  kick(start: number, volume = 0.6): void {
    this.tone(start, 0.14, 118, 'sine', volume, 0.32);
  }

  snare(start: number, volume = 0.3, seed = 1, gated = false): void {
    this.noise(start, gated ? 0.26 : 0.12, volume, seed, 0.75);
    this.tone(start, 0.08, 190, 'triangle', volume * 0.55, 0.7);
  }

  hat(start: number, volume = 0.1, seed = 1, open = false): void {
    this.texture(start, open ? 0.14 : 0.035, volume, seed, 0.4, (t) => 1 - t, true);
  }

  /** Raum um den ganzen Klang. Läuft bei Schleifen um das Ende herum weiter. */
  reverb(wet: number): void {
    const n = this.size;
    const out = new Float32Array(n);
    for (const [delay, feedback] of [
      [1117, 0.74],
      [1381, 0.71],
      [1693, 0.68],
      [2003, 0.65],
    ] as const) {
      const line = new Float32Array(delay);
      let p = 0;
      const passes = this.loop ? 2 : 1;
      for (let pass = 0; pass < passes; pass++) {
        for (let i = 0; i < n; i++) {
          const v = line[p];
          line[p] = this.data[i] + v * feedback;
          p = (p + 1) % delay;
          if (pass === passes - 1) out[i] += v * 0.25;
        }
      }
    }
    for (let i = 0; i < n; i++) this.data[i] += out[i] * wet;
  }

  /** Sanfte Begrenzung, dann auf eine feste Spitze bringen. */
  master(peak = 0.92): void {
    let max = 0;
    for (let i = 0; i < this.size; i++) {
      this.data[i] = Math.tanh(this.data[i] * 1.1);
      max = Math.max(max, Math.abs(this.data[i]));
    }
    if (max > 0) for (let i = 0; i < this.size; i++) this.data[i] *= peak / max;
  }

  /** Schreibt eine 8-Bit-WAV-Datei und begrenzt das Signal auf den gültigen Bereich. */
  save(path: string): void {
    // Eigene Stücke und Effekte bleiben erhalten; --force erzeugt alles neu.
    if (existsSync(path) && !process.argv.includes('--force')) return;
    const n = this.data.length;
    const buf = Buffer.alloc(44 + n);
    buf.write('RIFF', 0);
    buf.writeUInt32LE(36 + n, 4);
    buf.write('WAVEfmt ', 8);
    buf.writeUInt32LE(16, 16);
    buf.writeUInt16LE(1, 20);
    buf.writeUInt16LE(1, 22);
    buf.writeUInt32LE(RATE, 24);
    buf.writeUInt32LE(RATE, 28);
    buf.writeUInt16LE(1, 32);
    buf.writeUInt16LE(8, 34);
    buf.write('data', 36);
    buf.writeUInt32LE(n, 40);
    for (let i = 0; i < n; i++) {
      const v = Math.max(-1, Math.min(1, this.data[i]));
      buf[44 + i] = Math.round((v + 1) * 127.5);
    }
    mkdirSync(dirname(path), { recursive: true });
    writeFileSync(path, buf);
  }
}

// --- Lieder -----------------------------------------------------------------------------------

const MAJOR = [0, 2, 4, 5, 7, 9, 11];
const MINOR = [0, 2, 3, 5, 7, 8, 10];

export interface Song {
  bpm: number;
  beatsPerBar: number;
  /** Grundton der Tonart, z. B. 'A4' für die Melodie. */
  key: string;
  minor?: boolean;
  /** Akkord je Takt als Stufe: '1', '6m', 'b7', '5'. */
  chords: readonly string[];
  /** Melodie je Takt: 'Stufe:Schläge'. '5-' eine Oktave tiefer, '3+' höher, '#4' erhöht, R Pause. */
  melody: readonly string[];
  lead: VoiceName;
  leadVolume?: number;
  /** Zweite Stimme, gleiches Format wie die Melodie. */
  counter?: { voice: VoiceName; volume: number; melody: readonly string[] };
  /** Begleitung, ein Zeichen je Achtel: c Akkord, 1-3 Arpeggiotöne, . Pause. */
  comp: { voice: VoiceName; pattern: string; volume: number; octave?: number };
  /** Bass, ein Zeichen je Achtel: 1 Grundton, 3 Terz, 5 Quinte, 8 Oktave, . Pause. */
  bass: { voice: VoiceName; pattern: string; volume: number };
  /** Lang liegende Akkorde. */
  pad?: { voice: VoiceName; volume: number };
  /** Schlagzeug, ein Zeichen je Achtel oder Sechzehntel: k s h o t g (g = Hallsnare). */
  drums: string;
  /** Füllt den letzten Takt von je acht Takten. */
  fill?: string;
  /** Zeichen je Viertel im Schlagzeug: 2 oder 4. */
  drumSteps?: number;
  /** Achtel im Dreier-Gefühl. */
  swing?: boolean;
  reverb?: number;
}

function degreeFreq(token: string, keyFreq: number, scale: readonly number[]): number {
  const m = /^(#|b)?(\d+)(\+|-)?$/.exec(token);
  if (!m) throw new Error(`Unbekannte Stufe: ${token}`);
  const n = Number(m[2]) - 1;
  let semis = scale[n % 7] + Math.floor(n / 7) * 12;
  if (m[1] === '#') semis += 1;
  if (m[1] === 'b') semis -= 1;
  if (m[3] === '+') semis += 12;
  if (m[3] === '-') semis -= 12;
  return keyFreq * 2 ** (semis / 12);
}

function chordFreqs(chord: string, bassKey: number): number[] {
  const m = /^(b)?(\d)(m|o)?$/.exec(chord);
  if (!m) throw new Error(`Unbekannter Akkord: ${chord}`);
  const semis = MAJOR[Number(m[2]) - 1] - (m[1] ? 1 : 0);
  const root = bassKey * 2 ** (semis / 12);
  const third = m[3] ? 3 : 4;
  const fifth = m[3] === 'o' ? 6 : 7;
  return [root, root * 2 ** (third / 12), root * 2 ** (fifth / 12)];
}

function playLine(t: Track, line: string, barStart: number, beat: number, keyFreq: number, scale: readonly number[], voice: Voice, volume: number, bar: number, name: string, beats: number): void {
  let pos = barStart;
  let total = 0;
  for (const token of line.split(/\s+/)) {
    const [note, len] = token.split(':');
    const count = Number(len);
    total += count;
    if (note !== 'R') t.fm(pos, count * beat * 0.92, degreeFreq(note, keyFreq, scale), voice, volume);
    pos += count * beat;
  }
  if (Math.abs(total - beats) > 0.001) throw new Error(`${name}: Takt ${bar + 1} hat ${total} statt ${beats} Schläge`);
}

export function renderSong(song: Song, path: string): void {
  const beat = 60 / song.bpm;
  const bars = song.chords.length;
  if (song.melody.length !== bars) throw new Error(`${path}: ${song.melody.length} Melodietakte, ${bars} Akkorde`);
  const seconds = bars * song.beatsPerBar * beat;
  const t = new Track(seconds, true);
  const keyFreq = noteFreq(song.key);
  const scale = song.minor ? MINOR : MAJOR;
  const bassKey = keyFreq / 4;
  const steps = song.beatsPerBar * 2;
  const shift = (i: number): number => (song.swing && i % 2 === 1 ? beat / 6 : 0);

  song.chords.forEach((chord, bar) => {
    const start = bar * song.beatsPerBar * beat;
    const notes = chordFreqs(chord, bassKey);

    for (let i = 0; i < steps; i++) {
      const at = start + (i * beat) / 2 + shift(i);
      const b = song.bass.pattern[i % song.bass.pattern.length];
      const bassNote = { '1': notes[0], '3': notes[1], '5': notes[2], '8': notes[0] * 2 }[b];
      if (bassNote) t.fm(at, beat * 0.46, bassNote, VOICES[song.bass.voice], song.bass.volume);

      const c = song.comp.pattern[i % song.comp.pattern.length];
      const octave = 2 ** (song.comp.octave ?? 2);
      const voice = VOICES[song.comp.voice];
      if (c === 'c') for (const f of notes) t.fm(at, beat * 0.42, f * octave, voice, song.comp.volume);
      else if (c === '1' || c === '2' || c === '3') t.fm(at, beat * 0.42, notes[Number(c) - 1] * octave, voice, song.comp.volume);
    }

    if (song.pad) {
      for (const f of notes) t.fm(start, song.beatsPerBar * beat * 0.98, f * 4, VOICES[song.pad.voice], song.pad.volume);
    }

    const perBeat = song.drumSteps ?? 2;
    const pattern = song.fill && bar % 8 === 7 ? song.fill : song.drums;
    const drumCount = song.beatsPerBar * perBeat;
    for (let i = 0; i < drumCount; i++) {
      const hit = pattern[i % pattern.length];
      const at = start + (i * beat) / perBeat + (perBeat === 2 ? shift(i) : 0);
      if (hit === 'k') t.kick(at);
      if (hit === 's') t.snare(at, 0.3, i + bar);
      if (hit === 'g') t.snare(at, 0.34, i + bar, true);
      if (hit === 'h') t.hat(at, 0.09, i + bar * 7);
      if (hit === 'o') t.hat(at, 0.09, i + bar * 7, true);
      if (hit === 't') t.tone(at, 0.16, 150, 'sine', 0.36, 0.55);
      if (hit === 'w') t.tone(at, 0.03, 1250, 'triangle', 0.13);
    }

    playLine(t, song.melody[bar], start, beat, keyFreq, scale, VOICES[song.lead], song.leadVolume ?? 0.3, bar, path, song.beatsPerBar);
    if (song.counter) {
      playLine(t, song.counter.melody[bar], start, beat, keyFreq / 2, scale, VOICES[song.counter.voice], song.counter.volume, bar, path, song.beatsPerBar);
    }
  });
  t.reverb(song.reverb ?? 0.22);
  t.master();
  t.save(path);
}
