import type { RoomDef } from '../../engine/types';

const rect = (x: number, y: number, w: number, h: number) =>
  [[x, y], [x + w, y], [x + w, y + h], [x, y + h]] as const;

/** Zweiter Testraum: 480 Pixel breit, damit die Kamera scrollt. */
export const testflur: RoomDef = {
  id: 'testflur',
  name: 'room.testflur',
  eras: {
    1986: [
      {
        background: 'backgrounds/testflur_1986.png',
        walkable: [[[8, 96], [472, 96], [472, 140], [8, 140]]],
        hotspots: [
          {
            id: 'tuer',
            name: 'hotspot.tuer',
            area: rect(20, 28, 36, 60),
            walkTo: [38, 100],
            face: 'hinten',
            comments: { schauan: 'say.test.tuer_flur' },
            exit: { room: 'testraum', at: [45, 100], face: 'vorne' },
          },
          {
            id: 'spinde',
            name: 'hotspot.spinde',
            area: rect(120, 26, 130, 62),
            walkTo: [185, 100],
            face: 'hinten',
            comments: { schauan: 'say.test.spinde', oeffne: 'say.test.spinde_oeffne' },
          },
          {
            id: 'fenster',
            name: 'hotspot.fenster',
            area: rect(390, 20, 60, 44),
            walkTo: [420, 100],
            face: 'hinten',
            comments: { schauan: 'say.test.fenster' },
          },
        ],
      },
    ],
  },
};
