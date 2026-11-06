import * as K from './kit.ts';
import { clamp01, fbm, hex, mix, noise, type Picture, shade, smooth, type RGB } from './painter.ts';

const MORNING: readonly RGB[] = ['#7fb0dc', '#a9cde6', '#d7e6e6', '#fbeecb'].map(hex);

function gardenView(x0: number, y0: number, w: number, h: number): K.Mat {
  return (x, y) => {
    const t = (y - y0) / h;
    const u = (x - x0) / w;
    if (t > 0.62 + fbm(u * 4, 1, 3, 6) * 0.08) return mix(hex('#6f9a58'), hex('#3e6a3c'), fbm(x / 3, y / 2, 2, 8));
    if (t > 0.3 + fbm(u * 3, 2, 3, 9) * 0.25) return mix(hex('#4f7a54'), hex('#7ea468'), fbm(x / 2.5, y / 2.5, 3, 4));
    return mix(hex('#a8cfe6'), hex('#eef2dc'), t * 2);
  };
}

export function martysZimmer(): Picture {
  const p = K.picture();
  K.room(p, {
    wall: K.wallpaper(hex('#3f5f8c'), hex('#34507a'), 14, 21),
    floor: K.carpet(hex('#6c6a70'), 88, 21),
    skirt: hex('#aab0b6'),
    ceiling: hex('#23304a'),
  });
  // Morgensonne fällt durchs Fenster schräg in den Raum
  p.beam([[33, 21], [77, 21], [150, 110], [86, 128]], hex('#ffdf9a'), 0.14);
  K.sunPatch(p, [[92, 92], [150, 92], [190, 132], [108, 134]], hex('#ffe1a4'), 0.22);

  K.pane(p, 30, 18, 50, 44, { sky: MORNING, frame: hex('#e8e4d8'), view: gardenView(30, 18, 50, 44) });
  // Vorhänge
  for (const [x, w] of [[24, 9], [77, 9]] as const) {
    K.box(p, x, 14, w, 52, (px, py) => shade(hex('#b24a3a'), 0.75 + 0.3 * Math.sin(px * 1.6) + fbm(px, py / 8, 2, 3) * 0.1), { light: 0.1 });
  }
  p.area(20, 13, 70, 2, () => hex('#3a2a20'));

  // Poster
  K.box(p, 110, 18, 30, 42, K.paint(hex('#16141c')), { light: 0, rim: hex('#8a8a90') });
  p.poly([[128, 22], [118, 40], [124, 40], [119, 56], [132, 36], [126, 36]], hex('#f4d04a'));
  p.glow(125, 38, 14, hex('#ffb040'), 0.1);
  K.box(p, 146, 26, 22, 30, K.paint(hex('#7a1e20')), { light: 0, rim: hex('#c0a890') });
  p.area(150, 31, 14, 8, (x, y) => mix(hex('#f4a438'), hex('#e0542c'), (y - 31) / 8 + noise(x, 1, 2) * 0.1));
  p.area(150, 43, 14, 2, () => hex('#e8dcc8'));
  p.area(150, 47, 10, 2, () => hex('#a89888'));
  // Klebestreifen an den Ecken
  for (const [x, y] of [[109, 17], [139, 17], [145, 25], [167, 25]] as const) p.area(x, y, 2, 2, () => hex('#d8ceb0'));

  // Bett
  K.contact(p, 10, 110, 82, 0.5, 4);
  K.box(p, 8, 76, 84, 28, K.wood(hex('#6a4426'), false, 3), { light: 0.2 });
  p.area(8, 104, 4, 6, () => hex('#2c1a10'));
  p.area(88, 104, 4, 6, () => hex('#2c1a10'));
  p.area(10, 70, 80, 24, (x, y) => {
    const fold = fbm(x / 8, y / 4, 3, 41);
    const base = mix(hex('#a4382e'), hex('#62201c'), fold * 0.75 + (y - 70) / 60);
    return shade(base, 1.18 - (x - 10) / 170);
  });
  p.area(10, 70, 80, 2, () => hex('#d8604a'));
  p.area(12, 61, 24, 13, (x, y) => mix(hex('#ece6d8'), hex('#98929a'), fbm(x / 5, y / 3, 3, 42) * 0.6 + (y - 61) / 40));
  p.area(38, 66, 18, 8, (x, y) => mix(hex('#d0c4b4'), hex('#807a80'), fbm(x / 3, y / 2, 2, 43)));

  // Schreibtisch mit Lampe, Büchern, Kassetten
  K.contact(p, 172, 90, 76, 0.45, 4);
  K.box(p, 174, 67, 22, 25, K.wood(hex('#6e4526'), false, 8), { light: 0.2 });
  p.area(176, 71, 18, 7, (x, y) => shade(p.get(x, y), 1.14));
  p.area(176, 81, 18, 7, (x, y) => shade(p.get(x, y), 1.14));
  p.area(184, 74, 3, 1, () => hex('#d8b868'));
  p.area(184, 84, 3, 1, () => hex('#d8b868'));
  K.box(p, 242, 67, 4, 25, K.wood(hex('#5e3a20'), true, 9), { light: 0.1 });
  K.box(p, 172, 62, 76, 5, K.wood(hex('#a26f3c'), false, 10), { light: 0.15 });
  K.books(p, 176, 51, 18, 11, 3);
  p.area(216, 58, 8, 4, (x) => (x % 2 ? hex('#34323c') : hex('#22202a')));
  p.area(232, 50, 2, 12, () => hex('#3a3440'));
  p.poly([[226, 50], [240, 50], [236, 42], [230, 42]], (x, y) => mix(hex('#f0c060'), hex('#a06c28'), (y - 42) / 10 + (x - 226) * 0.01));
  p.glow(233, 56, 18, hex('#ffc070'), 0.16);

  // Skateboard, Kram auf dem Boden, Tür
  K.box(p, 255, 62, 8, 26, (x, y) => mix(hex('#c23a2c'), hex('#7a1e18'), fbm(x, y / 6, 2, 5)), { light: 0.3 });
  p.area(254, 64, 10, 2, () => hex('#2a2830'));
  p.area(254, 84, 10, 2, () => hex('#2a2830'));
  K.door(p, 270, 24, 36, 64, K.paint(hex('#ccc6ba')), hex('#e8e2d6'));
  // Sachen unter dem Fenster: Turnschuhe und ein Stapel Hefte
  p.area(100, 83, 10, 5, (x) => (x < 105 ? hex('#d8d4cc') : hex('#a02c24')));
  p.area(155, 82, 10, 6, (_x, y) => mix(hex('#c8b890'), hex('#5a6a7a'), (y % 2) * 0.6));
  K.finish(p, { tint: hex('#ffe0b0'), tintAmount: 0.1, vignette: 0.3 });
  return p;
}

export function kueche(): Picture {
  const p = K.picture();
  K.room(p, {
    wall: K.plaster(hex('#e6d7a8'), 23),
    floor: K.checkerFloor(hex('#c8c6c0'), hex('#6c7078'), 88, 23),
    skirt: hex('#8a6a40'),
    ceiling: hex('#a88a5a'),
    ceilingAmount: 0.5,
  });
  // Fliesenspiegel
  p.area(112, 42, 150, 18, (x, y) => {
    const c = hex('#c8d4c8');
    const seam = x % 6 === 0 || y % 6 === 0;
    return shade(c, seam ? 0.78 : 0.93 + fbm(x / 6, y / 6, 2, 8) * 0.14);
  });
  K.pane(p, 196, 12, 46, 30, { sky: MORNING, frame: hex('#f0ecdf'), view: gardenView(196, 12, 46, 30) });
  p.beam([[198, 14], [240, 14], [216, 100], [136, 100]], hex('#ffe2a0'), 0.1);
  K.sunPatch(p, [[150, 96], [214, 96], [204, 132], [116, 132]], hex('#ffefc0'), 0.22);
  // Gardine
  p.area(194, 10, 50, 7, (x, y) => mix(hex('#e8c46a'), hex('#a8743a'), (y - 10) / 8 + Math.sin(x) * 0.08));

  // Treppe nach oben
  K.box(p, 6, 20, 34, 68, K.plaster(hex('#3e2a1c')), { light: 0.2 });
  for (let i = 0; i < 7; i++) {
    const x = 6 + i * 2;
    const y = 80 - i * 9;
    p.area(x, y, 34 - i * 2, 4, (px, py) => K.wood(hex('#a87a4a'), false, 3 + i)(px, py));
    p.area(x, y + 4, 34 - i * 2, 5, (px, py) => shade(K.wood(hex('#6e4a2a'), false, 5 + i)(px, py), 0.8));
  }
  p.line(4, 88, 40, 20, hex('#2a1c10'), 2);
  p.line(4, 86, 40, 18, hex('#c49a64'), 1);

  K.door(p, 60, 24, 34, 64, K.wood(hex('#8a5a30'), true, 2), hex('#e8e2d0'));

  // Kühlschrank im 50er-Stil mit runden Ecken
  K.contact(p, 120, 88, 30, 0.45, 4);
  K.box(p, 120, 20, 30, 68, K.paint(hex('#d8dcd8')), { light: 0.3, rim: hex('#ffffff') });
  p.area(120, 44, 30, 1, () => hex('#7a7e80'));
  p.area(144, 28, 2, 12, () => hex('#6e7078'));
  p.area(144, 50, 2, 14, () => hex('#6e7078'));
  p.area(124, 26, 14, 10, (x) => (x % 5 === 0 ? hex('#a03a30') : hex('#e8e0c8')));

  // Herd mit Topf und Dampf
  K.contact(p, 154, 88, 32, 0.4, 4);
  K.box(p, 154, 56, 32, 32, K.paint(hex('#b8bcc0')), { light: 0.3 });
  K.box(p, 158, 66, 24, 18, K.metal(hex('#2c2e34')), { light: 0.1 });
  p.area(160, 68, 20, 6, (_x, y) => mix(hex('#5a4a3e'), hex('#2a2628'), (y - 68) / 6));
  p.area(154, 54, 32, 3, () => hex('#26262c'));
  for (const x of [158, 164, 170, 176]) p.area(x, 58, 3, 3, () => hex('#44464e'));
  K.box(p, 160, 47, 11, 7, K.paint(hex('#b03a2c')), { light: 0.4 });
  p.area(158, 49, 2, 1, () => hex('#3a2a20'));
  for (let i = 0; i < 40; i++) {
    const t = i / 40;
    p.blend(165 + Math.round(Math.sin(t * 9) * (1 + t * 3)), 46 - Math.round(t * 22), hex('#fffaf0'), 0.14 * (1 - t));
  }

  // Arbeitsplatte, Schränke, Obstschale
  K.contact(p, 190, 88, 62, 0.45, 4);
  K.box(p, 190, 60, 62, 28, K.wood(hex('#8c5e34'), true, 12), { light: 0.1 });
  for (const x of [192, 222]) {
    p.area(x, 64, 28, 22, (px, py) => shade(p.get(px, py), 0.78));
    p.area(x, 64, 28, 1, () => hex('#3a2616'));
    p.area(x + 12, 68, 4, 1, () => hex('#e8c878'));
  }
  K.box(p, 190, 56, 62, 4, K.paint(hex('#d8c8a0')), { light: 0.15 });
  p.poly([[208, 49], [234, 49], [229, 56], [213, 56]], (x, y) => mix(hex('#4cb0a4'), hex('#1c6a68'), (y - 49) / 7 + (x - 208) * 0.012));
  p.area(208, 49, 26, 1, () => hex('#9fe0d4'));
  p.area(226, 45, 6, 5, (x, y) => mix(hex('#e0442c'), hex('#8a1c18'), (y - 45) / 6 + (x - 226) * 0.06));
  p.area(209, 46, 6, 4, (x) => mix(hex('#ffa030'), hex('#c06a18'), (x - 209) / 6));
  // Hängeschrank
  K.box(p, 112, 6, 72, 12, K.wood(hex('#8c5e34'), true, 14), { light: 0.15 });
  p.area(112, 18, 72, 4, (x, y) => mix(p.get(x, y), hex('#1a1008'), 0.3 - (y - 18) * 0.06));

  K.door(p, 270, 24, 36, 64, K.paint(hex('#9e2c26')), hex('#ece6d8'));
  K.finish(p, { tint: hex('#fff0c8'), tintAmount: 0.08, vignette: 0.25 });
  return p;
}

export function arbeitszimmer(): Picture {
  const p = K.picture();
  // Das Studierzimmer eines Science-Fiction-Autors: Holz, grüne Tapete, eine Lampe
  K.room(p, {
    wall: K.wallpaper(hex('#2f4c36'), hex('#28402e'), 16, 25),
    floor: K.carpet(hex('#7c2a26'), 88, 25),
    skirt: hex('#4a2c18'),
    ceiling: hex('#141c16'),
  });
  // Teppichmuster
  p.area(40, 100, 240, 40, (x, y) => {
    const edge = Math.min(x - 40, 279 - x, y - 100, 139 - y);
    const c = p.get(x, y);
    if (edge < 2) return mix(c, hex('#d8a860'), 0.5);
    return (x + y) % 19 < 2 ? shade(c, 1.2) : c;
  });

  // Bücherregal voller Science-Fiction
  K.contact(p, 20, 88, 90, 0.5, 4);
  K.box(p, 20, 12, 90, 76, K.wood(hex('#4c2e18'), true, 26), { light: 0.2 });
  for (let shelf = 0; shelf < 4; shelf++) {
    const y = 16 + shelf * 18;
    p.area(23, y, 84, 15, (_px, py) => mix(hex('#1c1008'), hex('#0e0804'), (py - y) / 15));
    K.books(p, 24, y + 1, 82, 14, 30 + shelf);
    p.area(23, y + 15, 84, 2, () => hex('#7a5230'));
    p.area(23, y, 84, 2, (px, py) => mix(p.get(px, py), hex('#000000'), 0.4));
  }
  // Modellrakete oben auf dem Regal
  p.area(60, 3, 3, 9, () => hex('#d0ccc0'));
  p.poly([[61, -1], [59, 4], [64, 4]], hex('#b03a2c'));

  // Bild: Sternenkarte
  K.box(p, 235, 18, 24, 30, K.wood(hex('#8a5e30'), true, 27), { light: 0.15 });
  p.area(238, 21, 18, 24, (x, y) => {
    const base = mix(hex('#141a3e'), hex('#2a2458'), fbm(x / 6, y / 6, 3, 28));
    return noise(x * 3, y * 3, 2) > 0.86 ? hex('#fff0c0') : base;
  });

  K.door(p, 270, 24, 36, 64, K.wood(hex('#7a4c28'), true, 29), hex('#c8b89a'));

  // Schreibtisch
  K.contact(p, 130, 92, 90, 0.5, 5);
  K.box(p, 133, 65, 24, 27, K.wood(hex('#5a3a20'), true, 31), { light: 0.2 });
  p.area(137, 70, 16, 8, (x, y) => shade(p.get(x, y), 1.12));
  p.area(137, 81, 16, 8, (x, y) => shade(p.get(x, y), 1.12));
  K.box(p, 212, 65, 5, 27, K.wood(hex('#4a2e18'), true, 32), { light: 0.1 });
  K.box(p, 130, 60, 90, 5, K.wood(hex('#8a5a2e'), false, 33), { light: 0.15 });
  // Schreibmaschine
  K.box(p, 160, 50, 28, 10, K.metal(hex('#34363c'), 3), { light: 0.3 });
  K.box(p, 163, 46, 22, 5, K.metal(hex('#23252a'), 4), { light: 0.2 });
  p.area(167, 38, 14, 9, (_x, y) => mix(hex('#f4efe0'), hex('#c8c0a8'), (y - 38) / 12));
  for (let i = 0; i < 4; i++) p.area(169, 40 + i * 2, 8 + (i % 2) * 2, 1, () => hex('#7a7468'));
  for (const y of [52, 55, 58]) for (let x = 164; x < 185; x += 3) p.area(x, y, 2, 1, () => hex('#a0a2a8'));
  // Papierstapel, Tasse
  p.area(196, 54, 16, 6, (_x, y) => (y % 2 ? hex('#ece6d4') : hex('#b0a890')));
  K.box(p, 150, 53, 6, 7, K.paint(hex('#c8c0b0')), { light: 0.3 });
  // Schreibtischlampe: der warme Kern des Raums
  p.line(208, 60, 204, 44, hex('#3a3440'), 1.4);
  p.poly([[198, 44], [212, 44], [208, 37], [202, 37]], (x, y) => mix(hex('#2c6a4a'), hex('#14382a'), (y - 37) / 8 + (x - 198) * 0.01));
  p.glow(205, 52, 44, hex('#ffb860'), 0.42);
  p.glow(190, 58, 26, hex('#ffcf90'), 0.18);
  K.finish(p, { tint: hex('#ffc890'), tintAmount: 0.1, vignette: 0.5 });
  return p;
}

interface GardenMood {
  sky: readonly RGB[];
  sun: RGB;
  grass: readonly [RGB, RGB];
  tannenburg: boolean;
}

export function vorgarten(tannenburg: boolean): Picture {
  const mood: GardenMood = tannenburg
    ? { sky: ['#54505e', '#8a7468', '#d09a5a', '#eec07a'].map(hex), sun: hex('#ffb060'), grass: [hex('#4a5a34'), hex('#6a7240')], tannenburg }
    : { sky: ['#5f9fdc', '#8fc1e8', '#c8e0e8', '#f8f0d0'].map(hex), sun: hex('#fff0c0'), grass: [hex('#3f7a3a'), hex('#6fa248')], tannenburg };
  const p = K.picture();
  K.sky(p, {
    stops: mood.sky,
    cover: tannenburg ? 0.44 : 0.56,
    cloud: tannenburg ? [hex('#3e3640'), hex('#e0945a')] : [hex('#a8bcd0'), hex('#ffffff')],
    seed: tannenburg ? 61 : 62,
  });
  // Bäume und Häuser hinten im Dunst
  K.skylineLayer(p, 63, 8, 8, tannenburg ? hex('#84705e') : hex('#a4bcc0'), 0.02);
  K.tree(p, 196, 44, 16, 92, 64, hex('#2a4a34'), hex('#4a7a44'), hex('#a8c870'));
  K.tree(p, 250, 40, 20, 92, 65, hex('#24442e'), hex('#44743e'), hex('#9cc068'));

  // Rasen
  p.area(0, 90, K.W, K.H - 90, K.lawn(mood.grass[0], mood.grass[1], 90, 66));
  // Einfahrt
  p.poly([[170, 92], [320, 92], [320, 144], [150, 144]], K.asphalt(hex('#74747a'), 92, 67));
  p.line(170, 92, 150, 144, hex('#c8c0a8'), 2);
  p.area(170, 92, 150, 1, () => hex('#b8b4a8'));
  // Plattenweg zur Haustür
  p.poly([[112, 92], [138, 92], [150, 144], [90, 144]], (x, y) => {
    const row = Math.floor((y - 92) / (3 + (y - 92) * 0.12));
    const c = mix(hex('#d8c49a'), hex('#a89070'), noise(row, Math.floor(x / 12), 3));
    return shade(c, (y - 92) % Math.max(4, Math.floor(4 + (y - 92) * 0.14)) === 0 ? 0.74 : 1);
  });

  // Haus: Holzverschalung mit Schatten unter dem Dach
  const siding: K.Mat = (x, y) => {
    const f = y % 5 === 0 ? 0.72 : y % 5 === 1 ? 1.08 : 1;
    return shade(mix(hex('#f0e0b8'), hex('#c8b488'), fbm(x / 22, y / 5, 3, 68)), f);
  };
  K.box(p, 0, 22, 146, 70, siding, { light: 0.1 });
  p.area(0, 22, 150, 8, (x, y) => mix(p.get(x, y), hex('#2a1c18'), 0.55 - (y - 22) * 0.06));
  // Dach
  p.poly([[0, 22], [0, 6], [146, 6], [160, 22]], (x, y) => {
    const row = (y - 6) % 3 === 0 ? 0.74 : 1;
    const tile = (x + (y % 6 < 3 ? 3 : 0)) % 6 === 0 ? 0.82 : 1;
    return shade(mix(hex('#6e2420'), hex('#3e1414'), fbm(x / 9, y / 5, 3, 69) * 0.8), row * tile);
  });
  p.area(0, 21, 160, 2, () => hex('#1c0e0c'));
  p.area(0, 6, 146, 1, () => (tannenburg ? hex('#d09060') : hex('#b86a50')));
  // Schornstein
  K.box(p, 24, 0, 14, 8, K.brick(hex('#8a4a3a'), 70), { light: 0.3 });

  const view: K.Mat = (x, y) => mix(hex('#1c2c44'), hex('#5a7a98'), clamp01(fbm(x / 7, y / 7, 2, 7) + (x - y) * 0.004));
  K.pane(p, 16, 38, 30, 26, { sky: [hex('#284060'), hex('#5a7a98')], frame: hex('#f4f0e4'), view });
  K.pane(p, 64, 38, 30, 26, { sky: [hex('#284060'), hex('#5a7a98')], frame: hex('#f4f0e4'), view });
  for (const x of [8, 48, 56, 96]) K.box(p, x, 36, 6, 30, K.planks(hex('#3e5a44'), 2, false, 5), { light: 0.2 });

  // Veranda an der Hausecke
  K.box(p, 0, 60, 34, 32, K.plaster(hex('#a8855a')), { light: 0.15 });
  K.box(p, 0, 57, 36, 3, K.paint(hex('#e0d8c8')), { light: 0.1 });
  for (let x = 2; x < 32; x += 5) p.area(x, 72, 2, 20, (px) => (px % 2 ? hex('#f0ece0') : hex('#b8b0a0')));
  p.area(0, 71, 34, 2, () => hex('#f0ece0'));
  K.box(p, 31, 60, 3, 32, K.paint(hex('#f0ece0')), { light: 0.3 });

  // Tür und Vordach
  K.door(p, 110, 46, 30, 46, K.paint(hex('#a02e26')), hex('#f4f0e4'));
  p.poly([[104, 42], [146, 42], [141, 37], [109, 37]], hex('#6a2a20'));

  // Hecke mit Tupfen
  p.area(34, 78, 70, 14, (x, y) => {
    const n = fbm(x / 2.6, y / 2.6, 3, 71);
    if (y < 80 && n < 0.45) return null;
    return mix(hex('#1f3f24'), hex('#7aa24c'), clamp01(n * 1.5 - 0.3 - (y - 78) * 0.03));
  });

  // Briefkasten
  K.box(p, 150, 80, 2, 12, K.wood(hex('#5a3a20')), { light: 0 });
  K.box(p, 146, 74, 10, 7, K.paint(hex('#2c4a8a')), { light: 0.3 });
  p.area(154, 75, 2, 4, () => hex('#d03a2c'));

  // Großer Baum rechts rahmt das Bild
  K.tree(p, 303, 8, 22, 92, 72, tannenburg ? hex('#1a2a1e') : hex('#1f3f28'), tannenburg ? hex('#3a4c2a') : hex('#3f6e38'), tannenburg ? hex('#c08a48') : hex('#a8c860'));
  p.area(299, 40, 8, 52, (x, y) => shade(K.wood(hex('#5a3e28'), true, 73)(x, y), 1.3 - (x - 299) * 0.1));

  // Sonne von rechts oben, Schatten des Hauses und des Baums
  p.softPoly([[146, 92], [160, 92], [176, 112], [118, 112]], hex('#10121c'), 0.2, 4);
  p.softPoly([[290, 94], [314, 94], [270, 118], [226, 118]], hex('#10121c'), 0.22, 5);
  p.softPoly([[34, 92], [104, 92], [90, 100], [20, 100]], hex('#10121c'), 0.18, 3);

  if (tannenburg) {
    // Werbetafel: Alles gehört jetzt den Tannens
    for (const x of [214, 262]) K.box(p, x, 8, 6, 40, K.metal(hex('#2a2830')), { light: 0.2 });
    K.box(p, 190, 6, 104, 32, (x, y) => mix(hex('#8a1c1c'), hex('#4a0c10'), (y - 6) / 34 + fbm(x / 8, y / 4, 3, 74) * 0.3), { light: 0.1, rim: hex('#f0c060') });
    K.lettering(p, 'TANNEN', 214, 10, hex('#ffe08a'), hex('#ff8a30'), 0.03);
    K.lettering(p, 'INDUSTRIES', 204, 23, hex('#f4ece0'));
    p.glow(242, 22, 40, hex('#ff6030'), 0.12, 0.5);
    p.grade((c, _x, y) => mix(c, hex('#a87a50'), smooth(70, 0, y) * 0.1));
  }
  K.finish(p, { tint: tannenburg ? hex('#d09a60') : hex('#fff4d8'), tintAmount: tannenburg ? 0.2 : 0.08, vignette: tannenburg ? 0.45 : 0.24, seed: 75 });
  return p;
}

/** Georges Auto: eine brave, viertürige Limousine. Kein Film-Fahrzeug. */
export function auto(): Picture {
  const p = K.picture(102, 46);
  // Karosserie
  const body: K.Mat = (_x, y) => {
    const t = (y - 18) / 18;
    return mix(hex('#6a9ed4'), hex('#1c3a70'), clamp01(t ** 0.7));
  };
  p.poly([[24, 2], [72, 2], [86, 18], [14, 18]], (_x, y) => mix(hex('#9aa8b8'), hex('#5a6a7c'), (y - 2) / 18));
  p.poly([[28, 5], [47, 5], [47, 17], [20, 17]], (x, y) => mix(hex('#c8e0ee'), hex('#4a6c88'), (y - 5) / 14 + (x - 20) * 0.006));
  p.poly([[50, 5], [70, 5], [80, 17], [50, 17]], (x, y) => mix(hex('#c8e0ee'), hex('#4a6c88'), (y - 5) / 14 + (x - 50) * 0.006));
  p.line(28, 16, 40, 6, hex('#f4fbff'), 2, 0.3);
  p.line(58, 16, 66, 6, hex('#f4fbff'), 1.6, 0.25);
  p.area(2, 18, 98, 18, (x, y) => body(x, y));
  p.area(2, 18, 98, 2, () => hex('#a8d0f0'));
  p.area(2, 25, 98, 1, () => hex('#d8ecf8'));
  // Reflexion des Himmels und des Bodens
  p.area(2, 31, 98, 5, (x, y) => mix(p.get(x, y), hex('#0c1830'), 0.5));
  // Chrom
  p.area(0, 34, 102, 4, (x, y) => mix(hex('#f0f0f0'), hex('#5a5e68'), (y - 34) / 4 + noise(x / 4, 2, 3) * 0.2));
  // Türen und Griffe
  p.area(47, 19, 1, 15, () => hex('#102444'));
  p.area(28, 24, 6, 1, () => hex('#e8e8e8'));
  p.area(52, 24, 6, 1, () => hex('#e8e8e8'));
  // Lichter
  p.area(0, 22, 3, 6, () => hex('#d8302c'));
  p.area(98, 22, 4, 6, () => hex('#fff4c8'));
  p.glow(100, 25, 7, hex('#fff0b0'), 0.25);
  // Räder
  for (const x of [20, 80]) {
    for (let y = 30; y < 46; y++) {
      for (let px = x - 10; px < x + 10; px++) {
        const d = Math.hypot(px - x, y - 38);
        if (d > 8) continue;
        if (d > 5) p.set(px, y, mix(hex('#1a1a1e'), hex('#333338'), (y - 30) / 16));
        else p.set(px, y, d < 2 ? hex('#a8acb4') : mix(hex('#e8e8ec'), hex('#6c7078'), (px - x + 5) / 10));
      }
    }
  }
  return p;
}
