import { fbm, hex, mix, noise, Picture, ramp, shade, type RGB } from './painter.ts';

/** Bildstreifen für bewegte Raumdetails: alle Bilder einer Animation nebeneinander. */

function gear(r: number, teeth: number, frames: number, base: RGB, seed: number): Picture {
  const size = r * 2 + 3;
  const p = new Picture(size * frames, size);
  const c = (size - 1) / 2;
  const inner = r - Math.max(2, r * 0.16);
  const rim = inner * 0.7;
  const hub = Math.max(1.5, r * 0.26);
  const hole = Math.max(0.6, r * 0.1);
  // Vier Speichen: Nach einer Vierteldrehung sieht das Rad wieder gleich aus, die Schleife hat keine Naht.
  const quarter = Math.PI / 2;
  for (let f = 0; f < frames; f++) {
    const rot = (f / frames) * quarter;
    for (let y = 0; y < size; y++) {
      for (let x = 0; x < size; x++) {
        const dx = x - c;
        const dy = y - c;
        const d = Math.hypot(dx, dy);
        const a = Math.atan2(dy, dx) - rot;
        const toothOn = Math.cos(a * teeth) > 0;
        const outer = toothOn ? r : inner;
        if (d > outer) continue;
        const spoke = d * Math.min(Math.abs(Math.sin(a)), Math.abs(Math.cos(a)));
        const solid = d >= rim || d <= hub || spoke < Math.max(1.2, r * 0.13);
        if (!solid || d < hole) {
          if (d < hole) p.set(x + f * size, y, shade(base, 0.18));
          continue;
        }
        // Das Licht bleibt stehen, nur das Rad dreht sich.
        const light = 1.12 - ((dx + dy) / (r * 2)) * 0.42;
        const edge = d > outer - 1 || (d >= rim && d < rim + 1) ? 0.72 : 1;
        const tex = 0.96 + fbm(x / 4, y / 4, 2, seed) * 0.08;
        p.set(x + f * size, y, shade(base, light * edge * tex));
      }
    }
  }
  return p;
}

const GOLD = hex('#b08c40');
const GRAU = hex('#6e6c78');

export const fx_zahn_gold17 = (): Picture => gear(17, 16, 12, GOLD, 701);
export const fx_zahn_grau22 = (): Picture => gear(22, 20, 12, GRAU, 702);
export const fx_zahn_gold14 = (): Picture => gear(14, 12, 12, GOLD, 703);
export const fx_zahn_gold9 = (): Picture => gear(9, 8, 8, hex('#8a7040'), 704);
export const fx_zahn_grau7 = (): Picture => gear(7, 8, 8, GRAU, 705);
export const fx_zahn_klein_gold = (): Picture => gear(5, 8, 8, GOLD, 706);
export const fx_zahn_klein_grau = (): Picture => gear(5, 8, 8, hex('#8a8a92'), 707);

/** Die Welle, die im Uhrwerk vor den Zahnrädern zur großen Uhr läuft. */
export function fx_welle(): Picture {
  const p = new Picture(112, 16);
  p.line(1, 13, 110, 1, hex('#34323c'), 2);
  p.line(1, 12, 110, 0, hex('#6a6874'), 1);
  return p;
}

const FIRE = [hex('#7a1806'), hex('#d8420c'), hex('#ff8a18'), hex('#ffd850'), hex('#fff6c8')];

function flames(w: number, h: number, frames: number, profile: (u: number) => number, seed: number): Picture {
  const p = new Picture(w * frames, h);
  for (let f = 0; f < frames; f++) {
    const a = (f / frames) * Math.PI * 2;
    for (let y = 0; y < h; y++) {
      const up = 1 - y / h;
      for (let x = 0; x < w; x++) {
        const u = x / (w - 1);
        const n = fbm(x / 5 + Math.cos(a) * 1.5, y / 4 + Math.sin(a) * 1.5 + up * 2, 3, seed);
        const v = profile(u) * (1.25 - up * 1.1) + (n - 0.5) * 1.05 - up * 0.3;
        if (v < 0.22) continue;
        p.set(x + f * w, y, ramp(FIRE, Math.min(1, (v - 0.22) * 1.25)));
      }
    }
  }
  return p;
}

export const fx_flamme_esse = (): Picture =>
  flames(52, 18, 8, (u) => 0.72 + 0.3 * Math.sin(u * Math.PI), 711);
export const fx_flamme_kamin = (): Picture =>
  flames(44, 30, 8, (u) => Math.max(0, Math.sin(u * Math.PI)) ** 1.4 * 1.1, 712);

/** Kleines Spiel auf dem Automaten im Café, von fern. */
export function fx_schirm_automat(): Picture {
  const W = 24;
  const H = 16;
  const frames = 8;
  const p = new Picture(W * frames, H);
  for (let f = 0; f < frames; f++) {
    p.area(f * W, 0, W, H, () => hex('#0a0a1e'));
    for (let i = 0; i < 6; i++) p.set(f * W + ((i * 7 + f * 3) % W), (i * 5) % H, hex('#8080c0'));
    const ship = 3 + Math.round(Math.sin((f / frames) * Math.PI * 2) * 3);
    p.area(f * W + 3, 6 + ship - 3, 4, 2, () => hex('#50f090'));
    p.area(f * W + ((22 - f * 3 + W) % W), 3, 3, 3, () => hex('#f05060'));
    p.area(f * W + ((30 - f * 3) % W), 11, 3, 3, () => hex('#f0c040'));
    p.area(f * W + 2, 14, 2 + f * 2, 1, () => hex('#4080f0'));
  }
  return p;
}

/** Das Bild im Radioladen: Rauschen und Testbild wechseln sich ab. */
export function fx_fernsehen(): Picture {
  const W = 24;
  const H = 18;
  const frames = 8;
  const p = new Picture(W * frames, H);
  for (let f = 0; f < frames; f++) {
    for (let y = 0; y < H; y++) {
      for (let x = 0; x < W; x++) {
        const n = noise(x * 3 + f * 31, y * 5 + f * 17, 720);
        const line = (y + f * 3) % 7 === 0 ? 1.15 : 1;
        p.set(f * W + x, y, shade(hex('#a8b4b0'), (0.4 + n * 0.8) * line));
      }
    }
  }
  return p;
}

/** Der Automat von nahem: ein eigenes kleines Weltraumspiel. */
export function fx_automat_spiel(): Picture {
  const W = 192;
  const H = 120;
  const frames = 16;
  const p = new Picture(W * frames, H);
  const rim = hex('#2a2440');
  for (let f = 0; f < frames; f++) {
    const ox = f * W;
    const t = f / frames;
    p.area(ox, 0, W, H, (x, y) => {
      const lx = x - ox;
      if (lx < 6 || lx >= W - 6 || y < 6 || y >= H - 6) return rim;
      // Sterne ziehen vorbei und bleiben bei jedem Durchlauf dieselben.
      const row = Math.floor(y / 3);
      const star = noise(row, 3, 730) * W;
      const sx = (star - t * W * (1 + (row % 3))) % W;
      const near = Math.abs(lx - (sx < 0 ? sx + W : sx)) < 1;
      return near && row % 2 ? hex('#a0a0e0') : mix(hex('#05051a'), hex('#180a30'), y / H);
    });
    const shipY = 58 + Math.round(Math.sin(t * Math.PI * 4) * 24);
    p.poly([[30, shipY - 5], [48, shipY], [30, shipY + 5], [34, shipY]].map(([x, y]) => [ox + x, y]) as [number, number][], hex('#50f090'));
    p.area(ox + 26, shipY - 1, 6, 2, () => hex(f % 2 ? '#ffc040' : '#ff7020'));
    // Hindernisse kommen von rechts, der Schuss räumt sie ab.
    for (let i = 0; i < 4; i++) {
      const u = (t * 2 + i / 4) % 1;
      const bx = Math.round(180 - u * 150);
      const by = 22 + ((i * 23) % 76);
      p.area(ox + bx, by, 9, 9, () => hex(i % 2 ? '#f05060' : '#f0a030'));
      p.area(ox + bx + 2, by + 2, 3, 3, () => hex('#fff0c0'));
    }
    const shot = 54 + ((f * 14) % 120);
    if (shot < 182) p.area(ox + shot, shipY, 7, 1, () => hex('#fff0a0'));
    // Der Zähler wächst: drei Balken statt Ziffern, die Ziffern nennt Marty selbst.
    p.area(ox + 12, 10, 8 + Math.round(t * 120), 3, () => hex('#4080f0'));
    p.area(ox + 12, 10, 136, 1, () => hex('#303860'));
    p.area(ox + 148, 8, 2, 7, () => hex('#f05060'));
  }
  return p;
}

/** Schwebewagen, der über den Platz zieht. */
export function fx_schwebewagen(): Picture {
  const p = new Picture(30, 12);
  p.poly([[1, 7], [6, 4], [24, 4], [29, 7], [24, 10], [5, 10]], (x, y) => shade(hex('#8088a0'), 1.2 - y * 0.05 - x * 0.006));
  p.poly([[9, 4], [12, 1], [20, 1], [23, 4]], hex('#60c0e0'));
  p.area(13, 2, 4, 1, () => hex('#d0f0ff'));
  p.area(2, 7, 2, 1, () => hex('#ff5040'));
  p.area(27, 7, 2, 1, () => hex('#fff0a0'));
  p.area(6, 10, 18, 1, () => hex('#ffa030'));
  p.glow(15, 11, 5, hex('#ff8020'), 0.4);
  return p;
}

/** Steppenläufer, vier Drehungen. */
export function fx_steppenlaeufer(): Picture {
  const S = 13;
  const frames = 4;
  const p = new Picture(S * frames, S);
  for (let f = 0; f < frames; f++) {
    const rot = (f / frames) * (Math.PI / 2);
    for (let i = 0; i < 26; i++) {
      const a = (i * 2.4 + rot) % (Math.PI * 2);
      const len = 3 + ((i * 7) % 4);
      const cx = f * S + 6;
      p.line(cx, 6, cx + Math.cos(a) * len, 6 + Math.sin(a) * len, shade(hex('#8a6a38'), 0.75 + (i % 3) * 0.18), 1);
    }
  }
  return p;
}

export function fx_wolke(): Picture {
  const p = new Picture(70, 12);
  for (let y = 0; y < 12; y++) {
    for (let x = 0; x < 70; x++) {
      const u = x / 69;
      const edge = Math.sin(u * Math.PI);
      const v = fbm(x / 9, y / 3, 3, 741) * edge - Math.abs(y - 6) * 0.055;
      if (v < 0.26) continue;
      p.set(x, y, mix(hex('#c8a890'), hex('#f0d8c0'), Math.min(1, (v - 0.26) * 3.2)));
    }
  }
  return p;
}

/** Ein Vogel, zwei Flügelstellungen. */
export function fx_vogel(): Picture {
  const p = new Picture(14, 4);
  const c = hex('#2a2430');
  for (const [x, y] of [[0, 1], [1, 2], [2, 2], [3, 2], [4, 2], [5, 2], [6, 1]]) p.set(x, y, c);
  for (const [x, y] of [[7, 3], [8, 2], [9, 2], [10, 2], [11, 2], [12, 2], [13, 3]]) p.set(x, y, c);
  return p;
}
