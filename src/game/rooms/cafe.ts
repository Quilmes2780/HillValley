import type { RoomDef } from '../../engine/types';
import { rect } from './util';

export const cafe: RoomDef = {
  id: 'cafe',
  name: 'room.cafe',
  eras: {
    1955: [
      {
        background: 'backgrounds/cafe_1955.png',
        walkable: [[[8, 102], [312, 102], [316, 140], [4, 140]]],
        scale: { yFar: 102, sFar: 0.92, yNear: 140, sNear: 1 },
        actors: [
          { id: 'lou', x: 150, y: 96, face: 'vorne' },
          { id: 'goldie', x: 56, y: 124, face: 'rechts' },
        ],
        hotspots: [
          {
            id: 'tuer',
            name: 'hotspot.tuer_platz',
            area: rect(4, 26, 34, 62),
            walkTo: [22, 106],
            face: 'hinten',
            exit: { room: 'rathausplatz', at: [51, 100], face: 'vorne' },
          },
          {
            id: 'theke',
            name: 'hotspot.theke',
            area: rect(70, 68, 170, 30),
            walkTo: [120, 106],
            face: 'hinten',
            sprite: { key: 'backgrounds/sprites/cafe_theke.png', x: 70, y: 68, depthY: 99 },
            comments: { schauan: 'say.k2.cafe_theke' },
          },
          {
            id: 'regal',
            name: 'hotspot.flaschen',
            area: rect(84, 22, 150, 34),
            walkTo: [200, 106],
            face: 'hinten',
            comments: { schauan: 'say.k2.cafe_regal' },
          },
          {
            id: 'musikbox',
            name: 'hotspot.musikbox',
            area: rect(270, 32, 28, 56),
            walkTo: [284, 106],
            face: 'hinten',
            comments: { schauan: 'say.k2.cafe_musikbox', benutze: 'say.k2.cafe_musikbox_benutze' },
          },
          {
            id: 'mixer',
            name: 'hotspot.mixer',
            area: rect(186, 50, 18, 20),
            walkTo: [196, 106],
            face: 'hinten',
            sprite: { key: 'backgrounds/sprites/mixer.png', x: 188, y: 50, depthY: 100 },
            comments: { schauan: 'say.k2.mixer_schau', benutze: 'say.k2.mixer_benutze' },
            useWith: {
              schraubenzieher: async (g) => {
                if (g.getFlag('mixer_repariert')) {
                  await g.say('say.k2.mixer_laeuft');
                  return;
                }
                g.setFlag('mixer_repariert');
                g.addItem('dollar');
                await g.say('say.k2.mixer_repariert');
                await g.sayAs('lou', 'say.k2.lou_dollar');
              },
            },
          },
          {
            id: 'lou',
            name: 'hotspot.lou',
            area: rect(136, 40, 28, 28),
            walkTo: [178, 106],
            face: 'links',
            defaultVerb: 'redemit',
            comments: { schauan: 'say.k2.lou_schau' },
            verbs: {
              redemit: async (g) => {
                await g.dialog('lou');
              },
            },
          },
          {
            id: 'goldie',
            name: 'hotspot.goldie',
            area: rect(42, 72, 28, 52),
            walkTo: [82, 126],
            face: 'links',
            defaultVerb: 'redemit',
            comments: { schauan: 'say.k2.goldie_schau' },
            verbs: {
              redemit: async (g) => {
                await g.dialog('goldie');
              },
            },
          },
        ],
      },
    ],
  },
};
