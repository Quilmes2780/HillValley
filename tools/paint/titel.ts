import { drawText } from '../pixel/schild.ts';
import { Canvas } from '../pixel/png.ts';
import * as K from './kit.ts';
import { clamp01, fbm, hex, mix, noise, type Picture, ramp, shade, smooth, type RGB } from './painter.ts';

const HORIZON = 136;

function bigText(p: Picture, text: string, x: number, y: number, top: RGB, bottom: RGB, glow: RGB, scale: number): void {
  const t = new Canvas(200, 12);
  drawText(t, text, 0, 0, 1);
  const on = (tx: number, ty: number): boolean => tx >= 0 && ty >= 0 && tx < t.w && ty < t.h && t.get(tx, ty) === 1;
  for (let ty = 0; ty < t.h; ty++) {
    for (let tx = 0; tx < t.w; tx++) {
      if (!on(tx, ty)) continue;
      p.glow(x + tx * scale + scale / 2, y + ty * scale + scale / 2, 9, glow, 0.035);
      for (let d = 1; d <= 2; d++) p.area(x + tx * scale + d, y + ty * scale + d, scale, scale, () => hex('#0c0814'));
    }
  }
  for (let ty = 0; ty < t.h; ty++) {
    for (let tx = 0; tx < t.w; tx++) {
      if (!on(tx, ty)) continue;
      p.area(x + tx * scale, y + ty * scale, scale, scale, (_px, py) => mix(top, bottom, (py - y) / (t.h * scale * 0.62)));
    }
  }
}

function bolt(p: Picture, x0: number, y0: number, x1: number, y1: number, width: number, seed: number): void {
  const steps = 7;
  let lx = x0;
  let ly = y0;
  for (let i = 1; i <= steps; i++) {
    const t = i / steps;
    const nx = x0 + (x1 - x0) * t + (i === steps ? 0 : (noise(i, seed, 3) - 0.5) * 18);
    const ny = y0 + (y1 - y0) * t;
    p.line(lx, ly, nx, ny, hex('#a8c0ff'), width + 1.6, 0.5);
    p.line(lx, ly, nx, ny, hex('#ffffff'), width);
    p.glow(nx, ny, 22, hex('#90b0ff'), 0.1);
    lx = nx;
    ly = ny;
  }
}

/** Titelbild: der Turm bei Nacht, ein Blitz, die vier Zeiten als Lichtstreifen. */
export function paintTitel(): Picture {
  const p = K.picture(320, 200);
  const stops = ['#080a24', '#14143c', '#2c1c58', '#5c2468', '#a83868', '#f07a48'].map(hex);
  p.area(0, 0, 320, HORIZON, (x, y) => {
    const t = y / HORIZON;
    let c = ramp(stops, t ** 1.2);
    const band = fbm(x / 80, y / 18 + 2, 5, 700);
    const cloud = smooth(0.46, 0.7, band) * (1 - t * 0.3);
    c = mix(c, mix(hex('#10102c'), hex('#6a2c70'), clamp01(t * 1.4)), cloud * 0.8);
    return c;
  });
  for (let i = 0; i < 90; i++) {
    const x = Math.floor(noise(i, 1, 3) * 320);
    const y = Math.floor(noise(i, 2, 3) * 66);
    p.set(x, y, i % 5 === 0 ? hex('#ffe8b0') : hex('#c8d4f0'));
  }
  // Stadt in zwei Lagen
  for (const [seed, base, spread, color] of [[701, 14, 26, '#2a1648'], [702, 6, 18, '#100a20']] as const) {
    let x = -4;
    let i = 0;
    while (x < 320) {
      const w = 12 + Math.floor(noise(i, seed, 3) * 18);
      const h = base + Math.floor(noise(i, seed, 8) * spread);
      const top = HORIZON - h;
      p.area(x, top, w, h, (px, py) => {
        const col = Math.floor((px - x) / 4);
        const row = Math.floor((py - top) / 5);
        if ((px - x) % 4 === 1 && (py - top) % 5 === 2 && noise(col + i * 9, row, seed) < 0.3) return hex('#ffcc70');
        return hex(color);
      });
      x += w + Math.floor(noise(i, seed, 5) * 3);
      i++;
    }
  }
  p.area(0, 100, 320, 36, (x, y) => mix(p.get(x, y), hex('#f07a48'), smooth(104, 136, y) * 0.14));

  // Der Turm: dunkel gegen den Himmel, nur die Uhr brennt
  const body: K.Mat = (x, y) => {
    const c = K.stone(hex('#2c2a3c'), 9, 5, 703)(x, y);
    return shade(c, 1.35 - (x - 214) / 62);
  };
  p.area(214, 42, 48, HORIZON - 42, body);
  p.area(214, 42, 1, HORIZON - 42, () => hex('#7a5a8a'));
  p.poly([[210, 42], [238, 18], [266, 42]], (x, y) => shade(mix(hex('#3e2a48'), hex('#141024'), fbm(x / 5, y / 5, 3, 704)), (x + y) % 4 === 0 ? 0.72 : x < 238 ? 1.3 : 0.75));
  p.area(210, 41, 56, 2, () => hex('#4a3a58'));
  for (let y = 48; y <= 88; y++) {
    for (let x = 218; x <= 258; x++) {
      const d = Math.hypot(x - 238, y - 68);
      if (d > 20) continue;
      if (d > 18) p.set(x, y, x < 238 ? hex('#e8c060') : hex('#6a4c20'));
      else p.set(x, y, mix(hex('#fff4c8'), hex('#e0a050'), d / 18 + fbm(x / 5, y / 5, 2, 705) * 0.12));
    }
  }
  for (let i = 0; i < 12; i++) {
    const a = (i / 12) * Math.PI * 2;
    p.line(238 + Math.cos(a) * 14, 68 + Math.sin(a) * 14, 238 + Math.cos(a) * 16.5, 68 + Math.sin(a) * 16.5, hex('#3a2a18'), i % 3 ? 1 : 1.6);
  }
  p.line(238, 68, 238, 56, hex('#14100c'), 1.8);
  p.line(238, 68, 247, 68, hex('#14100c'), 2);
  p.area(236, 66, 4, 4, () => hex('#14100c'));
  p.glow(238, 68, 70, hex('#ffb060'), 0.32);

  bolt(p, 312, 0, 238, 19, 1.6, 706);
  bolt(p, 286, 9, 298, 34, 0.8, 707);
  p.glow(238, 20, 60, hex('#a0c0ff'), 0.32);

  // Unterhalb des Lichtstreifens bleibt es dunkel für das Menü
  p.area(0, HORIZON, 320, 200 - HORIZON, (x, y) => mix(hex('#0c0a18'), hex('#06040c'), (y - HORIZON) / 64 + fbm(x / 30, y / 10, 3, 708) * 0.1));
  // Die vier Zeitebenen als Lichtstreifen
  ['#e8a860', '#50c8c0', '#5a9ae8', '#ff60b0'].map(hex).forEach((c, i) => {
    p.area(0, HORIZON + i, 320, 1, () => c);
    for (let x = 0; x < 320; x += 12) p.glow(x, HORIZON + i, 9, c, 0.02, 0.6);
  });

  bigText(p, 'HILL VALLEY', 18, 40, hex('#fff0a0'), hex('#f08a30'), hex('#ff7030'), 2);
  bigText(p, 'PARADOX', 18, 62, hex('#d0ffff'), hex('#30c0e8'), hex('#30b0ff'), 2);

  K.finish(p, { vignette: 0.34, vigColor: hex('#04020a'), seed: 709 });
  return p;
}
