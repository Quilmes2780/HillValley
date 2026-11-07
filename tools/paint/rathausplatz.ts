import * as K from './kit.ts';
import { clamp01, fbm, grain, hex, mix, noise, Picture, ramp, shade, smooth, type RGB } from './painter.ts';

const W = 320;
const H = 144;
const HORIZON = 92;
const VP: readonly [number, number] = [150, 64];
let fassung: Fassung = 'tannen';

/** Tiefstehende Abendsonne von links: warmes Licht, lange Schatten nach rechts. */
export type Fassung = 'tannen' | 'rathaus' | '1955';

interface Mood {
  sky: readonly string[];
  cloud: readonly [string, string];
  cover: number;
  sun: string;
  ambient: string;
  wall: string;
  ground: string;
  groundWarm: string;
  groundCool: string;
  /** Wie nass und spiegelnd der Boden ist */
  wet: number;
  lamp: number;
  shadow: number;
  vignette: number;
}

const MOODS: Record<Fassung, Mood> = {
  tannen: {
    sky: ['#2c2c50', '#4e3c66', '#8e4c60', '#d4683e', '#f6a048', '#ffd488'],
    cloud: ['#3a2f4a', '#ff8a4a'],
    cover: 0.5,
    sun: '#ffb060',
    ambient: '#75648c',
    wall: '#a39699',
    ground: '#8a7c7c',
    groundWarm: '#e8924e',
    groundCool: '#4a4464',
    wet: 1,
    lamp: 1,
    shadow: 1,
    vignette: 0.32,
  },
  // Später Nachmittag in einer Stadt, der es gut geht
  rathaus: {
    sky: ['#3f7fc4', '#62a0d8', '#92c0e0', '#c8dce0', '#f4e4c0', '#fdeec8'],
    cloud: ['#8a9cb8', '#ffffff'],
    cover: 0.55,
    sun: '#ffe4a8',
    ambient: '#8c98b0',
    wall: '#c8b8a0',
    ground: '#a89a88',
    groundWarm: '#f0c890',
    groundCool: '#6a7088',
    wet: 0.12,
    lamp: 0.08,
    shadow: 0.85,
    vignette: 0.22,
  },
  // 1955: frisch gestrichen, kräftiges Blau, kaum Verkehr
  '1955': {
    sky: ['#2f8ec0', '#48a8cc', '#78c4d4', '#a8dcd8', '#e0f0d8', '#fdf6d8'],
    cloud: ['#a0c4cc', '#ffffff'],
    cover: 0.58,
    sun: '#fff0c0',
    ambient: '#8aa4b4',
    wall: '#e4d4b0',
    ground: '#b0a890',
    groundWarm: '#f4d8a0',
    groundCool: '#7a8c94',
    wet: 0.08,
    lamp: 0.04,
    shadow: 0.8,
    vignette: 0.2,
  },
};

let M: Mood = MOODS.tannen;
let SUN: RGB = hex(M.sun);
let AMBIENT: RGB = hex(M.ambient);

function sky(p: Picture): void {
  const stops = M.sky.map(hex);
  p.area(0, 0, W, HORIZON + 2, (x, y) => {
    const t = y / HORIZON;
    // Zur tiefen Sonne links hin wird der Himmel heller.
    const near = 1 - Math.hypot((x - 10) / 340, (y - 90) / 110);
    let c = ramp(stops, t ** 0.85 + clamp01(near) * 0.1);
    // Wolkenbänder, von unten angestrahlt
    const band = fbm(x / 70, y / 16 + 3, 5, 11);
    const cloud = smooth(M.cover, M.cover + 0.22, band) * (1 - t * 0.55);
    const lit = smooth(0.5, 0.8, fbm(x / 70, (y + 3) / 16 + 3, 4, 11));
    const cloudColor = mix(hex(M.cloud[0]), hex(M.cloud[1]), clamp01(t * 1.3) * (1 - lit * 0.5));
    c = mix(c, cloudColor, cloud * 0.7);
    return c;
  });
}

function skyline(p: Picture): void {
  // Zwei Reihen Hochhäuser im Dunst: Tannenburg ist größer geworden, als Hill Valley je war.
  const layer = (seed: number, base: number, spread: number, color: RGB, litChance: number): void => {
    let x = -4;
    let i = 0;
    while (x < W) {
      const w = 12 + Math.floor(noise(i, seed, 3) * 18);
      const h = base + Math.floor(noise(i, seed, 8) * spread);
      const top = HORIZON - h;
      p.area(x, top, w, h, (px, py) => {
        const edge = (px - x) / w;
        const lit = edge < 0.12 ? 1.25 : 1;
        // Fenster
        const col = Math.floor((px - x) / 4);
        const row = Math.floor((py - top) / 5);
        const on = (px - x) % 4 === 1 && (py - top) % 5 === 2 && noise(col + i * 9, row, seed) < litChance;
        if (on) return mix(color, hex('#ffcc70'), 0.75);
        return shade(color, lit);
      });
      // Dach mit Aufbau oder Antenne
      if (i % 3 === 0) p.area(x + w / 2, top - 5, 1, 5, () => shade(color, 0.9));
      x += w + Math.floor(noise(i, seed, 5) * 3);
      i++;
    }
  };
  layer(21, 30, 26, hex('#c0714f'), 0.05);
  layer(31, 16, 22, hex('#7a4a54'), 0.12);
}

/** Stein mit Fugen, Verwitterung und Schmutzfahnen. */
function stone(x: number, y: number, base: RGB, blockW = 10, blockH = 5, seed = 1): RGB {
  const row = Math.floor(y / blockH);
  const off = row % 2 ? blockW / 2 : 0;
  const bx = Math.floor((x + off) / blockW);
  const fx = (x + off) % blockW;
  const fy = y % blockH;
  const seam = fx < 1 || fy < 1;
  const tint = 0.9 + noise(bx, row, seed) * 0.2;
  const weather = 0.82 + fbm(x / 9, y / 6, 4, seed + 3) * 0.32;
  // Schmutz läuft senkrecht herunter
  const streak = 0.92 + (fbm(x / 2.6, y / 30, 3, seed + 7) - 0.5) * 0.3;
  let f = tint * weather * streak;
  if (seam) f *= 0.72;
  else if (fy === 1) f *= 1.06; // obere Kante fängt Licht
  return shade(base, f);
}

function bigBuilding(p: Picture): void {
  const wall = hex(M.wall);
  const L = 100;
  const R = 220;
  const T = 34;

  // Wand
  p.area(L, T, R - L, HORIZON - T, (x, y) => {
    let c = stone(x, y, wall, 11, 5, 4);
    // Von links streift die Sonne, nach rechts wird es kühl
    const side = (x - L) / (R - L);
    c = mix(c, shade(c, 1.2), (1 - side) * 0.35);
    c = mix(c, mix(c, AMBIENT, 0.55), side * 0.75);
    // Unten dunkler vom Straßenschmutz
    c = shade(c, 0.8 + 0.2 * smooth(HORIZON, HORIZON - 26, y));
    return c;
  });
  // Seitenwand: gibt dem Bau Körper
  p.poly([[R, T], [R + 9, T + 5], [R + 9, HORIZON - 2], [R, HORIZON]], (x, y) => shade(stone(x, y, wall, 9, 5, 6), 0.42));

  // Gesims oben, mit Licht an der Unterkante der Sonne zugewandt
  p.area(L - 3, T - 3, R - L + 6, 4, (x) => shade(hex('#918797'), 0.88 + noise(x / 5, 0, 2) * 0.24));
  p.area(L - 3, T - 3, R - L + 6, 1, (x) => mix(hex('#d6a884'), hex('#7a6f88'), (x - L) / (R - L)));
  p.area(L - 1, T + 1, R - L + 2, 2, () => hex('#2c2636'));
  p.area(L, HORIZON - 6, R - L, 6, (x, y) => shade(stone(x, y, hex('#5a5262'), 16, 6, 8), 0.75));

  // Pilaster
  for (const x of [L + 2, 136, 178, R - 6]) {
    p.area(x, T + 3, 5, HORIZON - T - 9, (px, py) => {
      const f = px === x ? 1.22 : px === x + 4 ? 0.6 : 1;
      return shade(stone(px, py, hex('#8a8192'), 5, 8, 12), f * (0.9 - ((px - L) / (R - L)) * 0.22));
    });
  }

  // Hohe Rundbogenfenster
  for (const fx of [108, 122, 190, 205]) window(p, fx, 50, 9, 22);
}

function window(p: Picture, x: number, y: number, w: number, h: number): void {
  const inside = M.lamp > 0.5 && noise(x, y, 44) > 0.42;
  const cx = x + w / 2;
  const arch = (px: number, py: number): boolean => {
    if (py >= y + w / 2) return px >= x && px < x + w;
    return Math.hypot(px + 0.5 - cx, py + 0.5 - (y + w / 2)) <= w / 2;
  };
  for (let py = y - 1; py < y + h + 1; py++) {
    for (let px = x - 1; px < x + w + 1; px++) {
      if (!arch(px, py)) {
        if (arch(px + 1, py) || arch(px - 1, py) || arch(px, py + 1)) p.blend(px, py, hex('#3a3442'), 0.8);
        continue;
      }
      const t = (py - y) / h;
      let c = inside
        ? mix(hex('#ffcf7a'), hex('#a4562e'), t * 0.9 + fbm(px / 3, py / 4, 2, 5) * 0.2)
        : mix(M.lamp > 0.5 ? hex('#354a74') : hex('#6c94b4'), M.lamp > 0.5 ? hex('#141a2c') : hex('#2c3e54'), t + 0.15);
      // Spiegelung des Abendhimmels
      if (!inside && (px - py) % 11 < 2) c = mix(c, M.lamp > 0.5 ? hex('#e08a5a') : hex('#e8f4f4'), 0.3);
      // Sprossen
      if (px === Math.floor(cx) || (py - y) % 7 === 0) c = hex('#20202a');
      p.set(px, py, c);
    }
  }
  // Fensterbank mit Schatten
  p.area(x - 1, y + h, w + 2, 2, (px) => (px < x + 2 ? hex('#a09098') : hex('#5c5462')));
  p.area(x, y + h + 2, w, 2, () => shade(hex('#4a4250'), 0.8));
  if (inside) p.glow(cx, y + h / 2, 12, hex('#ff9a40'), 0.2 * M.lamp);
}

function clockTower(p: Picture): void {
  const L = 142;
  const R = 178;
  const stoneC = hex('#857b8c');
  p.area(L, 4, R - L, 32, (x, y) => {
    const side = (x - L) / (R - L);
    const c = stone(x, y, stoneC, 9, 5, 15);
    return mix(shade(c, 1.2), mix(c, AMBIENT, 0.55), side);
  });
  p.area(L, 4, 1, 32, () => hex('#d6a884'));
  p.area(R - 1, 4, 1, 32, () => hex('#352e44'));

  // Dach in Tannen-Rot, Kupfer und Ruß
  p.poly(
    [[L - 4, 6], [160, -8], [R + 4, 6]],
    (x, y) => {
      const lines = (x + y) % 4 === 0 ? 0.8 : 1;
      const light = x < 160 ? 1.15 : 0.62;
      return shade(fassung === 'tannen' ? mix(hex('#8a2a2c'), hex('#3e1820'), fbm(x / 5, y / 5, 3, 9) * 0.7) : mix(hex('#5a9a84'), hex('#2e5e56'), fbm(x / 5, y / 5, 3, 9) * 0.8), lines * light);
    },
  );
  p.area(L - 4, 5, R - L + 8, 2, (x) => (x < 160 ? hex('#c8a07a') : hex('#4a3a48')));

  // Zifferblatt, von innen beleuchtet
  const cx = 160;
  const cy = 22;
  for (let y = 8; y < 36; y++) {
    for (let x = 146; x < 174; x++) {
      const d = Math.hypot(x + 0.5 - cx, y + 0.5 - cy);
      if (d > 12) continue;
      if (d > 11) p.set(x, y, x < cx ? hex('#c9a26a') : hex('#4f3e30'));
      else if (d > 10) p.set(x, y, hex('#2a2230'));
      else p.set(x, y, mix(hex('#fff2bc'), hex('#d8a860'), d / 10 + fbm(x / 4, y / 4, 2, 2) * 0.15));
    }
  }
  for (let i = 0; i < 12; i++) {
    const a = (i / 12) * Math.PI * 2;
    const r = i % 3 === 0 ? 7.5 : 8.5;
    p.line(cx + Math.cos(a) * r, cy + Math.sin(a) * r, cx + Math.cos(a) * 9.6, cy + Math.sin(a) * 9.6, hex('#3a2a20'), 1, 0.9);
  }
  // 1955 steht die Uhr seit dem Blitz.
  if (fassung === '1955') {
    p.line(cx, cy, cx - 5, cy - 3, hex('#1a1414'), 1.6);
    p.line(cx, cy, cx + 1, cy - 8, hex('#1a1414'), 1.4);
  } else {
    p.line(cx, cy, cx, cy - 8, hex('#1a1414'), 1.4);
    p.line(cx, cy, cx + 6, cy + 1, hex('#1a1414'), 1.6);
  }
  p.glow(cx, cy, 22, hex('#ffb860'), 0.28 * M.lamp);
}

function entrance(p: Picture): void {
  // Portal mit tiefer Laibung
  const x = 146;
  const y = 60;
  const w = 28;
  const h = 32;
  p.area(x - 4, y - 4, w + 8, h + 4, (px, py) => {
    const f = px < x - 2 ? 1.15 : px >= x + w + 2 ? 0.55 : 0.85;
    return shade(stone(px, py, hex('#8b8290'), 7, 6, 18), f);
  });
  p.area(x - 1, y - 1, w + 2, h + 1, (px) => (px < x + 2 ? hex('#1a1520') : hex('#2a2230')));
  p.area(x, y, w, h, (px, py) => {
    const seam = px === x + 13 || px === x + 14;
    if (seam) return hex('#140d0a');
    // Holzmaserung und Kassetten
    const plank = fbm(px / 1.6, py / 18, 3, 25);
    let c = mix(hex('#3e2214'), hex('#7a4522'), plank);
    const leaf = px < x + 14 ? px - x : px - x - 14;
    const inPanel = leaf > 2 && leaf < 11 && ((py - y > 3 && py - y < 13) || (py - y > 17 && py - y < 28));
    if (inPanel) c = shade(c, 0.72);
    if (!inPanel && leaf > 1 && leaf < 12 && (py - y === 3 || py - y === 17)) c = shade(c, 1.25);
    return shade(c, 0.95 - (py - y) * 0.006);
  });
  // Griffe
  p.area(x + 11, y + 15, 1, 5, () => hex('#e8c060'));
  p.area(x + 16, y + 15, 1, 5, () => hex('#a0803c'));
  // Wandlaternen
  for (const lx of [x - 7, x + w + 6]) {
    p.area(lx, y + 6, 3, 7, () => hex('#ffe28a'));
    p.area(lx - 1, y + 5, 5, 1, () => hex('#1a1820'));
    p.area(lx - 1, y + 13, 5, 1, () => hex('#1a1820'));
    p.glow(lx + 1, y + 9, 20, hex('#ffa848'), 0.42 * M.lamp);
  }
  // Treppenstufen
  p.area(x - 8, HORIZON - 2, w + 16, 2, (px) => shade(hex('#7a7280'), 1 - ((px - x) / w) * 0.3));
}

function banner(p: Picture): void {
  if (fassung !== 'tannen') {
    // Eingemeißelt statt montiert
    p.area(136, 40, 48, 11, (x, y) => mix(hex('#3a3430'), hex('#26221f'), (y - 40) / 11 + noise(x / 7, 2, 3) * 0.2));
    p.area(136, 40, 48, 1, () => shade(hex(M.wall), 1.25));
    p.area(136, 50, 48, 1, () => hex('#14100e'));
    K.lettering(p, 'RATHAUS', 142, 40, hex('#f4e4b8'));
    return;
  }
  // Das Schild ist neuer als das Haus und auch so montiert.
  p.area(118, 40, 84, 11, (x, y) => {
    const n = fbm(x / 8, y / 3, 3, 30);
    return mix(hex('#7a1518'), hex('#3a080c'), n + (y - 40) / 18);
  });
  p.area(118, 40, 84, 1, () => hex('#e8b050'));
  p.area(118, 50, 84, 1, () => hex('#7a5022'));
  K.lettering(p, 'TANNEN-TURM', 133, 39, hex('#ffe08a'), hex('#ff8a30'), 0.03, 'block');
  p.glow(160, 45, 42, hex('#ff5030'), 0.1, 0.4);
}

function grundstein(p: Picture): void {
  p.area(104, 80, 18, 12, (x, y) => {
    const f = x < 106 ? 1.2 : x > 119 ? 0.7 : 1;
    return shade(mix(hex('#9a8f90'), hex('#6e6470'), fbm(x / 4, y / 3, 3, 40)), f);
  });
  p.area(104, 80, 18, 1, () => hex('#c0b0a8'));
  // Eingemeißelte Jahreszahl als Andeutung
  p.area(108, 84, 10, 1, () => hex('#4a4250'));
  p.area(108, 87, 10, 1, () => hex('#4a4250'));
}

function bank(p: Picture): void {
  const L = 232;
  const R = 298;
  const T = 44;
  p.area(L, T, R - L, HORIZON - T, (x, y) => {
    const c = stone(x, y, fassung === 'tannen' ? hex('#6c6474') : hex('#b0a498'), 12, 6, 50);
    return shade(mix(c, AMBIENT, 0.35), 0.74 + 0.26 * smooth(HORIZON, T + 14, y));
  });
  p.area(L, T, 1, HORIZON - T, () => hex('#c49a78'));
  // Dreiecksgiebel
  p.poly([[L - 3, T], [(L + R) / 2, T - 10], [R + 3, T]], (x, y) => shade(stone(x, y, fassung === 'tannen' ? hex('#5a5262') : hex('#a89a8c'), 8, 4, 53), x < (L + R) / 2 ? 1.05 : 0.72));
  // Säulen vor dunklem Grund
  p.area(L + 4, T + 12, R - L - 8, HORIZON - T - 12, (x) => shade(hex('#1a1820'), 1 + (x % 7) * 0.02));
  for (let x = L + 5; x < R - 6; x += 14) {
    p.area(x, T + 12, 5, HORIZON - T - 14, (px, py) => {
      const lit = 1.3 - ((px - x) / 5) * 0.9;
      return shade(mix(fassung === 'tannen' ? hex('#9a9098') : hex('#e4dccc'), fassung === 'tannen' ? hex('#6e6470') : hex('#a89c8c'), fbm(px, py / 8, 2, 55)), lit);
    });
    p.area(x - 1, T + 12, 7, 2, () => hex('#a89aa0'));
  }
  if (fassung === 'tannen') {
    // Neonschild
    p.area(L, T, R - L, 11, (x, y) => mix(hex('#5a1014'), hex('#2a060a'), (y - T) / 11 + noise(x / 6, 3, 2) * 0.2));
    p.area(L, T + 10, R - L, 1, () => hex('#ffb040'));
    K.lettering(p, 'TANNEN BANK', 234, T - 1, hex('#fff2b0'), hex('#ff7a20'), 0.05, 'block');
    p.glow((L + R) / 2, T + 6, 48, hex('#ff5a20'), 0.14, 0.5);
  } else {
    p.area(L, T, R - L, 11, (x, y) => mix(hex('#3a3430'), hex('#26221f'), (y - T) / 11 + noise(x / 7, 2, 3) * 0.2));
    p.area(L, T, R - L, 1, () => hex('#c8b8a0'));
    p.area(L, T + 10, R - L, 1, () => hex('#14100e'));
    K.lettering(p, 'BANK', 256, T, hex('#f4e4b8'));
  }
}

function column(p: Picture): void {
  // Gusseiserne Lautsprechersäule
  const x = 38;
  p.area(x, 30, 14, HORIZON - 30, (px, py) => {
    const f = 0.55 + (1 - (px - x) / 14) * 0.85;
    const rib = (px - x) % 3 === 0 ? 0.8 : 1;
    const rust = fbm(px / 2, py / 7, 3, 61);
    return shade(mix(hex('#3c3a44'), hex('#5a3a2c'), smooth(0.55, 0.8, rust)), f * rib);
  });
  p.area(x - 2, HORIZON - 5, 18, 5, (px) => shade(hex('#34323c'), 1.3 - ((px - x) / 18) * 0.9));
  // Trichter
  p.poly(
    [[34, 16], [56, 16], [51, 30], [39, 30]],
    (px) => shade(hex('#4a4852'), 1.35 - ((px - 34) / 22) * 1),
  );
  p.area(37, 19, 16, 4, (px) => mix(hex('#0a0a10'), hex('#22222c'), (px - 37) / 16));
  p.area(34, 15, 22, 1, () => hex('#c49a78'));
  // Anschlusskasten
  p.area(40, 66, 10, 10, (px, py) => shade(hex('#6c6a72'), 1.25 - (px - 40) * 0.05 - (py - 66) * 0.01));
  p.area(40, 66, 1, 10, () => hex('#a8a2a0'));
  p.area(49, 66, 1, 10, () => hex('#26242c'));
  p.area(40, 75, 10, 1, () => hex('#26242c'));
  p.area(44, 70, 2, 2, () => hex('#e8c060'));
}

function billboard(p: Picture): void {
  for (const x of [66, 86]) {
    p.area(x, 56, 3, HORIZON - 56, (px) => shade(hex('#2a2830'), px === x ? 1.8 : 1));
  }
  p.area(60, 34, 34, 22, (x, y) => mix(hex('#9e1c1c'), hex('#4a0c10'), (y - 34) / 26 + fbm(x / 5, y / 4, 3, 66) * 0.25));
  p.area(60, 34, 34, 1, () => hex('#ffc860'));
  p.area(60, 55, 34, 1, () => hex('#a06a24'));
  p.area(60, 34, 1, 22, () => hex('#ffc860'));
  p.area(93, 34, 1, 22, () => hex('#a06a24'));
  // Ein Gesicht, das einem überallhin folgt: nur als Schattenriss
  p.poly([[73, 52], [73, 44], [76, 39], [80, 38], [84, 40], [85, 45], [84, 49], [86, 52]], hex('#23060a'));
  K.lettering(p, 'B.T.', 62, 45, hex('#ffe08a'), hex('#ff8a30'), 0.02, 'block');
  // Lampenarm wirft Licht von oben auf die Tafel
  p.glow(77, 33, 26, hex('#ffc070'), 0.22, 0.6);
}

function plaza(p: Picture): void {
  const pavement = hex(M.ground);
  p.area(0, HORIZON, W, H - HORIZON, (x, y) => {
    const depth = (y - VP[1]) / (H - VP[1]);
    const u = ((x - VP[0]) / (y - VP[1])) * 8.5;
    const v = 170 / (y - VP[1]);
    const row = Math.floor(v * 3);
    const col = Math.floor(u + (row % 2) * 0.5);
    const fu = u + (row % 2) * 0.5 - col;
    const fv = v * 3 - row;
    const seam = fu < 0.1 || fv < 0.14;
    const tone = 0.8 + noise(col, row, 71) * 0.42;
    let c = shade(pavement, seam ? tone * 0.58 : tone);
    // Warmes Streiflicht von links, kühl nach rechts und hinten
    c = mix(c, hex(M.groundWarm), 0.42 * (1 - x / W) * (1 - depth * 0.3));
    c = mix(c, hex(M.groundCool), 0.22 * (x / W));
    // Oben etwas Dunst
    c = mix(c, hex(M.groundWarm), smooth(HORIZON + 14, HORIZON, y) * 0.2);
    return c;
  });

  // Nasser Boden spiegelt die Lichter und die Fassade
  const src = new Picture(W, H);
  src.px.set(p.px);
  for (let y = HORIZON; y < H; y++) {
    for (let x = 0; x < W; x++) {
      const dist = y - HORIZON;
      const wobble = (fbm(x / 7, y / 2.2, 3, 80) - 0.5) * 4;
      const sy = HORIZON - dist * 1.6 - 1;
      const refl = src.get(x + wobble, sy);
      const wet = smooth(0.5, 0.7, fbm(x / 26, y / 7, 4, 90));
      const a = (0.1 + wet * 0.5) * (1 - dist / 52) * M.wet;
      p.blend(x, y, refl, a);
    }
  }
}

function shadows(p: Picture): void {
  const dark: RGB = hex('#100c1c');
  // Lange Schlagschatten nach rechts vorn, von der tiefen Sonne
  p.softPoly([[38, 92], [52, 92], [136, 126], [106, 128]], dark, 0.34 * M.shadow, 3);
  if (fassung === 'tannen') {
    p.softPoly([[66, 92], [69, 92], [134, 112], [126, 113]], dark, 0.26, 2);
    p.softPoly([[86, 92], [89, 92], [152, 112], [145, 113]], dark, 0.26, 2);
  }
  p.softPoly([[100, 92], [224, 92], [320, 118], [320, 144], [230, 144]], dark, 0.2 * M.shadow, 7);
  p.softPoly([[232, 92], [298, 92], [320, 104], [320, 122]], dark, 0.16 * M.shadow, 5);
  // Kontaktschatten an den Hauskanten
  p.area(0, HORIZON, W, 2, (x, y) => mix(p.get(x, y), dark, 0.45));
}

function lamps(p: Picture): void {
  // Zwei Straßenlaternen geben dem Vordergrund Tiefe und rahmen das Bild
  for (const [x, top, base] of [[16, 34, 118], [309, 42, 104]] as const) {
    p.area(x, top, 2, base - top, (px) => (px === x ? hex('#3a3644') : hex('#0e0c14')));
    p.area(x - 3, base - 2, 8, 2, () => hex('#0e0c14'));
    p.area(x - 3, top - 8, 8, 8, () => mix(hex('#c8d4d8'), hex('#ffe9a8'), M.lamp));
    p.area(x - 4, top - 9, 10, 1, () => hex('#0e0c14'));
    p.area(x - 4, top, 10, 1, () => hex('#0e0c14'));
    p.glow(x + 1, top - 4, 38, hex('#ffb060'), 0.36 * M.lamp);
    p.glow(x + 1, base, 44, hex('#ff9840'), 0.2 * M.lamp, 0.35);
  }
}

/** Laubkrone mit Sonnenkante links: bringt etwas Natürliches zwischen die Rechtecke. */
function tree(p: Picture, cx: number, top: number, r: number, base: number, seed: number): void {
  // Stamm
  p.area(cx - 1, top + r, 3, base - top - r, (x) => shade(hex('#2c2024'), x === cx - 1 ? 1.8 : 1));
  for (let y = top - 4; y < top + r * 2.2; y++) {
    for (let x = Math.floor(cx - r * 1.4); x < cx + r * 1.4; x++) {
      const dx = (x - cx) / (r * 1.2);
      const dy = (y - (top + r)) / r;
      const edge = 1 - Math.hypot(dx, dy) + (fbm(x / 3.2, y / 3.2, 3, seed) - 0.5) * 0.9;
      if (edge <= 0) continue;
      // Tupfen wie mit dem Pinsel gesetzt
      const dab = fbm(x / 2, y / 2, 2, seed + 4);
      const lit = clamp01(0.55 - dx * 0.75 - dy * 0.35 + (dab - 0.5) * 1.1);
      const [d, m, l] = fassung === 'tannen' ? ['#1e2a26', '#4a5a34', '#e8a24c'] : ['#1f4030', '#3f7a44', '#c0dc78'];
      p.set(x, y, mix(mix(hex(d), hex(m), lit), hex(l), smooth(0.65, 1, lit) * 0.75));
    }
  }
}

/** Kabel, Fahnen und Sockel: die Kleinigkeiten, die einen Ort bewohnt wirken lassen. */
function details(p: Picture): void {
  // Oberleitungen quer über den Platz
  p.line(0, 22, 142, 12, hex('#1e1a28'), 0.8, 0.8, 0, 1);
  p.line(178, 12, 320, 28, hex('#1e1a28'), 0.8, 0.8, 0, 2);
  // Tannen-Fahnen an der Fassade
  for (const x of fassung === 'tannen' ? [130, 186] : []) {
    p.area(x, 53, 1, 26, () => hex('#2a2430'));
    p.poly([[x + 1, 54], [x + 9, 56], [x + 8, 68], [x + 1, 70]], (px, py) =>
      mix(hex('#c8302a'), hex('#5a1218'), (px - x) / 12 + fbm(px / 3, py / 6, 2, 8) * 0.35),
    );
    p.area(x + 3, 60, 4, 3, () => hex('#e8c060'));
  }
  // Blumenkübel neben dem Portal
  for (const x of [129, 183]) {
    p.area(x, 86, 8, 6, (px) => shade(hex('#6a5a58'), 1.2 - (px - x) * 0.07));
    for (let i = 0; i < 24; i++) {
      const bx = x + noise(i, x, 3) * 8;
      const by = 80 + noise(i, x, 7) * 7;
      p.blend(Math.round(bx), Math.round(by), noise(i, x, 9) > 0.5 ? hex('#3e6a30') : fassung === 'tannen' ? hex('#8a7a34') : hex('#d84a4a'), 0.9);
    }
  }
  // Bordstein trennt Platz und Haus
  p.area(0, HORIZON, W, 1, (x) => mix(shade(hex(M.groundWarm), 0.9), shade(hex(M.groundCool), 0.8), x / W));
}

/** Ladenzeile von 1955: Markise, Schaufenster, handgemaltes Schild. */
function shop(p: Picture, x: number, w: number, doorX: number, wallC: string, awning: readonly [string, string], name: string, nameX: number, ware: (px: number, py: number) => RGB | null): void {
  const top = 40;
  p.area(x, top, w, HORIZON - top, (px, py) => {
    const c = stone(px, py, hex(wallC), 7, 3, 80 + x);
    return shade(c, 1.1 - ((px - x) / w) * 0.25 - smooth(HORIZON - 12, HORIZON, py) * 0.14);
  });
  p.area(x, top - 2, w, 2, () => shade(hex(wallC), 0.6));
  p.area(x, top, w, 11, (px, py) => mix(hex(awning[1]), shade(hex(awning[1]), 0.72), (py - top) / 11 + noise(px / 8, 1, 3) * 0.1));
  p.area(x, top, w, 1, () => shade(hex(awning[1]), 1.5));
  K.lettering(p, name, nameX, top, hex('#fff6dc'));
  // Gestreifte Markise wirft Schatten aufs Glas
  for (let py = 51; py < 56; py++) {
    p.area(x + 1, py, w - 2, 1, (px) => {
      const c = Math.floor((px - x) / 5) % 2 ? hex(awning[0]) : hex('#f8f0dc');
      return shade(c, 1.1 - (py - 51) * 0.08);
    });
  }
  p.area(x + 1, 56, w - 2, 3, (px, py) => mix(p.get(px, py), hex('#1a1820'), 0.5 - (py - 56) * 0.12));
  // Schaufenster links und rechts der Tür
  const glass = (gx: number, gw: number): void => {
    K.box(p, gx - 1, 59, gw + 2, 19, K.paint(hex('#3a3430')), { light: 0.1 });
    p.area(gx, 60, gw, 17, (px, py) => {
      const w2 = ware(px - gx, py - 60);
      if (w2) return w2;
      return mix(hex('#3c5468'), hex('#1a2430'), (py - 60) / 17 + fbm(px / 5, py / 3, 2, 3) * 0.2);
    });
    p.line(gx + 1, 76, gx + gw * 0.5, 60, hex('#ffffff'), 2, 0.16);
  };
  if (doorX - x > 10) glass(x + 5, doorX - x - 9);
  if (x + w - doorX - 26 > 10) glass(doorX + 26, x + w - doorX - 31);
  K.door(p, doorX, 56, 22, 36, K.paint(hex(awning[0])), hex('#f4ecd8'));
  p.area(doorX + 4, 60, 14, 12, (px, py) => mix(hex('#3c5468'), hex('#6c8ca0'), (px - py) * 0.01 + 0.4));
}

function shops1955(p: Picture): void {
  shop(p, 8, 82, 40, '#c87c6c', ['#3a9a94', '#2c7a78'], 'LOU', 58, (x, y) => {
    // Hocker und Theke im Schaufenster
    if (y > 12) return mix(hex('#a83a2c'), hex('#6a2018'), (y - 12) / 5);
    if (y > 9 && x % 7 < 3) return hex('#c8c8c8');
    return null;
  });
  shop(p, 230, 68, 254, '#d8b868', ['#d07a30', '#a85a20'], 'RADIO', 249, (x, y) => {
    // Radios im Regal
    const gx = x % 8;
    const gy = y % 8;
    if (gx < 6 && gy < 6) {
      if (gy > 3 && gx > 1 && gx < 4) return hex('#f4d890');
      return mix(hex('#8a5a30'), hex('#4c2e18'), gy / 6);
    }
    return null;
  });
}

function rails(p: Picture): void {
  // Schwellen, Schotter und Schienen für die Rückkehr des Zuges
  p.area(0, 128, W, 14, (x, y) => mix(p.get(x, y), shade(hex('#6c6458'), 0.76 + fbm(x / 1.4, y / 1.2, 2, 6) * 0.5), 0.7));
  for (let x = 2; x < W; x += 10) {
    p.area(x, 129, 5, 13, (px, py) => shade(K.wood(hex('#5a4030'), true, 5)(px, py), px === x ? 1.3 : 1));
  }
  for (const y of [131, 138]) {
    p.area(0, y, W, 2, (x, py) => (py === y ? mix(hex('#e8e4dc'), hex('#a8a4a0'), noise(x / 8, y, 3)) : hex('#3e3a3c')));
    p.area(0, y + 2, W, 1, (x, py) => mix(p.get(x, py), hex('#14100c'), 0.6));
  }
}

export function paintRathausplatz(variante: Fassung = 'tannen'): Picture {
  fassung = variante;
  M = MOODS[variante];
  SUN = hex(M.sun);
  AMBIENT = hex(M.ambient);
  const p = new Picture(W, H);
  sky(p);
  if (variante === 'tannen') skyline(p);
  else if (variante === 'rathaus') K.skylineLayer(p, 21, 8, 10, hex('#a8b8c4'), 0.02);
  else K.tree(p, 300, 44, 14, HORIZON, 75, hex('#1f4030'), hex('#3f7a44'), hex('#c0dc78'));

  // Sonnendunst vor der Stadt
  p.area(0, 40, W, HORIZON - 40, (x, y) => mix(p.get(x, y), SUN, smooth(50, HORIZON, y) * 0.22 * (1 - x / 500)));

  if (variante !== '1955') {
    tree(p, 224, 42, 11, HORIZON, 71);
    bank(p);
  }
  tree(p, 98, 46, 10, HORIZON, 73);
  bigBuilding(p);
  clockTower(p);
  entrance(p);
  banner(p);
  grundstein(p);
  if (variante === 'tannen') billboard(p);
  if (variante === '1955') shops1955(p);
  else column(p);
  details(p);
  plaza(p);
  shadows(p);
  if (variante !== '1955') lamps(p);
  if (variante === 'rathaus') rails(p);

  // Letzter Dunst und Kinostimmung
  p.grade((c, _x, y) => {
    const haze = smooth(70, 92, y) * smooth(112, 92, y) * 0.1;
    const warm = mix(c, SUN, haze);
    return [warm[0] * 1.04, warm[1] * 0.98, warm[2] * 0.97];
  });
  p.vignette(M.vignette);
  p.grade((c, x, y) => {
    const g = grain(x, y, 7) * 3;
    return [c[0] + g, c[1] + g, c[2] + g];
  });
  return p;
}