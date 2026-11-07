import { textWidth } from '../pixel/schild.ts';
import { paintText, type Stil } from './schrift.ts';
import { clamp01, fbm, grain, hex, mix, noise, Picture, ramp, shade, smooth, type RGB } from './painter.ts';

export const W = 320;
export const H = 144;
export type Mat = (x: number, y: number) => RGB;

// --- Materialien ----------------------------------------------------------------------------

export const stone = (base: RGB, bw = 10, bh = 5, seed = 1): Mat => (x, y) => {
  const row = Math.floor(y / bh);
  const off = row % 2 ? bw / 2 : 0;
  const bx = Math.floor((x + off) / bw);
  const fx = (x + off) % bw;
  const fy = y % bh;
  const tint = 0.9 + noise(bx, row, seed) * 0.2;
  const weather = 0.82 + fbm(x / 9, y / 6, 4, seed + 3) * 0.32;
  const streak = 0.92 + (fbm(x / 2.6, y / 30, 3, seed + 7) - 0.5) * 0.3;
  let f = tint * weather * streak;
  if (fx < 1 || fy < 1) f *= 0.7;
  else if (fy === 1) f *= 1.07;
  return shade(base, f);
};

export const brick = (base: RGB, seed = 2): Mat => stone(base, 7, 3, seed);

export const wood = (base: RGB, vertical = false, seed = 3): Mat => (x, y) => {
  const [a, b] = vertical ? [x, y] : [y, x];
  const grainV = fbm(a / 1.3, b / 22, 3, seed);
  const knot = smooth(0.72, 0.8, fbm(a / 6, b / 9, 2, seed + 4));
  return shade(base, 0.76 + grainV * 0.46 - knot * 0.22);
};

export const planks = (base: RGB, spacing = 10, vertical = true, seed = 4): Mat => (x, y) => {
  const a = vertical ? x : y;
  const idx = Math.floor(a / spacing);
  const c = wood(shade(base, 0.86 + noise(idx, 1, seed) * 0.28), vertical, seed + idx)(x, y + idx * 7);
  return a % spacing < 1 ? shade(c, 0.45) : c;
};

export const plaster = (base: RGB, seed = 5): Mat => (x, y) =>
  shade(base, 0.88 + fbm(x / 14, y / 10, 4, seed) * 0.2 + grain(x, y, seed) * 0.012);

export const wallpaper = (a: RGB, b: RGB, spacing = 12, seed = 6): Mat => (x, y) => {
  const base = plaster(mix(a, b, 0.5 + 0.5 * Math.sin((x / spacing) * Math.PI * 2)), seed)(x, y);
  // Blassere, regelmäßige Ornamente
  const ox = x % spacing;
  const oy = (y + (Math.floor(x / spacing) % 2) * 5) % 10;
  return Math.hypot(ox - spacing / 2, oy - 5) < 1.6 ? shade(base, 1.1) : base;
};

export const metal = (base: RGB, seed = 7): Mat => (x, y) =>
  shade(base, 0.82 + fbm(x / 3, y / 20, 3, seed) * 0.36);

export const paint = (base: RGB, seed = 8): Mat => (x, y) =>
  shade(base, 0.92 + fbm(x / 8, y / 8, 3, seed) * 0.14);

export const solid = (c: RGB): Mat => () => c;

// --- Böden (perspektivisch, Fluchtpunkt mittig über dem Horizont) --------------------------------

const persp = (x: number, y: number, floorY: number): [number, number, number] => {
  const dy = Math.max(1, y - floorY + 22);
  return [((x - 160) / dy) * 22, 500 / dy, clamp01((y - floorY) / (H - floorY))];
};

export const woodFloor = (base: RGB, floorY = 88, seed = 11): Mat => (x, y) => {
  const [u, v] = persp(x, y, floorY);
  const plank = Math.floor(u / 8);
  const c = shade(base, 0.82 + noise(plank, 2, seed) * 0.34);
  const f = 0.86 + fbm(u / 2, v * 3, 3, seed + plank) * 0.28;
  // Fuge dort, wo sich das Brett zum Nachbarpixel ändert: ergibt durchgehende Linien statt Punkte.
  const [uR] = persp(x + 1, y, floorY);
  const [uD] = persp(x, y + 1, floorY);
  const seam = Math.floor(uR / 8) !== plank || Math.floor(uD / 8) !== plank;
  const [, vD] = persp(x, y + 1, floorY);
  const joint = Math.floor(vD * 0.55 + plank * 0.37) !== Math.floor(v * 0.55 + plank * 0.37);
  return shade(c, seam ? f * 0.62 : joint ? f * 0.74 : f);
};

export const checkerFloor = (a: RGB, b: RGB, floorY = 88, seed = 12): Mat => (x, y) => {
  const [u, v] = persp(x, y, floorY);
  const on = (Math.floor(u / 16) + Math.floor(v * 0.42)) % 2 === 0;
  return shade(on ? a : b, 0.88 + fbm(x / 8, y / 5, 3, seed) * 0.22);
};

export const carpet = (base: RGB, floorY = 88, seed = 13): Mat => (x, y) => {
  const d = clamp01((y - floorY) / (H - floorY));
  return shade(base, 0.82 + fbm(x / 4, y / 2, 3, seed) * 0.22 + d * 0.12 + grain(x, y, seed) * 0.03);
};

export const concrete = (base: RGB, floorY = 88, seed = 14): Mat => (x, y) => {
  const d = clamp01((y - floorY) / (H - floorY));
  const stain = smooth(0.55, 0.72, fbm(x / 26, y / 8, 4, seed));
  return shade(base, 0.8 + fbm(x / 7, y / 3, 3, seed + 2) * 0.22 + d * 0.14 - stain * 0.16);
};

export const cobbles = (base: RGB, horizon = 92, seed = 15): Mat => (x, y) => {
  const dy = Math.max(1, y - horizon + 28);
  const u = ((x - 150) / dy) * 8.5;
  const v = 170 / dy;
  const row = Math.floor(v * 3);
  const col = Math.floor(u + (row % 2) * 0.5);
  const fu = u + (row % 2) * 0.5 - col;
  const fv = v * 3 - row;
  const tone = 0.8 + noise(col, row, seed) * 0.42;
  return shade(base, fu < 0.1 || fv < 0.14 ? tone * 0.6 : tone);
};

export const dirt = (a: RGB, b: RGB, horizon = 92, seed = 16): Mat => (x, y) => {
  const dy = Math.max(2, y - horizon + 6);
  const n = fbm(x / (2 + dy / 6), y / (0.8 + dy / 16), 4, seed);
  const pebble = hash01(x, y, seed) > 0.985 ? 0.76 : 1;
  return shade(mix(a, b, smooth(0.25, 0.75, n)), pebble);
};

const hash01 = (x: number, y: number, seed: number): number => (grain(x, y, seed) + 1) / 2;

export const asphalt = (base: RGB, horizon = 92, seed = 17): Mat => (x, y) => {
  const dy = y - horizon;
  return shade(base, 0.82 + fbm(x / (2 + dy / 8), y / 1.4, 3, seed) * 0.24 + grain(x, y, seed) * 0.05);
};

export const lawn = (a: RGB, b: RGB, horizon = 92, seed = 18): Mat => (x, y) => {
  const d = clamp01((y - horizon) / (H - horizon));
  const blade = fbm(x / 1.1, y / (2.2 + d * 3), 2, seed);
  const patch = fbm(x / 22, y / 7, 3, seed + 3);
  return shade(mix(a, b, smooth(0.3, 0.7, patch)), 0.72 + blade * 0.56);
};

// --- Bausteine ------------------------------------------------------------------------------

export interface Box {
  /** Lichtrichtung als Stärke: >0 links hell, <0 rechts hell. */
  light?: number;
  /** Heller Saum oben und links. */
  rim?: RGB;
  dark?: RGB;
}

/** Fläche mit Körper: Licht quer darüber, helle Kante oben, dunkle Kante rechts und unten. */
export function box(p: Picture, x: number, y: number, w: number, h: number, mat: Mat, o: Box = {}): void {
  const light = o.light ?? 0.25;
  p.area(x, y, w, h, (px, py) => {
    const t = (px - x) / Math.max(1, w - 1) - 0.5;
    return shade(mat(px, py), 1 - t * light * 2);
  });
  const rim = o.rim ?? shade(mat(x, y), 1.35);
  const dark = o.dark ?? shade(mat(x, y), 0.45);
  p.area(x, y, w, 1, (px, py) => mix(p.get(px, py), rim, 0.8));
  p.area(x, y, 1, h, (px, py) => mix(p.get(px, py), rim, 0.45));
  p.area(x, y + h - 1, w, 1, (px, py) => mix(p.get(px, py), dark, 0.8));
  p.area(x + w - 1, y, 1, h, (px, py) => mix(p.get(px, py), dark, 0.7));
}

/** Weicher Kontaktschatten unter Dingen auf dem Boden. */
export function contact(p: Picture, x: number, y: number, w: number, strength = 0.45, depth = 5): void {
  p.softPoly([[x, y], [x + w, y], [x + w + depth, y + depth], [x + depth, y + depth]], hex('#0c0810'), strength, 2.5);
}

export interface RoomOpts {
  wall: Mat;
  floor: Mat;
  floorY?: number;
  skirt?: RGB;
  /** Farbe, zu der die Wand nach oben hin abfällt. */
  ceiling?: RGB;
  ceilingAmount?: number;
}

/** Wand und Boden, mit dunklerer Decke und Schatten entlang der Sockelleiste. */
export function room(p: Picture, o: RoomOpts): void {
  const floorY = o.floorY ?? 88;
  p.area(0, 0, W, floorY, (x, y) => {
    const c = o.wall(x, y);
    const ceil = smooth(26, 0, y) * (o.ceilingAmount ?? 0.55);
    return o.ceiling ? mix(c, o.ceiling, ceil) : shade(c, 1 - ceil * 0.7);
  });
  p.area(0, floorY, W, H - floorY, o.floor);
  if (o.skirt) {
    p.area(0, floorY - 5, W, 5, (x, y) => shade(o.skirt!, 0.88 + fbm(x / 7, y, 2, 3) * 0.24));
    p.area(0, floorY - 5, W, 1, () => shade(o.skirt!, 1.3));
  }
  // Boden nahe der Wand liegt im Schatten
  p.area(0, floorY, W, 8, (x, y) => mix(p.get(x, y), hex('#0c0810'), (1 - (y - floorY) / 8) * 0.34));
}

export function door(p: Picture, x: number, y: number, w: number, h: number, mat: Mat, frame: RGB, light = 0.2): void {
  box(p, x - 3, y - 3, w + 6, h + 3, paint(frame), { light });
  box(p, x, y, w, h, mat, { light });
  const pw = w - 8;
  for (const [py, ph] of [[y + 5, h * 0.36], [y + h * 0.5, h * 0.42]] as const) {
    p.area(x + 4, py, pw, ph, (px, qy) => shade(p.get(px, qy), 0.74));
    p.area(x + 4, py, pw, 1, (px, qy) => shade(p.get(px, qy), 0.55));
    p.area(x + 4, py + ph - 1, pw, 1, (px, qy) => shade(p.get(px, qy), 1.35));
  }
  p.area(x + w - 5, y + h / 2 - 1, 2, 3, () => hex('#f0d070'));
  p.set(x + w - 5, y + h / 2 + 1, hex('#8a6a2a'));
}

export interface WindowOpts {
  sky: readonly RGB[];
  frame: RGB;
  view?: Mat;
  cols?: number;
  rows?: number;
}

/** Fenster mit Blick nach draußen und tiefem Rahmen. */
export function pane(p: Picture, x: number, y: number, w: number, h: number, o: WindowOpts): void {
  box(p, x - 2, y - 2, w + 4, h + 4, paint(o.frame), { light: 0.15 });
  p.area(x, y, w, h, (px, py) => {
    const c = ramp(o.sky, (py - y) / h);
    return o.view ? mix(c, o.view(px, py), 1) : c;
  });
  const cols = o.cols ?? 2;
  const rows = o.rows ?? 2;
  for (let i = 1; i < cols; i++) p.area(x + (w * i) / cols, y, 2, h, () => shade(o.frame, 0.9));
  for (let i = 1; i < rows; i++) p.area(x, y + (h * i) / rows, w, 2, () => shade(o.frame, 0.95));
  // Spiegelnde Schräge
  p.line(x + w * 0.2, y + h * 0.9, x + w * 0.55, y + h * 0.1, hex('#ffffff'), 1.6, 0.14);
}

/** Bücherreihe in gedämpften Farben. */
export function books(p: Picture, x: number, y: number, w: number, h: number, seed = 1): void {
  const palette = ['#7a2a24', '#2c4a6c', '#3a5a34', '#8a6a2c', '#4a2c54', '#6c6058', '#a08048', '#2a3a3a'].map(hex);
  let bx = x;
  let i = 0;
  while (bx < x + w - 1) {
    const bw = 2 + Math.floor(noise(i, seed, 2) * 3);
    const bh = Math.floor(h * (0.62 + noise(i, seed, 5) * 0.38));
    if (noise(i, seed, 9) > 0.13) {
      const c = palette[Math.floor(noise(i, seed, 7) * palette.length * 0.999)];
      p.area(bx, y + h - bh, bw, bh, (px, py) => {
        const f = px === bx ? 1.25 : px === bx + bw - 1 ? 0.7 : 1;
        const band = (py - (y + h - bh)) === 2 ? 1.5 : 1;
        return shade(c, f * band * (0.86 + fbm(px, py / 4, 2, seed) * 0.28));
      });
    } else bx += 2;
    bx += bw;
    i++;
  }
}

/** Schreibt Eigennamen auf Schilder, gemalt und passend zur Breite des Schilds. */
export function lettering(p: Picture, text: string, x: number, y: number, c: RGB, glowC?: RGB, glowS = 0, stil: Stil = 'antiqua'): void {
  paintText(p, text, { x, y: y + 1, h: 7, maxW: textWidth(text) + 1, center: true, stil, color: c, glow: glowC, glowStrength: glowS });
}

export interface SkyOpts {
  stops: readonly RGB[];
  horizon?: number;
  /** Wolkenanteil: höher = weniger Wolken */
  cover?: number;
  cloud?: readonly [RGB, RGB];
  cloudAlpha?: number;
  seed?: number;
}

export function sky(p: Picture, o: SkyOpts): void {
  const horizon = o.horizon ?? 92;
  const seed = o.seed ?? 11;
  const cover = o.cover ?? 0.5;
  const [shadowC, litC] = o.cloud ?? [hex('#6a6a80'), hex('#ffffff')];
  p.area(0, 0, W, horizon + 2, (x, y) => {
    const t = y / horizon;
    let c = ramp(o.stops, t);
    const band = fbm(x / 70, y / 16 + 3, 5, seed);
    const cloud = smooth(cover, cover + 0.22, band) * (1 - t * 0.5);
    if (cloud > 0) {
      const litN = smooth(0.4, 0.8, fbm(x / 70, (y + 4) / 16 + 3, 4, seed));
      c = mix(c, mix(litC, shadowC, litN), cloud * (o.cloudAlpha ?? 0.75));
    }
    return c;
  });
}

/** Häuserzeile im Dunst. */
export function skylineLayer(p: Picture, seed: number, base: number, spread: number, color: RGB, lit: number, horizon = 92, window: RGB = hex('#ffcc70')): void {
  let x = -4;
  let i = 0;
  while (x < W) {
    const w = 12 + Math.floor(noise(i, seed, 3) * 18);
    const h = base + Math.floor(noise(i, seed, 8) * spread);
    const top = horizon - h;
    p.area(x, top, w, h, (px, py) => {
      const col = Math.floor((px - x) / 4);
      const row = Math.floor((py - top) / 5);
      if ((px - x) % 4 === 1 && (py - top) % 5 === 2 && noise(col + i * 9, row, seed) < lit) return mix(color, window, 0.75);
      return shade(color, (px - x) / w < 0.12 ? 1.2 : 1);
    });
    if (i % 3 === 0) p.area(x + w / 2, top - 5, 1, 5, () => shade(color, 0.9));
    x += w + Math.floor(noise(i, seed, 5) * 3);
    i++;
  }
}

/** Laubkrone wie mit dem Pinsel getupft. */
export function tree(p: Picture, cx: number, top: number, r: number, base: number, seed: number, dark: RGB, mid: RGB, lit: RGB): void {
  p.area(cx - 1, top + r, 3, base - top - r, (x) => shade(hex('#2c2024'), x === cx - 1 ? 1.7 : 1));
  for (let y = top - 4; y < top + r * 2.2; y++) {
    for (let x = Math.floor(cx - r * 1.4); x < cx + r * 1.4; x++) {
      const dx = (x - cx) / (r * 1.2);
      const dy = (y - (top + r)) / r;
      const edge = 1 - Math.hypot(dx, dy) + (fbm(x / 3.2, y / 3.2, 3, seed) - 0.5) * 0.9;
      if (edge <= 0) continue;
      const dab = fbm(x / 2, y / 2, 2, seed + 4);
      const l = clamp01(0.55 - dx * 0.75 - dy * 0.35 + (dab - 0.5) * 1.1);
      p.set(x, y, mix(mix(dark, mid, l), lit, smooth(0.62, 1, l) * 0.75));
    }
  }
}

/** Letzte Stimmung: Farbton, Rand, feines Korn. */
export function finish(p: Picture, o: { tint?: RGB; tintAmount?: number; vignette?: number; vigColor?: RGB; grain?: number; seed?: number } = {}): void {
  if (o.tint) {
    const t = o.tint;
    const a = o.tintAmount ?? 0.1;
    p.grade((c) => {
      const luma = (c[0] * 0.3 + c[1] * 0.6 + c[2] * 0.1) / 255;
      return mix(c, [t[0] * luma * 1.3, t[1] * luma * 1.3, t[2] * luma * 1.3], a);
    });
  }
  p.vignette(o.vignette ?? 0.32, o.vigColor);
  const g = o.grain ?? 2.5;
  p.grade((c, x, y) => {
    const n = grain(x, y, o.seed ?? 7) * g;
    return [c[0] + n, c[1] + n, c[2] + n];
  });
}

export const picture = (w = W, h = H): Picture => new Picture(w, h);

/** Mischt Licht auf den Boden: Sonnenfleck durchs Fenster. */
export function sunPatch(p: Picture, pts: readonly (readonly [number, number])[], c: RGB, a: number): void {
  p.softPoly(pts, c, a, 2.5);
}
