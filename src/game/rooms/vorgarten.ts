import type { Hotspot, Polygon, RoomVariant } from '../../engine/types';
import type { RoomDef } from '../../engine/types';
import { pickup, rect } from './util';

const SCALE = { yFar: 94, sFar: 0.88, yNear: 140, sNear: 1 };

/** Um das Auto herum: links, davor, rechts. */
const WALKABLE: readonly Polygon[] = [
  [[6, 94], [185, 94], [185, 140], [6, 140]],
  [[185, 106], [314, 106], [314, 140], [185, 140]],
  [[287, 94], [314, 94], [314, 106], [287, 106]],
];

const COMMON: readonly Hotspot[] = [
  {
    id: 'haus',
    name: 'hotspot.haus',
    area: rect(0, 6, 108, 86),
    walkTo: [60, 96],
    face: 'hinten',
    comments: { schauan: 'say.prolog.vorgarten_haus' },
  },
  {
    id: 'haustuer',
    name: 'hotspot.haustuer',
    area: rect(108, 44, 34, 48),
    walkTo: [125, 96],
    face: 'hinten',
    comments: { schauan: 'say.prolog.kueche_haustuer' },
    exit: { room: 'kueche', at: [288, 98], face: 'links' },
  },
  {
    id: 'briefkasten',
    name: 'hotspot.briefkasten',
    area: rect(145, 73, 12, 19),
    walkTo: [150, 96],
    face: 'hinten',
    comments: { schauan: 'say.prolog.vorgarten_briefkasten', oeffne: 'say.prolog.vorgarten_briefkasten_oeffne' },
  },
  {
    id: 'auto',
    name: 'hotspot.auto',
    area: rect(186, 60, 102, 44),
    walkTo: [236, 110],
    face: 'hinten',
    sprite: { key: 'backgrounds/sprites/auto.png', x: 186, y: 59, depthY: 104 },
    comments: { schauan: 'say.prolog.vorgarten_auto', oeffne: 'say.prolog.vorgarten_auto_oeffne' },
  },
  {
    id: 'strasse',
    name: 'hotspot.strasse',
    area: rect(300, 92, 20, 48),
    walkTo: [306, 120],
    face: 'rechts',
    comments: { schauan: 'say.prolog.vorgarten_strasse' },
    exit: { room: 'stadtplan', at: [306, 120] },
  },
];

const tannenburg: RoomVariant = {
  when: (s) => s.timeline.tannenburg,
  background: 'backgrounds/vorgarten_1986_tannenburg.png',
  walkable: WALKABLE,
  scale: SCALE,
  hotspots: [
    ...COMMON,
    {
      id: 'zeitung',
      name: 'item.zeitung.name',
      area: rect(76, 103, 20, 12),
      walkTo: [86, 118],
      face: 'hinten',
      visible: (s) => !s.flags.zeitung_genommen,
      sprite: { key: 'backgrounds/sprites/zeitung.png', x: 78, y: 105 },
      comments: { schauan: 'say.k1.zeitung_rasen' },
      verbs: {
        nimm: pickup((g) => {
          g.setFlag('zeitung_genommen');
          g.addItem('zeitung');
        }),
      },
    },
    {
      id: 'werbetafel',
      name: 'hotspot.werbetafel',
      area: rect(190, 6, 104, 42),
      walkTo: [300, 100],
      face: 'hinten',
      comments: { schauan: 'say.prolog.vorgarten_werbetafel' },
    },
  ],
};

const normal: RoomVariant = {
  background: 'backgrounds/vorgarten_1986.png',
  walkable: WALKABLE,
  scale: SCALE,
  actors: [{ id: 'biff', x: 172, y: 112, face: 'rechts' }],
  hotspots: [
    ...COMMON,
    {
      id: 'biff',
      name: 'hotspot.biff',
      area: rect(158, 62, 27, 51),
      walkTo: [146, 114],
      face: 'rechts',
      defaultVerb: 'redemit',
      comments: { schauan: 'say.prolog.vorgarten_biff' },
      verbs: {
        redemit: async (g) => {
          await g.dialog('biff');
        },
      },
    },
  ],
};

export const vorgarten: RoomDef = {
  id: 'vorgarten',
  name: 'room.vorgarten',
  eras: { 1986: [tannenburg, normal] },
};
