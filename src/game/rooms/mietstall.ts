import type { RoomDef } from '../../engine/types';
import { pickup, rect } from './util';

export const mietstall: RoomDef = {
  id: 'mietstall',
  name: 'room.mietstall',
  eras: {
    1885: [
      {
        background: 'backgrounds/mietstall_1885.png',
        walkable: [[[6, 94], [314, 94], [316, 140], [4, 140]]],
        scale: { yFar: 94, sFar: 0.88, yNear: 140, sNear: 1 },
        actors: [
          // Auf dem Pferd, bis der Knallfrosch kommt; danach tropfend neben dem Haufen.
          { id: 'buford', x: 222, y: 112, face: 'rechts', visible: (s) => !!s.flags.buford_im_mist },
          { id: 'buford', x: 194, y: 84, face: 'rechts', visible: (s) => !!s.flags.buford_im_stall },
        ],
        hotspots: [
          {
            id: 'stalltor',
            name: 'hotspot.stalltor',
            area: rect(40, 42, 50, 50),
            walkTo: [65, 96],
            face: 'hinten',
            comments: { schauan: 'say.k3.stall_tor', oeffne: 'say.k3.stall_tor_oeffne' },
          },
          {
            id: 'misthaufen',
            name: 'hotspot.misthaufen',
            area: rect(236, 72, 70, 34),
            walkTo: [270, 112],
            face: 'hinten',
            sprite: { key: 'backgrounds/sprites/misthaufen.png', x: 236, y: 72, depthY: 106 },
            comments: { schauan: 'say.k3.stall_mist' },
          },
          {
            id: 'pferd',
            name: 'hotspot.pferd',
            area: rect(170, 54, 52, 44),
            walkTo: [160, 106],
            face: 'rechts',
            visible: (s) => !s.flags.buford_im_mist,
            sprite: { key: 'backgrounds/sprites/pferd.png', x: 170, y: 54, depthY: 98 },
            comments: { schauan: 'say.k3.stall_pferd', redemit: 'say.k3.stall_pferd_rede' },
            useWith: {
              knallfrosch: async (g) => {
                await g.say('say.k3.frosch_nicht_an');
              },
              knallfrosch_brennend: async (g) => {
                g.removeItem('knallfrosch_brennend');
                await g.cutscene(async () => {
                  await g.say('say.k3.frosch_wirft');
                  g.sfx('knall');
                  g.flash(150);
                  g.shake(600);
                  await g.sayAs('buford', 'say.k3.buford_fliegt');
                  g.setFlag('buford_im_mist');
                  g.sfx('platsch');
                  await g.wait(400);
                  await g.sayAs('buford', 'say.k3.buford_mist');
                  await g.say('say.k3.guertel_gerissen');
                });
              },
            },
          },
          {
            id: 'buford',
            name: 'hotspot.buford',
            area: rect(178, 22, 32, 34),
            walkTo: [160, 106],
            face: 'rechts',
            defaultVerb: 'redemit',
            visible: (s) => !!s.flags.buford_im_stall && !s.flags.buford_im_mist,
            comments: { schauan: 'say.k3.buford_stall_schau' },
            verbs: {
              redemit: async (g) => {
                await g.sayAs('buford', 'say.k3.buford_stall_rede');
              },
            },
          },
          {
            id: 'buford',
            name: 'hotspot.buford',
            area: rect(206, 48, 32, 64),
            walkTo: [190, 114],
            face: 'rechts',
            defaultVerb: 'redemit',
            visible: (s) => !!s.flags.buford_im_mist,
            comments: { schauan: 'say.k3.buford_mist_schau' },
            verbs: {
              redemit: async (g) => {
                await g.sayAs('buford', 'say.k3.buford_mist_rede');
              },
            },
          },
          {
            id: 'fluxkompensator',
            name: 'item.fluxkompensator.name',
            area: rect(148, 116, 20, 14),
            walkTo: [158, 134],
            face: 'hinten',
            visible: (s) => !!s.flags.buford_im_mist && !s.flags.flux_genommen,
            sprite: { key: 'backgrounds/sprites/flux_boden.png', x: 150, y: 118 },
            comments: { schauan: 'say.k3.flux_schau' },
            verbs: {
              nimm: pickup((g) => {
                g.setFlag('flux_genommen');
                g.addItem('fluxkompensator');
              }),
            },
          },
          {
            id: 'knitterbrief',
            name: 'item.biffs_brief.name',
            area: rect(174, 120, 16, 12),
            walkTo: [182, 134],
            face: 'hinten',
            visible: (s) => !!s.flags.buford_im_mist && !s.flags.knitterbrief_genommen,
            sprite: { key: 'backgrounds/sprites/brief_knitter.png', x: 176, y: 122 },
            comments: { schauan: 'say.k3.knitter_schau' },
            verbs: {
              nimm: pickup((g) => {
                g.setFlag('knitterbrief_genommen');
                g.addItem('biffs_brief');
              }),
            },
          },
          {
            id: 'strasse',
            name: 'hotspot.strasse',
            area: rect(300, 106, 20, 34),
            walkTo: [306, 122],
            face: 'rechts',
            exit: { room: 'stadtplan', at: [306, 122] },
          },
        ],
      },
    ],
  },
};
