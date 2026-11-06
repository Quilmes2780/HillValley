import { drawText } from '../pixel/schild.ts';
import { Canvas } from '../pixel/png.ts';
import { clamp01, fbm, grain, hex, mix, noise, Picture, shade, smooth, type RGB } from './painter.ts';

const W = 320;
const H = 144;
const INK: RGB = hex('#2e2016');
const INK_SOFT: RGB = hex('#5a4630');

/** Altes Papier: Fasern, Flecken, Knicke von einem oft gefalteten Plan. */
function paper(p: Picture): void {
  p.area(0, 0, W, H, (x, y) => {
    const big = fbm(x / 60, y / 40, 4, 3);
    const mid = fbm(x / 9, y / 9, 3, 5);
    const fibre = fbm(x / 1.5, y / 12, 2, 8);
    let c = mix(hex('#f1e4c2'), hex('#d8c294'), smooth(0.3, 0.75, big));
    c = shade(c, 0.94 + mid * 0.1 + (fibre - 0.5) * 0.06);
    // Ränder vergilben und bräunen
    const ex = Math.min(x, W - 1 - x);
    const ey = Math.min(y, H - 1 - y);
    const edge = Math.min(ex / 26, ey / 18);
    c = mix(hex('#8a6438'), c, smooth(0, 1, edge + (fbm(x / 14, y / 14, 3, 11) - 0.5) * 0.5));
    return c;
  });
  // Kaffeering
  for (let a = 0; a < 720; a++) {
    const t = (a / 720) * Math.PI * 2;
    const r = 15 + noise(t * 3, 2, 3) * 1.4;
    const x = 296 + Math.cos(t) * r;
    const y = 122 + Math.sin(t) * r * 0.92;
    p.blend(Math.round(x), Math.round(y), hex('#7a5430'), 0.05 + noise(t * 4, 5, 7) * 0.22);
  }
}

function folds(p: Picture): void {
  for (const x of [107, 213]) {
    p.area(x - 1, 0, 3, H, (px, py) => {
      const f = px === x - 1 ? 0.9 : px === x ? 1.1 : 0.96;
      return shade(p.get(px, py), f + (noise(py / 5, x, 3) - 0.5) * 0.04);
    });
  }
  p.area(0, 71, W, 3, (px, py) => {
    const f = py === 71 ? 0.92 : py === 72 ? 1.1 : 0.97;
    return shade(p.get(px, py), f);
  });
}

/** Aquarell: leicht ausgefranster Rand, Farbe sammelt sich an den Kanten. */
function wash(p: Picture, inside: (x: number, y: number) => number, color: RGB, alpha: number, seed: number): void {
  for (let y = 0; y < H; y++) {
    for (let x = 0; x < W; x++) {
      const d = inside(x + (fbm(x / 7, y / 7, 3, seed) - 0.5) * 7, y + (fbm(x / 7, y / 7, 3, seed + 5) - 0.5) * 7);
      if (d <= 0) continue;
      const pool = 1 - smooth(0, 5, d) * 0.45;
      const blot = 0.75 + fbm(x / 12, y / 12, 3, seed + 9) * 0.5;
      p.blend(x, y, color, alpha * pool * blot * smooth(0, 1.2, d));
    }
  }
}

const distToSegment = (x: number, y: number, x0: number, y0: number, x1: number, y1: number): number => {
  const dx = x1 - x0;
  const dy = y1 - y0;
  const t = clamp01(((x - x0) * dx + (y - y0) * dy) / (dx * dx + dy * dy));
  return Math.hypot(x - x0 - dx * t, y - y0 - dy * t);
};

// Der Fluss quert die Stadt unten als sanfter Bogen.
const RIVER: readonly (readonly [number, number])[] = [[-6, 120], [46, 124], [108, 132], [170, 127], [232, 117], [290, 112], [330, 104]];

function riverDist(x: number, y: number): number {
  let best = Infinity;
  for (let i = 0; i + 1 < RIVER.length; i++) {
    best = Math.min(best, distToSegment(x, y, RIVER[i][0], RIVER[i][1], RIVER[i + 1][0], RIVER[i + 1][1]));
  }
  return best;
}

function terrain(p: Picture): void {
  // Grünflächen und Wald
  const park = (x: number, y: number): number =>
    Math.max(
      16 - Math.hypot((x - 40) / 1.5, y - 40),
      19 - Math.hypot((x - 110) / 1.3, y - 16),
      14 - Math.hypot((x - 206) / 1.4, y - 118),
      22 - Math.hypot((x - 300) / 1.4, y - 70),
    );
  wash(p, park, hex('#7a9a56'), 0.42, 21);

  // Fluss: mehrere Lagen Blau, zur Mitte kräftiger
  wash(p, (x, y) => 5 - riverDist(x, y), hex('#6a9ab0'), 0.62, 31);
  wash(p, (x, y) => 2.4 - riverDist(x, y), hex('#3e6e8e'), 0.45, 33);
  for (let i = 0; i + 1 < RIVER.length; i++) {
    const [x0, y0] = RIVER[i];
    const [x1, y1] = RIVER[i + 1];
    p.line(x0, y0 - 4.6, x1, y1 - 4.6, INK_SOFT, 0.7, 0.8, 1.6, i + 1);
    p.line(x0, y0 + 4.6, x1, y1 + 4.6, INK_SOFT, 0.7, 0.8, 1.6, i + 9);
  }
  // Wellenlinien auf dem Wasser
  for (let i = 0; i < 26; i++) {
    const t = noise(i, 1, 4);
    const seg = Math.min(Math.floor(t * (RIVER.length - 1)), RIVER.length - 2);
    const f = t * (RIVER.length - 1) - seg;
    const x = RIVER[seg][0] + (RIVER[seg + 1][0] - RIVER[seg][0]) * f;
    const y = RIVER[seg][1] + (RIVER[seg + 1][1] - RIVER[seg][1]) * f + (noise(i, 3, 6) - 0.5) * 5;
    p.line(x, y, x + 3, y, hex('#274a64'), 0.6, 0.5);
  }

  // Höhenlinien oben links geben dem Blatt Geländegefühl
  for (const r of [10, 16, 22, 28]) {
    let lastX = 0;
    let lastY = 0;
    for (let a = 0; a <= 90; a++) {
      const t = (a / 90) * Math.PI * 2;
      const wob = 1 + (noise(Math.cos(t) * 2 + 3, Math.sin(t) * 2 + r, 7) - 0.5) * 0.4;
      const x = 40 + Math.cos(t) * r * 1.6 * wob;
      const y = 28 + Math.sin(t) * r * 0.8 * wob;
      if (a) p.line(lastX, lastY, x, y, INK_SOFT, 0.5, 0.35);
      lastX = x;
      lastY = y;
    }
  }

  // Baumsignaturen
  for (let i = 0; i < 90; i++) {
    const x = noise(i, 7, 1) * W;
    const y = noise(i, 11, 2) * H;
    if (park(x, y) <= 0) continue;
    const r = 1.6 + noise(i, 3, 5);
    p.glow(x - 0.5, y, r + 1, [-70, -55, -70], 0.8);
    p.blend(Math.round(x), Math.round(y + r), INK, 0.7);
    p.blend(Math.round(x - 1), Math.round(y - r), INK_SOFT, 0.5);
  }
}

interface Road {
  from: readonly [number, number];
  to: readonly [number, number];
  width: number;
}

const ROADS: readonly Road[] = [
  // Hauptstraße und Querachsen
  { from: [-4, 74], to: [326, 72], width: 5 },
  { from: [153, -4], to: [152, 148], width: 5 },
  { from: [62, 74], to: [60, 148], width: 3 },
  { from: [240, 73], to: [244, 122], width: 3 },
  { from: [263, 74], to: [262, 42], width: 3 },
  { from: [152, 54], to: [262, 54], width: 3 },
  { from: [152, 100], to: [326, 96], width: 3 },
  { from: [-4, 96], to: [152, 100], width: 3 },
  { from: [100, 74], to: [100, 12], width: 2.4 },
  { from: [100, 42], to: [152, 42], width: 2.4 },
  { from: [200, 54], to: [200, 118], width: 2.4 },
  { from: [14, 110], to: [152, 112], width: 2.4 },
  { from: [290, 72], to: [290, 12], width: 2.4 },
  { from: [200, 24], to: [290, 24], width: 2.4 },
];

function townBlocks(p: Picture): void {
  // Bebaute Viertel als Schraffur zwischen den Straßen
  const zones: readonly [number, number, number, number][] = [
    [104, 46, 44, 24],
    [156, 58, 40, 12],
    [204, 58, 34, 12],
    [156, 78, 40, 18],
    [204, 76, 34, 18],
    [8, 78, 50, 16],
    [66, 78, 80, 16],
    [66, 100, 80, 10],
    [246, 76, 66, 16],
    [204, 28, 56, 22],
    [266, 28, 22, 22],
  ];
  zones.forEach(([zx, zy, zw, zh], i) => {
    wash(p, (x, y) => Math.min(x - zx, zx + zw - x, y - zy, zy + zh - y), hex('#a08a68'), 0.2, 40 + i);
    // Kleine Häuserblöcke
    for (let by = zy + 2; by < zy + zh - 3; by += 6) {
      for (let bx = zx + 2; bx < zx + zw - 3; bx += 7) {
        if (noise(bx, by, 9) < 0.25) continue;
        const w = 3 + Math.floor(noise(bx, by, 2) * 3);
        const h = 2 + Math.floor(noise(bx, by, 4) * 2);
        p.area(bx, by, w, h, () => mix(hex('#7a5a3c'), hex('#5a4028'), noise(bx, by, 6)));
        p.area(bx, by + h, w, 1, (px, py) => mix(p.get(px, py), INK, 0.45));
        p.area(bx + w, by, 1, h, (px, py) => mix(p.get(px, py), INK, 0.3));
      }
    }
  });
}

function roads(p: Picture): void {
  // Erst Fläche in hellem Papier, dann Tuschekanten: So liegen Kreuzungen sauber.
  for (const r of ROADS) {
    const [x0, y0] = r.from;
    const [x1, y1] = r.to;
    p.line(x0, y0, x1, y1, hex('#f3e6c4'), r.width + 0.5, 1, 0.4, x0 + y0);
  }
  ROADS.forEach((r, i) => {
    const [x0, y0] = r.from;
    const [x1, y1] = r.to;
    const len = Math.hypot(x1 - x0, y1 - y0);
    const nx = (-(y1 - y0) / len) * (r.width / 2 + 0.3);
    const ny = ((x1 - x0) / len) * (r.width / 2 + 0.3);
    p.line(x0 + nx, y0 + ny, x1 + nx, y1 + ny, INK, 0.7, 0.8, 0.8, i * 3 + 1);
    p.line(x0 - nx, y0 - ny, x1 - nx, y1 - ny, INK, 0.7, 0.8, 0.8, i * 3 + 2);
  });
  // Kreuzungen wieder freilegen
  for (const r of ROADS) {
    const [x0, y0] = r.from;
    const [x1, y1] = r.to;
    p.line(x0, y0, x1, y1, hex('#efe0bc'), Math.max(1, r.width - 1.2), 0.9, 0.3, x0);
  }
  // Mittellinie auf der Hauptstraße
  for (let x = 4; x < W; x += 9) p.line(x, 73.6, x + 4, 73.5, INK_SOFT, 0.6, 0.5);
  // Eisenbahn am unteren Rand
  p.line(-4, 139, 326, 134, INK, 0.9, 0.9, 0.6, 7);
  for (let x = 2; x < W; x += 4) {
    const y = 139 - (x / 330) * 5;
    p.line(x, y - 1.6, x, y + 1.6, INK, 0.5, 0.7);
  }
  // Brücken über den Fluss
  p.area(149, 124, 7, 10, (x, y) => mix(p.get(x, y), hex('#e8d8b4'), 0.9));
  p.line(149, 124, 149, 134, INK, 0.8);
  p.line(156, 124, 156, 134, INK, 0.8);
  p.area(57, 120, 7, 10, (x, y) => mix(p.get(x, y), hex('#e8d8b4'), 0.9));
  p.line(57, 120, 57, 130, INK, 0.8);
  p.line(64, 120, 64, 130, INK, 0.8);
}

/** Kleine Federzeichnung eines Gebäudes, schräg von oben, mit Aquarellschatten. */
function landmarkShadow(p: Picture, pts: readonly (readonly [number, number])[]): void {
  p.softPoly(pts, hex('#3a2a18'), 0.35, 1.5);
}

function townHall(p: Picture): void {
  landmarkShadow(p, [[166, 62], [176, 66], [176, 42], [166, 38]]);
  // Hauptgebäude
  p.area(136, 46, 34, 16, (x, y) => mix(hex('#e6d2a8'), hex('#a8926c'), (x - 136) / 42 + fbm(x / 4, y / 4, 2, 3) * 0.2));
  p.line(136, 46, 170, 46, INK, 0.9);
  p.line(136, 62, 170, 62, INK, 0.9);
  p.line(136, 46, 136, 62, INK, 0.9);
  p.line(170, 46, 170, 62, INK, 0.9);
  for (let x = 139; x < 168; x += 5) {
    p.line(x, 50, x, 58, INK, 0.7, 0.8);
  }
  // Turm
  p.area(146, 20, 14, 28, (x, y) => mix(hex('#efdcb2'), hex('#a08a64'), (x - 146) / 16 + fbm(x / 3, y / 5, 2, 5) * 0.2));
  for (const [a, b, c, d] of [[146, 20, 146, 48], [160, 20, 160, 48], [146, 20, 160, 20]] as const) p.line(a, b, c, d, INK, 0.9);
  p.poly([[144, 20], [153, 9], [162, 20]], (x, y) => mix(hex('#6a8a6e'), hex('#3e5a48'), (x - 144) / 18 + (y - 9) * 0.01));
  p.line(144, 20, 153, 9, INK, 0.9);
  p.line(153, 9, 162, 20, INK, 0.9);
  p.line(144, 20, 162, 20, INK, 0.9);
  // Zifferblatt
  for (let a = 0; a < 40; a++) {
    const t = (a / 40) * Math.PI * 2;
    p.blend(Math.round(153 + Math.cos(t) * 4.5), Math.round(29 + Math.sin(t) * 4.5), INK, 0.85);
  }
  p.area(150, 26, 7, 7, (x, y) => (Math.hypot(x - 153, y - 29) < 4 ? hex('#fff6d8') : p.get(x, y)));
  p.line(153, 29, 153, 26, INK, 0.7);
  p.line(153, 29, 156, 29, INK, 0.7);
}

function school(p: Picture): void {
  landmarkShadow(p, [[278, 44], [288, 47], [288, 28], [278, 24]]);
  p.area(242, 26, 42, 18, (x, y) => mix(hex('#b65a44'), hex('#7a3628'), (x - 242) / 48 + fbm(x / 3, y / 3, 2, 4) * 0.25));
  p.poly([[240, 26], [263, 17], [286, 26]], (x) => mix(hex('#6a6a70'), hex('#3e3e48'), (x - 240) / 46));
  for (const [a, b, c, d] of [[242, 26, 242, 44], [284, 26, 284, 44], [242, 44, 284, 44], [240, 26, 286, 26], [240, 26, 263, 17], [263, 17, 286, 26]] as const) {
    p.line(a, b, c, d, INK, 0.9);
  }
  for (let x = 246; x < 282; x += 6) {
    if (x > 257 && x < 268) continue;
    p.area(x, 31, 3, 7, () => hex('#e8e2c0'));
    p.line(x, 31, x, 38, INK, 0.5, 0.7);
    p.line(x + 3, 31, x + 3, 38, INK, 0.5, 0.7);
  }
  p.area(259, 34, 8, 10, () => hex('#3a2418'));
  p.line(263, 17, 263, 11, INK, 0.7);
  p.poly([[263, 11], [269, 13], [263, 15]], hex('#b84030'));
}

function house(p: Picture): void {
  landmarkShadow(p, [[76, 110], [84, 113], [84, 96], [76, 92]]);
  p.area(46, 92, 30, 18, (x, y) => mix(hex('#efe6cc'), hex('#b8a888'), (x - 46) / 34 + fbm(x / 3, y / 3, 2, 8) * 0.15));
  p.poly([[42, 92], [61, 80], [80, 92]], (x, y) => mix(hex('#a84a3a'), hex('#6a2820'), (x - 42) / 40 + ((y % 3) === 0 ? 0.12 : 0)));
  for (const [a, b, c, d] of [[46, 92, 46, 110], [76, 92, 76, 110], [46, 110, 76, 110], [42, 92, 80, 92], [42, 92, 61, 80], [61, 80, 80, 92]] as const) {
    p.line(a, b, c, d, INK, 0.9);
  }
  p.area(58, 100, 6, 10, () => hex('#7a2c20'));
  p.line(58, 100, 58, 110, INK, 0.6);
  p.line(64, 100, 64, 110, INK, 0.6);
  for (const x of [49, 68]) {
    p.area(x, 97, 5, 5, () => hex('#a8c6d0'));
    p.line(x, 97, x + 5, 97, INK, 0.6);
    p.line(x, 102, x + 5, 102, INK, 0.6);
    p.line(x, 97, x, 102, INK, 0.6);
    p.line(x + 5, 97, x + 5, 102, INK, 0.6);
  }
  p.area(70, 81, 3, 7, () => hex('#6a2820'));
  p.line(70, 81, 70, 87, INK, 0.6);
}

function lab(p: Picture): void {
  landmarkShadow(p, [[258, 121], [266, 124], [266, 106], [258, 102]]);
  p.area(226, 102, 32, 19, (x, y) => mix(hex('#9aa0a0'), hex('#5e666a'), (x - 226) / 36 + fbm(x / 3, y / 3, 2, 9) * 0.2));
  p.poly([[224, 102], [242, 93], [260, 102]], (x) => mix(hex('#5a5a62'), hex('#34343c'), (x - 224) / 36));
  for (const [a, b, c, d] of [[226, 102, 226, 121], [258, 102, 258, 121], [226, 121, 258, 121], [224, 102, 260, 102], [224, 102, 242, 93], [242, 93, 260, 102]] as const) {
    p.line(a, b, c, d, INK, 0.9);
  }
  p.area(238, 110, 8, 11, () => hex('#2a2628'));
  for (const x of [230, 250]) {
    p.area(x, 106, 5, 5, () => hex('#f4d67a'));
    p.line(x, 106, x + 5, 106, INK, 0.6);
    p.line(x, 111, x + 5, 111, INK, 0.6);
    p.line(x, 106, x, 111, INK, 0.6);
    p.line(x + 5, 106, x + 5, 111, INK, 0.6);
  }
  // Antenne: Hier wohnt jemand, den man besser nicht besucht, wenn der Strom ausfällt.
  p.line(252, 98, 252, 88, INK, 0.7);
  p.line(248, 90, 256, 90, INK, 0.6);
  p.line(249, 92, 255, 92, INK, 0.6);
}

function scaledText(p: Picture, text: string, x: number, y: number, c: RGB, scale: number): void {
  const t = new Canvas(120, 12);
  drawText(t, text, 0, 0, 1);
  for (let ty = 0; ty < t.h; ty++) {
    for (let tx = 0; tx < t.w; tx++) {
      if (t.get(tx, ty) !== 1) continue;
      for (let sy = 0; sy < scale; sy++) {
        for (let sx = 0; sx < scale; sx++) p.blend(x + tx * scale + sx, y + ty * scale + sy, c, 0.92);
      }
    }
  }
}

function cartouche(p: Picture): void {
  for (const [a, b, c, d] of [[8, 7, 82, 7], [82, 7, 82, 25], [82, 25, 8, 25], [8, 25, 8, 7]] as const) p.line(a, b, c, d, INK, 0.5, 0.7);

  // Windrose
  const cx = 298;
  const cy = 22;
  for (let a = 0; a < 60; a++) {
    const t = (a / 60) * Math.PI * 2;
    p.blend(Math.round(cx + Math.cos(t) * 10), Math.round(cy + Math.sin(t) * 10), INK, 0.6);
  }
  p.poly([[cx, cy - 13], [cx + 2.4, cy], [cx - 2.4, cy]], hex('#6e1e16'));
  p.poly([[cx, cy + 13], [cx + 2.4, cy], [cx - 2.4, cy]], INK);
  p.poly([[cx - 11, cy], [cx, cy - 2], [cx, cy + 2]], INK_SOFT);
  p.poly([[cx + 11, cy], [cx, cy - 2], [cx, cy + 2]], INK_SOFT);
  scaledText(p, 'N', cx - 2, cy - 22, INK, 1);

  // Maßstab
  for (let i = 0; i < 4; i++) {
    p.area(12 + i * 9, 131, 9, 2, () => (i % 2 ? hex('#efe0bc') : INK));
  }
  p.line(12, 131, 48, 131, INK, 0.5);
  p.line(12, 133, 48, 133, INK, 0.5);
}

/** Federzeichnung eines einfachen Hauses mit Satteldach, für die Pläne der alten Zeit. */
function inkHouse(p: Picture, x: number, y: number, w: number, h: number, wall: RGB, roof: RGB, seed: number): void {
  landmarkShadow(p, [[x + w, y + h], [x + w + 6, y + h + 2], [x + w + 6, y + 2], [x + w, y]]);
  p.area(x, y, w, h, (px, py) => mix(wall, shade(wall, 0.68), (px - x) / (w + 4) + fbm(px / 3, py / 3, 2, seed) * 0.2));
  const top = y - h * 0.55;
  p.poly([[x - 3, y], [x + w / 2, top], [x + w + 3, y]], (px, py) => mix(roof, shade(roof, 0.62), (px - x) / (w + 6) + ((py % 3) === 0 ? 0.1 : 0)));
  for (const [a, b, c, d] of [[x, y, x, y + h], [x + w, y, x + w, y + h], [x, y + h, x + w, y + h], [x - 3, y, x + w + 3, y], [x - 3, y, x + w / 2, top], [x + w / 2, top, x + w + 3, y]] as const) {
    p.line(a, b, c, d, INK, 0.9);
  }
  p.area(x + w / 2 - 2, y + h - 7, 5, 7, () => shade(wall, 0.3));
  for (const wx of [x + 3, x + w - 6]) p.area(wx, y + 3, 3, 4, () => hex('#a8c6d0'));
}

/** Docs Villa: breit, zwei Giebel, Säulen. Liegt 1955 dort, wo 1986 Martys Haus steht. */
function villa(p: Picture): void {
  inkHouse(p, 44, 94, 38, 22, hex('#e8dcc0'), hex('#7a4a38'), 90);
  for (let x = 48; x < 80; x += 6) p.line(x, 96, x, 116, INK, 0.5, 0.7);
  p.line(82, 90, 82, 80, INK, 0.7);
  p.poly([[82, 80], [88, 82], [82, 84]], hex('#b84030'));
}

function stamp(p: Picture, x: number, y: number): void {
  p.softPoly([[x + 1, y + 1], [x + 23, y + 1], [x + 23, y + 13], [x + 1, y + 13]], hex('#2a1408'), 0.3, 1);
  p.area(x, y, 22, 12, (px, py) => mix(hex('#a81c1c'), hex('#5e1014'), fbm(px / 5, py / 3, 3, 91)));
  for (const [a, b, c, d] of [[x, y, x + 22, y], [x, y + 11, x + 22, y + 11], [x, y, x, y + 12], [x + 21, y, x + 21, y + 12]] as const) p.line(a, b, c, d, hex('#e8c060'), 0.7);
  scaledText(p, 'T', x + 9, y, hex('#ffe08a'), 1);
}

function title(p: Picture, top: string, bottom: string, c: RGB): void {
  p.softPoly([[7, 7], [86, 7], [86, 29], [7, 29]], hex('#3a2a18'), 0.25, 2);
  p.area(6, 5, 78, 22, (x, y) => mix(hex('#f6e9c8'), hex('#dcc69a'), fbm(x / 8, y / 6, 3, 60)));
  for (const [a, b, d, e] of [[6, 5, 84, 5], [84, 5, 84, 27], [84, 27, 6, 27], [6, 27, 6, 5]] as const) p.line(a, b, d, e, INK, 1);
  scaledText(p, top, 45 - top.length * 3, 9, c, 1);
  scaledText(p, bottom, 45 - bottom.length * 3, 17, INK, 1);
}

/** 1885: noch keine Stadt, eher ein Versprechen. Ein paar Wege, ein Gleis, die Baustelle. */
function plan1885(p: Picture): void {
  // Sandfarbene Lavur statt Grün
  p.grade((c, x, y) => mix(c, hex('#d8b080'), 0.16 + fbm(x / 34, y / 22, 3, 92) * 0.12));
  wash(p, (x, y) => 5 - riverDist(x, y), hex('#7aa0a8'), 0.52, 93);
  for (const [[x0, y0], [x1, y1]] of [[[-4, 72], [326, 70]], [[153, -4], [152, 92]], [[72, 72], [72, 46]], [[52, 72], [52, 90]], [[232, 72], [232, 52]], [[240, 72], [240, 106]]] as const) {
    p.line(x0, y0, x1, y1, hex('#f0dcb0'), 4, 1, 1.4, x0 + 3);
    p.line(x0 + 1, y0 + 2.5, x1 + 1, y1 + 2.5, INK_SOFT, 0.6, 0.7, 1.4, x0 + 4);
    p.line(x0 + 1, y0 - 2.5, x1 + 1, y1 - 2.5, INK_SOFT, 0.6, 0.7, 1.4, x0 + 5);
  }
  // Gleis, Wasserturm, Kakteen
  p.line(196, 110, 326, 104, INK, 1.1, 0.9, 0.4, 8);
  for (let x = 198; x < W; x += 4) {
    const y = 110 - ((x - 196) / 130) * 6;
    p.line(x, y - 2, x, y + 2, INK, 0.6, 0.8);
  }
  p.area(232, 96, 8, 7, () => hex('#a87a48'));
  p.line(232, 96, 240, 96, INK, 0.8);
  p.line(233, 103, 233, 108, INK, 0.7);
  p.line(239, 103, 239, 108, INK, 0.7);
  for (let i = 0; i < 40; i++) {
    const x = noise(i, 41, 2) * W;
    const y = 8 + noise(i, 43, 2) * 124;
    if (Math.abs(y - 71) < 10 || riverDist(x, y) < 10) continue;
    p.line(x, y, x, y - 3, hex('#4a6a3a'), 0.8, 0.8);
    p.line(x - 1.5, y - 1.5, x + 1.5, y - 1.5, hex('#4a6a3a'), 0.6, 0.7);
  }
  // Baustelle mit Gerüst
  p.area(146, 30, 14, 24, (x, y) => mix(hex('#efdcb2'), hex('#a08a64'), (x - 146) / 16 + fbm(x / 3, y / 4, 2, 94) * 0.2));
  for (const x of [132, 146, 160, 174]) p.line(x, 54, x, 18, INK, 0.8);
  for (const y of [22, 38]) p.line(128, y, 178, y, INK, 0.8);
  p.line(132, 54, 146, 22, INK_SOFT, 0.6);
  p.line(174, 54, 160, 22, INK_SOFT, 0.6);
  // Saloon, Schmiede, Mietstall
  inkHouse(p, 54, 40, 38, 20, hex('#b88a58'), hex('#6a3e24'), 95);
  inkHouse(p, 218, 42, 26, 20, hex('#8a6a4a'), hex('#3e2c20'), 96);
  p.area(238, 28, 3, 12, () => hex('#3a2a20'));
  p.glow(239, 24, 6, hex('#907050'), 0.2);
  inkHouse(p, 32, 84, 42, 22, hex('#a87a48'), hex('#7a4a2c'), 97);
  p.area(44, 96, 18, 10, () => hex('#2a1a10'));
}

export type PlanFassung = 'hill_valley' | 'tannen' | '1955' | '1885';

export function paintStadtplan(fassung: PlanFassung = 'hill_valley'): Picture {
  const p = new Picture(W, H);
  paper(p);
  terrain(p);
  if (fassung === '1885') {
    plan1885(p);
    title(p, 'HILL VALLEY', '1885', hex('#6e1e16'));
  } else {
    townBlocks(p);
    roads(p);
    townHall(p);
    school(p);
    if (fassung === '1955') {
      villa(p);
      title(p, 'HILL VALLEY', '1955', hex('#1e5e5a'));
    } else {
      house(p);
      lab(p);
      if (fassung === 'tannen') title(p, 'TANNENBURG', 'STADTPLAN', hex('#8a1c1c'));
      else title(p, 'HILL VALLEY', 'STADTPLAN', hex('#6e1e16'));
    }
    if (fassung === 'tannen') {
      // Überall Tannen-Werbung und Fabrikruß über dem Blatt
      p.grade((c, x, y) => mix(c, hex('#6a5a50'), 0.2 + smooth(0.45, 0.8, fbm(x / 40, y / 22, 4, 98)) * 0.26));
      p.grade((c) => shade(c, 0.9));
      for (const [x, y] of [[84, 44], [188, 80], [100, 96]] as const) stamp(p, x, y);
    }
  }
  cartouche(p);
  folds(p);
  p.vignette(0.3, hex('#3a2410'));
  p.grade((c, x, y) => {
    const g = grain(x, y, 3) * 2.5;
    return [c[0] + g, c[1] + g, c[2] + g];
  });
  return p;
}
