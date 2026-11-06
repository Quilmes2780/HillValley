import type { RoomDef } from '../../engine/types';
import { pickup, rect } from './util';

export const bandraum: RoomDef = {
  id: 'bandraum',
  name: 'room.bandraum',
  eras: {
    1986: [
      {
        background: 'backgrounds/bandraum_1986.png',
        walkable: [[[8, 92], [312, 92], [316, 140], [4, 140]]],
        scale: { yFar: 92, sFar: 0.88, yNear: 140, sNear: 1 },
        hotspots: [
          {
            id: 'schlagzeug',
            name: 'hotspot.schlagzeug',
            area: rect(28, 50, 88, 38),
            walkTo: [72, 96],
            face: 'hinten',
            comments: { schauan: 'say.k1.band_schlagzeug', benutze: 'say.k1.band_schlagzeug_benutze' },
          },
          {
            id: 'verstaerker',
            name: 'hotspot.band_verstaerker',
            area: rect(140, 48, 44, 40),
            walkTo: [162, 96],
            face: 'hinten',
            comments: { schauan: 'say.k1.band_verstaerker', benutze: 'say.k1.band_verstaerker_benutze' },
          },
          {
            id: 'poster',
            name: 'hotspot.poster',
            area: rect(200, 20, 42, 30),
            walkTo: [221, 96],
            face: 'hinten',
            comments: { schauan: 'say.k1.band_poster' },
          },
          {
            id: 'kabel',
            name: 'item.kabel.name',
            area: rect(198, 98, 22, 14),
            walkTo: [209, 116],
            face: 'hinten',
            visible: (s) => !s.flags.kabel_genommen,
            sprite: { key: 'backgrounds/sprites/kabelrolle.png', x: 200, y: 99 },
            comments: { schauan: 'say.k1.band_kabel' },
            verbs: {
              nimm: pickup((g) => {
                g.setFlag('kabel_genommen');
                g.addItem('kabel');
              }),
            },
          },
          {
            id: 'tuer',
            name: 'hotspot.tuer_flur',
            area: rect(268, 22, 40, 66),
            walkTo: [287, 96],
            face: 'hinten',
            exit: { room: 'schule_flur', at: [53, 100], face: 'vorne' },
          },
        ],
      },
    ],
  },
};
