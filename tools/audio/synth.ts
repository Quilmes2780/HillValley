import { existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { dirname } from 'node:path';

/** Einfache Chiptune-Synthese. Alles ist reproduzierbar und braucht keine fremden Dateien. */
export const RATE = 16000;

const SEMITONES: Record<string, number> = { C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11 };

export function noteFreq(name: string): number {
  const m = /^([A-G])([#b]?)(\d)$/.exec(name);
  if (!m) throw new Error(`Unbekannte Note: ${name}`);
  const semis = SEMITONES[m[1]] + (m[2] === '#' ? 1 : m[2] === 'b' ? -1 : 0);
  return 440 * 2 ** ((semis + (Number(m[3]) + 1) * 12 - 69) / 12);
}

export type Wave = 'square' | 'pulse' | 'triangle';

function sample(wave: Wave, phase: number): number {
  const p = phase - Math.floor(phase);
  switch (wave) {
    case 'square':
      return p < 0.5 ? 1 : -1;
    case 'pulse':
      return p < 0.25 ? 1 : -1;
    case 'triangle':
      return 4 * Math.abs(p - 0.5) - 1;
  }
}

export class Track {
  readonly data: Float32Array;

  constructor(seconds: number) {
    this.data = new Float32Array(Math.ceil(seconds * RATE));
  }

  /** Ton mit kurzem Anschlag und Ausklang. `slide` ändert die Tonhöhe im Verlauf (Faktor am Ende). */
  tone(start: number, length: number, freq: number, wave: Wave, volume: number, slide = 1): void {
    const from = Math.floor(start * RATE);
    const count = Math.floor(length * RATE);
    const attack = Math.min(40, count / 4);
    const release = Math.min(count / 3, RATE * 0.05);
    let phase = 0;
    for (let i = 0; i < count; i++) {
      const at = from + i;
      if (at >= this.data.length) break;
      const t = i / count;
      const f = freq * (1 + (slide - 1) * t);
      phase += f / RATE;
      let env = 1;
      if (i < attack) env = i / attack;
      else if (i > count - release) env = (count - i) / release;
      this.data[at] += sample(wave, phase) * env * volume;
    }
  }

  /** Rauschen, z. B. für Schlagzeug, Knall und Zischen. Die Lautstärke fällt linear ab. */
  noise(start: number, length: number, volume: number, seed = 1): void {
    const from = Math.floor(start * RATE);
    const count = Math.floor(length * RATE);
    let s = seed * 2654435761;
    let held = 0;
    for (let i = 0; i < count; i++) {
      const at = from + i;
      if (at >= this.data.length) break;
      if (i % 2 === 0) {
        s = (Math.imul(s, 1664525) + 1013904223) >>> 0;
        held = s / 2147483648 - 1;
      }
      this.data[at] += held * (1 - i / count) * volume;
    }
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

export interface Song {
  bpm: number;
  beatsPerBar: number;
  /** Akkord je Takt, z. B. 'A3', 'F#3m'. */
  chords: string[];
  /** Melodie je Takt, z. B. 'E5:1 R:0.5 G5:0.5'. Die Zahl sind Schläge. */
  melody: string[];
  lead: Wave;
  /** Achtel-Begleitung statt langer Töne. */
  arp: boolean;
  /** Zählzeiten des Schlagzeugs: k = Bass, s = Snare, h = Hi-Hat je Achtel. */
  drums: string;
  /** Achtel im Dreier-Gefühl spielen. */
  swing?: boolean;
}

function chordNotes(chord: string): number[] {
  const m = /^([A-G][#b]?)(\d)(m?)$/.exec(chord);
  if (!m) throw new Error(`Unbekannter Akkord: ${chord}`);
  const root = noteFreq(m[1] + m[2]);
  const third = m[3] === 'm' ? 3 : 4;
  return [root, root * 2 ** (third / 12), root * 2 ** (7 / 12)];
}

export function renderSong(song: Song, path: string): void {
  const beat = 60 / song.bpm;
  const bars = song.chords.length;
  if (song.melody.length !== bars) throw new Error(`${path}: ${song.melody.length} Melodietakte, ${bars} Akkorde`);
  const seconds = bars * song.beatsPerBar * beat;
  const t = new Track(seconds);

  song.chords.forEach((chord, bar) => {
    const start = bar * song.beatsPerBar * beat;
    const notes = chordNotes(chord);

    // Bass: Grundton und Quinte im Wechsel
    for (let b = 0; b < song.beatsPerBar; b++) {
      t.tone(start + b * beat, beat * 0.85, notes[b % 2 === 0 ? 0 : 2] / 2, 'triangle', 0.3);
    }

    // Begleitung
    const steps = song.beatsPerBar * 2;
    for (let i = 0; i < steps; i++) {
      const offbeat = song.swing && i % 2 === 1 ? beat / 6 : 0;
      const at = start + (i * beat) / 2 + offbeat;
      if (song.arp) t.tone(at, beat / 2.2, notes[i % 3] * 2, 'pulse', 0.07);
      else if (i % 2 === 0) for (const f of notes) t.tone(at, beat * 0.45, f * 2, 'pulse', 0.04);
    }

    // Schlagzeug
    const pattern = song.drums;
    for (let i = 0; i < steps; i++) {
      const hit = pattern[i % pattern.length];
      const at = start + (i * beat) / 2;
      if (hit === 'k') t.tone(at, 0.09, 110, 'triangle', 0.4, 0.4);
      if (hit === 's') t.noise(at, 0.1, 0.2, i + bar);
      if (hit === 'h') t.noise(at, 0.03, 0.08, i + bar * 7);
    }

    // Melodie
    let pos = start;
    let total = 0;
    for (const token of song.melody[bar].split(/\s+/)) {
      const [name, len] = token.split(':');
      const beats = Number(len);
      total += beats;
      if (name !== 'R') t.tone(pos, beats * beat * 0.92, noteFreq(name), song.lead, 0.2);
      pos += beats * beat;
    }
    if (Math.abs(total - song.beatsPerBar) > 0.001) {
      throw new Error(`${path}: Takt ${bar + 1} hat ${total} statt ${song.beatsPerBar} Schläge`);
    }
  });
  t.save(path);
}
