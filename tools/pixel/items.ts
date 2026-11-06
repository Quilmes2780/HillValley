import { C } from './palette.ts';
import { Canvas } from './png.ts';
import { drawGlyph } from './font.ts';

const W = 32;
const H = 20;

function icon(dir: string, name: string, paint: (c: Canvas) => void): void {
  const c = new Canvas(W, H);
  paint(c);
  c.save(`${dir}/items/${name}.png`);
}

export function buildItems(dir: string): void {
  // Das Familienfoto gehört zur Story und wird später je Stufe verändert.
  icon(dir, 'foto', (c) => {
    c.rect(8, 2, 16, 16, C.sand2);
    c.frame(8, 2, 16, 16, C.holz4);
    c.rect(10, 4, 12, 7, C.blau6);
    c.rect(10, 11, 12, 3, C.gruen5);
    c.rect(12, 8, 2, 5, C.rot4);
    c.rect(16, 8, 2, 5, C.blau3);
    c.rect(19, 9, 2, 4, C.violett4);
  });

  icon(dir, 'apfel', (c) => {
    c.poly([[11, 7], [14, 5], [18, 5], [21, 7], [22, 12], [19, 17], [13, 17], [10, 12]], C.rot4);
    c.rect(13, 7, 2, 3, C.rot6);
    c.rect(15, 3, 2, 3, C.holz3);
    c.rect(17, 3, 3, 2, C.gruen5);
  });

  icon(dir, 'schachtel', (c) => {
    c.rect(8, 7, 16, 10, C.holz5);
    c.rect(8, 7, 16, 2, C.holz6);
    c.frame(8, 7, 16, 10, C.holz3);
    c.rect(14, 7, 4, 10, C.sand1);
  });

  icon(dir, 'apfelschachtel', (c) => {
    c.poly([[12, 4], [15, 2], [18, 2], [21, 4], [21, 9], [12, 9]], C.rot4);
    c.rect(16, 1, 1, 2, C.holz3);
    c.rect(8, 7, 16, 10, C.holz5);
    c.rect(8, 7, 16, 2, C.holz6);
    c.frame(8, 7, 16, 10, C.holz3);
  });

  icon(dir, 'muenze', (c) => {
    c.poly([[13, 5], [19, 5], [22, 8], [22, 12], [19, 15], [13, 15], [10, 12], [10, 8]], C.gelb1);
    c.poly([[14, 6], [18, 6], [21, 9], [21, 11], [18, 14], [14, 14], [11, 11], [11, 9]], C.gelb2);
    c.rect(15, 8, 2, 4, C.gelb1);
  });

  icon(dir, 'keks', (c) => {
    c.poly([[13, 5], [19, 5], [23, 9], [23, 12], [19, 16], [13, 16], [9, 12], [9, 9]], C.holz6);
    for (const [x, y] of [[13, 8], [18, 7], [20, 11], [14, 12], [17, 13]] as const) {
      c.rect(x, y, 2, 2, C.holz2);
    }
  });

  // Vier schlichte Zusatzdinge, um das Blättern im Inventar zu prüfen.
  ['1', '2', '3', '4'].forEach((digit, i) => {
    icon(dir, `ding${digit}`, (c) => {
      const color = [C.tuerkis3, C.violett4, C.orange2, C.gruen4][i];
      c.rect(10, 4, 12, 12, color);
      c.frame(10, 4, 12, 12, C.schwarz);
      drawGlyph(c, digit, 14, 6, C.weiss);
    });
  });
}
