import type { RoomDef } from '../../engine/types';
import { rect } from './util';

export const cafe80er: RoomDef = {
  id: 'cafe80er',
  name: 'room.cafe80er',
  eras: {
    2015: [
      {
        background: 'backgrounds/cafe80er_2015.png',
        walkable: [[[8, 102], [312, 102], [316, 140], [4, 140]]],
        scale: { yFar: 102, sFar: 0.92, yNear: 140, sNear: 1 },
        actors: [
          { id: 'kellnerroboter', x: 110, y: 110, face: 'rechts' },
          { id: 'jennifer', x: 170, y: 122, face: 'links' },
          { id: 'brix', x: 238, y: 112, face: 'links', visible: (s) => !s.flags.brix_im_museum },
        ],
        hotspots: [
          {
            id: 'tuer',
            name: 'hotspot.tuer_platz',
            area: rect(4, 26, 34, 62),
            walkTo: [22, 106],
            face: 'hinten',
            exit: { room: 'turmplatz', at: [79, 100], face: 'vorne' },
          },
          {
            id: 'poster',
            name: 'hotspot.starposter',
            area: rect(60, 16, 98, 34),
            walkTo: [110, 104],
            face: 'hinten',
            comments: { schauan: 'say.k5.cafe_poster' },
          },
          {
            id: 'theke',
            name: 'hotspot.theke',
            area: rect(52, 60, 44, 28),
            walkTo: [74, 106],
            face: 'hinten',
            comments: { schauan: 'say.k5.cafe_theke' },
          },
          {
            id: 'automat',
            name: 'hotspot.automat',
            area: rect(266, 28, 40, 60),
            walkTo: [286, 106],
            face: 'hinten',
            comments: { schauan: 'say.k5.automat_schau', benutze: 'say.k5.automat_benutze' },
            useWith: {
              muenze_2015: async (g) => {
                g.removeItem('muenze_2015');
                await g.cutscene(async () => {
                  await g.say('say.k5.automat_1');
                  g.flash(150);
                  await g.wait(500);
                  g.flash(150);
                  await g.say('say.k5.automat_2');
                  await g.say('say.k5.automat_3');
                });
                g.addItem('freikarte');
              },
            },
          },
          {
            id: 'glas',
            name: 'item.glas.name',
            area: rect(212, 82, 10, 12),
            walkTo: [200, 112],
            face: 'rechts',
            visible: (s) => !s.flags.glas_genommen,
            sprite: { key: 'backgrounds/sprites/glas.png', x: 214, y: 84, depthY: 120 },
            comments: { schauan: 'say.k5.glas_schau' },
            verbs: {
              nimm: async (g) => {
                if (!g.getFlag('brix_im_museum')) {
                  await g.say('say.k5.glas_brix_sitzt');
                } else if (!g.getFlag('roboter_verwirrt')) {
                  await g.sayAs('kellnerroboter', 'say.k5.robot_verbot');
                } else {
                  await g.playAnim('pickup');
                  g.setFlag('glas_genommen');
                  g.addItem('glas');
                }
              },
            },
          },
          {
            id: 'kellnerroboter',
            name: 'hotspot.kellnerroboter',
            area: rect(96, 60, 28, 50),
            walkTo: [134, 112],
            face: 'links',
            defaultVerb: 'redemit',
            comments: { schauan: 'say.k5.robot_schau' },
            verbs: {
              redemit: async (g) => {
                await g.sayAs(
                  'kellnerroboter',
                  g.getFlag('roboter_verwirrt') ? 'say.k5.robot_haengt' : 'say.k5.robot_rede',
                );
              },
            },
          },
          {
            id: 'jennifer',
            name: 'hotspot.jennifer',
            area: rect(156, 72, 28, 50),
            walkTo: [196, 124],
            face: 'links',
            defaultVerb: 'redemit',
            comments: { schauan: 'say.k5.jennifer_schau' },
            verbs: {
              redemit: async (g) => {
                if (g.getFlag('roboter_verwirrt')) {
                  await g.sayAs('jennifer', 'say.k5.jennifer_cafe_danach');
                  return;
                }
                await g.dialog('jennifer_cafe');
                if (g.getFlag('roboter_verwirrt')) {
                  await g.sayAs('kellnerroboter', 'say.k5.robot_verwirrt');
                }
              },
            },
          },
          {
            id: 'brix',
            name: 'hotspot.brix',
            area: rect(224, 62, 28, 50),
            walkTo: [204, 114],
            face: 'rechts',
            defaultVerb: 'redemit',
            visible: (s) => !s.flags.brix_im_museum,
            comments: { schauan: 'say.k5.brix_schau' },
            verbs: {
              redemit: async (g) => {
                await g.dialog('brix_cafe');
                await g.walkTo([24, 108], 'brix', 2.5);
                g.setFlag('brix_im_museum');
              },
            },
          },
        ],
      },
    ],
  },
};
