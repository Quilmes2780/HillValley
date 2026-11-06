import type { RoomDef } from '../../engine/types';
import { rect } from './util';

export const radioladen: RoomDef = {
  id: 'radioladen',
  name: 'room.radioladen',
  eras: {
    1955: [
      {
        background: 'backgrounds/radioladen_1955.png',
        walkable: [[[8, 102], [312, 102], [316, 140], [4, 140]]],
        scale: { yFar: 102, sFar: 0.92, yNear: 140, sNear: 1 },
        actors: [{ id: 'haendler', x: 110, y: 96, face: 'vorne' }],
        hotspots: [
          {
            id: 'regal',
            name: 'hotspot.radios',
            area: rect(20, 14, 72, 44),
            walkTo: [56, 106],
            face: 'hinten',
            comments: { schauan: 'say.k2.laden_radios', nimm: 'say.k2.laden_radios_nimm' },
          },
          {
            id: 'fernseher',
            name: 'hotspot.fernseher',
            area: rect(184, 22, 44, 46),
            walkTo: [206, 106],
            face: 'hinten',
            comments: { schauan: 'say.k2.laden_fernseher', benutze: 'say.k2.laden_fernseher_benutze' },
          },
          {
            id: 'theke',
            name: 'hotspot.ladentheke',
            area: rect(40, 68, 180, 28),
            walkTo: [160, 106],
            face: 'hinten',
            sprite: { key: 'backgrounds/sprites/laden_theke.png', x: 40, y: 68, depthY: 99 },
            comments: { schauan: 'say.k2.laden_theke' },
          },
          {
            id: 'roehren',
            name: 'hotspot.roehren',
            area: rect(46, 76, 30, 16),
            walkTo: [60, 106],
            face: 'hinten',
            comments: { schauan: 'say.k2.laden_roehren', nimm: 'say.k2.laden_roehren_nimm' },
          },
          {
            id: 'haendler',
            name: 'hotspot.haendler',
            area: rect(96, 40, 28, 28),
            walkTo: [138, 106],
            face: 'links',
            defaultVerb: 'redemit',
            comments: { schauan: 'say.k2.haendler_schau' },
            verbs: {
              redemit: async (g) => {
                await g.sayAs(
                  'haendler',
                  g.getFlag('roehre_gekauft') ? 'say.k2.haendler_danach' : 'say.k2.haendler_preis',
                );
              },
            },
            useWith: {
              dollar: async (g) => {
                g.removeItem('dollar');
                g.setFlag('roehre_gekauft');
                g.addItem('roehre');
                await g.sayAs('haendler', 'say.k2.haendler_verkauft');
              },
            },
          },
          {
            id: 'tuer',
            name: 'hotspot.tuer_platz',
            area: rect(268, 22, 40, 66),
            walkTo: [287, 106],
            face: 'hinten',
            exit: { room: 'rathausplatz', at: [265, 100], face: 'vorne' },
          },
        ],
      },
    ],
  },
};
