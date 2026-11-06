import type { ItemDef } from '../../engine/types';

const plain = (id: string): Pick<ItemDef, 'id' | 'name' | 'icon' | 'description'> => ({
  id,
  name: `item.${id}.name`,
  icon: `items/${id}.png`,
  description: `item.${id}.desc`,
});

const fotoIcon = (stage: number): string => `items/foto_stufe${stage}.png`;

export const ITEMS: readonly ItemDef[] = [
  {
    ...plain('foto'),
    icon: fotoIcon(0),
    iconFor: (s) => fotoIcon(s.photoStage),
    iconVariants: [0, 1, 2, 3, 4].map(fotoIcon),
    // Text je Stufe laut LOESUNGSBUCH.md
    description: (s) => `item.foto.stufe${s.photoStage}`,
  },

  // Prolog
  plain('kugelschreiber'),
  {
    ...plain('banane'),
    verbs: {
      benutze: async (g) => {
        g.removeItem('banane');
        g.addItem('bananenschale');
        await g.say('say.prolog.banane_gegessen');
      },
    },
  },
  plain('bananenschale'),
  plain('hundefutter'),
  plain('wachstuch'),
  plain('docs_brief'),
  plain('notizbuch'),
  plain('mr_fusion'),

  // Kapitel 1
  plain('zeitung'),
  plain('entschuldigung'),
  plain('kassette'),
  plain('kabel'),
  {
    ...plain('diktiergeraet'),
    description: (s) => (s.flags.kassette_eingelegt ? 'item.diktiergeraet.desc_kassette' : 'item.diktiergeraet.desc'),
    verbs: {
      druecke: async (g) => {
        await g.say(g.getFlag('kassette_eingelegt') ? 'say.k1.diktier_zu_leise' : 'say.k1.diktier_leer');
      },
    },
  },
  plain('brief_an_doc'),

  // Kapitel 2
  plain('brief_von_marty'),
  plain('schraubenzieher'),
  {
    ...plain('zigarrenkiste'),
    description: (s) =>
      s.flags.kiste_hat_spule || s.flags.kiste_hat_roehre ? 'item.zigarrenkiste.desc_halb' : 'item.zigarrenkiste.desc',
  },
  plain('kupferspule'),
  plain('dollar'),
  plain('roehre'),
  plain('zettel'),
  plain('hausaufgabe'),
  plain('mappe'),
  plain('verstaerker'),

  // Gegenstände der Testräume (Engine-Szenario)
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
