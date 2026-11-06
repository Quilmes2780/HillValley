import { mkdirSync } from 'node:fs';
import { drawText } from './font.ts';
import { C } from './palette.ts';
import { Canvas, seeded } from './png.ts';
import { door } from './prolog.ts';

const FLOOR_Y = 88;

function sprite(dir: string, name: string, w: number, h: number, paint: (c: Canvas) => void): void {
  const c = new Canvas(w, h);
  paint(c);
  c.save(`${dir}/backgrounds/sprites/${name}.png`);
}

/** Glänzender Boden des Jahres 2015. */
function glanzboden(c: Canvas, a: number, b: number): void {
  c.gradient(0, FLOOR_Y, c.w, c.h - FLOOR_Y, [a, b, b, a]);
  for (let x = 0; x < c.w; x += 32) c.line(x, FLOOR_Y, x + (x - c.w / 2) / 3, c.h - 1, a);
}

function turmplatz(dir: string, healed: boolean): void {
  const c = new Canvas(320, 144, C.schwarz);
  c.gradient(0, 0, 320, 92, [C.violett2, C.pink1, C.orange2, C.gelb2]);
  // Skyline
  for (const [x, w, h] of [[0, 24, 46], [22, 18, 60], [292, 28, 52], [270, 20, 38]] as const) {
    c.rect(x, 92 - h, w, h, C.violett1);
    for (let y = 92 - h + 4; y < 90; y += 6) {
      for (let wx = x + 3; wx < x + w - 2; wx += 5) c.rect(wx, y, 2, 2, C.gelb2);
    }
  }
  // Der Turm
  c.rect(128, 0, 64, 92, C.grau2);
  c.frame(128, 0, 64, 92, C.neon);
  for (let y = 8; y < 54; y += 8) c.rect(134, y, 52, 4, C.blau4);
  c.poly([[150, 16], [170, 16], [178, 24], [178, 36], [170, 44], [150, 44], [142, 36], [142, 24]], C.weiss);
  c.line(160, 30, 160, 20, C.schwarz);
  c.line(160, 30, 167, 30, C.schwarz);
  c.rect(134, 50, 52, 10, healed ? C.tuerkis1 : C.rot2);
  drawText(c, healed ? 'RATHAUS' : 'TANNEN', healed ? 142 : 145, 50, healed ? C.neon : C.gelb2);
  door(c, 146, 62, 28, 30, C.grau3, C.grau2, C.neon);
  // Café 80er
  c.rect(30, 44, 78, 48, C.pink1);
  c.frame(30, 44, 78, 48, C.neon);
  c.rect(30, 44, 78, 11, C.schwarz);
  drawText(c, 'CAFE 80ER', 38, 44, C.pink4);
  c.rect(36, 60, 22, 18, C.blau7);
  door(c, 66, 58, 26, 34, C.pink2, C.pink1, C.neon);
  // Museum
  c.rect(208, 44, 62, 48, C.grau5);
  c.frame(208, 44, 62, 48, C.grau2);
  c.rect(208, 44, 62, 11, healed ? C.tuerkis1 : C.rot2);
  drawText(c, 'MUSEUM', 217, 44, healed ? C.neon : C.gelb2);
  door(c, 228, 58, 24, 34, C.grau3, C.grau2, C.weiss);
  // Boden und Schwebeauto
  glanzboden(c, C.grau3, C.grau5);
  c.poly([[182, 4], [214, 4], [220, 11], [176, 11]], C.neon);
  c.rect(180, 11, 36, 2, C.blau1);
  // Gasse rechts
  c.rect(300, 60, 20, 32, C.schwarz);
  c.save(`${dir}/backgrounds/turmplatz_2015${healed ? '_geheilt' : ''}.png`);
}

function cafe80er(dir: string): void {
  const c = new Canvas(320, 144, C.schwarz);
  c.gradient(0, 0, 320, FLOOR_Y, [C.violett1, C.violett2, C.violett1]);
  c.rect(0, 0, 320, 6, C.pink2);
  c.rect(0, FLOOR_Y - 3, 320, 3, C.neon);
  for (let y = FLOOR_Y; y < 144; y += 8) {
    for (let x = 0; x < 320; x += 12) c.rect(x, y, 12, 8, ((x / 12 + y / 8) | 0) % 2 === 0 ? C.grau1 : C.grau5);
  }
  door(c, 6, 28, 30, 60, C.pink2, C.pink1, C.neon);
  // Poster mit Stars aus der „alten Zeit“
  for (const [x, col] of [[60, C.gelb2], [96, C.tuerkis4], [132, C.pink3]] as const) {
    c.rect(x, 16, 26, 34, col);
    c.frame(x, 16, 26, 34, C.schwarz);
    c.rect(x + 8, 22, 10, 10, C.grau6);
    c.rect(x + 5, 34, 16, 10, C.grau2);
  }
  // Theke
  c.rect(52, 62, 110, 26, C.grau2);
  c.rect(52, 60, 110, 3, C.neon);
  // Tisch für Brix
  c.rect(204, 92, 40, 3, C.neon);
  c.rect(222, 95, 4, 18, C.grau3);
  c.rect(214, 112, 20, 2, C.grau3);
  // Retro-Automat
  c.rect(266, 28, 40, 60, C.blau2);
  c.frame(266, 28, 40, 60, C.neon);
  c.rect(272, 34, 28, 22, C.schwarz);
  c.rect(275, 37, 6, 3, C.gruen6);
  c.rect(284, 42, 4, 4, C.rot5);
  c.rect(292, 47, 5, 2, C.gelb2);
  c.rect(274, 62, 24, 14, C.grau2);
  c.rect(279, 65, 3, 8, C.rot4);
  c.rect(286, 68, 4, 4, C.gelb2);
  c.rect(283, 80, 8, 2, C.gelb1);
  c.save(`${dir}/backgrounds/cafe80er_2015.png`);

  sprite(dir, 'glas', 6, 9, (s) => {
    s.rect(0, 0, 6, 9, C.blau8);
    s.frame(0, 0, 6, 9, C.grau5);
    s.rect(1, 3, 4, 5, C.gelb3);
  });
}

function museum(dir: string, healed: boolean): void {
  const c = new Canvas(320, 144, C.schwarz);
  c.gradient(0, 0, 320, FLOOR_Y, healed ? [C.grau6, C.weiss, C.grau6] : [C.rot1, C.rot2, C.rot1]);
  c.rect(0, 0, 320, 6, healed ? C.grau4 : C.gelb1);
  c.rect(0, FLOOR_Y - 3, 320, 3, healed ? C.grau4 : C.gelb1);
  glanzboden(c, C.grau4, C.grau6);
  door(c, 6, 26, 32, 62, C.grau3, C.grau2, C.weiss);
  c.rect(92, 10, 140, 14, healed ? C.tuerkis1 : C.rot3);
  c.frame(92, 10, 140, 14, healed ? C.neon : C.gelb2);
  drawText(c, healed ? 'HILL VALLEY MUSEUM' : 'TANNEN-ZEITMUSEUM', healed ? 104 : 108, 12, healed ? C.neon : C.gelb2);
  // Weitere Ausstellungsstücke
  c.rect(52, 34, 26, 30, C.holz3);
  c.frame(52, 34, 26, 30, C.gelb1);
  c.rect(56, 38, 18, 22, C.sand2);
  c.rect(250, 30, 30, 34, C.holz3);
  c.frame(250, 30, 30, 34, C.gelb1);
  c.rect(254, 34, 22, 26, C.grau6);
  // Podest und Absperrung
  c.rect(86, 80, 150, 8, C.grau3);
  c.rect(86, 80, 150, 1, C.grau6);
  for (const x of [80, 158, 240]) {
    c.rect(x, 86, 3, 18, C.gelb1);
    c.rect(x - 2, 84, 7, 2, C.gelb2);
  }
  c.line(82, 88, 158, 96, C.rot3);
  c.line(160, 96, 240, 88, C.rot3);
  c.save(`${dir}/backgrounds/museum_2015${healed ? '_geheilt' : ''}.png`);

  sprite(dir, 'klebeband', 14, 9, (s) => {
    s.poly([[3, 0], [10, 0], [13, 4], [10, 8], [3, 8], [0, 4]], C.grau6);
    s.poly([[5, 2], [8, 2], [10, 4], [8, 6], [5, 6], [3, 4]], C.grau1);
  });
  sprite(dir, 'kofferraum_offen', 24, 12, (s) => {
    s.rect(0, 0, 24, 12, C.schwarz);
    s.frame(0, 0, 24, 12, C.grau3);
    s.rect(3, 4, 14, 7, C.rot3);
    s.rect(3, 4, 14, 2, C.rot5);
  });
}

/**
 * Neutraler Platzhalter für den Museumswagen. Bewusst kein Film-Fahrzeug:
 * Eigene Grafik ersetzt einfach assets/characters/delorean/delorean.png (130×44).
 */
function deloreanPlatzhalter(dir: string): void {
  const c = new Canvas(130, 44);
  c.poly([[8, 28], [34, 12], [86, 10], [118, 26], [126, 34], [4, 34]], C.grau4);
  c.poly([[40, 14], [82, 13], [100, 26], [32, 26]], C.grau2);
  c.rect(4, 32, 122, 4, C.grau3);
  for (const x of [22, 96]) {
    c.poly([[x, 32], [x + 10, 32], [x + 14, 38], [x + 10, 43], [x, 43], [x - 4, 38]], C.schwarz);
    c.rect(x + 3, 36, 4, 4, C.grau5);
  }
  drawText(c, 'WAGEN', 49, 14, C.weiss);
  mkdirSync(`${dir}/characters/delorean`, { recursive: true });
  c.save(`${dir}/characters/delorean/delorean.png`);
}

function lobby(dir: string): void {
  const c = new Canvas(320, 144, C.schwarz);
  c.gradient(0, 0, 320, FLOOR_Y, [C.grau2, C.grau3, C.grau2]);
  for (let x = 0; x < 320; x += 40) c.rect(x, 0, 2, FLOOR_Y, C.grau1);
  c.rect(0, FLOOR_Y - 3, 320, 3, C.neon);
  glanzboden(c, C.grau1, C.grau3);
  door(c, 6, 28, 32, 60, C.grau4, C.grau3, C.neon);
  // Empfang, nicht besetzt: ein Schild erledigt das
  c.rect(60, 58, 80, 30, C.rot2);
  c.rect(60, 56, 80, 3, C.neon);
  c.rect(84, 38, 32, 16, C.schwarz);
  c.frame(84, 38, 32, 16, C.neon);
  c.rect(88, 44, 24, 2, C.gelb2);
  // Goldene Büste
  c.rect(160, 62, 12, 26, C.grau1);
  c.poly([[160, 50], [172, 50], [174, 56], [168, 62], [164, 62], [158, 56]], C.gelb1);
  // Aufzug, Scanner, Knopf
  c.rect(200, 24, 44, 64, C.grau1);
  c.frame(200, 24, 44, 64, C.neon);
  c.rect(204, 14, 36, 8, C.schwarz);
  drawText(c, '88', 216, 12, C.rot5);
  c.rect(250, 52, 12, 16, C.grau5);
  c.frame(250, 52, 12, 16, C.grau1);
  c.rect(252, 55, 8, 8, C.rot4);
  c.save(`${dir}/backgrounds/lobby_2015.png`);

  sprite(dir, 'aufzug_zu', 40, 60, (s) => {
    s.rect(0, 0, 40, 60, C.grau5);
    s.rect(19, 0, 2, 60, C.grau2);
    s.rect(4, 22, 10, 16, C.grau4);
    s.rect(26, 22, 10, 16, C.grau4);
  });
  sprite(dir, 'scanner_gruen', 8, 8, (s) => {
    s.rect(0, 0, 8, 8, C.gruen6);
  });
  sprite(dir, 'knopf_88', 12, 12, (s) => {
    s.rect(0, 0, 12, 12, C.grau1);
    s.frame(0, 0, 12, 12, C.neon);
    s.rect(3, 3, 6, 6, C.gelb2);
  });
}

function buero(dir: string): void {
  const c = new Canvas(320, 144, C.schwarz);
  c.gradient(0, 0, 320, FLOOR_Y, [C.grau1, C.blau1, C.grau1]);
  c.rect(0, FLOOR_Y - 3, 320, 3, C.neon);
  // Polierter Boden: Marty rutscht hier aus
  c.gradient(0, FLOOR_Y, 320, 56, [C.grau4, C.grau6, C.grau5]);
  for (let y = FLOOR_Y + 4; y < 144; y += 9) c.rect(0, y, 320, 1, C.grau5);
  // Feuertür links
  door(c, 8, 24, 36, 64, C.rot3, C.rot2, C.grau3);
  c.rect(16, 16, 20, 6, C.gruen4);
  // Großes Zifferblatt
  c.poly([[108, 6], [150, 6], [168, 24], [168, 58], [150, 76], [108, 76], [90, 58], [90, 24]], C.gelb3);
  c.line(129, 41, 129, 16, C.schwarz);
  c.line(129, 41, 148, 41, C.schwarz);
  c.rect(127, 39, 5, 5, C.schwarz);
  // Aktenvernichter
  c.rect(58, 60, 22, 28, C.grau3);
  c.frame(58, 60, 22, 28, C.grau1);
  c.rect(60, 58, 18, 3, C.grau1);
  c.rect(62, 74, 14, 10, C.grau5);
  // Chronopost
  c.rect(206, 46, 60, 42, C.gelb1);
  c.frame(206, 46, 60, 42, C.orange1);
  c.rect(206, 46, 60, 3, C.gelb2);
  c.rect(212, 52, 22, 3, C.schwarz);
  c.rect(238, 54, 16, 16, C.orange1);
  c.rect(240, 57, 12, 10, C.gelb3);
  c.rect(212, 72, 22, 10, C.holz2);
  // Aufzug rechts
  c.rect(278, 24, 36, 64, C.grau2);
  c.frame(278, 24, 36, 64, C.neon);
  c.rect(295, 24, 2, 64, C.grau1);
  c.save(`${dir}/backgrounds/buero_2015.png`);

  sprite(dir, 'brief_boden', 12, 8, (s) => {
    s.rect(0, 0, 12, 8, C.weiss);
    s.frame(0, 0, 12, 8, C.neon);
    s.line(1, 1, 6, 4, C.grau4);
    s.line(10, 1, 6, 4, C.grau4);
  });
}

function gasse(dir: string): void {
  const c = new Canvas(320, 144, C.schwarz);
  c.gradient(0, 0, 320, 92, [C.violett1, C.grau1, C.grau2]);
  const rnd = seeded(2015);
  for (let y = 0; y < 92; y += 8) {
    c.rect(0, y, 320, 1, C.grau1);
    for (let x = Math.floor(rnd() * 16); x < 320; x += 16 + Math.floor(rnd() * 16)) c.rect(x, y, 1, 8, C.grau1);
  }
  c.gradient(0, 90, 320, 54, [C.grau1, C.grau2, C.grau3]);
  // Außentreppe vom Turm herunter
  c.line(0, 8, 140, 78, C.grau5);
  c.line(0, 9, 140, 79, C.grau5);
  c.line(0, 18, 140, 88, C.grau3);
  for (let i = 0; i < 12; i++) c.rect(i * 12, 10 + i * 6, 2, 10, C.grau3);
  // Mülltonnen
  c.rect(30, 74, 18, 18, C.grau3);
  c.rect(28, 72, 22, 3, C.grau4);
  c.save(`${dir}/backgrounds/gasse_2015.png`);

  sprite(dir, 'hover_mistlaster', 120, 58, (s) => {
    s.rect(88, 14, 30, 26, C.tuerkis3);
    s.rect(94, 18, 18, 10, C.blau7);
    s.rect(0, 22, 84, 22, C.grau4);
    s.frame(0, 22, 84, 22, C.grau1);
    s.poly([[6, 22], [20, 8], [42, 2], [62, 8], [78, 22]], C.holz2);
    s.poly([[24, 20], [36, 10], [50, 12], [60, 20]], C.holz1);
    for (const x of [14, 60, 100]) {
      s.rect(x, 46, 14, 4, C.grau1);
      s.rect(x + 2, 50, 10, 2, C.neon);
    }
  });
  sprite(dir, 'brix_beine', 20, 16, (s) => {
    s.rect(4, 0, 4, 12, C.grau1);
    s.rect(12, 2, 4, 10, C.grau1);
    s.rect(2, 0, 6, 2, C.neon);
    s.rect(12, 0, 6, 2, C.neon);
  });
}

export function buildK5Backgrounds(dir: string): void {
  turmplatz(dir, false);
  turmplatz(dir, true);
  cafe80er(dir);
  museum(dir, false);
  museum(dir, true);
  deloreanPlatzhalter(dir);
  lobby(dir);
  buero(dir);
  gasse(dir);
}
