import { C } from './palette.ts';
import { Canvas } from './png.ts';

function sprite(dir: string, name: string, w: number, h: number, paint: (c: Canvas) => void): void {
  const c = new Canvas(w, h);
  paint(c);
  c.save(`${dir}/backgrounds/sprites/${name}.png`);
}

function uhrwerkSprites(dir: string): void {
  sprite(dir, 'chronopost_lampe', 8, 6, (s) => {
    s.rect(0, 0, 8, 6, C.grau1);
    s.rect(1, 1, 6, 4, C.neon);
    s.rect(2, 1, 2, 1, C.weiss);
  });
  // Das Diktiergerät hat der Nutzer gezeichnet; es wird hier nicht mehr erzeugt.
}

function bandraum(dir: string): void {
  sprite(dir, 'kabelrolle', 18, 12, (s) => {
    s.poly([[4, 1], [14, 1], [17, 5], [14, 11], [4, 11], [1, 5]], C.orange1);
    s.poly([[6, 3], [12, 3], [14, 6], [12, 9], [6, 9], [4, 6]], C.schwarz);
  });
}

function docsLabor1955(dir: string): void {
  sprite(dir, 'schraubenzieher', 14, 4, (s) => {
    s.rect(0, 1, 5, 3, C.rot4);
    s.rect(5, 2, 9, 1, C.grau6);
  });
  sprite(dir, 'zigarrenkiste', 18, 9, (s) => {
    s.rect(0, 0, 18, 9, C.holz4);
    s.frame(0, 0, 18, 9, C.holz2);
    s.rect(5, 3, 8, 3, C.sand2);
  });
}

export function buildK1K2Backgrounds(dir: string): void {
  uhrwerkSprites(dir);
  bandraum(dir);
  docsLabor1955(dir);

  sprite(dir, 'zeitung', 16, 8, (s) => {
    s.poly([[1, 2], [14, 0], [15, 6], [2, 7]], C.grau6);
    s.line(3, 3, 12, 2, C.grau3);
    s.line(4, 5, 13, 4, C.grau4);
  });
  sprite(dir, 'mappe', 14, 10, (s) => {
    s.rect(0, 0, 14, 10, C.holz4);
    s.frame(0, 0, 14, 10, C.holz1);
    s.rect(4, 3, 6, 2, C.sand2);
  });
}
