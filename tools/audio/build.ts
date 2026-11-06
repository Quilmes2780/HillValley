import { noteFreq, renderSong, Track, type Song } from './synth.ts';

const DIR = 'assets/audio';

/** Eigene, für dieses Spiel geschriebene Stücke. Keines zitiert die Filmmusik. */
const SONGS: Record<string, Song> = {
  titel: {
    bpm: 96,
    beatsPerBar: 4,
    lead: 'square',
    arp: true,
    drums: 'k.h.s.h.',
    chords: ['D3m', 'Bb2', 'F3', 'C3', 'D3m', 'Bb2', 'G3m', 'A3'],
    melody: [
      'D5:1.5 A4:0.5 D5:1 E5:1',
      'F5:2 E5:1 D5:1',
      'C5:1.5 A4:0.5 C5:1 D5:1',
      'E5:3 R:1',
      'D5:1.5 F5:0.5 A5:1 G5:1',
      'F5:2 D5:2',
      'Bb4:1 D5:1 G5:1 F5:1',
      'E5:2 A4:2',
    ],
  },
  jahr1986: {
    bpm: 126,
    beatsPerBar: 4,
    lead: 'pulse',
    arp: false,
    drums: 'khshkhsh',
    chords: ['A3', 'E3', 'F#3m', 'D3', 'A3', 'E3', 'D3', 'E3'],
    melody: [
      'E5:0.5 E5:0.5 R:0.5 C#5:0.5 E5:1 A5:1',
      'G#5:1 E5:1 B4:2',
      'C#5:0.5 C#5:0.5 E5:1 F#5:1 E5:1',
      'D5:1 F#5:1 A5:2',
      'A5:0.5 G#5:0.5 E5:1 C#5:1 E5:1',
      'B4:1 E5:1 G#5:2',
      'F#5:1 E5:1 D5:1 F#5:1',
      'E5:3 R:1',
    ],
  },
  tannenburg: {
    bpm: 100,
    beatsPerBar: 4,
    lead: 'square',
    arp: false,
    drums: 'k.s.k.s.',
    chords: ['C3m', 'C3m', 'Ab2', 'G2', 'C3m', 'F3m', 'G2', 'C3m'],
    melody: [
      'C5:1 C5:1 Eb5:1 C5:1',
      'G4:2 C5:2',
      'Ab4:1 C5:1 Eb5:1 C5:1',
      'B4:2 D5:2',
      'Eb5:1 Eb5:1 G5:1 Eb5:1',
      'F5:1 Ab5:1 F5:1 C5:1',
      'B4:1 D5:1 G5:1 D5:1',
      'C5:3 R:1',
    ],
  },
  jahr1955: {
    bpm: 136,
    beatsPerBar: 4,
    lead: 'triangle',
    arp: true,
    swing: true,
    drums: 'k.h.s.h.',
    chords: ['C3', 'A3m', 'F3', 'G3', 'C3', 'A3m', 'D3m', 'G3'],
    melody: [
      'E5:1 G5:1 E5:0.5 D5:0.5 C5:1',
      'E5:1 C5:1 A4:2',
      'A4:0.5 C5:0.5 F5:1 E5:1 C5:1',
      'D5:1 B4:1 G4:2',
      'E5:1 G5:1 C6:1 G5:1',
      'A5:1 E5:1 C5:2',
      'D5:1 F5:1 A5:1 F5:1',
      'G5:1 D5:1 B4:1 R:1',
    ],
  },
  jahr1885: {
    bpm: 132,
    beatsPerBar: 3,
    lead: 'triangle',
    arp: false,
    drums: 'k.h.h.',
    chords: ['G3', 'C3', 'D3', 'G3', 'E3m', 'C3', 'D3', 'G3'],
    melody: [
      'D5:1 G5:1 B5:1',
      'C5:1 E5:1 G5:1',
      'A5:1.5 F#5:0.5 D5:1',
      'B4:2 D5:1',
      'E5:1 G5:1 B5:1',
      'C5:1 E5:1 A5:1',
      'F#5:1 A5:1 F#5:1',
      'G5:2 R:1',
    ],
  },
  jahr2015: {
    bpm: 118,
    beatsPerBar: 4,
    lead: 'pulse',
    arp: true,
    drums: 'khhskhsh',
    chords: ['F#3m', 'D3', 'A3', 'E3', 'F#3m', 'D3', 'B3m', 'E3'],
    melody: [
      'C#5:1 F#5:1 A5:1 F#5:1',
      'F#5:1.5 D5:0.5 A4:2',
      'E5:1 A5:1 C#6:1 A5:1',
      'B5:2 G#5:2',
      'A5:0.5 F#5:0.5 C#5:1 F#5:1 A5:1',
      'D5:2 F#5:2',
      'B4:1 D5:1 F#5:1 B5:1',
      'G#5:3 R:1',
    ],
  },
};

for (const [name, song] of Object.entries(SONGS)) renderSong(song, `${DIR}/${name}.wav`);

function sfx(name: string, seconds: number, paint: (t: Track) => void): void {
  const t = new Track(seconds);
  paint(t);
  t.save(`${DIR}/${name}.wav`);
}

sfx('klick', 0.05, (t) => t.tone(0, 0.04, 880, 'pulse', 0.2));
sfx('nimm', 0.22, (t) => {
  t.tone(0, 0.08, noteFreq('E5'), 'square', 0.3);
  t.tone(0.09, 0.12, noteFreq('A5'), 'square', 0.3);
});
sfx('tuer', 0.35, (t) => {
  t.noise(0, 0.1, 0.5, 3);
  t.tone(0, 0.18, 170, 'triangle', 0.6, 0.6);
  t.noise(0.24, 0.1, 0.5, 5);
});
sfx('welle', 2.2, (t) => {
  t.tone(0, 2.2, 90, 'square', 0.3, 9);
  t.tone(0, 2.2, 91, 'triangle', 0.4, 12);
  t.noise(0.2, 2, 0.35, 11);
});
sfx('senden', 0.9, (t) => {
  for (let i = 0; i < 6; i++) t.tone(i * 0.12, 0.12, 440 * 1.3 ** i, 'pulse', 0.3);
  t.noise(0.7, 0.2, 0.3, 7);
});
sfx('bellen', 0.32, (t) => {
  t.tone(0, 0.12, 420, 'square', 0.4, 0.7);
  t.noise(0, 0.1, 0.2, 2);
  t.tone(0.17, 0.13, 460, 'square', 0.4, 0.65);
});
sfx('alarm', 0.8, (t) => {
  for (let i = 0; i < 4; i++) {
    t.tone(i * 0.2, 0.1, 990, 'square', 0.3);
    t.tone(i * 0.2 + 0.1, 0.1, 660, 'square', 0.3);
  }
});
sfx('knall', 0.5, (t) => {
  t.noise(0, 0.45, 0.55, 13);
  t.tone(0, 0.3, 140, 'square', 0.35, 0.3);
});
sfx('platsch', 0.45, (t) => {
  t.tone(0, 0.35, 240, 'triangle', 0.6, 0.3);
  t.noise(0.04, 0.35, 0.5, 17);
});
sfx('gitarre', 1.1, (t) => {
  for (const n of ['E3', 'B3', 'E4', 'G#4']) t.tone(0, 1.1, noteFreq(n), 'square', 0.17);
  t.noise(0, 0.5, 0.25, 19);
});
sfx('rekord', 0.9, (t) => {
  ['C5', 'E5', 'G5', 'C6', 'G5', 'C6'].forEach((n, i) => t.tone(i * 0.13, 0.13, noteFreq(n), 'square', 0.3));
});
sfx('reissen', 0.7, (t) => {
  for (let i = 0; i < 8; i++) t.noise(i * 0.08, 0.07, 0.5, i + 23);
});
sfx('scanner', 0.3, (t) => {
  t.tone(0, 0.1, 1200, 'pulse', 0.25);
  t.tone(0.14, 0.14, 1600, 'pulse', 0.25);
});
sfx('aufzug', 0.8, (t) => {
  t.tone(0, 0.8, 80, 'triangle', 0.5, 2.2);
  t.tone(0.72, 0.08, 1400, 'pulse', 0.25);
});
console.log('Audio erzeugt.');
