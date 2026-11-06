import * as K from './kit.ts';
import { clamp01, fbm, hex, mix, noise, type Picture, shade, smooth, type RGB } from './painter.ts';

/**
 * 2015: Nacht, Neon, nasser Boden. In der Fassung unter Tannen rot und erdrückend,
 * nach der Heilung kühl-türkis und freundlicher.
 */
const NEON = hex('#60f0ff');
const PINK = hex('#ff50b0');
const DANGER = hex('#ff4030');

/** Spiegelnder Boden: holt, was schon gemalt ist, nach unten. */
function reflect(p: Picture, y0: number, strength: number, seed = 500): void {
  const copy = K.picture();
  copy.px.set(p.px);
  for (let y = y0; y < K.H; y++) {
    for (let x = 0; x < K.W; x++) {
      const dist = y - y0;
      const wobble = (fbm(x / 7, y / 2.2, 3, seed) - 0.5) * 4;
      const refl = copy.get(x + wobble, y0 - dist * 1.1 - 1);
      const wet = 0.4 + 0.6 * smooth(0.4, 0.66, fbm(x / 22, y / 6, 4, seed + 1));
      p.blend(x, y, refl, strength * wet * (1 - dist / (K.H - y0 + 12)));
    }
  }
}

const glossy = (a: RGB, b: RGB, y0: number, seed: number, tile = 32): K.Mat => (x, y) => {
  const d = clamp01((y - y0) / (K.H - y0));
  const cell = (px: number, py: number): readonly [number, number] => {
    const dy = Math.max(1, py - y0 + 16);
    return [Math.floor((((px - 160) / dy) * 128) / tile), Math.floor((300 / dy) * 0.4)];
  };
  const [cu, cv] = cell(x, y);
  const [ru] = cell(x + 1, y);
  const [du, dv] = cell(x, y + 1);
  const seam = ru !== cu || du !== cu || dv !== cv;
  return shade(mix(a, b, d + fbm(x / 26, y / 8, 3, seed) * 0.2), seam ? 0.72 : 1);
};

function neonSign(p: Picture, text: string, x: number, y: number, c: RGB, strength = 0.05): void {
  K.lettering(p, text, x, y, mix(c, hex('#ffffff'), 0.65), c, strength);
}

function neonLine(p: Picture, x: number, y: number, w: number, c: RGB, strength = 0.3): void {
  p.area(x, y, w, 1, () => mix(c, hex('#ffffff'), 0.6));
  for (let px = x; px < x + w; px += 6) p.glow(px, y, 9, c, strength * 0.28, 0.6);
}

function hoverCar(p: Picture, x: number, y: number, w: number, c: RGB): void {
  p.poly([[x + 6, y], [x + w - 8, y], [x + w, y + 7], [x, y + 7]], (px, py) => mix(shade(c, 1.4), shade(c, 0.6), (py - y) / 7 + (px - x) * 0.006));
  p.area(x + 9, y + 1, w - 20, 3, () => hex('#a8e0f0'));
  p.area(x + 3, y + 7, w - 7, 2, () => hex('#14161e'));
  p.glow(x + w / 2, y + 10, w * 0.6, NEON, 0.28, 0.25);
}

export function turmplatz2015(healed: boolean): Picture {
  const p = K.picture();
  const accent = healed ? NEON : DANGER;
  K.sky(p, {
    stops: healed ? ['#0a0e2c', '#1c1e50', '#3a2c74', '#7a3e8a', '#d0608a'].map(hex) : ['#120610', '#2a0a14', '#50101a', '#8a1c1c', '#d04420'].map(hex),
    cover: 0.52,
    cloud: healed ? [hex('#20204c'), hex('#6a4a8a')] : [hex('#2a0c10'), hex('#8a2a1c')],
    seed: 510,
  });
  // Sterne nur in der geheilten Fassung
  if (healed) for (let i = 0; i < 40; i++) p.set(Math.floor(noise(i, 1, 2) * K.W), Math.floor(noise(i, 2, 2) * 30), hex('#e8f0ff'));
  K.skylineLayer(p, 511, 42, 30, healed ? hex('#262252') : hex('#3a1018'), 0.2, 92, healed ? hex('#70e8ff') : hex('#ffb040'));
  K.skylineLayer(p, 512, 24, 26, healed ? hex('#161434') : hex('#20080e'), 0.26, 92, healed ? hex('#ff80d0') : hex('#ffd060'));
  hoverCar(p, 176, 4, 44, healed ? NEON : hex('#c0c8d0'));
  hoverCar(p, 24, 14, 30, healed ? hex('#ff80d0') : hex('#8a4a4a'));
  hoverCar(p, 262, 26, 22, hex('#d0d0d8'));

  // Der Turm: glatt, verspiegelt, innen das alte Uhrwerk
  K.box(p, 128, 0, 64, 92, (x, y) => mix(hex('#2c3048'), hex('#14161e'), y / 92 + (x - 128) / 90), { light: 0.2, rim: accent, dark: hex('#04040a') });
  for (let y = 6; y < 54; y += 8) {
    p.area(134, y, 52, 4, (x) => {
      const on = noise(Math.floor(x / 6), y, 3) > 0.45;
      return on ? mix(hex('#3a5a8a'), healed ? hex('#70e8ff') : hex('#ffb060'), 0.5) : hex('#182034');
    });
  }
  for (let y = 12; y <= 48; y++) {
    for (let x = 142; x <= 178; x++) {
      const d = Math.hypot(x - 160, y - 30);
      if (d > 18) continue;
      p.set(x, y, d > 16 ? mix(accent, hex('#ffffff'), 0.5) : mix(hex('#fff8e0'), hex('#c8d8d8'), d / 16));
    }
  }
  p.line(160, 30, 160, 20, hex('#14141c'), 1.6);
  p.line(160, 30, 167, 30, hex('#14141c'), 1.6);
  p.glow(160, 30, 42, healed ? hex('#a0f0ff') : hex('#ffb070'), 0.3);
  K.box(p, 134, 50, 52, 10, K.solid(healed ? hex('#0e3a44') : hex('#5a0e10')), { light: 0, rim: accent, dark: accent });
  neonSign(p, healed ? 'RATHAUS' : 'TANNEN', healed ? 142 : 145, 50, healed ? NEON : hex('#ffd060'));
  // Eingang
  K.box(p, 146, 62, 28, 30, K.metal(hex('#3a3c4c'), 513), { light: 0.2, rim: accent });
  p.area(159, 62, 2, 30, () => hex('#0a0a12'));
  p.area(148, 66, 9, 18, (x, y) => mix(hex('#6a8ca8'), hex('#2a3a4c'), (y - 66) / 18 + x * 0.001));
  p.area(163, 66, 9, 18, (x, y) => mix(hex('#6a8ca8'), hex('#2a3a4c'), (y - 66) / 18 + x * 0.001));

  // Café 80er: Neon und Chrom
  K.box(p, 30, 44, 78, 48, (x, y) => mix(hex('#6a2a6a'), hex('#34143c'), (y - 44) / 48 + fbm(x / 9, y / 6, 2, 514) * 0.15), { light: 0.2 });
  K.box(p, 30, 44, 78, 11, K.solid(hex('#0c0814')), { light: 0, rim: PINK, dark: PINK });
  neonSign(p, 'CAFE 80ER', 38, 44, PINK, 0.05);
  K.box(p, 36, 60, 22, 18, K.solid(hex('#1c2a4c')), { light: 0, rim: NEON, dark: NEON });
  p.line(38, 76, 50, 62, hex('#80f0ff'), 2, 0.25);
  p.glow(47, 69, 16, NEON, 0.18);
  K.box(p, 66, 58, 26, 34, (x, y) => mix(hex('#ff70c0'), hex('#a02a7a'), (y - 58) / 34 + (x - 66) * 0.008), { light: 0.2, rim: hex('#ffffff') });
  p.area(70, 62, 18, 12, () => hex('#2c1c4c'));
  p.area(88, 76, 1, 3, () => hex('#ffffff'));

  // Museum: Marmor und zu viel Licht
  K.box(p, 208, 44, 62, 48, K.stone(hex('#8c8ca0'), 14, 7, 515), { light: 0.25 });
  K.box(p, 208, 44, 62, 11, K.solid(healed ? hex('#0e3a44') : hex('#5a0e10')), { light: 0, rim: accent, dark: accent });
  neonSign(p, 'MUSEUM', 217, 44, healed ? NEON : hex('#ffd060'));
  K.box(p, 226, 58, 26, 34, K.metal(hex('#5a5c70'), 516), { light: 0.2, rim: hex('#e0e0f0') });
  p.area(238, 58, 2, 34, () => hex('#1a1a26'));
  // Gasse rechts
  p.area(300, 58, 20, 34, (x, y) => mix(hex('#040408'), hex('#14141c'), (y - 58) / 34 + (x - 300) * 0.004));
  K.box(p, 296, 56, 4, 36, K.metal(hex('#3a3c4c')), { light: 0.3, rim: accent });
  // Tannen-Reklame hängt über allem, wenn die Zeitlinie krank ist
  if (!healed) {
    K.box(p, 4, 32, 22, 24, K.solid(hex('#5a0e10')), { light: 0, rim: hex('#ffd060'), dark: hex('#ffd060') });
    neonSign(p, 'B.T.', 6, 39, hex('#ffd060'));
    for (const x of [9, 19]) p.area(x, 56, 2, 36, () => hex('#14141c'));
  }

  // Heller, spiegelnder Boden
  p.area(0, 92, K.W, K.H - 92, glossy(hex('#22243a'), hex('#454860'), 92, 517));
  p.area(0, 92, K.W, 1, () => hex('#0a0a14'));
  reflect(p, 92, 0.62, 518);
  neonLine(p, 0, 92, K.W, accent, 0.2);
  K.finish(p, { vignette: 0.44, vigColor: hex('#04040c'), seed: 519, tint: healed ? hex('#80c0ff') : hex('#ff7040'), tintAmount: 0.08 });
  return p;
}

export function cafe80er(): Picture {
  const p = K.picture();
  K.room(p, {
    wall: (x, y) => mix(hex('#3a1c5a'), hex('#22103c'), y / 88 + fbm(x / 22, y / 12, 3, 520) * 0.2),
    floor: K.checkerFloor(hex('#a8a8bc'), hex('#14141e'), 88, 521),
    ceiling: hex('#08040e'),
    ceilingAmount: 0.6,
  });
  // Neonbänder
  neonLine(p, 0, 7, K.W, PINK, 0.5);
  neonLine(p, 0, 85, K.W, NEON, 0.5);
  p.area(0, 0, K.W, 7, (x, y) => mix(hex('#5a1a50'), hex('#140818'), (7 - y) / 7 + noise(x / 10, 1, 2) * 0.1));
  // Geometrische Wandmuster: ein gemaltes Jahrzehnt
  for (let i = 0; i < 9; i++) {
    const x = 176 + i * 11;
    p.poly([[x, 22], [x + 6, 14], [x + 12, 22], [x + 6, 30]], i % 2 ? hex('#4a2a7a') : hex('#2a6a7a'), 0.55);
  }
  p.line(170, 60, 262, 34, PINK, 1, 0.5);
  p.line(170, 66, 262, 40, NEON, 1, 0.5);

  K.door(p, 6, 28, 30, 60, (x, y) => mix(hex('#ff70c0'), hex('#a02a7a'), (y - 28) / 60 + (x - 6) * 0.008), hex('#14141e'));
  neonLine(p, 3, 25, 36, NEON, 0.4);

  // Poster: Berühmtheiten als Silhouetten
  const posters = [[60, '#f4d040'], [96, '#40d0d8'], [132, '#ff70b0']] as const;
  for (const [x, c] of posters) {
    K.box(p, x, 16, 26, 34, (px, py) => mix(hex(c), shade(hex(c), 0.55), (py - 16) / 34 + (px - x) * 0.008), { light: 0.1, rim: hex('#fff8e8'), dark: hex('#0a0a0e') });
    for (let y = 22; y < 44; y++) {
      for (let px = x + 5; px < x + 21; px++) {
        const inHead = Math.hypot(px - (x + 13), y - 27) < 5;
        const inBody = y > 32 && Math.abs(px - (x + 13)) < 8 - (44 - y) * 0.14;
        if (inHead || inBody) p.set(px, y, hex('#1c1420'));
      }
    }
    p.glow(x + 13, 14, 12, hex('#ffe8c0'), 0.14);
  }

  // Theke mit Chrom und blinkender Kasse
  K.contact(p, 52, 88, 110, 0.5, 4);
  K.box(p, 52, 62, 110, 26, (x, y) => mix(hex('#5a5c70'), hex('#22222e'), 0.5 + 0.5 * Math.sin(y * 0.9 + x * 0.04)), { light: 0.1 });
  K.box(p, 52, 59, 110, 3, K.solid(hex('#e8e8f0')), { light: 0.1 });
  neonLine(p, 52, 62, 110, NEON, 0.5);
  K.box(p, 138, 49, 14, 10, K.metal(hex('#3a3c4c')), { light: 0.3 });
  p.area(140, 51, 10, 4, () => hex('#60f080'));
  p.glow(145, 53, 8, hex('#60f080'), 0.2);

  // Tisch für Brix: Glas auf Chrom
  K.contact(p, 212, 113, 26, 0.5, 4);
  K.box(p, 222, 95, 4, 18, K.metal(hex('#8a8c9c')), { light: 0.3 });
  K.box(p, 214, 112, 20, 2, K.metal(hex('#a8a8b8')), { light: 0.2 });
  p.area(204, 92, 40, 3, (x, y) => mix(hex('#a8f0ff'), hex('#3a7a8a'), (y - 92) / 3 + (x - 204) * 0.006));
  p.area(204, 92, 40, 1, () => hex('#ffffff'));
  p.glow(224, 93, 26, NEON, 0.18, 0.4);

  // Retro-Automat: das Spielgerät steht wie ein Altar
  K.contact(p, 266, 88, 40, 0.55, 4);
  K.box(p, 266, 28, 40, 60, (x, y) => mix(hex('#2a4a9a'), hex('#14224a'), (y - 28) / 60 + (x - 266) * 0.006), { light: 0.2, rim: NEON, dark: hex('#04040c') });
  K.box(p, 272, 34, 28, 22, K.solid(hex('#04040a')), { light: 0, rim: hex('#6a6a7a') });
  // Ein Spiel auf dem Schirm
  p.area(275, 37, 6, 3, () => hex('#60f080'));
  p.area(284, 42, 4, 4, () => hex('#ff5040'));
  p.area(292, 47, 5, 2, () => hex('#ffe060'));
  p.area(278, 50, 14, 1, () => hex('#4060c0'));
  p.glow(286, 45, 24, hex('#60a0ff'), 0.24);
  K.box(p, 274, 62, 24, 14, K.metal(hex('#2a2c3a')), { light: 0.2 });
  p.area(279, 65, 3, 8, () => hex('#e04030'));
  p.area(286, 68, 4, 4, () => hex('#ffe060'));
  p.area(283, 80, 8, 2, () => hex('#d8b868'));

  // Spiegelung im schwarz-weißen Boden
  reflect(p, 88, 0.3, 522);
  K.finish(p, { vignette: 0.46, vigColor: hex('#04020c'), seed: 523 });
  return p;
}

export function museum2015(healed: boolean): Picture {
  const p = K.picture();
  const wallC = healed ? hex('#d4d4dc') : hex('#6a2024');
  K.room(p, {
    wall: K.plaster(wallC, 530),
    floor: glossy(healed ? hex('#9a9aa8') : hex('#4a4450'), healed ? hex('#d0d0da') : hex('#7a7482'), 88, 531),
    skirt: healed ? hex('#7a7a8c') : hex('#c89a48'),
    ceiling: healed ? hex('#8a8a9a') : hex('#180608'),
    ceilingAmount: 0.6,
  });
  // Oberlichtband
  p.area(0, 0, K.W, 5, (x) => (x % 40 < 34 ? (healed ? hex('#ffffff') : hex('#ffc070')) : hex('#2a2a34')));
  p.area(0, 5, K.W, 1, () => (healed ? hex('#60f0ff') : hex('#c89a48')));

  K.door(p, 6, 26, 32, 62, K.metal(hex('#6a6c80'), 532), healed ? hex('#e8e8f0') : hex('#c89a48'));
  // Schild
  K.box(p, 92, 10, 140, 14, K.solid(healed ? hex('#0e3a44') : hex('#5a0e10')), { light: 0, rim: healed ? NEON : hex('#ffd060'), dark: healed ? NEON : hex('#ffd060') });
  neonSign(p, healed ? 'HILL VALLEY MUSEUM' : 'TANNEN-ZEITMUSEUM', healed ? 104 : 108, 12, healed ? NEON : hex('#ffd060'), 0.03);

  // Gerahmte Exponate mit Lichtspot
  const frame = (x: number, y: number, w: number, h: number, inner: (px: number, py: number) => RGB): void => {
    K.box(p, x, y, w, h, K.wood(hex('#8a6430'), true, x), { light: 0.2, rim: hex('#f0d070') });
    p.area(x + 4, y + 4, w - 8, h - 8, inner);
    p.beam([[x + 4, 26], [x + w - 4, 26], [x + w + 6, y + h + 6], [x - 6, y + h + 6]], hex('#fff0d0'), 0.08);
  };
  frame(52, 34, 26, 30, (x, y) => mix(hex('#d8c8a0'), hex('#a88c5c'), fbm(x / 3, y / 3, 3, 533)));
  frame(250, 30, 30, 34, (x, y) => mix(hex('#c8d4e0'), hex('#6a7a8c'), (y - 34) / 26 + fbm(x / 3, y / 3, 2, 534) * 0.3));
  // Kontext auf den Bildern: eine alte Stadt, ein altes Foto
  p.area(60, 44, 12, 10, () => hex('#7a5a36'));
  p.poly([[58, 44], [66, 38], [74, 44]], hex('#5a3e24'));
  for (let y = 40; y < 56; y += 3) p.area(258, y, 14, 1, () => hex('#3a4450'));

  // Podest und Absperrung; der Wagen selbst ist austauschbar
  K.sunPatch(p, [[106, 26], [220, 26], [250, 88], [78, 88]], hex('#fff0d0'), 0.12);
  K.contact(p, 86, 88, 150, 0.55, 5);
  K.box(p, 86, 80, 150, 8, K.metal(healed ? hex('#b0b0be') : hex('#5a5462'), 535), { light: 0.15, rim: healed ? NEON : hex('#ffd060') });
  for (const x of [80, 158, 240]) {
    K.contact(p, x - 2, 105, 8, 0.4, 2);
    K.box(p, x, 86, 3, 18, K.metal(hex('#d8b868')), { light: 0.4 });
    K.box(p, x - 2, 84, 7, 2, K.metal(hex('#f0d890')), { light: 0.3 });
  }
  p.line(82, 88, 158, 96, hex('#b02a30'), 1.4);
  p.line(160, 96, 240, 88, hex('#b02a30'), 1.4);

  reflect(p, 88, 0.4, 536);
  K.finish(p, { vignette: healed ? 0.26 : 0.46, vigColor: healed ? hex('#2a2a3a') : hex('#080204'), seed: 537, tint: healed ? hex('#e0f0ff') : hex('#ff9060'), tintAmount: 0.08 });
  return p;
}

export function lobby2015(): Picture {
  const p = K.picture();
  K.room(p, {
    wall: (x, y) => {
      const panel = Math.floor(x / 40);
      const seam = x % 40 < 2;
      const c = mix(hex('#2e3044'), hex('#1a1c2a'), y / 88 + noise(panel, 2, 3) * 0.12 + fbm(x / 22, y / 14, 3, 540) * 0.14);
      return seam ? hex('#0a0a12') : c;
    },
    floor: glossy(hex('#2a2c3c'), hex('#50526a'), 88, 541),
    ceiling: hex('#06060c'),
    ceilingAmount: 0.75,
  });
  // Lichtleisten
  for (const x of [20, 100, 180, 260]) {
    p.area(x, 2, 40, 2, () => hex('#e8f8ff'));
    p.glow(x + 20, 3, 34, NEON, 0.14, 0.7);
  }
  neonLine(p, 0, 85, K.W, NEON, 0.42);
  K.door(p, 6, 28, 32, 60, K.metal(hex('#50526a'), 542), hex('#14141e'));
  neonLine(p, 3, 25, 38, NEON, 0.35);

  // Empfang: nicht besetzt. Ein Schild erledigt das.
  K.contact(p, 60, 88, 80, 0.55, 5);
  K.box(p, 60, 58, 80, 30, (x, y) => mix(hex('#8a1c20'), hex('#380a10'), (y - 58) / 30 + (x - 60) * 0.004 + fbm(x / 8, y / 5, 2, 543) * 0.12), { light: 0.15 });
  K.box(p, 60, 55, 80, 3, K.metal(hex('#c8c8d8')), { light: 0.1 });
  neonLine(p, 60, 58, 80, NEON, 0.55);
  K.box(p, 84, 38, 32, 16, K.solid(hex('#04040a')), { light: 0, rim: NEON, dark: hex('#106a7a') });
  p.area(88, 44, 24, 2, () => hex('#ffe060'));
  p.area(92, 48, 16, 1, () => hex('#a0a0b0'));
  p.glow(100, 46, 22, NEON, 0.16);

  // Goldene Büste auf schwarzem Sockel
  K.contact(p, 160, 88, 12, 0.5, 3);
  K.box(p, 160, 62, 12, 26, K.metal(hex('#14141c')), { light: 0.3, rim: hex('#5a5a6c') });
  p.poly([[160, 50], [172, 50], [174, 56], [168, 62], [164, 62], [158, 56]], (x, y) => mix(hex('#fff0a0'), hex('#8a6420'), (x - 158) / 16 + (y - 50) * 0.02));
  p.glow(166, 40, 34, hex('#ffe0a0'), 0.14);
  p.beam([[158, 4], [174, 4], [186, 88], [146, 88]], hex('#fff0d0'), 0.08);

  // Aufzugsrahmen; die Türen sind austauschbar
  K.box(p, 200, 24, 44, 64, K.solid(hex('#04040a')), { light: 0, rim: NEON, dark: hex('#106a7a') });
  K.box(p, 204, 14, 36, 8, K.solid(hex('#04040a')), { light: 0, rim: hex('#3a3c4c') });
  K.lettering(p, '88', 216, 12, hex('#ff5040'), DANGER, 0.06);
  // Innenraum des Aufzugs, wenn die Türen offen stehen
  p.area(202, 26, 40, 60, (x, y) => mix(hex('#fff0c8'), hex('#a88a60'), (y - 26) / 60 + (x - 202) * 0.002));
  // Scanner
  K.box(p, 250, 52, 12, 16, K.metal(hex('#a0a2b4')), { light: 0.3 });
  p.area(252, 55, 8, 8, () => hex('#e04030'));
  p.glow(256, 59, 9, DANGER, 0.3);

  // Topfpflanze: die einzige lebendige Stelle im Raum
  K.contact(p, 278, 88, 18, 0.45, 3);
  K.box(p, 279, 74, 16, 14, K.metal(hex('#2a2c3a')), { light: 0.3 });
  for (let i = 0; i < 12; i++) {
    const a = -Math.PI * (0.1 + (i / 12) * 0.8);
    p.line(287, 74, 287 + Math.cos(a) * 15, 74 + Math.sin(a) * (18 + (i % 3) * 7), mix(hex('#3a8a58'), hex('#60d0a0'), i / 12), 1.4);
  }

  reflect(p, 88, 0.42, 544);
  K.finish(p, { vignette: 0.48, vigColor: hex('#02020a'), seed: 545 });
  return p;
}

export function aufzugZu(): Picture {
  const p = K.picture(40, 60);
  K.box(p, 0, 0, 40, 60, K.metal(hex('#8a8c9c'), 546), { light: 0.15, rim: hex('#c8cad8'), dark: hex('#2a2c3a') });
  p.area(19, 0, 2, 60, () => hex('#14141e'));
  for (const x of [4, 26]) {
    K.box(p, x, 22, 10, 16, K.metal(hex('#a8aabc'), 547), { light: 0.2 });
  }
  p.softPoly([[4, 58], [14, 2], [18, 2], [10, 58]], hex('#ffffff'), 0.1, 1);
  return p;
}

export function buero2015(): Picture {
  const p = K.picture();
  K.room(p, {
    wall: (x, y) => mix(hex('#1c2238'), hex('#10141e'), y / 88 + fbm(x / 26, y / 16, 3, 550) * 0.18),
    // Polierter Boden: Marty rutscht hier aus
    floor: glossy(hex('#54566c'), hex('#c8c8d8'), 88, 551, 64),
    ceiling: hex('#04040a'),
    ceilingAmount: 0.7,
  });
  neonLine(p, 0, 85, K.W, NEON, 0.42);
  // Fenster über die ganze Rückwand: Stadt bei Nacht
  p.area(176, 4, 92, 38, (x, y) => {
    const c = mix(hex('#0c1430'), hex('#3a2a6a'), y / 42);
    if (y <= 16 + noise(Math.floor(x / 11), 1, 553) * 18) return c;
    // Einzelne erleuchtete Fenster statt großer Flächen
    return x % 3 === 1 && y % 3 === 1 && noise(x, y, 552) > 0.62 ? hex('#ffd890') : hex('#0a0c1a');
  });
  for (const x of [176, 206, 236, 267]) p.area(x, 4, 2, 38, () => hex('#14141e'));
  p.area(176, 4, 93, 1, () => hex('#44485c'));
  p.area(176, 41, 93, 1, () => hex('#44485c'));

  // Feuertür
  K.door(p, 8, 24, 36, 64, K.metal(hex('#a02e26'), 554), hex('#34343e'));
  K.box(p, 16, 16, 20, 6, K.solid(hex('#16a050')), { light: 0, rim: hex('#a0f0c0') });
  p.glow(26, 19, 18, hex('#40ff90'), 0.28);

  // Großes Zifferblatt: das alte, jetzt hinter Glas
  for (let y = 6; y <= 76; y++) {
    for (let x = 90; x <= 168; x++) {
      const dx = Math.abs(x - 129);
      const dy = Math.abs(y - 41);
      if (dx + dy > 62 || dx > 39 || dy > 35) continue;
      const edge = Math.min(62 - dx - dy, 39 - dx, 35 - dy);
      if (edge < 2) p.set(x, y, mix(hex('#ffe9a8'), hex('#6a4c20'), (x - 90) / 78));
      else p.set(x, y, mix(hex('#fff4c8'), hex('#c89a4c'), Math.hypot(dx, dy) / 48));
    }
  }
  for (let i = 0; i < 12; i++) {
    const a = (i / 12) * Math.PI * 2;
    p.line(129 + Math.cos(a) * 26, 41 + Math.sin(a) * 26, 129 + Math.cos(a) * 31, 41 + Math.sin(a) * 31, hex('#3a2a18'), i % 3 ? 1 : 2);
  }
  p.line(129, 41, 129, 16, hex('#14100c'), 2);
  p.line(129, 41, 148, 41, hex('#14100c'), 2.4);
  p.area(127, 39, 5, 5, () => hex('#14100c'));
  p.glow(129, 41, 72, hex('#ffc070'), 0.2);

  // Aktenvernichter
  K.contact(p, 58, 88, 22, 0.55, 3);
  K.box(p, 58, 60, 22, 28, K.metal(hex('#6a6c7c'), 555), { light: 0.3 });
  K.box(p, 60, 58, 18, 3, K.solid(hex('#14141c')), { light: 0, rim: hex('#3a3c4c') });
  K.box(p, 62, 74, 14, 10, K.solid(hex('#c8cad8')), { light: 0.2 });
  p.area(66, 66, 3, 2, () => hex('#60f080'));
  p.glow(67, 67, 5, hex('#60f080'), 0.2);

  // Chronopost: die gleiche Messingkiste, 130 Jahre alt, sorgsam ins Glas gefasst
  K.contact(p, 206, 88, 60, 0.55, 4);
  K.box(p, 206, 46, 60, 42, K.metal(hex('#b08e4a'), 556), { light: 0.35, rim: hex('#ffe9a8'), dark: hex('#3a2a14') });
  K.box(p, 212, 52, 22, 3, K.solid(hex('#0c0808')), { rim: hex('#2a2018'), dark: hex('#e8c878') });
  K.box(p, 212, 72, 22, 10, K.wood(hex('#4c2e18'), false, 557), { light: 0.2 });
  p.area(214, 74, 18, 6, (x, y) => mix(hex('#0c0808'), hex('#2a1a10'), (y - 74) / 6 + x * 0.001));
  for (let y = 54; y < 70; y++) {
    for (let x = 238; x < 254; x++) {
      const d = Math.hypot(x + 0.5 - 246, y + 0.5 - 62);
      if (d <= 8) p.set(x, y, shade(hex('#d07a3a'), 1.15 - (x - 246 + y - 62) / 20));
    }
  }
  p.area(245, 56, 2, 5, () => hex('#fff4dc'));
  p.glow(236, 60, 42, hex('#ffc060'), 0.14);

  // Aufzug rechts
  K.box(p, 278, 24, 36, 64, K.metal(hex('#5a5c70'), 558), { light: 0.2, rim: NEON, dark: hex('#106a7a') });
  p.area(295, 24, 2, 64, () => hex('#0a0a12'));
  // Glanz auf dem Boden unter dem Zifferblatt
  reflect(p, 88, 0.55, 559);
  K.sunPatch(p, [[90, 90], [168, 90], [190, 142], [70, 142]], hex('#ffd090'), 0.08);
  K.finish(p, { vignette: 0.48, vigColor: hex('#02020a'), seed: 560 });
  return p;
}

export function gasse2015(): Picture {
  const p = K.picture();
  // Hinterhof: kein Neon, nur Dampf und eine Lampe, die flackert
  p.area(0, 0, K.W, 92, (x, y) => {
    const c = K.brick(hex('#544e62'), 570)(x, y);
    return mix(c, hex('#0a0a12'), smooth(30, 0, y) * 0.5 + smooth(0.55, 0.72, fbm(x / 20, y / 14, 3, 571)) * 0.2);
  });
  p.area(0, 90, K.W, K.H - 90, K.asphalt(hex('#3e3e4c'), 92, 572));
  p.area(0, 90, K.W, 3, () => hex('#0a0a12'));
  // Abflussrinne und Pfützen
  p.softPoly([[60, 112], [130, 108], [146, 120], [70, 124]], hex('#6a7aa8'), 0.22, 3);
  p.softPoly([[210, 118], [280, 116], [292, 128], [226, 130]], hex('#6a7aa8'), 0.18, 3);

  // Außentreppe vom Turm herunter
  for (let i = 0; i < 12; i++) {
    const x = i * 12;
    const y = 16 + i * 6;
    K.box(p, x, y, 12, 3, K.metal(hex('#6a6c7c'), 573 + i), { light: 0.1 });
    p.area(x, y + 3, 12, 3, (px, py) => shade(p.get(px, py), 0.7));
    p.area(x + 1, y - 10, 1, 10, () => hex('#5a5c6c'));
  }
  p.line(0, 7, 140, 77, hex('#a8aabc'), 1.2);
  p.line(0, 18, 140, 88, hex('#2a2c3a'), 2);
  K.box(p, 138, 76, 3, 16, K.metal(hex('#6a6c7c')), { light: 0.3 });

  // Mülltonnen
  K.contact(p, 30, 92, 18, 0.5, 3);
  K.box(p, 30, 74, 18, 18, K.metal(hex('#5a6a64'), 586), { light: 0.3 });
  K.box(p, 28, 72, 22, 3, K.metal(hex('#7a8a84'), 587), { light: 0.25 });
  for (const x of [34, 39, 44]) p.area(x, 76, 1, 14, () => hex('#34423e'));
  K.contact(p, 62, 92, 16, 0.5, 3);
  K.box(p, 62, 80, 16, 12, K.paint(hex('#3a2c34')), { light: 0.3 });

  // Dampf aus dem Gitter
  for (let i = 0; i < 90; i++) {
    const t = i / 90;
    const x = 150 + Math.sin(t * 8) * (2 + t * 8) + noise(i, 1, 2) * 8;
    const y = 92 - t * 72;
    for (let r = 0; r < 3; r++) p.blend(Math.floor(x + r), Math.floor(y), hex('#c8d0e0'), 0.26 * (1 - t));
  }
  K.box(p, 146, 90, 14, 2, K.metal(hex('#2a2c34')), { light: 0.1 });

  // Eine einzige Wandlampe
  K.box(p, 256, 12, 10, 4, K.metal(hex('#4a4c5c')), { light: 0.3 });
  p.area(258, 16, 6, 2, () => hex('#fff4c8'));
  p.beam([[258, 18], [264, 18], [310, 120], [190, 120]], hex('#ffe8b0'), 0.12);
  p.glow(261, 20, 42, hex('#ffd090'), 0.24);
  // Ein Rest Neon vom Platz
  p.area(300, 0, 20, 92, (x, y) => mix(p.get(x, y), hex('#14141c'), 0.3 + (x - 300) * 0.02 + y * 0.001));
  K.sunPatch(p, [[296, 92], [320, 92], [320, 144], [256, 144]], NEON, 0.08);
  K.finish(p, { vignette: 0.42, vigColor: hex('#02020a'), seed: 588, tint: hex('#a0b0e0'), tintAmount: 0.08 });
  return p;
}
