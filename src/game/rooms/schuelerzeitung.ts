import type { RoomDef } from '../../engine/types';
import { rect } from './util';

export const schuelerzeitung: RoomDef = {
  id: 'schuelerzeitung',
  name: 'room.schuelerzeitung',
  eras: {
    1986: [
      {
        background: 'backgrounds/schuelerzeitung_1986.png',
        walkable: [[[8, 92], [312, 92], [316, 140], [4, 140]]],
        scale: { yFar: 92, sFar: 0.88, yNear: 140, sNear: 1 },
        actors: [{ id: 'jennifer', x: 228, y: 108, face: 'links' }],
        hotspots: [
          {
            id: 'tuer',
            name: 'hotspot.tuer_flur',
            area: rect(12, 22, 40, 66),
            walkTo: [32, 96],
            face: 'hinten',
            exit: { room: 'schule_flur', at: [133, 100], face: 'vorne' },
          },
          {
            id: 'pinnwand',
            name: 'hotspot.pinnwand',
            area: rect(70, 14, 96, 42),
            walkTo: [118, 96],
            face: 'hinten',
            comments: { schauan: 'say.k1.zeitung_pinnwand', nimm: 'say.k1.zeitung_pinnwand_nimm' },
          },
          {
            id: 'tisch',
            name: 'hotspot.redaktionstisch',
            area: rect(186, 42, 90, 16),
            walkTo: [270, 96],
            face: 'hinten',
            comments: { schauan: 'say.k1.zeitung_tisch' },
          },
          {
            id: 'jennifer',
            name: 'hotspot.jennifer',
            area: rect(212, 52, 32, 56),
            walkTo: [196, 110],
            face: 'rechts',
            defaultVerb: 'redemit',
            comments: { schauan: 'say.k1.jennifer_schau' },
            verbs: {
              redemit: async (g) => {
                await g.dialog('jennifer');
              },
            },
          },
        ],
      },
    ],
  },
};
