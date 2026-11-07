import type { Hotspot, Polygon, RoomVariant } from '../../engine/types';
import type { RoomDef } from '../../engine/types';
import { pickup, rect } from './util';

const SCALE = { yFar: 106, sFar: 0.88, yNear: 140, sNear: 1 };

/** Um das Auto herum: links, davor, rechts. */
const WALKABLE: readonly Polygon[] = [
  [[4, 106], [185, 106], [185, 140], [4, 140]],
  [[185, 120], [287, 120], [287, 140], [185, 140]],
  [[287, 106], [316, 106], [316, 140], [287, 140]],
];

const COMMON: readonly Hotspot[] = [
  {
    id: 'haus',
    name: 'hotspot.haus',
    area: rect(0, 0, 118, 104),
    walkTo: [60, 108],
    face: 'hinten',
    comments: { schauan: 'say.prolog.vorgarten_haus' },
  },
  {
    id: 'haustuer',
    name: 'hotspot.haustuer',
    area: rect(97, 48, 22, 54),
    walkTo: [107, 108],
    face: 'hinten',
    comments: { schauan: 'say.prolog.kueche_haustuer' },
    exit: { room: 'kueche', at: [288, 98], face: 'links' },
  },
  {
    id: 'briefkasten',
    name: 'hotspot.briefkasten',
    area: rect(119, 79, 11, 29),
    walkTo: [125, 110],
    face: 'hinten',
    comments: { schauan: 'say.prolog.vorgarten_briefkasten', oeffne: 'say.prolog.vorgarten_briefkasten_oeffne' },
  },
  {
    id: 'hecke',
    name: 'hotspot.hecke',
    area: rect(44, 84, 50, 20),
    walkTo: [68, 108],
    face: 'hinten',
    comments: { schauan: 'say.prolog.vorgarten_hecke' },
  },
  {
    id: 'gartenmauer',
    name: 'hotspot.gartenmauer',
    area: rect(130, 85, 170, 19),
    walkTo: [160, 108],
    face: 'hinten',
    comments: { schauan: 'say.prolog.vorgarten_mauer' },
  },
  {
    id: 'baum',
    name: 'hotspot.baum',
    area: [[248, 0], [320, 0], [320, 42], [316, 42], [316, 104], [300, 104], [300, 42], [248, 42]],
    walkTo: [305, 108],
    face: 'hinten',
    comments: { schauan: 'say.prolog.vorgarten_baum' },
  },
  {
    id: 'auto',
    name: 'hotspot.auto',
    area: rect(186, 73, 102, 46),
    walkTo: [236, 122],
    face: 'hinten',
    sprite: { key: 'backgrounds/sprites/auto.png', x: 186, y: 72, depthY: 118 },
    comments: { schauan: 'say.prolog.vorgarten_auto', oeffne: 'say.prolog.vorgarten_auto_oeffne' },
  },
  {
    id: 'strasse',
    name: 'hotspot.strasse',
    area: rect(300, 106, 20, 34),
    walkTo: [306, 120],
    face: 'rechts',
    comments: { schauan: 'say.prolog.vorgarten_strasse' },
    exit: { room: 'stadtplan', at: [306, 120] },
  },
];

const tannenburg: RoomVariant = {
  when: (s) => s.timeline.tannenburg,
  background: 'backgrounds/vorgarten_1986_tannenburg.png',
  walkable: WALKABLE,
  scale: SCALE,
  hotspots: [
    ...COMMON,
    {
      id: 'zeitung',
      name: 'item.zeitung.name',
      area: rect(70, 110, 20, 12),
      walkTo: [80, 124],
      face: 'hinten',
      visible: (s) => !s.flags.zeitung_genommen,
      sprite: { key: 'backgrounds/sprites/zeitung.png', x: 72, y: 112 },
      comments: { schauan: 'say.k1.zeitung_rasen' },
      verbs: {
        nimm: pickup((g) => {
          g.setFlag('zeitung_genommen');
          g.addItem('zeitung');
        }),
      },
    },
    {
      id: 'werbetafel',
      name: 'hotspot.werbetafel',
      area: rect(200, 2, 72, 66),
      walkTo: [236, 122],
      face: 'hinten',
      comments: { schauan: 'say.prolog.vorgarten_werbetafel' },
    },
    {
      id: 'fabrik',
      name: 'hotspot.fabrik',
      area: rect(158, 44, 36, 42),
      walkTo: [176, 108],
      face: 'hinten',
      comments: { schauan: 'say.prolog.vorgarten_fabrik' },
    },
  ],
};

const normal: RoomVariant = {
  background: 'backgrounds/vorgarten_1986.png',
  walkable: WALKABLE,
  scale: SCALE,
  actors: [
    // Abgelenkt dreht Biff dem Auto den Rücken zu.
    { id: 'biff', x: 172, y: 112, face: 'links', visible: (s) => !!s.flags.jennifer_lenkt_ab },
    { id: 'biff', x: 172, y: 112, face: 'rechts' },
    { id: 'jennifer', x: 142, y: 116, face: 'rechts', visible: (s) => !!s.flags.jennifer_lenkt_ab },
    { id: 'einstein', x: 60, y: 126, face: 'rechts', visible: (s) => !!s.flags.einstein_folgt },
  ],
  hotspots: [
    ...COMMON,
    {
      id: 'nachbarhaus',
      name: 'hotspot.nachbarhaus',
      area: rect(256, 55, 40, 30),
      walkTo: [292, 108],
      face: 'hinten',
      comments: { schauan: 'say.prolog.vorgarten_nachbarhaus' },
    },
    {
      id: 'biff',
      name: 'hotspot.biff',
      area: rect(156, 48, 31, 65),
      walkTo: [146, 114],
      face: 'rechts',
      defaultVerb: 'redemit',
      verbs: {
        schauan: async (g) => {
          await g.say(g.state.chapter >= 4 ? 'say.k4.biff_schau' : 'say.prolog.vorgarten_biff');
        },
        redemit: async (g) => {
          await g.dialog('biff');
        },
      },
    },
    {
      id: 'wachsdose',
      name: 'item.wachsdose.name',
      area: rect(289, 111, 12, 10),
      walkTo: [295, 124],
      face: 'hinten',
      visible: (s) => s.chapter >= 4 && !s.flags.wachsdose_genommen,
      sprite: { key: 'backgrounds/sprites/wachsdose.png', x: 290, y: 112, depthY: 120 },
      comments: { schauan: 'say.k4.dose_schau' },
      verbs: {
        nimm: pickup((g) => {
          g.setFlag('wachsdose_genommen');
          g.addItem('wachsdose');
        }),
      },
    },
    {
      id: 'schluesselbund',
      name: 'hotspot.schluesselbund',
      area: rect(240, 77, 12, 14),
      walkTo: [246, 122],
      face: 'hinten',
      visible: (s) => s.chapter >= 4 && !s.flags.einstein_apportiert,
      sprite: { key: 'backgrounds/sprites/schluesselbund.png', x: 242, y: 79, depthY: 119 },
      comments: { schauan: 'say.k4.bund_schau' },
      verbs: {
        nimm: async (g) => {
          await g.say(g.getFlag('jennifer_lenkt_ab') ? 'say.k4.bund_zu_nah' : 'say.k4.bund_biff_schaut');
        },
      },
    },
    {
      id: 'einstein',
      name: 'hotspot.einstein',
      area: rect(46, 102, 28, 25),
      walkTo: [90, 128],
      face: 'links',
      defaultVerb: 'redemit',
      visible: (s) => !!s.flags.einstein_folgt && !s.flags.einstein_apportiert,
      comments: { schauan: 'say.k4.einstein_schau' },
      verbs: {
        redemit: async (g) => {
          if (!g.getFlag('jennifer_lenkt_ab')) {
            await g.say('say.k4.einstein_noch_nicht');
            return;
          }
          await g.cutscene(async () => {
            await g.say('say.k4.einstein_hol');
            await g.walkTo([246, 121], 'einstein', 3);
            await g.sayAs('biff', 'say.k4.biff_prahlt');
            await g.walkTo([60, 126], 'einstein', 3);
            g.setFlag('einstein_apportiert');
            await g.sayAs('einstein', 'say.prolog.einstein_bellt');
          });
        },
      },
    },
    {
      id: 'sendeschluessel',
      name: 'item.sendeschluessel.name',
      area: rect(46, 102, 28, 25),
      walkTo: [90, 128],
      face: 'links',
      visible: (s) => !!s.flags.einstein_apportiert && !s.flags.schluessel_genommen,
      comments: { schauan: 'say.k4.schluessel_schau' },
      verbs: {
        nimm: async (g) => {
          await g.playAnim('pickup');
          g.setFlag('schluessel_genommen');
          g.addItem('sendeschluessel');
          // Einstein bleibt in 1986: Er geht zurück ins Labor.
          g.setFlag('einstein_folgt', false);
          await g.say('say.k4.schluessel_genommen');
        },
      },
    },
    {
      id: 'veranda',
      name: 'hotspot.veranda',
      area: rect(6, 64, 38, 40),
      walkTo: [24, 108],
      face: 'links',
      visible: (s) => s.chapter >= 4,
      comments: { schauan: 'say.k4.veranda_schau' },
      exit: { room: 'veranda', at: [304, 112], face: 'links' },
    },
  ],
};

export const vorgarten: RoomDef = {
  id: 'vorgarten',
  name: 'room.vorgarten',
  eras: { 1986: [tannenburg, normal] },
};
