import type { RoomDef } from '../../engine/types';
import { pickup, rect } from './util';

const SCALE = { yFar: 92, sFar: 0.88, yNear: 140, sNear: 1 };

export const kueche: RoomDef = {
  id: 'kueche',
  name: 'room.kueche',
  eras: {
    1986: [
      {
        background: 'backgrounds/kueche_1986.png',
        walkable: [[[8, 92], [312, 92], [316, 140], [4, 140]]],
        scale: SCALE,
        actors: [{ id: 'lorraine', x: 108, y: 108, face: 'rechts' }],
        hotspots: [
          {
            id: 'treppe',
            name: 'hotspot.treppe',
            area: rect(6, 20, 34, 68),
            walkTo: [24, 96],
            face: 'hinten',
            comments: { schauan: 'say.prolog.kueche_treppe' },
            exit: { room: 'martys_zimmer', at: [287, 98], face: 'links' },
          },
          {
            id: 'arbeitszimmer',
            name: 'hotspot.tuer_arbeitszimmer',
            area: rect(58, 22, 38, 66),
            walkTo: [77, 94],
            face: 'hinten',
            comments: { schauan: 'say.prolog.kueche_tuer_arbeitszimmer' },
            exit: { room: 'arbeitszimmer', at: [287, 98], face: 'links' },
          },
          {
            id: 'kuehlschrank',
            name: 'hotspot.kuehlschrank',
            area: rect(120, 20, 30, 68),
            walkTo: [135, 94],
            face: 'hinten',
            comments: {
              schauan: 'say.prolog.kueche_kuehlschrank',
              oeffne: 'say.prolog.kueche_kuehlschrank_oeffne',
            },
          },
          {
            id: 'herd',
            name: 'hotspot.herd',
            area: rect(154, 48, 32, 40),
            walkTo: [170, 94],
            face: 'hinten',
            comments: { schauan: 'say.prolog.kueche_herd', benutze: 'say.prolog.kueche_herd_benutze' },
          },
          {
            id: 'obstschale',
            name: 'hotspot.obstschale',
            area: rect(204, 44, 34, 14),
            walkTo: [222, 94],
            face: 'hinten',
            comments: {
              schauan: 'say.prolog.kueche_obstschale',
              nimm: 'say.prolog.kueche_obstschale_nimm',
            },
          },
          {
            id: 'banane',
            name: 'item.banane.name',
            area: rect(212, 41, 18, 10),
            walkTo: [222, 94],
            face: 'hinten',
            visible: (s) => !s.flags.banane_genommen,
            sprite: { key: 'backgrounds/sprites/banane.png', x: 213, y: 42 },
            comments: { schauan: 'say.prolog.kueche_banane' },
            verbs: {
              nimm: pickup((g) => {
                g.setFlag('banane_genommen');
                g.addItem('banane');
              }),
            },
          },
          {
            id: 'haustuer',
            name: 'hotspot.haustuer',
            area: rect(268, 22, 40, 66),
            walkTo: [288, 94],
            face: 'hinten',
            comments: { schauan: 'say.prolog.kueche_haustuer' },
            exit: { room: 'vorgarten', at: [125, 100], face: 'vorne' },
          },
          {
            id: 'lorraine',
            name: 'hotspot.lorraine',
            area: rect(94, 58, 28, 50),
            walkTo: [134, 110],
            face: 'links',
            defaultVerb: 'redemit',
            comments: { schauan: 'say.prolog.kueche_lorraine' },
            verbs: {
              redemit: async (g) => {
                await g.dialog('lorraine');
              },
            },
          },
        ],
      },
    ],
  },
};
