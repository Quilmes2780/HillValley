import * as K from './kit.ts';
import { fbm, hex, mix, type Picture, shade } from './painter.ts';

/** Die Sprites, die groß genug sind, dass sie im Malstil stehen müssen. */

export function laborSchrankZu(): Picture {
  const p = K.picture(32, 66);
  K.box(p, 0, 0, 32, 66, K.metal(hex('#6a6c74'), 600), { light: 0.25 });
  p.area(15, 1, 2, 64, () => hex('#16161c'));
  for (const x of [3, 19]) {
    p.area(x, 4, 10, 58, (px, py) => shade(p.get(px, py), 0.88));
    p.area(x, 4, 10, 1, () => hex('#2a2a32'));
    p.area(x, 61, 10, 1, () => hex('#9a9aa4'));
    for (let i = 0; i < 3; i++) p.area(x + 2, 8 + i * 3, 6, 1, () => hex('#26262e'));
  }
  p.area(12, 30, 2, 6, () => hex('#e8c060'));
  p.area(18, 30, 2, 6, () => hex('#e8c060'));
  return p;
}

export function bueste(): Picture {
  const p = K.picture(26, 38);
  p.poly([[5, 18], [8, 15], [18, 15], [21, 18]], (x) => mix(hex('#ffe890'), hex('#7a5a20'), (x - 5) / 16));
  p.poly([[8, 3], [18, 3], [20, 8], [18, 13], [14, 16], [12, 16], [8, 13], [6, 8]], (x, y) => mix(hex('#fff0a0'), hex('#7a5a20'), (x - 6) / 14 + (y - 3) * 0.012));
  p.area(7, 1, 12, 3, (x) => mix(hex('#ffe890'), hex('#8a6a28'), (x - 7) / 12));
  p.area(10, 7, 2, 1, () => hex('#5a3e14'));
  p.area(15, 7, 2, 1, () => hex('#5a3e14'));
  p.area(12, 11, 3, 1, () => hex('#7a5a20'));
  p.glow(10, 5, 5, hex('#fff4c0'), 0.2);
  return p;
}

function helmBasis(p: Picture): void {
  // Gewölbe aus Blech mit Nieten
  for (let y = 3; y <= 16; y++) {
    for (let x = 4; x <= 22; x++) {
      const d = Math.hypot((x - 13) / 9.5, (y - 16) / 13);
      if (d > 1) continue;
      p.set(x, y, shade(hex('#8a8c94'), 1.3 - (x - 4) * 0.03 - (y - 3) * 0.006 + fbm(x / 3, y / 3, 2, 601) * 0.14));
    }
  }
  p.area(3, 15, 20, 3, (x) => mix(hex('#a8a8b0'), hex('#3a3a42'), (x - 3) / 20));
  for (let x = 5; x < 22; x += 4) p.set(x, 16, hex('#e8e8f0'));
}

export function helm(): Picture {
  const p = K.picture(26, 22);
  helmBasis(p);
  // Spule und Drähte
  for (let x = 6; x < 22; x += 4) p.line(x, 3, x + 1, 0, hex('#c87a30'), 1);
  K.box(p, 8, 7, 3, 3, K.solid(hex('#d83a30')), { light: 0 });
  K.box(p, 15, 7, 3, 3, K.solid(hex('#f0c040')), { light: 0 });
  p.area(10, 11, 6, 3, (x, y) => ((x + y) % 2 ? hex('#c87a30') : hex('#7a4418')));
  return p;
}

export function helmOhneSpule(): Picture {
  const p = K.picture(26, 22);
  helmBasis(p);
  K.box(p, 8, 7, 3, 3, K.solid(hex('#34343c')), { light: 0 });
  K.box(p, 15, 7, 3, 3, K.solid(hex('#34343c')), { light: 0 });
  p.area(10, 11, 6, 3, () => hex('#2a2a30'));
  p.line(10, 12, 7, 15, hex('#c87a30'), 0.8);
  return p;
}

export function sicherungskasten(): Picture {
  const p = K.picture(24, 30);
  K.box(p, 0, 0, 24, 30, K.metal(hex('#7a7c84'), 602), { light: 0.3 });
  p.area(4, 4, 16, 2, () => hex('#3a3a42'));
  p.poly([[8, 10], [15, 10], [11, 16], [14, 16], [7, 24], [10, 17], [7, 17]], hex('#e8c030'));
  p.area(18, 14, 3, 5, () => hex('#d8d8e0'));
  return p;
}

export function sicherungskastenOffen(): Picture {
  const p = K.picture(24, 30);
  K.box(p, 0, 0, 24, 30, K.solid(hex('#1a1a20')), { light: 0, rim: hex('#8a8c94'), dark: hex('#34343c') });
  for (const y of [5, 14, 23]) {
    for (const x of [4, 14]) K.box(p, x, y, 6, 3, K.metal(hex('#a8a8b0')), { light: 0.3 });
  }
  p.line(3, 28, 21, 28, hex('#c87a30'), 0.8);
  return p;
}

export function kastenOffen(): Picture {
  const p = K.picture(12, 12);
  K.box(p, 1, 1, 10, 10, K.solid(hex('#16161c')), { light: 0, rim: hex('#a8a8b0'), dark: hex('#4a4a52') });
  p.area(3, 3, 2, 2, () => hex('#e04030'));
  p.area(7, 3, 2, 2, () => hex('#f0c040'));
  p.area(3, 7, 6, 1, () => hex('#c8c8d0'));
  return p;
}

export function kabelKasten(): Picture {
  const p = K.picture(24, 30);
  p.line(2, 0, 3, 21, hex('#2a1408'), 1.8);
  p.line(3, 21, 21, 28, hex('#2a1408'), 1.8);
  p.line(3, 0, 4, 21, hex('#e08a30'), 0.9);
  p.line(4, 21, 21, 27, hex('#e08a30'), 0.9);
  return p;
}

export function grundsteinAuf(): Picture {
  const p = K.picture(18, 12);
  K.box(p, 0, 0, 18, 12, K.stone(hex('#9a8f90'), 18, 12, 603), { light: 0.3 });
  p.area(3, 3, 12, 7, (x, y) => mix(hex('#0c0a0a'), hex('#2a2422'), (y - 3) / 7 + (x - 3) * 0.008));
  p.area(3, 3, 12, 1, () => hex('#050404'));
  p.area(3, 9, 12, 1, () => hex('#6a6464'));
  return p;
}

export function kofferraumOffen(): Picture {
  const p = K.picture(24, 12);
  K.box(p, 0, 0, 24, 12, K.solid(hex('#100e12')), { light: 0, rim: hex('#a8a8b0'), dark: hex('#3a3a42') });
  p.area(3, 4, 14, 7, (x, y) => mix(hex('#b03a34'), hex('#5a1a1c'), (y - 4) / 7 + (x - 3) * 0.01));
  p.area(3, 4, 14, 1, () => hex('#e0605a'));
  return p;
}
