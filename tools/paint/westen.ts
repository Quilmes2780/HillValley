import * as K from './kit.ts';
import { clamp01, fbm, hex, mix, noise, type Picture, ramp, shade, smooth, type RGB } from './painter.ts';

/** 1885: tief stehende Sonne, Staub in der Luft, ausgebleichtes Holz. */
const SKY = ['#5e8cb0', '#9ab4b4', '#e0c490', '#f8d088', '#fdeab4'].map(hex);
const SUN = hex('#ffc070');
const DUST = hex('#e8b070');

function west(p: Picture, horizon = 92, seed = 300): void {
  K.sky(p, { stops: SKY, horizon, cover: 0.58, cloud: [hex('#b89078'), hex('#fff4d8')], seed });
  // Tafelberge in zwei Schichten Dunst
  const mesa = (s: number, base: number, c0: RGB, c1: RGB): void => {
    for (let x = 0; x < K.W; x++) {
      const n = fbm(x / 34, 1, 3, s);
      const top = horizon - base * smooth(0.42, 0.56, n) - fbm(x / 9, 3, 2, s + 1) * 3;
      p.area(x, top, 1, horizon - top + 1, (px, py) => {
        const strata = Math.floor((py + fbm(px / 16, 2, 2, s) * 4) / 3) % 2 ? 1.06 : 0.94;
        const lit = fbm((px + 1) / 34, 1, 3, s) > n ? 1.14 : 0.86;
        return shade(mix(c0, c1, (py - top) / (base + 1)), strata * lit);
      });
    }
  };
  mesa(seed + 2, 34, hex('#b48468'), hex('#d4a47c'));
  mesa(seed + 3, 16, hex('#9c5e3c'), hex('#be7e4c'));
  p.area(0, 0, K.W, horizon + 2, (x, y) => mix(p.get(x, y), DUST, smooth(40, horizon, y) * 0.26));
}

const desert = (horizon = 92, seed = 310): K.Mat => (x, y) => {
  const d = clamp01((y - horizon) / (K.H - horizon));
  const ripple = fbm(x / (5 + d * 16), y / (1.1 + d * 3), 3, seed);
  const tufts = fbm(x / 24, y / 8, 3, seed + 3);
  const c = mix(hex('#e4b478'), hex('#a8703c'), ripple * 0.7 + d * 0.2);
  return mix(c, hex('#7a6a3c'), smooth(0.66, 0.78, tufts) * 0.45);
};

function sparePebbles(p: Picture, horizon: number, seed: number, count: number): void {
  for (let i = 0; i < count; i++) {
    const y = Math.floor(horizon + 4 + noise(i, 2, seed) * (K.H - horizon - 6));
    const x = Math.floor(noise(i, 3, seed) * K.W);
    const r = 1 + (y - horizon) * 0.03;
    p.area(x, y, 2 * r, r, (px, py) => mix(hex('#c8a078'), hex('#6a4a30'), (py - y) / r + (px - x) * 0.05));
  }
}

const wetWood = (base: string, seed: number, spacing = 9): K.Mat => K.planks(hex(base), spacing, true, seed);

export function abstellgleis(): Picture {
  const p = K.picture();
  west(p, 92, 320);
  p.area(0, 92, K.W, K.H - 92, desert(92, 321));
  sparePebbles(p, 92, 322, 34);
  // Wassertank auf Stelzen
  for (const [x, lean] of [[26, 2], [50, -2]] as const) p.line(x, 66, x + lean, 96, hex('#3e2a1c'), 2.5);
  p.line(26, 76, 50, 90, hex('#4a3220'), 1.4);
  p.line(50, 76, 26, 90, hex('#4a3220'), 1.4);
  K.box(p, 24, 40, 30, 28, K.planks(hex('#7a5a36'), 5, true, 323), { light: 0.45 });
  p.poly([[22, 40], [39, 30], [56, 40]], (x) => mix(hex('#a07a50'), hex('#4a3220'), (x - 22) / 34));
  for (const y of [47, 60]) p.area(24, y, 30, 2, (x) => mix(hex('#6a6a70'), hex('#2a2a30'), (x - 24) / 30));
  p.line(54, 62, 62, 72, hex('#3a3a40'), 1.4);
  p.line(62, 72, 62, 80, hex('#3a3a40'), 1.4);
  // Kaktus: wie gemalt, mit Rippen
  const arm = (x: number, y: number, w: number, h: number): void => {
    p.area(x, y, w, h, (px, py) => {
      const t = (px - x) / w;
      const rib = (px - x) % 3 === 0 ? 0.78 : 1;
      return shade(mix(hex('#8ca858'), hex('#2e4a2c'), t + fbm(px, py / 5, 2, 324) * 0.2), rib);
    });
  };
  K.contact(p, 278, 91, 20, 0.45, 3);
  arm(284, 64, 8, 28);
  arm(277, 72, 7, 5);
  arm(277, 66, 4, 11);
  arm(292, 78, 6, 4);
  arm(295, 70, 4, 12);
  // Gleis, auf dem der Zug steht
  p.area(0, 98, K.W, 12, (x, y) => mix(p.get(x, y), shade(hex('#7c6a54'), 0.72 + fbm(x / 1.4, y / 1.2, 2, 325) * 0.6), 0.75));
  for (let x = 1; x < K.W; x += 9) p.area(x, 100, 5, 9, (px, py) => shade(K.wood(hex('#5e4028'), true, 326)(px, py), px === x ? 1.25 : 0.95));
  for (const y of [101, 106]) {
    p.area(0, y, K.W, 1, (x) => mix(hex('#d8ccb8'), hex('#8a8078'), noise(x / 8, y, 3)));
    p.area(0, y + 1, K.W, 1, () => hex('#2c2420'));
  }
  // Schatten der tiefen Sonne fallen nach rechts vorn
  p.softPoly([[24, 96], [54, 96], [100, 114], [64, 118]], hex('#2c1408'), 0.24, 3);
  p.softPoly([[278, 92], [298, 92], [320, 104], [316, 110]], hex('#2c1408'), 0.24, 3);
  p.glow(30, 80, 110, SUN, 0.12, 0.6);
  K.finish(p, { tint: hex('#ffc890'), tintAmount: 0.14, vignette: 0.34, seed: 327 });
  return p;
}

export function schmiede(): Picture {
  const p = K.picture();
  K.room(p, {
    wall: wetWood('#5a3e28', 330, 12),
    floor: K.concrete(hex('#5a4634'), 88, 331),
    skirt: hex('#2a1c10'),
    ceiling: hex('#0c0805'),
    ceilingAmount: 0.85,
  });
  // Sonnenstrahlen durch Ritzen in der Bretterwand
  for (const [x, a] of [[120, 0.1], [160, 0.07], [188, 0.09]] as const) p.beam([[x, 0], [x + 3, 0], [x + 44, 118], [x + 30, 118]], hex('#ffcc88'), a);

  // Esse: Ziegel, Rauchfang, Glut
  K.contact(p, 26, 88, 70, 0.55, 4);
  p.poly([[34, 0], [86, 0], [80, 34], [40, 34]], (x, y) => shade(K.brick(hex('#6a3a2c'), 332)(x, y), 0.65 + (x - 34) * 0.002));
  K.box(p, 26, 52, 70, 36, K.brick(hex('#7a4432'), 333), { light: 0.2 });
  K.box(p, 26, 34, 70, 6, K.metal(hex('#34302e')), { light: 0.25 });
  p.area(34, 40, 54, 22, (x, y) => mix(hex('#100806'), hex('#1e0c08'), (y - 40) / 22 + x * 0.0005));
  // Kohlen und Glut
  for (let y = 50; y < 62; y++) {
    for (let x = 36; x < 86; x++) {
      const top = 56 - Math.sin(((x - 36) / 50) * Math.PI) * 6 - fbm(x / 3, 1, 2, 334) * 2;
      if (y < top) continue;
      const n = fbm(x / 2.6, y / 2.2, 3, 335);
      const heat = clamp01(1 - Math.abs(x - 60) / 26 - (y - top) * 0.02 + (n - 0.5) * 0.9);
      p.set(x, y, ramp(['#1c100c', '#7a1c10', '#e8481c', '#ffb030', '#fff0a0'].map(hex), heat));
    }
  }
  p.glow(60, 52, 95, hex('#ff6a20'), 0.46, 0.8);
  p.glow(60, 56, 36, hex('#ffb040'), 0.32, 0.7);
  K.sunPatch(p, [[28, 90], [100, 90], [130, 134], [4, 134]], hex('#ff7a30'), 0.16);
  // Blasebalg
  p.poly([[96, 62], [116, 52], [116, 74]], (x, y) => mix(hex('#6a4426'), hex('#3a2212'), fbm(x / 3, y / 2, 2, 336)));
  K.box(p, 114, 50, 3, 26, K.wood(hex('#3a2212')), { light: 0.1 });

  // Amboss auf einem Stumpf
  K.contact(p, 124, 88, 46, 0.55, 5);
  K.box(p, 134, 74, 26, 14, K.wood(hex('#6e4a2a'), true, 337), { light: 0.3 });
  p.poly([[122, 64], [172, 64], [168, 69], [156, 70], [153, 74], [141, 74], [138, 70], [130, 69]], (x, y) => mix(hex('#6c6a70'), hex('#1a1a20'), (y - 64) / 10 + (x - 122) * 0.008));
  p.area(124, 64, 46, 1, () => hex('#d8c8b0'));
  p.glow(128, 66, 8, hex('#ff8030'), 0.2);
  // Hammer lehnt daran, Zange hängt daneben
  p.line(160, 87, 168, 74, hex('#7a5a36'), 1.6);
  K.box(p, 165, 71, 7, 4, K.metal(hex('#34343a')), { light: 0.4 });

  // Werkbank mit Werkzeugwand
  p.area(196, 24, 60, 32, (x, y) => shade(K.wood(hex('#6a4c30'), true, 338)(x, y), 0.8));
  for (let i = 0; i < 7; i++) {
    const x = 201 + i * 8;
    const h = 11 + (i % 3) * 3;
    p.area(x, 28, 2, h, () => hex('#2a2a2e'));
    p.area(x - 1, 28 + h, 4, 3, () => hex('#5a5a62'));
    p.area(x, 26, 2, 2, () => hex('#c8a068'));
  }
  K.contact(p, 196, 92, 60, 0.5, 4);
  K.box(p, 198, 63, 6, 29, K.wood(hex('#4a3020'), true, 339), { light: 0.3 });
  K.box(p, 248, 63, 6, 29, K.wood(hex('#4a3020'), true, 340), { light: 0.3 });
  K.box(p, 204, 74, 44, 2, K.wood(hex('#4a3020'), false, 341), { light: 0 });
  K.box(p, 196, 58, 60, 5, K.wood(hex('#94683c'), false, 342), { light: 0.15 });
  // Schraubstock
  K.box(p, 240, 52, 9, 6, K.metal(hex('#4c4c54')), { light: 0.4 });
  // Eimer mit Löschwasser
  K.contact(p, 172, 112, 16, 0.4, 3);
  K.box(p, 174, 100, 12, 12, K.planks(hex('#7a5a36'), 3, true, 343), { light: 0.4 });
  p.area(175, 100, 10, 2, () => hex('#3a4c54'));

  K.door(p, 270, 24, 36, 64, wetWood('#7a5a34', 344, 8), hex('#3a2616'));
  // Ein Hufeisen über der Tür
  p.line(284, 16, 284, 12, hex('#6a6a70'), 1.4);
  p.line(292, 16, 292, 12, hex('#6a6a70'), 1.4);
  p.line(284, 12, 288, 9, hex('#6a6a70'), 1.4);
  p.line(292, 12, 288, 9, hex('#6a6a70'), 1.4);
  K.finish(p, { tint: hex('#ffb070'), tintAmount: 0.12, vignette: 0.56, vigColor: hex('#080402') });
  return p;
}

export function saloon(): Picture {
  const p = K.picture();
  K.room(p, {
    wall: K.wallpaper(hex('#7a3030'), hex('#642428'), 16, 350),
    floor: K.woodFloor(hex('#8a5e34'), 100, 351),
    floorY: 100,
    skirt: hex('#3a2212'),
    ceiling: hex('#160a08'),
    ceilingAmount: 0.8,
  });
  // Täfelung bis zur Theke
  p.area(0, 66, K.W, 34, (x, y) => wetWood('#5e3a20', 352, 14)(x, y));
  p.area(0, 66, K.W, 2, () => hex('#a87a48'));

  // Spiegel hinter der Bar mit Flaschenbord darunter
  K.box(p, 56, 10, 128, 32, K.wood(hex('#6a4220'), false, 353), { light: 0.15, rim: hex('#e0b070') });
  p.area(60, 14, 120, 24, (x, y) => mix(hex('#9aa89a'), hex('#4c5a58'), (y - 14) / 26 + fbm(x / 24, y / 7, 3, 354) * 0.3));
  for (const [x, w] of [[74, 3], [120, 2], [150, 4]] as const) p.line(x, 37, x + 14, 15, hex('#f8f4e0'), w, 0.2);
  p.glow(120, 26, 50, hex('#ffd890'), 0.12, 0.5);
  K.box(p, 56, 42, 128, 3, K.wood(hex('#8a5e34'), false, 355), { light: 0.1 });
  for (let i = 0; i < 16; i++) {
    const x = 60 + i * 7.6;
    const h = 7 + (i * 7) % 4;
    const c = ['#6a3a20', '#3e5a34', '#8a6a24', '#2c3a2c', '#7a2420'][i % 5];
    p.area(x, 42 - h, 3, h, (px) => shade(hex(c), px < x + 1 ? 1.5 : 0.9));
    p.area(x + 1, 42 - h - 2, 1, 2, () => hex('#2a1810'));
  }

  // Ölgemälde: eine Landschaft, keine Dame
  K.box(p, 204, 22, 36, 26, K.wood(hex('#8a6430'), false, 356), { light: 0.2, rim: hex('#e8c878') });
  p.area(207, 25, 30, 20, (x, y) => (y < 33 + Math.sin(x / 4) * 2 ? mix(hex('#c88a50'), hex('#f0d090'), (y - 25) / 8) : mix(hex('#9a5a30'), hex('#4a2a18'), fbm(x / 3, y / 2, 3, 357))));

  // Kronleuchter
  p.area(150, 0, 1, 7, () => hex('#2a1810'));
  p.area(136, 7, 28, 2, () => hex('#8a6430'));
  for (const x of [136, 145, 155, 164]) {
    p.area(x, 5, 1, 2, () => hex('#fff0c0'));
    p.glow(x, 5, 12, hex('#ffb860'), 0.26);
  }
  p.glow(150, 8, 90, hex('#ffb060'), 0.2, 0.7);

  // Spucknapf und Klavier-Andeutung links
  K.contact(p, 249, 89, 14, 0.4, 2);
  p.poly([[251, 81], [261, 81], [263, 89], [249, 89]], (x) => mix(hex('#d8b868'), hex('#6a4c20'), (x - 249) / 14));
  p.area(251, 81, 10, 1, () => hex('#2a1810'));
  K.contact(p, 8, 98, 40, 0.55, 3);
  K.box(p, 8, 60, 40, 38, K.wood(hex('#2c1a10'), true, 358), { light: 0.2 });
  p.area(10, 72, 36, 6, (x) => (x % 3 ? hex('#efe8d4') : hex('#26221e')));
  p.area(12, 60, 32, 2, () => hex('#a87a48'));
  K.box(p, 14, 48, 26, 12, K.paint(hex('#3a2a20')), { light: 0.2 });
  // Sägemehl und Licht auf den Dielen
  K.sunPatch(p, [[250, 102], [312, 102], [320, 142], [200, 142]], hex('#ffcc88'), 0.14);

  // Schwingtür: durch sie fällt die Sonne
  p.area(268, 22, 40, 66, (x, y) => mix(hex('#fff0c0'), hex('#f4c478'), (y - 22) / 66 + (x - 268) * 0.002));
  p.area(268, 62, 40, 26, (x, y) => mix(hex('#e8b078'), hex('#c88a50'), (y - 62) / 26 + fbm(x / 8, y / 4, 2, 359) * 0.2));
  K.box(p, 265, 20, 3, 68, K.wood(hex('#4a2c18'), true, 360), { light: 0.2 });
  K.box(p, 308, 20, 3, 68, K.wood(hex('#4a2c18'), true, 361), { light: 0.2 });
  p.area(265, 18, 46, 3, () => hex('#4a2c18'));
  for (const x of [268, 288]) {
    K.box(p, x, 40, 20, 26, K.planks(hex('#94683c'), 4, true, x), { light: 0.2 });
    p.area(x, 40, 20, 2, () => hex('#c49a64'));
  }
  p.beam([[270, 66], [306, 66], [292, 142], [160, 142]], hex('#ffd898'), 0.13);
  K.finish(p, { tint: hex('#ffb078'), tintAmount: 0.12, vignette: 0.52, vigColor: hex('#080402') });
  return p;
}

export function saloonTheke(): Picture {
  const p = K.picture(180, 30);
  K.box(p, 0, 0, 180, 30, K.planks(hex('#5a3418'), 18, true, 370), { light: 0.1 });
  p.area(0, 0, 180, 5, (x, y) => K.wood(hex('#a8743c'), false, 371)(x, y));
  p.area(0, 0, 180, 1, () => hex('#e8c078'));
  p.area(0, 5, 180, 2, () => hex('#1a0c06'));
  for (let x = 2; x < 176; x += 18) {
    p.area(x + 3, 10, 12, 14, (px, py) => shade(p.get(px, py), 0.76));
    p.area(x + 3, 10, 12, 1, () => hex('#2a1408'));
    p.area(x + 3, 23, 12, 1, () => hex('#b08050'));
  }
  // Messingstange für die Füße
  p.area(0, 26, 180, 1, (x) => mix(hex('#f4d890'), hex('#7a5a24'), noise(x / 7, 1, 2)));
  p.area(0, 27, 180, 1, () => hex('#2a1408'));
  return p;
}

export function festplatz(): Picture {
  const p = K.picture();
  west(p, 92, 380);
  p.area(0, 92, K.W, K.H - 92, K.dirt(hex('#d0a06c'), hex('#946638'), 92, 381));
  sparePebbles(p, 92, 382, 24);
  // Radspuren
  for (const [a, b] of [[210, 300], [240, 332]] as const) p.line(a, 92, b, 144, hex('#6a4426'), 1.5, 0.3, 2, a);

  // Festzelt-Stand mit Fähnchen
  K.contact(p, 10, 92, 82, 0.45, 4);
  K.box(p, 14, 60, 74, 32, wetWood('#8a6236', 383, 7), { light: 0.3 });
  p.area(14, 66, 74, 18, (x, y) => mix(hex('#20140c'), hex('#3a2616'), (y - 66) / 18 + x * 0.001));
  K.box(p, 10, 80, 82, 12, wetWood('#a87a44', 384, 8), { light: 0.2 });
  p.area(10, 80, 82, 2, () => hex('#d8b070'));
  p.poly([[6, 56], [96, 56], [86, 36], [16, 36]], (x, y) => {
    const stripe = Math.floor((x - 6) / 9) % 2;
    return shade(stripe ? hex('#b03a30') : hex('#f0e4c4'), 1.1 - (y - 36) * 0.008 + (fbm(x / 8, y / 4, 2, 385) - 0.5) * 0.12);
  });
  p.area(6, 56, 90, 2, () => hex('#5a2a1c'));
  for (const x of [14, 86]) K.box(p, x, 56, 3, 36, K.wood(hex('#6a4426'), true, x), { light: 0.3 });
  // Girlande quer über den Platz
  for (let i = 0; i < 26; i++) {
    const t = i / 25;
    const x = 90 + t * 210;
    const y = 30 + Math.sin(t * Math.PI) * 14;
    p.poly([[x, y], [x + 4, y], [x + 2, y + 5]], ['#c83a30', '#f0e0b0', '#3a6a9a'].map(hex)[i % 3]);
  }

  // Anschlagtafel
  K.contact(p, 106, 92, 26, 0.4, 3);
  for (const x of [110, 127]) K.box(p, x, 44, 3, 48, K.wood(hex('#6a4426'), true, x), { light: 0.3 });
  K.box(p, 106, 46, 26, 30, K.planks(hex('#a07a48'), 5, false, 386), { light: 0.2 });

  // Rohbau des Turms: das gibt die Baustelle her
  p.area(134, 12, 66, 2, () => hex('#5a4630'));
  K.box(p, 142, 34, 42, 58, K.stone(hex('#d8c098'), 8, 5, 387), { light: 0.35 });
  // Ungleiche Oberkante: hier wird noch gebaut
  for (let x = 142; x < 184; x++) {
    const drop = Math.floor(fbm(x / 6, 1, 2, 388) * 16);
    p.area(x, 34, 1, drop, () => null);
    for (let y = 34; y < 34 + drop; y++) p.set(x, y, K_sky(x, y));
  }
  // Grundstein vorn am Fuß
  K.box(p, 143, 79, 16, 13, K.stone(hex('#b8a080'), 16, 13, 389), { light: 0.3 });
  p.area(146, 84, 10, 1, () => hex('#4a3a28'));
  p.area(146, 87, 10, 1, () => hex('#4a3a28'));
  // Gerüst: Balken mit Knoten, schräg verstrebt
  for (const x of [136, 160, 176, 198]) K.box(p, x, 12, 3, 80, K.wood(hex('#8a6236'), true, x + 1), { light: 0.3 });
  for (const y of [30, 58]) K.box(p, 134, y, 66, 3, K.wood(hex('#a87a44'), false, y), { light: 0.15 });
  p.line(139, 58, 160, 30, hex('#6a4a2a'), 1.8);
  p.line(179, 58, 198, 30, hex('#6a4a2a'), 1.8);
  p.line(160, 92, 176, 58, hex('#6a4a2a'), 1.8);
  // Leiter hinauf
  for (const x of [162, 172]) p.area(x, 58, 2, 34, () => hex('#b88a50'));
  for (let y = 60; y < 92; y += 5) p.area(162, y, 11, 1, () => hex('#d8b070'));
  // Steinstapel und Mörtelkasten
  K.contact(p, 204, 91, 22, 0.35, 3);
  K.box(p, 204, 82, 22, 9, K.stone(hex('#c8b08c'), 7, 3, 390), { light: 0.3 });
  K.box(p, 208, 76, 14, 6, K.stone(hex('#d8c098'), 7, 3, 391), { light: 0.3 });

  // Lange Schatten nach rechts
  p.softPoly([[142, 92], [200, 92], [260, 112], [190, 118]], hex('#2c1408'), 0.24, 4);
  p.softPoly([[10, 92], [92, 92], [136, 110], [58, 114]], hex('#2c1408'), 0.2, 4);
  K.finish(p, { tint: hex('#ffc890'), tintAmount: 0.13, vignette: 0.3, seed: 392 });
  return p;

  function K_sky(x: number, y: number): RGB {
    return mix(ramp(SKY, y / 92), DUST, smooth(40, 92, y) * 0.26 + noise(x, y, 3) * 0.01);
  }
}

export function mietstall(): Picture {
  const p = K.picture();
  west(p, 92, 400);
  p.area(0, 92, K.W, K.H - 92, K.dirt(hex('#c49a64'), hex('#8c6034'), 92, 401));
  sparePebbles(p, 92, 402, 26);
  // Hoher Scheunengiebel
  K.contact(p, 8, 92, 132, 0.5, 5);
  K.box(p, 8, 30, 132, 62, wetWood('#7a5430', 403, 8), { light: 0.3 });
  p.poly([[0, 32], [74, 2], [148, 32]], (x, y) => shade(K.planks(hex('#6a4426'), 7, true, 404)(x, y), x < 74 ? 1.1 : 0.76));
  p.line(0, 32, 74, 2, hex('#2a1a0e'), 2);
  p.line(148, 32, 74, 2, hex('#2a1a0e'), 2);
  // Heuluke und Balken mit Flaschenzug
  K.box(p, 62, 10, 24, 15, K.solid(hex('#160c06')), { rim: hex('#a87a48') });
  p.area(64, 20, 20, 5, (x, y) => mix(hex('#e8c878'), hex('#a88840'), fbm(x / 2, y / 2, 2, 405)));
  K.box(p, 73, 0, 4, 10, K.wood(hex('#5a3a20'), true, 406), { light: 0.2 });
  p.area(75, 9, 1, 8, () => hex('#2a1810'));
  // Schild
  K.box(p, 34, 23, 80, 12, K.wood(hex('#4a2c18'), false, 407), { light: 0.15, rim: hex('#a07a48') });
  K.lettering(p, 'MIETSTALL', 38, 24, hex('#f4e4b8'));

  // Offenes Stalltor
  p.area(40, 42, 50, 50, (x, y) => mix(hex('#0e0805'), hex('#2a1a0e'), (y - 42) / 60 + fbm(x / 8, y / 5, 2, 408) * 0.18));
  p.poly([[42, 92], [88, 92], [78, 62], [52, 62]], hex('#8a6a34'), 0.3);
  K.box(p, 37, 40, 3, 52, K.wood(hex('#4a2c18'), true, 409), { light: 0.2 });
  K.box(p, 90, 40, 3, 52, K.wood(hex('#4a2c18'), true, 410), { light: 0.2 });
  K.box(p, 37, 38, 56, 3, K.wood(hex('#5a3a20'), false, 411), { light: 0.15 });
  K.box(p, 14, 44, 22, 48, wetWood('#8a6236', 412, 5), { light: 0.2 });
  p.line(14, 44, 36, 92, hex('#4a2c18'), 2);
  K.box(p, 94, 44, 22, 48, wetWood('#8a6236', 413, 5), { light: 0.2 });
  p.line(116, 44, 94, 92, hex('#4a2c18'), 2);

  // Zaun, Tränke und Heuballen
  for (let x = 146; x < 240; x += 18) K.box(p, x, 68, 4, 26, K.wood(hex('#8a6236'), true, x), { light: 0.3 });
  for (const y of [72, 82]) K.box(p, 142, y, 104, 3, K.wood(hex('#a07a48'), false, y), { light: 0.15 });
  K.contact(p, 120, 92, 22, 0.4, 3);
  K.box(p, 120, 83, 22, 9, K.planks(hex('#7a5430'), 5, true, 414), { light: 0.3 });
  p.area(122, 83, 18, 2, () => hex('#5a7a84'));
  K.finish(p, { tint: hex('#ffc890'), tintAmount: 0.13, vignette: 0.32, seed: 415 });
  return p;
}

export function misthaufen(): Picture {
  const p = K.picture(70, 34);
  for (let y = 0; y < 34; y++) {
    for (let x = 0; x < 70; x++) {
      const t = (x + 0.5) / 70;
      const top = 33 - 30 * Math.sin(t * Math.PI) ** 0.75 - (fbm(x / 5, 1, 3, 420) - 0.5) * 7;
      if (y < top) continue;
      const n = fbm(x / 2.3, y / 2.3, 3, 421);
      const lit = clamp01(1 - (x / 70) * 1.1 - (y - top) * 0.018);
      const straw = noise(x, y, 422) > 0.92;
      p.set(x, y, straw ? mix(hex('#d8b868'), hex('#8a6a30'), lit) : shade(mix(hex('#7a5430'), hex('#2a1a0e'), n), 0.72 + lit * 0.5));
    }
  }
  return p;
}

/** Ein braves Pferd im Profil, bewusst schlicht. */
export function pferd(): Picture {
  const p = K.picture(52, 44);
  const coat = (x: number, y: number): RGB => {
    const light = clamp01(0.75 - (y - 8) * 0.018);
    return shade(mix(hex('#7a4a28'), hex('#a06a3a'), fbm(x / 6, y / 5, 3, 430)), 0.72 + light * 0.5);
  };
  // Hinterbeine zuerst
  for (const [x, w] of [[9, 4], [33, 4]] as const) p.area(x, 25, w, 16, (px, py) => shade(coat(px, py), 0.7));
  // Rumpf, Hals, Kopf
  p.poly([[6, 14], [12, 11], [34, 12], [38, 16], [39, 26], [33, 29], [12, 29], [6, 25]], coat);
  p.poly([[33, 15], [37, 6], [42, 3], [44, 9], [40, 21]], coat);
  p.poly([[41, 2], [47, 3], [51, 10], [49, 13], [45, 12], [41, 8]], (x, y) => shade(coat(x, y), 1.05));
  // Mähne und Schweif
  p.line(34, 14, 39, 4, hex('#2a1a10'), 2.2);
  p.line(6, 15, 2, 24, hex('#2a1a10'), 2);
  p.line(2, 24, 3, 31, hex('#2a1a10'), 1.6);
  // Auge, Nüstern, Ohr
  p.set(44, 6, hex('#100806'));
  p.set(49, 11, hex('#3a2010'));
  p.area(41, 0, 2, 3, () => hex('#5a3620'));
  // Vorderbeine, Hufe
  for (const [x, w] of [[13, 4], [29, 4]] as const) {
    p.area(x, 27, w, 14, coat);
    p.area(x, 41, w + 1, 3, () => hex('#1c120c'));
  }
  for (const x of [9, 33]) p.area(x, 41, 5, 3, () => hex('#1c120c'));
  // Sattel
  p.poly([[16, 10], [28, 10], [29, 16], [15, 16]], (x, y) => mix(hex('#6a2a20'), hex('#3a1610'), (y - 10) / 8 + x * 0.003));
  p.area(21, 16, 2, 8, () => hex('#2a1810'));
  // Zügel
  p.line(29, 11, 44, 10, hex('#2a1810'), 0.8);
  return p;
}
