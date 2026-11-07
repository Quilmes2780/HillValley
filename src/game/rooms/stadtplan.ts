import type { Hotspot, RoomDef } from '../../engine/types';
import { rect } from './util';

const START: readonly [number, number] = [0, 0]; // Auf dem Plan läuft niemand.

/** Ein Ziel, das es noch nicht zu betreten gibt: Ein Klick liefert nur einen Satz. */
function closed(id: string, area: Hotspot['area'], key: string): Hotspot {
  return {
    id,
    name: `hotspot.${id}`,
    area,
    walkTo: START,
    comments: { schauan: key, default: key },
    exit: {
      room: 'stadtplan',
      at: START,
      guard: async (g) => {
        await g.say(key);
        return false;
      },
    },
  };
}

const target = (
  id: string,
  area: Hotspot['area'],
  schau: string,
  exit: NonNullable<Hotspot['exit']>,
): Hotspot => ({
  id,
  name: `hotspot.${id}`,
  area,
  walkTo: START,
  comments: { schauan: schau },
  exit,
});

/** Nur zum Anschauen: Teile der Karte ohne Ziel. */
const deko = (id: string, area: Hotspot['area'], schau: string, name = id): Hotspot => ({
  id,
  name: `hotspot.${name}`,
  area,
  walkTo: START,
  comments: { schauan: schau },
});

/** Hill Valley und Tannenburg sind getrennt gezeichnet: Die Ziele liegen nicht an derselben Stelle. */
interface Lage {
  haus: Hotspot['area'];
  labor: Hotspot['area'];
  turm: Hotspot['area'];
  schule: Hotspot['area'];
}

const LAGE_HV: Lage = {
  haus: rect(37, 80, 44, 40),
  labor: rect(228, 88, 44, 34),
  turm: rect(140, 2, 44, 64),
  schule: rect(239, 8, 52, 40),
};

const LAGE_TB: Lage = {
  haus: rect(40, 73, 41, 32),
  labor: rect(220, 79, 50, 28),
  turm: rect(137, 2, 36, 54),
  schule: rect(202, 14, 84, 33),
};

const DEKO_1986: readonly Hotspot[] = [
  deko('plan_fluss', rect(0, 117, 320, 20), 'say.prolog.plan_fluss'),
  deko('plan_schild', rect(8, 4, 80, 32), 'say.prolog.plan_schild'),
  deko('plan_kompass', rect(294, 3, 22, 28), 'say.prolog.plan_kompass'),
  deko('plan_cafe', rect(110, 77, 28, 17), 'say.prolog.plan_cafe'),
  deko('plan_autos', rect(168, 88, 37, 9), 'say.prolog.plan_autos'),
];

const DEKO_TANNENBURG: readonly Hotspot[] = [
  deko('plan_fabriken', rect(95, 0, 110, 52), 'say.k1.plan_fabriken'),
  deko('plan_fluss', rect(0, 108, 320, 28), 'say.prolog.plan_fluss'),
  deko('plan_schild', rect(6, 4, 82, 32), 'say.k1.plan_schild'),
  deko('plan_kompass', rect(290, 2, 28, 32), 'say.prolog.plan_kompass'),
  deko('plan_wasserturm', rect(295, 83, 18, 22), 'say.k1.plan_wasserturm'),
  deko('plan_banner', rect(101, 26, 12, 21), 'say.k1.plan_banner'),
  deko('plan_banner2', rect(109, 83, 12, 20), 'say.k1.plan_banner', 'plan_banner'),
  deko('plan_banner3', rect(196, 64, 11, 20), 'say.k1.plan_banner', 'plan_banner'),
];

const ziele1986 = (l: Lage): Hotspot[] => [
  target('plan_haus', l.haus, 'say.prolog.plan_haus', {
    room: 'vorgarten',
    at: [296, 122],
    face: 'links',
  }),
  target('plan_labor', l.labor, 'say.prolog.plan_labor', {
    room: 'docs_labor',
    at: [24, 100],
    face: 'rechts',
  }),
];

const stadt1986 = (l: Lage): Hotspot[] => [
  ...ziele1986(l),
  target('plan_turm', l.turm, 'say.k1.plan_turm', {
    room: 'rathausplatz',
    at: [296, 122],
    face: 'links',
  }),
  target('plan_schule', l.schule, 'say.k1.plan_schule', {
    room: 'schule_flur',
    at: [300, 100],
    face: 'links',
  }),
];

export const stadtplan: RoomDef = {
  id: 'stadtplan',
  name: 'room.stadtplan',
  eras: {
    1986: [
      {
        when: (s) => s.timeline.tannenburg,
        background: 'backgrounds/stadtplan_1986_tannenburg.png',
        walkable: [],
        hidePlayer: true,
        hotspots: [...DEKO_TANNENBURG, ...stadt1986(LAGE_TB)],
      },
      {
        // Nach der verbrannten Mappe: wieder Hill Valley, aber alle Wege bleiben offen.
        when: (s) => s.chapter >= 1,
        background: 'backgrounds/stadtplan_1986.png',
        walkable: [],
        hidePlayer: true,
        hotspots: [...DEKO_1986, ...stadt1986(LAGE_HV)],
      },
      {
        // Prolog: Erst einmal muss Marty ins Labor.
        background: 'backgrounds/stadtplan_1986.png',
        walkable: [],
        hidePlayer: true,
        hotspots: [
          ...DEKO_1986,
          ...ziele1986(LAGE_HV),
          closed('plan_turm', LAGE_HV.turm, 'say.prolog.plan_turm'),
          closed('plan_schule', LAGE_HV.schule, 'say.prolog.plan_schule'),
        ],
      },
    ],
    1885: [
      {
        background: 'backgrounds/stadtplan_1885.png',
        walkable: [],
        hidePlayer: true,
        hotspots: [
          target('plan_gleis', rect(216, 94, 48, 22), 'say.k3.plan_gleis', {
            room: 'abstellgleis',
            at: [296, 124],
            face: 'links',
          }),
          target('plan_saloon', rect(48, 30, 50, 32), 'say.k3.plan_saloon', {
            room: 'saloon',
            at: [287, 106],
            face: 'links',
          }),
          target('plan_schmiede', rect(214, 30, 36, 36), 'say.k3.plan_schmiede', {
            room: 'schmiede',
            at: [287, 100],
            face: 'links',
          }),
          target('plan_festplatz', rect(124, 12, 60, 44), 'say.k3.plan_festplatz', {
            room: 'festplatz',
            at: [296, 120],
            face: 'links',
          }),
          target('plan_stall', rect(26, 74, 54, 34), 'say.k3.plan_stall', {
            room: 'mietstall',
            at: [296, 122],
            face: 'links',
          }),
        ],
      },
    ],
    1955: [
      {
        background: 'backgrounds/stadtplan_1955.png',
        walkable: [],
        hidePlayer: true,
        hotspots: [
          target('plan_platz', rect(140, 12, 26, 50), 'say.k2.plan_platz', {
            room: 'rathausplatz',
            at: [296, 122],
            face: 'links',
          }),
          target('plan_villa', rect(40, 80, 46, 40), 'say.k2.plan_villa', {
            room: 'docs_labor',
            at: [287, 100],
            face: 'links',
          }),
          target('plan_schule', rect(232, 6, 45, 57), 'say.k2.plan_schule', {
            room: 'schule_flur',
            at: [300, 100],
            face: 'links',
          }),
        ],
      },
    ],
  },
};
