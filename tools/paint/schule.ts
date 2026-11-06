import * as K from './kit.ts';
import { fbm, hex, mix, noise, type Picture, shade, type RGB } from './painter.ts';

interface FlurMood {
  wall: RGB;
  dado: RGB;
  floorA: RGB;
  floorB: RGB;
  locker: RGB;
  door: RGB;
  light: RGB;
  tint: RGB;
}

const lockers = (p: Picture, x0: number, x1: number, c: RGB, seed: number): void => {
  K.contact(p, x0, 88, x1 - x0, 0.42, 4);
  for (let x = x0; x < x1; x += 20) {
    const tone = shade(c, 0.93 + noise(x, seed, 3) * 0.14);
    K.box(p, x, 26, 20, 62, K.metal(tone, seed + x), { light: 0.18 });
    for (let i = 0; i < 4; i++) p.area(x + 7, 31 + i * 3, 7, 1, () => shade(tone, 0.48));
    p.area(x + 15, 54, 2, 6, () => hex('#d8d4c8'));
    p.area(x + 7, 42, 7, 4, () => shade(tone, 1.25));
    p.area(x + 1, 86, 18, 2, () => shade(tone, 0.5));
  }
  // Sonne, die über die Reihe streicht
  p.softPoly([[x0 + 16, 26], [x0 + 42, 26], [x0 + 18, 88], [x0 - 8, 88]], hex('#ffffff'), 0.06, 3);
};

/** Der Schulflur: dieselben Mauern, 31 Jahre auseinander. */
export function schulFlur(era: 1955 | 1986): Picture {
  const m: FlurMood = era === 1955
    ? { wall: hex('#d8cc9c'), dado: hex('#6e9478'), floorA: hex('#b8ac8c'), floorB: hex('#8a8068'), locker: hex('#7a9ca0'), door: hex('#7a4c28'), light: hex('#fff0c0'), tint: hex('#ffe8b0') }
    : { wall: hex('#b4b8b0'), dado: hex('#6c7c8c'), floorA: hex('#a4a4a0'), floorB: hex('#74767a'), locker: hex('#a85c34'), door: hex('#6c5a48'), light: hex('#e8f0e0'), tint: hex('#e0e8e0') };
  const p = K.picture();
  K.room(p, {
    wall: K.plaster(m.wall, 200 + era),
    floor: K.checkerFloor(m.floorA, m.floorB, 88, 201),
    skirt: shade(m.dado, 0.7),
    ceiling: shade(m.wall, 0.45),
    ceilingAmount: 0.45,
  });
  // Halbhoher Anstrich
  p.area(0, 58, K.W, 25, (x, y) => shade(m.dado, 0.88 + fbm(x / 10, y / 4, 3, 203) * 0.24));
  p.area(0, 58, K.W, 1, () => shade(m.dado, 1.35));
  // Glanz vom Bohnerwachs
  for (const x of [40, 130, 225]) K.sunPatch(p, [[x, 90], [x + 34, 90], [x + 46, 142], [x - 10, 142]], m.light, 0.1);
  // Deckenlampen
  for (const x of [50, 160, 270]) {
    p.area(x - 12, 0, 24, 3, () => hex('#f8f4dc'));
    p.glow(x, 2, 44, m.light, 0.14, 0.7);
  }

  K.door(p, 36, 24, 34, 64, K.planks(m.door, 8, true, 204), shade(m.door, 0.6));
  K.door(p, 116, 24, 34, 64, K.planks(m.door, 8, true, 205), shade(m.door, 0.6));
  // Drahtglas und Türnummern
  for (const x of [44, 124]) {
    K.box(p, x, 30, 18, 14, K.solid(hex('#50646c')), { light: 0.2 });
    for (let y = 32; y < 44; y += 3) p.area(x + 1, y, 16, 1, () => hex('#6c848c'));
  }

  // Schwarzes Brett
  K.box(p, 78, 26, 30, 28, K.wood(hex('#6a4426'), true, 206), { light: 0.2 });
  p.area(80, 28, 26, 24, (x, y) => mix(hex('#a07c4c'), hex('#7a5c34'), fbm(x / 3, y / 3, 3, 207)));
  const notes: readonly (readonly [number, number, number, number, string])[] = [[82, 30, 9, 7, '#e8e0c0'], [93, 29, 11, 9, '#f4f0dc'], [82, 40, 11, 10, '#e8c870'], [95, 41, 8, 8, '#c8dce0']];
  for (const [x, y, w, h, c] of notes) {
    p.area(x + 1, y + 1, w, h, () => hex('#3a2c18'));
    p.area(x, y, w, h, () => hex(c));
    for (let ly = y + 2; ly < y + h - 1; ly += 2) p.area(x + 1, ly, w - 3, 1, () => hex('#5a5a58'));
    p.set(x + Math.floor(w / 2), y, hex('#c82a24'));
  }

  // Spinde. 1955 sind sie nicht an derselben Stelle wie Biffs Spind offen; der Sprite regelt das.
  lockers(p, 162, 286, m.locker, 208);

  // Der Weg nach draußen
  K.box(p, 292, 20, 28, 68, K.solid(shade(m.door, 0.5)), { light: 0 });
  p.area(295, 23, 25, 65, (x, y) => mix(hex('#fffef0'), m.light, (y - 23) / 90 + (x - 295) * 0.002));
  p.area(306, 23, 2, 65, () => shade(m.door, 0.6));
  p.glow(308, 56, 44, m.light, 0.22);
  K.sunPatch(p, [[294, 90], [320, 90], [320, 142], [244, 142]], m.light, 0.16);

  if (era === 1986) {
    // Graffiti an der Wand: 1986 gibt es das
    p.line(92, 72, 110, 68, hex('#d03a4a'), 1, 0.65, 2, 7);
    p.line(100, 77, 108, 74, hex('#3a5ac0'), 1, 0.6, 2, 8);
  }
  K.finish(p, { tint: m.tint, tintAmount: 0.1, vignette: 0.3 });
  return p;
}

export function spindOffen(): Picture {
  const p = K.picture(22, 62);
  K.box(p, 0, 0, 22, 62, K.solid(hex('#1a1612')), { light: 0, rim: hex('#6a7a7c') });
  p.area(3, 8, 16, 1, () => hex('#5a5a58'));
  p.area(3, 9, 16, 44, (x, y) => mix(hex('#2a2620'), hex('#120e0a'), (y - 9) / 44 + x * 0.002));
  p.area(3, 32, 16, 2, () => hex('#5c5a54'));
  p.line(6, 34, 10, 42, hex('#a07a48'), 1);
  K.box(p, 4, 50, 14, 8, K.metal(hex('#3c3c44')), { light: 0.2 });
  return p;
}

export function bandraum(): Picture {
  const p = K.picture();
  K.room(p, {
    // Eierkartons an der Wand: ein Probenraum für wenig Geld
    wall: (x, y) => {
      const fx = (x % 6) - 3;
      const fy = (y % 6) - 3;
      return shade(mix(hex('#6a5a74'), hex('#54485c'), fbm(x / 24, y / 12, 3, 210)), 0.82 + 0.3 * (1 - Math.hypot(fx, fy) / 4) - (fx + fy) * 0.012);
    },
    floor: K.carpet(hex('#4a4c58'), 88, 211),
    skirt: hex('#22222a'),
    ceiling: hex('#14121c'),
    ceilingAmount: 0.75,
  });
  // Bühnenlicht: magenta von links, türkis von rechts
  p.beam([[40, 0], [62, 0], [118, 132], [24, 132]], hex('#ff50a0'), 0.14);
  p.beam([[176, 0], [196, 0], [226, 132], [136, 132]], hex('#40d0d8'), 0.12);
  for (const [x, c] of [[50, '#ff50a0'], [186, '#40d0d8']] as const) {
    K.box(p, x - 5, 0, 10, 5, K.metal(hex('#26262c')), { light: 0.3 });
    p.glow(x, 5, 10, hex(c), 0.5);
  }
  K.sunPatch(p, [[34, 96], [112, 96], [118, 130], [26, 130]], hex('#ff60a8'), 0.14);
  K.sunPatch(p, [[142, 96], [224, 96], [230, 130], [136, 130]], hex('#50d8e0'), 0.12);

  // Schlagzeug
  K.contact(p, 28, 88, 88, 0.5, 5);
  const drum = (cx: number, cy: number, rw: number, rh: number, c: RGB): void => {
    for (let y = cy - rh; y <= cy + rh; y++) {
      for (let x = cx - rw; x <= cx + rw; x++) {
        const d = Math.hypot((x - cx) / rw, (y - cy) / rh);
        if (d > 1) continue;
        p.set(x, y, d > 0.82 ? hex('#d8d8e0') : d > 0.72 ? shade(c, 0.5) : mix(hex('#ece4d0'), hex('#a89a88'), (y - cy + rh) / (rh * 3) + (x - cx) * 0.008));
      }
    }
  };
  // Stative
  p.line(42, 86, 42, 54, hex('#b8b8c0'), 1);
  p.line(102, 86, 102, 50, hex('#b8b8c0'), 1);
  // Becken
  p.poly([[33, 52], [51, 52], [47, 55], [37, 55]], (x) => mix(hex('#f4d060'), hex('#a0742c'), (x - 33) / 18));
  p.poly([[93, 48], [111, 48], [107, 51], [97, 51]], (x) => mix(hex('#f4d060'), hex('#a0742c'), (x - 93) / 18));
  drum(72, 73, 15, 15, hex('#a82a30'));
  for (const [x, y] of [[59, 56], [84, 56]] as const) {
    K.box(p, x - 7, y, 14, 9, (px, py) => mix(hex('#c23a3a'), hex('#7a1e20'), (py - y) / 9 + (px - x) * 0.02), { light: 0.3 });
    drum(x, y, 7, 2, hex('#a82a30'));
  }
  K.box(p, 30, 72, 16, 16, (px, py) => mix(hex('#c23a3a'), hex('#6a1a1c'), (py - 72) / 16 + (px - 30) * 0.02), { light: 0.3 });
  drum(38, 72, 8, 3, hex('#a82a30'));
  K.box(p, 98, 68, 14, 20, (px, py) => mix(hex('#c23a3a'), hex('#6a1a1c'), (py - 68) / 20 + (px - 98) * 0.02), { light: 0.3 });
  drum(105, 68, 7, 3, hex('#a82a30'));

  // Verstärker (ein kleiner, aber ehrlicher)
  K.contact(p, 140, 88, 44, 0.55, 5);
  K.box(p, 140, 48, 44, 40, K.solid(hex('#201e24')), { light: 0.35, rim: hex('#8a8a90'), dark: hex('#050507') });
  p.area(144, 60, 36, 24, (x, y) => ((x + y) % 3 ? hex('#3a3430') : hex('#2a2622')));
  K.box(p, 144, 51, 36, 7, K.metal(hex('#7a7a84')), { light: 0.3 });
  for (const x of [148, 156, 164, 172]) {
    p.area(x, 53, 3, 3, () => hex('#1a1a20'));
    p.set(x + 1, 53, hex('#e0e0e8'));
  }
  p.set(177, 54, hex('#ff4030'));
  p.glow(177, 54, 5, hex('#ff3020'), 0.3);
  // Gitarrenkabel zum Boden
  p.line(150, 86, 172, 100, hex('#16161c'), 1, 1, 2, 5);

  // Bandposter
  K.box(p, 200, 20, 42, 30, K.paint(hex('#141220')), { light: 0, rim: hex('#a8a4b0') });
  for (let y = 22; y < 48; y++) p.area(202, y, 38, 1, (x) => mix(hex('#3a1868'), hex('#e0307a'), (y - 22) / 28 + Math.sin(x / 5) * 0.08));
  p.poly([[208, 44], [221, 26], [234, 44]], (x) => mix(hex('#ffd040'), hex('#f06020'), (x - 208) / 26));

  K.door(p, 270, 24, 36, 64, K.paint(hex('#6a6c78')), hex('#2c2c34'));
  // Notenständer
  p.line(254, 88, 254, 58, hex('#a8a8b0'), 1);
  p.poly([[246, 50], [262, 50], [262, 60], [246, 60]], (x, y) => (y % 2 ? hex('#efe8d0') : mix(hex('#a0988a'), hex('#efe8d0'), x * 0.002)));
  K.finish(p, { vignette: 0.62, vigColor: hex('#0a0814') });
  return p;
}

export function schuelerzeitung(): Picture {
  const p = K.picture();
  K.room(p, {
    wall: K.plaster(hex('#d8ccb0'), 220),
    floor: K.woodFloor(hex('#8a6a44'), 88, 221),
    skirt: hex('#5a4630'),
    ceiling: hex('#7a6c54'),
    ceilingAmount: 0.45,
  });
  // Spätes Sonnenlicht durch Jalousien
  for (let i = 0; i < 6; i++) {
    const y = 18 + i * 8;
    p.softPoly([[176, y], [282, y + 8], [282, y + 12], [176, y + 4]], hex('#fff0b8'), 0.18, 1);
  }
  K.door(p, 14, 24, 36, 64, K.planks(hex('#7a5a36'), 8, true, 222), hex('#5a4630'));

  // Pinnwand voller Artikel
  K.box(p, 70, 14, 96, 42, K.wood(hex('#6a4426'), false, 223), { light: 0.15 });
  p.area(73, 17, 90, 36, (x, y) => mix(hex('#b08a58'), hex('#8a6a3c'), fbm(x / 3, y / 3, 3, 224)));
  for (let i = 0; i < 12; i++) {
    const x = 75 + (i % 6) * 14 + Math.floor(noise(i, 1, 3) * 3);
    const y = 19 + (i >= 6 ? 17 : 0) + Math.floor(noise(i, 2, 3) * 3);
    const w = 11 + Math.floor(noise(i, 3, 3) * 3);
    const h = 11 + Math.floor(noise(i, 4, 3) * 4);
    p.area(x + 1, y + 1, w, h, () => hex('#3a2c18'));
    p.area(x, y, w, h, (_px, py) => {
      const base = i % 5 === 2 ? hex('#f4d870') : i % 7 === 3 ? hex('#c8dce0') : hex('#efe8d0');
      return (py - y) % 2 === 1 && py > y + 2 ? shade(base, 0.62) : base;
    });
    p.area(x + 1, y + 1, w - 3, 1, () => hex('#2c2c2c'));
    p.set(x + Math.floor(w / 2), y, ['#c82a24', '#2a5ac8', '#e8c040'].map(hex)[i % 3]);
  }

  // Tisch mit Schreibmaschine und Rekorder
  K.contact(p, 186, 92, 90, 0.5, 5);
  K.box(p, 190, 62, 6, 30, K.metal(hex('#6a6a74')), { light: 0.3 });
  K.box(p, 266, 62, 6, 30, K.metal(hex('#5a5a64')), { light: 0.3 });
  K.box(p, 186, 57, 90, 5, K.wood(hex('#a87a44'), false, 225), { light: 0.15 });
  // Schreibmaschine
  K.box(p, 196, 47, 28, 10, K.metal(hex('#54636a')), { light: 0.3 });
  K.box(p, 199, 43, 22, 5, K.metal(hex('#3c474c')), { light: 0.2 });
  p.area(203, 34, 14, 10, (_x, y) => mix(hex('#f4efe0'), hex('#c8c0a8'), (y - 34) / 12));
  for (let i = 0; i < 3; i++) p.area(205, 36 + i * 2, 9 + (i % 2), 1, () => hex('#7a7468'));
  for (const y of [49, 52, 55]) for (let x = 199; x < 221; x += 3) p.area(x, y, 2, 1, () => hex('#c8c8c0'));
  // Kassettenrekorder
  K.box(p, 234, 47, 28, 10, K.metal(hex('#2c2c34')), { light: 0.3 });
  for (const x of [240, 254]) {
    p.area(x - 3, 49, 6, 6, () => hex('#16161a'));
    p.area(x - 1, 51, 2, 2, () => hex('#9a9aa2'));
  }
  p.area(236, 44, 2, 3, () => hex('#a8a8b0'));
  p.line(262, 47, 272, 34, hex('#a8a8b0'), 1);
  // Papierstapel
  p.area(270, 53, 5, 4, (_x, y) => (y % 2 ? hex('#efe8d0') : hex('#a8a090')));

  // Fenster mit Jalousie
  K.pane(p, 286, 16, 28, 52, { sky: ['#8cbcdc', '#d4e4e0', '#f4e8c0'].map(hex), frame: hex('#e8e0cc'), cols: 1, rows: 1 });
  for (let y = 18; y < 40; y += 3) p.area(286, y, 28, 2, () => hex('#e0d8c0'));
  p.glow(300, 44, 34, hex('#fff0c0'), 0.18);
  K.sunPatch(p, [[210, 92], [292, 92], [264, 142], [160, 142]], hex('#fff0c0'), 0.14);
  K.finish(p, { tint: hex('#ffe8b8'), tintAmount: 0.1, vignette: 0.3 });
  return p;
}

// --- 1955 --------------------------------------------------------------------------------------

const chrome = (x: number, y: number): RGB => mix(hex('#f4f4f8'), hex('#54586a'), 0.5 + 0.5 * Math.sin(y * 1.4 + x * 0.05));

export function cafe1955(): Picture {
  const p = K.picture();
  K.room(p, {
    wall: K.plaster(hex('#e8dcb8'), 230),
    floor: K.checkerFloor(hex('#e0d8c4'), hex('#4a4656'), 88, 231),
    skirt: hex('#8a2a2c'),
    ceiling: hex('#a88a5a'),
    ceilingAmount: 0.45,
  });
  // Türkisfarbener Fries und roter Streifen
  p.area(0, 14, K.W, 5, (x, y) => shade(hex('#2e9a94'), 0.92 + fbm(x / 8, y, 2, 3) * 0.16));
  p.area(0, 14, K.W, 1, () => hex('#a0e8dc'));
  p.area(0, 19, K.W, 1, () => hex('#a82a2c'));
  // Sonne durch die Glastür
  K.door(p, 5, 28, 32, 60, K.paint(hex('#3a9a94')), hex('#f4ecd8'));
  p.area(10, 34, 22, 26, (x, y) => mix(hex('#c8e8f0'), hex('#f8f4d8'), (y - 34) / 26 + (x - 10) * 0.01));
  p.line(13, 58, 28, 36, hex('#ffffff'), 2, 0.3);
  p.beam([[6, 30], [38, 30], [132, 142], [4, 142]], hex('#fff2c0'), 0.12);

  // Regal hinter der Theke: Glas, Spiegel, Flaschen
  K.box(p, 84, 22, 150, 34, K.wood(hex('#6a4426'), false, 232), { light: 0.15 });
  p.area(87, 25, 144, 28, (x, y) => mix(hex('#a4c4c8'), hex('#5a7a84'), (y - 25) / 30 + fbm(x / 20, y / 8, 2, 233) * 0.25));
  p.line(100, 52, 118, 26, hex('#ffffff'), 2.5, 0.22);
  p.line(190, 52, 204, 26, hex('#ffffff'), 2, 0.18);
  p.area(87, 38, 144, 2, () => hex('#e8e4d8'));
  const bottle = (x: number, baseY: number, h: number, c: string): void => {
    p.area(x, baseY - h, 3, h, (px) => shade(hex(c), px === x ? 1.4 : 0.9));
    p.area(x + 1, baseY - h - 2, 1, 2, () => hex('#2a2018'));
  };
  for (let i = 0; i < 20; i++) {
    bottle(90 + i * 7, i % 2 ? 38 : 53, 7 + (i % 3) * 2, ['#c8483c', '#5a8a40', '#c89030', '#3a6a9a', '#a07040'][i % 5]);
  }
  // Tortenglocke und Kasse hinter der Theke
  K.box(p, 212, 58, 16, 10, K.metal(hex('#8a8a90')), { light: 0.3 });

  // Rückwand unter dem Regal
  p.area(84, 56, 150, 12, (x, y) => shade(K.plaster(hex('#a84a44'), 234)(x, y), 0.76));

  // Sitznische mit roter Polsterung links und ein Tisch
  K.box(p, 42, 58, 24, 30, (x, y) => mix(hex('#c8383a'), hex('#7a1a20'), fbm(x / 4, y / 4, 2, 235) + (y - 58) / 60), { light: 0.25 });
  for (const y of [66, 76]) p.area(44, y, 20, 1, () => hex('#5a1218'));

  // Musikbox
  K.contact(p, 270, 88, 28, 0.5, 4);
  K.box(p, 270, 44, 28, 44, (x, y) => mix(hex('#c8783a'), hex('#6e3a18'), (y - 44) / 44 + (x - 270) * 0.012), { light: 0.3 });
  p.poly([[270, 44], [298, 44], [292, 32], [276, 32]], (x, y) => mix(hex('#ffe08a'), hex('#e87a30'), (y - 32) / 12 + (x - 270) * 0.006));
  p.area(275, 48, 18, 14, (x, y) => mix(hex('#1a1a3a'), hex('#3a4a8a'), (y - 48) / 14 + x * 0.001));
  for (let i = 0; i < 4; i++) p.area(277 + i * 4, 58, 3, 2, () => hex('#d8d8e0'));
  for (const y of [66, 72, 78]) p.area(275, y, 18, 2, () => chrome(275, y));
  for (const y of [34, 38]) p.area(278, y, 12, 1, () => hex('#fff4c0'));
  p.glow(284, 42, 28, hex('#ffb040'), 0.26);
  K.finish(p, { tint: hex('#ffeac0'), tintAmount: 0.08, vignette: 0.28 });
  return p;
}

export function cafeTheke(): Picture {
  const p = K.picture(170, 30);
  // Hocker davor; die Theke selbst im Schatten des Glanzes
  K.box(p, 0, 0, 170, 30, (x, y) => mix(hex('#c23a3c'), hex('#6e1c20'), (y - 4) / 26 + fbm(x / 8, y / 6, 2, 240) * 0.2), { light: 0.1 });
  p.area(0, 0, 170, 5, (x, y) => mix(hex('#f4ecd8'), hex('#c8bea8'), (y / 5) * 0.8 + fbm(x / 20, y, 2, 241) * 0.2));
  p.area(0, 5, 170, 2, (x, y) => chrome(x, y));
  p.area(0, 15, 170, 1, () => hex('#f4f0e8'));
  p.area(0, 26, 170, 4, (x, y) => chrome(x, y * 2));
  // Waschbecken-Anklang und Glanz
  for (let x = 12; x < 170; x += 26) p.softPoly([[x, 8], [x + 6, 8], [x + 2, 25], [x - 4, 25]], hex('#ffffff'), 0.08, 1);
  return p;
}

export function mixer(): Picture {
  const p = K.picture(14, 18);
  K.box(p, 2, 13, 10, 5, K.metal(hex('#3a9a94')), { light: 0.4 });
  K.box(p, 5, 2, 4, 11, K.metal(hex('#c8c8d0')), { light: 0.4 });
  K.box(p, 2, 0, 10, 4, K.metal(hex('#3a9a94')), { light: 0.4 });
  p.area(9, 6, 4, 8, (x) => mix(hex('#f4f4f8'), hex('#84868e'), (x - 9) / 4));
  return p;
}

export function radioladen(): Picture {
  const p = K.picture();
  K.room(p, {
    wall: K.wallpaper(hex('#c8b488'), hex('#b8a478'), 16, 250),
    floor: K.woodFloor(hex('#8a6438'), 88, 251),
    skirt: hex('#4a3020'),
    ceiling: hex('#3a2c1c'),
    ceilingAmount: 0.6,
  });
  // Regal voller Radios
  K.contact(p, 20, 60, 72, 0.3, 3);
  K.box(p, 20, 14, 72, 44, K.wood(hex('#5e3a20'), true, 252), { light: 0.2 });
  for (let row = 0; row < 2; row++) {
    const y = 17 + row * 20;
    p.area(23, y, 66, 17, (x, py) => mix(hex('#20140c'), hex('#120a06'), (py - y) / 17 + x * 0.0003));
    p.area(23, y + 17, 66, 2, () => hex('#8a6438'));
    for (let i = 0; i < 4; i++) {
      const x = 25 + i * 16;
      const tone = ['#8a5a30', '#a03a30', '#d8c8a0', '#3a6a5a'][(i + row) % 4];
      K.box(p, x, y + 4, 14, 13, (px, py) => mix(hex(tone), shade(hex(tone), 0.65), (py - y) / 17 + (px - x) * 0.01), { light: 0.3 });
      p.area(x + 2, y + 6, 10, 4, () => hex('#2a241c'));
      for (let lx = x + 3; lx < x + 12; lx += 2) p.area(lx, y + 6, 1, 4, () => hex('#7a6a50'));
      p.area(x + 3, y + 12, 8, 2, () => hex('#f4d890'));
      p.glow(x + 7, y + 13, 4, hex('#ffb040'), 0.15);
    }
  }
  // Schild über dem Regal und eine Uhr
  K.box(p, 112, 12, 42, 14, K.paint(hex('#a03a2c')), { light: 0.2, rim: hex('#f0c060') });
  K.lettering(p, 'RADIO', 121, 13, hex('#fff0c8'));
  // Röhrenfernseher, der Stolz des Ladens
  K.contact(p, 184, 68, 44, 0.45, 3);
  K.box(p, 184, 22, 44, 46, K.wood(hex('#7a4c28'), true, 253), { light: 0.3 });
  for (let y = 26; y <= 54; y++) {
    for (let x = 188; x <= 224; x++) {
      const dx = Math.abs(x - 206) / 18;
      const dy = Math.abs(y - 40) / 14;
      if (dx ** 4 + dy ** 4 > 1) continue;
      p.set(x, y, mix(hex('#c4d4dc'), hex('#5a6c78'), Math.hypot(dx, dy) * 0.8 + fbm(x, y * 4, 2, 254) * 0.15));
    }
  }
  p.glow(206, 40, 28, hex('#c8e0ff'), 0.2);
  for (const x of [194, 206, 218]) {
    p.area(x - 2, 58, 4, 4, () => hex('#e8c060'));
    p.set(x, 59, hex('#4a3020'));
  }
  // Antenne
  p.line(206, 22, 192, 8, hex('#2c2c2c'), 1);
  p.line(206, 22, 220, 8, hex('#2c2c2c'), 1);

  K.door(p, 270, 24, 36, 64, K.paint(hex('#c87a30')), hex('#f4ecd8'));
  p.area(278, 30, 20, 22, (x, y) => mix(hex('#d0e8f0'), hex('#fdf8d8'), (y - 30) / 22 + (x - 278) * 0.01));
  p.beam([[272, 26], [304, 26], [326, 142], [190, 142]], hex('#fff2c0'), 0.1);
  K.finish(p, { tint: hex('#ffdca8'), tintAmount: 0.1, vignette: 0.38 });
  return p;
}

export function ladenTheke(): Picture {
  const p = K.picture(180, 28);
  K.box(p, 0, 0, 180, 28, K.wood(hex('#7a4e28'), false, 260), { light: 0.1 });
  p.area(0, 0, 180, 4, (x, y) => K.wood(hex('#b88a50'), false, 261)(x, y));
  p.area(0, 4, 180, 1, () => hex('#2c1a10'));
  // Glasauslage mit Elektronenröhren
  K.box(p, 6, 7, 30, 18, K.solid(hex('#1e1612')), { light: 0, rim: hex('#e8d8a0'), dark: hex('#4a3a20') });
  for (const x of [10, 17, 24, 31]) {
    p.area(x - 1, 12, 3, 10, (px, py) => mix(hex('#d4d0c0'), hex('#8a8878'), (px - x + 1) / 3 + (py - 12) * 0.02));
    p.area(x - 1, 21, 3, 3, () => hex('#2a2018'));
    p.glow(x, 15, 3, hex('#ff9040'), 0.3);
  }
  p.line(8, 24, 22, 8, hex('#ffffff'), 2, 0.14);
  // Füllungen
  for (let x = 44; x < 176; x += 22) {
    p.area(x, 8, 18, 16, (px, py) => shade(p.get(px, py), 0.78));
    p.area(x, 8, 18, 1, () => hex('#3a2212'));
    p.area(x, 23, 18, 1, () => hex('#b08a50'));
  }
  return p;
}

export function strasse1955(): Picture {
  const p = K.picture();
  K.sky(p, { stops: ['#2f8ec0', '#58b0d0', '#a8dcd8', '#fdf6d8'].map(hex), cover: 0.58, cloud: [hex('#a0c4cc'), hex('#ffffff')], seed: 270, horizon: 90 });
  K.tree(p, 300, 28, 24, 90, 271, hex('#1f4030'), hex('#3f7a44'), hex('#c0dc78'));
  K.tree(p, 200, 34, 18, 90, 272, hex('#1f4030'), hex('#4f8a4c'), hex('#c8e080'));

  // Häuserzeile: Backstein, Holz, Markise
  const houses: readonly (readonly [number, number, string, string])[] = [[0, 58, '#a85848', '#2e7a74'], [58, 54, '#d8c090', '#b84838'], [112, 58, '#7a8c78', '#d09040']];
  for (const [x, w, c, a] of houses) {
    K.box(p, x, 30, w, 58, x === 58 ? K.planks(hex(c), 5, false, 273) : K.brick(hex(c), 274 + x), { light: 0.2 });
    p.area(x, 28, w, 3, () => shade(hex(c), 0.58));
    for (const wx of [x + 7, x + w - 18]) {
      K.pane(p, wx, 36, 11, 15, { sky: ['#5a7a94', '#2c3e50'].map(hex), frame: hex('#f4f0e4'), rows: 2, cols: 1 });
    }
    p.area(x + 4, 56, w - 8, 5, (px) => (Math.floor(px / 4) % 2 ? hex(a) : hex('#f8f0dc')));
    p.area(x + 4, 61, w - 8, 3, (px, py) => mix(p.get(px, py), hex('#14100c'), 0.42));
    K.pane(p, x + 8, 64, w - 28, 18, { sky: ['#3c5468', '#1c2a34'].map(hex), frame: hex('#3a3430'), cols: 2, rows: 1 });
    K.box(p, x + w - 17, 62, 12, 26, K.paint(shade(hex(a), 0.7)), { light: 0.2 });
    p.area(x + w - 7, 74, 1, 2, () => hex('#f0d070'));
  }
  // Gehweg, Straße, Bordstein
  p.area(0, 88, K.W, 8, (x, y) => shade(hex('#c8bea8'), 0.9 + fbm(x / 4, y, 2, 276) * 0.16 - (x % 22 === 0 ? 0.2 : 0)));
  p.area(0, 95, K.W, 1, () => hex('#7a7468'));
  p.area(0, 96, K.W, K.H - 96, K.asphalt(hex('#6c6a6c'), 92, 277));
  p.area(0, 118, K.W, 2, (x) => (Math.floor(x / 22) % 2 ? hex('#d8d0a8') : hex('#6c6a6c')));
  // Hydrant und Parkuhr
  K.box(p, 174, 80, 6, 11, K.paint(hex('#c8382c')), { light: 0.4 });
  p.area(173, 80, 8, 2, () => hex('#e85040'));
  p.area(170, 66, 1, 24, () => hex('#4a4a50'));
  K.box(p, 167, 60, 7, 7, K.metal(hex('#8a8a92')), { light: 0.4 });
  // Schatten des Lasters und der Häuser
  p.softPoly([[0, 88], [176, 88], [190, 96], [0, 100]], hex('#14182c'), 0.16, 3);
  p.softPoly([[180, 104], [294, 104], [300, 114], [186, 114]], hex('#10121c'), 0.36, 3);
  K.finish(p, { tint: hex('#fff0c8'), tintAmount: 0.08, vignette: 0.22 });
  return p;
}

/** Offener Lastwagen mit Mist auf der Ladefläche. */
export function mistlaster(hover: boolean): Picture {
  const w = hover ? 120 : 112;
  const p = K.picture(w, 58);
  const cabX = w - 40;
  const bodyC = hover ? hex('#7a8a98') : hex('#3e6a54');
  const dark = shade(bodyC, 0.55);
  // Rahmen
  K.box(p, 2, 42, w - 6, 5, K.metal(hex('#28282e')), { light: 0.1 });
  // Ladefläche
  K.box(p, 2, 22, cabX - 2, 21, (x, y) => (x % 9 === 0 ? dark : shade(K.wood(shade(bodyC, 0.85), false, 280)(x, y), 1)), { light: 0.2 });
  p.area(2, 21, cabX - 2, 1, () => shade(bodyC, 1.4));
  // Mist: braun, feucht, mit Stroh
  for (let y = 4; y < 23; y++) {
    for (let x = 3; x < cabX - 1; x++) {
      const t = (x - 3) / (cabX - 4);
      const top = 22 - 16 * Math.sin(t * Math.PI) ** 0.6 - (fbm(x / 4, 1, 3, 281) - 0.5) * 5;
      if (y < top) continue;
      const n = fbm(x / 2.2, y / 2.2, 3, 282);
      const straw = noise(x, y, 283) > 0.9;
      const lit = (y - top) < 1.5 ? 1.2 : 1;
      p.set(x, y, straw ? hex('#c8a860') : shade(mix(hex('#6a4c2c'), hex('#2c1c10'), n), lit));
    }
  }
  // Führerhaus
  K.box(p, cabX, 12, w - cabX - 2, 31, (x, y) => mix(shade(bodyC, 1.2), shade(bodyC, 0.7), (y - 12) / 31 + (x - cabX) * 0.004), { light: 0.2 });
  p.area(cabX + 6, 16, w - cabX - 14, 13, (x, y) => mix(hex('#c8e0ee'), hex('#4a6c88'), (y - 16) / 14 + (x - cabX) * 0.006));
  p.line(cabX + 9, 28, cabX + 16, 17, hex('#ffffff'), 1.6, 0.3);
  p.area(cabX, 12, w - cabX - 2, 1, () => shade(bodyC, 1.5));
  // Stoßstange und Scheinwerfer
  p.area(w - 6, 40, 6, 3, (x, y) => chrome(x, y));
  p.area(w - 5, 30, 3, 5, () => hex('#fff4c8'));
  if (hover) {
    // Kein Rad mehr, zwei Schwebeplatten; ein Lastwagen bleibt es trotzdem
    for (const x of [14, w - 40]) {
      K.box(p, x, 47, 26, 5, K.metal(hex('#4a4e5c')), { light: 0.3 });
      p.area(x + 2, 52, 22, 1, () => hex('#60e0ff'));
      p.glow(x + 13, 54, 12, hex('#40c8ff'), 0.5, 0.5);
    }
  } else {
    for (const x of [18, w - 24]) {
      for (let y = 40; y < 58; y++) {
        for (let px = x - 9; px <= x + 9; px++) {
          const d = Math.hypot(px - x, y - 49);
          if (d > 9) continue;
          p.set(px, y, d > 5.5 ? mix(hex('#1c1c20'), hex('#34343a'), (y - 40) / 18) : d < 2 ? hex('#3a3a42') : mix(hex('#dcdce0'), hex('#74767e'), (px - x + 5) / 10));
        }
      }
    }
  }
  return p;
}

/** Zwei Beine ragen aus dem Mist: ein rein mechanischer Gag. */
export function beine(trouser: string): Picture {
  const p = K.picture(20, 16);
  for (const [x, lean] of [[6, -1], [13, 1]] as const) {
    p.line(x, 14, x + lean, 2, hex(trouser), 4);
    p.line(x - 1, 14, x + lean - 1, 2, shade(hex(trouser), 1.3), 1);
    p.area(x + lean - 3, 0, 6, 3, (px) => mix(hex('#4a2c18'), hex('#20140c'), (px - x) / 6 + 0.5));
  }
  for (let x = 0; x < 20; x++) {
    for (let y = 12; y < 16; y++) {
      if (y >= 14 - fbm(x / 3, 1, 2, 290) * 3) p.set(x, y, mix(hex('#6a4c2c'), hex('#2c1c10'), fbm(x / 2, y / 2, 2, 291)));
    }
  }
  return p;
}
