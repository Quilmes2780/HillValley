import { fbm, grain, hex, mix, Picture, type RGB, shade } from './painter.ts';

/**
 * Die Oberfläche als Armaturenbrett: gebürstetes Metall, Tasten mit Kante, eingelassene Felder.
 * Die Maße folgen VerbUI, InventoryUI und PortraitUI (Leiste beginnt bei y 144).
 */
const STEEL_TOP = hex('#403e46');
const STEEL_BOTTOM = hex('#26252c');
const AMBER = hex('#e8a43c');
const CELL_W = 43;
const CELL_H = 15;
const KEY_W = 41;
const KEY_H = 14;

function brushed(p: Picture, x0: number, y0: number, w: number, h: number, seed: number): void {
  p.area(x0, y0, w, h, (x, y) => {
    const base = mix(STEEL_TOP, STEEL_BOTTOM, (y - y0) / h);
    return shade(base, 1 + (fbm(x / 34, y * 1.3, 3, seed) - 0.5) * 0.38 + grain(x, y, seed) * 0.02);
  });
}

/** Eingelassenes Feld: Innen dunkel, oben Schattenkante, unten Lichtkante. */
function recess(p: Picture, x0: number, y0: number, w: number, h: number, top: RGB, bottom: RGB): void {
  p.area(x0, y0, w, h, (x, y) => {
    const c = mix(top, bottom, (y - y0) / Math.max(1, h - 1));
    const edge = x === x0 || y === y0;
    const rim = x === x0 + w - 1 || y === y0 + h - 1;
    if (rim) return hex('#5a5862');
    if (edge) return hex('#050408');
    if (x === x0 + 1 || y === y0 + 1) return shade(c, 0.72);
    return c;
  });
}

interface KeyLook {
  top: RGB;
  bottom: RGB;
  light: RGB;
  dark: RGB;
}

const KEY_NORMAL: KeyLook = { top: hex('#5c5a66'), bottom: hex('#3c3a44'), light: hex('#8a8894'), dark: hex('#17151c') };
const KEY_HOVER: KeyLook = { top: hex('#767484'), bottom: hex('#504e5c'), light: hex('#b4b2c0'), dark: hex('#1c1a22') };
const KEY_SELECTED: KeyLook = { top: hex('#6a4414'), bottom: hex('#a86e20'), light: hex('#2c1a06'), dark: hex('#f0b850') };
const KEY_OFF: KeyLook = { top: hex('#3e3c46'), bottom: hex('#2e2c34'), light: hex('#55535e'), dark: hex('#141218') };

/** Eine Taste mit abgerundeten Ecken. */
function key(p: Picture, x0: number, y0: number, w: number, h: number, look: KeyLook, seed: number): void {
  p.area(x0, y0, w, h, (x, y) => {
    const dx = Math.min(x - x0, x0 + w - 1 - x);
    const dy = Math.min(y - y0, y0 + h - 1 - y);
    if (dx === 0 && dy === 0) return hex('#0c0b10');
    if (y === y0 || x === x0) return look.light;
    if (y === y0 + h - 1 || x === x0 + w - 1) return look.dark;
    const c = mix(look.top, look.bottom, (y - y0) / h);
    return shade(c, 1 + (fbm(x / 22, y * 1.1, 2, seed) - 0.5) * 0.14);
  });
}

function rivet(p: Picture, x: number, y: number): void {
  p.set(x, y, hex('#8a8894'));
  p.set(x + 1, y, hex('#55535e'));
  p.set(x, y + 1, hex('#55535e'));
  p.set(x + 1, y + 1, hex('#121016'));
}

function basePanel(seed: number): Picture {
  const p = new Picture(320, 56);
  brushed(p, 0, 10, 320, 46, seed);
  p.area(0, 10, 320, 1, () => hex('#74727e'));
  // Anzeigestreifen für die Satzzeile
  p.area(0, 0, 320, 10, (_x, y) => mix(hex('#07060a'), hex('#100e14'), y / 9));
  return p;
}

export function panel(): Picture {
  const p = basePanel(801);
  // Verben
  for (let row = 0; row < 3; row++) {
    for (let col = 0; col < 3; col++) {
      key(p, col * CELL_W + 1, 11 + row * CELL_H, KEY_W, KEY_H, KEY_NORMAL, 810 + row * 3 + col);
    }
  }
  for (const y of [13, 33, 52]) rivet(p, 129, y);
  // Inventar
  for (let row = 0; row < 2; row++) {
    for (let col = 0; col < 4; col++) {
      recess(p, 132 + col * 38, 12 + row * 22, 37, 21, hex('#0d0c12'), hex('#1b1a22'));
    }
  }
  // Fassungen der Porträts
  for (let i = 0; i < 3; i++) recess(p, 296, 11 + i * CELL_H, 24, CELL_H, hex('#100f15'), hex('#1a1920'));
  return p;
}

/** Für die Antwortauswahl im Dialog: ein großes dunkles Feld. */
export function panelPlain(): Picture {
  const p = basePanel(802);
  recess(p, 1, 11, 318, 45, hex('#0b0a10'), hex('#17151c'));
  return p;
}

export const keyHover = (): Picture => single(KEY_HOVER, 820);
export const keySelected = (): Picture => single(KEY_SELECTED, 821);

function single(look: KeyLook, seed: number): Picture {
  const p = new Picture(KEY_W, KEY_H);
  key(p, 0, 0, KEY_W, KEY_H, look, seed);
  return p;
}

/** Ein Inventarfeld unter der Maus: warm erleuchtet, Bernstein am Rand. */
export function slotHover(): Picture {
  const p = new Picture(37, 21);
  recess(p, 0, 0, 37, 21, hex('#2a1e10'), hex('#40301a'));
  p.area(0, 0, 37, 21, (x, y) => (x === 0 || y === 0 || x === 36 || y === 20 ? AMBER : null));
  return p;
}

function arrow(up: boolean, look: KeyLook, c: RGB): Picture {
  const p = new Picture(11, 21);
  key(p, 0, 0, 11, 21, look, 830);
  for (let i = 0; i < 4; i++) {
    const y = up ? 8 + i : 13 - i;
    p.area(5 - i, y, 1 + i * 2, 1, () => c);
    // Dunkle Kante darunter, als wäre der Pfeil eingeprägt
    if (i === 3) p.area(5 - i, up ? y + 1 : y + 7, 7, 1, () => shade(look.bottom, 0.7));
  }
  return p;
}

export const arrowUp = (): Picture => arrow(true, KEY_NORMAL, hex('#f0dcb0'));
export const arrowDown = (): Picture => arrow(false, KEY_NORMAL, hex('#f0dcb0'));
export const arrowUpOff = (): Picture => arrow(true, KEY_OFF, hex('#5e5c68'));
export const arrowDownOff = (): Picture => arrow(false, KEY_OFF, hex('#5e5c68'));

/** Fadenkreuz mit dunklem Rand, damit es auf jedem Bild zu sehen bleibt. */
export function cursor(): Picture {
  const p = new Picture(13, 13);
  const arms: readonly (readonly [number, number, number, number])[] = [
    [6, 1, 1, 4],
    [6, 8, 1, 4],
    [1, 6, 4, 1],
    [8, 6, 4, 1],
  ];
  for (const [x, y, w, h] of arms) p.area(x - 1, y - 1, w + 2, h + 2, () => hex('#0a0810'));
  for (const [x, y, w, h] of arms) {
    p.area(x, y, w, h, (ax, ay) => (Math.abs(ax - 6) + Math.abs(ay - 6) <= 3 ? hex('#fff0c0') : AMBER));
  }
  return p;
}

export function portraitActive(): Picture {
  const p = new Picture(24, 15);
  p.area(0, 0, 24, 15, (x, y) => (x === 0 || y === 0 || x === 23 || y === 14 ? AMBER : null));
  return p;
}

export function menu(): Picture {
  const p = new Picture(240, 150);
  brushed(p, 0, 0, 240, 150, 803);
  p.area(0, 0, 240, 150, (x, y) => {
    if (x === 0 || y === 0) return hex('#8a8894');
    if (x === 239 || y === 149) return hex('#121016');
    return null;
  });
  recess(p, 4, 4, 232, 144, hex('#0c0b11'), hex('#17151c'));
  // Linie unter der Überschrift
  p.area(8, 17, 224, 1, (x) => mix(AMBER, hex('#17151c'), (x - 8) / 224));
  for (const [x, y] of [[1, 1], [237, 1], [1, 147], [237, 147]] as const) rivet(p, x, y);
  return p;
}
