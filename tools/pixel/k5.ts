import { mkdirSync } from 'node:fs';
import { drawText } from './font.ts';
import { C } from './palette.ts';
import { Canvas, saveReplaceable } from './png.ts';

function sprite(dir: string, name: string, w: number, h: number, paint: (c: Canvas) => void): void {
  const c = new Canvas(w, h);
  paint(c);
  c.save(`${dir}/backgrounds/sprites/${name}.png`);
}

function cafe80er(dir: string): void {
  sprite(dir, 'glas', 6, 9, (s) => {
    s.rect(0, 0, 6, 9, C.blau8);
    s.frame(0, 0, 6, 9, C.grau5);
    s.rect(1, 3, 4, 5, C.gelb3);
  });
}

function museum(dir: string): void {
  sprite(dir, 'klebeband', 14, 9, (s) => {
    s.poly([[3, 0], [10, 0], [13, 4], [10, 8], [3, 8], [0, 4]], C.grau6);
    s.poly([[5, 2], [8, 2], [10, 4], [8, 6], [5, 6], [3, 4]], C.grau1);
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
  saveReplaceable(c, `${dir}/characters/delorean/delorean.png`);
}

function lobby(dir: string): void {
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
  sprite(dir, 'brief_boden', 12, 8, (s) => {
    s.rect(0, 0, 12, 8, C.weiss);
    s.frame(0, 0, 12, 8, C.neon);
    s.line(1, 1, 6, 4, C.grau4);
    s.line(10, 1, 6, 4, C.grau4);
  });
}

export function buildK5Backgrounds(dir: string): void {
  cafe80er(dir);
  museum(dir);
  deloreanPlatzhalter(dir);
  lobby(dir);
  buero(dir);
}
