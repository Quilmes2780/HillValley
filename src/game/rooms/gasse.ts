import type { RoomDef } from '../../engine/types';
import { rect } from './util';

export const gasse: RoomDef = {
  id: 'gasse',
  name: 'room.gasse',
  eras: {
    2015: [
      {
        background: 'backgrounds/gasse_2015.png',
        walkable: [[[4, 94], [316, 94], [316, 140], [4, 140]]],
        scale: { yFar: 94, sFar: 0.88, yNear: 140, sNear: 1 },
        // Nur während der Rutschpartie zu sehen, danach ragen seine Beine aus dem Laster.
        actors: [{ id: 'brix', x: 4, y: 12, face: 'rechts', visible: (s) => !!s.flags.brix_rutscht }],
        hotspots: [
          {
            id: 'treppe',
            name: 'hotspot.aussentreppe',
            area: rect(0, 8, 140, 80),
            walkTo: [80, 98],
            face: 'hinten',
            comments: { schauan: 'say.k5.gasse_treppe', benutze: 'say.k5.gasse_treppe_benutze' },
          },
          {
            id: 'laster',
            name: 'hotspot.hover_mistlaster',
            area: rect(170, 36, 120, 58),
            walkTo: [230, 108],
            face: 'hinten',
            sprite: { key: 'backgrounds/sprites/hover_mistlaster.png', x: 170, y: 36, depthY: 100 },
            comments: { schauan: 'say.k5.gasse_laster', benutze: 'say.k5.gasse_laster_benutze' },
          },
          {
            id: 'beine',
            name: 'hotspot.brix_beine',
            area: rect(196, 28, 22, 18),
            walkTo: [210, 108],
            face: 'hinten',
            visible: (s) => !!s.flags.brix_gestuerzt && !s.flags.brix_rutscht,
            sprite: { key: 'backgrounds/sprites/brix_beine.png', x: 198, y: 30, depthY: 101 },
            comments: { schauan: 'say.k5.gasse_beine', redemit: 'say.k5.gasse_beine_rede' },
          },
          {
            id: 'strasse',
            name: 'hotspot.zurueck_platz',
            area: rect(300, 92, 20, 48),
            walkTo: [306, 122],
            face: 'rechts',
            exit: { room: 'turmplatz', at: [296, 120], face: 'links' },
          },
        ],
      },
    ],
  },
};
