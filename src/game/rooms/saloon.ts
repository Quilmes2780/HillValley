import type { RoomDef } from '../../engine/types';
import { rect } from './util';

export const saloon: RoomDef = {
  id: 'saloon',
  name: 'room.saloon',
  eras: {
    1885: [
      {
        background: 'backgrounds/saloon_1885.png',
        walkable: [[[8, 102], [312, 102], [316, 140], [4, 140]]],
        scale: { yFar: 102, sFar: 0.92, yNear: 140, sNear: 1 },
        actors: [
          { id: 'barkeeper', x: 120, y: 96, face: 'vorne' },
          { id: 'buford', x: 250, y: 118, face: 'links', visible: (s) => !s.flags.buford_im_stall },
        ],
        hotspots: [
          {
            id: 'spiegel',
            name: 'hotspot.spiegel',
            area: rect(60, 14, 120, 26),
            walkTo: [150, 106],
            face: 'hinten',
            comments: { schauan: 'say.k3.saloon_spiegel' },
          },
          {
            id: 'bild',
            name: 'hotspot.gemaelde',
            area: rect(204, 22, 36, 26),
            walkTo: [222, 106],
            face: 'hinten',
            comments: { schauan: 'say.k3.saloon_bild' },
          },
          {
            id: 'theke',
            name: 'hotspot.theke',
            area: rect(60, 68, 180, 30),
            walkTo: [180, 106],
            face: 'hinten',
            sprite: { key: 'backgrounds/sprites/saloon_theke.png', x: 60, y: 68, depthY: 99 },
            comments: { schauan: 'say.k3.saloon_theke' },
          },
          {
            id: 'barkeeper',
            name: 'hotspot.barkeeper',
            area: rect(104, 40, 32, 28),
            walkTo: [148, 106],
            face: 'links',
            defaultVerb: 'redemit',
            comments: { schauan: 'say.k3.barkeeper_schau' },
            verbs: {
              redemit: async (g) => {
                await g.dialog('barkeeper');
              },
            },
          },
          {
            id: 'buford',
            name: 'hotspot.buford',
            area: rect(234, 54, 32, 64),
            walkTo: [218, 120],
            face: 'rechts',
            defaultVerb: 'redemit',
            visible: (s) => !s.flags.buford_im_stall,
            comments: { schauan: 'say.k3.buford_schau' },
            verbs: {
              redemit: async (g) => {
                await g.dialog('buford');
                if (!g.getFlag('doc_trinkt')) return;
                // Gag: Der Whisky haut Doc um. Er wacht in der Schmiede auf, ohne Folgen.
                g.setFlag('doc_trinkt', false);
                await g.cutscene(async () => {
                  await g.say('say.k3.whisky_1');
                  g.sfx('fall');
                  g.shake(400);
                  await g.hop(undefined, [204, 122], { ms: 500, spin: -1.5, keepSpin: true, ease: 'Bounce.easeOut' });
                  await g.wait(500);
                  await g.goToRoom('schmiede', 1885, [160, 120], 'vorne');
                  await g.say('say.k3.whisky_2');
                });
              },
            },
            useWith: {
              herausforderung: async (g) => {
                g.removeItem('herausforderung');
                await g.sayAs('buford', 'say.k3.buford_liest');
                await g.walkTo([300, 116], 'buford', 2);
                g.setFlag('buford_im_stall');
                await g.sayAs('barkeeper', 'say.k3.barkeeper_danach');
              },
            },
          },
          {
            id: 'spucknapf',
            name: 'hotspot.spucknapf',
            area: rect(249, 81, 14, 8),
            walkTo: [256, 104],
            face: 'hinten',
            // Buford steht davor, erst nach seinem Abgang kommt man heran.
            visible: (s) => !!s.flags.buford_im_stall,
            comments: { schauan: 'say.k3.saloon_napf', benutze: 'say.k3.saloon_napf_benutze' },
          },
          {
            id: 'tuer',
            name: 'hotspot.pendeltueren',
            area: rect(268, 22, 40, 56),
            walkTo: [287, 106],
            face: 'hinten',
            exit: { room: 'stadtplan', at: [287, 106] },
          },
        ],
      },
    ],
  },
};
