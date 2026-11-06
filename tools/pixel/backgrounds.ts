import { C } from './palette.ts';
import { Canvas, seeded } from './png.ts';

const FLOOR_Y = 88;

/** Dielen in Fluchtperspektive. */
function planks(c: Canvas, y0: number, ramp: readonly number[], lineColor: number): void {
  const h = c.h - y0;
  c.gradient(0, y0, c.w, h, ramp);
  const vx = c.w / 2;
  for (let i = -20; i <= 20; i++) {
    const xTop = vx + i * 22;
    const xBottom = vx + i * 44;
    c.line(xTop, y0, xBottom, c.h - 1, lineColor);
  }
  c.rect(0, y0, c.w, 1, lineColor);
}

/** Tisch als eigenes Sprite (Platz im Raum: x 124, y 88), damit Figuren dahinter laufen können. */
function tableSprite(): Canvas {
  const c = new Canvas(73, 30);
  c.poly([[8, 0], [64, 0], [72, 12], [0, 12]], C.holz6);
  c.rect(0, 12, 73, 3, C.holz5);
  c.rect(4, 15, 4, 15, C.holz3);
  c.rect(65, 15, 4, 15, C.holz3);
  c.rect(26, 15, 3, 8, C.holz3);
  c.rect(45, 15, 3, 8, C.holz3);
  return c;
}

export function buildBackgrounds(dir: string): void {
  // --- Testraum 1986: moderner Raum mit Tapete ---
  const a = new Canvas(320, 144, C.schwarz);
  a.gradient(0, 0, 320, FLOOR_Y, [C.tuerkis2, C.tuerkis3, C.tuerkis3, C.tuerkis2]);
  for (let x = 8; x < 320; x += 16) a.rect(x, 0, 1, FLOOR_Y, C.tuerkis2);
  a.rect(0, 0, 320, 6, C.grau2);
  a.rect(0, 6, 320, 1, C.grau1);
  a.rect(0, FLOOR_Y - 5, 320, 5, C.holz5);
  a.rect(0, FLOOR_Y - 5, 320, 1, C.holz6);
  planks(a, FLOOR_Y, [C.holz3, C.holz4, C.holz4, C.holz5], C.holz2);

  // Türöffnung (die Tür selbst ist ein eigenes Sprite)
  a.rect(26, 26, 38, 62, C.grau5);
  a.rect(29, 29, 32, 59, C.grau1);

  // Schalter
  a.rect(100, 50, 11, 14, C.grau6);
  a.frame(100, 50, 11, 14, C.grau3);
  a.rect(104, 53, 3, 8, C.rot4);

  // Bild an der Wand
  a.rect(140, 22, 44, 30, C.holz3);
  a.rect(142, 24, 40, 26, C.blau6);
  a.rect(142, 38, 40, 12, C.gruen5);
  a.poly([[150, 38], [160, 28], [170, 38]], C.grau4);

  // Schrank (die Türen sind eigene Sprites)
  a.rect(228, 24, 54, 64, C.holz2);
  a.frame(228, 24, 54, 64, C.holz1);
  a.rect(231, 28, 48, 28, C.holz1);
  a.rect(231, 58, 48, 26, C.holz1);
  a.rect(231, 56, 48, 2, C.holz3);

  a.save(`${dir}/backgrounds/testraum_1986.png`);
  tableSprite().save(`${dir}/backgrounds/sprites/tisch.png`);

  // --- Testraum 1885: derselbe Ort, ohne Tisch, Bretterwand und Laterne ---
  const b = new Canvas(320, 144, C.schwarz);
  b.gradient(0, 0, 320, FLOOR_Y, [C.holz1, C.holz2, C.holz3, C.holz2]);
  const rnd = seeded(1885);
  for (let y = 0; y < FLOOR_Y; y += 11) {
    b.rect(0, y, 320, 1, C.holz1);
    for (let x = Math.floor(rnd() * 40); x < 320; x += 30 + Math.floor(rnd() * 50)) {
      b.rect(x, y, 1, 11, C.holz1);
    }
  }
  planks(b, FLOOR_Y, [C.holz2, C.holz3, C.holz3, C.holz4], C.holz1);

  // Zugemauerte Türöffnung
  b.rect(26, 26, 38, 62, C.grau3);
  for (let y = 28; y < 88; y += 6) {
    b.rect(26, y, 38, 1, C.grau2);
    for (let x = 26 + ((y / 6) % 2) * 5; x < 64; x += 10) b.rect(x, y, 1, 6, C.grau2);
  }

  // Schalter aus Messing
  b.rect(100, 50, 11, 14, C.holz4);
  b.frame(100, 50, 11, 14, C.gelb1);
  b.rect(104, 53, 3, 8, C.gelb2);

  // Laterne mit Lichtschein
  b.rect(190, 20, 2, 12, C.grau1);
  b.rect(185, 32, 12, 16, C.gelb2);
  b.frame(185, 32, 12, 16, C.grau1);
  b.rect(189, 37, 4, 7, C.gelb3);
  b.rect(183, 30, 16, 2, C.grau1);
  b.save(`${dir}/backgrounds/testraum_1885.png`);

  // --- Testflur 1986: 480 breit, damit der Raum scrollt ---
  const f = new Canvas(480, 144, C.schwarz);
  f.gradient(0, 0, 480, FLOOR_Y, [C.grau3, C.grau4, C.grau4, C.grau3]);
  f.rect(0, 0, 480, 8, C.grau2);
  f.rect(0, FLOOR_Y - 4, 480, 4, C.grau2);
  planks(f, FLOOR_Y, [C.grau2, C.grau3, C.grau3, C.grau4], C.grau1);

  // Tür zurück in den Testraum
  f.rect(20, 28, 36, 60, C.holz3);
  f.frame(20, 28, 36, 60, C.holz1);
  f.rect(50, 58, 3, 3, C.gelb2);

  // Spinde
  for (let x = 120; x < 250; x += 26) {
    f.rect(x, 26, 24, 62, C.blau3);
    f.frame(x, 26, 24, 62, C.blau1);
    f.rect(x + 18, 54, 2, 7, C.grau6);
    f.rect(x + 6, 32, 12, 2, C.blau1);
    f.rect(x + 6, 36, 12, 2, C.blau1);
  }

  // Fenster am anderen Ende
  f.rect(390, 20, 60, 44, C.grau6);
  f.gradient(393, 23, 54, 38, [C.blau5, C.blau6, C.blau7, C.blau8]);
  f.rect(419, 23, 2, 38, C.grau6);
  f.rect(393, 41, 54, 2, C.grau6);
  f.save(`${dir}/backgrounds/testflur_1986.png`);

  // --- Hotspot-Sprites ---
  const doorClosed = new Canvas(32, 59, C.holz4);
  doorClosed.frame(0, 0, 32, 59, C.holz2);
  doorClosed.rect(5, 6, 22, 20, C.holz3);
  doorClosed.rect(5, 32, 22, 20, C.holz3);
  doorClosed.rect(26, 28, 3, 3, C.gelb2);
  doorClosed.save(`${dir}/backgrounds/sprites/tuer_zu.png`);

  const cabinetClosed = new Canvas(54, 64, C.holz3);
  cabinetClosed.frame(0, 0, 54, 64, C.holz1);
  cabinetClosed.rect(26, 1, 2, 62, C.holz1);
  cabinetClosed.rect(4, 5, 19, 54, C.holz4);
  cabinetClosed.rect(31, 5, 19, 54, C.holz4);
  cabinetClosed.rect(23, 32, 2, 5, C.gelb2);
  cabinetClosed.rect(29, 32, 2, 5, C.gelb2);
  cabinetClosed.save(`${dir}/backgrounds/sprites/schrank_zu.png`);

  const apple = new Canvas(9, 9);
  apple.poly([[1, 3], [3, 2], [6, 2], [8, 3], [8, 6], [6, 8], [3, 8], [1, 6]], C.rot4);
  apple.rect(3, 3, 1, 2, C.rot6);
  apple.rect(4, 0, 1, 2, C.holz2);
  apple.save(`${dir}/backgrounds/sprites/apfel.png`);

  const box = new Canvas(14, 9, C.holz5);
  box.frame(0, 0, 14, 9, C.holz3);
  box.rect(5, 0, 4, 9, C.sand1);
  box.save(`${dir}/backgrounds/sprites/schachtel.png`);

  const biscuit = new Canvas(8, 5);
  biscuit.poly([[2, 0], [5, 0], [7, 2], [5, 4], [2, 4], [0, 2]], C.holz6);
  biscuit.set(3, 2, C.holz2);
  biscuit.save(`${dir}/backgrounds/sprites/keks.png`);
}
