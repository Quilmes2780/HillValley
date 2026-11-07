import { C } from './palette.ts';
import { Canvas } from './png.ts';

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
  lobby(dir);
  buero(dir);
}
