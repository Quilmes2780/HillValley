import type { RoomDef } from '../../engine/types';
import { rect } from './util';

export const veranda: RoomDef = {
  id: 'veranda',
  name: 'room.veranda',
  eras: {
    1986: [
      {
        background: 'backgrounds/veranda_1986.png',
        walkable: [[[8, 92], [312, 92], [316, 140], [4, 140]]],
        scale: { yFar: 92, sFar: 0.88, yNear: 140, sNear: 1 },
        actors: [{ id: 'jennifer', x: 224, y: 104, face: 'links', visible: (s) => !s.flags.jennifer_lenkt_ab }],
        hotspots: [
          {
            id: 'tuer',
            name: 'hotspot.haustuer',
            area: rect(38, 22, 38, 66),
            walkTo: [57, 96],
            face: 'hinten',
            comments: { schauan: 'say.k4.veranda_tuer', oeffne: 'say.k4.veranda_tuer' },
          },
          {
            id: 'schaukel',
            name: 'hotspot.schaukel',
            area: rect(180, 14, 88, 60),
            walkTo: [260, 100],
            face: 'hinten',
            comments: { schauan: 'say.k4.veranda_schaukel', benutze: 'say.k4.veranda_schaukel_benutze' },
          },
          {
            id: 'jennifer',
            name: 'hotspot.jennifer',
            area: rect(210, 54, 28, 50),
            walkTo: [190, 106],
            face: 'rechts',
            defaultVerb: 'redemit',
            visible: (s) => !s.flags.jennifer_lenkt_ab,
            comments: { schauan: 'say.k4.jennifer_schau' },
            verbs: {
              redemit: async (g) => {
                await g.dialog('jennifer_veranda');
              },
            },
          },
          {
            id: 'treppe',
            name: 'hotspot.treppe_vorgarten',
            area: rect(286, 94, 34, 50),
            walkTo: [304, 120],
            face: 'rechts',
            exit: { room: 'vorgarten', at: [30, 100], face: 'rechts' },
          },
        ],
      },
    ],
  },
};
