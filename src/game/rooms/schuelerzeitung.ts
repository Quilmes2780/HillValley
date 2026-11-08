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
            area: rect(10, 22, 44, 71),
            walkTo: [32, 96],
            face: 'hinten',
            exit: { room: 'schule_flur', at: [133, 100], face: 'vorne' },
          },
          {
            id: 'lampe_links',
            name: 'hotspot.deckenlampe',
            area: rect(42, 0, 56, 10),
            walkTo: [70, 96],
            face: 'hinten',
            comments: { schauan: 'say.k1.zeitung_lampe' },
          },
          {
            id: 'lampe_rechts',
            name: 'hotspot.deckenlampe',
            area: rect(205, 0, 60, 10),
            walkTo: [235, 96],
            face: 'hinten',
            comments: { schauan: 'say.k1.zeitung_lampe' },
          },
          {
            id: 'pinnwand',
            name: 'hotspot.pinnwand',
            area: rect(65, 16, 108, 48),
            walkTo: [118, 96],
            face: 'hinten',
            comments: { schauan: 'say.k1.zeitung_pinnwand', nimm: 'say.k1.zeitung_pinnwand_nimm' },
          },
          {
            id: 'tisch',
            name: 'hotspot.redaktionstisch',
            area: rect(177, 32, 108, 64),
            walkTo: [270, 96],
            face: 'hinten',
            comments: { schauan: 'say.k1.zeitung_tisch' },
          },
          {
            id: 'schreibmaschine',
            name: 'hotspot.schreibmaschine',
            area: rect(190, 41, 31, 22),
            walkTo: [205, 96],
            face: 'hinten',
            comments: { schauan: 'say.k1.zeitung_maschine' },
          },
          {
            id: 'rekorder',
            name: 'hotspot.kassettenrekorder',
            area: rect(226, 33, 37, 30),
            walkTo: [244, 96],
            face: 'hinten',
            comments: { schauan: 'say.k1.zeitung_rekorder' },
          },
          {
            id: 'buecher',
            name: 'hotspot.buecher',
            area: rect(264, 52, 15, 11),
            walkTo: [271, 96],
            face: 'hinten',
            comments: { schauan: 'say.k1.zeitung_buecher' },
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
