import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname } from 'node:path';
import { PNG } from 'pngjs';

export type RGB = readonly [number, number, number];

export function hex(value: string): RGB {
  const n = parseInt(value.replace('#', ''), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

export const mix = (a: RGB, b: RGB, t: number): RGB => [
  a[0] + (b[0] - a[0]) * t,
  a[1] + (b[1] - a[1]) * t,
  a[2] + (b[2] - a[2]) * t,
];
export const shade = (c: RGB, f: number): RGB => [c[0] * f, c[1] * f, c[2] * f];
export const clamp01 = (v: number): number => Math.max(0, Math.min(1, v));
export const smooth = (a: number, b: number, v: number): number => {
  const t = clamp01((v - a) / (b - a));
  return t * t * (3 - 2 * t);
};

/** Mehrstufiger Verlauf über gleichmäßige Stützstellen. */
export function ramp(colors: readonly RGB[], t: number): RGB {
  const p = clamp01(t) * (colors.length - 1);
  const i = Math.min(Math.floor(p), colors.length - 2);
  return mix(colors[i], colors[i + 1], p - i);
}

// --- Rauschen -------------------------------------------------------------------------------

function hash(x: number, y: number, seed: number): number {
  let h = (Math.imul(x, 374761393) + Math.imul(y, 668265263) + Math.imul(seed, 2147483647)) | 0;
  h = Math.imul(h ^ (h >>> 13), 1274126177);
  return ((h ^ (h >>> 16)) >>> 0) / 4294967296;
}

export function noise(x: number, y: number, seed = 0): number {
  const ix = Math.floor(x);
  const iy = Math.floor(y);
  const fx = x - ix;
  const fy = y - iy;
  const ux = fx * fx * (3 - 2 * fx);
  const uy = fy * fy * (3 - 2 * fy);
  const a = hash(ix, iy, seed);
  const b = hash(ix + 1, iy, seed);
  const c = hash(ix, iy + 1, seed);
  const d = hash(ix + 1, iy + 1, seed);
  return a + (b - a) * ux + (c - a) * uy + (a - b - c + d) * ux * uy;
}

/** Fraktales Rauschen, 0..1. Grundlage für Wolken, Putz, Papier und Schmutz. */
export function fbm(x: number, y: number, octaves = 4, seed = 0): number {
  let sum = 0;
  let amp = 0.5;
  let total = 0;
  let f = 1;
  for (let i = 0; i < octaves; i++) {
    sum += noise(x * f, y * f, seed + i * 17) * amp;
    total += amp;
    amp *= 0.5;
    f *= 2.03;
  }
  return sum / total;
}

/** Korn je Pixel, -1..1. */
export const grain = (x: number, y: number, seed = 0): number => hash(x, y, seed + 99) * 2 - 1;

type Pt = readonly [number, number];

function inPoly(x: number, y: number, pts: readonly Pt[]): boolean {
  let inside = false;
  for (let i = 0, j = pts.length - 1; i < pts.length; j = i++) {
    const [xi, yi] = pts[i];
    const [xj, yj] = pts[j];
    if (yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) inside = !inside;
  }
  return inside;
}

/** Bild in voller Farbtiefe. Am Ende wird es auf die Spielpalette reduziert. */
export class Picture {
  readonly px: Float32Array;
  /** Welche Pixel bemalt wurden. Bei Sprites bleibt der Rest durchsichtig. */
  readonly touched: Uint8Array;

  constructor(
    readonly w: number,
    readonly h: number,
  ) {
    this.px = new Float32Array(w * h * 3);
    this.touched = new Uint8Array(w * h);
  }

  get(x: number, y: number): RGB {
    const ix = Math.max(0, Math.min(this.w - 1, Math.round(x)));
    const iy = Math.max(0, Math.min(this.h - 1, Math.round(y)));
    const o = (iy * this.w + ix) * 3;
    return [this.px[o], this.px[o + 1], this.px[o + 2]];
  }

  set(x: number, y: number, c: RGB): void {
    if (x < 0 || y < 0 || x >= this.w || y >= this.h) return;
    this.touched[y * this.w + x] = 1;
    const o = (y * this.w + x) * 3;
    this.px[o] = c[0];
    this.px[o + 1] = c[1];
    this.px[o + 2] = c[2];
  }

  /** Mischt eine Farbe mit Deckkraft `a` ein. */
  blend(x: number, y: number, c: RGB, a: number): void {
    if (a <= 0 || x < 0 || y < 0 || x >= this.w || y >= this.h) return;
    this.touched[y * this.w + x] = 1;
    const o = (y * this.w + x) * 3;
    const t = Math.min(a, 1);
    this.px[o] += (c[0] - this.px[o]) * t;
    this.px[o + 1] += (c[1] - this.px[o + 1]) * t;
    this.px[o + 2] += (c[2] - this.px[o + 2]) * t;
  }

  /** Malt über eine Fläche; `f` liefert Farbe und optional Deckkraft je Pixel. */
  area(x0: number, y0: number, w: number, h: number, f: (x: number, y: number) => RGB | null): void {
    for (let y = Math.max(0, Math.floor(y0)); y < Math.min(this.h, y0 + h); y++) {
      for (let x = Math.max(0, Math.floor(x0)); x < Math.min(this.w, x0 + w); x++) {
        const c = f(x, y);
        if (c) this.set(x, y, c);
      }
    }
  }

  poly(pts: readonly Pt[], f: RGB | ((x: number, y: number) => RGB | null), alpha = 1): void {
    const xs = pts.map((p) => p[0]);
    const ys = pts.map((p) => p[1]);
    for (let y = Math.max(0, Math.floor(Math.min(...ys))); y <= Math.min(this.h - 1, Math.ceil(Math.max(...ys))); y++) {
      for (let x = Math.max(0, Math.floor(Math.min(...xs))); x <= Math.min(this.w - 1, Math.ceil(Math.max(...xs))); x++) {
        if (!inPoly(x + 0.5, y + 0.5, pts)) continue;
        const c = typeof f === 'function' ? f(x, y) : f;
        if (c) this.blend(x, y, c, alpha);
      }
    }
  }

  /** Abdunkeln oder Einfärben mit weichem Rand, z. B. Schlagschatten. */
  softPoly(pts: readonly Pt[], c: RGB, alpha: number, soft = 2): void {
    const xs = pts.map((p) => p[0]);
    const ys = pts.map((p) => p[1]);
    // Festes Raster statt Zufall: Zufallsproben ergäben krümelige Schatten.
    const grid = [-1, -0.5, 0, 0.5, 1];
    const samples = grid.length * grid.length;
    for (let y = Math.max(0, Math.floor(Math.min(...ys) - soft)); y <= Math.min(this.h - 1, Math.max(...ys) + soft); y++) {
      for (let x = Math.max(0, Math.floor(Math.min(...xs) - soft)); x <= Math.min(this.w - 1, Math.max(...xs) + soft); x++) {
        let hit = 0;
        for (const gy of grid) {
          for (const gx of grid) {
            if (inPoly(x + gx * soft, y + gy * soft, pts)) hit++;
          }
        }
        if (hit) this.blend(x, y, c, (alpha * hit) / samples);
      }
    }
  }

  /** Addiert Licht, das nach außen weich ausläuft. */
  glow(cx: number, cy: number, radius: number, c: RGB, strength: number, squash = 1): void {
    for (let y = Math.max(0, Math.floor(cy - radius)); y < Math.min(this.h, cy + radius); y++) {
      for (let x = Math.max(0, Math.floor(cx - radius)); x < Math.min(this.w, cx + radius); x++) {
        const d = Math.hypot(x - cx, (y - cy) / squash) / radius;
        if (d >= 1) continue;
        const f = (1 - d) ** 2 * strength;
        const o = (y * this.w + x) * 3;
        this.px[o] += c[0] * f;
        this.px[o + 1] += c[1] * f;
        this.px[o + 2] += c[2] * f;
      }
    }
  }

  /** Weiche Linie mit Breite; `wobble` macht sie handgezeichnet. */
  line(x0: number, y0: number, x1: number, y1: number, c: RGB, width = 1, alpha = 1, wobble = 0, seed = 0): void {
    const steps = Math.ceil(Math.hypot(x1 - x0, y1 - y0) * 2) + 1;
    const r = width / 2;
    for (let i = 0; i <= steps; i++) {
      const t = i / steps;
      const n = wobble ? (noise(t * 12, seed, 77) - 0.5) * wobble : 0;
      const px = x0 + (x1 - x0) * t + n;
      const py = y0 + (y1 - y0) * t + n * 0.6;
      for (let y = Math.floor(py - r - 1); y <= py + r + 1; y++) {
        for (let x = Math.floor(px - r - 1); x <= px + r + 1; x++) {
          const d = Math.hypot(x + 0.5 - px, y + 0.5 - py);
          this.blend(x, y, c, clamp01(r + 0.5 - d) * alpha * 0.9);
        }
      }
    }
  }

  /** Addiert Licht in einer Fläche mit weichem Rand, z. B. Sonnenstrahlen durchs Fenster. */
  beam(pts: readonly Pt[], c: RGB, strength: number): void {
    const xs = pts.map((q) => q[0]);
    const ys = pts.map((q) => q[1]);
    const top = Math.min(...ys);
    const bottom = Math.max(...ys);
    for (let y = Math.max(0, Math.floor(top)); y <= Math.min(this.h - 1, bottom); y++) {
      const fade = 1 - ((y - top) / (bottom - top)) * 0.75;
      for (let x = Math.max(0, Math.floor(Math.min(...xs))); x <= Math.min(this.w - 1, Math.max(...xs)); x++) {
        let hit = 0;
        for (const [dx, dy] of [[-1.5, 0], [1.5, 0], [0, -1], [0, 1], [0, 0]] as const) {
          if (inPoly(x + dx, y + dy, pts)) hit++;
        }
        if (!hit) continue;
        const f = (hit / 5) * strength * fade;
        const o = (y * this.w + x) * 3;
        this.px[o] += c[0] * f;
        this.px[o + 1] += c[1] * f;
        this.px[o + 2] += c[2] * f;
      }
    }
  }

  /** Abdunkelung zu den Rändern: lenkt den Blick zur Mitte wie im Kino. */
  vignette(strength: number, c: RGB = [8, 6, 16]): void {
    for (let y = 0; y < this.h; y++) {
      for (let x = 0; x < this.w; x++) {
        const dx = (x - this.w / 2) / (this.w / 2);
        const dy = (y - this.h / 2) / (this.h / 2);
        this.blend(x, y, c, smooth(0.55, 1.45, Math.hypot(dx, dy)) * strength);
      }
    }
  }

  /** Überträgt eine Stimmung auf das ganze Bild. */
  grade(f: (c: RGB, x: number, y: number) => RGB): void {
    for (let y = 0; y < this.h; y++) {
      for (let x = 0; x < this.w; x++) this.set(x, y, f(this.get(x, y), x, y));
    }
  }
}

// --- Palette -------------------------------------------------------------------------------

/**
 * Eigene 256-Farben-Palette je Bild (Median-Cut), wie bei den VGA-Spielen:
 * Sie trifft die Farben des Raums genau, statt auf eine feste Auswahl auszuweichen.
 */
export function paletteFor(pic: Picture, size = 256): RGB[] {
  const pixels: number[][] = [];
  for (let i = 0; i < pic.px.length; i += 3) {
    if (!pic.touched[i / 3]) continue;
    pixels.push([
      Math.max(0, Math.min(255, pic.px[i])),
      Math.max(0, Math.min(255, pic.px[i + 1])),
      Math.max(0, Math.min(255, pic.px[i + 2])),
    ]);
  }
  const boxes: number[][][] = [pixels];
  while (boxes.length < size) {
    // Die Kiste mit der größten Farbspanne wird geteilt.
    let bestBox = -1;
    let bestRange = -1;
    let bestAxis = 0;
    boxes.forEach((box, b) => {
      if (box.length < 2) return;
      for (let axis = 0; axis < 3; axis++) {
        let lo = 255;
        let hi = 0;
        for (const px of box) {
          if (px[axis] < lo) lo = px[axis];
          if (px[axis] > hi) hi = px[axis];
        }
        const range = (hi - lo) * (axis === 1 ? 1.2 : 1) * Math.log2(box.length + 1);
        if (range > bestRange) {
          bestRange = range;
          bestBox = b;
          bestAxis = axis;
        }
      }
    });
    if (bestBox < 0) break;
    const box = boxes[bestBox];
    box.sort((p, q) => p[bestAxis] - q[bestAxis]);
    const mid = box.length >> 1;
    boxes.splice(bestBox, 1, box.slice(0, mid), box.slice(mid));
  }
  return boxes.map((box) => {
    const sum = [0, 0, 0];
    for (const px of box) {
      sum[0] += px[0];
      sum[1] += px[1];
      sum[2] += px[2];
    }
    return [sum[0] / box.length, sum[1] / box.length, sum[2] / box.length] as RGB;
  });
}

const BAYER = [
  [0, 32, 8, 40, 2, 34, 10, 42],
  [48, 16, 56, 24, 50, 18, 58, 26],
  [12, 44, 4, 36, 14, 46, 6, 38],
  [60, 28, 52, 20, 62, 30, 54, 22],
  [3, 35, 11, 43, 1, 33, 9, 41],
  [51, 19, 59, 27, 49, 17, 57, 25],
  [15, 47, 7, 39, 13, 45, 5, 37],
  [63, 31, 55, 23, 61, 29, 53, 21],
];

/** Reduziert auf 256 Farben mit ganz leichtem Raster und schreibt eine PNG-Datei. */
export function savePicture(pic: Picture, path: string, scale = 1, transparent = false): void {
  const palette = paletteFor(pic);
  const cache = new Map<number, RGB>();
  const nearest = (r: number, g: number, b: number): RGB => {
    const key = ((r >> 1) << 14) | ((g >> 1) << 7) | (b >> 1);
    const hit = cache.get(key);
    if (hit) return hit;
    let best = palette[0];
    let bestD = Infinity;
    for (const p of palette) {
      const dr = p[0] - r;
      const dg = p[1] - g;
      const db = p[2] - b;
      const mean = (p[0] + r) / 2;
      const d = (2 + mean / 256) * dr * dr + 4 * dg * dg + (2 + (255 - mean) / 256) * db * db;
      if (d < bestD) {
        bestD = d;
        best = p;
      }
    }
    cache.set(key, best);
    return best;
  };
  const png = new PNG({ width: pic.w * scale, height: pic.h * scale });
  for (let y = 0; y < pic.h; y++) {
    for (let x = 0; x < pic.w; x++) {
      const [r, g, b] = pic.get(x, y);
      const d = (BAYER[y & 7][x & 7] / 64 - 0.5) * 3;
      const q = nearest(
        Math.max(0, Math.min(255, Math.round(r + d))),
        Math.max(0, Math.min(255, Math.round(g + d))),
        Math.max(0, Math.min(255, Math.round(b + d))),
      );
      for (let sy = 0; sy < scale; sy++) {
        for (let sx = 0; sx < scale; sx++) {
          const o = ((y * scale + sy) * png.width + x * scale + sx) * 4;
          png.data[o] = Math.round(q[0]);
          png.data[o + 1] = Math.round(q[1]);
          png.data[o + 2] = Math.round(q[2]);
          png.data[o + 3] = transparent && !pic.touched[y * pic.w + x] ? 0 : 255;
        }
      }
    }
  }
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, PNG.sync.write(png));
}
