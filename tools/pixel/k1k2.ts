import { C } from './palette.ts';
import { Canvas } from './png.ts';

function sprite(dir: string, name: string, w: number, h: number, paint: (c: Canvas) => void): void {
  const c = new Canvas(w, h);
  paint(c);
  c.save(`${dir}/backgrounds/sprites/${name}.png`);
}

function uhrwerkSprites(dir: string): void {
  // Lampe der Chronopost (Higgsfield) und Diktiergerät (Nutzer) werden hier nicht mehr erzeugt.
  void dir;
}

function bandraum(_dir: string): void {
  // Die Kabelrolle ist mit Higgsfield erzeugt und wird hier nicht mehr erzeugt.
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

  // Die Zeitung hat der Nutzer gezeichnet; sie wird hier nicht mehr erzeugt.
  sprite(dir, 'mappe', 14, 10, (s) => {
    s.rect(0, 0, 14, 10, C.holz4);
    s.frame(0, 0, 14, 10, C.holz1);
    s.rect(4, 3, 6, 2, C.sand2);
  });
}
