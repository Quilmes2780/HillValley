import type { Hotspot, Polygon, RoomVariant } from '../../engine/types';
import type { RoomDef } from '../../engine/types';
import { pickup, rect } from './util';

const SCALE = { yFar: 94, sFar: 0.88, yNear: 140, sNear: 1 };

/** Um das Auto herum: links, davor, rechts. */
const WALKABLE: readonly Polygon[] = [
  [[6, 94], [185, 94], [185, 140], [6, 140]],
  [[185, 106], [314, 106], [314, 140], [185, 140]],
  [[287, 94], [314, 94], [314, 106], [287, 106]],
];

const COMMON: readonly Hotspot[] = [
  {
    id: 'haus',
    name: 'hotspot.haus',
    area: [[0, 0], [46, 0], [46, 8], [143, 8], [155, 24], [148, 24], [148, 92], [0, 92]],
    walkTo: [60, 96],
    face: 'hinten',
    comments: { schauan: 'say.prolog.vorgarten_haus' },
  },
  {
    id: 'haustuer',
    name: 'hotspot.haustuer',
    area: rect(108, 44, 34, 48),
    walkTo: [125, 96],
    face: 'hinten',
    comments: { schauan: 'say.prolog.kueche_haustuer' },
    exit: { room: 'kueche', at: [288, 98], face: 'links' },
  },
  {
    id: 'briefkasten',
    name: 'hotspot.briefkasten',
    area: rect(147, 70, 14, 23),
    walkTo: [152, 96],
    face: 'hinten',
    comments: { schauan: 'say.prolog.vorgarten_briefkasten', oeffne: 'say.prolog.vorgarten_briefkasten_oeffne' },
  },
  {
    id: 'hecke',
    name: 'hotspot.hecke',
    area: rect(33, 77, 71, 15),
    walkTo: [68, 96],
    face: 'hinten',
    comments: { schauan: 'say.prolog.vorgarten_hecke' },
  },
  {
    id: 'gartenmauer',
    name: 'hotspot.gartenmauer',
    area: rect(161, 79, 159, 13),
    walkTo: [172, 96],
    face: 'hinten',
    comments: { schauan: 'say.prolog.vorgarten_mauer' },
  },
  {
    id: 'baum',
    name: 'hotspot.baum',
    area: [[253, 0], [320, 0], [320, 45], [311, 45], [311, 92], [298, 92], [298, 45], [253, 45]],
    walkTo: [305, 96],
    face: 'hinten',
    comments: { schauan: 'say.prolog.vorgarten_baum' },
  },
  {
    id: 'auto',
    name: 'hotspot.auto',
    area: rect(186, 60, 102, 44),
    walkTo: [236, 110],
    face: 'hinten',
    sprite: { key: 'backgrounds/sprites/auto.png', x: 186, y: 59, depthY: 104 },
    comments: { schauan: 'say.prolog.vorgarten_auto', oeffne: 'say.prolog.vorgarten_auto_oeffne' },
  },
  {
    id: 'strasse',
    name: 'hotspot.strasse',
    area: rect(300, 92, 20, 48),
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
      area: rect(76, 103, 20, 12),
      walkTo: [86, 118],
      face: 'hinten',
      visible: (s) => !s.flags.zeitung_genommen,
      sprite: { key: 'backgrounds/sprites/zeitung.png', x: 78, y: 105 },
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
      area: rect(188, 3, 106, 39),
      walkTo: [236, 110],
      face: 'hinten',
      comments: { schauan: 'say.prolog.vorgarten_werbetafel' },
    },
    {
      id: 'baeume',
      name: 'hotspot.baeume',
      area: rect(175, 44, 90, 16),
      walkTo: [176, 96],
      face: 'hinten',
      comments: { schauan: 'say.prolog.vorgarten_baeume' },
    },
    {
      id: 'fabrik',
      name: 'hotspot.fabrik',
      area: rect(147, 28, 28, 41),
      walkTo: [160, 96],
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
      id: 'baeume',
      name: 'hotspot.baeume',
      area: [[168, 28], [253, 28], [253, 45], [270, 45], [270, 60], [168, 60]],
      walkTo: [176, 96],
      face: 'hinten',
      comments: { schauan: 'say.prolog.vorgarten_baeume' },
    },
    {
      id: 'biff',
      name: 'hotspot.biff',
      area: rect(156, 55, 31, 58),
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
      area: rect(289, 100, 12, 10),
      walkTo: [292, 112],
      face: 'hinten',
      visible: (s) => s.chapter >= 4 && !s.flags.wachsdose_genommen,
      sprite: { key: 'backgrounds/sprites/wachsdose.png', x: 290, y: 101, depthY: 110 },
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
      area: rect(240, 68, 12, 14),
      walkTo: [246, 110],
      face: 'hinten',
      visible: (s) => s.chapter >= 4 && !s.flags.einstein_apportiert,
      sprite: { key: 'backgrounds/sprites/schluesselbund.png', x: 242, y: 70, depthY: 105 },
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
      area: rect(43, 99, 34, 28),
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
            await g.walkTo([246, 108], 'einstein', 3);
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
      area: rect(43, 99, 34, 28),
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
      area: rect(0, 57, 34, 36),
      walkTo: [18, 96],
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
