import type { BurstSpec, Era, Pt, ScriptApi } from '../engine/types';

/** Bausteine der großen Szenen: Teilchen, Zeitsprung des Zuges, Bilder von nahem. */

const DOWN = Math.PI / 2;

export const FX = {
  mist: {
    count: 34,
    colors: [0x5a3e18, 0x74501f, 0x3a2810, 0x8a6a30],
    speed: [40, 130],
    life: [450, 950],
    gravity: 260,
    angle: [-Math.PI + 0.3, -0.3],
    size: 2,
  },
  funken: {
    count: 22,
    colors: [0xfff0a0, 0xffc040, 0xff7020],
    speed: [30, 120],
    life: [200, 600],
    gravity: 90,
  },
  feuer: {
    count: 12,
    colors: [0xfff0a0, 0xffa030, 0xff5a10, 0xc02808],
    speed: [10, 46],
    life: [300, 750],
    gravity: -70,
    angle: [-DOWN - 0.6, -DOWN + 0.6],
    spread: [-6, 6],
    size: 2,
  },
  dampf: {
    count: 16,
    colors: [0xf0f0f0, 0xd0d0d8, 0xb0b0ba],
    speed: [8, 34],
    life: [500, 1100],
    gravity: -30,
    angle: [-DOWN - 0.5, -DOWN + 0.5],
    spread: [-5, 5],
    size: 3,
  },
  papier: {
    count: 26,
    colors: [0xf4f0e0, 0xd8d0b8, 0xffffff],
    speed: [20, 70],
    life: [500, 1100],
    gravity: 60,
  },
} as const satisfies Record<string, BurstSpec>;

/** Bildschirmfüllende Bildstreifen. Sie laden beim Start wie alles andere. */
export const PICTURES = [
  { key: 'backgrounds/sprites/fx_automat_spiel.png', frameWidth: 192, frameHeight: 120 },
  ...[0, 1, 2, 3, 4].map((stage) => ({ key: `items/foto_gross_stufe${stage}.png`, frameWidth: 160, frameHeight: 100 })),
] as const;

const FIRE_Y_STEP = 18;

/** Der Zug beschleunigt, zieht zwei Feuerspuren hinter sich her und ist weg. */
export async function zugFaehrtAb(
  g: ScriptApi,
  hotspot: string,
  dampfAn: Pt,
  by: Pt,
  spurVon: number,
  spurY: readonly [number, number],
  jahre: readonly [Era, Era],
): Promise<void> {
  g.sfx('pfeife');
  g.burst(dampfAn[0], dampfAn[1], FX.dampf);
  await g.wait(500);
  g.sfx('dampf');
  g.burst(dampfAn[0], dampfAn[1], FX.dampf);
  const fahrt = g.moveSprite(hotspot, by, 1100, 'Cubic.easeIn');
  for (let i = 0; i < 10; i++) {
    for (const y of spurY) g.burst(spurVon + i * FIRE_Y_STEP, y, FX.feuer);
    await g.wait(110);
  }
  await fahrt;
  g.flash(500);
  g.shake(400);
  await g.yearRoll(jahre[0], jahre[1]);
}

/** Der Zug erscheint: Blitz, Feuerspuren, dann rollt er ins Bild. */
export async function zugKommtAn(
  g: ScriptApi,
  hotspot: string,
  from: Pt,
  spurVon: number,
  spurY: readonly [number, number],
): Promise<void> {
  g.sfx('zeitsprung');
  g.flash(600);
  g.shake(600);
  await g.moveSprite(hotspot, from, 1);
  const fahrt = g.moveSprite(hotspot, [-from[0], -from[1]], 900, 'Cubic.easeOut');
  for (let i = 0; i < 8; i++) {
    for (const y of spurY) g.burst(spurVon + i * FIRE_Y_STEP, y, FX.feuer);
    await g.wait(90);
  }
  await fahrt;
  g.sfx('dampf');
}
