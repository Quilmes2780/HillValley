import type { RoomDef } from '../../engine/types';
import { rect } from './util';

export const turmeingang: RoomDef = {
  id: 'turmeingang',
  name: 'room.turmeingang',
  eras: {
    1986: [
      {
        background: 'backgrounds/turmeingang_1986.png',
        walkable: [[[8, 92], [312, 92], [316, 140], [4, 140]]],
        scale: { yFar: 92, sFar: 0.88, yNear: 140, sNear: 1 },
        hotspots: [
          {
            id: 'tuer',
            name: 'hotspot.tuer_platz',
            area: rect(10, 21, 44, 73),
            walkTo: [32, 96],
            face: 'hinten',
            comments: { schauan: 'say.k1.eingang_tuer' },
            exit: { room: 'rathausplatz', at: [160, 102], face: 'vorne' },
          },
          {
            id: 'wandlampe',
            name: 'hotspot.wandlampe',
            area: rect(104, 17, 22, 10),
            walkTo: [114, 96],
            face: 'hinten',
            comments: { schauan: 'say.k1.eingang_lampe' },
          },
          {
            id: 'schaukasten',
            name: 'hotspot.schaukasten',
            area: rect(85, 28, 58, 43),
            walkTo: [114, 96],
            face: 'hinten',
            comments: { schauan: 'say.k1.eingang_schaukasten', oeffne: 'say.k1.eingang_schaukasten_oeffne' },
          },
          {
            id: 'pflanze',
            name: 'hotspot.pflanze',
            area: rect(175, 50, 28, 46),
            walkTo: [189, 98],
            face: 'hinten',
            comments: { schauan: 'say.k1.eingang_pflanze' },
          },
          {
            id: 'fenster',
            name: 'hotspot.fenster',
            area: rect(211, 8, 28, 60),
            walkTo: [225, 96],
            face: 'hinten',
            comments: { schauan: 'say.k1.eingang_fenster' },
          },
          {
            id: 'bueste',
            name: 'hotspot.bueste',
            area: rect(146, 58, 26, 38),
            walkTo: [159, 98],
            face: 'hinten',
            visible: (s) => s.timeline.tannenburg,
            sprite: { key: 'backgrounds/sprites/bueste.png', x: 146, y: 58 },
            comments: { schauan: 'say.k1.eingang_bueste', nimm: 'say.k1.eingang_bueste_nimm' },
          },
          {
            id: 'treppe',
            name: 'hotspot.treppe',
            area: rect(250, 4, 62, 92),
            walkTo: [278, 96],
            face: 'hinten',
            comments: { schauan: 'say.k1.eingang_treppe' },
            exit: { room: 'uhrwerk', at: [24, 100], face: 'rechts' },
          },
        ],
      },
    ],
  },
};
