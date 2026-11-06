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

const ZIELE_1986: readonly Hotspot[] = [
  target('plan_haus', rect(40, 80, 44, 36), 'say.prolog.plan_haus', {
    room: 'vorgarten',
    at: [296, 122],
    face: 'links',
  }),
  target('plan_labor', rect(222, 92, 40, 30), 'say.prolog.plan_labor', {
    room: 'docs_labor',
    at: [24, 100],
    face: 'rechts',
  }),
];

const STADT_1986: readonly Hotspot[] = [
  ...ZIELE_1986,
  target('plan_turm', rect(140, 12, 26, 50), 'say.k1.plan_turm', {
    room: 'rathausplatz',
    at: [296, 122],
    face: 'links',
  }),
  target('plan_schule', rect(238, 16, 50, 32), 'say.k1.plan_schule', {
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
        hotspots: STADT_1986,
      },
      {
        // Nach der verbrannten Mappe: wieder Hill Valley, aber alle Wege bleiben offen.
        when: (s) => s.chapter >= 1,
        background: 'backgrounds/stadtplan_1986.png',
        walkable: [],
        hidePlayer: true,
        hotspots: STADT_1986,
      },
      {
        // Prolog: Erst einmal muss Marty ins Labor.
        background: 'backgrounds/stadtplan_1986.png',
        walkable: [],
        hidePlayer: true,
        hotspots: [
          ...ZIELE_1986,
          closed('plan_turm', rect(140, 12, 26, 50), 'say.prolog.plan_turm'),
          closed('plan_schule', rect(238, 16, 50, 32), 'say.prolog.plan_schule'),
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
          target('plan_schule', rect(238, 16, 50, 32), 'say.k2.plan_schule', {
            room: 'schule_flur',
            at: [300, 100],
            face: 'links',
          }),
        ],
      },
    ],
  },
};
