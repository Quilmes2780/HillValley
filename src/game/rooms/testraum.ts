import type { RoomDef } from '../../engine/types';

const rect = (x: number, y: number, w: number, h: number) =>
  [[x, y], [x + w, y], [x + w, y + h], [x, y + h]] as const;

/**
 * Storyfreier Testraum für den Engine-Kern. Zeigt: Hindernis in der Walkbox, Tiefensortierung,
 * Öffnen/Schließen, Nehmen, Dialog, Ausgang mit Bedingung und zwei Zeitebenen.
 */
export const testraum: RoomDef = {
  id: 'testraum',
  name: 'room.testraum',
  eras: {
    1986: [
      {
        background: 'backgrounds/testraum_1986.png',
        // Vier konvexe Teilflächen um den Tisch herum
        walkable: [
          [[20, 92], [130, 92], [130, 140], [4, 140]],
          [[130, 92], [190, 92], [190, 100], [130, 100]],
          [[130, 118], [190, 118], [190, 140], [130, 140]],
          [[190, 92], [300, 92], [316, 140], [190, 140]],
        ],
        scale: { yFar: 92, sFar: 0.86, yNear: 140, sNear: 1 },
        actors: [{ id: 'test_npc', x: 62, y: 128, face: 'rechts' }],
        hotspots: [
          {
            id: 'tisch',
            name: 'hotspot.tisch',
            area: [[132, 88], [188, 88], [197, 103], [197, 118], [124, 118], [124, 103]],
            walkTo: [160, 96],
            face: 'vorne',
            sprite: { key: 'backgrounds/sprites/tisch.png', x: 124, y: 88, depthY: 118 },
            comments: {
              schauan: 'say.test.tisch',
              nimm: 'say.test.tisch_nimm',
            },
          },
          {
            id: 'apfel',
            name: 'item.apfel.name',
            area: [[144, 79], [155, 79], [155, 90], [144, 90]],
            walkTo: [150, 96],
            face: 'vorne',
            visible: (s) => !s.flags.test_apfel_genommen,
            sprite: { key: 'backgrounds/sprites/apfel.png', x: 145, y: 80, depthY: 119 },
            comments: { schauan: 'say.test.apfel' },
            verbs: {
              nimm: async (g) => {
                await g.playAnim('pickup');
                g.setFlag('test_apfel_genommen');
                g.addItem('apfel');
              },
            },
          },
          {
            id: 'keks',
            name: 'item.keks.name',
            area: [[166, 83], [176, 83], [176, 90], [166, 90]],
            walkTo: [172, 96],
            face: 'vorne',
            visible: (s) => !s.flags.test_keks_genommen,
            sprite: { key: 'backgrounds/sprites/keks.png', x: 167, y: 85, depthY: 119 },
            verbs: {
              nimm: async (g) => {
                await g.playAnim('pickup');
                g.setFlag('test_keks_genommen');
                g.addItem('keks');
              },
            },
          },
          {
            id: 'tuer',
            name: 'hotspot.tuer',
            area: rect(26, 26, 38, 62),
            walkTo: [45, 96],
            face: 'hinten',
            defaultVerb: 'oeffne',
            sprite: {
              key: 'backgrounds/sprites/tuer_zu.png',
              x: 29,
              y: 29,
              when: (s) => !s.flags.test_tuer_offen,
            },
            comments: { schauan: 'say.test.tuer' },
            verbs: {
              oeffne: async (g) => {
                if (g.getFlag('test_tuer_offen')) await g.say('say.test.schon_offen');
                else g.setFlag('test_tuer_offen');
              },
              schliesse: async (g) => {
                if (!g.getFlag('test_tuer_offen')) await g.say('say.test.schon_zu');
                else g.setFlag('test_tuer_offen', false);
              },
            },
            exit: {
              room: 'testflur',
              at: [38, 110],
              face: 'rechts',
              guard: async (g) => {
                if (g.getFlag('test_tuer_offen')) return true;
                await g.say('say.test.tuer_zu');
                return false;
              },
            },
          },
          {
            id: 'schalter',
            name: 'hotspot.schalter',
            area: rect(100, 50, 11, 14),
            walkTo: [105, 96],
            face: 'hinten',
            defaultVerb: 'druecke',
            comments: { schauan: 'say.test.schalter' },
            verbs: {
              druecke: async (g) => {
                await g.say('say.test.schalter_druecke');
                await g.goToRoom('testraum', 1885, [105, 100], 'vorne');
              },
            },
          },
          {
            id: 'schrank',
            name: 'hotspot.schrank',
            area: rect(228, 24, 54, 64),
            walkTo: [255, 96],
            face: 'hinten',
            defaultVerb: 'oeffne',
            sprite: {
              key: 'backgrounds/sprites/schrank_zu.png',
              x: 228,
              y: 24,
              when: (s) => !s.flags.test_schrank_offen,
            },
            comments: { schauan: 'say.test.schrank' },
            verbs: {
              oeffne: async (g) => {
                if (g.getFlag('test_schrank_offen')) await g.say('say.test.schon_offen');
                else g.setFlag('test_schrank_offen');
              },
              schliesse: async (g) => {
                if (!g.getFlag('test_schrank_offen')) await g.say('say.test.schon_zu');
                else g.setFlag('test_schrank_offen', false);
              },
            },
          },
          {
            id: 'schachtel',
            name: 'item.schachtel.name',
            area: rect(247, 42, 16, 12),
            walkTo: [255, 96],
            face: 'hinten',
            visible: (s) => !!s.flags.test_schrank_offen && !s.flags.test_schachtel_genommen,
            sprite: { key: 'backgrounds/sprites/schachtel.png', x: 248, y: 44 },
            verbs: {
              nimm: async (g) => {
                await g.playAnim('pickup');
                g.setFlag('test_schachtel_genommen');
                g.addItem('schachtel');
              },
            },
          },
          {
            id: 'testfigur',
            name: 'hotspot.testfigur',
            area: rect(48, 76, 28, 53),
            walkTo: [88, 128],
            face: 'links',
            defaultVerb: 'redemit',
            comments: { schauan: 'say.test.testfigur' },
            verbs: {
              redemit: async (g) => {
                await g.dialog('test');
              },
            },
            useWith: {
              muenze: async (g) => {
                g.removeItem('muenze');
                g.setFlag('test_muenze_abgegeben');
                await g.sayAs('test_npc', 'say.test.muenze_danke');
              },
            },
          },
        ],
      },
    ],
    1885: [
      {
        background: 'backgrounds/testraum_1885.png',
        walkable: [[[20, 92], [300, 92], [316, 140], [4, 140]]],
        scale: { yFar: 92, sFar: 0.86, yNear: 140, sNear: 1 },
        hotspots: [
          {
            id: 'mauer',
            name: 'hotspot.mauer',
            area: rect(26, 26, 38, 62),
            walkTo: [45, 96],
            face: 'hinten',
            comments: { schauan: 'say.test.mauer' },
          },
          {
            id: 'schalter',
            name: 'hotspot.schalter_messing',
            area: rect(100, 50, 11, 14),
            walkTo: [105, 96],
            face: 'hinten',
            defaultVerb: 'druecke',
            comments: { schauan: 'say.test.schalter_messing' },
            verbs: {
              druecke: async (g) => {
                await g.goToRoom('testraum', 1986, [105, 100], 'vorne');
              },
            },
          },
          {
            id: 'laterne',
            name: 'hotspot.laterne',
            area: rect(183, 20, 16, 28),
            walkTo: [190, 96],
            face: 'hinten',
            comments: { schauan: 'say.test.laterne', nimm: 'say.test.laterne_nimm' },
          },
        ],
      },
    ],
  },
};
