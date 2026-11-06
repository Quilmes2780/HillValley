import type { Exit, Hotspot, RoomDef, RoomVariant, Script } from '../../engine/types';
import { pickup, rect } from './util';

const WALKABLE: RoomVariant['walkable'] = [[[8, 92], [312, 92], [316, 140], [4, 140]]];
const SCALE = { yFar: 92, sFar: 0.88, yNear: 140, sNear: 1 };

const brett = (schau: string): Hotspot => ({
  id: 'brett',
  name: 'hotspot.schwarzes_brett',
  area: rect(78, 26, 30, 28),
  walkTo: [93, 96],
  face: 'hinten',
  comments: { schauan: schau },
});

// --- 1986 ------------------------------------------------------------------------------------

const zutritt: Exit['guard'] = async (g) => {
  if (g.getFlag('schule_zutritt')) return true;
  g.setFlag('strickland_gefragt');
  await g.sayAs('strickland', 'say.k1.strickland_nein');
  return false;
};

const hotspots1986: readonly Hotspot[] = [
  brett('say.k1.flur_brett'),
  {
    id: 'spinde',
    name: 'hotspot.spinde',
    area: rect(162, 26, 124, 62),
    walkTo: [224, 96],
    face: 'hinten',
    comments: { schauan: 'say.k1.flur_spinde', oeffne: 'say.k1.flur_spinde_oeffne' },
  },
  {
    id: 'bandraum',
    name: 'hotspot.tuer_bandraum',
    area: rect(34, 22, 38, 66),
    walkTo: [53, 96],
    face: 'hinten',
    comments: { schauan: 'say.k1.flur_bandraum' },
    exit: { room: 'bandraum', at: [287, 100], face: 'links', guard: zutritt },
  },
  {
    id: 'zeitung_tuer',
    name: 'hotspot.tuer_zeitung',
    area: rect(114, 22, 38, 66),
    walkTo: [133, 96],
    face: 'hinten',
    comments: { schauan: 'say.k1.flur_zeitung' },
    exit: { room: 'schuelerzeitung', at: [34, 100], face: 'rechts', guard: zutritt },
  },
  {
    id: 'ausgang',
    name: 'hotspot.ausgang',
    area: rect(292, 20, 28, 68),
    walkTo: [306, 96],
    face: 'rechts',
    exit: { room: 'stadtplan', at: [306, 100] },
  },
  {
    id: 'strickland',
    name: 'hotspot.strickland',
    area: rect(186, 60, 28, 50),
    walkTo: [226, 112],
    face: 'links',
    defaultVerb: 'redemit',
    comments: { schauan: 'say.k1.strickland_schau' },
    verbs: {
      redemit: async (g) => {
        if (g.getFlag('schule_zutritt')) {
          await g.sayAs('strickland', 'say.k1.strickland_danach');
          return;
        }
        g.setFlag('strickland_gefragt');
        await g.sayAs('strickland', 'say.k1.strickland_nein');
      },
    },
    useWith: {
      entschuldigung: async (g) => {
        g.removeItem('entschuldigung');
        g.setFlag('schule_zutritt');
        await g.sayAs('strickland', 'say.k1.strickland_ok');
      },
    },
  },
];

// --- 1955 ------------------------------------------------------------------------------------

/** Biff jagt Doc über die Straße und landet im Mistlaster. */
const verfolgung: Script = async (g) => {
  await g.cutscene(async () => {
    await g.goToRoom('strasse_mist', 1955, [60, 116], 'rechts');
    await g.sayAs('biff_jung', 'say.k2.biff_he');
    await g.walkTo([262, 126], undefined, 2);
    await g.walkTo([236, 100], 'biff_jung', 2.5);
    g.setFlag('biff_im_mist');
    g.shake(300);
    await g.sayAs('biff_jung', 'say.k2.biff_mist');
    await g.say('say.k2.nach_mist');
  });
};

const hotspots1955: readonly Hotspot[] = [
  brett('say.k2.flur_brett'),
  {
    id: 'spinde',
    name: 'hotspot.spinde',
    area: rect(162, 26, 38, 62),
    walkTo: [180, 96],
    face: 'hinten',
    comments: { schauan: 'say.k2.flur_spinde', oeffne: 'say.k2.flur_spinde_oeffne' },
  },
  {
    id: 'klassen',
    name: 'hotspot.klassenzimmer',
    area: rect(34, 22, 38, 66),
    walkTo: [53, 96],
    face: 'hinten',
    comments: { default: 'say.k2.flur_klasse', schauan: 'say.k2.flur_klasse' },
  },
  {
    id: 'biffs_spind',
    name: 'hotspot.biffs_spind',
    area: rect(258, 26, 22, 62),
    walkTo: [268, 96],
    face: 'hinten',
    defaultVerb: 'oeffne',
    sprite: { key: 'backgrounds/sprites/spind_offen.png', x: 258, y: 26, when: (s) => !!s.flags.spind_offen },
    comments: { schauan: 'say.k2.spind_schau' },
    verbs: {
      oeffne: async (g) => {
        if (g.getFlag('spind_offen')) await g.say('say.k2.spind_schon_offen');
        else if (!g.getFlag('strickland_weg')) await g.say('say.k2.spind_strickland');
        else if (!g.hasItem('zettel')) await g.say('say.k2.spind_kombination');
        else {
          g.setFlag('spind_offen');
          await g.say('say.k2.spind_auf');
        }
      },
    },
  },
  {
    id: 'mappe',
    name: 'item.mappe.name',
    area: rect(260, 42, 18, 14),
    walkTo: [268, 96],
    face: 'hinten',
    visible: (s) => !!s.flags.spind_offen && !s.flags.mappe_genommen,
    sprite: { key: 'backgrounds/sprites/mappe.png', x: 262, y: 44 },
    comments: { schauan: 'say.k2.mappe_schau' },
    verbs: {
      nimm: pickup((g) => {
        g.setFlag('mappe_genommen');
        g.addItem('mappe');
      }),
    },
  },
  {
    id: 'ausgang',
    name: 'hotspot.ausgang',
    area: rect(292, 20, 28, 68),
    walkTo: [306, 96],
    face: 'rechts',
    exit: {
      room: 'stadtplan',
      at: [306, 100],
      guard: async (g) => {
        if (!g.hasItem('mappe') || g.getFlag('biff_im_mist')) return true;
        await verfolgung(g);
        return false;
      },
    },
  },
  {
    id: 'george',
    name: 'hotspot.george',
    area: rect(96, 58, 28, 50),
    walkTo: [134, 110],
    face: 'links',
    defaultVerb: 'redemit',
    comments: { schauan: 'say.k2.george_schau' },
    verbs: {
      redemit: async (g) => {
        await g.dialog('george');
      },
    },
  },
  {
    id: 'strickland',
    name: 'hotspot.strickland',
    area: rect(254, 60, 28, 50),
    walkTo: [226, 112],
    face: 'rechts',
    defaultVerb: 'redemit',
    visible: (s) => !s.flags.strickland_weg,
    comments: { schauan: 'say.k2.strickland_schau' },
    verbs: {
      redemit: async (g) => {
        await g.sayAs('strickland', 'say.k2.strickland_rede');
      },
    },
    useWith: {
      hausaufgabe: async (g) => {
        g.removeItem('hausaufgabe');
        await g.sayAs('strickland', 'say.k2.strickland_handschrift');
        await g.walkTo([312, 104], 'strickland', 2);
        g.setFlag('strickland_weg');
      },
    },
  },
];

export const schuleFlur: RoomDef = {
  id: 'schule_flur',
  name: 'room.schule_flur',
  eras: {
    1986: [
      {
        background: 'backgrounds/schule_flur_1986.png',
        walkable: WALKABLE,
        scale: SCALE,
        actors: [{ id: 'strickland', x: 200, y: 110, face: 'vorne' }],
        hotspots: hotspots1986,
      },
    ],
    1955: [
      {
        background: 'backgrounds/schule_flur_1955.png',
        walkable: WALKABLE,
        scale: SCALE,
        actors: [
          { id: 'george_jung', x: 110, y: 108, face: 'rechts' },
          { id: 'strickland', x: 268, y: 110, face: 'vorne', visible: (s) => !s.flags.strickland_weg },
        ],
        hotspots: hotspots1955,
      },
    ],
  },
};
