import type { ItemDef } from '../../engine/types';

const plain = (id: string): Pick<ItemDef, 'id' | 'name' | 'icon' | 'description'> => ({
  id,
  name: `item.${id}.name`,
  icon: `items/${id}.png`,
  description: `item.${id}.desc`,
});

const fotoIcon = (stage: number): string => `items/foto_stufe${stage}.png`;
/** Das Foto groß, für „Schau an“ (Bildgröße in `PICTURES`, `szenen.ts`). */
const fotoGross = (stage: number): string => `items/foto_gross_stufe${stage}.png`;

export const ITEMS: readonly ItemDef[] = [
  {
    ...plain('foto'),
    icon: fotoIcon(0),
    iconFor: (s) => fotoIcon(s.photoStage),
    iconVariants: [0, 1, 2, 3, 4].map(fotoIcon),
    // Text je Stufe laut LOESUNGSBUCH.md
    description: (s) => `item.foto.stufe${s.photoStage}`,
    verbs: {
      // Auf dem kleinen Bild sind die Personen kaum zu erkennen: Das Foto erscheint groß, solange Marty spricht.
      schauan: async (g) => {
        await g.cutscene(async () => {
          g.showPicture(fotoGross(g.state.photoStage), 1);
          await g.say(`item.foto.stufe${g.state.photoStage}`);
          g.hidePicture();
        });
      },
    },
  },

  // Prolog
  plain('kugelschreiber'),
  {
    // Nur ein Gag: Für die Lösung wird es nicht gebraucht.
    ...plain('skateboard'),
    verbs: {
      benutze: async (g) => {
        const here = g.state.characters[g.state.activeCharacter].room;
        const places = ['vorgarten', 'rathausplatz', 'schule_flur', 'turmplatz', 'cafe80er', 'lobby'];
        await g.say(places.includes(here) ? `say.extra.skate_${here}` : 'say.extra.skate_drinnen');
      },
    },
  },
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

  // Kapitel 3
  plain('streichhoelzer'),
  plain('bleistift'),
  plain('festprogramm'),
  plain('kuchen'),
  plain('herausforderung'),
  plain('knallfrosch'),
  plain('knallfrosch_brennend'),
  plain('fluxkompensator'),
  plain('biffs_brief'),
  plain('nachricht'),
  plain('brecheisen'),
  {
    ...plain('vergilbter_brief'),
    verbs: {
      schauan: async (g) => {
        g.setFlag('gelber_brief_gelesen');
        await g.say('item.vergilbter_brief.rueckseite');
        await g.say('item.vergilbter_brief.vorderseite');
      },
    },
  },
  plain('sicherung'),

  // Kapitel 4
  plain('wachsdose'),
  plain('sendeschluessel'),
  plain('brief_2015'),

  // Kapitel 5
  plain('muenze_2015'),
  plain('glas'),
  plain('freikarte'),
  plain('klebeband'),
  plain('folie'),
  plain('brief_brix'),

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
