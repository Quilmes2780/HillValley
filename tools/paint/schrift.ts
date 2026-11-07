import { hex, type Picture, type RGB } from './painter.ts';

/**
 * Gemalte Schrift für Schilder: Buchstaben aus Strichen mit weicher Kante, je nach Ort in eigenem Stil.
 * Koordinaten einer Glyphe: x nach rechts, y von 0 (oben) bis 1 (Grundlinie), in Einheiten der Versalhöhe.
 * Schilder stehen in Versalien, Kleinbuchstaben werden umgewandelt.
 */
export type Stil = 'antiqua' | 'block' | 'western' | 'neon';

type P = readonly [number, number];
type Stroke = readonly P[];
interface Glyph {
  w: number;
  s: readonly Stroke[];
}

/** Bogen als Linienzug. Winkel in Grad: 0 rechts, 90 unten. */
function arc(cx: number, cy: number, rx: number, ry: number, from: number, to: number): P[] {
  const steps = Math.max(4, Math.round(Math.abs(to - from) / 18));
  const out: P[] = [];
  for (let i = 0; i <= steps; i++) {
    const a = ((from + ((to - from) * i) / steps) * Math.PI) / 180;
    out.push([cx + Math.cos(a) * rx, cy + Math.sin(a) * ry]);
  }
  return out;
}

const O_RING = arc(0.38, 0.5, 0.38, 0.5, 0, 360);

const G: Record<string, Glyph> = {
  A: { w: 0.74, s: [[[0, 1], [0.37, 0], [0.74, 1]], [[0.14, 0.66], [0.6, 0.66]]] },
  B: { w: 0.6, s: [[[0, 0], [0, 1]], [[0, 0], [0.3, 0], ...arc(0.3, 0.24, 0.24, 0.24, -90, 90), [0, 0.48]], [[0, 0.48], [0.32, 0.48], ...arc(0.32, 0.74, 0.28, 0.26, -90, 90), [0, 1]]] },
  C: { w: 0.66, s: [arc(0.38, 0.5, 0.38, 0.5, -48, -312)] },
  D: { w: 0.7, s: [[[0, 0], [0, 1]], [[0, 0], [0.22, 0], ...arc(0.22, 0.5, 0.48, 0.5, -90, 90), [0, 1]]] },
  E: { w: 0.54, s: [[[0, 0], [0, 1]], [[0, 0], [0.54, 0]], [[0, 0.48], [0.42, 0.48]], [[0, 1], [0.54, 1]]] },
  F: { w: 0.52, s: [[[0, 0], [0, 1]], [[0, 0], [0.52, 0]], [[0, 0.48], [0.4, 0.48]]] },
  G: { w: 0.72, s: [arc(0.38, 0.5, 0.38, 0.5, -48, -312), [[0.42, 0.56], [0.72, 0.56], [0.72, 0.84]]] },
  H: { w: 0.68, s: [[[0, 0], [0, 1]], [[0.68, 0], [0.68, 1]], [[0, 0.48], [0.68, 0.48]]] },
  I: { w: 0.14, s: [[[0.07, 0], [0.07, 1]]] },
  J: { w: 0.44, s: [[[0.44, 0], [0.44, 0.72], ...arc(0.22, 0.72, 0.22, 0.28, 0, 170)]] },
  K: { w: 0.64, s: [[[0, 0], [0, 1]], [[0.6, 0], [0, 0.56]], [[0.2, 0.4], [0.64, 1]]] },
  L: { w: 0.5, s: [[[0, 0], [0, 1], [0.5, 1]]] },
  M: { w: 0.88, s: [[[0, 1], [0.04, 0], [0.44, 0.84], [0.84, 0], [0.88, 1]]] },
  N: { w: 0.7, s: [[[0, 1], [0, 0], [0.7, 1], [0.7, 0]]] },
  O: { w: 0.76, s: [O_RING] },
  P: { w: 0.58, s: [[[0, 0], [0, 1]], [[0, 0], [0.3, 0], ...arc(0.3, 0.27, 0.28, 0.27, -90, 90), [0, 0.54]]] },
  Q: { w: 0.76, s: [O_RING, [[0.46, 0.7], [0.78, 1.04]]] },
  R: { w: 0.62, s: [[[0, 0], [0, 1]], [[0, 0], [0.3, 0], ...arc(0.3, 0.26, 0.28, 0.26, -90, 90), [0, 0.52]], [[0.28, 0.52], [0.62, 1]]] },
  S: { w: 0.58, s: [[...arc(0.28, 0.25, 0.27, 0.25, -24, -270), ...arc(0.29, 0.75, 0.29, 0.25, -90, 156)]] },
  T: { w: 0.62, s: [[[0.31, 0], [0.31, 1]], [[0, 0], [0.62, 0]]] },
  U: { w: 0.66, s: [[[0, 0], [0, 0.66], ...arc(0.33, 0.66, 0.33, 0.34, 180, 0), [0.66, 0]]] },
  V: { w: 0.7, s: [[[0, 0], [0.35, 1], [0.7, 0]]] },
  W: { w: 1, s: [[[0, 0], [0.25, 1], [0.5, 0.18], [0.75, 1], [1, 0]]] },
  X: { w: 0.68, s: [[[0, 0], [0.68, 1]], [[0.68, 0], [0, 1]]] },
  Y: { w: 0.66, s: [[[0, 0], [0.33, 0.52], [0.66, 0]], [[0.33, 0.52], [0.33, 1]]] },
  Z: { w: 0.6, s: [[[0.02, 0], [0.6, 0], [0, 1], [0.6, 1]]] },
  '0': { w: 0.58, s: [arc(0.29, 0.5, 0.29, 0.5, 0, 360)] },
  '1': { w: 0.3, s: [[[0, 0.2], [0.24, 0], [0.24, 1]]] },
  '2': { w: 0.56, s: [[...arc(0.28, 0.28, 0.27, 0.28, -160, 40), [0, 1], [0.56, 1]]] },
  '3': { w: 0.54, s: [[...arc(0.26, 0.24, 0.25, 0.24, -150, 90), ...arc(0.26, 0.74, 0.28, 0.26, -90, 150)]] },
  '4': { w: 0.6, s: [[[0.46, 1], [0.46, 0], [0, 0.72], [0.6, 0.72]]] },
  '5': { w: 0.54, s: [[[0.5, 0], [0.08, 0], [0.04, 0.44], ...arc(0.24, 0.68, 0.3, 0.32, -70, 150)]] },
  '6': { w: 0.56, s: [[[0.46, 0.02], ...arc(0.28, 0.68, 0.28, 0.32, -140, 220)]] },
  '7': { w: 0.54, s: [[[0, 0], [0.54, 0], [0.16, 1]]] },
  '8': { w: 0.56, s: [arc(0.28, 0.24, 0.24, 0.24, 0, 360), arc(0.28, 0.74, 0.28, 0.26, 0, 360)] },
  '9': { w: 0.56, s: [[[0.1, 0.98], ...arc(0.28, 0.32, 0.28, 0.32, 40, -320)]] },
  '.': { w: 0.1, s: [[[0.05, 0.94], [0.05, 1]]] },
  ',': { w: 0.1, s: [[[0.06, 0.94], [0.02, 1.14]]] },
  '-': { w: 0.34, s: [[[0, 0.56], [0.34, 0.56]]] },
  ':': { w: 0.1, s: [[[0.05, 0.3], [0.05, 0.36]], [[0.05, 0.92], [0.05, 1]]] },
  "'": { w: 0.08, s: [[[0.04, 0], [0.04, 0.24]]] },
  '&': { w: 0.74, s: [[[0.74, 1], [0.14, 0.34], ...arc(0.28, 0.2, 0.18, 0.2, 170, -60), [0.04, 0.68], ...arc(0.28, 0.76, 0.24, 0.24, 180, 90), [0.5, 0.82], [0.68, 0.5]]] },
};

interface StilDef {
  /** Halbe Strichbreite senkrechter und waagerechter Striche, in Pixeln bei Versalhöhe 7. */
  thick: number;
  thin: number;
  /** Länge der Serifen in Versalhöhen; 0 = keine. */
  serif: number;
  track: number;
}

const STILE: Record<Stil, StilDef> = {
  antiqua: { thick: 0.6, thin: 0.32, serif: 0.09, track: 0.2 },
  block: { thick: 0.92, thin: 0.72, serif: 0, track: 0.2 },
  western: { thick: 0.72, thin: 0.42, serif: 0.1, track: 0.24 },
  neon: { thick: 0.5, thin: 0.5, serif: 0, track: 0.22 },
};

interface Seg {
  ax: number;
  ay: number;
  bx: number;
  by: number;
  half: number;
}

export interface TextOpts {
  x: number;
  y: number;
  /** Versalhöhe in Pixeln. */
  h: number;
  /** Höchstens so breit: Die Schrift wird nötigenfalls schmaler gesetzt. */
  maxW?: number;
  /** Bei Angabe von maxW mittig in dieser Breite. */
  center?: boolean;
  stil: Stil;
  color: RGB | ((x: number, y: number) => RGB);
  shadow?: RGB;
  shadowAlpha?: number;
  shadowOffset?: number;
  glow?: RGB;
  glowStrength?: number;
}

function layout(text: string, stil: StilDef): { glyphs: { g: Glyph; x: number }[]; width: number } {
  const glyphs: { g: Glyph; x: number }[] = [];
  let x = 0;
  for (const raw of text.toUpperCase()) {
    if (raw === ' ') {
      x += 0.42;
      continue;
    }
    const g = G[raw];
    if (!g) throw new Error(`Schrift: Zeichen fehlt: ${raw}`);
    glyphs.push({ g, x });
    x += g.w + stil.track;
  }
  return { glyphs, width: x - stil.track };
}

function segments(text: string, o: TextOpts): { segs: Seg[]; width: number } {
  const stil = STILE[o.stil];
  const { glyphs, width } = layout(text, stil);
  const natural = width * o.h;
  const squeeze = o.maxW && natural > o.maxW ? o.maxW / natural : 1;
  const finalW = natural * squeeze;
  const left = o.center && o.maxW ? o.x + (o.maxW - finalW) / 2 : o.x;
  const size = o.h / 7;
  const segs: Seg[] = [];
  const add = (ax: number, ay: number, bx: number, by: number, half: number): void => {
    segs.push({ ax, ay, bx, by, half });
  };
  for (const { g, x } of glyphs) {
    const startX = Math.round(left + x * o.h * squeeze);
    const glyphW = Math.max(1, Math.round(g.w * o.h * squeeze));
    const px = (u: number): number => startX + (g.w > 0 ? (u / g.w) * glyphW : 0);
    const py = (v: number): number => o.y + v * (o.h - 1);
    for (const stroke of g.s) {
      for (let i = 0; i + 1 < stroke.length; i++) {
        const [ux, uy] = stroke[i];
        const [vx, vy] = stroke[i + 1];
        const flat = Math.abs(vy - uy) < 0.001;
        const upright = Math.abs(vx - ux) < 0.001;
        const ax = upright ? Math.round(px(ux)) : px(ux);
        const bx = upright ? Math.round(px(vx)) : px(vx);
        const ay = flat ? Math.round(py(uy)) : py(uy);
        const by = flat ? Math.round(py(vy)) : py(vy);
        const len = Math.hypot(bx - ax, by - ay) || 1;
        // Senkrechte Striche kräftig, waagerechte fein: So zeichnet eine Breitfeder.
        const vertical = Math.abs(by - ay) / len;
        add(ax, ay, bx, by, (stil.thin + (stil.thick - stil.thin) * vertical) * size);
      }
      if (stil.serif <= 0) continue;
      for (const [ux, uy] of [stroke[0], stroke[stroke.length - 1]]) {
        const next = ux === stroke[0][0] && uy === stroke[0][1] ? stroke[1] : stroke[stroke.length - 2];
        const steep = Math.abs(next[1] - uy) > Math.abs(next[0] - ux);
        if (!steep || (uy !== 0 && uy !== 1)) continue;
        const reach = stil.serif * o.h * squeeze;
        const sx = Math.round(px(ux));
        add(sx - reach, Math.round(py(uy)), sx + reach, Math.round(py(uy)), stil.thin * size);
      }
    }
  }
  return { segs, width: finalW };
}

function coverage(segs: readonly Seg[], x: number, y: number): number {
  let best = 0;
  for (const s of segs) {
    const dx = s.bx - s.ax;
    const dy = s.by - s.ay;
    const l2 = dx * dx + dy * dy || 1;
    const t = Math.max(0, Math.min(1, ((x - s.ax) * dx + (y - s.ay) * dy) / l2));
    const d = Math.hypot(x - (s.ax + dx * t), y - (s.ay + dy * t));
    best = Math.max(best, Math.min(1, s.half - d + 0.5));
  }
  return Math.max(0, best);
}

/** Malt einen Schriftzug ins Bild und liefert seine Breite. */
export function paintText(p: Picture, text: string, o: TextOpts): number {
  const { segs, width } = segments(text, o);
  const x0 = Math.floor(Math.min(...segs.map((s) => Math.min(s.ax, s.bx))) - 3);
  const x1 = Math.ceil(Math.max(...segs.map((s) => Math.max(s.ax, s.bx))) + 3);
  const y0 = Math.floor(o.y - 3);
  const y1 = Math.ceil(o.y + o.h * 1.2 + 3);
  const cover = new Map<number, number>();
  for (let y = y0; y <= y1; y++) {
    for (let x = x0; x <= x1; x++) {
      const c = coverage(segs, x, y);
      if (c > 0.02) cover.set(y * 4096 + x, c);
    }
  }
  const shadow = o.shadow ?? hex('#100806');
  const offset = o.shadowOffset ?? 1;
  const alpha = o.shadowAlpha ?? 0.42;
  if (o.glow && o.glowStrength) {
    for (const [key, c] of cover) {
      if (c > 0.6) p.glow(key % 4096, Math.floor(key / 4096), 4, o.glow, o.glowStrength * 0.45);
    }
  }
  if (alpha > 0) {
    for (const [key, c] of cover) {
      p.blend((key % 4096) + offset, Math.floor(key / 4096) + offset, shadow, c * alpha);
    }
  }
  for (const [key, c] of cover) {
    const x = key % 4096;
    const y = Math.floor(key / 4096);
    p.blend(x, y, typeof o.color === 'function' ? o.color(x, y) : o.color, c);
  }
  return width;
}

/**
 * Ersatz für die alte Pixelschrift: gleiche Stelle und Breite wie bisher, damit die Schrift auf ihrem Schild bleibt.
 * `oldWidth` ist die Breite des alten Schriftzugs, `y` die obere Kante der alten Zeile.
 */
export function signText(p: Picture, text: string, x: number, y: number, oldWidth: number, stil: Stil, color: RGB, glow?: RGB, glowStrength = 0): void {
  paintText(p, text, { x, y: y + 1, h: 7, maxW: oldWidth, center: true, stil, color, glow, glowStrength });
}
