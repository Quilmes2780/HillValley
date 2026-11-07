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
            area: rect(16, 10, 74, 52),
            walkTo: [100, 96],
            face: 'links',
            comments: { schauan: 'say.prolog.zimmer_fenster', oeffne: 'say.prolog.zimmer_fenster_oeffne' },
          },
          {
            id: 'bett',
            name: 'hotspot.bett',
            area: rect(6, 62, 89, 49),
            walkTo: [100, 106],
            face: 'links',
            comments: { schauan: 'say.prolog.zimmer_bett', benutze: 'say.prolog.zimmer_bett_benutze' },
          },
          {
            id: 'poster',
            name: 'hotspot.poster',
            area: rect(108, 14, 60, 46),
            walkTo: [140, 96],
            face: 'hinten',
            comments: { schauan: 'say.prolog.zimmer_poster', nimm: 'say.prolog.zimmer_poster_nimm' },
          },
          {
            id: 'pflanze',
            name: 'hotspot.pflanze',
            area: rect(176, 12, 24, 31),
            walkTo: [190, 96],
            face: 'hinten',
            comments: { schauan: 'say.prolog.zimmer_pflanze' },
          },
          {
            id: 'stereoanlage',
            name: 'hotspot.stereoanlage',
            area: rect(203, 13, 26, 15),
            walkTo: [216, 96],
            face: 'hinten',
            comments: { schauan: 'say.prolog.zimmer_stereo' },
          },
          {
            id: 'regal',
            name: 'hotspot.regal',
            area: [[200, 28], [229, 28], [229, 18], [245, 18], [245, 39], [200, 39]],
            walkTo: [226, 96],
            face: 'hinten',
            comments: { schauan: 'say.prolog.zimmer_regal' },
          },
          {
            id: 'schreibtisch',
            name: 'hotspot.schreibtisch',
            area: rect(166, 44, 84, 50),
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
            area: rect(267, 20, 43, 70),
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
