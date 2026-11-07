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
            id: 'pflanze',
            name: 'hotspot.pflanze',
            area: rect(9, 5, 18, 53),
            walkTo: [20, 94],
            face: 'hinten',
            comments: { schauan: 'say.prolog.arbeit_pflanze' },
          },
          {
            id: 'regal',
            name: 'hotspot.buecherregal',
            area: rect(18, 17, 94, 76),
            walkTo: [65, 94],
            face: 'hinten',
            comments: { schauan: 'say.prolog.arbeit_regal', nimm: 'say.prolog.arbeit_regal_nimm' },
          },
          {
            id: 'modellrakete',
            name: 'hotspot.modellrakete',
            area: rect(47, 1, 9, 16),
            walkTo: [52, 94],
            face: 'hinten',
            comments: { schauan: 'say.prolog.arbeit_rakete' },
          },
          {
            id: 'planetenmodell',
            name: 'hotspot.planetenmodell',
            area: rect(61, 2, 17, 15),
            walkTo: [70, 94],
            face: 'hinten',
            comments: { schauan: 'say.prolog.arbeit_modell' },
          },
          {
            id: 'raumbild',
            name: 'hotspot.raumbild',
            area: rect(124, 14, 29, 31),
            walkTo: [139, 94],
            face: 'hinten',
            comments: { schauan: 'say.prolog.arbeit_raumbild' },
          },
          {
            id: 'schreibtisch',
            name: 'hotspot.schreibtisch',
            area: rect(122, 50, 102, 46),
            walkTo: [175, 96],
            face: 'hinten',
            comments: { schauan: 'say.prolog.arbeit_schreibtisch', oeffne: 'say.prolog.arbeit_schublade' },
          },
          {
            id: 'tasse',
            name: 'hotspot.tasse',
            area: rect(148, 54, 11, 8),
            walkTo: [153, 96],
            face: 'hinten',
            comments: { schauan: 'say.prolog.arbeit_tasse' },
          },
          {
            id: 'lampe',
            name: 'hotspot.lampe',
            area: rect(195, 36, 24, 26),
            walkTo: [207, 96],
            face: 'hinten',
            comments: { schauan: 'say.prolog.arbeit_lampe' },
          },
          {
            id: 'schreibmaschine',
            name: 'hotspot.schreibmaschine',
            area: rect(160, 40, 28, 22),
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
            area: rect(192, 50, 16, 13),
            walkTo: [200, 96],
            face: 'hinten',
            visible: (s) => !s.flags.diktiergeraet_genommen,
            sprite: { key: 'backgrounds/sprites/diktiergeraet.png', x: 193, y: 52 },
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
            area: rect(230, 17, 29, 34),
            walkTo: [244, 94],
            face: 'hinten',
            comments: { schauan: 'say.prolog.arbeit_bild' },
          },
          {
            id: 'tuer',
            name: 'hotspot.tuer_kueche',
            area: rect(266, 22, 44, 69),
            walkTo: [287, 94],
            face: 'hinten',
            exit: { room: 'kueche', at: [77, 98], face: 'vorne' },
          },
        ],
      },
    ],
  },
};
