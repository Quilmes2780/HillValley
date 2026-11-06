import type { RoomDef, Script } from '../../engine/types';
import { epilog } from '../epilog';
import { rect } from './util';

/** Marty lässt sich provozieren, rutscht aus und landet im Aufzug: zurück nach unten. */
const ausgerutscht: Script = async (g) => {
  await g.cutscene(async () => {
    await g.say('say.k5.showdown_wut');
    await g.walkTo([200, 114], undefined, 3);
    g.shake(250);
    await g.say('say.k5.showdown_rutscht');
    await g.walkTo([296, 96], undefined, 5);
    await g.goToRoom('lobby', 2015, [222, 98], 'vorne');
    await g.say('say.k5.showdown_unten');
  });
};

/** Brix stürmt los, Marty weicht aus: Feuertür, Geländer, Hover-Mistlaster. */
const brixStuerzt: Script = async (g) => {
  await g.cutscene(async () => {
    await g.sayAs('brix', 'say.k5.showdown_brix_wut');
    await g.say('say.k5.showdown_ausweichen');
    await g.walkTo([40, 102], 'brix', 4);
    g.setFlag('brix_gestuerzt');
    await g.goToRoom('gasse', 2015, [296, 122], 'links');
    await g.sayAs('brix', 'say.k5.showdown_rutschpartie');
    g.shake(500);
    await g.say('say.k5.showdown_mist');
    await g.goToRoom('buero', 2015, [170, 112], 'links');
    await g.say('say.k5.showdown_brief');
  });
};

export const buero: RoomDef = {
  id: 'buero',
  name: 'room.buero',
  eras: {
    2015: [
      {
        background: 'backgrounds/buero_2015.png',
        walkable: [[[8, 92], [312, 92], [316, 140], [4, 140]]],
        scale: { yFar: 92, sFar: 0.88, yNear: 140, sNear: 1 },
        actors: [{ id: 'brix', x: 220, y: 112, face: 'rechts', visible: (s) => !s.flags.brix_gestuerzt }],
        hotspots: [
          {
            id: 'zifferblatt',
            name: 'hotspot.zifferblatt',
            area: rect(90, 6, 78, 70),
            walkTo: [129, 96],
            face: 'hinten',
            comments: { schauan: 'say.k5.buero_uhr' },
          },
          {
            id: 'feuertuer',
            name: 'hotspot.feuertuer',
            area: rect(6, 22, 40, 66),
            walkTo: [28, 96],
            face: 'hinten',
            comments: { schauan: 'say.k5.buero_feuertuer', oeffne: 'say.k5.buero_feuertuer_oeffne' },
          },
          {
            id: 'chronopost',
            name: 'hotspot.chronopost',
            area: rect(206, 46, 60, 42),
            walkTo: [246, 96],
            face: 'hinten',
            comments: {
              schauan: 'say.k5.buero_chronopost',
              oeffne: 'say.k5.buero_chronopost_oeffne',
              benutze: 'say.k5.buero_chronopost_oeffne',
            },
          },
          {
            id: 'aktenvernichter',
            name: 'hotspot.aktenvernichter',
            area: rect(58, 58, 22, 30),
            walkTo: [69, 96],
            face: 'hinten',
            comments: { schauan: 'say.k5.buero_vernichter', benutze: 'say.k5.buero_vernichter_benutze' },
            useWith: { brief_brix: epilog },
          },
          {
            id: 'aufzug',
            name: 'hotspot.aufzug',
            area: rect(276, 22, 40, 66),
            walkTo: [296, 96],
            face: 'hinten',
            comments: { schauan: 'say.k5.buero_aufzug' },
            exit: { room: 'lobby', at: [222, 98], face: 'vorne' },
          },
          {
            id: 'brief',
            name: 'item.brief_brix.name',
            area: rect(148, 118, 16, 12),
            walkTo: [156, 134],
            face: 'hinten',
            visible: (s) => !!s.flags.brix_gestuerzt && !s.flags.brief_genommen_brix,
            sprite: { key: 'backgrounds/sprites/brief_boden.png', x: 150, y: 120 },
            comments: { schauan: 'say.k5.brief_schau' },
            verbs: {
              nimm: async (g) => {
                await g.playAnim('pickup');
                g.setFlag('brief_genommen_brix');
                g.addItem('brief_brix');
              },
            },
          },
          {
            id: 'brix',
            name: 'hotspot.brix',
            area: rect(206, 62, 28, 50),
            walkTo: [176, 114],
            face: 'rechts',
            defaultVerb: 'redemit',
            visible: (s) => !s.flags.brix_gestuerzt,
            comments: { schauan: 'say.k5.buero_brix' },
            verbs: {
              redemit: async (g) => {
                await g.dialog('brix_showdown');
                if (g.getFlag('marty_beisst_an')) {
                  g.setFlag('marty_beisst_an', false);
                  await ausgerutscht(g);
                } else if (g.getFlag('brix_verliert')) {
                  await brixStuerzt(g);
                }
              },
            },
          },
        ],
      },
    ],
  },
};
