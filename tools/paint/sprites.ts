import * as K from './kit.ts';
import { fbm, hex, mix, type Picture, ramp, type RGB, shade } from './painter.ts';

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

function scheibe(p: Picture, cx: number, cy: number, r: number, f: (d: number, x: number, y: number) => RGB): void {
  for (let y = Math.floor(cy - r - 1); y <= cy + r + 1; y++) {
    for (let x = Math.floor(cx - r - 1); x <= cx + r + 1; x++) {
      const d = Math.hypot(x + 0.5 - cx, y + 0.5 - cy);
      if (d <= r) p.set(x, y, f(d, x, y));
    }
  }
}

/**
 * Der Zeitwagen im Museum, 130×44, Heck links. Eine eigene Erfindung, kein Filmauto:
 * flacher Stahlkeil mit durchgehender Linie von der Nase zum Dach, Heckflosse, Dachring und türkisem Lichtband statt Filmtechnik.
 * Die Tür bleibt zu, und die Heckklappe muss zu kofferraum_offen (x 4–28, y 20–32) passen.
 */
export function zeitwagen(): Picture {
  const p = K.picture(130, 44);
  const stahl = [hex('#f2f5fa'), hex('#c6ced9'), hex('#98a2b1'), hex('#6b7382'), hex('#3c414e')];
  const dunkel = hex('#14141c');

  // Heckflosse und Dachring stehen hinter der Karosserie.
  p.poly([[5, 22], [3, 13], [9, 13], [18, 21]], (x, y) => mix(hex('#5a6170'), hex('#23262f'), (y - 13) / 9 + (x - 3) * 0.01));
  p.area(3, 13, 7, 1, () => hex('#39d8c8'));
  scheibe(p, 62, 8, 3, (d) => (d > 1.6 ? hex('#39d8c8') : hex('#123038')));

  // Keil: Von der Nase läuft eine gerade Linie über Haube und Frontscheibe bis zum flachen Dach.
  const karosserie: [number, number][] = [
    [3, 26], [6, 21], [40, 19], [53, 10], [70, 10], [127, 31], [127, 35], [120, 37], [3, 37],
  ];
  p.poly(karosserie, (x, y) => {
    const t = (y - 10) / 27 + (fbm(x / 16, y * 1.4, 2, 611) - 0.5) * 0.09;
    return ramp(stahl, t);
  });

  // Fensterband, Scheibe spiegelt den Saal.
  p.poly([[54, 12], [69, 12], [84, 20], [45, 20]], (x, y) => mix(hex('#6a8ca8'), hex('#141c2c'), (y - 12) / 9 + (x - 45) * 0.008));
  p.poly([[57, 12], [61, 12], [55, 20], [51, 20]], hex('#d8e8f4'), 0.28);
  p.area(64, 12, 1, 9, () => hex('#20242e'));

  // Eine Kante fällt zur Nase hin ab und betont den Keil; darunter wird es dunkler.
  p.area(40, 21, 46, 1, () => hex('#fbfdff'));
  const kante = (x: number): number => Math.round(26 + ((x - 4) * 6) / 122);
  for (let x = 4; x < 127; x++) {
    p.set(x, kante(x), hex('#e6ebf2'));
    p.set(x, kante(x) + 1, hex('#4c5260'));
  }
  p.area(3, 33, 124, 4, (x, y) => mix(hex('#3a3e4a'), hex('#1c1e26'), (y - 33) / 4 + (x % 2) * 0.03));

  // Türfuge und Griff
  for (const x of [45, 85]) p.area(x, 22, 1, 10, () => hex('#2c303a'));
  p.area(76, 24, 5, 1, () => hex('#20242e'));
  p.area(76, 25, 5, 1, () => hex('#f4f6fa'));

  // Heckklappe: Fuge um die Fläche, die sich öffnen lässt.
  p.area(4, 21, 24, 1, () => hex('#3a3e4a'));
  p.area(28, 21, 1, 11, () => hex('#3a3e4a'));

  // Lichtband an der Schwelle
  p.area(42, 34, 46, 2, () => hex('#39d8c8'));
  p.area(42, 34, 46, 1, () => hex('#b4fff4'));

  // Lichter
  p.area(3, 24, 3, 4, () => hex('#e0382e'));
  p.area(3, 24, 3, 1, () => hex('#ff8a70'));
  p.poly([[114, 26], [122, 28], [127, 31], [118, 30]], hex('#fff0b8'));

  // Räder
  for (const cx of [30, 104]) {
    scheibe(p, cx, 35, 8.5, () => hex('#101016'));
    scheibe(p, cx, 35, 7.5, (d, x, y) => {
      if (d > 4.5) return mix(hex('#34343e'), hex('#17171d'), (y - 28) / 14);
      const speiche = (Math.floor(((Math.atan2(y + 0.5 - 35, x + 0.5 - cx) + Math.PI) / (2 * Math.PI)) * 10) % 2) === 0;
      if (d < 1.3) return hex('#39d8c8');
      return speiche ? hex('#d6dce6') : hex('#5c6270');
    });
  }

  // Dunkle Umrisslinie wie bei den Figuren
  const rand: [number, number][] = [];
  for (let y = 0; y < p.h; y++) {
    for (let x = 0; x < p.w; x++) {
      if (p.touched[y * p.w + x]) continue;
      const nachbar = [[1, 0], [-1, 0], [0, 1], [0, -1]].some(([dx, dy]) => {
        const nx = x + dx;
        const ny = y + dy;
        return nx >= 0 && ny >= 0 && nx < p.w && ny < p.h && p.touched[ny * p.w + nx] === 1;
      });
      if (nachbar) rand.push([x, y]);
    }
  }
  for (const [x, y] of rand) p.set(x, y, dunkel);
  return p;
}

export function kofferraumOffen(): Picture {
  const p = K.picture(24, 12);
  K.box(p, 0, 0, 24, 12, K.solid(hex('#100e12')), { light: 0, rim: hex('#a8a8b0'), dark: hex('#3a3a42') });
  p.area(3, 4, 14, 7, (x, y) => mix(hex('#b03a34'), hex('#5a1a1c'), (y - 4) / 7 + (x - 3) * 0.01));
  p.area(3, 4, 14, 1, () => hex('#e0605a'));
  return p;
}
