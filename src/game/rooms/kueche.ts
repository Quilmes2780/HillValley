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
            area: rect(54, 22, 42, 70),
            walkTo: [77, 94],
            face: 'hinten',
            comments: { schauan: 'say.prolog.kueche_tuer_arbeitszimmer' },
            exit: { room: 'arbeitszimmer', at: [287, 98], face: 'links' },
          },
          {
            id: 'pflanze',
            name: 'hotspot.pflanze',
            area: rect(102, 3, 26, 42),
            walkTo: [114, 94],
            face: 'hinten',
            comments: { schauan: 'say.prolog.kueche_pflanze' },
          },
          {
            id: 'kalender',
            name: 'hotspot.kalender',
            area: rect(94, 31, 17, 25),
            walkTo: [102, 94],
            face: 'hinten',
            comments: { schauan: 'say.prolog.kueche_kalender' },
          },
          {
            id: 'haengeschrank',
            name: 'hotspot.haengeschrank',
            area: rect(126, 8, 60, 26),
            walkTo: [156, 94],
            face: 'hinten',
            comments: { schauan: 'say.prolog.kueche_schrank' },
          },
          {
            id: 'fenster',
            name: 'hotspot.fenster',
            area: rect(194, 10, 54, 42),
            walkTo: [221, 94],
            face: 'hinten',
            comments: { schauan: 'say.prolog.kueche_fenster' },
          },
          {
            id: 'reklame',
            name: 'hotspot.reklame',
            area: rect(252, 22, 16, 24),
            walkTo: [260, 94],
            face: 'hinten',
            comments: { schauan: 'say.prolog.kueche_reklame' },
          },
          {
            id: 'kuehlschrank',
            name: 'hotspot.kuehlschrank',
            area: rect(116, 24, 32, 70),
            walkTo: [132, 94],
            face: 'hinten',
            comments: {
              schauan: 'say.prolog.kueche_kuehlschrank',
              oeffne: 'say.prolog.kueche_kuehlschrank_oeffne',
            },
          },
          {
            id: 'herd',
            name: 'hotspot.herd',
            area: rect(149, 50, 36, 44),
            walkTo: [167, 94],
            face: 'hinten',
            comments: { schauan: 'say.prolog.kueche_herd', benutze: 'say.prolog.kueche_herd_benutze' },
          },
          {
            id: 'obstschale',
            name: 'hotspot.obstschale',
            area: rect(204, 48, 30, 14),
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
            area: rect(209, 44, 18, 10),
            walkTo: [222, 94],
            face: 'hinten',
            visible: (s) => !s.flags.banane_genommen,
            sprite: { key: 'backgrounds/sprites/banane.png', x: 210, y: 45 },
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
            area: rect(267, 22, 44, 70),
            walkTo: [288, 94],
            face: 'hinten',
            comments: { schauan: 'say.prolog.kueche_haustuer' },
            exit: { room: 'vorgarten', at: [107, 110], face: 'vorne' },
          },
          {
            id: 'lorraine',
            name: 'hotspot.lorraine',
            area: rect(92, 52, 32, 56),
            walkTo: [134, 110],
            face: 'links',
            defaultVerb: 'redemit',
            comments: { schauan: 'say.prolog.kueche_lorraine' },
            verbs: {
              redemit: async (g) => {
                await g.dialog('lorraine');
              },
            },
            useWith: {
              zeitung: async (g) => {
                g.removeItem('zeitung');
                g.setFlag('entschuldigung_erhalten');
                g.addItem('entschuldigung');
                await g.sayAs('lorraine', 'say.k1.lorraine_schreibt');
              },
            },
          },
        ],
      },
    ],
  },
};
