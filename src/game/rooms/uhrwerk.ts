import type { Hotspot, RoomDef, RoomVariant, Script, ScriptApi } from '../../engine/types';
import { rect } from './util';

const WALKABLE: RoomVariant['walkable'] = [[[8, 92], [312, 92], [316, 140], [4, 140]]];
const SCALE = { yFar: 92, sFar: 0.88, yNear: 140, sNear: 1 };

const zahnraeder = (schau: string): Hotspot => ({
  id: 'zahnraeder',
  name: 'hotspot.zahnraeder',
  area: rect(34, 12, 94, 66),
  walkTo: [80, 96],
  face: 'hinten',
  comments: { schauan: schau, benutze: 'say.k1.zahnrad_benutze', nimm: 'say.k1.zahnrad_nimm' },
});

const zifferblatt = (schau: string): Hotspot => ({
  id: 'zifferblatt',
  name: 'hotspot.zifferblatt',
  area: rect(134, 6, 62, 52),
  walkTo: [165, 96],
  face: 'hinten',
  comments: { schauan: schau },
});

// --- Kapitel 1: der Notbetrieb ---------------------------------------------------------------

const fusionEinbauen: Script = async (g) => {
  g.removeItem('mr_fusion');
  g.setFlag('fusion_eingebaut');
  await g.say('say.k1.fusion_ohne_futter');
};

const fuettern: Script = async (g) => {
  if (!g.getFlag('fusion_eingebaut')) {
    await g.say('say.k1.schale_erst_fusion');
    return;
  }
  g.removeItem('bananenschale');
  g.state.chronopost.mode = 'notbetrieb';
  g.state.chronopost.year = 1955;
  g.flash(150);
  await g.say('say.k1.notbetrieb_an');
};

const briefEinwerfen: Script = async (g) => {
  if (g.state.chronopost.mode === 'aus') {
    await g.say('say.k1.brief_kein_strom');
    return;
  }
  g.removeItem('brief_an_doc');
  g.setFlag('brief_im_schlitz');
  await g.say('say.k1.brief_drin');
};

/** Der Lichtblitz: Der Brief reist nach 1955, das Spiel wechselt zum jungen Doc. */
async function kapitel2Starten(g: ScriptApi): Promise<void> {
  await g.cutscene(async () => {
    await g.say('say.k1.hebel_los');
    g.flash(700);
    g.shake(700);
    await g.wait(900);
    g.setFlag('brief_im_schlitz', false);
    g.setFlag('brief_gesendet');
    await g.say('say.k1.brief_weg');
    await g.showCard('chapter.k2.title', 'chapter.k2.subtitle');
    g.state.chapter = 2;
    await g.switchCharacter('doc_jung');
    await g.goToRoom('uhrwerk', 1955, [165, 100], 'hinten');
    await g.say('say.k2.intro_1');
    g.flash(300);
    await g.say('say.k2.intro_2');
    g.addItem('brief_von_marty');
    await g.say('say.k2.intro_3');
    await g.say('say.k2.intro_4');
  });
}

const hotspots1986: readonly Hotspot[] = [
  zahnraeder('say.k1.zahnrad_schau'),
  zifferblatt('say.k1.zifferblatt'),
  {
    id: 'chronopost',
    name: 'hotspot.chronopost',
    area: rect(206, 46, 60, 42),
    walkTo: [236, 96],
    face: 'hinten',
    sprite: {
      key: 'backgrounds/sprites/chronopost_lampe.png',
      x: 216,
      y: 60,
      when: (s) => s.chronopost.mode !== 'aus',
    },
    verbs: {
      schauan: async (g) => {
        g.setFlag('chronopost_gesehen');
        await g.say('say.k1.chronopost_schau');
        if (g.state.chronopost.mode !== 'aus') await g.say('say.k1.chronopost_summt');
      },
    },
    comments: { oeffne: 'say.k1.chronopost_oeffne', nimm: 'say.k1.chronopost_nimm' },
    useWith: {
      mr_fusion: fusionEinbauen,
      bananenschale: fuettern,
      brief_an_doc: briefEinwerfen,
    },
  },
  {
    id: 'waehlrad',
    name: 'hotspot.waehlrad',
    area: rect(238, 54, 16, 16),
    walkTo: [246, 96],
    face: 'hinten',
    comments: { schauan: 'say.k1.waehlrad', druecke: 'say.k1.waehlrad_druecke' },
  },
  {
    id: 'fusion_im_kasten',
    name: 'item.mr_fusion.name',
    area: rect(214, 28, 16, 18),
    walkTo: [222, 96],
    face: 'hinten',
    visible: (s) => !!s.flags.fusion_eingebaut,
    sprite: { key: 'backgrounds/sprites/mr_fusion.png', x: 216, y: 30 },
    comments: { schauan: 'say.k1.fusion_schau', ziehe: 'say.k1.fusion_bleibt', nimm: 'say.k1.fusion_bleibt' },
    useWith: { bananenschale: fuettern },
  },
  {
    id: 'sendehebel',
    name: 'hotspot.sendehebel',
    area: rect(267, 42, 14, 30),
    walkTo: [272, 96],
    face: 'hinten',
    defaultVerb: 'ziehe',
    comments: { schauan: 'say.k1.hebel_schau' },
    verbs: {
      ziehe: async (g) => {
        if (g.state.chronopost.mode === 'aus') await g.say('say.k1.hebel_kein_strom');
        else if (!g.getFlag('brief_im_schlitz')) await g.say('say.k1.hebel_kein_brief');
        else await kapitel2Starten(g);
      },
    },
  },
  {
    id: 'treppe',
    name: 'hotspot.treppe_runter',
    area: rect(4, 34, 26, 54),
    walkTo: [18, 96],
    face: 'links',
    exit: { room: 'turmeingang', at: [278, 100], face: 'links' },
  },
];

// --- Kapitel 2, Abschnitt C: der Verstärker --------------------------------------------------

/** Doc findet die Messingplatte: Ein älteres Ich sitzt 1885 fest. Kapitel 3 beginnt. */
const verstaerkerEinbauen: Script = async (g) => {
  if (!g.getFlag('mappe_verbrannt')) {
    await g.say('say.k2.verstaerker_erst_mappe');
    return;
  }
  g.removeItem('verstaerker');
  g.setFlag('verstaerker_eingebaut');
  g.state.chronopost.mode = 'verstaerkt';
  await g.cutscene(async () => {
    g.flash(300);
    await g.say('say.k2.platte_1');
    await g.say('say.k2.platte_2');
    await g.say('say.k2.platte_3');
    await g.say('say.k2.platte_4');
    await g.showCard('chapter.k3.title', 'chapter.k3.subtitle');
    g.state.chapter = 3;
    g.unlockCharacter('marty');
    g.unlockCharacter('doc_jung');
    await g.say('say.k2.k3_noch_nicht');
  });
};

const hotspots1955: readonly Hotspot[] = [
  zahnraeder('say.k2.zahnrad_schau'),
  zifferblatt('say.k2.zifferblatt'),
  {
    id: 'chronopost',
    name: 'hotspot.messingkasten',
    area: rect(206, 46, 60, 42),
    walkTo: [236, 96],
    face: 'hinten',
    sprite: {
      key: 'backgrounds/sprites/chronopost_lampe.png',
      x: 216,
      y: 60,
      when: (s) => !!s.flags.verstaerker_eingebaut,
    },
    comments: { schauan: 'say.k2.kasten_schau', oeffne: 'say.k2.kasten_oeffne' },
    useWith: { verstaerker: verstaerkerEinbauen },
  },
  {
    id: 'sendehebel',
    name: 'hotspot.sendehebel',
    area: rect(267, 42, 14, 30),
    walkTo: [272, 96],
    face: 'hinten',
    comments: { schauan: 'say.k2.hebel_schau', ziehe: 'say.k2.hebel_ziehe' },
  },
  {
    id: 'treppe',
    name: 'hotspot.treppe_runter',
    area: rect(4, 34, 26, 54),
    walkTo: [18, 96],
    face: 'links',
    exit: { room: 'rathausplatz', at: [160, 102], face: 'vorne' },
  },
];

export const uhrwerk: RoomDef = {
  id: 'uhrwerk',
  name: 'room.uhrwerk',
  eras: {
    1986: [{ background: 'backgrounds/uhrwerk_1986.png', walkable: WALKABLE, scale: SCALE, hotspots: hotspots1986 }],
    1955: [{ background: 'backgrounds/uhrwerk_1955.png', walkable: WALKABLE, scale: SCALE, hotspots: hotspots1955 }],
  },
};
