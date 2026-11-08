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
            id: 'strahler_links',
            name: 'hotspot.strahler',
            area: rect(44, 0, 15, 11),
            walkTo: [52, 96],
            face: 'hinten',
            comments: { schauan: 'say.k1.band_strahler' },
          },
          {
            id: 'strahler_rechts',
            name: 'hotspot.strahler',
            area: rect(175, 0, 17, 11),
            walkTo: [183, 96],
            face: 'hinten',
            comments: { schauan: 'say.k1.band_strahler' },
          },
          {
            id: 'notenstaender',
            name: 'hotspot.notenstaender',
            area: rect(237, 52, 24, 44),
            walkTo: [249, 98],
            face: 'hinten',
            comments: { schauan: 'say.k1.band_noten' },
          },
          {
            id: 'schlagzeug',
            name: 'hotspot.schlagzeug',
            area: rect(26, 46, 91, 50),
            walkTo: [72, 96],
            face: 'hinten',
            comments: { schauan: 'say.k1.band_schlagzeug', benutze: 'say.k1.band_schlagzeug_benutze' },
          },
          {
            id: 'verstaerker',
            name: 'hotspot.band_verstaerker',
            area: rect(136, 48, 49, 45),
            walkTo: [162, 96],
            face: 'hinten',
            comments: { schauan: 'say.k1.band_verstaerker', benutze: 'say.k1.band_verstaerker_benutze' },
          },
          {
            id: 'poster',
            name: 'hotspot.poster',
            area: rect(199, 19, 43, 31),
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
            area: rect(266, 22, 42, 68),
            walkTo: [287, 96],
            face: 'hinten',
            exit: { room: 'schule_flur', at: [53, 100], face: 'vorne' },
          },
        ],
      },
    ],
  },
};
