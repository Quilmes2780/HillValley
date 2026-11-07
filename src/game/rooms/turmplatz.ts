import type { Hotspot, RoomDef, RoomVariant } from '../../engine/types';
import { rect } from './util';

const WALKABLE: RoomVariant['walkable'] = [[[6, 94], [314, 94], [316, 140], [4, 140]]];
const SCALE = { yFar: 94, sFar: 0.88, yNear: 140, sNear: 1 };

const HOTSPOTS: readonly Hotspot[] = [
  {
    id: 'turm',
    name: 'hotspot.tannen_turm',
    area: rect(128, 0, 64, 60),
    walkTo: [160, 96],
    face: 'hinten',
    comments: { schauan: 'say.k5.platz_turm' },
  },
  {
    id: 'schwebeauto',
    name: 'hotspot.schwebeauto',
    area: rect(176, 4, 44, 10),
    walkTo: [198, 96],
    face: 'hinten',
    comments: { schauan: 'say.k5.platz_auto' },
  },
  {
    id: 'cafe',
    name: 'hotspot.cafe80er',
    area: rect(64, 56, 30, 36),
    walkTo: [79, 96],
    face: 'hinten',
    comments: { schauan: 'say.k5.platz_cafe' },
    exit: { room: 'cafe80er', at: [24, 108], face: 'rechts' },
  },
  {
    id: 'museum',
    name: 'hotspot.zeitmuseum',
    area: rect(226, 56, 28, 36),
    walkTo: [240, 96],
    face: 'hinten',
    comments: { schauan: 'say.k5.platz_museum' },
    exit: { room: 'museum', at: [24, 100], face: 'rechts' },
  },
  {
    id: 'turmtuer',
    name: 'hotspot.turmtuer',
    area: rect(144, 60, 32, 32),
    walkTo: [160, 96],
    face: 'hinten',
    comments: { schauan: 'say.k5.platz_turmtuer' },
    exit: { room: 'lobby', at: [24, 100], face: 'rechts' },
  },
  {
    id: 'gasse',
    name: 'hotspot.gasse',
    area: rect(300, 60, 20, 80),
    walkTo: [308, 120],
    face: 'rechts',
    comments: { schauan: 'say.k5.platz_gasse' },
    exit: { room: 'gasse', at: [296, 122], face: 'links' },
  },
  {
    id: 'doc',
    name: 'hotspot.doc',
    area: rect(184, 54, 32, 64),
    walkTo: [172, 120],
    face: 'rechts',
    defaultVerb: 'redemit',
    comments: { schauan: 'say.k5.doc_schau' },
    verbs: {
      redemit: async (g) => {
        if (g.getFlag('muenze_erhalten')) {
          await g.sayAs('doc', 'say.k5.doc_danach');
          return;
        }
        await g.sayAs('doc', 'say.k5.doc_briefe_1');
        await g.say('say.k5.doc_briefe_2');
        await g.sayAs('doc', 'say.k5.doc_briefe_3');
        await g.sayAs('doc', 'say.k5.doc_muenze');
        g.setFlag('muenze_erhalten');
        g.addItem('muenze_2015');
      },
    },
  },
  {
    id: 'jennifer',
    name: 'hotspot.jennifer',
    area: rect(94, 58, 32, 64),
    walkTo: [132, 124],
    face: 'links',
    defaultVerb: 'redemit',
    comments: { schauan: 'say.k5.jennifer_schau' },
    verbs: {
      redemit: async (g) => {
        await g.sayAs('jennifer', 'say.k5.jennifer_platz');
      },
    },
  },
];

const ACTORS: RoomVariant['actors'] = [{ id: 'jennifer', x: 110, y: 122, face: 'rechts' }];

export const turmplatz: RoomDef = {
  id: 'turmplatz',
  name: 'room.turmplatz',
  eras: {
    2015: [
      {
        when: (s) => !!s.flags.zeitlinie_geheilt,
        background: 'backgrounds/turmplatz_2015_geheilt.png',
        walkable: WALKABLE,
        scale: SCALE,
        hotspots: HOTSPOTS,
      },
      {
        background: 'backgrounds/turmplatz_2015.png',
        walkable: WALKABLE,
        scale: SCALE,
        actors: ACTORS,
        hotspots: HOTSPOTS,
      },
    ],
  },
};
