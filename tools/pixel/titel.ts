import { drawText } from './font.ts';
import { C } from './palette.ts';
import { Canvas, seeded } from './png.ts';

function bigText(c: Canvas, text: string, x: number, y: number, color: number, shade: number, scale: number): void {
  const temp = new Canvas(200, 12);
  drawText(temp, text, 0, 0, 1);
  for (let ty = 0; ty < temp.h; ty++) {
    for (let tx = 0; tx < temp.w; tx++) {
      if (temp.get(tx, ty) !== 1) continue;
      c.rect(x + tx * scale + 1, y + ty * scale + 1, scale, scale, shade);
    }
  }
  for (let ty = 0; ty < temp.h; ty++) {
    for (let tx = 0; tx < temp.w; tx++) {
      if (temp.get(tx, ty) === 1) c.rect(x + tx * scale, y + ty * scale, scale, scale, color);
    }
  }
}

/** Titelbild: der Turm bei Nacht, ein Blitz, die vier Zeiten als Lichtstreifen. */
export function buildTitle(dir: string): void {
  const c = new Canvas(320, 200, C.schwarz);
  c.gradient(0, 0, 320, 136, [C.blau1, C.violett1, C.violett2, C.pink1, C.orange1]);
  const rnd = seeded(1985);
  for (let i = 0; i < 70; i++) c.set(Math.floor(rnd() * 320), Math.floor(rnd() * 70), i % 5 === 0 ? C.gelb3 : C.grau6);

  // Stadt
  for (let x = 0; x < 320; x += 18) {
    const h = 8 + Math.floor(rnd() * 20);
    c.rect(x, 136 - h, 18, h, C.schwarz);
    if (x % 36 === 0) c.rect(x + 6, 136 - h + 3, 3, 3, C.gelb2);
  }

  // Turm rechts, Platz für den Schriftzug links
  c.rect(214, 42, 48, 94, C.grau1);
  c.frame(214, 42, 48, 94, C.grau3);
  c.poly([[210, 42], [238, 18], [266, 42]], C.grau2);
  c.poly([[226, 52], [250, 52], [256, 60], [256, 76], [250, 84], [226, 84], [220, 76], [220, 60]], C.gelb3);
  c.line(238, 68, 238, 56, C.schwarz);
  c.line(238, 68, 247, 68, C.schwarz);
  c.rect(236, 66, 4, 4, C.schwarz);

  // Blitz in die Turmspitze
  c.poly([[306, 0], [276, 16], [286, 18], [240, 24], [290, 10], [280, 8], [316, 0]], C.gelb3);
  c.poly([[308, 0], [282, 12], [288, 14], [254, 20], [284, 12], [278, 10], [312, 0]], C.weiss);

  // Die vier Zeitebenen als Lichtstreifen
  const stripes = [C.holz5, C.tuerkis4, C.blau5, C.pink3];
  stripes.forEach((color, i) => c.rect(0, 136 + i, 320, 1, color));

  bigText(c, 'HILL VALLEY', 18, 40, C.gelb2, C.rot2, 2);
  bigText(c, 'PARADOX', 18, 62, C.neon, C.blau2, 2);
  c.save(`${dir}/ui/title.png`);
}
