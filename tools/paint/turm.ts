import * as K from './kit.ts';
import { clamp01, fbm, hex, mix, noise, type Picture, shade, smooth, type RGB } from './painter.ts';

const star = (p: Picture, cx: number, cy: number, r: number, c: RGB, teeth = 12): void => {
  for (let y = Math.floor(cy - r - 2); y <= cy + r + 2; y++) {
    for (let x = Math.floor(cx - r - 2); x <= cx + r + 2; x++) {
      const d = Math.hypot(x - cx, y - cy);
      const a = Math.atan2(y - cy, x - cx);
      const edge = r + (Math.sin(a * teeth) > 0 ? 1.8 : 0);
      if (d > edge || d < r * 0.2) continue;
      const hub = d < r * 0.38;
      const spoke = !hub && d < r * 0.76 && Math.abs(Math.sin(a * 2)) > 0.32;
      if (spoke) continue;
      const light = clamp01(0.55 - ((x - cx) / r) * 0.35 - ((y - cy) / r) * 0.45);
      p.set(x, y, shade(c, 0.5 + light * 0.95 + fbm(x / 3, y / 3, 2, 7) * 0.14 + (d > r ? 0.12 : 0)));
    }
  }
  p.glow(cx - r * 0.35, cy - r * 0.35, r * 0.5, hex('#ffe0a0'), 0.05);
};

const dial = (p: Picture, x: number, y: number, r: number, frame: RGB, face: RGB, tick: number): void => {
  for (let py = Math.floor(y - r); py <= y + r; py++) {
    for (let px = Math.floor(x - r); px <= x + r; px++) {
      const d = Math.hypot(px - x, py - y);
      if (d > r) continue;
      if (d > r - 2) p.set(px, py, shade(frame, 1.1 - (px - x + py - y) / (r * 3)));
      else p.set(px, py, shade(face, 0.9 + fbm(px / 3, py / 3, 2, 5) * 0.2));
    }
  }
  p.set(x, y, hex('#1a1414'));
  const h = (tick * 1.7) % (Math.PI * 2);
  const m = (tick * 4.3) % (Math.PI * 2);
  p.line(x, y, x + Math.cos(h) * (r - 4), y + Math.sin(h) * (r - 4), hex('#1a1414'), 1.3);
  p.line(x, y, x + Math.cos(m) * (r - 3), y + Math.sin(m) * (r - 3), hex('#3a2020'), 1);
};

/** Tief stehendes Licht aus dem Dachfenster macht aus dem Maschinenraum eine Kathedrale. */
export function uhrwerk(era: 1955 | 1986 | 1885): Picture {
  const p = K.picture();
  const stoneC = era === 1885 ? hex('#8a6c4e') : era === 1955 ? hex('#6c6456') : hex('#4c4656');
  const light = era === 1885 ? hex('#ffc070') : era === 1955 ? hex('#fff0c0') : hex('#c8c4e0');
  K.room(p, {
    wall: K.stone(stoneC, 16, 8, 80 + era),
    floor: K.planks(shade(stoneC, 0.75), 8, false, 81),
    skirt: shade(stoneC, 0.6),
    ceiling: hex('#0e0c14'),
    ceilingAmount: 0.8,
  });
  // Boden: Dielen in Fluchtperspektive
  p.area(0, 88, K.W, K.H - 88, K.woodFloor(era === 1885 ? hex('#9a7040') : hex('#6c543c'), 88, 82));
  p.area(0, 88, K.W, 8, (x, y) => mix(p.get(x, y), hex('#0a0810'), (1 - (y - 88) / 8) * 0.35));

  // Rückseite des Zifferblatts: Licht von draußen fällt durch das Milchglas
  const cx = 165;
  const cy = 32;
  for (let y = cy - 28; y <= cy + 28; y++) {
    for (let x = cx - 33; x <= cx + 33; x++) {
      const d = Math.hypot(x - cx, (y - cy) * 1.14);
      if (d > 31) continue;
      if (d > 28) {
        p.set(x, y, shade(hex('#6a5a4a'), 1.15 - (x - cx) * 0.012));
        continue;
      }
      p.set(x, y, mix(mix(hex('#fff4c8'), light, 0.5), shade(light, 0.62), d / 32 + fbm(x / 7, y / 7, 3, 83) * 0.14));
    }
  }
  for (let i = 0; i < 12; i++) {
    const a = (i / 12) * Math.PI * 2;
    p.line(cx + Math.cos(a) * 21, cy + Math.sin(a) * 18, cx + Math.cos(a) * 26, cy + Math.sin(a) * 23, hex('#3a2c20'), i % 3 ? 1 : 2, 0.85);
  }
  for (const a of [-1.2, 0.5, 2.0]) p.line(cx, cy, cx + Math.cos(a) * 28, cy + Math.sin(a) * 24, hex('#4a3a2c'), 1, 0.7);
  // 1955 steht die Uhr seit dem Blitz: Rußspuren
  if (era === 1955) {
    p.line(cx, cy, cx + 8, cy - 8, hex('#141014'), 1.6);
    p.line(cx, cy, cx - 2, cy - 15, hex('#141014'), 1.2);
  } else {
    p.line(cx, cy, cx - 8, cy - 7, hex('#141014'), 1.6);
    p.line(cx, cy, cx + 13, cy + 3, hex('#141014'), 1.2);
  }
  // Staubige Lichtkegel vom Zifferblatt in den Raum
  p.beam([[140, 40], [190, 40], [240, 132], [86, 132]], light, 0.11);
  p.glow(cx, cy, 58, light, 0.2);
  K.sunPatch(p, [[108, 92], [222, 92], [260, 142], [66, 142]], light, 0.12);

  // Zahnräder
  const brass = era === 1885 ? hex('#c49450') : hex('#a88a4c');
  const iron = hex('#54505c');
  star(p, 60, 46, 22, iron, 14);
  star(p, 96, 30, 16, brass, 12);
  star(p, 112, 58, 13, shade(brass, 0.82), 11);
  star(p, 37, 22, 8, shade(brass, 0.7), 9);
  star(p, 121, 22, 6, iron, 7);
  // Wellen und Streben
  p.line(0, 72, 150, 72, hex('#2a262e'), 3);
  p.line(0, 71, 150, 71, hex('#807a84'), 1, 0.7);
  p.line(60, 46, 165, 32, hex('#2a262e'), 2.2);
  p.line(60, 45, 165, 31, hex('#a09a94'), 0.8, 0.6);
  // Pendel und Gewichte
  p.area(130, 58, 1, 28, () => hex('#2c2830'));
  K.box(p, 127, 80, 7, 8, K.metal(hex('#6a6470')), { light: 0.4 });
  p.area(196, 0, 1, 56, () => hex('#2c2830'));
  K.box(p, 193, 50, 7, 10, K.metal(hex('#6a6470')), { light: 0.4 });

  // Weg nach unten
  if (era === 1885) {
    // Noch keine Treppe: eine Leiter aus dem Gerüst
    p.area(4, 34, 26, 54, (x, y) => mix(hex('#100c08'), hex('#2a1e14'), (y - 34) / 54 + noise(x, 2, 3) * 0.1));
    for (const x of [9, 24]) p.area(x, 30, 2, 58, (px, py) => K.wood(hex('#8a6438'), true, x)(px, py));
    for (let y = 36; y < 88; y += 7) p.area(9, y, 17, 2, (px, py) => K.wood(hex('#a07a48'), false, y)(px, py));
    // Baugerüst und Kiste
    for (const x of [262, 298]) K.box(p, x, 0, 5, 88, K.wood(hex('#7a5a34'), true, x), { light: 0.3 });
    p.line(262, 20, 302, 56, hex('#6a4c2c'), 2);
    K.box(p, 258, 40, 44, 3, K.wood(hex('#8a6a40'), false, 2), { light: 0.2 });
    K.contact(p, 52, 88, 44, 0.5, 4);
    K.box(p, 52, 46, 44, 42, K.planks(hex('#8e693c'), 8, true, 84), { light: 0.3 });
    for (const y of [46, 66, 85]) p.area(52, y, 44, 3, (x, py) => shade(K.wood(hex('#a07a48'), false, 3)(x, py), 1.1));
    star(p, 72, 36, 10, shade(brass, 0.9), 10);
    star(p, 86, 42, 6, iron, 8);
  } else {
    // Wendeltreppe
    p.area(4, 34, 26, 54, (_x, y) => mix(hex('#100c14'), hex('#2a2632'), (y - 34) / 54));
    for (let i = 0; i < 6; i++) {
      const y = 82 - i * 9;
      const inset = i % 2 ? 4 : 8;
      K.box(p, 6 + inset / 2, y, 22 - inset, 4, K.wood(hex('#7a6248'), false, i), { light: 0.2 });
    }
    p.line(4, 88, 4, 34, hex('#2a2632'), 2);
    p.line(30, 88, 30, 34, hex('#0e0c12'), 2);
  }

  // Chronopost: Messingkasten, fest im Mauerwerk
  K.contact(p, 206, 88, 60, 0.5, 4);
  if (era === 1885) {
    // Wartet noch auf Doc: Gestell mit Fach und Wählrad
    p.area(206, 46, 60, 42, (x, y) => mix(p.get(x, y), hex('#0c0810'), 0.35 + (y - 46) * 0.003));
  }
  brassBox(p, era);
  // Sendehebel
  K.box(p, 269, 60, 8, 12, K.metal(hex('#5a5660')), { light: 0.3 });
  p.line(273, 64, 277, 44, hex('#26242c'), 2.2);
  p.line(273, 64, 276, 44, hex('#b8b4b0'), 0.8);
  p.area(274, 41, 6, 5, (x, y) => mix(hex('#d84030'), hex('#801c18'), (x - 274) / 6 + (y - 41) * 0.05));

  K.finish(p, { tint: light, tintAmount: 0.08, vignette: 0.56, vigColor: hex('#06040a') });
  return p;
}

function brassBox(p: Picture, era: number): void {
  const metalC = era === 1885 ? hex('#c49450') : hex('#b08e4a');
  K.box(p, 206, 46, 60, 42, K.metal(metalC, 86), { light: 0.35, rim: hex('#ffe9a8'), dark: hex('#3a2a14') });
  for (const y of [46, 84]) p.area(206, y, 60, 2, (x) => shade(metalC, 0.82 + ((x * 3) % 5) * 0.02));
  for (const [x, y] of [[209, 49], [262, 49], [209, 83], [262, 83]] as const) {
    p.set(x, y, hex('#fff0c0'));
    p.set(x + 1, y + 1, hex('#5a4220'));
  }
  // Einwurfschlitz
  K.box(p, 212, 52, 22, 3, K.solid(hex('#0c0808')), { rim: hex('#2a2018'), dark: hex('#e8c878') });
  // Empfangsfach
  K.box(p, 212, 72, 22, 10, K.wood(hex('#4c2e18'), false, 87), { light: 0.2 });
  p.area(214, 74, 18, 6, (x, y) => mix(hex('#0c0808'), hex('#2a1a10'), (y - 74) / 6 + x * 0.001));
  // Wählrad
  for (let y = 54; y < 70; y++) {
    for (let x = 238; x < 254; x++) {
      const d = Math.hypot(x + 0.5 - 246, y + 0.5 - 62);
      if (d > 8) continue;
      const a = Math.atan2(y - 62, x - 246);
      p.set(x, y, shade(hex('#d07a3a'), 1.15 - (x - 246 + y - 62) / 20 + (d > 6.8 && Math.sin(a * 10) > 0 ? 0.25 : 0)));
    }
  }
  p.area(245, 56, 2, 5, () => hex('#fff4dc'));
  K.box(p, 238, 74, 16, 6, K.solid(hex('#1c1c1c')), { rim: hex('#e8c878'), dark: hex('#5a4220') });
  // Leitung nach oben
  p.area(258, 0, 2, 46, (x) => (x === 258 ? hex('#6a6460') : hex('#262228')));
}

export function turmeingang(): Picture {
  const p = K.picture();
  K.room(p, {
    wall: K.stone(hex('#8c7c6c'), 18, 9, 90),
    floor: K.checkerFloor(hex('#a89478'), hex('#5a4c40'), 88, 91),
    skirt: hex('#4a3c34'),
    ceiling: hex('#14100e'),
    ceilingAmount: 0.7,
  });
  // Licht aus der Tür und von den Schaukastenlampen
  p.beam([[14, 24], [50, 24], [110, 140], [8, 140]], hex('#ffe4b0'), 0.12);
  K.door(p, 14, 24, 36, 64, K.planks(hex('#6a4426'), 7, true, 92), hex('#a89478'));

  // Schaukasten mit Stadtgeschichte
  K.box(p, 92, 28, 44, 34, K.wood(hex('#5e3a20'), true, 93), { light: 0.2 });
  p.area(96, 32, 36, 26, (_x, y) => mix(hex('#3a3430'), hex('#201c1c'), (y - 32) / 26));
  K.box(p, 98, 34, 14, 10, K.paint(hex('#d8c8a0')), { light: 0.1 });
  p.area(100, 36, 10, 6, (x, y) => mix(hex('#6a5a48'), hex('#3a3028'), fbm(x / 2, y / 2, 2, 94)));
  K.box(p, 115, 36, 15, 19, K.paint(hex('#e8dcc0')), { light: 0.1 });
  for (let y = 39; y < 53; y += 3) p.area(117, y, 9 + (y % 2) * 2, 1, () => hex('#7a6a58'));
  K.box(p, 99, 47, 12, 8, K.paint(hex('#b89a70')), { light: 0.1 });
  p.line(98, 56, 126, 32, hex('#ffffff'), 2, 0.1);
  p.glow(114, 27, 22, hex('#ffd890'), 0.16);
  K.box(p, 104, 24, 20, 2, K.metal(hex('#8a8078')), { light: 0.2 });

  // Sockel der Büste: die Büste selbst ist austauschbar
  K.contact(p, 178, 88, 22, 0.5, 4);
  K.box(p, 180, 72, 18, 16, K.stone(hex('#a89a88'), 18, 16, 95), { light: 0.35 });
  K.box(p, 177, 68, 24, 5, K.stone(hex('#b8aa98'), 24, 5, 96), { light: 0.3 });

  // Hohes Fenster
  K.pane(p, 214, 10, 22, 52, { sky: ['#6e9ec4', '#a8cce0', '#e0e8dc'].map(hex), frame: hex('#4a3c34'), cols: 2, rows: 4 });
  p.beam([[214, 12], [236, 12], [260, 130], [210, 130]], hex('#f0e4c0'), 0.1);

  // Wendeltreppe nach oben
  p.area(250, 12, 60, 76, (x, y) => mix(hex('#100c0e'), hex('#3a2e28'), (y - 12) / 76 + (x - 250) * 0.003));
  for (let i = 0; i < 9; i++) {
    const y = 80 - i * 8;
    const w = 48 - i * 3;
    K.box(p, 254 + i * 2, y, w, 7, K.wood(hex('#8a6c4c'), false, i + 97), { light: 0.15 });
  }
  p.line(248, 90, 280, 10, hex('#241c18'), 2.4);
  p.line(248, 88, 280, 8, hex('#b8a080'), 0.9);
  for (let i = 0; i < 7; i++) p.area(250 + i * 4.4, 82 - i * 11, 1, 10, () => hex('#3a2e28'));

  K.finish(p, { tint: hex('#ffe0b0'), tintAmount: 0.08, vignette: 0.46 });
  return p;
}

/** Docs Labor 1986: Uhren, Kabel, Elektronik und ein Fenster, das seit Jahren keiner geputzt hat. */
export function labor1986(): Picture {
  const p = K.picture();
  K.room(p, {
    wall: K.brick(hex('#5c4254'), 100),
    floor: K.concrete(hex('#6c6a70'), 88, 101),
    skirt: hex('#2c2830'),
    ceiling: hex('#14101c'),
    ceilingAmount: 0.85,
  });
  // Ölflecken und Risse
  p.softPoly([[56, 104], [90, 102], [108, 112], [70, 118]], hex('#20202a'), 0.22, 4);
  p.line(150, 94, 188, 118, hex('#22222a'), 1, 0.4, 2, 3);
  // Kabelbäume an der Decke
  for (let i = 0; i < 5; i++) {
    const y0 = 6 + i * 2;
    p.line(0, y0, 320, y0 + ((i * 3) % 7), [hex('#201c28'), hex('#7a2a24'), hex('#2a3a6c')][i % 3], 1, 0.9, 1.5, i + 3);
  }
  p.area(0, 8, K.W, 2, (x) => shade(hex('#4a4450'), 0.9 + noise(x / 16, 1, 2) * 0.3));

  K.door(p, 6, 24, 34, 66, K.metal(hex('#7c7c84'), 102), hex('#2a262c'));

  // Regal
  K.contact(p, 50, 66, 60, 0.4, 3);
  K.box(p, 50, 14, 60, 52, K.wood(hex('#40281a'), true, 103), { light: 0.2 });
  for (const [y, h] of [[17, 25], [44, 20]] as const) {
    p.area(53, y, 54, h, (x, py) => mix(hex('#1a100a'), hex('#0e0806'), (py - y) / h + x * 0.0005));
    p.area(53, y + h, 54, 2, () => hex('#7a5230'));
  }
  // Kram auf dem Regal: Spule, Kolben, Röhren, Kiste
  K.box(p, 54, 32, 12, 10, K.metal(hex('#8a8a90'), 104), { light: 0.3 });
  p.area(56, 28, 8, 4, (x) => (x % 2 ? hex('#c87a30') : hex('#8a4e1c')));
  K.box(p, 90, 30, 10, 12, K.paint(hex('#3a5a8a')), { light: 0.3 });
  for (const x of [55, 62, 69]) {
    K.box(p, x, 54, 5, 10, K.metal(hex('#c8c0a8'), x), { light: 0.2 });
    p.glow(x + 2, 57, 4, hex('#ff9a40'), 0.2);
  }
  K.box(p, 78, 56, 22, 8, K.wood(hex('#8a6438'), false, 105), { light: 0.3 });
  // Brecheisen-Haken neben der Tür
  p.area(43, 56, 6, 2, () => hex('#2a2830'));

  // Schrank (Rückwand; die Türen sind austauschbar)
  K.contact(p, 118, 90, 32, 0.5, 4);
  K.box(p, 118, 24, 32, 66, K.metal(hex('#34343c'), 106), { light: 0.2 });
  for (const y of [46, 66]) p.area(120, y, 28, 2, () => hex('#6a6a74'));
  p.area(120, 26, 28, 20, (x, y) => mix(hex('#141418'), hex('#26262c'), (y - 26) / 20 + x * 0.0002));
  p.area(120, 48, 28, 18, (x, y) => mix(hex('#141418'), hex('#26262c'), (y - 48) / 18 + x * 0.0002));
  p.area(120, 68, 28, 20, (x, y) => mix(hex('#141418'), hex('#26262c'), (y - 68) / 20 + x * 0.0002));

  // Docs Uhrensammlung, alle gehen anders
  const clocks = [[168, 28, 9, '#7a5230'], [190, 22, 7, '#3a5a54'], [208, 32, 10, '#8a6a30'], [228, 22, 8, '#6a2a24'], [178, 12, 5, '#5a5a64'], [216, 12, 5, '#6a5a2c']] as const;
  clocks.forEach(([x, y, r, frame], i) => {
    K.contact(p, x - r, y + r, r * 2, 0.25, 2);
    dial(p, x, y, r, hex(frame), hex('#ece0c0'), i + 2);
  });
  // Pendeluhr
  K.box(p, 240, 16, 8, 24, K.wood(hex('#5a3a20'), true, 107), { light: 0.3 });
  dial(p, 244, 21, 3, hex('#e8c060'), hex('#f0e8d0'), 7);

  // Werkbank
  K.contact(p, 158, 90, 84, 0.5, 4);
  K.box(p, 160, 63, 6, 27, K.wood(hex('#4c3020'), true, 108), { light: 0.3 });
  K.box(p, 234, 63, 6, 27, K.wood(hex('#4c3020'), true, 109), { light: 0.3 });
  K.box(p, 166, 72, 68, 2, K.wood(hex('#4c3020'), false, 110), { light: 0 });
  K.box(p, 158, 58, 84, 5, K.wood(hex('#94683c'), false, 111), { light: 0.15 });
  K.box(p, 176, 66, 14, 6, K.metal(hex('#5a5a64'), 112), { light: 0.3 });
  K.box(p, 222, 52, 10, 6, K.metal(hex('#7a7a84'), 113), { light: 0.3 });
  p.area(224, 54, 3, 2, () => hex('#60e080'));
  p.glow(225, 55, 7, hex('#50ff80'), 0.14);
  // Oszilloskop-Lampe über der Bank
  p.area(200, 0, 1, 10, () => hex('#1a1820'));
  p.poly([[192, 10], [208, 10], [212, 16], [188, 16]], (x, y) => mix(hex('#5a6a5a'), hex('#2a342a'), (y - 10) / 6 + (x - 188) * 0.01));
  p.area(194, 16, 12, 1, () => hex('#fff0b0'));
  p.beam([[194, 16], [206, 16], [238, 60], [162, 60]], hex('#ffe8b0'), 0.14);
  p.glow(200, 18, 22, hex('#ffd890'), 0.25);
  K.sunPatch(p, [[160, 58], [240, 58], [240, 63], [160, 63]], hex('#ffe8b0'), 0.18);
  K.sunPatch(p, [[150, 92], [250, 92], [272, 126], [130, 126]], hex('#ffe0a0'), 0.1);

  // Gitarre an der Bank
  p.area(247, 52, 3, 26, (x, y) => K.wood(hex('#6a4426'), true, 114)(x, y));
  p.area(246, 49, 5, 4, () => hex('#2a1810'));
  for (let y = 74; y < 92; y++) {
    for (let x = 241; x < 256; x++) {
      const dy = y - 83;
      const r = 7 - Math.abs(dy) * 0.14 - (dy < -2 ? 1.6 : 0);
      if (Math.abs(x - 248.5) > r) continue;
      p.set(x, y, shade(hex('#a82a24'), 1.2 - (x - 241) * 0.04 + fbm(x / 4, y / 4, 2, 9) * 0.1));
    }
  }
  p.area(247, 81, 3, 3, () => hex('#14100c'));
  p.area(244, 88, 9, 1, () => hex('#e8e0d0'));

  // Riesenverstärker: das Herz des Raums
  K.contact(p, 258, 90, 46, 0.6, 5);
  K.box(p, 258, 20, 46, 70, K.solid(hex('#1c1c20')), { light: 0.4, rim: hex('#8a8a90'), dark: hex('#050507') });
  p.area(260, 22, 42, 66, (x, y) => (Math.floor(x / 2) + Math.floor(y / 2)) % 2 ? hex('#1e1e24') : hex('#16161a'));
  for (const [r, c] of [[16, '#0a0a0c'], [14, '#26262e'], [11, '#121216'], [6, '#34343c'], [3, '#101014']] as const) {
    for (let y = 48 - r; y <= 48 + r; y++) {
      for (let x = 281 - r; x <= 281 + r; x++) {
        if (Math.hypot(x - 281, y - 48) <= r) p.set(x, y, shade(hex(c), 1.25 - (x - 281 + y - 48) * 0.016));
      }
    }
  }
  for (let i = 0; i < 4; i++) K.box(p, 266 + i * 8, 24, 4, 4, K.metal(hex('#c8c8d0')), { light: 0.3 });
  K.box(p, 262, 68, 38, 14, K.metal(hex('#3a3a42')), { light: 0.3 });
  p.area(266, 72, 4, 4, () => hex('#ff4030'));
  p.glow(268, 74, 8, hex('#ff3020'), 0.2);
  for (const x of [276, 283, 290]) {
    p.area(x, 72, 4, 4, () => hex('#a8a8b0'));
    p.set(x + 1, 73, hex('#26262c'));
  }

  // Körbchen und Napf
  K.contact(p, 8, 121, 38, 0.45, 4);
  p.poly([[12, 110], [42, 110], [46, 122], [8, 122]], (x, y) => shade(K.wood(hex('#8c6a3c'), true, 115)(x, y), (x + y) % 5 === 0 ? 0.7 : 1.05));
  p.poly([[15, 108], [39, 108], [41, 115], [13, 115]], (x, y) => mix(hex('#a03a30'), hex('#5a1e1c'), (y - 108) / 7 + fbm(x / 3, y / 2, 2, 116) * 0.4));
  p.area(8, 120, 38, 2, () => hex('#3a2818'));
  K.contact(p, 77, 124, 16, 0.4, 3);
  p.poly([[79, 119], [91, 119], [93, 124], [77, 124]], (x) => mix(hex('#5a7ac0'), hex('#2a3a70'), (x - 77) / 16));
  p.area(80, 119, 10, 1, () => hex('#1a1820'));

  K.finish(p, { tint: hex('#c8a8c8'), tintAmount: 0.06, vignette: 0.52 });
  return p;
}

/** Docs Haus 1955: warm, Kaminfeuer, viel Holz, die Tafel voller Formeln. */
export function labor1955(): Picture {
  const p = K.picture();
  K.room(p, {
    wall: K.wallpaper(hex('#7a5a3c'), hex('#6a4c30'), 18, 120),
    floor: K.woodFloor(hex('#7a5430'), 88, 121),
    skirt: hex('#3a2416'),
    ceiling: hex('#1a100a'),
    ceilingAmount: 0.75,
  });
  // Kamin
  K.contact(p, 12, 88, 76, 0.5, 4);
  K.box(p, 12, 20, 76, 68, K.brick(hex('#8a4a38'), 122), { light: 0.25 });
  K.box(p, 8, 28, 84, 5, K.wood(hex('#5a3a20'), false, 123), { light: 0.2 });
  p.area(24, 44, 52, 44, (x, y) => mix(hex('#0c0606'), hex('#1e0c08'), (y - 44) / 44 + x * 0.0003));
  for (let y = 60; y < 86; y++) {
    for (let x = 28; x < 72; x++) {
      const n = fbm(x / 5, y / 7 + 5, 3, 124);
      const shape = 1 - Math.abs(x - 50) / (24 - (86 - y) * 0.45) - (86 - y) / 34 + (n - 0.5) * 0.7;
      if (shape <= 0) continue;
      p.set(x, y, mix(hex('#c23a14'), mix(hex('#ff9a28'), hex('#fff0a0'), smooth(0.4, 0.75, shape)), smooth(0.05, 0.4, shape)));
    }
  }
  K.box(p, 34, 82, 32, 5, K.wood(hex('#3a2010'), false, 125), { light: 0.2 });
  p.glow(50, 74, 100, hex('#ff8030'), 0.32, 0.7);
  p.glow(50, 120, 90, hex('#ff8a30'), 0.14, 0.4);
  // Uhr und Kleinkram auf dem Sims
  K.box(p, 44, 16, 12, 12, K.wood(hex('#6a4426'), true, 126), { light: 0.3 });
  dial(p, 50, 21, 4, hex('#e8c060'), hex('#f0e8d0'), 3);
  K.box(p, 20, 21, 5, 7, K.metal(hex('#a8a8b0')), { light: 0.3 });
  K.box(p, 72, 22, 8, 6, K.paint(hex('#3a6a5a')), { light: 0.3 });

  // Ständer für den Helm (der Helm selbst ist austauschbar)
  K.contact(p, 94, 88, 22, 0.45, 4);
  K.box(p, 102, 60, 4, 28, K.metal(hex('#5a5a64')), { light: 0.4 });
  K.box(p, 94, 84, 20, 4, K.metal(hex('#4a4a54')), { light: 0.3 });

  // Tafel mit Formeln
  K.box(p, 136, 12, 96, 34, K.wood(hex('#5e3e20'), false, 127), { light: 0.15 });
  p.area(139, 15, 90, 28, (x, y) => mix(hex('#24443a'), hex('#1a3028'), fbm(x / 12, y / 5, 3, 128)));
  for (let row = 0; row < 4; row++) {
    let x = 142 + row * 3;
    while (x < 222) {
      const w = 3 + Math.floor(noise(x, row, 2) * 6);
      const y = 18 + row * 6;
      p.line(x, y + (noise(x, row, 5) > 0.5 ? 1 : 3), x + w, y + (noise(x, row, 8) > 0.5 ? 0 : 2), hex('#e8e4d4'), 1, 0.85);
      x += w + 2 + Math.floor(noise(x, row, 3) * 4);
    }
  }
  // Werkbank
  K.contact(p, 136, 92, 96, 0.5, 4);
  K.box(p, 138, 64, 6, 28, K.wood(hex('#4c3020'), true, 129), { light: 0.3 });
  K.box(p, 224, 64, 6, 28, K.wood(hex('#4c3020'), true, 130), { light: 0.3 });
  K.box(p, 144, 74, 80, 2, K.wood(hex('#4c3020'), false, 131), { light: 0 });
  K.box(p, 136, 59, 96, 5, K.wood(hex('#9a6c3c'), false, 132), { light: 0.15 });
  // Röhren und Drähte
  for (const x of [172, 180]) {
    K.box(p, x, 49, 5, 10, K.metal(hex('#d8d0b8')), { light: 0.2 });
    p.glow(x + 2, 52, 4, hex('#ff9a40'), 0.25);
  }
  K.box(p, 218, 52, 10, 7, K.metal(hex('#6a6a74')), { light: 0.3 });
  p.line(180, 50, 222, 52, hex('#2a2028'), 1, 0.9, 2, 7);

  // Fenster und Tür
  K.pane(p, 240, 24, 22, 34, { sky: ['#2c3c6c', '#6a6a94', '#e0a070'].map(hex), frame: hex('#3a2416'), cols: 2, rows: 3 });
  K.door(p, 270, 24, 36, 64, K.planks(hex('#6e4726'), 7, true, 133), hex('#3a2416'));

  K.finish(p, { tint: hex('#ffb070'), tintAmount: 0.12, vignette: 0.5 });
  return p;
}

export function veranda(): Picture {
  const p = K.picture();
  const siding: K.Mat = (x, y) => {
    const f = y % 5 === 0 ? 0.72 : y % 5 === 1 ? 1.08 : 1;
    return shade(mix(hex('#f0e0b8'), hex('#c8b488'), fbm(x / 22, y / 5, 3, 140)), f);
  };
  K.room(p, {
    wall: siding,
    floor: K.woodFloor(hex('#a87c4c'), 88, 141),
    skirt: hex('#8a8880'),
    ceiling: hex('#3a2c24'),
    ceilingAmount: 0.7,
  });
  // Decke und Vordachschatten
  p.area(0, 0, K.W, 8, (x, y) => shade(K.wood(hex('#c8c0a8'), false, 142)(x, y), 0.68));
  p.area(0, 8, K.W, 2, () => hex('#2a2018'));
  K.door(p, 40, 24, 34, 64, K.paint(hex('#a02e26')), hex('#f4f0e4'));
  K.pane(p, 110, 26, 40, 34, { sky: ['#28405e', '#5a7a98'].map(hex), frame: hex('#f4f0e4') });
  // Blumenkasten
  K.box(p, 108, 60, 44, 5, K.wood(hex('#6e4726'), false, 143), { light: 0.2 });
  for (let i = 0; i < 90; i++) {
    const x = 109 + noise(i, 1, 3) * 42;
    const y = 54 + noise(i, 2, 3) * 7;
    p.blend(Math.round(x), Math.round(y), noise(i, 3, 3) > 0.74 ? hex('#e84a60') : hex('#3e7a38'), 0.9);
  }

  // Hollywoodschaukel
  K.contact(p, 180, 88, 88, 0.35, 6);
  for (const x of [182, 262]) p.area(x, 14, 3, 40, (px) => (px === x ? hex('#c8c8d0') : hex('#4a4a54')));
  K.box(p, 180, 12, 88, 4, K.metal(hex('#7a7a84'), 144), { light: 0.2 });
  K.box(p, 180, 42, 88, 24, (x, y) => (Math.floor((x - 180) / 8) % 2 ? shade(hex('#e8dcc0'), 0.96 + fbm(x, y / 8, 2, 5) * 0.08) : shade(hex('#b03a30'), 0.86 + fbm(x, y / 8, 2, 6) * 0.2)), { light: 0.2 });
  K.box(p, 180, 66, 88, 8, (x, y) => shade(Math.floor((x - 180) / 8) % 2 ? hex('#d0c4a8') : hex('#8e2a24'), 0.96 + fbm(x, y, 2, 7) * 0.1), { light: 0.2 });
  p.area(186, 74, 2, 14, () => hex('#2a2830'));
  p.area(260, 74, 2, 14, () => hex('#2a2830'));

  // Geländer und Abgang
  p.area(286, 88, 34, 56, (x, y) => mix(hex('#6f9a58'), hex('#3e6a3c'), fbm(x / 2, y / 1.4, 2, 145)));
  for (let i = 0; i < 5; i++) {
    const y = 92 + i * 11;
    K.box(p, 286, y, 34, 3 + i, K.wood(hex('#b88a58'), false, 146 + i), { light: 0 });
    p.area(286, y + 3 + i, 34, 5, (x, py) => shade(K.wood(hex('#7a5a38'), false, 150 + i)(x, py), 0.74));
  }
  K.box(p, 286, 58, 4, 36, K.paint(hex('#f4f0e4')), { light: 0.3 });
  K.box(p, 280, 56, 40, 3, K.paint(hex('#f4f0e4')), { light: 0.1 });
  for (let x = 294; x < 320; x += 6) K.box(p, x, 59, 3, 29, K.paint(hex('#ece8dc')), { light: 0.2 });
  // Sonne fällt von rechts unter dem Dach herein
  p.softPoly([[286, 92], [90, 92], [40, 142], [286, 142]], hex('#ffe9b0'), 0.14, 3);
  p.beam([[278, 14], [320, 14], [320, 92], [192, 92]], hex('#ffeabc'), 0.08);
  K.finish(p, { tint: hex('#fff0c8'), tintAmount: 0.08, vignette: 0.28 });
  return p;
}
