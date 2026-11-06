import type { RoomDef } from '../../engine/types';
import { rect } from './util';

export const strasseMist: RoomDef = {
  id: 'strasse_mist',
  name: 'room.strasse_mist',
  eras: {
    1955: [
      {
        background: 'backgrounds/strasse_1955.png',
        walkable: [[[4, 94], [316, 94], [316, 140], [4, 140]]],
        scale: { yFar: 94, sFar: 0.88, yNear: 140, sNear: 1 },
        actors: [
          { id: 'biff_jung', x: 16, y: 118, face: 'rechts', visible: (s) => !s.flags.biff_im_mist },
        ],
        hotspots: [
          {
            id: 'haeuser',
            name: 'hotspot.haeuser',
            area: rect(0, 30, 170, 56),
            walkTo: [90, 98],
            face: 'hinten',
            comments: { schauan: 'say.k2.strasse_haeuser' },
          },
          {
            id: 'mistlaster',
            name: 'hotspot.mistlaster',
            area: rect(180, 46, 112, 58),
            walkTo: [236, 110],
            face: 'hinten',
            sprite: { key: 'backgrounds/sprites/mistlaster.png', x: 180, y: 46, depthY: 104 },
            comments: { schauan: 'say.k2.laster_schau', benutze: 'say.k2.laster_benutze', oeffne: 'say.k2.laster_benutze' },
          },
          {
            id: 'beine',
            name: 'hotspot.beine',
            area: rect(208, 34, 22, 18),
            walkTo: [220, 110],
            face: 'hinten',
            visible: (s) => !!s.flags.biff_im_mist,
            sprite: { key: 'backgrounds/sprites/mist_beine.png', x: 210, y: 36, depthY: 105 },
            comments: { schauan: 'say.k2.beine_schau', redemit: 'say.k2.beine_rede', ziehe: 'say.k2.beine_ziehe' },
          },
          {
            id: 'strasse',
            name: 'hotspot.strasse',
            area: rect(300, 94, 20, 46),
            walkTo: [306, 120],
            face: 'rechts',
            exit: { room: 'stadtplan', at: [306, 120] },
          },
        ],
      },
    ],
  },
};
