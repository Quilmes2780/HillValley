import type { Era, Fidget, RoomDef, RoomEffect, RoomVariant } from '../../engine/types';
import type { AmbienceName, FloorName, MusicName } from '../audio';

/**
 * Leben und Klang je Raum: Bewegung, Raumklang, Boden und Beschäftigung der Nebenfiguren.
 * Das steht gesammelt hier, weil es nie Rätsel berührt. Fehlt ein Eintrag, ist der Raum nur stiller.
 * Klickflächen, Wege und Spielstand bleiben unverändert.
 */
interface Leben {
  effects?: readonly RoomEffect[];
  ambience?: AmbienceName;
  floor?: FloorName;
  music?: MusicName;
  fidget?: Record<string, readonly Fidget[]>;
}

const fx = (name: string): string => `backgrounds/sprites/fx_${name}.png`;

function zahnrad(name: string, cx: number, cy: number, r: number, fps: number): RoomEffect {
  const size = r * 2 + 3;
  return { type: 'strip', key: fx(name), frameWidth: size, frameHeight: size, x: Math.round(cx - size / 2), y: Math.round(cy - size / 2), fps };
}

/** Die Zahnräder sind in allen Fassungen des Uhrwerks am selben Platz. */
const UHRWERK_RAEDER: readonly RoomEffect[] = [
  zahnrad('zahn_grau22', 58.5, 46, 22, 5),
  zahnrad('zahn_gold17', 96.5, 30, 17, 7),
  zahnrad('zahn_gold14', 112.5, 57.5, 14, 8),
  zahnrad('zahn_gold9', 37.5, 23, 9, 6),
  zahnrad('zahn_grau7', 120.5, 21.5, 7, 9),
  { type: 'strip', key: fx('welle'), frameWidth: 112, frameHeight: 16, x: 56, y: 32, fps: 1, depthY: -399 },
];

const STAUB: RoomEffect = {
  type: 'particles',
  area: [0, 92, 320, 44],
  colors: [0xd8b080, 0xc8a070, 0xe8c890],
  rate: 7,
  life: [900, 2400],
  vx: [18, 46],
  vy: [-5, 3],
};

const wolke = (y: number, seconds: number, von = 330, bis = -80): RoomEffect => ({
  type: 'pass',
  key: fx('wolke'),
  y,
  fromX: von,
  toX: bis,
  seconds,
  pause: [0, 8],
});

const vogel = (y: number, seconds: number): RoomEffect => ({
  type: 'pass',
  key: fx('vogel'),
  frameWidth: 7,
  frameHeight: 4,
  y,
  fromX: -10,
  toX: 330,
  seconds,
  pause: [8, 30],
  fps: 7,
  wobble: 2,
});

const STEPPE: RoomEffect = {
  type: 'pass',
  key: fx('steppenlaeufer'),
  frameWidth: 13,
  frameHeight: 13,
  y: 118,
  fromX: -14,
  toX: 330,
  seconds: 9,
  pause: [14, 40],
  fps: 8,
  wobble: 3,
  depthY: 141,
};

const REGEN: RoomEffect = {
  type: 'particles',
  area: [-30, -6, 370, 20],
  colors: [0x8090c0, 0xa0b0d8, 0x6878a8],
  rate: 110,
  life: [800, 1000],
  vx: [-34, -26],
  vy: [150, 185],
  size: [1, 3],
  fade: false,
  front: true,
};

const schwebewagen = (y: number, seconds: number, nachLinks: boolean, pause: readonly [number, number]): RoomEffect => ({
  type: 'pass',
  key: fx('schwebewagen'),
  y,
  fromX: nachLinks ? 335 : -35,
  toX: nachLinks ? -35 : 335,
  seconds,
  pause,
  wobble: 1,
  flip: nachLinks,
});

const ofen = (x: number, y: number, w: number, h: number, staerke = 0.32): RoomEffect => ({
  type: 'glow',
  area: [x, y, w, h],
  color: 0xff6a18,
  min: staerke * 0.6,
  max: staerke,
  speed: 2.3,
  flicker: 1.5,
});

const funken = (x: number, y: number, w: number): RoomEffect => ({
  type: 'particles',
  area: [x, y, w, 3],
  colors: [0xffd060, 0xff8020, 0xfff0b0],
  rate: 5,
  life: [500, 1300],
  vx: [-9, 9],
  vy: [-30, -12],
});

const lampe = (x: number, y: number, r: number, color = 0xffd890, staerke = 0.3, flicker = 0): RoomEffect => ({
  type: 'glow',
  area: [x - r, y - r, r * 2, r * 2],
  color,
  min: staerke * 0.75,
  max: staerke,
  speed: 0.6,
  flicker,
});

const neon = (x: number, y: number, w: number, h: number, color: number, flicker = 0.6): RoomEffect => ({
  type: 'glow',
  area: [x, y, w, h],
  color,
  min: 0.12,
  max: 0.3,
  speed: 0.8,
  flicker,
  hard: true,
});

const blinken = (x: number, y: number, w: number, h: number, color: number, speed = 1.2): RoomEffect => ({
  type: 'glow',
  area: [x, y, w, h],
  color,
  min: 0,
  max: 0.7,
  speed,
  hard: true,
});

const LEBEN: Record<string, Leben> = {
  // --- 1986 ---------------------------------------------------------------------------------
  martys_zimmer_1986: { floor: 'teppich', ambience: 'amb_stadt' },
  kueche_1986: {
    floor: 'holz',
    ambience: 'amb_cafe',
    fidget: { lorraine: ['pickup', 'blick', 'talk'] },
    effects: [
      { type: 'particles', area: [159, 47, 12, 3], colors: [0xf0f0f0, 0xd8d8e0], rate: 3, life: [800, 1700], vx: [-3, 3], vy: [-13, -6], size: [2, 2] },
    ],
  },
  arbeitszimmer_1986: { floor: 'teppich', ambience: 'amb_schule' },
  vorgarten_1986: {
    floor: 'stein',
    ambience: 'amb_stadt',
    fidget: { biff: ['pickup', 'blick'], einstein: ['talk', 'blick'], jennifer: ['talk'] },
    effects: [vogel(16, 11), wolke(10, 44)],
  },
  veranda_1986: { floor: 'holz', ambience: 'amb_stadt', fidget: { jennifer: ['blick', 'talk'] } },
  docs_labor_1986: {
    floor: 'stein',
    ambience: 'amb_labor',
    fidget: { einstein: ['talk', 'blick'] },
    effects: [
      zahnrad('zahn_klein_grau', 179.5, 10.5, 5, 6),
      zahnrad('zahn_klein_gold', 222.5, 10.5, 5, 8),
      lampe(202, 20, 24, 0xffe8b0, 0.22, 0.5),
      blinken(226, 53, 3, 2, 0x40ff80, 1.1),
      blinken(266, 73, 4, 4, 0xff3030, 0.5),
      { type: 'particles', area: [224, 50, 8, 2], colors: [0x80ffb0, 0xffffff], rate: 0.8, life: [250, 500], vx: [-14, 14], vy: [-16, 4] },
    ],
  },
  stadtplan_1986: { ambience: 'amb_stadt' },
  rathausplatz_1986: {
    floor: 'stein',
    ambience: 'amb_stadt',
    fidget: { kowalski: ['blick', 'talk'], doc: [] },
    effects: [
      lampe(17, 32, 12, 0xffe8a0, 0.3),
      lampe(306, 34, 12, 0xffe8a0, 0.3),
      lampe(142, 65, 8, 0xffe0a0, 0.3),
      lampe(182, 64, 8, 0xffe0a0, 0.3),
      vogel(22, 12),
      { type: 'particles', area: [0, 70, 320, 40], colors: [0xffa050, 0xffd080], rate: 2, life: [1800, 3600], vx: [4, 13], vy: [-5, -1] },
    ],
  },
  turmeingang_1986: { floor: 'stein', ambience: 'amb_schule' },
  uhrwerk_1986: { floor: 'holz', ambience: 'amb_uhrwerk', effects: UHRWERK_RAEDER },
  schule_flur_1986: { floor: 'stein', ambience: 'amb_schule', fidget: { strickland: ['blick', 'talk'] } },
  bandraum_1986: { floor: 'holz', ambience: 'amb_schule' },
  schuelerzeitung_1986: { floor: 'teppich', ambience: 'amb_schule', fidget: { jennifer: ['pickup', 'blick'] } },

  // --- 1955 ---------------------------------------------------------------------------------
  docs_labor_1955: {
    floor: 'holz',
    ambience: 'amb_esse',
    effects: [
      { type: 'strip', key: fx('flamme_kamin'), frameWidth: 44, frameHeight: 30, x: 27, y: 57, fps: 9 },
      ofen(14, 40, 72, 62),
      funken(36, 64, 26),
      zahnrad('zahn_klein_gold', 50, 21, 5, 6),
      blinken(218, 50, 8, 3, 0x70e0ff, 1.7),
    ],
  },
  stadtplan_1955: { ambience: 'amb_stadt' },
  rathausplatz_1955: {
    floor: 'stein',
    ambience: 'amb_stadt',
    effects: [vogel(14, 13), wolke(8, 50)],
  },
  uhrwerk_1955: { floor: 'holz', ambience: 'amb_uhrwerk', effects: UHRWERK_RAEDER },
  schule_flur_1955: {
    floor: 'stein',
    ambience: 'amb_schule',
    fidget: { george: ['pickup', 'blick'], strickland: ['blick', 'talk'] },
  },
  cafe_1955: {
    floor: 'stein',
    music: 'diner',
    ambience: 'amb_cafe',
    fidget: { lou: ['pickup', 'blick', 'talk'], goldie: ['pickup', 'talk'] },
    effects: [
      { type: 'glow', area: [274, 34, 20, 54], color: 0xff9020, min: 0.08, max: 0.26, speed: 0.7 },
      blinken(276, 50, 16, 2, 0x70b0ff, 1.5),
    ],
  },
  radioladen_1955: {
    floor: 'holz',
    ambience: 'amb_cafe',
    fidget: { haendler: ['pickup', 'blick'] },
    effects: [{ type: 'strip', key: fx('fernsehen'), frameWidth: 24, frameHeight: 18, x: 194, y: 30, fps: 12 }],
  },
  strasse_mist_1955: {
    floor: 'stein',
    ambience: 'amb_stadt',
    effects: [
      vogel(20, 10),
      wolke(6, 46),
      { type: 'particles', area: [176, 40, 110, 8], colors: [0x202020, 0x302810], rate: 2, life: [400, 900], vx: [-12, 12], vy: [-10, 6] },
    ],
  },

  // --- 1885 ---------------------------------------------------------------------------------
  stadtplan_1885: { ambience: 'amb_wind' },
  abstellgleis_1885: {
    floor: 'erde',
    ambience: 'amb_wind',
    fidget: { verne: ['talk', 'blick', 'pickup'], jules: ['pickup', 'blick'] },
    effects: [
      wolke(12, 52),
      wolke(30, 70, 340, -90),
      vogel(26, 15),
      STAUB,
      STEPPE,
      { type: 'particles', area: [60, 80, 3, 1], colors: [0x70a0d0, 0x90c0f0], rate: 1.2, life: [400, 500], vx: [0, 0], vy: [8, 16], gravity: 120, fade: false },
    ],
  },
  schmiede_1885: {
    floor: 'erde',
    ambience: 'amb_esse',
    effects: [
      { type: 'strip', key: fx('flamme_esse'), frameWidth: 52, frameHeight: 18, x: 34, y: 45, fps: 9 },
      ofen(24, 34, 74, 40, 0.36),
      ofen(20, 86, 96, 44, 0.12),
      funken(40, 46, 40),
    ],
  },
  saloon_1885: {
    floor: 'holz',
    music: 'saloon',
    ambience: 'amb_kneipe',
    fidget: { barkeeper: ['pickup', 'blick', 'talk'], buford: ['talk', 'blick'] },
    effects: [
      lampe(150, 6, 26, 0xffd080, 0.26, 0.3),
      { type: 'particles', area: [60, 50, 200, 40], colors: [0xc0b0a0, 0xa89888], rate: 1.5, life: [2400, 4600], vx: [-3, 5], vy: [-6, -2], size: [2, 1] },
    ],
  },
  festplatz_1885: {
    floor: 'erde',
    ambience: 'amb_wind',
    fidget: { clara: ['pickup', 'blick', 'talk'], maurer: ['pickup', 'talk'], feuerwerker: ['pickup', 'blick'] },
    effects: [wolke(4, 48), vogel(14, 14), STAUB],
  },
  uhrwerk_1885: { floor: 'holz', ambience: 'amb_wind' },
  mietstall_1885: {
    floor: 'erde',
    ambience: 'amb_wind',
    effects: [
      wolke(10, 50),
      vogel(22, 13),
      STAUB,
      STEPPE,
      { type: 'particles', area: [240, 66, 60, 6], colors: [0x383020, 0x282010], rate: 2.5, life: [500, 1100], vx: [-9, 9], vy: [-9, 5] },
    ],
  },

  // --- 2015 ---------------------------------------------------------------------------------
  turmplatz_2015: {
    floor: 'stein',
    ambience: 'amb_regen',
    fidget: { jennifer: ['blick', 'talk'], doc: [] },
    effects: [
      neon(30, 44, 78, 11, 0xff40c0, 1.2),
      neon(134, 50, 52, 10, 0xff3030, 0.5),
      neon(208, 44, 62, 11, 0xff3030, 0.7),
      neon(4, 32, 22, 23, 0xffb040, 2.2),
      lampe(160, 28, 30, 0xfff0c0, 0.2),
      schwebewagen(16, 7, true, [4, 12]),
      schwebewagen(30, 9, false, [8, 18]),
      REGEN,
    ],
  },
  cafe80er_2015: {
    floor: 'stein',
    music: 'cafe80er',
    ambience: 'amb_zukunft',
    fidget: { kellnerroboter: ['talk', 'blick'], jennifer: ['blick', 'talk'], brix: ['talk', 'blick'] },
    effects: [
      { type: 'strip', key: fx('schirm_automat'), frameWidth: 24, frameHeight: 16, x: 273, y: 36, fps: 6 },
      neon(0, 7, 320, 1, 0xff60c0, 0.5),
      blinken(140, 50, 10, 5, 0x60ff90, 0.8),
      lampe(285, 44, 22, 0x4080ff, 0.2),
    ],
  },
  museum_2015: {
    floor: 'stein',
    ambience: 'amb_zukunft',
    fidget: { museumsroboter: ['blick', 'talk'], jennifer: ['blick', 'talk'], brix: ['talk'] },
    effects: [lampe(305, 80, 16, 0x70f0d0, 0.3, 0.4)],
  },
  lobby_2015: {
    floor: 'stein',
    ambience: 'amb_zukunft',
    effects: [
      neon(205, 12, 21, 9, 0xff3030, 0.6),
      blinken(251, 55, 9, 8, 0xff3030, 0.9),
      neon(86, 42, 28, 6, 0xffe060, 0.3),
    ],
  },
  buero_2015: {
    floor: 'stein',
    music: 'showdown',
    ambience: 'amb_zukunft',
    fidget: { brix: ['talk'] },
    effects: [
      blinken(66, 65, 3, 3, 0x40ff80, 0.7),
      neon(16, 16, 20, 5, 0x40ff80, 0.4),
      blinken(190, 28, 2, 2, 0xfff0a0, 0.3),
      blinken(236, 22, 2, 2, 0xfff0a0, 0.23),
      blinken(258, 34, 2, 2, 0xfff0a0, 0.41),
    ],
  },
  gasse_2015: {
    floor: 'stein',
    ambience: 'amb_regen',
    effects: [
      lampe(259, 16, 34, 0xffe8c0, 0.22, 1.6),
      { type: 'particles', area: [150, 84, 8, 3], colors: [0xc0c0d0, 0x9898a8], rate: 5, life: [900, 1900], vx: [-3, 4], vy: [-18, -8], size: [2, 2] },
      { type: 'bob', hotspot: 'laster', amplitude: 1.4, seconds: 2.4 },
      REGEN,
    ],
  },
};

function addFidget(variant: RoomVariant, fidget: Record<string, readonly Fidget[]> | undefined): RoomVariant['actors'] {
  if (!fidget) return variant.actors;
  return variant.actors?.map((a) => (fidget[a.id]?.length ? { ...a, fidget: fidget[a.id] } : a));
}

/** Hängt Leben und Klang an die Räume an. Was ein Raum schon selbst festlegt, bleibt. */
export function withLeben(rooms: readonly RoomDef[]): readonly RoomDef[] {
  return rooms.map((room) => {
    const eras: RoomDef['eras'] = {};
    for (const [key, variants] of Object.entries(room.eras)) {
      const era = Number(key) as Era;
      const leben = LEBEN[`${room.id}_${era}`];
      eras[era] = leben
        ? variants.map((v) => ({
            ambience: leben.ambience,
            floor: leben.floor,
            music: leben.music,
            ...v,
            effects: [...(leben.effects ?? []), ...(v.effects ?? [])],
            actors: addFidget(v, leben.fidget),
          }))
        : variants;
    }
    return { ...room, eras };
  });
}
