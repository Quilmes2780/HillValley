import { mkdirSync } from 'node:fs';
import { drawText } from './font.ts';
import { C } from './palette.ts';
import { Canvas, seeded } from './png.ts';
import { baseboard, door } from './prolog.ts';

const FLOOR_Y = 88;

function sprite(dir: string, name: string, w: number, h: number, paint: (c: Canvas) => void): void {
  const c = new Canvas(w, h);
  paint(c);
  c.save(`${dir}/backgrounds/sprites/${name}.png`);
}

/** Himmel und Boden des Wilden Westens. */
function westen(c: Canvas): void {
  c.gradient(0, 0, 320, 92, [C.blau6, C.blau7, C.sand2, C.sand1]);
  c.poly([[0, 74], [40, 56], [86, 70], [132, 50], [190, 72], [246, 54], [320, 70], [320, 92], [0, 92]], C.orange1);
  c.poly([[0, 84], [70, 72], [160, 82], [250, 70], [320, 80], [320, 92], [0, 92]], C.holz4);
  c.gradient(0, 90, 320, 54, [C.holz6, C.sand1, C.sand1]);
  const rnd = seeded(85);
  for (let i = 0; i < 46; i++) {
    c.rect(Math.floor(rnd() * 320), 92 + Math.floor(rnd() * 50), 2 + Math.floor(rnd() * 4), 1, C.holz5);
  }
}

function holzwand(c: Canvas, ramp: readonly number[], dark: number): void {
  c.gradient(0, 0, 320, FLOOR_Y, ramp);
  const rnd = seeded(ramp[0]);
  for (let x = 0; x < 320; x += 12 + Math.floor(rnd() * 8)) c.rect(x, 0, 1, FLOOR_Y, dark);
}

function abstellgleis(dir: string): void {
  const c = new Canvas(320, 144, C.schwarz);
  westen(c);
  // Gleis
  c.rect(0, 96, 320, 2, C.grau2);
  c.rect(0, 104, 320, 2, C.grau2);
  for (let x = 2; x < 320; x += 10) c.rect(x, 94, 3, 14, C.holz2);
  c.rect(0, 96, 320, 1, C.grau4);
  c.rect(0, 104, 320, 1, C.grau4);
  // Wassertank und Kaktus
  c.rect(24, 40, 30, 24, C.holz3);
  c.frame(24, 40, 30, 24, C.holz1);
  c.rect(26, 64, 3, 30, C.holz2);
  c.rect(49, 64, 3, 30, C.holz2);
  c.rect(286, 66, 5, 26, C.gruen3);
  c.rect(280, 72, 3, 10, C.gruen3);
  c.rect(293, 76, 3, 8, C.gruen3);
  c.rect(280, 80, 6, 2, C.gruen3);
  c.rect(291, 82, 5, 2, C.gruen3);
  c.save(`${dir}/backgrounds/abstellgleis_1885.png`);
}

function schmiede(dir: string): void {
  const c = new Canvas(320, 144, C.schwarz);
  holzwand(c, [C.holz1, C.holz2, C.holz2], C.schwarz);
  baseboard(c, C.schwarz, C.holz2);
  c.gradient(0, FLOOR_Y, 320, 56, [C.holz2, C.holz3, C.holz3]);
  // Esse
  c.rect(26, 34, 70, 54, C.grau2);
  c.frame(26, 34, 70, 54, C.grau1);
  c.rect(52, 0, 18, 34, C.grau1);
  c.rect(36, 52, 50, 30, C.schwarz);
  c.gradient(40, 66, 42, 16, [C.rot3, C.orange2, C.gelb2]);
  // Amboss
  c.poly([[122, 66], [162, 66], [172, 72], [150, 74], [146, 86], [160, 88], [124, 88], [136, 86], [132, 74]], C.grau1);
  c.rect(122, 66, 40, 2, C.grau3);
  // Werkbank
  c.rect(196, 60, 60, 5, C.holz5);
  c.rect(198, 65, 5, 27, C.holz3);
  c.rect(249, 65, 5, 27, C.holz3);
  // Hämmer an der Wand
  for (let i = 0; i < 4; i++) {
    c.rect(198 + i * 14, 28, 2, 18, C.holz4);
    c.rect(195 + i * 14, 26, 8, 4, C.grau3);
  }
  door(c, 270, 24, 36, 64, C.holz4, C.holz3, C.holz1);
  c.save(`${dir}/backgrounds/schmiede_1885.png`);

  sprite(dir, 'streichhoelzer', 10, 7, (s) => {
    s.rect(0, 2, 10, 5, C.sand2);
    s.frame(0, 2, 10, 5, C.holz3);
    s.rect(2, 0, 1, 3, C.holz6);
    s.set(2, 0, C.rot4);
    s.rect(6, 0, 1, 3, C.holz6);
    s.set(6, 0, C.rot4);
  });
  sprite(dir, 'bleistift', 12, 3, (s) => {
    s.rect(0, 1, 10, 1, C.gelb1);
    s.rect(0, 0, 2, 3, C.rot3);
    s.rect(10, 1, 2, 1, C.schwarz);
  });
}

function saloon(dir: string): void {
  const c = new Canvas(320, 144, C.schwarz);
  holzwand(c, [C.rot2, C.rot3, C.rot2], C.rot1);
  baseboard(c, C.holz1, C.holz3);
  c.gradient(0, FLOOR_Y, 320, 56, [C.holz3, C.holz4, C.holz4]);
  for (let y = FLOOR_Y + 6; y < 144; y += 9) c.rect(0, y, 320, 1, C.holz2);
  // Regal mit Spiegel
  c.rect(60, 14, 120, 42, C.holz2);
  c.frame(60, 14, 120, 42, C.gelb1);
  c.gradient(84, 18, 72, 22, [C.blau7, C.grau6]);
  c.frame(84, 18, 72, 22, C.gelb1);
  for (let x = 66; x < 174; x += 11) {
    c.rect(x, 44, 5, 10, x % 22 === 0 ? C.gruen3 : C.holz4);
    c.rect(x + 1, 41, 3, 3, C.holz1);
  }
  // Wandbild und Pendeltüren
  c.rect(204, 22, 36, 26, C.gelb1);
  c.rect(207, 25, 30, 20, C.holz6);
  c.poly([[212, 42], [222, 30], [232, 42]], C.holz3);
  c.rect(270, 24, 36, 64, C.schwarz);
  c.rect(270, 40, 17, 30, C.holz4);
  c.rect(289, 40, 17, 30, C.holz4);
  c.frame(268, 22, 40, 66, C.holz2);
  // Spucknapf
  c.poly([[250, 82], [262, 82], [260, 88], [252, 88]], C.gelb1);
  c.save(`${dir}/backgrounds/saloon_1885.png`);

  sprite(dir, 'saloon_theke', 180, 30, (s) => {
    s.rect(0, 0, 180, 5, C.holz6);
    s.rect(0, 5, 180, 25, C.holz3);
    for (let x = 6; x < 180; x += 30) s.rect(x, 9, 20, 17, C.holz2);
    s.rect(0, 28, 180, 2, C.gelb1);
  });
}

function festplatz(dir: string): void {
  const c = new Canvas(320, 144, C.schwarz);
  westen(c);
  // Rathausbaustelle
  c.rect(142, 26, 52, 66, C.sand1);
  c.frame(142, 26, 52, 66, C.holz3);
  c.rect(136, 22, 64, 4, C.holz4);
  for (const x of [134, 200]) {
    c.rect(x, 12, 3, 80, C.holz3);
  }
  for (const y of [34, 56, 78]) c.rect(132, y, 72, 2, C.holz4);
  c.line(134, 78, 200, 34, C.holz3);
  // Einstieg ins Gerüst
  c.rect(160, 58, 18, 34, C.schwarz);
  c.frame(160, 58, 18, 34, C.holz4);
  // Grundstein mit Öffnung
  c.rect(144, 80, 14, 12, C.grau4);
  c.frame(144, 80, 14, 12, C.grau2);
  c.rect(147, 83, 8, 6, C.schwarz);
  // Girlanden
  for (let x = 0; x < 320; x += 6) {
    const y = 14 + Math.round(Math.sin(x / 26) * 6);
    c.rect(x, y, 3, 3, [C.rot4, C.weiss, C.blau5][(x / 6) % 3]);
  }
  // Kuchenstand
  c.rect(14, 62, 74, 30, C.holz4);
  c.rect(14, 62, 74, 3, C.holz6);
  c.poly([[10, 42], [92, 42], [88, 34], [14, 34]], C.rot3);
  for (let x = 14; x < 88; x += 12) c.rect(x, 34, 6, 8, C.weiss);
  c.rect(16, 42, 2, 22, C.holz2);
  c.rect(84, 42, 2, 22, C.holz2);
  c.rect(24, 56, 12, 6, C.sand2);
  c.rect(26, 54, 8, 2, C.rot4);
  c.rect(62, 56, 12, 6, C.sand2);
  c.rect(64, 54, 8, 2, C.gelb2);
  // Aushang
  c.rect(108, 48, 22, 26, C.holz3);
  c.rect(112, 74, 3, 18, C.holz2);
  c.rect(124, 74, 3, 18, C.holz2);
  // Feuerwerksstand
  c.rect(236, 60, 56, 32, C.rot2);
  c.frame(236, 60, 56, 32, C.holz1);
  for (let x = 240; x < 288; x += 7) {
    c.rect(x, 50, 4, 10, C.gelb2);
    c.set(x + 1, 49, C.schwarz);
    c.rect(x + 1, 48, 1, 2, C.grau5);
  }
  c.save(`${dir}/backgrounds/festplatz_1885.png`);

  sprite(dir, 'festprogramm', 14, 18, (s) => {
    s.rect(0, 0, 14, 18, C.sand2);
    s.frame(0, 0, 14, 18, C.holz4);
    s.rect(2, 3, 10, 2, C.rot3);
    for (let y = 7; y < 16; y += 2) s.rect(2, y, 9, 1, C.grau3);
  });
}

function mietstall(dir: string): void {
  const c = new Canvas(320, 144, C.schwarz);
  westen(c);
  // Stall
  c.rect(0, 16, 124, 76, C.holz3);
  for (let x = 0; x < 124; x += 9) c.rect(x, 16, 1, 76, C.holz2);
  c.poly([[0, 16], [0, 0], [124, 0], [136, 16]], C.holz2);
  c.rect(0, 15, 136, 2, C.holz1);
  c.rect(40, 42, 50, 50, C.schwarz);
  c.frame(40, 42, 50, 50, C.holz1);
  c.line(40, 42, 90, 92, C.holz2);
  c.line(90, 42, 40, 92, C.holz2);
  drawText(c, 'MIETSTALL', 38, 25, C.sand2);
  // Zaun
  for (let x = 136; x < 320; x += 30) c.rect(x, 74, 4, 18, C.holz2);
  c.rect(136, 78, 184, 2, C.holz3);
  c.rect(136, 86, 184, 2, C.holz3);
  c.save(`${dir}/backgrounds/mietstall_1885.png`);

  sprite(dir, 'misthaufen', 70, 34, (s) => {
    s.poly([[2, 33], [12, 16], [26, 6], [44, 2], [58, 14], [68, 33]], C.holz2);
    s.poly([[18, 30], [26, 16], [40, 10], [50, 20], [56, 30]], C.holz1);
    for (const [x, y] of [[24, 24], [34, 20], [46, 26], [14, 28], [56, 28]] as const) s.rect(x, y, 3, 1, C.gelb1);
  });
  sprite(dir, 'pferd', 52, 44, (s) => {
    s.rect(6, 12, 30, 14, C.holz3);
    s.rect(34, 2, 10, 18, C.holz3);
    s.poly([[36, 2], [50, 2], [50, 10], [40, 12]], C.holz3);
    s.rect(46, 4, 2, 2, C.schwarz);
    s.rect(32, 0, 3, 8, C.holz1);
    s.rect(2, 14, 4, 12, C.holz1);
    for (const x of [8, 14, 26, 32]) s.rect(x, 26, 3, 18, C.holz2);
    s.rect(14, 10, 14, 4, C.rot3);
  });
  sprite(dir, 'flux_boden', 16, 10, (s) => {
    s.rect(0, 0, 16, 10, C.grau3);
    s.frame(0, 0, 16, 10, C.grau1);
    s.line(3, 8, 7, 2, C.neon);
    s.line(13, 8, 9, 2, C.neon);
    s.line(8, 2, 8, 7, C.neon);
  });
  sprite(dir, 'brief_knitter', 12, 8, (s) => {
    s.poly([[0, 1], [11, 0], [11, 7], [1, 7]], C.weiss);
    s.line(2, 3, 9, 2, C.grau3);
    s.line(2, 5, 8, 5, C.grau3);
  });
}

function stadtplan1885(dir: string): void {
  const c = new Canvas(320, 144, C.sand1);
  c.gradient(0, 0, 320, 144, [C.sand2, C.sand1, C.holz6]);
  c.frame(2, 2, 316, 140, C.holz2);
  c.frame(4, 4, 312, 136, C.holz4);
  // Staubstraßen
  c.rect(6, 70, 308, 5, C.holz5);
  c.rect(150, 40, 5, 60, C.holz5);
  c.rect(72, 60, 3, 12, C.holz5);
  c.rect(240, 74, 3, 26, C.holz5);
  // Gleis
  c.rect(6, 118, 308, 1, C.grau2);
  c.rect(6, 122, 308, 1, C.grau2);
  for (let x = 8; x < 314; x += 7) c.rect(x, 117, 2, 7, C.holz2);
  // Festplatz mit Baustelle
  c.rect(142, 16, 24, 32, C.sand2);
  c.frame(142, 16, 24, 32, C.holz2);
  c.line(138, 48, 138, 12, C.holz2);
  c.line(170, 48, 170, 12, C.holz2);
  c.rect(136, 22, 36, 1, C.holz2);
  for (let x = 124; x < 186; x += 8) c.rect(x, 50, 3, 3, x % 16 === 4 ? C.rot4 : C.blau5);
  // Saloon
  c.rect(48, 36, 50, 26, C.holz4);
  c.frame(48, 36, 50, 26, C.holz1);
  c.rect(48, 30, 50, 7, C.holz2);
  c.rect(68, 48, 10, 14, C.schwarz);
  // Schmiede
  c.rect(214, 40, 36, 26, C.grau3);
  c.frame(214, 40, 36, 26, C.grau1);
  c.rect(238, 30, 6, 10, C.grau1);
  c.rect(226, 52, 10, 14, C.schwarz);
  // Mietstall
  c.rect(30, 86, 46, 22, C.holz3);
  c.poly([[26, 86], [53, 74], [80, 86]], C.holz2);
  c.rect(46, 94, 14, 14, C.schwarz);
  // Abstellgleis: Prellbock
  c.rect(218, 96, 44, 18, C.grau4);
  c.frame(218, 96, 44, 18, C.grau1);
  c.rect(226, 100, 8, 8, C.neon);
  c.rect(246, 100, 8, 8, C.neon);
  // Kakteen
  const rnd = seeded(1885);
  for (let i = 0; i < 18; i++) {
    const x = 12 + Math.floor(rnd() * 296);
    const y = 12 + Math.floor(rnd() * 120);
    if (Math.abs(x - 152) < 30 && y < 70) continue;
    c.rect(x, y, 2, 4, C.gruen3);
  }
  drawText(c, 'HILL VALLEY', 12, 10, C.holz2);
  drawText(c, '1885', 12, 22, C.holz2);
  c.save(`${dir}/backgrounds/stadtplan_1885.png`);
}

function uhrwerk1885(dir: string): void {
  const c = new Canvas(320, 144, C.schwarz);
  westen(c);
  // Gerüst: offenes Holzgerippe, Uhrwerk halb montiert
  for (const x of [20, 110, 200, 300]) c.rect(x, 0, 5, 92, C.holz2);
  for (const y of [18, 54]) c.rect(0, y, 320, 3, C.holz3);
  c.line(20, 92, 110, 18, C.holz3);
  c.line(200, 92, 300, 18, C.holz3);
  c.rect(0, 84, 320, 8, C.holz3);
  c.gradient(0, 88, 320, 56, [C.holz3, C.holz4, C.holz4]);
  for (let x = 6; x < 320; x += 20) c.rect(x, 88, 1, 56, C.holz2);
  // Zahnräder stehen noch in Kisten
  c.rect(52, 62, 44, 26, C.holz4);
  c.frame(52, 62, 44, 26, C.holz1);
  c.poly([[62, 62], [66, 50], [78, 46], [88, 52], [92, 62]], C.gelb1);
  // Leiter
  c.rect(6, 34, 3, 54, C.holz2);
  c.rect(24, 34, 3, 54, C.holz2);
  for (let y = 38; y < 88; y += 7) c.rect(6, y, 21, 2, C.holz4);
  // Zifferblatt-Rohling
  c.poly([[148, 6], [182, 6], [196, 20], [196, 44], [182, 58], [148, 58], [134, 44], [134, 20]], C.sand2);
  // Chronopost
  c.rect(206, 46, 60, 42, C.gelb1);
  c.frame(206, 46, 60, 42, C.orange1);
  c.rect(206, 46, 60, 3, C.gelb2);
  c.rect(212, 52, 22, 3, C.schwarz);
  c.rect(238, 54, 16, 16, C.orange1);
  c.rect(240, 57, 12, 10, C.gelb3);
  c.line(246, 62, 241, 58, C.schwarz);
  c.rect(212, 72, 22, 10, C.holz2);
  c.frame(212, 72, 22, 10, C.orange1);
  c.save(`${dir}/backgrounds/uhrwerk_1885.png`);

  sprite(dir, 'sicherung_fach', 12, 6, (s) => {
    s.rect(0, 1, 12, 4, C.grau6);
    s.rect(2, 0, 8, 6, C.blau8);
    s.rect(4, 2, 4, 2, C.gelb2);
  });
  sprite(dir, 'brief_fach', 14, 7, (s) => {
    s.rect(0, 0, 14, 7, C.weiss);
    s.frame(0, 0, 14, 7, C.neon);
    s.line(1, 1, 7, 4, C.grau4);
    s.line(12, 1, 7, 4, C.grau4);
  });
}

function veranda(dir: string): void {
  const c = new Canvas(320, 144, C.schwarz);
  c.gradient(0, 0, 320, FLOOR_Y, [C.sand2, C.sand2, C.sand1]);
  for (let y = 4; y < FLOOR_Y; y += 5) c.rect(0, y, 320, 1, C.sand1);
  c.rect(0, 0, 320, 8, C.grau5);
  baseboard(c, C.grau4, C.grau6);
  c.gradient(0, FLOOR_Y, 320, 56, [C.holz5, C.holz6, C.holz6]);
  for (let y = FLOOR_Y + 8; y < 144; y += 9) c.rect(0, y, 320, 1, C.holz4);
  door(c, 40, 24, 34, 64, C.rot3, C.rot2, C.weiss);
  c.rect(110, 26, 40, 34, C.weiss);
  c.gradient(113, 29, 34, 28, [C.blau3, C.blau5]);
  c.rect(129, 29, 2, 28, C.weiss);
  // Hollywoodschaukel
  c.rect(182, 18, 3, 54, C.grau3);
  c.rect(262, 18, 3, 54, C.grau3);
  c.rect(180, 66, 88, 8, C.rot4);
  c.rect(180, 54, 88, 12, C.rot5);
  c.rect(180, 14, 88, 4, C.grau3);
  // Treppe hinunter
  c.rect(286, 94, 34, 50, C.holz4);
  for (let y = 100; y < 144; y += 10) c.rect(286, y, 34, 2, C.holz3);
  c.rect(286, 60, 4, 34, C.weiss);
  c.save(`${dir}/backgrounds/veranda_1986.png`);
}

/**
 * Neutraler Platzhalter für die Zeitmaschine auf Schienen. Bewusst kein Film-Fahrzeug:
 * Eigene Grafik ersetzt einfach assets/characters/zeitzug/zeitzug.png (160×48).
 */
function zeitzug(dir: string): void {
  const c = new Canvas(160, 48);
  c.rect(4, 12, 110, 28, C.grau3);
  c.frame(4, 12, 110, 28, C.grau1);
  c.rect(116, 18, 40, 22, C.grau4);
  c.frame(116, 18, 40, 22, C.grau1);
  for (const x of [20, 56, 92, 134]) {
    c.poly([[x, 38], [x + 8, 38], [x + 12, 42], [x + 8, 47], [x, 47], [x - 4, 42]], C.schwarz);
  }
  drawText(c, 'ZEITZUG', 30, 18, C.weiss);
  mkdirSync(`${dir}/characters/zeitzug`, { recursive: true });
  c.save(`${dir}/characters/zeitzug/zeitzug.png`);
}

export function buildK3K4Backgrounds(dir: string): void {
  abstellgleis(dir);
  schmiede(dir);
  saloon(dir);
  festplatz(dir);
  mietstall(dir);
  stadtplan1885(dir);
  uhrwerk1885(dir);
  veranda(dir);
  zeitzug(dir);

  // Docs Labor 1986: neue Dinge für Kapitel 3 und 4
  sprite(dir, 'brecheisen', 6, 28, (s) => {
    s.rect(2, 0, 2, 26, C.grau3);
    s.rect(0, 0, 3, 2, C.grau3);
    s.rect(3, 25, 3, 3, C.grau3);
  });
  sprite(dir, 'sicherungskasten', 24, 30, (s) => {
    s.rect(0, 0, 24, 30, C.grau4);
    s.frame(0, 0, 24, 30, C.grau1);
    s.rect(4, 4, 16, 2, C.grau2);
    s.rect(17, 14, 3, 5, C.grau6);
  });
  sprite(dir, 'sicherungskasten_offen', 24, 30, (s) => {
    s.rect(0, 0, 24, 30, C.grau1);
    s.frame(0, 0, 24, 30, C.grau4);
    for (const y of [5, 14, 23]) for (const x of [4, 14]) s.rect(x, y, 6, 3, C.grau4);
  });
  sprite(dir, 'sicherung', 10, 5, (s) => {
    s.rect(0, 1, 10, 3, C.grau6);
    s.rect(2, 0, 6, 5, C.blau8);
    s.rect(4, 2, 2, 1, C.gelb2);
  });
  sprite(dir, 'grundstein_auf', 18, 12, (s) => {
    s.rect(0, 0, 18, 12, C.grau3);
    s.frame(0, 0, 18, 12, C.grau1);
    s.rect(3, 3, 12, 7, C.schwarz);
  });
  sprite(dir, 'gelber_brief', 11, 6, (s) => {
    s.rect(0, 0, 11, 6, C.gelb3);
    s.frame(0, 0, 11, 6, C.holz5);
  });
  sprite(dir, 'wachsdose', 10, 8, (s) => {
    s.rect(0, 2, 10, 6, C.gelb1);
    s.rect(0, 0, 10, 2, C.grau5);
    s.rect(2, 4, 6, 2, C.rot3);
  });
  sprite(dir, 'schluesselbund', 8, 10, (s) => {
    s.line(4, 0, 4, 3, C.grau1);
    s.rect(2, 3, 4, 3, C.gelb2);
    s.rect(3, 6, 2, 4, C.gelb2);
    s.rect(5, 8, 2, 1, C.gelb2);
  });
}
