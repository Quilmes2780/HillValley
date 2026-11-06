import type { RoomDef } from '../../engine/types';
import { pickup, rect } from './util';

export const schmiede: RoomDef = {
  id: 'schmiede',
  name: 'room.schmiede',
  eras: {
    1885: [
      {
        background: 'backgrounds/schmiede_1885.png',
        walkable: [[[8, 92], [312, 92], [316, 140], [4, 140]]],
        scale: { yFar: 92, sFar: 0.88, yNear: 140, sNear: 1 },
        hotspots: [
          {
            id: 'esse',
            name: 'hotspot.esse',
            area: rect(26, 34, 70, 54),
            walkTo: [60, 96],
            face: 'hinten',
            comments: { schauan: 'say.k3.schmiede_esse', benutze: 'say.k3.schmiede_esse_benutze' },
          },
          {
            id: 'amboss',
            name: 'hotspot.amboss',
            area: rect(122, 64, 50, 24),
            walkTo: [146, 96],
            face: 'hinten',
            comments: { schauan: 'say.k3.schmiede_amboss', nimm: 'say.k3.schmiede_amboss_nimm' },
          },
          {
            id: 'werkbank',
            name: 'hotspot.werkbank',
            area: rect(196, 24, 60, 68),
            walkTo: [226, 96],
            face: 'hinten',
            comments: { schauan: 'say.k3.schmiede_werkbank' },
          },
          {
            id: 'streichhoelzer',
            name: 'item.streichhoelzer.name',
            area: rect(202, 52, 14, 10),
            walkTo: [210, 96],
            face: 'hinten',
            visible: (s) => !s.flags.streichhoelzer_genommen,
            sprite: { key: 'backgrounds/sprites/streichhoelzer.png', x: 204, y: 53 },
            comments: { schauan: 'say.k3.schmiede_streichhoelzer' },
            verbs: {
              nimm: pickup((g) => {
                g.setFlag('streichhoelzer_genommen');
                g.addItem('streichhoelzer');
              }),
            },
          },
          {
            id: 'bleistift',
            name: 'item.bleistift.name',
            area: rect(228, 54, 16, 8),
            walkTo: [236, 96],
            face: 'hinten',
            visible: (s) => !s.flags.bleistift_genommen,
            sprite: { key: 'backgrounds/sprites/bleistift.png', x: 230, y: 57 },
            comments: { schauan: 'say.k3.schmiede_bleistift' },
            verbs: {
              nimm: pickup((g) => {
                g.setFlag('bleistift_genommen');
                g.addItem('bleistift');
              }),
            },
          },
          {
            id: 'tuer',
            name: 'hotspot.tuer_draussen',
            area: rect(268, 22, 40, 66),
            walkTo: [287, 96],
            face: 'hinten',
            exit: { room: 'stadtplan', at: [287, 100] },
          },
        ],
      },
    ],
  },
};
