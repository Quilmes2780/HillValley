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
            area: rect(12, 22, 40, 66),
            walkTo: [32, 96],
            face: 'hinten',
            comments: { schauan: 'say.k1.eingang_tuer' },
            exit: { room: 'rathausplatz', at: [160, 102], face: 'vorne' },
          },
          {
            id: 'schaukasten',
            name: 'hotspot.schaukasten',
            area: rect(92, 28, 44, 34),
            walkTo: [114, 96],
            face: 'hinten',
            comments: { schauan: 'say.k1.eingang_schaukasten', oeffne: 'say.k1.eingang_schaukasten_oeffne' },
          },
          {
            id: 'bueste',
            name: 'hotspot.bueste',
            area: rect(176, 50, 26, 38),
            walkTo: [190, 96],
            face: 'hinten',
            visible: (s) => s.timeline.tannenburg,
            sprite: { key: 'backgrounds/sprites/bueste.png', x: 176, y: 50 },
            comments: { schauan: 'say.k1.eingang_bueste', nimm: 'say.k1.eingang_bueste_nimm' },
          },
          {
            id: 'treppe',
            name: 'hotspot.treppe',
            area: rect(250, 12, 60, 76),
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
