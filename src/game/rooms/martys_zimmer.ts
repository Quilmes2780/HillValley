import type { RoomDef } from '../../engine/types';
import { pickup, rect } from './util';

const SCALE = { yFar: 92, sFar: 0.88, yNear: 140, sNear: 1 };

export const martysZimmer: RoomDef = {
  id: 'martys_zimmer',
  name: 'room.martys_zimmer',
  eras: {
    1986: [
      {
        background: 'backgrounds/martys_zimmer_1986.png',
        walkable: [[[95, 92], [310, 92], [316, 140], [95, 140]]],
        scale: SCALE,
        hotspots: [
          {
            id: 'fenster',
            name: 'hotspot.fenster',
            area: rect(30, 18, 50, 44),
            walkTo: [100, 96],
            face: 'links',
            comments: { schauan: 'say.prolog.zimmer_fenster', oeffne: 'say.prolog.zimmer_fenster_oeffne' },
          },
          {
            id: 'bett',
            name: 'hotspot.bett',
            area: rect(8, 62, 84, 48),
            walkTo: [100, 106],
            face: 'links',
            comments: { schauan: 'say.prolog.zimmer_bett', benutze: 'say.prolog.zimmer_bett_benutze' },
          },
          {
            id: 'poster',
            name: 'hotspot.poster',
            area: rect(110, 18, 58, 42),
            walkTo: [140, 96],
            face: 'hinten',
            comments: { schauan: 'say.prolog.zimmer_poster', nimm: 'say.prolog.zimmer_poster_nimm' },
          },
          {
            id: 'schreibtisch',
            name: 'hotspot.schreibtisch',
            area: rect(172, 42, 76, 50),
            walkTo: [210, 96],
            face: 'hinten',
            comments: { schauan: 'say.prolog.zimmer_schreibtisch', oeffne: 'say.prolog.zimmer_schublade' },
          },
          {
            id: 'kugelschreiber',
            name: 'item.kugelschreiber.name',
            area: rect(197, 55, 15, 9),
            walkTo: [205, 96],
            face: 'hinten',
            visible: (s) => !s.flags.kugelschreiber_genommen,
            sprite: { key: 'backgrounds/sprites/kugelschreiber.png', x: 200, y: 59 },
            comments: { schauan: 'say.prolog.zimmer_kugelschreiber' },
            verbs: {
              nimm: pickup((g) => {
                g.setFlag('kugelschreiber_genommen');
                g.addItem('kugelschreiber');
              }),
            },
          },
          {
            id: 'skateboard',
            name: 'hotspot.skateboard',
            area: rect(253, 60, 12, 28),
            walkTo: [258, 96],
            face: 'hinten',
            visible: (s) => !s.flags.skateboard_genommen,
            sprite: { key: 'backgrounds/sprites/skateboard_wand.png', x: 253, y: 60 },
            comments: { schauan: 'say.prolog.zimmer_skateboard' },
            verbs: {
              nimm: pickup((g) => {
                g.setFlag('skateboard_genommen');
                g.addItem('skateboard');
              }),
            },
          },
          {
            id: 'tuer',
            name: 'hotspot.tuer_kueche',
            area: rect(268, 22, 40, 66),
            walkTo: [287, 96],
            face: 'hinten',
            comments: { schauan: 'say.prolog.zimmer_tuer' },
            exit: { room: 'kueche', at: [28, 100], face: 'rechts' },
          },
        ],
      },
    ],
  },
};
