import type { Hotspot, RoomVariant } from '../../engine/types';
import { pickup, rect } from './util';

const helm = (leer: boolean): Hotspot => ({
  id: 'helm',
  name: 'hotspot.helm',
  area: rect(90, 36, 26, 24),
  walkTo: [103, 96],
  face: 'hinten',
  visible: (s) => Boolean(s.flags.spule_ausgebaut) === leer,
  sprite: { key: leer ? 'backgrounds/sprites/helm_ohne_spule.png' : 'backgrounds/sprites/helm.png', x: 90, y: 38 },
  comments: {
    schauan: leer ? 'say.k2.helm_leer' : 'say.k2.helm_schau',
    benutze: leer ? 'say.k2.helm_leer' : 'say.k2.helm_benutze',
  },
  useWith: leer
    ? undefined
    : {
        schraubenzieher: async (g) => {
          g.setFlag('spule_ausgebaut');
          g.addItem('kupferspule');
          await g.say('say.k2.helm_spule');
        },
      },
});

/** Docs Villa im Dezember 1955. */
export const docsLabor1955: RoomVariant = {
  background: 'backgrounds/docs_labor_1955.png',
  walkable: [[[8, 92], [312, 92], [316, 140], [4, 140]]],
  scale: { yFar: 92, sFar: 0.88, yNear: 140, sNear: 1 },
  hotspots: [
    {
      id: 'kamin',
      name: 'hotspot.kamin',
      area: rect(12, 20, 76, 68),
      walkTo: [50, 96],
      face: 'hinten',
      comments: { schauan: 'say.k2.kamin_schau', benutze: 'say.k2.kamin_benutze' },
      useWith: {
        mappe: async (g) => {
          g.removeItem('mappe');
          g.setFlag('mappe_verbrannt');
          g.state.timeline.tannenburg = false;
          g.setPhotoStage(2);
          g.flash(200);
          await g.say('say.k2.mappe_verbrannt');
        },
        brief_von_marty: async (g) => {
          await g.say('say.k2.kamin_brief');
        },
      },
    },
    helm(false),
    helm(true),
    {
      id: 'tafel',
      name: 'hotspot.tafel',
      area: rect(136, 12, 96, 34),
      walkTo: [184, 96],
      face: 'hinten',
      comments: { schauan: 'say.k2.tafel' },
    },
    {
      id: 'werkbank',
      name: 'hotspot.werkbank',
      area: rect(136, 50, 96, 42),
      walkTo: [184, 96],
      face: 'hinten',
      comments: { schauan: 'say.k2.werkbank' },
    },
    {
      id: 'schraubenzieher',
      name: 'item.schraubenzieher.name',
      area: rect(150, 54, 18, 8),
      walkTo: [160, 96],
      face: 'hinten',
      visible: (s) => !s.flags.schraubenzieher_genommen,
      sprite: { key: 'backgrounds/sprites/schraubenzieher.png', x: 152, y: 56 },
      comments: { schauan: 'say.k2.schraubenzieher_schau' },
      verbs: {
        nimm: pickup((g) => {
          g.setFlag('schraubenzieher_genommen');
          g.addItem('schraubenzieher');
        }),
      },
    },
    {
      id: 'zigarrenkiste',
      name: 'item.zigarrenkiste.name',
      area: rect(190, 50, 22, 12),
      walkTo: [200, 96],
      face: 'hinten',
      visible: (s) => !s.flags.zigarrenkiste_genommen,
      sprite: { key: 'backgrounds/sprites/zigarrenkiste.png', x: 192, y: 51 },
      comments: { schauan: 'say.k2.kiste_schau' },
      verbs: {
        nimm: pickup((g) => {
          g.setFlag('zigarrenkiste_genommen');
          g.addItem('zigarrenkiste');
        }),
      },
    },
    {
      id: 'tuer',
      name: 'hotspot.tuer_draussen',
      area: rect(268, 22, 40, 66),
      walkTo: [287, 96],
      face: 'hinten',
      exit: { room: 'stadtplan', at: [287, 100] },
    },
  ],
};
