import type { Era } from '../../engine/types';
import type { Hotspot, RoomDef, RoomVariant, Script, ScriptApi } from '../../engine/types';
import { pickup, rect } from './util';

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

const empfangsfach = (schau: string): Hotspot => ({
  id: 'empfangsfach',
  name: 'hotspot.empfangsfach',
  area: rect(212, 72, 22, 10),
  walkTo: [224, 96],
  face: 'hinten',
  comments: { schauan: schau, oeffne: schau },
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
    g.sfx('senden');
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

// --- Kapitel 3: die Sicherung nach 1885 ------------------------------------------------------

const sicherungEinwerfen: Script = async (g) => {
  if (g.state.chronopost.year !== 1885) {
    await g.say('say.k3.sicherung_falsches_jahr');
    return;
  }
  g.removeItem('sicherung');
  g.setFlag('sicherung_im_schlitz');
  await g.say('say.k3.sicherung_drin');
};

const sicherungSenden = async (g: ScriptApi): Promise<void> => {
  g.sfx('senden');
  g.flash(400);
  g.shake(300);
  g.setFlag('sicherung_im_schlitz', false);
  g.setFlag('sicherung_gesendet');
  await g.say('say.k3.sicherung_weg');
};

/** Das Wählrad dreht weiter: Verstärker erlaubt 1955 und 1885, der Schlüssel alle Jahre. */
const waehlradDrehen: Script = async (g) => {
  const post = g.state.chronopost;
  if (post.mode === 'aus' || post.mode === 'notbetrieb') {
    await g.say('say.k1.waehlrad_druecke');
    return;
  }
  const jahre: readonly Era[] = post.mode === 'schluessel' ? [1885, 1955, 2015] : [1955, 1885];
  post.year = jahre[(jahre.indexOf(post.year) + 1) % jahre.length];
  await g.say('say.k3.waehlrad_jahr', { jahr: post.year });
};

// --- Kapitel 4: der Schlüssel und Docs Rückkehr ----------------------------------------------

const schluesselEinsetzen: Script = async (g) => {
  g.removeItem('sendeschluessel');
  g.setFlag('schluessel_eingesetzt');
  g.state.chronopost.mode = 'schluessel';
  g.flash(150);
  await g.say('say.k4.schluessel_drin');
};

/** Sobald der Brief aus 2015 und Mr. Fusion heraus sind, kommt Doc zurück. */
async function vielleichtAnkunft(g: ScriptApi): Promise<void> {
  if (!g.getFlag('brief_2015_genommen') || g.getFlag('fusion_eingebaut') || g.getFlag('zug_da')) return;
  await g.cutscene(async () => {
    await g.say('say.k4.ankunft_1');
    await g.goToRoom('rathausplatz', 1986, [296, 122], 'links');
    await g.say('say.k4.ankunft_2');
    g.flash(600);
    g.shake(700);
    g.setFlag('zug_da');
    g.state.characters.doc = { room: 'rathausplatz', era: 1986, x: 100, y: 122, face: 'rechts', inventory: [] };
    await g.goToRoom('rathausplatz', 1986);
    await g.sayAs('doc', 'say.k4.ankunft_3');
    await g.say('say.k4.ankunft_4');
    await g.say('say.k4.ankunft_5');
    await g.sayAs('doc', 'say.k4.ankunft_6');
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
        if (g.state.chronopost.mode !== 'aus') {
          await g.say('say.k3.chronopost_jahr', { jahr: g.state.chronopost.year });
        }
      },
    },
    comments: { oeffne: 'say.k1.chronopost_oeffne', nimm: 'say.k1.chronopost_nimm' },
    useWith: {
      mr_fusion: fusionEinbauen,
      bananenschale: fuettern,
      brief_an_doc: briefEinwerfen,
      sicherung: sicherungEinwerfen,
      sendeschluessel: schluesselEinsetzen,
    },
  },
  empfangsfach('say.k3.fach_leer'),
  {
    id: 'brief_2015',
    name: 'item.brief_2015.name',
    area: rect(212, 70, 22, 12),
    walkTo: [224, 96],
    face: 'hinten',
    visible: (s) => !!s.flags.schluessel_eingesetzt && !s.flags.brief_2015_genommen,
    sprite: { key: 'backgrounds/sprites/brief_fach.png', x: 216, y: 74 },
    comments: { schauan: 'say.k4.fach_blinkt' },
    verbs: {
      nimm: async (g) => {
        await g.playAnim('pickup');
        g.setFlag('brief_2015_genommen');
        g.addItem('brief_2015');
        await g.say('say.k4.brief_2015_gelesen');
        await vielleichtAnkunft(g);
      },
    },
  },
  {
    id: 'waehlrad',
    name: 'hotspot.waehlrad',
    area: rect(238, 54, 16, 16),
    walkTo: [246, 96],
    face: 'hinten',
    defaultVerb: 'druecke',
    comments: { schauan: 'say.k1.waehlrad' },
    verbs: { druecke: waehlradDrehen, benutze: waehlradDrehen },
  },
  {
    id: 'fusion_im_kasten',
    name: 'item.mr_fusion.name',
    area: rect(214, 28, 16, 18),
    walkTo: [222, 96],
    face: 'hinten',
    visible: (s) => !!s.flags.fusion_eingebaut,
    sprite: { key: 'backgrounds/sprites/mr_fusion.png', x: 216, y: 30 },
    comments: { schauan: 'say.k1.fusion_schau', nimm: 'say.k1.fusion_bleibt' },
    verbs: {
      ziehe: async (g) => {
        if (!g.getFlag('schluessel_eingesetzt')) {
          await g.say('say.k1.fusion_bleibt');
          return;
        }
        g.setFlag('fusion_eingebaut', false);
        g.addItem('mr_fusion');
        await g.say('say.k4.fusion_raus');
        await vielleichtAnkunft(g);
      },
    },
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
        else if (g.getFlag('brief_im_schlitz')) await kapitel2Starten(g);
        else if (g.getFlag('sicherung_im_schlitz')) await sicherungSenden(g);
        else await g.say('say.k1.hebel_kein_brief');
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
    g.sfx('senden');
    g.flash(300);
    await g.say('say.k2.platte_1');
    await g.say('say.k2.platte_2');
    await g.say('say.k2.platte_3');
    await g.say('say.k2.platte_4');
    await g.showCard('chapter.k3.title', 'chapter.k3.subtitle');
    g.state.chapter = 3;
    g.unlockCharacter('marty');
    g.unlockCharacter('doc_jung');
    g.unlockCharacter('doc');
    await g.switchCharacter('doc');
    await g.goToRoom('abstellgleis', 1885, [150, 120], 'hinten');
    await g.say('say.k3.intro_1');
    await g.say('say.k3.intro_2');
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
  empfangsfach('say.k3.fach_leer_1955'),
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

// --- 1885: das Gerüst ------------------------------------------------------------------------

const hotspots1885: readonly Hotspot[] = [
  {
    id: 'kiste',
    name: 'hotspot.kiste_zahnraeder',
    area: rect(52, 46, 44, 42),
    walkTo: [74, 96],
    face: 'hinten',
    comments: { schauan: 'say.k3.geruest_kiste', nimm: 'say.k1.zahnrad_nimm' },
  },
  zifferblatt('say.k3.geruest_zifferblatt'),
  {
    id: 'chronopost',
    name: 'hotspot.chronopost',
    area: rect(206, 46, 60, 42),
    walkTo: [236, 96],
    face: 'hinten',
    comments: { schauan: 'say.k3.geruest_chronopost', oeffne: 'say.k3.geruest_chronopost_oeffne' },
  },
  empfangsfach('say.k3.fach_leer_1885'),
  {
    id: 'sicherung_fach',
    name: 'item.sicherung.name',
    area: rect(212, 70, 22, 12),
    walkTo: [224, 96],
    face: 'hinten',
    visible: (s) => !!s.flags.sicherung_gesendet && !s.flags.sicherung_abgeholt,
    sprite: { key: 'backgrounds/sprites/sicherung_fach.png', x: 217, y: 74 },
    comments: { schauan: 'say.k3.fach_sicherung' },
    verbs: {
      nimm: pickup((g) => {
        g.setFlag('sicherung_abgeholt');
        g.addItem('sicherung');
      }),
    },
  },
  {
    id: 'leiter',
    name: 'hotspot.leiter',
    area: rect(4, 34, 26, 54),
    walkTo: [18, 96],
    face: 'links',
    exit: { room: 'festplatz', at: [169, 100], face: 'vorne' },
  },
];

export const uhrwerk: RoomDef = {
  id: 'uhrwerk',
  name: 'room.uhrwerk',
  eras: {
    1986: [{ background: 'backgrounds/uhrwerk_1986.png', walkable: WALKABLE, scale: SCALE, hotspots: hotspots1986 }],
    1955: [{ background: 'backgrounds/uhrwerk_1955.png', walkable: WALKABLE, scale: SCALE, hotspots: hotspots1955 }],
    1885: [{ background: 'backgrounds/uhrwerk_1885.png', walkable: WALKABLE, scale: SCALE, hotspots: hotspots1885 }],
  },
};
