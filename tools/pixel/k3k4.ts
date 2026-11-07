import { C } from './palette.ts';
import { Canvas } from './png.ts';

function sprite(dir: string, name: string, w: number, h: number, paint: (c: Canvas) => void): void {
  const c = new Canvas(w, h);
  paint(c);
  c.save(`${dir}/backgrounds/sprites/${name}.png`);
}

function schmiede(dir: string): void {
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

function festplatz(dir: string): void {
  sprite(dir, 'festprogramm', 14, 18, (s) => {
    s.rect(0, 0, 14, 18, C.sand2);
    s.frame(0, 0, 14, 18, C.holz4);
    s.rect(2, 3, 10, 2, C.rot3);
    for (let y = 7; y < 16; y += 2) s.rect(2, y, 9, 1, C.grau3);
  });
}

function mietstall(dir: string): void {
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

function uhrwerk1885(dir: string): void {
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

export function buildK3K4Backgrounds(dir: string): void {
  schmiede(dir);
  festplatz(dir);
  mietstall(dir);
  uhrwerk1885(dir);

  // Docs Labor 1986: neue Dinge für Kapitel 3 und 4
  sprite(dir, 'brecheisen', 6, 28, (s) => {
    s.rect(2, 0, 2, 26, C.grau3);
    s.rect(0, 0, 3, 2, C.grau3);
    s.rect(3, 25, 3, 3, C.grau3);
  });
  sprite(dir, 'sicherung', 10, 5, (s) => {
    s.rect(0, 1, 10, 3, C.grau6);
    s.rect(2, 0, 6, 5, C.blau8);
    s.rect(4, 2, 2, 1, C.gelb2);
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
