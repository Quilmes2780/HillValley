import type { RoomDef } from '../../engine/types';
import { pickup, rect } from './util';

const SCALE = { yFar: 92, sFar: 0.88, yNear: 140, sNear: 1 };

export const arbeitszimmer: RoomDef = {
  id: 'arbeitszimmer',
  name: 'room.arbeitszimmer',
  eras: {
    1986: [
      {
        background: 'backgrounds/arbeitszimmer_1986.png',
        walkable: [[[8, 92], [312, 92], [316, 140], [4, 140]]],
        scale: SCALE,
        hotspots: [
          {
            id: 'regal',
            name: 'hotspot.buecherregal',
            area: rect(20, 12, 90, 76),
            walkTo: [65, 94],
            face: 'hinten',
            comments: { schauan: 'say.prolog.arbeit_regal', nimm: 'say.prolog.arbeit_regal_nimm' },
          },
          {
            id: 'schreibtisch',
            name: 'hotspot.schreibtisch',
            area: rect(130, 58, 90, 34),
            walkTo: [175, 96],
            face: 'hinten',
            comments: { schauan: 'say.prolog.arbeit_schreibtisch', oeffne: 'say.prolog.arbeit_schublade' },
          },
          {
            id: 'schreibmaschine',
            name: 'hotspot.schreibmaschine',
            area: rect(160, 38, 28, 22),
            walkTo: [175, 96],
            face: 'hinten',
            comments: {
              schauan: 'say.prolog.arbeit_schreibmaschine',
              benutze: 'say.prolog.arbeit_schreibmaschine_benutze',
            },
          },
          {
            id: 'diktiergeraet',
            name: 'item.diktiergeraet.name',
            area: rect(212, 48, 16, 12),
            walkTo: [215, 96],
            face: 'hinten',
            visible: (s) => !s.flags.diktiergeraet_genommen,
            sprite: { key: 'backgrounds/sprites/diktiergeraet.png', x: 213, y: 50 },
            comments: { schauan: 'say.k1.diktier_auf_tisch' },
            verbs: {
              nimm: pickup((g) => {
                g.setFlag('diktiergeraet_genommen');
                g.addItem('diktiergeraet');
              }),
            },
          },
          {
            id: 'bild',
            name: 'hotspot.sternenbild',
            area: rect(235, 18, 24, 30),
            walkTo: [247, 94],
            face: 'hinten',
            comments: { schauan: 'say.prolog.arbeit_bild' },
          },
          {
            id: 'tuer',
            name: 'hotspot.tuer_kueche',
            area: rect(268, 22, 40, 66),
            walkTo: [287, 94],
            face: 'hinten',
            exit: { room: 'kueche', at: [77, 98], face: 'vorne' },
          },
        ],
      },
    ],
  },
};
