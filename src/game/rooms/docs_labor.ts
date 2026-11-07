import type { Hotspot, Polygon, RoomDef, Script, ScriptApi } from '../../engine/types';
import { FX } from '../szenen';
import { docsLabor1955 } from './docs_labor_1955';
import { pickup, rect } from './util';

const NAPF: readonly [number, number] = [96, 128];

const fuettern: Script = async (g) => {
  g.removeItem('hundefutter');
  await g.say('say.prolog.labor_fuettern');
  await g.walkTo(NAPF, 'einstein');
  await g.sayAs('einstein', 'say.prolog.einstein_mampf');
  g.setFlag('einstein_satt');
};

/** Kapitel 4: Einstein nimmt Biffs Fährte auf und folgt Marty. */
const faehrte: Script = async (g) => {
  if (g.state.chapter < 4) {
    await g.say('say.k4.faehrte_noch_nicht');
    return;
  }
  g.removeItem('wachstuch');
  await g.sayAs('einstein', 'say.prolog.einstein_bellt');
  g.setFlag('einstein_folgt');
  await g.say('say.k4.faehrte');
};

const gitarrenGag: Script = async (g) => {
  await g.cutscene(async () => {
    await g.say('say.prolog.labor_gag_1');
    g.sfx('gitarre');
    g.flash();
    g.shake(500);
    await g.hop(undefined, [80, 98], { ms: 550, arc: 22, spin: -6.2, ease: 'Quad.easeOut' });
    g.sfx('fall');
    g.burst(80, 70, FX.funken);
    await g.say('say.prolog.labor_gag_2');
  });
};

const briefLesen: Script = async (g) => {
  await g.playAnim('pickup');
  g.setFlag('brief_genommen');
  g.addItem('docs_brief');
  await g.cutscene(async () => {
    await g.say('say.prolog.brief_0');
    for (const line of [1, 2, 3, 4, 5]) await g.sayAs('doc', `say.prolog.brief_${line}`);
    await g.say('say.prolog.brief_6');
  });
};

/** Die Welt kippt: Hill Valley wird Tannenburg. Danach beginnt Kapitel 1. */
async function zeitwelle(g: ScriptApi): Promise<void> {
  await g.cutscene(async () => {
    await g.say('say.prolog.welle_1');
    await g.timeWave();
    g.state.timeline.tannenburg = true;
    g.state.chapter = 1;
    g.setFlag('k1_begonnen');
    g.setPhotoStage(1);
    await g.say('say.prolog.welle_2');
    await g.say('item.foto.stufe1');
    await g.showCard('chapter.k1.title', 'chapter.k1.subtitle');
  });
}

function einsteinHotspot(area: Polygon, walkTo: readonly [number, number], satt: boolean): Hotspot {
  return {
    id: 'einstein',
    name: 'hotspot.einstein',
    area,
    walkTo,
    face: 'links',
    defaultVerb: 'redemit',
    visible: (s) => Boolean(s.flags.einstein_satt) === satt && !s.flags.einstein_folgt,
    verbs: {
      schauan: async (g) => {
        if (satt) {
          await g.say('say.prolog.einstein_satt');
          return;
        }
        await g.say('say.prolog.einstein_hungrig');
        await g.sayAs('einstein', 'say.prolog.einstein_bellt');
        await g.say('say.prolog.einstein_napf');
      },
      redemit: async (g) => {
        await g.say(satt ? 'say.prolog.einstein_rede_satt' : 'say.prolog.einstein_rede');
        await g.sayAs('einstein', 'say.prolog.einstein_bellt');
      },
    },
    useWith: satt ? { wachstuch: faehrte } : { hundefutter: fuettern },
    comments: { nimm: 'say.prolog.einstein_nimm' },
  };
}

export const docsLabor: RoomDef = {
  id: 'docs_labor',
  name: 'room.docs_labor',
  eras: {
    1955: [docsLabor1955],
    1986: [
      {
        background: 'backgrounds/docs_labor_1986.png',
        walkable: [[[8, 92], [312, 92], [316, 140], [4, 140]]],
        scale: { yFar: 92, sFar: 0.88, yNear: 140, sNear: 1 },
        actors: [
          { id: 'einstein', x: 52, y: 128, face: 'rechts', visible: (s) => !s.flags.einstein_satt },
          { id: 'einstein', x: NAPF[0], y: NAPF[1], face: 'links', visible: (s) => !s.flags.einstein_folgt },
        ],
        hotspots: [
          {
            id: 'rohre',
            name: 'hotspot.rohre',
            area: rect(0, 4, 320, 10),
            walkTo: [160, 96],
            face: 'hinten',
            comments: { schauan: 'say.prolog.labor_rohre' },
          },
          {
            id: 'tuer',
            name: 'hotspot.tuer_draussen',
            area: rect(4, 22, 39, 68),
            walkTo: [24, 96],
            face: 'hinten',
            comments: { schauan: 'say.prolog.labor_tuer' },
            exit: {
              room: 'stadtplan',
              at: [24, 100],
              guard: async (g) => {
                // Die Sperre und die Zeitwelle gehören nur zum Prolog.
                if (g.state.chapter >= 1) return true;
                if (!g.hasItem('docs_brief') || !g.hasItem('notizbuch') || !g.hasItem('mr_fusion')) {
                  await g.say('say.prolog.labor_noch_nicht');
                  return false;
                }
                await zeitwelle(g);
                return true;
              },
            },
          },
          {
            id: 'regal',
            name: 'hotspot.regal',
            area: rect(50, 14, 60, 52),
            walkTo: [80, 96],
            face: 'hinten',
            comments: { schauan: 'say.prolog.labor_regal', nimm: 'say.prolog.labor_regal_nimm' },
          },
          {
            id: 'buechse',
            name: 'hotspot.buechse',
            area: rect(55, 27, 13, 15),
            walkTo: [62, 96],
            face: 'hinten',
            comments: { schauan: 'say.prolog.labor_buechse' },
          },
          {
            id: 'blaue_dose',
            name: 'hotspot.blaue_dose',
            area: rect(90, 29, 11, 13),
            walkTo: [95, 96],
            face: 'hinten',
            comments: { schauan: 'say.prolog.labor_blaue_dose' },
          },
          {
            id: 'konserven',
            name: 'hotspot.konserven',
            area: rect(55, 52, 20, 12),
            walkTo: [65, 96],
            face: 'hinten',
            comments: { schauan: 'say.prolog.labor_konserven' },
          },
          {
            id: 'holzkiste',
            name: 'hotspot.holzkiste',
            area: rect(79, 54, 22, 10),
            walkTo: [90, 96],
            face: 'hinten',
            comments: { schauan: 'say.prolog.labor_holzkiste' },
          },
          {
            id: 'mr_fusion',
            name: 'item.mr_fusion.name',
            area: rect(70, 23, 16, 20),
            walkTo: [80, 96],
            face: 'hinten',
            visible: (s) => !s.flags.mr_fusion_genommen,
            sprite: { key: 'backgrounds/sprites/mr_fusion.png', x: 72, y: 25 },
            comments: { schauan: 'say.prolog.labor_fusion_schau' },
            verbs: {
              nimm: async (g) => {
                await g.playAnim('pickup');
                g.setFlag('mr_fusion_genommen');
                g.addItem('mr_fusion');
                await g.say('say.prolog.labor_fusion_leer');
              },
            },
          },
          {
            id: 'schrank',
            name: 'hotspot.schrank',
            area: rect(118, 24, 32, 66),
            walkTo: [134, 96],
            face: 'hinten',
            defaultVerb: 'oeffne',
            sprite: {
              key: 'backgrounds/sprites/labor_schrank_zu.png',
              x: 118,
              y: 24,
              when: (s) => !s.flags.labor_schrank_offen,
            },
            comments: { schauan: 'say.prolog.labor_schrank' },
            verbs: {
              oeffne: async (g) => {
                if (g.getFlag('labor_schrank_offen')) await g.say('say.prolog.schon_offen');
                else g.setFlag('labor_schrank_offen');
              },
              schliesse: async (g) => {
                if (g.getFlag('labor_schrank_offen')) g.setFlag('labor_schrank_offen', false);
                else await g.say('say.prolog.schon_zu');
              },
            },
          },
          {
            id: 'hundefutter',
            name: 'item.hundefutter.name',
            area: rect(126, 51, 16, 14),
            walkTo: [134, 96],
            face: 'hinten',
            visible: (s) => !!s.flags.labor_schrank_offen && !s.flags.hundefutter_genommen,
            sprite: { key: 'backgrounds/sprites/hundefutter.png', x: 128, y: 53 },
            comments: { schauan: 'say.prolog.labor_futter_schau' },
            verbs: {
              nimm: pickup((g) => {
                g.setFlag('hundefutter_genommen');
                g.addItem('hundefutter');
              }),
            },
          },
          {
            id: 'uhren',
            name: 'hotspot.uhren',
            area: rect(158, 15, 77, 29),
            walkTo: [200, 96],
            face: 'hinten',
            comments: { schauan: 'say.prolog.labor_uhren', nimm: 'say.prolog.labor_uhren_nimm' },
          },
          {
            id: 'werkbank',
            name: 'hotspot.werkbank',
            area: rect(156, 55, 85, 36),
            walkTo: [200, 96],
            face: 'hinten',
            comments: { schauan: 'say.prolog.labor_werkbank' },
          },
          {
            id: 'deckenlampe',
            name: 'hotspot.deckenlampe',
            area: rect(193, 0, 18, 17),
            walkTo: [202, 96],
            face: 'hinten',
            comments: { schauan: 'say.prolog.labor_deckenlampe' },
          },
          {
            id: 'zahnrad_links',
            name: 'hotspot.zahnrad',
            area: rect(175, 6, 9, 9),
            walkTo: [180, 96],
            face: 'hinten',
            comments: { schauan: 'say.prolog.labor_zahnrad' },
          },
          {
            id: 'zahnrad_rechts',
            name: 'hotspot.zahnrad',
            area: rect(218, 6, 9, 9),
            walkTo: [222, 96],
            face: 'hinten',
            comments: { schauan: 'say.prolog.labor_zahnrad' },
          },
          {
            id: 'messgeraet',
            name: 'hotspot.messgeraet',
            area: rect(221, 52, 14, 8),
            walkTo: [228, 96],
            face: 'hinten',
            comments: { schauan: 'say.prolog.labor_messgeraet' },
          },
          {
            id: 'blechkiste',
            name: 'hotspot.blechkiste',
            area: rect(175, 65, 15, 8),
            walkTo: [182, 96],
            face: 'hinten',
            comments: { schauan: 'say.prolog.labor_blechkiste' },
          },
          {
            id: 'docs_brief',
            name: 'item.docs_brief.name',
            area: rect(170, 50, 16, 10),
            walkTo: [180, 96],
            face: 'hinten',
            visible: (s) => !s.flags.brief_genommen,
            sprite: { key: 'backgrounds/sprites/brief.png', x: 172, y: 51 },
            comments: { schauan: 'say.prolog.labor_brief_schau' },
            verbs: { nimm: briefLesen, oeffne: briefLesen },
          },
          {
            id: 'notizbuch',
            name: 'item.notizbuch.name',
            area: rect(204, 50, 16, 10),
            walkTo: [212, 96],
            face: 'hinten',
            visible: (s) => !s.flags.notizbuch_genommen,
            sprite: { key: 'backgrounds/sprites/notizbuch.png', x: 206, y: 51 },
            comments: { schauan: 'say.prolog.labor_notizbuch_schau' },
            verbs: {
              nimm: pickup((g) => {
                g.setFlag('notizbuch_genommen');
                g.addItem('notizbuch');
              }),
            },
          },
          {
            id: 'gitarre',
            name: 'hotspot.gitarre',
            area: rect(241, 48, 15, 44),
            walkTo: [250, 96],
            face: 'hinten',
            comments: { schauan: 'say.prolog.labor_gitarre', nimm: 'say.prolog.labor_gitarre_nimm' },
            useWith: { riesenverstaerker: gitarrenGag },
          },
          {
            id: 'riesenverstaerker',
            name: 'hotspot.riesenverstaerker',
            area: rect(257, 20, 48, 71),
            walkTo: [280, 96],
            face: 'hinten',
            comments: { schauan: 'say.prolog.labor_verstaerker', nimm: 'say.prolog.labor_verstaerker_nimm' },
            useWith: { gitarre: gitarrenGag },
          },
          {
            id: 'koerbchen',
            name: 'hotspot.koerbchen',
            area: rect(8, 106, 38, 17),
            walkTo: [40, 130],
            face: 'links',
            comments: { nimm: 'say.prolog.labor_koerbchen_nimm' },
            verbs: {
              schauan: async (g) => {
                if (!g.getFlag('einstein_satt')) {
                  await g.say('say.prolog.labor_koerbchen_blockiert');
                  return;
                }
                await g.say('say.prolog.labor_koerbchen_leer');
                if (!g.getFlag('wachstuch_genommen')) await g.say('say.prolog.labor_koerbchen_tuch');
              },
            },
          },
          {
            id: 'wachstuch',
            name: 'item.wachstuch.name',
            area: rect(30, 106, 15, 9),
            walkTo: [40, 130],
            face: 'links',
            visible: (s) => !!s.flags.einstein_satt && !s.flags.wachstuch_genommen,
            sprite: { key: 'backgrounds/sprites/wachstuch.png', x: 31, y: 107 },
            comments: { schauan: 'say.prolog.labor_tuch_schau' },
            verbs: {
              nimm: pickup((g) => {
                g.setFlag('wachstuch_genommen');
                g.addItem('wachstuch');
              }),
            },
          },
          {
            id: 'napf',
            name: 'hotspot.napf',
            area: rect(76, 116, 18, 10),
            walkTo: [70, 130],
            face: 'rechts',
            comments: { nimm: 'say.prolog.labor_napf_nimm' },
            verbs: {
              schauan: async (g) => {
                await g.say(g.getFlag('einstein_satt') ? 'say.prolog.labor_napf_voll' : 'say.prolog.labor_napf_leer');
              },
            },
            useWith: { hundefutter: fuettern },
          },
          {
            id: 'brecheisen',
            name: 'item.brecheisen.name',
            area: rect(42, 60, 8, 30),
            walkTo: [46, 96],
            face: 'hinten',
            visible: (s) => s.chapter >= 3 && !s.flags.brecheisen_genommen,
            sprite: { key: 'backgrounds/sprites/brecheisen.png', x: 43, y: 61 },
            comments: { schauan: 'say.k3.labor_brecheisen' },
            verbs: {
              nimm: pickup((g) => {
                g.setFlag('brecheisen_genommen');
                g.addItem('brecheisen');
              }),
            },
          },
          {
            id: 'sicherungskasten',
            name: 'hotspot.sicherungskasten',
            area: rect(235, 14, 22, 30),
            walkTo: [248, 96],
            face: 'hinten',
            defaultVerb: 'oeffne',
            sprite: {
              key: 'backgrounds/sprites/sicherungskasten.png',
              x: 235,
              y: 14,
              when: (s) => !s.flags.sicherungskasten_offen,
            },
            comments: { schauan: 'say.k3.labor_kasten' },
            verbs: {
              oeffne: async (g) => {
                if (g.state.chapter < 3) await g.say('say.k3.labor_kasten_noch_nicht');
                else if (g.getFlag('sicherungskasten_offen')) await g.say('say.prolog.schon_offen');
                else g.setFlag('sicherungskasten_offen');
              },
              schliesse: async (g) => {
                if (g.getFlag('sicherungskasten_offen')) g.setFlag('sicherungskasten_offen', false);
                else await g.say('say.prolog.schon_zu');
              },
            },
          },
          {
            id: 'kasten_innen',
            name: 'hotspot.sicherungskasten',
            area: rect(235, 14, 22, 30),
            walkTo: [248, 96],
            face: 'hinten',
            visible: (s) => !!s.flags.sicherungskasten_offen,
            sprite: { key: 'backgrounds/sprites/sicherungskasten_offen.png', x: 235, y: 14 },
            comments: { schauan: 'say.k3.labor_kasten_innen' },
            verbs: {
              schliesse: async (g) => {
                g.setFlag('sicherungskasten_offen', false);
              },
            },
          },
          {
            id: 'sicherung',
            name: 'item.sicherung.name',
            area: rect(237, 16, 14, 8),
            walkTo: [248, 96],
            face: 'hinten',
            visible: (s) => !!s.flags.sicherungskasten_offen && !s.flags.sicherung_genommen,
            sprite: { key: 'backgrounds/sprites/sicherung.png', x: 239, y: 17 },
            comments: { schauan: 'say.k3.labor_sicherung_schau' },
            verbs: {
              nimm: async (g) => {
                if (!g.getFlag('gelber_brief_gelesen')) {
                  await g.say('say.k3.labor_sicherung_wozu');
                  return;
                }
                await g.playAnim('pickup');
                g.setFlag('sicherung_genommen');
                g.addItem('sicherung');
              },
            },
          },
          einsteinHotspot(rect(38, 104, 28, 25), [76, 130], false),
          einsteinHotspot(rect(82, 104, 28, 25), [120, 130], true),
        ],
      },
    ],
  },
};
