import { existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { dirname } from 'node:path';
import { PNG } from 'pngjs';
import { PALETTE } from './palette.ts';

export const TRANSPARENT = -1;
type Pt = readonly [number, number];

/** Zeichenfläche, die nur Palette-Indizes kennt. Falsche Farben sind so ausgeschlossen. */
export class Canvas {
  readonly px: Int16Array;

  constructor(
    readonly w: number,
    readonly h: number,
    fill: number = TRANSPARENT,
  ) {
    this.px = new Int16Array(w * h).fill(fill);
  }

  set(x: number, y: number, color: number): void {
    const ix = Math.round(x);
    const iy = Math.round(y);
    if (ix < 0 || iy < 0 || ix >= this.w || iy >= this.h) return;
    this.px[iy * this.w + ix] = color;
  }

  get(x: number, y: number): number {
    if (x < 0 || y < 0 || x >= this.w || y >= this.h) return TRANSPARENT;
    return this.px[y * this.w + x];
  }

  rect(x: number, y: number, w: number, h: number, color: number): void {
    for (let iy = y; iy < y + h; iy++) for (let ix = x; ix < x + w; ix++) this.set(ix, iy, color);
  }

  frame(x: number, y: number, w: number, h: number, color: number): void {
    this.rect(x, y, w, 1, color);
    this.rect(x, y + h - 1, w, 1, color);
    this.rect(x, y, 1, h, color);
    this.rect(x + w - 1, y, 1, h, color);
  }

  line(x0: number, y0: number, x1: number, y1: number, color: number): void {
    const steps = Math.max(Math.abs(x1 - x0), Math.abs(y1 - y0), 1);
    for (let i = 0; i <= steps; i++) {
      this.set(x0 + ((x1 - x0) * i) / steps, y0 + ((y1 - y0) * i) / steps, color);
    }
  }

  poly(points: readonly Pt[], color: number): void {
    const ys = points.map((p) => p[1]);
    for (let y = Math.floor(Math.min(...ys)); y <= Math.ceil(Math.max(...ys)); y++) {
      const hits: number[] = [];
      for (let i = 0; i < points.length; i++) {
        const [ax, ay] = points[i];
        const [bx, by] = points[(i + 1) % points.length];
        if (ay <= y !== by <= y) hits.push(ax + ((y - ay) / (by - ay)) * (bx - ax));
      }
      hits.sort((a, b) => a - b);
      for (let i = 0; i + 1 < hits.length; i += 2) {
        for (let x = Math.ceil(hits[i]); x <= Math.floor(hits[i + 1]); x++) this.set(x, y, color);
      }
    }
  }

  /** Senkrechter Verlauf mit geordnetem Dithering über eine Farbrampe. */
  gradient(x: number, y: number, w: number, h: number, ramp: readonly number[]): void {
    const bayer = [
      [0, 8, 2, 10],
      [12, 4, 14, 6],
      [3, 11, 1, 9],
      [15, 7, 13, 5],
    ];
    for (let iy = 0; iy < h; iy++) {
      const t = (iy / Math.max(h - 1, 1)) * (ramp.length - 1);
      const base = Math.floor(t);
      const frac = t - base;
      for (let ix = 0; ix < w; ix++) {
        const threshold = (bayer[(y + iy) & 3][(x + ix) & 3] + 0.5) / 16;
        const c = frac > threshold ? ramp[Math.min(base + 1, ramp.length - 1)] : ramp[base];
        this.set(x + ix, y + iy, c);
      }
    }
  }

  blit(source: Canvas, x: number, y: number): void {
    for (let iy = 0; iy < source.h; iy++) {
      for (let ix = 0; ix < source.w; ix++) {
        const c = source.px[iy * source.w + ix];
        if (c !== TRANSPARENT) this.set(x + ix, y + iy, c);
      }
    }
  }

  save(path: string): void {
    const png = new PNG({ width: this.w, height: this.h });
    for (let i = 0; i < this.px.length; i++) {
      const c = this.px[i];
      const o = i * 4;
      if (c === TRANSPARENT) {
        png.data[o + 3] = 0;
      } else {
        const [r, g, b] = PALETTE[c].rgb;
        png.data[o] = r;
        png.data[o + 1] = g;
        png.data[o + 2] = b;
        png.data[o + 3] = 255;
      }
    }
    mkdirSync(dirname(path), { recursive: true });
    writeFileSync(path, PNG.sync.write(png));
  }
}

/** Mit --force werden auch austauschbare Dateien neu erzeugt. */
export const FORCE = process.argv.includes('--force');

/** Für Platzhalter, die du durch eigene Grafik ersetzen kannst: Vorhandenes bleibt unangetastet. */
export function saveReplaceable(canvas: Canvas, path: string): void {
  if (FORCE || !existsSync(path)) canvas.save(path);
}

/** Reproduzierbarer Zufall, damit `npm run pixel` immer dieselben Bilder erzeugt. */
export function seeded(seed: number): () => number {
  let s = seed >>> 0;
  return () => {
    s = (Math.imul(s, 1664525) + 1013904223) >>> 0;
    return s / 4294967296;
  };
}
