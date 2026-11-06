import type { RoomDef, Script } from '../../engine/types';
import { pickup, rect } from './util';

/** Die Familie steigt ein, der Zug fährt ab, Buford schaut tropfend zu. Kapitel 4 beginnt. */
const abfahrt: Script = async (g) => {
  await g.sayAs('clara', 'say.k3.clara_einsteigen');
  await g.cutscene(async () => {
    g.setFlag('abfahrt_laeuft');
    await g.say('say.k3.abfahrt_1');
    await g.sayAs('buford', 'say.k3.buford_tropft');
    await g.say('say.k3.abfahrt_2');
    g.flash(600);
    g.shake(500);
    await g.wait(700);
    g.setFlag('abfahrt_laeuft', false);
    g.setFlag('zug_abgefahren');
    await g.showCard('chapter.k4.title', 'chapter.k4.subtitle');
    g.state.chapter = 4;
    g.setFlag('k4_begonnen');
    g.state.unlockedCharacters = ['marty'];
    await g.switchCharacter('marty');
    await g.say('say.k3.marty_danach');
  });
};

export const festplatz: RoomDef = {
  id: 'festplatz',
  name: 'room.festplatz',
  eras: {
    1885: [
      {
        background: 'backgrounds/festplatz_1885.png',
        walkable: [[[6, 94], [314, 94], [316, 140], [4, 140]]],
        scale: { yFar: 94, sFar: 0.88, yNear: 140, sNear: 1 },
        actors: [
          { id: 'clara', x: 50, y: 100, face: 'rechts' },
          { id: 'maurer', x: 210, y: 106, face: 'links' },
          { id: 'feuerwerker', x: 264, y: 106, face: 'links' },
          { id: 'buford', x: 124, y: 122, face: 'rechts', visible: (s) => !!s.flags.abfahrt_laeuft },
        ],
        hotspots: [
          {
            id: 'stand',
            name: 'hotspot.kuchenstand',
            area: rect(10, 34, 82, 58),
            walkTo: [80, 100],
            face: 'links',
            comments: { schauan: 'say.k3.fest_stand', nimm: 'say.k3.fest_stand_nimm' },
          },
          {
            id: 'aushang',
            name: 'hotspot.aushang',
            area: rect(108, 48, 22, 26),
            walkTo: [119, 96],
            face: 'hinten',
            comments: { schauan: 'say.k3.fest_aushang' },
          },
          {
            id: 'festprogramm',
            name: 'item.festprogramm.name',
            area: rect(110, 50, 18, 22),
            walkTo: [119, 96],
            face: 'hinten',
            visible: (s) => !s.flags.festprogramm_genommen,
            sprite: { key: 'backgrounds/sprites/festprogramm.png', x: 112, y: 52 },
            comments: { schauan: 'say.k3.fest_programm' },
            verbs: {
              nimm: pickup((g) => {
                g.setFlag('festprogramm_genommen');
                g.addItem('festprogramm');
              }),
            },
          },
          {
            id: 'baustelle',
            name: 'hotspot.baustelle',
            area: rect(134, 12, 66, 80),
            walkTo: [168, 96],
            face: 'hinten',
            comments: { schauan: 'say.k3.fest_baustelle' },
          },
          {
            id: 'grundstein',
            name: 'hotspot.grundstein',
            area: rect(143, 79, 16, 13),
            walkTo: [151, 96],
            face: 'hinten',
            verbs: {
              schauan: async (g) => {
                await g.say(g.getFlag('grundstein_zu') ? 'say.k3.grundstein_zu' : 'say.k3.grundstein_offen');
              },
            },
            comments: { nimm: 'say.k3.grundstein_nimm' },
            useWith: {
              nachricht: async (g) => {
                g.removeItem('nachricht');
                g.setFlag('grundstein_zu');
                await g.say('say.k3.nachricht_drin');
                await g.sayAs('maurer', 'say.k3.maurer_mauert');
              },
            },
          },
          {
            id: 'geruest',
            name: 'hotspot.geruest',
            area: rect(160, 58, 18, 34),
            walkTo: [169, 96],
            face: 'hinten',
            comments: { schauan: 'say.k3.fest_geruest' },
            exit: { room: 'uhrwerk', at: [24, 100], face: 'rechts' },
          },
          {
            id: 'maurer',
            name: 'hotspot.maurer',
            area: rect(196, 56, 28, 50),
            walkTo: [188, 108],
            face: 'rechts',
            defaultVerb: 'redemit',
            comments: { schauan: 'say.k3.maurer_schau' },
            verbs: {
              redemit: async (g) => {
                await g.sayAs('maurer', 'say.k3.maurer_rede');
              },
            },
          },
          {
            id: 'feuerwerker',
            name: 'hotspot.feuerwerker',
            area: rect(250, 56, 28, 50),
            walkTo: [238, 108],
            face: 'rechts',
            defaultVerb: 'redemit',
            comments: { schauan: 'say.k3.feuerwerker_schau' },
            verbs: {
              redemit: async (g) => {
                await g.sayAs(
                  'feuerwerker',
                  g.getFlag('knallfrosch_erhalten') ? 'say.k3.feuerwerker_danach' : 'say.k3.feuerwerker_rede',
                );
              },
            },
            useWith: {
              kuchen: async (g) => {
                g.removeItem('kuchen');
                g.setFlag('knallfrosch_erhalten');
                g.addItem('knallfrosch');
                await g.sayAs('feuerwerker', 'say.k3.feuerwerker_tausch');
              },
            },
          },
          {
            id: 'clara',
            name: 'hotspot.clara',
            area: rect(36, 50, 28, 50),
            walkTo: [80, 102],
            face: 'links',
            defaultVerb: 'redemit',
            comments: { schauan: 'say.k3.clara_schau' },
            verbs: {
              redemit: async (g) => {
                if (g.getFlag('zug_repariert')) await abfahrt(g);
                else await g.dialog('clara');
              },
            },
            useWith: {
              festprogramm: async (g) => {
                g.removeItem('festprogramm');
                g.addItem('herausforderung');
                await g.sayAs('clara', 'say.k3.clara_schreibt');
              },
            },
          },
          {
            id: 'zeitzug',
            name: 'hotspot.zeitzug',
            area: rect(140, 92, 160, 48),
            walkTo: [100, 130],
            visible: (s) => !!s.flags.abfahrt_laeuft,
            sprite: { key: 'characters/zeitzug/zeitzug.png', x: 140, y: 92, depthY: 140 },
          },
          {
            id: 'strasse',
            name: 'hotspot.strasse',
            area: rect(300, 92, 20, 48),
            walkTo: [306, 120],
            face: 'rechts',
            exit: { room: 'stadtplan', at: [306, 120] },
          },
        ],
      },
    ],
  },
};
