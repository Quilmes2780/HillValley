import { Ink, ballShade, cyl, sheet, vgrad } from './items.ts';
import { fbm, hex, mix, type Picture, type RGB, shade } from './painter.ts';

/** Die kleinen Bilder der Easter Eggs und Gags. Eigene PNGs gleichen Namens ersetzen sie. */
type Draw = (i: Ink) => void;

function aushang(i: Ink, paper: string, head: string, ink: string): void {
  sheet(i, { cx: 9, cy: 12, w: 15.5, h: 21.5, paper, ink, rows: 4, seed: 5, first: 0.42 });
  i.rect(3, 3.5, 12, 3.4, hex(head));
  i.ball(4, 2.2, 0.8, 0.8, '#d8d8e0');
  i.ball(14, 2.2, 0.8, 0.8, '#d8d8e0');
}

const SPRITES: Record<string, { w: number; h: number; draw: Draw }> = {
  vitrine: {
    w: 26,
    h: 42,
    draw: (i) => {
      // Oben der Schlapphut, unten der Kristall
      i.rect(1, 1, 24, 40, vgrad('#2c3440', '#161a22', 1, 41), 0.6);
      i.rect(2.5, 2.5, 21, 16.5, vgrad('#4a5866', '#2a3440', 2.5, 19));
      i.rect(2.5, 21.5, 21, 15, vgrad('#2a3440', '#1c2430', 21.5, 36.5));
      i.ellipse(13, 15.5, 8.4, 2.1, vgrad('#a0703c', '#5e3c1c', 13, 18));
      i.rect(8.6, 9.2, 8.8, 6.2, vgrad('#b07e46', '#7a5228', 9, 15.4), 2);
      i.rect(8.6, 13.6, 8.8, 1.5, hex('#3a2412'));
      i.poly([[13, 24], [17, 29], [14, 35], [10, 35], [9, 29]], (u, v) => mix(hex('#c8fff0'), hex('#30b0c8'), (u - 9 + v - 24) / 17));
      i.stroke(5, 3, 5, 18, 0.6, hex('#a8c0d0'));
      i.stroke(5, 23, 5, 35, 0.5, hex('#60788a'));
      i.rect(1, 38, 24, 3, vgrad('#7a5228', '#3e2410', 38, 41));
    },
  },
  schwert: {
    w: 10,
    h: 30,
    draw: (i) => {
      i.rect(0.8, 0.8, 8.4, 28.4, vgrad('#4a2a1c', '#2a160e', 1, 29), 0.5);
      i.poly([[5, 28], [3.7, 24], [3.7, 8], [6.3, 8], [6.3, 24]], (u) => mix(hex('#f0f4f8'), hex('#8894a0'), (u - 3.7) / 2.6));
      i.rect(2, 6.4, 6, 1.5, hex('#d8b040'));
      i.rect(4.3, 2.4, 1.4, 4, hex('#3a2010'));
      i.ball(5, 2.2, 1, 1, '#d8b040');
    },
  },
  wasserglas: {
    w: 8,
    h: 10,
    draw: (i) => {
      i.poly([[1, 1], [7, 1], [6.4, 9], [1.6, 9]], vgrad('#c8e0ec', '#88a8bc', 1, 9));
      i.poly([[1.2, 3.4], [6.8, 3.4], [6.4, 8.4], [1.6, 8.4]], vgrad('#6ab0dc', '#3c7cb0', 3, 9));
      i.ellipse(4, 3.5, 2.8, 0.7, hex('#d8f4ff'));
      i.ellipse(4, 3.5, 1.2, 0.3, hex('#6ab0dc'));
    },
  },
  shake: {
    w: 8,
    h: 12,
    draw: (i) => {
      i.poly([[1.2, 3.6], [6.8, 3.6], [5.4, 10], [2.6, 10]], cyl('#f0a8c0', 1.2, 6.8));
      i.rect(2.6, 10, 2.8, 1.2, hex('#c8ccd4'));
      i.ellipse(4, 3.2, 2.8, 1.2, hex('#fff8f0'));
      i.stroke(5, 3, 6.4, 0.6, 0.6, hex('#e83a3a'));
      i.ball(3.6, 2.2, 0.7, 0.7, '#d81c2c');
    },
  },
  pluesch: {
    w: 18,
    h: 14,
    draw: (i) => {
      // Hund im Anzug
      i.rect(1.6, 6, 6.6, 7, vgrad('#4a4c58', '#2a2a34', 6, 13), 1);
      i.poly([[3.8, 6], [6, 6], [4.9, 9.6]], hex('#f0f0e8'));
      i.ball(4.9, 3.8, 3, 2.7, '#a8845a');
      i.ellipse(2.2, 4, 1, 1.9, hex('#6e5030'));
      i.ellipse(7.6, 4, 1, 1.9, hex('#6e5030'));
      i.rect(2, 1, 5.8, 1.2, hex('#3a3a44'));
      // Hase
      i.ball(13, 9.4, 3.4, 3.6, '#f0f0f4');
      i.ball(13, 5.4, 2.4, 2.2, '#f4f4f8');
      i.ellipse(11.8, 2.4, 0.8, 2.2, hex('#e8e8f0'));
      i.ellipse(14.4, 2.4, 0.8, 2.2, hex('#e8e8f0'));
      i.ellipse(13.8, 5.8, 1.3, 0.5, hex('#d84a5a'));
    },
  },
  pillen: {
    w: 10,
    h: 8,
    draw: (i) => {
      i.ellipse(5, 6, 4.2, 1.5, vgrad('#e8ecf0', '#9098a4', 4.5, 7.5));
      i.ball(3.4, 4.6, 1.5, 1.1, '#e02c2c');
      i.ball(6.8, 4.6, 1.5, 1.1, '#2c6ce0');
    },
  },
  hoverboard: {
    w: 10,
    h: 36,
    draw: (i) => {
      i.rect(2.4, 1, 5.2, 34, (u, v) => mix(hex('#ff5aa8'), hex('#a01c78'), (u - 2.4) / 5.2 + (v - 1) * 0.004), 2.3);
      i.poly([[3, 12], [7, 8], [7, 12], [3, 16]], hex('#38e8e0'));
      i.poly([[3, 22], [7, 18], [7, 22], [3, 26]], hex('#f8e040'));
      i.ellipse(5, 31, 1.5, 1.5, hex('#38e8e0'));
    },
  },
  origami: {
    w: 10,
    h: 8,
    draw: (i) => {
      i.poly([[1, 6.8], [4.4, 2.6], [5.6, 6.8]], hex('#f0ece0'));
      i.poly([[4.4, 2.6], [7, 5], [5.6, 6.8]], hex('#b8b4a8'));
      i.poly([[7, 5], [9, 1.2], [8.2, 5.8]], hex('#d8d4c8'));
    },
  },
  schacht: {
    w: 16,
    h: 10,
    draw: (i) => {
      i.rect(0.8, 0.8, 14.4, 8.4, vgrad('#7a7e88', '#44464e', 1, 9));
      for (const y of [2.4, 4.4, 6.4]) i.rect(2.2, y, 11.6, 1.1, hex('#14141a'));
    },
  },
  schuhe: {
    w: 12,
    h: 5,
    draw: (i) => {
      i.rect(0.8, 1.4, 4.6, 2.8, vgrad('#343238', '#141218', 1, 4), 0.8);
      i.rect(6.4, 1.4, 4.6, 2.8, vgrad('#343238', '#141218', 1, 4), 0.8);
    },
  },
  falle: {
    w: 22,
    h: 12,
    draw: (i) => {
      i.rect(1, 3.6, 20, 7.4, vgrad('#40424c', '#1e1e26', 3.6, 11), 0.6);
      i.rect(1, 3.6, 20, 2, (u) => (Math.floor(u / 2) % 2 ? hex('#f0c828') : hex('#1a1a20')));
      i.rect(5, 7, 12, 2.2, hex('#14141a'));
      i.ellipse(8, 8.1, 1, 0.8, hex('#ff4a30'));
      i.ellipse(14, 8.1, 1, 0.8, hex('#40e060'));
      i.tube((t) => [20 - t * 3, 3.4 - Math.sin(t * 3) * 2.2, 0.4], () => '#2a2a30', 16);
    },
  },
  fleck: {
    w: 28,
    h: 9,
    draw: (i) => {
      const c = (u: number, v: number): RGB => shade(hex('#7a2cc0'), 0.9 + (fbm(u / 3, v / 2, 2, 6) - 0.4) * 0.8);
      i.ellipse(10, 5, 9, 3.2, c);
      i.ellipse(19, 4.6, 7.4, 2.6, c);
      i.ellipse(25, 6.2, 2, 1, c);
      i.ellipse(8, 4, 3, 0.6, hex('#c88cf0'));
    },
  },
  fuetterer: {
    w: 18,
    h: 20,
    draw: (i) => {
      i.rect(6.6, 1.4, 5, 7.6, cyl('#c8ccd4', 6.6, 11.6), 0.6);
      i.rect(8, 8.6, 2, 5, hex('#70747c'));
      i.tube((t) => [11 + t * 5, 6 + t * t * 4, 0.45], () => '#c87a30', 18);
      i.rect(2, 13, 14, 5.8, vgrad('#7a5228', '#4a2e14', 13, 19), 0.4);
      i.ellipse(9, 14, 5.4, 1.2, hex('#3a2814'));
      i.ellipse(15, 3.4, 1.6, 1.6, hex('#d83a30'));
    },
  },
  topf: {
    w: 14,
    h: 18,
    draw: (i) => {
      i.poly([[3.4, 11.6], [10.6, 11.6], [9.6, 17], [4.4, 17]], cyl('#c8704a', 3.4, 10.6));
      for (const [x, y] of [[7, 1.2], [2.8, 3.6], [11.4, 3.8], [4.4, 6.4], [9.8, 6.8]] as const) {
        i.poly([[7, 11.8], [x, y], [x + 1.4, y + 1.6]], vgrad('#58b844', '#2c7a30', 1, 12));
      }
    },
  },
  mond: {
    w: 24,
    h: 24,
    draw: (i) => {
      i.ellipse(12, 12, 10.6, 10.6, (u, v) => shade(hex('#f4ecc8'), 0.86 + fbm(u / 4, v / 4, 3, 8) * 0.3));
      // Fahrrad im Mond, als Schattenriss
      const dark = hex('#16121e');
      i.ellipse(8, 15, 2.2, 2.2, dark);
      i.ellipse(8, 15, 1.4, 1.4, hex('#e8e0bc'));
      i.ellipse(16, 15, 2.2, 2.2, dark);
      i.ellipse(16, 15, 1.4, 1.4, hex('#e8e0bc'));
      i.stroke(8, 15, 11, 12, 0.7, dark);
      i.stroke(11, 12, 16, 15, 0.7, dark);
      i.rect(10.4, 8.6, 2, 4, dark);
      i.ellipse(11.4, 7.6, 1.1, 1.1, dark);
      i.ellipse(14, 10.6, 1.2, 1.1, dark);
    },
  },
  haendler: {
    w: 20,
    h: 46,
    draw: (i) => {
      const plaid = (u: number, v: number): RGB => {
        const base = mix(hex('#3a68c8'), hex('#2a4a98'), ((Math.floor(u) + Math.floor(v)) % 2));
        return Math.floor(u) % 3 === 0 || Math.floor(v) % 3 === 0 ? mix(base, hex('#f0d040'), 0.55) : base;
      };
      i.rect(6.4, 30, 3.2, 14.4, hex('#20202a'));
      i.rect(10.4, 30, 3.2, 14.4, hex('#20202a'));
      i.rect(5.6, 43.4, 4.4, 1.8, hex('#100c10'));
      i.rect(10, 43.4, 4.4, 1.8, hex('#100c10'));
      i.rect(5, 13, 10, 18, plaid, 1);
      i.poly([[8, 13], [12, 13], [10, 19]], hex('#f4f0e4'));
      i.ball(10, 7.8, 3.8, 4.2, '#e8b890');
      i.ellipse(10, 4.4, 3.6, 1.4, hex('#3a2010'));
      i.ellipse(11, 9.6, 1.6, 0.6, hex('#7a1c1c'));
      // Die Arme rudern
      i.rod(5, 15, 1.8, 6.4, 2.4, '#3a68c8');
      i.rod(15, 15, 18.4, 21, 2.4, '#3a68c8');
      i.ball(1.8, 5.6, 1.2, 1.2, '#e8b890');
      i.ball(18.4, 22, 1.2, 1.2, '#e8b890');
    },
  },
  kino: {
    w: 22,
    h: 36,
    draw: (i) => {
      i.rect(0.8, 0.8, 20.4, 34.4, hex('#f0d060'), 0.5);
      i.rect(2.2, 2.2, 17.6, 31.6, vgrad('#0c2c5c', '#2a88c8', 2.2, 28));
      i.rect(2.2, 25, 17.6, 8.8, vgrad('#2a88c8', '#0c3c6c', 25, 34));
      // Müder Hai von unten
      i.poly([[6, 28], [11, 12], [16, 28]], vgrad('#8a98a8', '#c8d0d8', 12, 28));
      i.poly([[7, 24], [15, 24], [13.4, 27], [8.6, 27]], hex('#2a1018'));
      for (const x of [8.4, 10, 11.6, 13.2]) i.poly([[x - 0.6, 24], [x + 0.6, 24], [x, 25.4]], hex('#f8f8f0'));
      i.ellipse(9, 18, 0.7, 0.7, hex('#101018'));
      i.ellipse(13, 18, 0.7, 0.7, hex('#101018'));
      i.rect(4.4, 4, 13.2, 2, hex('#f8e040'));
      i.rect(8, 7.2, 6, 2, hex('#f04a30'));
    },
  },
  holo: {
    w: 14,
    h: 32,
    draw: (i) => {
      const beam = (_u: number, v: number): RGB => (Math.floor(v * 1.5) % 2 ? hex('#7af0e8') : hex('#38b8c0'));
      i.ball(7, 5, 2.8, 3.2, '#a0fff4');
      i.rect(3.4, 8.6, 7.2, 12, beam, 1);
      i.rod(3.6, 10, 1.4, 4, 1.6, '#7af0e8');
      i.rect(4, 20, 2.4, 9, beam);
      i.rect(7.6, 20, 2.4, 9, beam);
      i.ellipse(7, 30, 5.4, 1.2, hex('#38b8c0'));
    },
  },
  kiste: {
    w: 24,
    h: 20,
    draw: (i) => {
      const wood = (f: number) => (u: number, v: number): RGB => shade(hex('#b08c58'), f + (fbm(u / 4, v * 0.8, 2, 7) - 0.5) * 0.4);
      i.poly([[1, 5], [6, 1], [23, 1], [18, 5]], wood(1.2));
      i.rect(1, 5, 17, 14, wood(0.9));
      i.poly([[18, 5], [23, 1], [23, 15], [18, 19]], wood(0.6));
      i.dots([[5, 9], [9.5, 9], [14, 9], [5, 12.8], [9.5, 12.8], [14, 12.8]], 0.8, hex('#14100c'));
      i.rect(3, 15.2, 13, 2, hex('#d82c20'));
      i.ellipse(9.5, 9, 0.4, 0.4, hex('#f8e040'));
    },
  },
  lautsprecher: {
    w: 16,
    h: 12,
    draw: (i) => {
      i.rect(1, 1, 14, 10, vgrad('#c8bc9c', '#887c60', 1, 11), 0.8);
      i.ellipse(8, 6, 4, 4, hex('#2a2620'));
      for (const y of [4, 6, 8]) i.stroke(5, y, 11, y, 0.5, hex('#887c60'));
    },
  },
  aushang_rot: { w: 18, h: 24, draw: (i) => aushang(i, '#f4f0e0', '#c02c24', '#3a3a44') },
  aushang_blau: { w: 18, h: 24, draw: (i) => aushang(i, '#f0ece0', '#2a58a8', '#2a3a58') },
  aushang_sand: { w: 18, h: 24, draw: (i) => aushang(i, '#d8bc80', '#5a3a1c', '#3e2812') },
  aushang_neon: { w: 18, h: 24, draw: (i) => aushang(i, '#1c2c3c', '#30f0e0', '#80c8d0') },
  artikel: {
    w: 24,
    h: 18,
    draw: (i) => {
      sheet(i, { cx: 12, cy: 9, w: 21, h: 15, tilt: -0.04, paper: '#e8e4d0', ink: '#6a6a70', rows: 3, seed: 9, first: 0.42 });
      i.rect(3, 3, 18, 2.2, hex('#1c1c24'));
      i.ellipse(17.5, 10.4, 2.6, 2.6, hex('#4a6a4a'));
      i.ellipse(16.6, 10, 0.5, 0.8, hex('#101810'));
      i.ellipse(18.4, 10, 0.5, 0.8, hex('#101810'));
    },
  },
  motorrad: {
    w: 30,
    h: 20,
    draw: (i) => {
      for (const x of [6.4, 23.6]) {
        i.ellipse(x, 14.6, 4.6, 4.6, hex('#14141a'));
        i.ellipse(x, 14.6, 2.4, 2.4, hex('#8a8c94'));
        i.ellipse(x, 14.6, 1, 1, hex('#14141a'));
      }
      i.rod(23.6, 14.6, 21, 6, 1.1, '#c8ccd4');
      i.rod(21, 6, 24.6, 2.6, 1, '#c8ccd4');
      i.rod(6.4, 14.6, 14, 15, 1.2, '#70747c');
      i.rect(11, 11.2, 7.6, 5.4, cyl('#5a5c64', 11, 18.6), 1);
      i.rect(12, 6.6, 9, 4.2, vgrad('#c0401c', '#6e1e0c', 6.6, 11), 2);
      i.rect(4.6, 7.6, 8, 2.6, vgrad('#3a2a1c', '#1c120c', 7.6, 10.4), 1);
      i.rod(10, 16.6, 1.6, 17, 1.2, '#b8bcc4');
    },
  },
  wanderer: {
    w: 14,
    h: 36,
    draw: (i) => {
      i.poly([[3, 34], [11, 34], [10, 11], [4, 11]], vgrad('#5a5a78', '#2c2c44', 11, 34));
      i.ball(7, 8, 3.4, 4, '#44445e');
      i.ellipse(7, 9, 2, 2.4, hex('#141420'));
      i.ellipse(6, 8.6, 0.4, 0.4, hex('#c8e0ff'));
      i.ellipse(8, 8.6, 0.4, 0.4, hex('#c8e0ff'));
      i.rod(12.6, 34, 12.6, 2, 1.1, '#8a6a3c');
      i.ball(12.6, 2, 1, 1, '#c8e0ff');
    },
  },
  grog: {
    w: 12,
    h: 12,
    draw: (i) => {
      i.rect(2, 3, 7, 8, cyl('#a8a8b0', 2, 9), 0.4);
      i.tube((t) => { const a = -1.3 + t * 2.6; return [9 + Math.cos(a) * 1.8, 7 + Math.sin(a) * 2.4, 0.5]; }, () => '#a8a8b0', 14);
      i.ellipse(5.5, 3, 3.4, 1.3, vgrad('#c8f040', '#70a018', 2, 4));
      i.ball(4, 1.8, 0.8, 0.8, '#d8ff50');
      i.ball(7, 1.2, 0.5, 0.5, '#d8ff50');
      i.stroke(3.4, 4, 3.4, 8, 0.8, hex('#c8f040'));
    },
  },
  insel: {
    w: 14,
    h: 10,
    draw: (i) => {
      i.ellipse(7, 7.4, 5.4, 1.8, vgrad('#e8d898', '#b8a060', 6, 9));
      i.stroke(7, 7, 8, 2.6, 0.7, hex('#6a4a24'));
      i.poly([[8, 2.6], [4.6, 3], [6.6, 1.2]], hex('#3a8a3c'));
      i.poly([[8, 2.6], [11.4, 3.2], [9.4, 1.2]], hex('#2c7a30'));
    },
  },
  mikrowelle: {
    w: 18,
    h: 13,
    draw: (i) => {
      i.rect(1, 1, 16, 11, vgrad('#d8d8d4', '#9a9a96', 1, 12), 0.6);
      i.rect(2.2, 2.4, 10, 8.2, vgrad('#2a2a2e', '#141418', 2.4, 10.6));
      // Der Hamster sitzt drin und schaut heraus
      i.ball(7, 8, 2.4, 2, '#c89a5c');
      i.ellipse(6.2, 7.6, 0.35, 0.35, hex('#000000'));
      i.ellipse(7.8, 7.6, 0.35, 0.35, hex('#000000'));
      i.rect(13.6, 2.8, 2.4, 1.6, hex('#40e060'));
      for (const y of [5.6, 7.4, 9.2]) i.rect(13.6, y, 2.4, 0.9, hex('#6a6a66'));
    },
  },
  karte: {
    w: 16,
    h: 22,
    draw: (i) => {
      i.rect(1, 1, 14, 20, hex('#2a7a78'), 0.8);
      sheet(i, { cx: 8, cy: 12.4, w: 11, h: 15, paper: '#fff4dc', ink: '#5a4a38', rows: 4, seed: 4, first: 0.14 });
      i.rect(3, 2, 10, 2.2, hex('#d84a3c'));
    },
  },
  denkmal: {
    w: 14,
    h: 24,
    draw: (i) => {
      const bronze = '#7a8a70';
      i.rect(2.6, 17, 8.8, 6, vgrad('#b8b0a0', '#7a7468', 17, 23));
      i.rect(4.4, 8.6, 5.2, 8.6, vgrad('#6a7a62', '#3e4c3c', 8, 17), 0.8);
      i.ball(7, 6, 2.4, 2.6, bronze);
      i.rod(9.2, 10, 12, 3.4, 1.4, bronze);
      i.rod(4.8, 10, 3.4, 15, 1.4, '#566a50');
    },
  },
};

export const EXTRA_SPRITES: Record<string, () => Picture> = Object.fromEntries(
  Object.entries(SPRITES).map(([name, { w, h, draw }]) => [
    `x_${name}`,
    (): Picture => {
      const ink = new Ink(w, h);
      draw(ink);
      return ink.finish();
    },
  ]),
);

export const skateboardWand = (): Picture => {
  const ink = new Ink(12, 28);
  ink.rect(2, 2, 8, 24, (u, v) => mix(hex('#d8402c'), hex('#7a1e18'), (u - 2) / 8 + fbm(u, v / 4, 2, 5) * 0.2), 3.4);
  for (const y of [4.6, 22.2]) {
    ink.rect(1, y, 10, 1.2, hex('#3a3840'));
    ink.ball(1.6, y + 0.6, 1, 1, '#e8e4d8');
    ink.ball(10.4, y + 0.6, 1, 1, '#e8e4d8');
  }
  return ink.finish();
};

/** Das Skateboard im Inventar. */
export function skateboardIcon(): Picture {
  const ink = new Ink();
  ink.rod(5, 8.4, 27, 8.4, 3, '#d8402c');
  ink.rod(3, 6.6, 5.4, 8.2, 2.6, '#d8402c');
  ink.rod(26.6, 8.2, 29, 6.6, 2.6, '#d8402c');
  ink.rect(10, 10, 2, 2.2, hex('#70747c'));
  ink.rect(20, 10, 2, 2.2, hex('#70747c'));
  for (const x of [8.4, 13, 19, 23.6]) ink.ellipse(x, 13.6, 1.9, 1.9, ballShade('#e8e4d8', x, 13.6, 2, 2));
  ink.stroke(13, 7.8, 22, 7.8, 1, hex('#f4d040'));
  return ink.finish();
}
