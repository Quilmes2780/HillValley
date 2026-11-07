import type { Hotspot, RoomDef, RoomVariant, ScriptApi } from '../../engine/types';
import { rect } from './util';

const WALKABLE: RoomVariant['walkable'] = [[[8, 94], [312, 94], [316, 140], [4, 140]]];
const SCALE = { yFar: 94, sFar: 0.88, yNear: 140, sNear: 1 };
const WAGEN_SPRITE = { key: 'characters/delorean/delorean.png', x: 96, y: 42, depthY: 89 };

/** Ohne Karte winkt der Roboter ab. Gibt true zurück, wenn man an die Ausstellung darf. */
async function eintritt(g: ScriptApi): Promise<boolean> {
  if (g.getFlag('museum_eintritt')) return true;
  await g.sayAs('museumsroboter', 'say.k5.museum_karte');
  return false;
}

const roboter = (area: Hotspot['area'], walkTo: Hotspot['walkTo'], abgelenkt: boolean): Hotspot => ({
  id: 'museumsroboter',
  name: 'hotspot.museumsroboter',
  area,
  walkTo,
  face: abgelenkt ? 'rechts' : 'links',
  defaultVerb: 'redemit',
  visible: (s) => Boolean(s.flags.roboter_fuehrt) === abgelenkt,
  comments: { schauan: 'say.k5.museum_robot_schau' },
  verbs: {
    redemit: async (g) => {
      if (abgelenkt) await g.sayAs('museumsroboter', 'say.k5.museum_robot_fuehrung');
      else if (g.getFlag('museum_eintritt')) await g.sayAs('museumsroboter', 'say.k5.museum_robot_rede');
      else await g.sayAs('museumsroboter', 'say.k5.museum_karte');
    },
  },
  useWith: {
    freikarte: async (g) => {
      g.removeItem('freikarte');
      g.setFlag('museum_eintritt');
      await g.sayAs('museumsroboter', 'say.k5.museum_eintritt');
    },
  },
});

const normal: RoomVariant = {
  background: 'backgrounds/museum_2015.png',
  walkable: WALKABLE,
  scale: SCALE,
  actors: [
    { id: 'museumsroboter', x: 276, y: 114, face: 'links', visible: (s) => !!s.flags.roboter_fuehrt },
    { id: 'museumsroboter', x: 64, y: 112, face: 'rechts' },
    { id: 'jennifer', x: 250, y: 118, face: 'rechts', visible: (s) => !!s.flags.roboter_fuehrt },
    { id: 'jennifer', x: 108, y: 124, face: 'links' },
    { id: 'brix', x: 206, y: 120, face: 'vorne', visible: (s) => !!s.flags.brix_im_museum && !s.flags.aufzug_offen },
  ],
  hotspots: [
    {
      id: 'tuer',
      name: 'hotspot.tuer_platz',
      area: rect(4, 24, 36, 64),
      walkTo: [22, 98],
      face: 'hinten',
      exit: { room: 'turmplatz', at: [240, 100], face: 'vorne' },
    },
    {
      id: 'schild',
      name: 'hotspot.museumsschild',
      area: rect(92, 10, 140, 14),
      walkTo: [160, 98],
      face: 'hinten',
      comments: { schauan: 'say.k5.museum_schild' },
    },
    {
      id: 'bild_links',
      name: 'hotspot.ausstellung',
      area: rect(52, 34, 26, 30),
      walkTo: [64, 96],
      face: 'hinten',
      comments: { schauan: 'say.k5.museum_links' },
    },
    {
      id: 'bild_rechts',
      name: 'hotspot.ausstellung',
      area: rect(250, 30, 30, 34),
      walkTo: [264, 96],
      face: 'hinten',
      comments: { schauan: 'say.k5.museum_rechts' },
    },
    {
      id: 'delorean',
      name: 'hotspot.delorean',
      area: rect(126, 42, 100, 44),
      walkTo: [176, 98],
      face: 'hinten',
      sprite: WAGEN_SPRITE,
      comments: { benutze: 'say.k5.delorean_benutze', nimm: 'say.k5.delorean_nimm' },
      verbs: {
        schauan: async (g) => {
          if (await eintritt(g)) await g.say('say.k5.delorean_schau');
        },
      },
    },
    {
      id: 'kofferraum',
      name: 'hotspot.kofferraum',
      area: rect(96, 56, 30, 28),
      walkTo: [112, 98],
      face: 'hinten',
      defaultVerb: 'oeffne',
      sprite: {
        key: 'backgrounds/sprites/kofferraum_offen.png',
        x: 100,
        y: 62,
        depthY: 90,
        when: (s) => !!s.flags.kofferraum_offen,
      },
      comments: { schauan: 'say.k5.kofferraum_schau' },
      verbs: {
        oeffne: async (g) => {
          if (!(await eintritt(g))) return;
          if (g.getFlag('kofferraum_offen')) {
            await g.say('say.k5.kofferraum_schon');
          } else if (!g.getFlag('roboter_fuehrt')) {
            g.sfx('alarm');
            g.flash(120);
            g.shake(300);
            await g.sayAs('museumsroboter', 'say.k5.museum_alarm');
          } else {
            g.setFlag('kofferraum_offen');
            await g.say('say.k5.kofferraum_auf');
          }
        },
      },
    },
    {
      id: 'klebeband',
      name: 'item.klebeband.name',
      area: rect(100, 62, 18, 12),
      walkTo: [112, 98],
      face: 'hinten',
      visible: (s) => !!s.flags.kofferraum_offen && !s.flags.klebeband_genommen,
      sprite: { key: 'backgrounds/sprites/klebeband.png', x: 102, y: 64, depthY: 91 },
      comments: { schauan: 'say.k5.klebeband_schau' },
      verbs: {
        nimm: async (g) => {
          await g.playAnim('pickup');
          g.setFlag('klebeband_genommen');
          g.addItem('klebeband');
        },
      },
    },
    roboter(rect(48, 50, 32, 62), [86, 114], false),
    roboter(rect(260, 52, 32, 62), [230, 116], true),
    {
      id: 'jennifer',
      name: 'hotspot.jennifer',
      area: rect(92, 72, 32, 52),
      walkTo: [136, 126],
      face: 'links',
      defaultVerb: 'redemit',
      visible: (s) => !s.flags.roboter_fuehrt,
      comments: { schauan: 'say.k5.jennifer_schau' },
      verbs: {
        redemit: async (g) => {
          await g.dialog('jennifer_museum');
        },
      },
    },
    {
      id: 'jennifer_fuehrung',
      name: 'hotspot.jennifer',
      area: rect(234, 54, 30, 64),
      walkTo: [214, 120],
      face: 'rechts',
      visible: (s) => !!s.flags.roboter_fuehrt,
      comments: { schauan: 'say.k5.jennifer_fuehrung', redemit: 'say.k5.jennifer_fuehrung' },
    },
    {
      id: 'brix',
      name: 'hotspot.brix',
      area: rect(190, 56, 32, 64),
      walkTo: [178, 122],
      face: 'rechts',
      visible: (s) => !!s.flags.brix_im_museum && !s.flags.aufzug_offen,
      comments: { schauan: 'say.k5.brix_presse_schau' },
      verbs: {
        redemit: async (g) => {
          await g.sayAs('brix', 'say.k5.brix_presse');
        },
      },
    },
  ],
};

const geheilt: RoomVariant = {
  when: (s) => !!s.flags.zeitlinie_geheilt,
  background: 'backgrounds/museum_2015_geheilt.png',
  walkable: WALKABLE,
  scale: SCALE,
  hotspots: [
    {
      id: 'delorean',
      name: 'hotspot.delorean',
      area: rect(96, 42, 130, 44),
      walkTo: [160, 98],
      face: 'hinten',
      sprite: WAGEN_SPRITE,
      comments: { schauan: 'say.epilog.wagen' },
    },
    {
      id: 'tuer',
      name: 'hotspot.tuer_platz',
      area: rect(4, 24, 36, 64),
      walkTo: [22, 98],
      face: 'hinten',
      exit: { room: 'turmplatz', at: [240, 100], face: 'vorne' },
    },
  ],
};

export const museum: RoomDef = {
  id: 'museum',
  name: 'room.museum',
  eras: { 2015: [geheilt, normal] },
};
