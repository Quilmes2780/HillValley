import type { Hotspot, RoomDef, RoomVariant, Script } from '../../engine/types';
import { zugFaehrtAb } from '../szenen';
import { rect } from './util';

const SCALE = { yFar: 94, sFar: 0.86, yNear: 140, sNear: 1 };
const WALKABLE: RoomVariant['walkable'] = [[[6, 94], [314, 94], [316, 140], [4, 140]]];

const STRASSE: Hotspot = {
  id: 'strasse',
  name: 'hotspot.strasse',
  area: rect(300, 92, 20, 48),
  walkTo: [306, 120],
  face: 'rechts',
  comments: { schauan: 'say.k1.platz_strasse' },
  exit: { room: 'stadtplan', at: [306, 120] },
};

const GRUNDSTEIN: Hotspot = {
  id: 'grundstein',
  name: 'hotspot.grundstein',
  area: rect(104, 80, 18, 12),
  walkTo: [113, 96],
  face: 'hinten',
  comments: { default: 'say.k1.grundstein', schauan: 'say.k1.grundstein' },
};

/** Biffs Gebrüll schallt über den Platz: Der Wachmann gehorcht, der Turm ist frei. */
const abspielen: Script = async (g) => {
  if (!g.getFlag('kassette_eingelegt')) {
    await g.say('say.k1.diktier_leer');
    return;
  }
  if (g.getFlag('kowalski_weg')) {
    await g.say('say.k1.diktier_nochmal');
    return;
  }
  await g.cutscene(async () => {
    g.shake(600);
    await g.sayAs('biff', 'say.k1.gebruell');
    await g.sayAs('kowalski', 'say.k1.kowalski_jawohl');
    await g.walkTo([312, 124], 'kowalski', 3);
    g.setFlag('kowalski_weg');
    await g.say('say.k1.turm_frei');
  });
};

const kabelAnschliessen: Script = async (g) => {
  if (!g.getFlag('kasten_offen')) {
    await g.say('say.k1.kasten_zu');
    return;
  }
  g.removeItem('kabel');
  g.setFlag('kabel_angeschlossen');
  await g.say('say.k1.kabel_dran');
};

const geraetAnschliessen: Script = async (g) => {
  if (!g.getFlag('kabel_angeschlossen')) {
    await g.say('say.k1.erst_kabel');
    return;
  }
  g.removeItem('diktiergeraet');
  g.setFlag('diktiergeraet_angeschlossen');
  await g.say('say.k1.geraet_dran');
};

/** Der Grundstein 1986: massiv, bis Doc 1885 etwas darin eingemauert hat (Kapitel 3). */
const GRUNDSTEIN_1986: Hotspot = {
  ...GRUNDSTEIN,
  comments: { nimm: 'say.k3.grundstein_nimm' },
  sprite: {
    key: 'backgrounds/sprites/grundstein_auf.png',
    x: 104,
    y: 80,
    when: (s) => !!s.flags.grundstein_aufgebrochen,
  },
  verbs: {
    schauan: async (g) => {
      if (g.getFlag('grundstein_aufgebrochen')) await g.say('say.k3.platz_grundstein_auf');
      else if (g.getFlag('grundstein_zu')) await g.say('say.k3.platz_grundstein_inschrift');
      else await g.say('say.k1.grundstein');
    },
  },
  useWith: {
    brecheisen: async (g) => {
      if (!g.getFlag('grundstein_zu')) {
        await g.say('say.k3.platz_grundstein_massiv');
        return;
      }
      if (g.getFlag('grundstein_aufgebrochen')) {
        await g.say('say.k3.platz_grundstein_schon');
        return;
      }
      g.shake(300);
      g.setFlag('grundstein_aufgebrochen');
      await g.say('say.k3.platz_grundstein_bricht');
    },
  },
};

const hotspots1986: readonly Hotspot[] = [
  STRASSE,
  GRUNDSTEIN_1986,
  {
    id: 'gelber_brief',
    name: 'item.vergilbter_brief.name',
    area: rect(106, 82, 14, 8),
    walkTo: [113, 96],
    face: 'hinten',
    visible: (s) => !!s.flags.grundstein_aufgebrochen && !s.flags.gelber_brief_genommen,
    sprite: { key: 'backgrounds/sprites/gelber_brief.png', x: 108, y: 83 },
    comments: { schauan: 'say.k3.platz_brief_schau' },
    verbs: {
      nimm: async (g) => {
        await g.playAnim('pickup');
        g.setFlag('gelber_brief_genommen');
        g.addItem('vergilbter_brief');
      },
    },
  },
  {
    id: 'zeitzug',
    name: 'hotspot.zeitzug',
    area: rect(120, 68, 180, 72),
    walkTo: [296, 122],
    face: 'links',
    visible: (s) => !!s.flags.zug_da,
    sprite: { key: 'characters/zeitzug/zeitzug.png', x: 120, y: 64, depthY: 139 },
    comments: { schauan: 'say.k4.zug_schau', benutze: 'say.k4.zug_benutze', oeffne: 'say.k4.zug_benutze' },
  },
  {
    id: 'doc',
    name: 'hotspot.doc',
    area: rect(84, 58, 32, 64),
    walkTo: [132, 124],
    face: 'links',
    defaultVerb: 'redemit',
    visible: (s) => !!s.flags.zug_da,
    comments: { schauan: 'say.k4.doc_schau' },
    verbs: {
      redemit: async (g) => {
        if (g.getFlag('fusion_an_doc')) await g.sayAs('doc', 'say.k4.doc_ziel');
        else await g.sayAs('doc', 'say.k4.doc_energie');
      },
    },
    useWith: {
      mr_fusion: async (g) => {
        if (!g.getFlag('fusion_gefuettert')) {
          await g.sayAs('doc', 'say.k4.doc_fusion_leer');
          return;
        }
        g.removeItem('mr_fusion');
        g.setFlag('fusion_an_doc');
        await g.sayAs('doc', 'say.k4.doc_fusion_voll');
      },
      brief_2015: async (g) => {
        if (!g.getFlag('fusion_an_doc')) {
          await g.sayAs('doc', 'say.k4.doc_erst_energie');
          return;
        }
        g.removeItem('brief_2015');
        await g.sayAs('doc', 'say.k4.doc_ziel_gesetzt');
        await g.cutscene(async () => {
          await g.say('say.k4.abreise_1');
          await g.sayAs('jennifer', 'say.k4.abreise_2');
          await g.walkTo([268, 124], undefined, 2);
          g.hideActor();
          g.hideActor('doc');
          await zugFaehrtAb(g, 'zeitzug', [272, 68], [220, 0], 110, [130, 136], [1986, 2015]);
          await g.showCard('chapter.k5.title', 'chapter.k5.subtitle');
          g.state.chapter = 5;
          g.state.characters.doc = { room: 'turmplatz', era: 2015, x: 200, y: 118, face: 'links', inventory: [] };
          await g.goToRoom('turmplatz', 2015, [60, 120], 'rechts');
          await g.say('say.k5.ankunft');
          await g.say('say.k5.ziel');
        });
      },
    },
  },
  {
    id: 'bank',
    name: 'hotspot.bank',
    area: rect(232, 44, 66, 48),
    walkTo: [265, 96],
    face: 'hinten',
    comments: { schauan: 'say.k1.platz_bank', oeffne: 'say.k1.platz_bank_oeffne' },
  },
  {
    id: 'saeule',
    name: 'hotspot.saeule',
    area: rect(34, 18, 22, 74),
    walkTo: [45, 96],
    face: 'hinten',
    verbs: {
      schauan: async (g) => {
        await g.say('say.k1.saeule');
        if (g.state.timeline.tannenburg && !g.getFlag('kowalski_weg')) {
          await g.sayAs('biff', 'say.k1.durchsage');
          await g.sayAs('kowalski', 'say.k1.kowalski_zuckt');
        }
      },
    },
    useWith: { kabel: kabelAnschliessen },
  },
  {
    id: 'anschlusskasten',
    name: 'hotspot.anschlusskasten',
    area: rect(39, 64, 12, 13),
    walkTo: [45, 96],
    face: 'hinten',
    defaultVerb: 'oeffne',
    sprite: {
      key: 'backgrounds/sprites/kasten_offen.png',
      x: 39,
      y: 65,
      when: (s) => !!s.flags.kasten_offen,
    },
    comments: { schauan: 'say.k1.kasten' },
    verbs: {
      oeffne: async (g) => {
        if (g.getFlag('kasten_offen')) await g.say('say.k1.schon_offen');
        else {
          g.setFlag('kasten_offen');
          await g.say('say.k1.kasten_auf');
        }
      },
      schliesse: async (g) => {
        await g.say(g.getFlag('kabel_angeschlossen') ? 'say.k1.kasten_bleibt' : 'say.k1.kasten_lieber_auf');
      },
    },
    useWith: { kabel: kabelAnschliessen, diktiergeraet: geraetAnschliessen },
  },
  {
    id: 'verl_kabel',
    name: 'item.kabel.name',
    area: rect(38, 77, 28, 18),
    walkTo: [60, 100],
    face: 'links',
    visible: (s) => !!s.flags.kabel_angeschlossen,
    sprite: { key: 'backgrounds/sprites/kabel_kasten.png', x: 42, y: 74 },
    comments: { schauan: 'say.k1.kabel_schau', nimm: 'say.k1.kabel_bleibt' },
    useWith: { diktiergeraet: geraetAnschliessen },
  },
  {
    id: 'diktiergeraet',
    name: 'item.diktiergeraet.name',
    area: rect(62, 95, 18, 13),
    walkTo: [74, 110],
    face: 'hinten',
    defaultVerb: 'druecke',
    visible: (s) => !!s.flags.diktiergeraet_angeschlossen,
    sprite: { key: 'backgrounds/sprites/diktiergeraet.png', x: 64, y: 96, depthY: 106 },
    comments: { schauan: 'say.k1.diktier_schau', nimm: 'say.k1.diktier_bleibt' },
    verbs: { druecke: abspielen, benutze: abspielen },
    useWith: {
      kassette: async (g) => {
        g.removeItem('kassette');
        g.setFlag('kassette_eingelegt');
        await g.say('say.k1.kassette_drin');
      },
    },
  },
  {
    id: 'turmtuer',
    name: 'hotspot.turmtuer',
    area: rect(144, 58, 30, 34),
    walkTo: [160, 96],
    face: 'hinten',
    comments: { schauan: 'say.k1.platz_tuer' },
    exit: {
      room: 'turmeingang',
      at: [34, 100],
      face: 'rechts',
      guard: async (g) => {
        if (g.getFlag('kowalski_weg')) return true;
        await g.sayAs('kowalski', 'say.k1.kowalski_halt');
        return false;
      },
    },
  },
  {
    id: 'kowalski',
    name: 'hotspot.kowalski',
    area: rect(170, 42, 32, 64),
    walkTo: [204, 108],
    face: 'links',
    defaultVerb: 'redemit',
    visible: (s) => !s.flags.kowalski_weg,
    comments: { schauan: 'say.k1.kowalski_schau' },
    verbs: {
      redemit: async (g) => {
        await g.dialog('kowalski');
      },
    },
  },
];

const ACTORS: RoomVariant['actors'] = [
  { id: 'kowalski', x: 186, y: 106, face: 'vorne', visible: (s) => !s.flags.kowalski_weg },
];

const platz1955: RoomVariant = {
  background: 'backgrounds/rathausplatz_1955.png',
  walkable: WALKABLE,
  scale: SCALE,
  hotspots: [
    { ...STRASSE, comments: { schauan: 'say.k2.platz_strasse' } },
    { ...GRUNDSTEIN, comments: { default: 'say.k2.grundstein', schauan: 'say.k2.grundstein' } },
    {
      id: 'turmuhr',
      name: 'hotspot.turmuhr',
      area: rect(148, 12, 24, 20),
      walkTo: [160, 96],
      face: 'hinten',
      comments: { schauan: 'say.k2.platz_uhr' },
    },
    {
      id: 'turmtuer',
      name: 'hotspot.turmtuer',
      area: rect(144, 58, 30, 34),
      walkTo: [160, 96],
      face: 'hinten',
      comments: { schauan: 'say.k2.platz_tuer' },
      exit: { room: 'uhrwerk', at: [24, 100], face: 'rechts' },
    },
    {
      id: 'cafe',
      name: 'hotspot.cafe',
      area: rect(38, 54, 26, 38),
      walkTo: [51, 96],
      face: 'hinten',
      comments: { schauan: 'say.k2.platz_cafe' },
      exit: { room: 'cafe', at: [24, 108], face: 'rechts' },
    },
    {
      id: 'radioladen',
      name: 'hotspot.radioladen',
      area: rect(252, 54, 26, 38),
      walkTo: [265, 96],
      face: 'hinten',
      comments: { schauan: 'say.k2.platz_radio' },
      exit: { room: 'radioladen', at: [287, 108], face: 'links' },
    },
  ],
};

export const rathausplatz: RoomDef = {
  id: 'rathausplatz',
  name: 'room.rathausplatz',
  eras: {
    1986: [
      {
        when: (s) => s.timeline.tannenburg,
        background: 'backgrounds/rathausplatz_1986_tannenburg.png',
        walkable: WALKABLE,
        scale: SCALE,
        actors: ACTORS,
        hotspots: hotspots1986,
      },
      {
        background: 'backgrounds/rathausplatz_1986.png',
        walkable: WALKABLE,
        scale: SCALE,
        actors: ACTORS,
        hotspots: hotspots1986,
      },
    ],
    1955: [platz1955],
  },
};
