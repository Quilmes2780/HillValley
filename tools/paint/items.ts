import { clamp01, fbm, hex, mix, noise, Picture, type RGB, shade } from './painter.ts';

/**
 * Die Gegenstände im Inventar, 32×20. Sie entstehen in sechsfacher Größe mit Licht und Material,
 * werden verkleinert, nachgeschärft und bekommen einen dunklen Rand.
 */
const S = 6;
const W = 32;
const H = 20;

type Shader = RGB | ((u: number, v: number) => RGB);
type Pt = readonly [number, number];

const paintOf = (c: Shader, u: number, v: number): RGB => (typeof c === 'function' ? c(u, v) : c);
const light = (c: RGB, f: number): RGB => mix(c, [255, 250, 235], f);

/** Verlauf von oben nach unten. */
const vgrad = (a: string | RGB, b: string | RGB, y0: number, y1: number) => (_u: number, v: number): RGB =>
  mix(toRgb(a), toRgb(b), clamp01((v - y0) / (y1 - y0)));
const toRgb = (c: string | RGB): RGB => (typeof c === 'string' ? hex(c) : c);

/** Stehender Zylinder: Licht links der Mitte, Schatten an den Rändern. */
const cyl = (base: string | RGB, x0: number, x1: number) => (u: number): RGB => {
  const t = (u - x0) / (x1 - x0);
  const c = toRgb(base);
  const glow = Math.exp(-(((t - 0.3) / 0.13) ** 2)) * 0.5;
  const dark = 0.5 + 0.62 * Math.sin(Math.PI * clamp01(t));
  return light(shade(c, dark), glow);
};

/** Kugel, von links oben beleuchtet. */
const ballShade = (base: string | RGB, cx: number, cy: number, rx: number, ry: number) => (u: number, v: number): RGB => {
  const nx = (u - cx) / rx;
  const ny = (v - cy) / ry;
  const nz = Math.sqrt(Math.max(0, 1 - nx * nx - ny * ny));
  const d = clamp01(-0.5 * nx - 0.6 * ny + 0.62 * nz);
  const c = toRgb(base);
  return light(shade(c, 0.42 + d * 0.78), d ** 9 * 0.8);
};

class Ink {
  readonly hi = new Picture(W * S, H * S);

  fill(x0: number, y0: number, x1: number, y1: number, inside: (u: number, v: number) => boolean, c: Shader): void {
    for (let y = Math.max(0, Math.floor(y0 * S)); y < Math.min(H * S, Math.ceil(y1 * S)); y++) {
      for (let x = Math.max(0, Math.floor(x0 * S)); x < Math.min(W * S, Math.ceil(x1 * S)); x++) {
        const u = (x + 0.5) / S;
        const v = (y + 0.5) / S;
        if (inside(u, v)) this.hi.set(x, y, paintOf(c, u, v));
      }
    }
  }

  poly(pts: readonly Pt[], c: Shader): void {
    this.hi.poly(pts.map(([x, y]) => [x * S, y * S] as const), (x, y) => paintOf(c, (x + 0.5) / S, (y + 0.5) / S));
  }

  rect(x: number, y: number, w: number, h: number, c: Shader, r = 0): void {
    this.fill(x, y, x + w, y + h, (u, v) => {
      const dx = Math.max(x + r - u, u - (x + w - r), 0);
      const dy = Math.max(y + r - v, v - (y + h - r), 0);
      return r === 0 || Math.hypot(dx, dy) <= r;
    }, c);
  }

  ellipse(cx: number, cy: number, rx: number, ry: number, c: Shader): void {
    this.fill(cx - rx, cy - ry, cx + rx, cy + ry, (u, v) => ((u - cx) / rx) ** 2 + ((v - cy) / ry) ** 2 <= 1, c);
  }

  ball(cx: number, cy: number, rx: number, ry: number, base: string | RGB): void {
    this.ellipse(cx, cy, rx, ry, ballShade(base, cx, cy, rx, ry));
  }

  /** Gerade Linie mit runden Enden. */
  stroke(x0: number, y0: number, x1: number, y1: number, w: number, c: Shader): void {
    const dx = x1 - x0;
    const dy = y1 - y0;
    const len2 = dx * dx + dy * dy || 1;
    const r = w / 2;
    this.fill(Math.min(x0, x1) - r, Math.min(y0, y1) - r, Math.max(x0, x1) + r, Math.max(y0, y1) + r, (u, v) => {
      const t = clamp01(((u - x0) * dx + (v - y0) * dy) / len2);
      return Math.hypot(u - x0 - dx * t, v - y0 - dy * t) <= r;
    }, c);
  }

  /** Runder Stab: von links oben beleuchtet, quer zur Achse schattiert. */
  rod(x0: number, y0: number, x1: number, y1: number, w: number, base: string | RGB): void {
    const dx = x1 - x0;
    const dy = y1 - y0;
    const len = Math.hypot(dx, dy) || 1;
    const nx = -dy / len;
    const ny = dx / len;
    const flip = nx + ny > 0 ? -1 : 1; // Normale zeigt zum Licht
    const c = toRgb(base);
    this.stroke(x0, y0, x1, y1, w, (u, v) => {
      const off = (((u - x0) * nx + (v - y0) * ny) * flip) / (w / 2);
      const lit = clamp01(0.5 + off * 0.5);
      return light(shade(c, 0.5 + lit * 0.62), Math.exp(-(((lit - 0.78) / 0.14) ** 2)) * 0.45);
    });
  }

  /** Gebogener Schlauch: aneinandergereihte beleuchtete Scheiben. */
  tube(path: (t: number) => readonly [number, number, number], color: (t: number) => string | RGB, steps = 70): void {
    for (let i = 0; i <= steps; i++) {
      const t = i / steps;
      const [x, y, r] = path(t);
      this.ball(x, y, r, r, color(t));
    }
  }

  /** Handgeschriebene Zeile. */
  scribble(x0: number, y: number, x1: number, c: Shader, w = 0.8, seed = 1): void {
    const n = Math.ceil((x1 - x0) * 2.4);
    let px = x0;
    let py = y;
    for (let i = 1; i <= n; i++) {
      const x = x0 + ((x1 - x0) * i) / n;
      const ny = y + (noise(i * 0.75, seed, 41) - 0.5) * 2.4;
      this.stroke(px, py, x, ny, w, c);
      px = x;
      py = ny;
    }
  }

  dots(pts: readonly Pt[], r: number, c: Shader): void {
    for (const [x, y] of pts) this.ellipse(x, y, r, r, c);
  }

  /** Verkleinert, schärft nach und zieht den dunklen Rand. */
  finish(outline: RGB = hex('#120c12')): Picture {
    const out = new Picture(W, H);
    const opaque = new Uint8Array(W * H);
    const colors: RGB[] = [];
    for (let y = 0; y < H; y++) {
      for (let x = 0; x < W; x++) {
        const sum = [0, 0, 0];
        let hits = 0;
        for (let sy = 0; sy < S; sy++) {
          for (let sx = 0; sx < S; sx++) {
            const hx = x * S + sx;
            const hy = y * S + sy;
            if (!this.hi.touched[hy * this.hi.w + hx]) continue;
            const c = this.hi.get(hx, hy);
            sum[0] += c[0];
            sum[1] += c[1];
            sum[2] += c[2];
            hits++;
          }
        }
        colors.push(hits ? [sum[0] / hits, sum[1] / hits, sum[2] / hits] : [0, 0, 0]);
        if (hits >= S * S * 0.45) opaque[y * W + x] = 1;
      }
    }
    const isOn = (x: number, y: number): boolean => x >= 0 && y >= 0 && x < W && y < H && opaque[y * W + x] === 1;
    for (let y = 0; y < H; y++) {
      for (let x = 0; x < W; x++) {
        if (isOn(x, y)) {
          const c = colors[y * W + x];
          const around = [[1, 0], [-1, 0], [0, 1], [0, -1]].filter(([dx, dy]) => isOn(x + dx, y + dy));
          const avg = [0, 1, 2].map((k) => around.reduce((s, [dx, dy]) => s + colors[(y + dy) * W + x + dx][k], c[k]) / (around.length + 1));
          const sharp = [0, 1, 2].map((k) => c[k] + (c[k] - avg[k]) * 0.8);
          const grey = (sharp[0] + sharp[1] + sharp[2]) / 3;
          out.set(x, y, sharp.map((v) => Math.max(0, Math.min(255, grey + (v - grey) * 1.12))) as unknown as RGB);
        } else if (isOn(x - 1, y) || isOn(x + 1, y) || isOn(x, y - 1) || isOn(x, y + 1)) {
          out.set(x, y, outline);
        }
      }
    }
    return out;
  }
}

// --- Bausteine -------------------------------------------------------------------------------

interface SheetLook {
  cx: number;
  cy: number;
  w: number;
  h: number;
  tilt?: number;
  paper: string;
  ink?: string;
  rows?: number;
  hand?: boolean;
  /** Zerknittert: unregelmäßiger Rand und Knicke. */
  crumple?: number;
  /** Ein Eselsohr rechts oben. */
  ear?: boolean;
  seed?: number;
  first?: number;
}

function sheet(i: Ink, o: SheetLook): (a: number, b: number) => Pt {
  const tilt = o.tilt ?? 0;
  const cos = Math.cos(tilt);
  const sin = Math.sin(tilt);
  const seed = o.seed ?? 7;
  const map = (a: number, b: number): Pt => {
    const x = (a - 0.5) * o.w;
    const y = (b - 0.5) * o.h;
    return [o.cx + x * cos - y * sin, o.cy + x * sin + y * cos];
  };
  const edge: Pt[] = [];
  const crumple = o.crumple ?? 0;
  const walk = (a0: number, b0: number, a1: number, b1: number, n: number): void => {
    for (let k = 0; k < n; k++) {
      const a = a0 + ((a1 - a0) * k) / n;
      const b = b0 + ((b1 - b0) * k) / n;
      const [x, y] = map(a, b);
      edge.push([x + (noise(k * 1.7, a0 * 9 + b1 * 3, seed) - 0.5) * crumple, y + (noise(k * 1.7, b0 * 9 + a1 * 3, seed + 1) - 0.5) * crumple]);
    }
  };
  const n = crumple ? 7 : 1;
  if (o.ear) {
    edge.push(map(0, 0), map(0.8, 0), map(1, 0.22), map(1, 1), map(0, 1));
  } else {
    walk(0, 0, 1, 0, n);
    walk(1, 0, 1, 1, n);
    walk(1, 1, 0, 1, n);
    walk(0, 1, 0, 0, n);
  }
  const paper = hex(o.paper);
  i.poly(edge, (u, v) => {
    const t = clamp01((v - (o.cy - o.h / 2)) / o.h);
    let c = shade(paper, 1.06 - t * 0.2);
    if (crumple) c = shade(c, 0.78 + fbm(u * 0.62 + v * 0.3, v * 0.6 - u * 0.25, 2, seed) * 0.46);
    return c;
  });
  if (o.ear) i.poly([map(0.8, 0), map(0.8, 0.22), map(1, 0.22)], shade(paper, 0.72));
  const rows = o.rows ?? 0;
  const inkC = hex(o.ink ?? '#3a3a50');
  const first = o.first ?? 0.2;
  for (let r = 0; r < rows; r++) {
    const b = first + ((0.88 - first) * (r + 0.2)) / rows;
    const end = r === rows - 1 ? 0.56 : 0.86;
    const [x0, y0] = map(0.12, b);
    const [x1, y1] = map(end, b);
    if (o.hand) i.scribble(x0, y0, x1, inkC, 0.8, seed + r * 3);
    else i.stroke(x0, y0, x1, y1, 0.8, inkC);
  }
  return map;
}

interface EnvelopeLook {
  x: number;
  y: number;
  w: number;
  h: number;
  paper: string;
  flap?: string;
  seal?: string;
  rim?: string;
}

function envelope(i: Ink, o: EnvelopeLook): void {
  const { x, y, w, h } = o;
  const paper = hex(o.paper);
  i.rect(x, y, w, h, vgrad(light(paper, 0.12), shade(paper, 0.82), y, y + h), 0.5);
  // Seitliche Falze
  const crease = shade(paper, 0.74);
  i.stroke(x + 0.5, y + h - 0.5, x + w / 2 - 1, y + h * 0.5, 0.7, crease);
  i.stroke(x + w - 0.5, y + h - 0.5, x + w / 2 + 1, y + h * 0.5, 0.7, crease);
  // Lasche mit Schatten
  i.poly([[x, y + 1.2], [x + w, y + 1.2], [x + w / 2, y + h * 0.66]], shade(paper, 0.55));
  i.poly([[x, y], [x + w, y], [x + w / 2, y + h * 0.6]], o.flap ? hex(o.flap) : vgrad(light(paper, 0.22), shade(paper, 0.92), y, y + h * 0.6));
  if (o.seal) i.ball(x + w / 2, y + h * 0.56, 2.3, 2.3, o.seal);
  if (o.rim) {
    const rim = hex(o.rim);
    i.rect(x, y, w, 0.9, rim);
    i.rect(x, y + h - 0.9, w, 0.9, rim);
    i.rect(x, y, 0.9, h, rim);
    i.rect(x + w - 0.9, y, 0.9, h, rim);
  }
}

/** Holzkiste von schräg oben. `lid` färbt den Deckel. */
function woodBox(i: Ink, x: number, y: number, w: number, h: number, deep: number, wood: string): void {
  const base = hex(wood);
  const grain = (u: number, v: number, f: number): RGB => shade(base, f + (fbm(u * 0.3, v * 1.8, 3, 33) - 0.5) * 0.5);
  i.poly([[x + deep, y], [x + w + deep, y], [x + w, y + deep], [x, y + deep]], (u, v) => grain(u, v, 1.22));
  i.rect(x, y + deep, w, h, (u, v) => grain(u, v, 0.88));
  i.poly([[x + w, y + deep], [x + w + deep, y], [x + w + deep, y + h], [x + w, y + deep + h]], (u, v) => grain(u, v, 0.58));
}

function dollarBill(i: Ink, cx: number, cy: number, tilt: number): void {
  const map = sheet(i, { cx, cy, w: 20, h: 10, tilt, paper: '#7fb07a', seed: 3 });
  const [mx, my] = map(0.5, 0.5);
  i.ellipse(mx, my, 3, 3.1, hex('#3e6e44'));
  i.ellipse(mx, my, 2.2, 2.3, hex('#a8cc9c'));
  i.ellipse(mx, my - 0.3, 1, 1.2, hex('#3e6e44'));
  for (const [a, b] of [[0.12, 0.2], [0.88, 0.2], [0.12, 0.8], [0.88, 0.8]] as const) {
    const [x, y] = map(a, b);
    i.ellipse(x, y, 1, 1, hex('#2e5a38'));
  }
}

function fotoIcon(i: Ink, stage: number): void {
  const wood = hex('#7a5228');
  i.rect(6, 1, 20, 18, vgrad(light(wood, 0.2), shade(wood, 0.72), 1, 19), 0.6);
  // Bild
  const tann = stage === 1;
  i.rect(8, 3, 16, 14, vgrad(tann ? '#c8805a' : '#88c0ea', tann ? '#e8b888' : '#d8ecf4', 3, 12));
  i.rect(8, 12, 16, 5, vgrad(tann ? '#6a6a3c' : '#5aa84a', tann ? '#4a4a28' : '#3a7a34', 12, 17));
  // Haus
  i.rect(9, 7.5, 8, 5, vgrad('#f4f0e4', '#c8c0b0', 7.5, 12.5));
  i.poly([[8.4, 8], [13, 4.8], [17.6, 8]], vgrad('#b84a3c', '#7a2a24', 4.8, 8));
  i.rect(14.4, 9.6, 1.6, 2.9, hex('#6a4426'));
  if (tann) {
    i.rect(17.5, 3.5, 6, 4.2, hex('#c81c1c'));
    i.rect(18.4, 4.8, 4.2, 1.4, hex('#f6d040'));
  }
  // Familie vorn
  const figure = (x: number, y: number, h: number, body: string, head = '#f0c8a0'): void => {
    i.rect(x - 0.9, y, 1.8, h, vgrad(body, shade(hex(body), 0.7), y, y + h), 0.4);
    i.ball(x, y - 0.8, 0.95, 0.95, head);
  };
  figure(10, 11.6, 4.6, '#c8382e');
  figure(12.8, 11.6, 4.6, '#3a5ab8');
  figure(15.4, 12.8, 3.4, '#e88a2c');
  // Doc: blass, solange die Zeitlinie nicht stimmt
  if (stage === 1 || stage === 2) {
    const ghost = hex(stage === 1 ? '#c8a080' : '#e0e8ec');
    i.dots([[20.4, 9.6], [21.2, 11.4], [20.4, 13], [21.2, 14.6], [20.8, 8.2]], 0.5, ghost);
  } else {
    figure(20.8, 10, 6, stage === 4 ? '#e8e4d8' : '#6a4a9a', '#f4d8bc');
    i.ellipse(20.8, 8.2, 1.3, 0.7, hex('#f4f4f4'));
  }
  // Glanz auf dem Glas
  i.poly([[18, 3], [21, 3], [15, 9], [12, 9]], (u, v) => light(i.hi.get(u * S, v * S), 0.18));
}

const ICONS: Record<string, (i: Ink) => void> = {
  foto_stufe0: (i) => fotoIcon(i, 0),
  foto_stufe1: (i) => fotoIcon(i, 1),
  foto_stufe2: (i) => fotoIcon(i, 2),
  foto_stufe3: (i) => fotoIcon(i, 3),
  foto_stufe4: (i) => fotoIcon(i, 4),

  kugelschreiber: (i) => {
    i.rod(9, 14.2, 25, 3.6, 3, '#2a4ab0');
    i.rod(5.6, 16.5, 9, 14.2, 2.2, '#b0b4bc');
    i.stroke(3.6, 17.8, 5.6, 16.5, 0.9, hex('#2a2a30'));
    i.rod(25, 3.6, 28, 1.8, 2.4, '#d8dce4');
    i.stroke(19, 6, 25, 2.2, 0.9, hex('#e8ecf4'));
    i.rod(12, 12.2, 14.6, 10.5, 3.2, '#c8ccd4');
  },
  banane: (i) => {
    const arc = (t: number): readonly [number, number, number] => {
      const a = 2.75 - t * 1.9;
      return [15.5 + Math.cos(a) * 13, 3.5 + Math.sin(a) * 12.4, 1.1 + Math.sin(Math.PI * t) ** 0.7 * 2.5];
    };
    i.tube(arc, (t) => (t < 0.05 ? '#5a4416' : t < 0.14 ? '#b8b03a' : t > 0.95 ? '#4a3414' : '#f4d030'), 90);
    i.tube((t) => { const [x, y] = arc(0.1 + t * 0.8); return [x + 0.2, y + 1.5, 0.28]; }, () => '#a07a18', 50);
    i.dots([[10, 11.5], [18, 14.8], [22, 13.8]], 0.4, hex('#5a4416'));
  },
  bananenschale: (i) => {
    const flap = (dx: number, dy: number, c: string): void => {
      i.tube((t) => [15.5 + dx * t, 7.5 + dy * t + 4 * t * t, 1.8 - t * 0.7], (t) => (t > 0.9 ? '#5a4416' : c), 40);
    };
    flap(-10, 2, '#d8b828');
    flap(10, 2, '#d8b828');
    flap(-4, 3.5, '#f0d844');
    flap(4, 3.5, '#f4e06a');
    i.tube((t) => [15.5, 3 + t * 6, 1.2 + t * 1.2], (t) => (t < 0.25 ? '#5a4416' : '#e8c830'), 20);
  },
  hundefutter: (i) => {
    i.rect(8, 4, 16, 14, cyl('#b8bcc4', 8, 24), 0.8);
    i.rect(8, 6.5, 16, 8.8, cyl('#d8742a', 8, 24));
    i.ellipse(16, 4.5, 8, 2.4, vgrad('#e8ecf0', '#9498a0', 2, 7));
    i.ellipse(16, 4.5, 6.2, 1.5, vgrad('#8a8e96', '#c4c8d0', 3, 6));
    // Knochen auf dem Etikett
    const bone = hex('#fff0d0');
    i.rect(12.5, 10, 7, 1.8, bone);
    i.dots([[12.3, 9.8], [12.3, 12], [19.7, 9.8], [19.7, 12]], 1.2, bone);
  },
  wachstuch: (i) => {
    const cloth = (u: number, v: number): RGB =>
      shade(hex('#c8b070'), 0.72 + Math.sin(u * 0.75 + v * 1.25 + fbm(u / 7, v / 5, 2, 9) * 5) * 0.2 + (1 - v / 20) * 0.28);
    i.poly([[5, 7], [12, 3.4], [22, 4.8], [27.5, 3.4], [29, 12], [24, 17.6], [14, 15.8], [7.5, 18], [3.4, 13]], cloth);
    i.stroke(7, 12, 21, 9, 0.8, hex('#7a6434'));
    i.stroke(13, 15, 26, 13, 0.7, hex('#8a7440'));
    i.ellipse(19, 7.4, 3.6, 1.1, hex('#f0e4b8'));
  },
  docs_brief: (i) => envelope(i, { x: 5, y: 3, w: 22, h: 14, paper: '#f0ecdc', seal: '#c8281e' }),
  notizbuch: (i) => {
    i.poly([[9, 3], [25, 2], [26, 16.6], [10, 18]], vgrad('#c02c24', '#6e1612', 2, 18));
    i.poly([[10, 18], [26, 16.6], [26, 18], [10.2, 19]], hex('#f0e8d0'));
    i.poly([[12, 2.8], [13.4, 2.7], [14.8, 17.6], [13.3, 17.8]], hex('#401010'));
    i.poly([[16.6, 5.4], [23.4, 4.9], [23.7, 9.6], [16.9, 10.2]], hex('#f4ecd4'));
    i.stroke(17.8, 6.8, 22.4, 6.5, 0.7, hex('#3a3a50'));
    i.stroke(18, 8.6, 21.4, 8.3, 0.7, hex('#3a3a50'));
    for (let k = 0; k < 6; k++) i.ellipse(9.4 + k * 0.12, 4.4 + k * 2.4, 1.2, 0.5, hex('#d8dce4'));
  },
  mr_fusion: (i) => {
    i.poly([[10, 18], [22, 18], [20.4, 6.6], [11.6, 6.6]], cyl('#c8ccd4', 10, 22));
    i.rect(10, 16.8, 12, 2, cyl('#6e7078', 10, 22), 0.5);
    i.rect(11, 4.2, 10, 2.6, cyl('#e8ecf0', 11, 21), 0.8);
    i.rod(13.4, 2.6, 18.6, 2.6, 1.5, '#8a8e96');
    i.rect(12.6, 9.2, 6.8, 4.8, vgrad('#f4c830', '#c88a18', 9, 14), 0.4);
    i.ellipse(16, 11.6, 1.6, 1.6, hex('#201814'));
    i.ellipse(16, 11.6, 0.8, 0.8, hex('#f4c830'));
  },

  zeitung: (i) => {
    const map = sheet(i, { cx: 16, cy: 10, w: 23, h: 16, tilt: -0.1, paper: '#dcd8c8', seed: 5 });
    const line = (a0: number, b: number, a1: number, c: string, w: number): void => {
      const [x0, y0] = map(a0, b);
      const [x1, y1] = map(a1, b);
      i.stroke(x0, y0, x1, y1, w, hex(c));
    };
    line(0.08, 0.15, 0.92, '#14141a', 1.8);
    for (const b of [0.4, 0.55, 0.7, 0.85]) line(0.08, b, 0.46, '#6a6a70', 0.7);
    i.poly([map(0.54, 0.33), map(0.92, 0.33), map(0.92, 0.88), map(0.54, 0.88)], hex('#54545c'));
    const [hx, hy] = map(0.73, 0.55);
    i.ball(hx, hy, 1.4, 1.5, '#b8b8b8');
  },
  entschuldigung: (i) => {
    sheet(i, { cx: 16, cy: 10, w: 16, h: 17.5, tilt: 0.05, paper: '#f8f6ec', ink: '#2a3ab8', rows: 4, hand: true, seed: 11, first: 0.16 });
  },
  kassette: (i) => {
    i.rect(4, 3, 24, 15, vgrad('#3c3c44', '#1c1c22', 3, 18), 1);
    i.rect(6, 4.4, 20, 7.8, vgrad('#f0e4c0', '#d4c498', 4.4, 12.2));
    i.rect(6, 5.8, 20, 1, hex('#d84a30'));
    i.scribble(8, 8.2, 22, hex('#2a3ab8'), 0.7, 5);
    i.rect(10, 9.6, 12, 3.4, hex('#141418'), 0.8);
    i.ellipse(12.2, 11.2, 1.6, 1.6, hex('#e8e8ec'));
    i.ellipse(19.8, 11.2, 1.6, 1.6, hex('#e8e8ec'));
    i.ellipse(12.2, 11.2, 0.7, 0.7, hex('#141418'));
    i.ellipse(19.8, 11.2, 0.7, 0.7, hex('#141418'));
    i.poly([[9, 18], [23, 18], [21.6, 14.6], [10.4, 14.6]], hex('#4a4a54'));
    i.dots([[5.3, 4.2], [26.7, 4.2], [5.3, 16.8], [26.7, 16.8]], 0.5, hex('#a0a0a8'));
  },
  kabel: (i) => {
    for (const k of [0, 1, 2]) {
      i.tube((t) => {
        const a = t * Math.PI * 2 + 0.4;
        return [14.4 + Math.cos(a) * 9.2, 8.2 + k * 1.6 + Math.sin(a) * 4.7, 1];
      }, () => (k === 1 ? '#c86a1c' : '#e8842a'), 90);
    }
    i.tube((t) => [20 + t * 7, 13.6 + t * 1.4, 1], () => '#e8842a', 18);
    i.rect(26, 12.6, 4.2, 4.4, vgrad('#4a4a52', '#222228', 12.6, 17), 0.8);
    i.stroke(30, 13.8, 31, 13.8, 0.8, hex('#d8c060'));
    i.stroke(30, 15.8, 31, 15.8, 0.8, hex('#d8c060'));
  },
  diktiergeraet: (i) => {
    i.rect(9, 1.6, 14, 17, (u, v) => shade(hex('#40424a'), 1.28 - (u - 9) * 0.03 - (v - 1.6) * 0.012), 1.3);
    i.rect(11, 3.4, 10, 6.4, vgrad('#14141a', '#2a2a34', 3.4, 9.8), 0.5);
    i.ellipse(13.4, 6.6, 1.4, 1.4, hex('#b0b0b8'));
    i.ellipse(18.6, 6.6, 1.4, 1.4, hex('#b0b0b8'));
    i.poly([[12, 3.8], [15, 3.8], [12, 7]], light(hex('#2a2a34'), 0.3));
    i.rect(11, 12.2, 2.8, 1.8, hex('#d8362a'), 0.4);
    i.rect(14.6, 12.2, 2.8, 1.8, hex('#d0d0d4'), 0.4);
    i.rect(18.2, 12.2, 2.8, 1.8, hex('#d0d0d4'), 0.4);
    for (const y of [15.4, 16.8]) i.stroke(11.6, y, 20.4, y, 0.6, hex('#16161a'));
  },
  brief_an_doc: (i) => {
    const map = sheet(i, { cx: 16, cy: 10, w: 22, h: 16, tilt: 0.06, paper: '#f0e4c0', ink: '#2a3ab8', rows: 3, hand: true, seed: 21, first: 0.14 });
    // Die Skizze des Verstärkers
    const [x, y] = map(0.72, 0.68);
    i.rect(x - 3.2, y - 2, 6.4, 3.8, hex('#7a8cc8'));
    i.rect(x - 2.5, y - 1.3, 5, 2.4, hex('#f0e4c0'));
    i.ellipse(x, y, 0.9, 0.9, hex('#2a3ab8'));
  },
  brief_von_marty: (i) => {
    sheet(i, { cx: 16, cy: 7.4, w: 17, h: 12, tilt: -0.04, paper: '#f4ead0', ink: '#2a3ab8', rows: 2, hand: true, seed: 31, first: 0.14 });
    i.rect(5, 9.6, 22, 8.8, vgrad('#d4c090', '#a8905c', 9.6, 18.4), 0.5);
    i.poly([[5, 9.6], [16, 15.4], [27, 9.6], [27, 11], [16, 17], [5, 11]], hex('#8e784a'));
  },
  schraubenzieher: (i) => {
    i.rod(14, 11.2, 26.6, 3, 1.5, '#c8ccd4');
    i.poly([[25.6, 2.4], [29.6, 0.8], [30, 1.8], [27, 4]], hex('#e8ecf4'));
    i.rod(4, 17.4, 12.4, 12.2, 4.4, '#d02c20');
    for (const k of [0.25, 0.5, 0.75]) {
      i.stroke(4 + 8.4 * k - 0.8, 17.4 - 5.2 * k - 1.2, 4 + 8.4 * k + 0.8, 17.4 - 5.2 * k + 1.2, 0.5, hex('#7a120c'));
    }
    i.rod(12.2, 12.4, 14.4, 11, 2.2, '#f0d8a0');
  },
  zigarrenkiste: (i) => {
    woodBox(i, 3.5, 3, 22, 11, 4, '#92602e');
    i.poly([[10, 4.4], [24, 4.4], [22.6, 5.8], [8.6, 5.8]], hex('#f0d890'));
    i.rect(8, 9.4, 13, 5.4, vgrad('#d8382a', '#8e1c14', 9.4, 14.8));
    i.rect(9.4, 10.8, 10.2, 2.6, hex('#f4d870'));
    i.stroke(11, 12.1, 18, 12.1, 0.7, hex('#6e1812'));
    i.stroke(3.5, 7.4, 25.5, 7.4, 0.5, hex('#3e2410'));
  },
  kupferspule: (i) => {
    i.rect(10, 3.6, 12, 12.8, cyl('#d8843c', 10, 22));
    for (let y = 3.6; y < 16.4; y += 1.3) i.stroke(10, y, 22, y + 0.3, 0.4, (u) => shade(cyl('#7a3c14', 10, 22)(u), 0.9));
    i.ellipse(16, 3.2, 7.6, 1.9, vgrad('#c8c8d0', '#6e6e78', 1.4, 5));
    i.ellipse(16, 16.8, 7.6, 1.9, vgrad('#8e8e98', '#4a4a54', 15, 18.8));
    i.ellipse(16, 3.2, 2.2, 0.8, hex('#26262c'));
    i.tube((t) => [22 + t * 6, 9 + Math.sin(t * 4) * 2 - t * 4, 0.55], () => '#e8944c', 30);
    i.tube((t) => [10 - t * 6, 12 + Math.sin(t * 4) * 1.4 + t * 2, 0.55], () => '#e8944c', 30);
  },
  dollar: (i) => {
    dollarBill(i, 15, 10.6, 0.2);
    dollarBill(i, 17, 9, -0.12);
  },
  roehre: (i) => {
    // Glaskolben
    const glass = (u: number, v: number): RGB => {
      const t = clamp01((u - 10) / 12);
      return mix(hex('#34485a'), hex('#8cb0c4'), Math.exp(-(((t - 0.22) / 0.12) ** 2)) + (v < 4 ? 0.2 : 0));
    };
    i.rect(10, 2.4, 12, 11, glass, 3.4);
    i.ellipse(16, 1.8, 1.2, 1, hex('#8cb0c4'));
    i.rect(13, 5, 6, 6.6, vgrad('#909098', '#4a4a52', 5, 11.6), 0.4);
    i.rect(14.8, 5.6, 2.4, 5.4, hex('#20181a'));
    i.ellipse(16, 8.4, 1.1, 2.6, hex('#ff8a30'));
    i.ellipse(16, 8.4, 0.5, 1.5, hex('#fff0b0'));
    i.stroke(12, 3.8, 12, 9.8, 0.9, hex('#e4f0f8'));
    i.rect(10.6, 13, 10.8, 3.8, cyl('#3a3034', 10.6, 21.4), 0.5);
    for (const x of [12.6, 15, 17, 19.4]) i.stroke(x, 16.8, x, 19, 0.8, hex('#c8ccd4'));
  },
  zettel: (i) => {
    sheet(i, { cx: 16, cy: 10, w: 19, h: 13, tilt: -0.08, paper: '#f4e878', ink: '#2a3ab8', rows: 2, hand: true, seed: 8, crumple: 1.6, first: 0.28 });
  },
  hausaufgabe: (i) => {
    const map = sheet(i, { cx: 16, cy: 10, w: 17, h: 17.5, tilt: -0.03, paper: '#fafaf2', ink: '#8088a0', rows: 4, hand: true, seed: 13, first: 0.26 });
    const [x, y] = map(0.76, 0.12);
    i.stroke(x - 1.6, y, x - 0.4, y + 1.2, 0.9, hex('#d02c20'));
    i.stroke(x - 0.4, y + 1.2, x + 2, y - 1.4, 0.9, hex('#d02c20'));
    i.rect(10, 0.6, 1.3, 4, hex('#b0b4bc'), 0.5);
  },
  mappe: (i) => {
    i.rect(5, 3.2, 8, 3, vgrad('#a06a30', '#7a4a1e', 3.2, 6.2), 0.8);
    i.poly([[9, 1.6], [26, 1.2], [26.6, 6], [9, 6]], hex('#f4f0e0'));
    i.rect(4, 5, 24, 13.4, (u, v) => shade(hex('#8e5c28'), 1.15 - (v - 5) * 0.03 + (fbm(u / 3, v / 3, 3, 12) - 0.5) * 0.3), 1);
    i.stroke(4.6, 5.3, 27.4, 5.3, 0.6, hex('#c89a58'));
    i.rect(10, 8.8, 12, 5.4, hex('#f0e4c0'));
    i.scribble(11, 10.4, 21, hex('#2a3ab8'), 0.6, 7);
    i.scribble(11, 12.6, 18, hex('#2a3ab8'), 0.6, 9);
  },
  verstaerker: (i) => {
    // Röhre und Spule ragen aus der Kiste
    i.rect(16.5, 1, 6.2, 8, (u) => mix(hex('#34485a'), hex('#8cb0c4'), Math.exp(-(((u - 18) / 0.9) ** 2))), 2);
    i.ellipse(19.6, 4.8, 0.9, 1.8, hex('#ffb040'));
    i.rect(8.4, 3.6, 5.6, 5, cyl('#d8843c', 8.4, 14));
    for (let y = 3.8; y < 8.6; y += 1.1) i.stroke(8.4, y, 14, y, 0.35, hex('#7a3c14'));
    woodBox(i, 3.5, 7, 22, 8.6, 3, '#92602e');
    i.ball(9, 13.6, 1.7, 1.7, '#d8d4c8');
    i.ball(14, 13.6, 1.7, 1.7, '#d8d4c8');
    i.ellipse(20, 13.6, 1, 1, hex('#ff5030'));
    i.tube((t) => [14 + t * 3, 8.8 - Math.sin(t * 3) * 1.6, 0.4], () => '#e8c040', 20);
  },

  streichhoelzer: (i) => {
    // Schublade mit Streichhölzern
    for (const [k, x] of [10.4, 13, 15.6, 18.2, 20.8].entries()) {
      i.stroke(x, 10, x + 0.3 - k * 0.1, 3.2 + (k % 2) * 0.9, 0.9, hex('#e8cc90'));
      i.ball(x + 0.3 - k * 0.1, 2.8 + (k % 2) * 0.9, 1, 1.3, '#d83a28');
    }
    i.rect(6, 9, 20, 2.4, hex('#c8a870'));
    i.rect(5, 10.4, 22, 8, vgrad('#f4e4b0', '#c8b078', 10.4, 18.4), 0.4);
    i.rect(5, 16.4, 22, 2, (u) => (Math.floor(u * 2) % 2 ? hex('#4a2a1c') : hex('#6a3e28')));
    i.rect(8, 11.4, 16, 4.2, hex('#2a58a8'));
    i.poly([[16, 11.8], [17.8, 13.5], [16, 15.2], [14.2, 13.5]], hex('#f4d040'));
  },
  bleistift: (i) => {
    i.rod(10, 13.2, 23, 6, 3.2, '#f0c028');
    i.stroke(10.4, 14, 23.4, 6.8, 0.6, hex('#a87a10'));
    i.poly([[22.2, 4.8], [24.6, 7.2], [28.2, 3]], hex('#ecc894'));
    i.poly([[26.8, 3.5], [27.6, 4.3], [28.8, 2.4]], hex('#26262c'));
    i.rod(8.6, 14, 10.6, 12.9, 3.2, '#b8bcc4');
    i.rod(5.6, 15.8, 8.2, 14.3, 3, '#e87a8c');
  },
  festprogramm: (i) => {
    const map = sheet(i, { cx: 16, cy: 10, w: 15.5, h: 18, paper: '#f0e4c4', ink: '#5a4a38', rows: 3, seed: 2, first: 0.58 });
    const [x, y] = map(0.5, 0.3);
    // Fähnchen und die Rathausuhr
    i.rect(9.2, 2, 13.6, 1.8, hex('#b82c24'));
    i.ellipse(x, y + 0.8, 2.6, 2.6, hex('#3a2a1c'));
    i.ellipse(x, y + 0.8, 1.9, 1.9, hex('#f8f4e4'));
    i.stroke(x, y + 0.8, x, y - 0.5, 0.5, hex('#201408'));
    i.stroke(x, y + 0.8, x + 0.9, y + 0.8, 0.5, hex('#201408'));
  },
  kuchen: (i) => {
    i.ellipse(16, 14.6, 13.6, 4.2, vgrad('#e8ecf0', '#8e94a0', 10.4, 19));
    i.ellipse(16, 12.4, 11, 3.8, vgrad('#b8742c', '#7a4418', 8.6, 16.4));
    i.rect(5, 9, 22, 3.4, vgrad('#c88638', '#9a5e24', 9, 12.4));
    i.ellipse(16, 9, 11, 3.8, (u, v) => shade(hex('#dc9a48'), 1.08 + (fbm(u / 2.5, v / 2, 3, 19) - 0.5) * 0.5));
    // Rand aus Teig, in der Mitte dunkle Beeren
    i.ellipse(16, 9, 8.6, 2.7, (u, v) => shade(hex('#6e1830'), 1 + (fbm(u, v * 1.6, 2, 23) - 0.5) * 0.8));
    for (let k = -2; k <= 2; k++) {
      i.stroke(16 + k * 3.2 - 0.9, 6.7, 16 + k * 3.2 + 0.9, 11.3, 0.8, hex('#f0c07a'));
      i.stroke(16 + k * 3.2 + 0.9, 6.7, 16 + k * 3.2 - 0.9, 11.3, 0.8, hex('#e0a860'));
    }
  },
  herausforderung: (i) => {
    sheet(i, { cx: 16, cy: 10, w: 17, h: 15.4, paper: '#f4e8c8', ink: '#6e2a5a', rows: 4, hand: true, seed: 17, first: 0.2 });
    // Eingerollte Enden
    i.rect(6.4, 1, 19.2, 2.2, cyl('#e0d0a0', 6.4, 25.6), 1);
    i.rect(6.4, 16.8, 19.2, 2.2, cyl('#d4c090', 6.4, 25.6), 1);
    i.tube((t) => [13 + Math.cos(t * 6.3) * 1.2, 14 + Math.sin(t * 6.3) * 0.6, 0.3], () => '#6e2a5a', 20);
  },
  knallfrosch: (i) => knallfrosch(i, false),
  knallfrosch_brennend: (i) => knallfrosch(i, true),
  fluxkompensator: (i) => {
    i.rect(5, 2, 22, 16, (u, v) => shade(hex('#8a8c94'), 1.25 - (u - 5) * 0.012 - (v - 2) * 0.03 + (fbm(u / 2.4, v / 2.4, 3, 44) - 0.5) * 0.35), 0.8);
    i.rect(7.6, 4.2, 16.8, 11.6, vgrad('#0e1218', '#1c222c', 4.2, 15.8), 0.5);
    const tube = hex('#fff4a8');
    const halo = hex('#c88a18');
    for (const [c, w] of [[halo, 2.2], [tube, 1]] as const) {
      i.stroke(16, 9.8, 10.2, 5.8, w, c);
      i.stroke(16, 9.8, 21.8, 5.8, w, c);
      i.stroke(16, 9.8, 16, 14.8, w, c);
    }
    i.ellipse(16, 9.8, 1.4, 1.4, hex('#ffffff'));
    i.dots([[6.2, 3.1], [25.8, 3.1], [6.2, 16.9], [25.8, 16.9]], 0.6, hex('#d8d8e0'));
    // Beule und Mist
    i.ellipse(9, 16.6, 3, 1.4, hex('#5e4422'));
    i.ellipse(24, 3, 2.6, 1, hex('#5e4422'));
    i.stroke(26.8, 8, 25.2, 11, 0.8, hex('#44464e'));
  },
  biffs_brief: (i) => {
    sheet(i, { cx: 16, cy: 10, w: 24, h: 15, tilt: -0.1, paper: '#c0b088', ink: '#26201a', rows: 3, hand: true, seed: 23, crumple: 3 });
  },
  nachricht: (i) => {
    sheet(i, { cx: 15, cy: 10, w: 22, h: 15, tilt: 0.08, paper: '#d8c8a0', ink: '#3a3a44', rows: 3, hand: true, seed: 29, crumple: 2.6 });
    i.rod(21, 15.4, 28, 11.4, 1.5, '#f0c028');
    i.stroke(28, 11.4, 30, 10.4, 0.8, hex('#26262c'));
  },
  brecheisen: (i) => {
    i.rod(5.6, 17.4, 24.6, 3.6, 2.2, '#4a5468');
    i.tube((t) => {
      const a = 3.8 + t * 2.3;
      return [26 + Math.cos(a) * 2.8, 4.4 + Math.sin(a) * 2.8, 1];
    }, () => '#4a5468', 24);
    i.rod(3.4, 16.6, 5.8, 17.8, 2.2, '#4a5468');
    i.rod(5.6, 17.4, 9.6, 14.5, 2.5, '#c0301c');
    i.stroke(15, 10.6, 20, 6.9, 0.5, hex('#a0aec8'));
  },
  vergilbter_brief: (i) => {
    const map = sheet(i, { cx: 16, cy: 10, w: 23, h: 15.5, tilt: 0.04, paper: '#d8b868', ink: '#5a3a1c', rows: 3, hand: true, seed: 37, crumple: 1.8 });
    for (const [a, b, r] of [[0.15, 0.82, 1.6], [0.86, 0.2, 1.3], [0.78, 0.86, 1.1]] as const) {
      const [x, y] = map(a, b);
      i.ellipse(x, y, r, r * 0.8, hex('#a88440'));
    }
  },
  sicherung: (i) => {
    const rod = (x0: number, x1: number, base: string): void => {
      const c = hex(base);
      i.rect(x0, 6.2, x1 - x0, 7.6, vgrad(light(c, 0.34), shade(c, 0.55), 6.2, 13.8), 0.6);
    };
    i.rect(3, 8.4, 3.6, 3.2, hex('#c8ccd4'));
    i.rect(25.4, 8.4, 3.6, 3.2, hex('#c8ccd4'));
    rod(5.6, 26.4, '#e8e4d8');
    rod(5.4, 9.2, '#b8bcc8');
    rod(22.8, 26.6, '#b8bcc8');
    i.rect(12, 7.8, 8, 4.4, hex('#d83a28'), 0.4);
    i.stroke(13.4, 10, 18.6, 10, 0.9, hex('#fff0c0'));
  },

  wachsdose: (i) => {
    i.rect(6, 7.4, 20, 9.4, cyl('#c8a438', 6, 26), 0.6);
    i.rect(6, 9.8, 20, 5, cyl('#c02c20', 6, 26));
    i.ellipse(16, 16.8, 10, 2.2, cyl('#8e7428', 6, 26));
    i.ellipse(16, 7.4, 10, 2.6, vgrad('#7a6428', '#2a2010', 5, 10));
    i.ellipse(16, 7.8, 8.4, 1.8, vgrad('#d8d0a8', '#a89c70', 6, 9.6));
    // Der Deckel liegt schief darüber
    i.poly([[11, 4.4], [27, 1.4], [28, 3.2], [12, 6.2]], vgrad('#f0d870', '#a88a30', 1.4, 6.2));
    i.stroke(13, 11.8, 23, 11.8, 0.8, hex('#f8e4b0'));
  },
  sendeschluessel: (i) => {
    const brass = '#e0b040';
    i.tube((t) => {
      const a = t * Math.PI * 2;
      return [8.6 + Math.cos(a) * 4.6, 10 + Math.sin(a) * 4.6, 1.3];
    }, () => brass, 70);
    i.ball(8.6, 10, 2, 2, '#30a0e8');
    i.rod(14, 10, 28.4, 10, 2.3, brass);
    i.rect(22, 11, 1.8, 3.8, vgrad(brass, '#8e6a18', 11, 14.8));
    i.rect(25.6, 11, 1.8, 2.8, vgrad(brass, '#8e6a18', 11, 14));
    i.dots([[16.6, 9.8], [19, 9.8]], 0.45, hex('#40f0e0'));
  },
  brief_2015: (i) => {
    const map = sheet(i, { cx: 16, cy: 10, w: 23, h: 15.6, paper: '#f4f8fc', ink: '#404e60', rows: 3, seed: 41, first: 0.26 });
    i.rect(4.5, 2.2, 23, 1.1, hex('#30f0e0'));
    i.rect(4.5, 16.7, 23, 1.1, hex('#30f0e0'));
    const [x, y] = map(0.8, 0.68);
    for (let k = 0; k < 9; k++) {
      if ((k * 7) % 3) i.rect(x - 1.8 + (k % 3) * 1.2, y - 1.8 + Math.floor(k / 3) * 1.2, 1.2, 1.2, hex('#1c2430'));
    }
  },

  muenze_2015: (i) => {
    i.ellipse(16, 10, 8.6, 8.6, (u, v) => mix(hex('#20e8e0'), hex('#0a7088'), clamp01((u + v - 16) / 24)));
    i.ellipse(16, 10, 6.6, 6.6, ballShade('#384860', 16, 10, 6.6, 6.6));
    i.stroke(16, 6, 16, 14, 1.3, hex('#f0ffff'));
    i.stroke(14, 7.6, 18, 7.6, 1, hex('#f0ffff'));
    i.stroke(14, 12.4, 18, 12.4, 1, hex('#f0ffff'));
    i.dots([[9.8, 5.2], [22.2, 14.8]], 0.7, hex('#ffffff'));
    i.ellipse(23.4, 4.4, 1.3, 1.3, hex('#ff4a6a'));
  },
  glas: (i) => {
    i.poly([[10.6, 1.6], [21.4, 1.6], [20.2, 18.4], [11.8, 18.4]], (u) => mix(hex('#6e8ea4'), hex('#a4c8dc'), Math.exp(-(((u - 13) / 1.4) ** 2))));
    i.poly([[11, 6.6], [21, 6.6], [20, 16.6], [12, 16.6]], (u, v) => shade(mix(hex('#f4d850'), hex('#c8982c'), (v - 6.6) / 10), 0.86 + Math.exp(-(((u - 14) / 1.8) ** 2)) * 0.32));
    i.ellipse(16, 6.6, 5, 0.9, hex('#fff0a0'));
    i.dots([[14, 10], [18, 13], [17.4, 8.6]], 0.5, hex('#fff8d0'));
    // Der Daumenabdruck
    for (const r of [0.8, 1.6, 2.4]) {
      i.tube((t) => {
        const a = 3.6 + t * 4;
        return [18.2 + Math.cos(a) * r, 11 + Math.sin(a) * r * 1.3, 0.22];
      }, () => '#fffbe8', 24);
    }
    i.rect(11.6, 17.6, 8.8, 1.2, hex('#c8dce8'));
  },
  freikarte: (i) => {
    i.rect(3.4, 4, 25.2, 12, vgrad('#f4cc40', '#c88e1c', 4, 16), 0.8);
    i.dots([[3.4, 10], [28.6, 10]], 1.5, hex('#120c12'));
    i.rect(5.6, 5.8, 15.4, 8.4, vgrad('#7a1c5a', '#401040', 5.8, 14.2));
    i.poly([[13.2, 6.8], [14.3, 9.2], [16.8, 9.4], [14.8, 11], [15.5, 13.4], [13.2, 12.1], [10.9, 13.4], [11.6, 11], [9.6, 9.4], [12.1, 9.2]], hex('#f8e870'));
    for (let y = 5; y < 15.5; y += 1.8) i.ellipse(22.6, y, 0.4, 0.5, hex('#6e4a10'));
    i.stroke(24.4, 7.4, 26.8, 7.4, 0.7, hex('#6e2a10'));
    i.stroke(24.4, 10, 26.8, 10, 0.7, hex('#6e2a10'));
    i.stroke(24.4, 12.6, 26.8, 12.6, 0.7, hex('#6e2a10'));
  },
  klebeband: (i) => {
    i.rect(6, 7, 18, 7.4, cyl('#b8bcc4', 6, 24));
    i.ellipse(15, 14.4, 9, 4.4, cyl('#9098a0', 6, 24));
    i.ellipse(15, 7, 9, 4.4, vgrad('#e8ecf0', '#a8b0b8', 2.6, 11.4));
    i.ellipse(15, 7, 4.8, 2.2, vgrad('#c8a878', '#8e7048', 4.8, 9.2));
    i.ellipse(15, 7.2, 3.6, 1.5, hex('#16121a'));
    i.poly([[21, 12], [29, 13.6], [28.6, 18.6], [20.2, 16.6]], vgrad('#d0d4dc', '#a0a6b0', 12, 18));
  },
  folie: (i) => {
    i.poly([[3.4, 7], [28.6, 4.4], [29, 13], [3.8, 15.8]], (u, v) => mix(hex('#aebccc'), hex('#7a8c9c'), clamp01((v - 4) / 12 + Math.sin(u * 0.8) * 0.08)));
    i.stroke(3.6, 7.2, 28.6, 4.6, 0.7, hex('#e8f4fc'));
    for (const r of [1, 2, 3, 4]) {
      i.tube((t) => {
        const a = 3.5 + t * 4.4;
        return [16 + Math.cos(a) * r * 1.15, 11 + Math.sin(a) * r * 1.2, 0.28];
      }, () => '#203040', 36);
    }
  },
  brief_brix: (i) => envelope(i, { x: 5, y: 3, w: 22, h: 14, paper: '#fafcff', rim: '#d82040', seal: '#d82040' }),

  // Aus dem Testraum
  apfel: (i) => {
    i.ball(12.8, 11, 6, 7, '#d82c20');
    i.ball(19.2, 11, 6, 7, '#c82418');
    i.ball(16, 11, 6.4, 7.2, '#e03428');
    i.stroke(16, 5, 16.8, 1.6, 1, hex('#5a3a18'));
    i.poly([[17, 3.4], [23, 1.4], [21.4, 5]], vgrad('#6ac83c', '#38882c', 1.4, 5));
  },
  schachtel: (i) => {
    woodBox(i, 5, 6, 19, 10, 3.2, '#b88c54');
    i.rect(12.5, 9.2, 4, 10, hex('#e8d8a8'));
  },
  apfelschachtel: (i) => {
    i.ball(16, 6.6, 5, 5, '#e03428');
    i.stroke(16, 2, 16.6, 0.8, 0.8, hex('#5a3a18'));
    woodBox(i, 5, 8, 19, 9, 3, '#b88c54');
  },
  muenze: (i) => {
    i.ellipse(16, 10, 8, 8, ballShade('#e8b830', 16, 10, 9, 9));
    i.ellipse(16, 10, 6, 6, ballShade('#c89420', 17, 11, 8, 8));
    i.stroke(16, 6.8, 16, 13.2, 1.5, hex('#fff0a0'));
  },
  keks: (i) => {
    i.ellipse(16, 10, 8.4, 8, (u, v) => shade(hex('#cc9650'), 1.16 - (u + v - 16) * 0.016 + (fbm(u / 2, v / 2, 3, 61) - 0.5) * 0.4));
    i.dots([[13, 7.4], [18.6, 6.8], [20.4, 11.6], [14.2, 12.4], [17, 14.4], [11, 10.6]], 1, hex('#44260f'));
  },
};

function knallfrosch(i: Ink, burning: boolean): void {
  // Zickzack gefaltete Papierrolle
  const xs = [3.5, 8, 12.5, 17, 21.5, 25];
  for (let k = 0; k < xs.length - 1; k++) {
    const up = k % 2 === 0;
    const y0 = up ? 13.4 : 8.6;
    const y1 = up ? 8.6 : 13.4;
    i.poly(
      [[xs[k], y0], [xs[k + 1], y1], [xs[k + 1], y1 + 4.6], [xs[k], y0 + 4.6]],
      vgrad(up ? '#e8483a' : '#a81c14', up ? '#a81c14' : '#780f0a', 8, 18),
    );
    // Gelbes Band über jede Falte
    i.poly(
      [[xs[k], y0 + 1.5], [xs[k + 1], y1 + 1.5], [xs[k + 1], y1 + 2.9], [xs[k], y0 + 2.9]],
      hex(up ? '#f8d850' : '#c89c28'),
    );
  }
  const tip: readonly [number, number] = burning ? [27, 5.2] : [29, 3];
  i.tube((t) => [25 + (tip[0] - 25) * t, 11 + (tip[1] - 11) * t - Math.sin(t * 3) * 1.2, 0.5], () => '#4a4238', 28);
  if (burning) {
    i.ellipse(27.4, 4.2, 2.7, 3.5, hex('#ff7a18'));
    i.ellipse(27.4, 4.8, 1.5, 2.2, hex('#ffd040'));
    i.ellipse(27.4, 5.2, 0.7, 1, hex('#fffbe0'));
    i.dots([[23.6, 2.6], [30.4, 7.4], [24.2, 6.8]], 0.5, hex('#ffb030'));
  }
}

export const ITEM_ICONS: Record<string, () => Picture> = Object.fromEntries(
  Object.entries(ICONS).map(([name, draw]) => [
    name,
    (): Picture => {
      const ink = new Ink();
      draw(ink);
      return ink.finish();
    },
  ]),
);
