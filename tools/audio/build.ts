import { noteFreq, renderSong, Track, VOICES, type Song } from './synth.ts';

const DIR = 'assets/audio';

/*
 * Das Leitmotiv des Spiels läuft durch alle Stücke: Eins, Terz, Sekunde, Quinte, dann
 * Quarte, Terz, Sekunde, Eins. Die Melodien sind eigene Kompositionen und zitieren keine Filmmusik.
 * Stufen statt Noten: So klingt dasselbe Thema in Dur, Moll und jedem Stil nach sich selbst.
 */
const THEMA = [
  '1:1.5 3:0.5 2:1 5:1',
  '4:1 3:0.5 2:0.5 1:2',
  '1:1.5 3:0.5 2:1 5:1',
  '6:1 5:0.5 4:0.5 5:2',
  '8:1.5 7:0.5 6:1 5:1',
  '4:1 6:0.5 5:0.5 3:2',
  '2:1 4:1 3:1 2:1',
  '1:3 R:1',
];
const THEMA_DUR = ['1', '4', '1', '5', '4', '1', '5', '1'];
const THEMA_MOLL = ['1m', '4m', '1m', '5', 'b6', '1m', '5', '1m'];

/** Das Thema im Dreiertakt: Jede Phrase braucht zwei Takte. */
const THEMA_WALZER = [
  '1:1.5 3:0.5 2:1',
  '5:3',
  '4:1 3:1 2:1',
  '1:3',
  '1:1.5 3:0.5 2:1',
  '5:3',
  '6:1 5:1 4:1',
  '5:3',
  '8:1.5 7:0.5 6:1',
  '5:3',
  '4:1 6:1 5:1',
  '3:3',
  '2:1 4:1 3:1',
  '2:3',
  '1:3',
  'R:3',
];
const WALZER_AKKORDE = ['1', '1', '4', '1', '1', '1', '4', '5', '4', '1', '4', '1', '5', '5', '1', '1'];

const AUFBRUCH = [
  '3:1 5:1 8:2',
  '7:1 6:1 5:2',
  '6:1 8:1 6:1 4:1',
  '5:3 R:1',
  '3:1 5:1 8:1 9:1',
  '8:1 7:1 6:2',
  '5:1 6:1 7:1 8:1',
  '9:2 5:2',
];
const AUFBRUCH_AKKORDE = ['6m', '3m', '4', '5', '6m', '4', '2m', '5'];

const SCHATTEN = [
  '5:1 6:1 5:1 3:1',
  '4:2 2:2',
  '5:1 6:1 8:1 6:1',
  '#7:3 R:1',
  '8:1 7:1 6:1 5:1',
  '6:1 5:1 4:1 3:1',
  '2:1 3:1 4:1 2:1',
  '#7-:2 2:2',
];
const SCHATTEN_AKKORDE = ['1m', 'b6', '4m', '5', 'b6', 'b3', '4m', '5'];

/** Lange Töne über dem Thema, für die Begleitstimme. */
const LIEGEND_DUR = ['1:4', '6-:2 1:2', '1:4', '2:4', '4:4', '3:4', '2:4', '1:4'];

const SONGS: Record<string, Song> = {
  // Abenteuerlich, Blechbläser über Flächen, wie ein Vorspann.
  titel: {
    bpm: 100,
    beatsPerBar: 4,
    key: 'D5',
    minor: true,
    lead: 'brass',
    leadVolume: 0.34,
    comp: { voice: 'arp', pattern: '12312312', volume: 0.07, octave: 2 },
    bass: { voice: 'tuba', pattern: '1...5...', volume: 0.3 },
    pad: { voice: 'flaeche', volume: 0.05 },
    drums: 't...s...t.t.s...',
    drumSteps: 4,
    chords: [...THEMA_MOLL, ...SCHATTEN_AKKORDE],
    melody: [...THEMA, ...SCHATTEN],
    reverb: 0.34,
  },
  // Gitarrenrock in Dur: Martys eigene Zeit.
  jahr1986: {
    bpm: 126,
    beatsPerBar: 4,
    key: 'A4',
    lead: 'gitarre',
    leadVolume: 0.2,
    comp: { voice: 'stab', pattern: 'c..c..c.', volume: 0.05, octave: 1 },
    bass: { voice: 'bass', pattern: '11111155', volume: 0.3 },
    drums: 'khshkhsh',
    fill: 'ksksttss',
    chords: [...THEMA_DUR, ...AUFBRUCH_AKKORDE],
    melody: [...THEMA, ...AUFBRUCH],
  },
  // Dieselbe Melodie als schwerer Marsch: So klingt eine Stadt, die einem Mann gehört.
  tannenburg: {
    bpm: 88,
    beatsPerBar: 4,
    key: 'C4',
    minor: true,
    lead: 'orgel',
    leadVolume: 0.24,
    counter: { voice: 'brass', volume: 0.1, melody: ['1:4', '4:4', '1:4', '5:4', 'b6:4', '1:4', '5:4', '1:4', '1:4', 'b6:4', '4:4', '5:4', 'b6:4', '3:4', '4:4', '5:4'] },
    comp: { voice: 'stab', pattern: 'c...c...', volume: 0.05, octave: 1 },
    bass: { voice: 'tuba', pattern: '1.1.5.1.', volume: 0.32 },
    drums: 's.ssk.s.s.ssk.s.',
    drumSteps: 4,
    chords: [...THEMA_MOLL, ...SCHATTEN_AKKORDE],
    melody: [...THEMA, ...SCHATTEN],
    reverb: 0.3,
  },
  // Rock'n'Roll im Dreiergefühl, Saxofon und Klavier.
  jahr1955: {
    bpm: 150,
    beatsPerBar: 4,
    key: 'C5',
    swing: true,
    lead: 'sax',
    leadVolume: 0.26,
    comp: { voice: 'piano', pattern: '.c.c.c.c', volume: 0.05, octave: 1 },
    bass: { voice: 'bass', pattern: '1.3.5.3.', volume: 0.32 },
    drums: 'k.h.s.h.',
    fill: 'k.h.s.ss',
    chords: [...THEMA_DUR, ...AUFBRUCH_AKKORDE],
    melody: [...THEMA, ...AUFBRUCH],
  },
  // Walzer mit Mundharmonika und Banjo für den Westen.
  jahr1885: {
    bpm: 150,
    beatsPerBar: 3,
    key: 'G4',
    lead: 'harmonika',
    leadVolume: 0.28,
    comp: { voice: 'banjo', pattern: '..c3c2', volume: 0.08, octave: 2 },
    bass: { voice: 'tuba', pattern: '1.....', volume: 0.3 },
    drums: 'k.w.w.',
    chords: [...WALZER_AKKORDE, ...WALZER_AKKORDE],
    melody: [...THEMA_WALZER, ...THEMA_WALZER.slice(0, 13), '2:3', '1:3', 'R:3'],
    reverb: 0.26,
  },
  // Kühler Synthesizer mit Hallsnare, die Zukunft aus Sicht der Achtziger.
  jahr2015: {
    bpm: 116,
    beatsPerBar: 4,
    key: 'F#4',
    minor: true,
    lead: 'lead',
    leadVolume: 0.2,
    comp: { voice: 'glocke', pattern: '1232123', volume: 0.07, octave: 2 },
    bass: { voice: 'synthbass', pattern: '1.1.1.51', volume: 0.3 },
    pad: { voice: 'flaeche', volume: 0.05 },
    drums: 'k.hsk.g.',
    fill: 'k.gtk.tg',
    chords: [...THEMA_MOLL, ...SCHATTEN_AKKORDE],
    melody: [...THEMA, ...SCHATTEN],
    reverb: 0.3,
  },
  // Verstimmtes Klavier im Saloon.
  saloon: {
    bpm: 168,
    beatsPerBar: 4,
    key: 'D5',
    swing: true,
    lead: 'honky',
    leadVolume: 0.28,
    comp: { voice: 'honky', pattern: '.c.c.c.c', volume: 0.05, octave: 1 },
    bass: { voice: 'honky', pattern: '1.5.1.5.', volume: 0.2 },
    drums: '........',
    chords: [...THEMA_DUR, ...AUFBRUCH_AKKORDE],
    melody: [...THEMA, ...AUFBRUCH],
    reverb: 0.12,
  },
  // Musikbox: langsamer Tanz mit Orgel.
  diner: {
    bpm: 112,
    beatsPerBar: 4,
    key: 'Bb4',
    swing: true,
    lead: 'sax',
    leadVolume: 0.24,
    counter: { voice: 'orgel', volume: 0.1, melody: [...LIEGEND_DUR, ...LIEGEND_DUR] },
    comp: { voice: 'piano', pattern: 'cccccccc', volume: 0.03, octave: 2 },
    bass: { voice: 'bass', pattern: '1.5.8.5.', volume: 0.3 },
    drums: 'k.h.s.h.',
    chords: [...THEMA_DUR, ...AUFBRUCH_AKKORDE],
    melody: [...THEMA, ...AUFBRUCH],
  },
  // Die Achtziger, wie sie sich jemand 2015 vorstellt: zu viel von allem.
  cafe80er: {
    bpm: 124,
    beatsPerBar: 4,
    key: 'A4',
    lead: 'epiano',
    leadVolume: 0.3,
    comp: { voice: 'stab', pattern: '.c.c.c.c', volume: 0.04, octave: 2 },
    bass: { voice: 'synthbass', pattern: '11181118', volume: 0.3 },
    pad: { voice: 'flaeche', volume: 0.04 },
    drums: 'k.g.k.g.',
    fill: 'k.g.ttgg',
    chords: [...THEMA_DUR, ...AUFBRUCH_AKKORDE],
    melody: [...THEMA, ...AUFBRUCH],
    reverb: 0.3,
  },
  // Der Showdown: schnell, drängend, das Thema in Moll.
  showdown: {
    bpm: 150,
    beatsPerBar: 4,
    key: 'E5',
    minor: true,
    lead: 'brass',
    leadVolume: 0.3,
    comp: { voice: 'stab', pattern: 'c..c..c.', volume: 0.05, octave: 1 },
    bass: { voice: 'synthbass', pattern: '11111111', volume: 0.3 },
    drums: 'k.s.kks.',
    fill: 'ssttkkss',
    chords: [...THEMA_MOLL, ...SCHATTEN_AKKORDE],
    melody: [...THEMA, ...SCHATTEN],
  },
  // Der Abspann: das Thema in voller Größe.
  abspann: {
    bpm: 108,
    beatsPerBar: 4,
    key: 'D5',
    lead: 'brass',
    leadVolume: 0.32,
    counter: { voice: 'fiedel', volume: 0.12, melody: [...LIEGEND_DUR, ...LIEGEND_DUR] },
    comp: { voice: 'arp', pattern: '12312312', volume: 0.06, octave: 2 },
    bass: { voice: 'tuba', pattern: '1.1.5.5.', volume: 0.3 },
    pad: { voice: 'flaeche', volume: 0.06 },
    drums: 'k.h.s.h.',
    fill: 'k.s.t.tt',
    chords: [...THEMA_DUR, ...AUFBRUCH_AKKORDE],
    melody: [...THEMA, ...AUFBRUCH],
    reverb: 0.34,
  },
};

for (const [name, song] of Object.entries(SONGS)) renderSong(song, `${DIR}/${name}.wav`);

function sfx(name: string, seconds: number, paint: (t: Track) => void, reverb = 0): void {
  const t = new Track(seconds);
  paint(t);
  if (reverb) t.reverb(reverb);
  t.save(`${DIR}/${name}.wav`);
}

// --- Bedienung und Handlung -----------------------------------------------------------------

sfx('klick', 0.05, (t) => t.tone(0, 0.04, 880, 'pulse', 0.2));
sfx('nimm', 0.3, (t) => {
  t.fm(0, 0.08, noteFreq('E5'), VOICES.glocke, 0.3);
  t.fm(0.08, 0.14, noteFreq('A5'), VOICES.glocke, 0.3);
});
sfx('tuer', 0.42, (t) => {
  t.noise(0, 0.1, 0.5, 3, 0.5);
  t.tone(0, 0.18, 170, 'triangle', 0.6, 0.6);
  t.noise(0.24, 0.12, 0.6, 5, 0.3);
  t.tone(0.24, 0.1, 90, 'sine', 0.6, 0.7);
});
sfx('welle', 2.4, (t) => {
  t.tone(0, 2.4, 70, 'saw', 0.2, 10);
  t.tone(0, 2.4, 71, 'triangle', 0.3, 13);
  t.texture(0.1, 2.3, 0.4, 11, 0.4, (x) => Math.sin(Math.PI * x));
}, 0.3);
sfx('senden', 1.1, (t) => {
  for (let i = 0; i < 7; i++) t.fm(i * 0.1, 0.12, 440 * 1.26 ** i, VOICES.glocke, 0.25);
  t.noise(0.7, 0.35, 0.4, 7, 0.8);
}, 0.25);
sfx('zeitsprung', 1.7, (t) => {
  t.tone(0, 1.2, 110, 'saw', 0.22, 9);
  t.texture(0, 1.3, 0.35, 41, 0.6, (x) => x);
  t.noise(1.15, 0.5, 0.75, 43, 0.5);
  t.tone(1.15, 0.45, 100, 'sine', 0.7, 0.4);
}, 0.35);
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
sfx('knall', 0.6, (t) => {
  t.noise(0, 0.5, 0.7, 13, 0.7);
  t.tone(0, 0.35, 150, 'sine', 0.7, 0.25);
}, 0.3);
sfx('platsch', 0.55, (t) => {
  t.tone(0, 0.35, 240, 'sine', 0.6, 0.25);
  t.noise(0.03, 0.4, 0.55, 17, 0.3);
  for (let i = 0; i < 4; i++) t.tone(0.18 + i * 0.07, 0.05, 500 - i * 60, 'sine', 0.2);
});
sfx('fall', 0.4, (t) => {
  t.tone(0, 0.2, 130, 'sine', 0.7, 0.35);
  t.noise(0, 0.14, 0.45, 29, 0.3);
  t.noise(0.2, 0.1, 0.3, 31, 0.3);
});
sfx('gitarre', 1.5, (t) => {
  for (const n of ['E3', 'B3', 'E4', 'G#4']) t.fm(0, 1.2, noteFreq(n), VOICES.gitarre, 0.22);
  t.noise(0, 0.5, 0.25, 19, 0.6);
}, 0.3);
sfx('rekord', 1.0, (t) => {
  ['C5', 'E5', 'G5', 'C6', 'G5', 'C6'].forEach((n, i) => t.tone(i * 0.13, 0.13, noteFreq(n), 'square', 0.3));
});
sfx('arcade', 1.3, (t) => {
  for (let i = 0; i < 14; i++) t.tone(i * 0.09, 0.06, 300 + ((i * 7) % 5) * 140, 'square', 0.2);
  t.tone(0.3, 0.2, 900, 'pulse', 0.2, 0.2);
  t.noise(0.85, 0.2, 0.3, 37, 0.7);
});
sfx('reissen', 0.7, (t) => {
  for (let i = 0; i < 8; i++) t.noise(i * 0.08, 0.07, 0.5, i + 23);
});
sfx('scanner', 0.3, (t) => {
  t.tone(0, 0.1, 1200, 'pulse', 0.25);
  t.tone(0.14, 0.14, 1600, 'pulse', 0.25);
});
sfx('aufzug', 0.9, (t) => {
  t.tone(0, 0.8, 80, 'triangle', 0.5, 2.2);
  t.fm(0.72, 0.15, 1400, VOICES.glocke, 0.25);
});
// Kleiner Akzent aus dem Leitmotiv, wenn ein großes Rätsel gelöst ist.
sfx('akzent', 1.1, (t) => {
  [['C5', 0], ['E5', 0.14], ['D5', 0.28], ['G5', 0.42]].forEach(([n, at]) => {
    t.fm(at as number, 0.3, noteFreq(n as string), VOICES.brass, 0.24);
    t.fm(at as number, 0.3, noteFreq(n as string), VOICES.glocke, 0.14);
  });
}, 0.35);
sfx('pferd', 1.1, (t) => {
  t.tone(0, 0.8, 780, 'saw', 0.14, 0.5);
  for (let i = 0; i < 9; i++) t.tone(0.05 + i * 0.09, 0.05, 620 - i * 30, 'square', 0.09);
  t.noise(0.75, 0.3, 0.3, 47, 0.3);
}, 0.2);
sfx('pfeife', 1.3, (t) => {
  for (const f of [660, 830, 990]) {
    t.fm(0, 1.1, f, { ...VOICES.orgel, vibrato: 0.1, vibratoHz: 6, attack: 0.08, release: 0.15 }, 0.1);
  }
  t.texture(0, 1.2, 0.08, 53, 0.5, (x) => 1 - x, true);
}, 0.35);
sfx('dampf', 0.9, (t) => t.texture(0, 0.9, 0.4, 59, 0.5, (x) => (x < 0.1 ? x * 10 : 1 - x), true));
sfx('funken', 0.6, (t) => {
  for (let i = 0; i < 12; i++) t.noise(i * 0.05, 0.015, 0.5, i + 61, 1);
});

// --- Schritte ---------------------------------------------------------------------------------

sfx('schritt_holz', 0.09, (t) => {
  t.tone(0, 0.07, 150, 'triangle', 0.5, 0.7);
  t.noise(0, 0.03, 0.25, 71, 0.5);
});
sfx('schritt_stein', 0.07, (t) => {
  t.noise(0, 0.045, 0.4, 73, 0.8);
  t.tone(0, 0.03, 300, 'triangle', 0.25, 0.8);
});
sfx('schritt_teppich', 0.08, (t) => t.noise(0, 0.07, 0.3, 75, 0.12));
sfx('schritt_erde', 0.1, (t) => t.noise(0, 0.09, 0.42, 77, 0.3));
sfx('schritt_metall', 0.1, (t) => {
  t.tone(0, 0.08, 520, 'triangle', 0.25, 0.85);
  t.noise(0, 0.03, 0.3, 79, 0.9);
});

// --- Sprechlaute: Keine Sprache, nur eine Andeutung ---------------------------------------------

function murmel(name: string, base: number, wave: 'triangle' | 'square'): void {
  sfx(name, 0.34, (t) => {
    const up = [1, 1.2, 0.92, 1.1];
    for (let i = 0; i < 4; i++) t.tone(i * 0.08, 0.07, base * up[i], wave, 0.28, 0.96);
  });
}
murmel('murmel_hoch', 300, 'triangle');
murmel('murmel_mittel', 190, 'triangle');
murmel('murmel_tief', 115, 'triangle');
murmel('murmel_robot', 420, 'square');

// --- Raumklang: Schleifen ohne Naht -------------------------------------------------------------

function raum(name: string, seconds: number, paint: (t: Track) => void, reverb = 0.2, peak = 0.7): void {
  const t = new Track(seconds, true);
  paint(t);
  if (reverb) t.reverb(reverb);
  t.master(peak);
  t.save(`${DIR}/${name}.wav`);
}

/** Hüllkurve, die am Schleifenende wieder dort steht, wo sie begann. */
const welle = (n: number, tiefe = 0.5, phase = 0) => (x: number): number =>
  1 - tiefe + tiefe * Math.sin(x * Math.PI * 2 * n + phase);

raum('amb_uhrwerk', 4, (t) => {
  for (let i = 0; i < 4; i++) {
    t.tone(i, 0.03, i % 2 ? 900 : 1150, 'triangle', 0.5);
    t.noise(i, 0.02, 0.35, 81 + i, 0.8);
    t.tone(i + 0.5, 0.05, 90, 'sine', 0.2);
  }
  t.texture(0, 4, 0.1, 85, 0.05, welle(2, 0.3));
}, 0.4);
raum('amb_labor', 6, (t) => {
  t.tone(0, 6, 60, 'sine', 0.22);
  t.tone(0, 6, 120, 'triangle', 0.07);
  for (let i = 0; i < 12; i++) t.tone(i * 0.5, 0.02, i % 2 ? 1500 : 1320, 'triangle', 0.2);
  for (const at of [1.3, 3.7, 4.1]) t.tone(at, 0.12, 300, 'sine', 0.18, 1.8);
  t.texture(0, 6, 0.05, 87, 0.3, welle(1, 0.3));
}, 0.25, 0.4);
raum('amb_regen', 6, (t) => {
  t.texture(0, 6, 0.45, 89, 0.5, welle(3, 0.12), true);
  t.texture(0, 6, 0.22, 91, 0.1, welle(1, 0.2));
  for (let i = 0; i < 26; i++) t.tone((i * 0.2311) % 6, 0.02, 1400 + ((i * 370) % 900), 'sine', 0.1, 0.6);
}, 0.15);
raum('amb_wind', 8, (t) => {
  t.texture(0, 8, 0.7, 93, 0.05, welle(1, 0.45));
  t.texture(0, 8, 0.25, 95, 0.14, welle(2, 0.5, 1.2));
  for (let i = 0; i < 3; i++) t.tone(1 + i * 2.6, 0.5, 1900 + i * 200, 'sine', 0.02, 1.15);
}, 0.3);
raum('amb_kneipe', 8, (t) => {
  t.texture(0, 8, 0.5, 97, 0.1, welle(3, 0.3));
  t.texture(0, 8, 0.3, 99, 0.2, welle(5, 0.4, 2));
  for (const at of [0.7, 2.9, 3.05, 5.4, 7.2]) t.fm(at, 0.05, 1800 + at * 200, VOICES.glocke, 0.08);
  t.noise(4.2, 0.2, 0.2, 101, 0.3);
}, 0.3);
raum('amb_cafe', 6, (t) => {
  t.tone(0, 6, 100, 'sine', 0.08);
  t.texture(0, 6, 0.28, 103, 0.12, welle(2, 0.35));
  for (const at of [1.1, 1.3, 3.8, 5.2]) t.fm(at, 0.04, 2200, VOICES.glocke, 0.06);
}, 0.25);
raum('amb_stadt', 8, (t) => {
  t.texture(0, 8, 0.4, 105, 0.04, welle(1, 0.3));
  t.tone(2.2, 0.35, 340, 'square', 0.03);
  t.tone(2.65, 0.25, 300, 'square', 0.03);
  for (let i = 0; i < 5; i++) t.tone(5 + i * 0.13, 0.08, 2800 - i * 200, 'sine', 0.03, 1.2);
}, 0.3);
raum('amb_schule', 8, (t) => {
  t.tone(0, 8, 120, 'sine', 0.05);
  t.texture(0, 8, 0.14, 107, 0.08, welle(2, 0.4));
  t.noise(3.1, 0.18, 0.15, 109, 0.4);
  t.tone(3.1, 0.1, 240, 'triangle', 0.1, 0.8);
  t.noise(6.3, 0.06, 0.1, 111, 0.6);
}, 0.5);
raum('amb_esse', 5, (t) => {
  t.texture(0, 5, 0.4, 113, 0.08, welle(1, 0.35));
  for (let i = 0; i < 28; i++) t.noise((i * 0.1777) % 5, 0.012, 0.35, i + 115, 0.9);
}, 0.15);
raum('amb_zukunft', 8, (t) => {
  t.tone(0, 8, 55, 'sine', 0.2);
  t.tone(0, 8, 82.5, 'triangle', 0.08);
  t.tone(1, 2.2, 240, 'sine', 0.05, 2.2);
  t.tone(5, 2.6, 600, 'sine', 0.04, 0.5);
  t.texture(0, 8, 0.1, 145, 0.2, welle(2, 0.5));
}, 0.4, 0.34);

console.log('Audio erzeugt.');
