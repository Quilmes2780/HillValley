import type { RoomDef } from '../../engine/types';
import { rect } from './util';

export const veranda: RoomDef = {
  id: 'veranda',
  name: 'room.veranda',
  eras: {
    1986: [
      {
        background: 'backgrounds/veranda_1986.png',
        // Vor dem Schaukelgestell und dem Geländer beginnt der Boden etwas tiefer.
        walkable: [
          [[8, 96], [172, 96], [172, 140], [4, 140]],
          [[172, 102], [295, 102], [318, 112], [318, 140], [172, 140]],
        ],
        scale: { yFar: 92, sFar: 0.88, yNear: 140, sNear: 1 },
        actors: [{ id: 'jennifer', x: 224, y: 104, face: 'links', visible: (s) => !s.flags.jennifer_lenkt_ab }],
        hotspots: [
          {
            id: 'tuer',
            name: 'hotspot.haustuer',
            area: rect(36, 22, 41, 72),
            walkTo: [57, 98],
            face: 'hinten',
            comments: { schauan: 'say.k4.veranda_tuer', oeffne: 'say.k4.veranda_tuer' },
          },
          {
            id: 'wandlampe',
            name: 'hotspot.wandlampe',
            area: rect(16, 18, 16, 29),
            walkTo: [24, 98],
            face: 'hinten',
            comments: { schauan: 'say.k4.veranda_lampe' },
          },
          {
            id: 'fenster',
            name: 'hotspot.fenster',
            area: rect(102, 22, 52, 32),
            walkTo: [128, 98],
            face: 'hinten',
            comments: { schauan: 'say.k4.veranda_fenster' },
          },
          {
            id: 'blumenkasten',
            name: 'hotspot.blumenkasten',
            area: rect(99, 54, 57, 26),
            walkTo: [128, 98],
            face: 'hinten',
            comments: { schauan: 'say.k4.veranda_blumen' },
          },
          {
            id: 'gelaender',
            name: 'hotspot.gelaender',
            area: rect(280, 54, 40, 41),
            walkTo: [285, 104],
            face: 'hinten',
            comments: { schauan: 'say.k4.veranda_gelaender' },
          },
          {
            id: 'blumenampel',
            name: 'hotspot.blumenampel',
            area: rect(280, 9, 36, 45),
            walkTo: [290, 104],
            face: 'hinten',
            comments: { schauan: 'say.k4.veranda_ampel' },
          },
          {
            id: 'schaukel',
            name: 'hotspot.schaukel',
            area: rect(176, 13, 94, 88),
            walkTo: [254, 106],
            face: 'hinten',
            comments: { schauan: 'say.k4.veranda_schaukel', benutze: 'say.k4.veranda_schaukel_benutze' },
          },
          {
            id: 'jennifer',
            name: 'hotspot.jennifer',
            area: rect(208, 48, 32, 56),
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
            area: [[282, 100], [320, 100], [320, 144], [275, 144]],
            walkTo: [304, 120],
            face: 'rechts',
            exit: { room: 'vorgarten', at: [30, 100], face: 'rechts' },
          },
        ],
      },
    ],
  },
};
