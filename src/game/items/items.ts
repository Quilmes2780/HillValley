import type { ItemDef } from '../../engine/types';

const plain = (id: string): Pick<ItemDef, 'id' | 'name' | 'icon' | 'description'> => ({
  id,
  name: `item.${id}.name`,
  icon: `items/${id}.png`,
  description: `item.${id}.desc`,
});

export const ITEMS: readonly ItemDef[] = [
  {
    ...plain('foto'),
    // Text je Stufe laut LOESUNGSBUCH.md
    description: (s) => `item.foto.stufe${s.photoStage}`,
  },
  // Gegenstände des Testraums (Meilenstein 1)
  plain('apfel'),
  plain('schachtel'),
  plain('apfelschachtel'),
  plain('muenze'),
  {
    ...plain('keks'),
    verbs: {
      benutze: async (g) => {
        g.removeItem('keks');
        await g.say('say.test.keks_gegessen');
      },
    },
  },
  plain('ding1'),
  plain('ding2'),
  plain('ding3'),
  plain('ding4'),
];
