import { C } from './palette.ts';
import { Canvas } from './png.ts';
import { drawGlyph } from './schild.ts';

const W = 32;
const H = 20;

function icon(dir: string, name: string, paint: (c: Canvas) => void): void {
  const c = new Canvas(W, H);
  paint(c);
  c.save(`${dir}/items/${name}.png`);
}

export function buildItems(dir: string): void {
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
