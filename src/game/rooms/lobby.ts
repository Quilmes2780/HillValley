import type { RoomDef, Script } from '../../engine/types';
import { rect } from './util';

const scannen: Script = async (g) => {
  if (g.getFlag('aufzug_offen')) {
    await g.say('say.k5.scanner_schon');
    return;
  }
  g.removeItem('folie');
  g.setFlag('aufzug_offen');
  g.flash(120);
  await g.say('say.k5.scanner_ok');
};

const nochNicht: Script = async (g) => {
  await g.say('say.k5.scanner_glas');
};

export const lobby: RoomDef = {
  id: 'lobby',
  name: 'room.lobby',
  eras: {
    2015: [
      {
        background: 'backgrounds/lobby_2015.png',
        walkable: [[[8, 92], [312, 92], [316, 140], [4, 140]]],
        scale: { yFar: 92, sFar: 0.88, yNear: 140, sNear: 1 },
        hotspots: [
          {
            id: 'tuer',
            name: 'hotspot.tuer_platz',
            area: rect(4, 26, 36, 62),
            walkTo: [22, 96],
            face: 'hinten',
            exit: { room: 'turmplatz', at: [160, 100], face: 'vorne' },
          },
          {
            id: 'empfang',
            name: 'hotspot.empfang',
            area: rect(60, 38, 80, 50),
            walkTo: [100, 96],
            face: 'hinten',
            comments: { schauan: 'say.k5.lobby_empfang', redemit: 'say.k5.lobby_empfang_rede' },
          },
          {
            id: 'bueste',
            name: 'hotspot.bueste',
            area: rect(158, 50, 16, 38),
            walkTo: [166, 96],
            face: 'hinten',
            comments: { schauan: 'say.k5.lobby_bueste', nimm: 'say.k1.eingang_bueste_nimm' },
          },
          {
            id: 'aufzug',
            name: 'hotspot.aufzug',
            area: rect(200, 24, 44, 64),
            walkTo: [222, 96],
            face: 'hinten',
            sprite: {
              key: 'backgrounds/sprites/aufzug_zu.png',
              x: 202,
              y: 26,
              when: (s) => !s.flags.aufzug_offen,
            },
            comments: { oeffne: 'say.k5.aufzug_oeffne' },
            verbs: {
              schauan: async (g) => {
                await g.say(g.getFlag('aufzug_offen') ? 'say.k5.aufzug_offen' : 'say.k5.aufzug_schau');
              },
            },
            useWith: { folie: scannen, glas: nochNicht },
          },
          {
            id: 'scanner',
            name: 'hotspot.scanner',
            area: rect(250, 52, 12, 16),
            walkTo: [256, 96],
            face: 'hinten',
            sprite: {
              key: 'backgrounds/sprites/scanner_gruen.png',
              x: 252,
              y: 55,
              when: (s) => !!s.flags.aufzug_offen,
            },
            comments: { schauan: 'say.k5.scanner_schau', benutze: 'say.k5.scanner_finger', druecke: 'say.k5.scanner_finger' },
            useWith: { folie: scannen, glas: nochNicht },
          },
          {
            id: 'knopf_88',
            name: 'hotspot.knopf_88',
            area: rect(214, 48, 16, 16),
            walkTo: [222, 96],
            face: 'hinten',
            defaultVerb: 'druecke',
            visible: (s) => !!s.flags.aufzug_offen,
            sprite: { key: 'backgrounds/sprites/knopf_88.png', x: 216, y: 50 },
            comments: { schauan: 'say.k5.knopf_schau' },
            verbs: {
              druecke: async (g) => {
                await g.goToRoom('buero', 2015, [290, 112], 'links');
              },
            },
          },
        ],
      },
    ],
  },
};
