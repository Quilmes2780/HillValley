import type { RoomDef } from '../../engine/types';
import { rect } from './util';

export const abstellgleis: RoomDef = {
  id: 'abstellgleis',
  name: 'room.abstellgleis',
  eras: {
    1885: [
      {
        background: 'backgrounds/abstellgleis_1885.png',
        walkable: [[[4, 110], [316, 110], [316, 140], [4, 140]]],
        scale: { yFar: 110, sFar: 0.92, yNear: 140, sNear: 1 },
        actors: [
          { id: 'jules', x: 40, y: 118, face: 'rechts' },
          { id: 'verne', x: 70, y: 126, face: 'rechts' },
        ],
        hotspots: [
          {
            id: 'wassertank',
            name: 'hotspot.wassertank',
            area: rect(24, 40, 30, 28),
            walkTo: [60, 112],
            face: 'hinten',
            comments: { schauan: 'say.k3.gleis_tank' },
          },
          {
            id: 'kaktus',
            name: 'hotspot.kaktus',
            area: rect(278, 64, 20, 28),
            walkTo: [288, 112],
            face: 'hinten',
            comments: { schauan: 'say.k3.gleis_kaktus', nimm: 'say.k3.gleis_kaktus_nimm' },
          },
          {
            id: 'zeitzug',
            name: 'hotspot.zeitzug',
            area: rect(100, 58, 160, 48),
            walkTo: [180, 114],
            face: 'hinten',
            sprite: { key: 'characters/zeitzug/zeitzug.png', x: 100, y: 58, depthY: 106 },
            comments: { oeffne: 'say.k3.zug_oeffne', benutze: 'say.k3.zug_benutze' },
            verbs: {
              schauan: async (g) => {
                if (g.getFlag('zug_repariert')) await g.say('say.k3.zug_fertig');
                else if (g.getFlag('flux_eingebaut')) await g.say('say.k3.zug_sicherung');
                else await g.say('say.k3.zug_schau');
              },
            },
            useWith: {
              fluxkompensator: async (g) => {
                g.removeItem('fluxkompensator');
                g.setFlag('flux_eingebaut');
                await g.say('say.k3.flux_eingebaut');
              },
              sicherung: async (g) => {
                if (!g.getFlag('flux_eingebaut')) {
                  await g.say('say.k3.sicherung_erst_flux');
                  return;
                }
                g.removeItem('sicherung');
                g.setFlag('zug_repariert');
                g.setPhotoStage(3);
                g.sfx('akzent');
                g.flash(200);
                await g.say('say.k3.zug_repariert');
              },
            },
          },
          {
            id: 'verne',
            name: 'hotspot.verne',
            area: rect(56, 76, 28, 50),
            walkTo: [96, 128],
            face: 'links',
            defaultVerb: 'redemit',
            comments: { schauan: 'say.k3.verne_schau' },
            verbs: {
              redemit: async (g) => {
                await g.dialog('verne');
              },
            },
          },
          {
            id: 'jules',
            name: 'hotspot.jules',
            area: rect(24, 66, 32, 52),
            walkTo: [60, 116],
            face: 'links',
            defaultVerb: 'redemit',
            comments: { schauan: 'say.k3.jules_schau' },
            verbs: {
              redemit: async (g) => {
                await g.dialog('jules');
              },
            },
          },
          {
            id: 'strasse',
            name: 'hotspot.strasse',
            area: rect(300, 92, 20, 48),
            walkTo: [306, 124],
            face: 'rechts',
            exit: { room: 'stadtplan', at: [306, 124] },
          },
        ],
      },
    ],
  },
};
