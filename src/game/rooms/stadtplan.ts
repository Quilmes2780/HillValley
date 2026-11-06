import type { Hotspot, RoomDef, Script } from '../../engine/types';
import { rect } from './util';

const START: readonly [number, number] = [0, 0]; // Auf dem Plan läuft niemand.

/** Ein Ziel, das es noch nicht zu betreten gibt: Ein Klick liefert nur einen Satz. */
function closed(id: string, area: Hotspot['area'], key: string): Hotspot {
  const answer: Script = async (g) => {
    await g.say(key);
  };
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
        await answer(g);
        return false;
      },
    },
  };
}

const ZIELE: readonly Hotspot[] = [
  {
    id: 'plan_haus',
    name: 'hotspot.plan_haus',
    area: rect(40, 80, 44, 36),
    walkTo: START,
    comments: { schauan: 'say.prolog.plan_haus' },
    exit: { room: 'vorgarten', at: [296, 122], face: 'links' },
  },
  {
    id: 'plan_labor',
    name: 'hotspot.plan_labor',
    area: rect(222, 92, 40, 30),
    walkTo: START,
    comments: { schauan: 'say.prolog.plan_labor' },
    exit: { room: 'docs_labor', at: [24, 100], face: 'rechts' },
  },
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
        hotspots: [
          ...ZIELE,
          // Kapitel 1 öffnet Rathausplatz und Schule (Meilenstein 3).
          closed('plan_turm', rect(140, 12, 26, 50), 'say.prolog.plan_weiter'),
          closed('plan_schule', rect(238, 16, 50, 32), 'say.prolog.plan_weiter'),
        ],
      },
      {
        background: 'backgrounds/stadtplan_1986.png',
        walkable: [],
        hidePlayer: true,
        hotspots: [
          ...ZIELE,
          closed('plan_turm', rect(140, 12, 26, 50), 'say.prolog.plan_turm'),
          closed('plan_schule', rect(238, 16, 50, 32), 'say.prolog.plan_schule'),
        ],
      },
    ],
  },
};
