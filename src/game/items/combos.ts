import type { Combo, Script } from '../../engine/types';
import type { FlagName } from '../flags';

/** Teil in die Zigarrenkiste einbauen. Sind beide Teile drin, ist der Verstärker fertig. */
const einbauen =
  (teil: string, flag: FlagName): Script =>
  async (g) => {
    if (g.state.characters[g.state.activeCharacter].room !== 'docs_labor') {
      await g.say('say.k2.kiste_erst_labor');
      return;
    }
    g.removeItem(teil);
    g.setFlag(flag);
    if (g.getFlag('kiste_hat_spule') && g.getFlag('kiste_hat_roehre')) {
      g.removeItem('zigarrenkiste');
      g.addItem('verstaerker');
      await g.say('say.k2.verstaerker_fertig');
    } else {
      await g.say('say.k2.kiste_teil_drin');
    }
  };

export const COMBOS: readonly Combo[] = [
  // Kapitel 1
  {
    a: 'kassette',
    b: 'diktiergeraet',
    run: async (g) => {
      g.removeItem('kassette');
      g.setFlag('kassette_eingelegt');
      await g.say('say.k1.kassette_drin');
    },
  },
  {
    a: 'kabel',
    b: 'diktiergeraet',
    run: async (g) => {
      await g.say('say.k1.erst_kabel');
    },
  },
  {
    a: 'kugelschreiber',
    b: 'notizbuch',
    run: async (g) => {
      if (g.state.chapter < 1) await g.say('say.k1.brief_noch_nicht');
      else if (g.getFlag('brief_geschrieben')) await g.say('say.k1.brief_schon');
      else {
        g.setFlag('brief_geschrieben');
        g.addItem('brief_an_doc');
        await g.say('say.k1.brief_geschrieben');
      }
    },
  },
  {
    a: 'bananenschale',
    b: 'mr_fusion',
    run: async (g) => {
      await g.say('say.k1.schale_erst_fusion');
    },
  },

  // Kapitel 2
  { a: 'kupferspule', b: 'zigarrenkiste', run: einbauen('kupferspule', 'kiste_hat_spule') },
  { a: 'roehre', b: 'zigarrenkiste', run: einbauen('roehre', 'kiste_hat_roehre') },

  // Kapitel 3
  {
    a: 'bleistift',
    b: 'festprogramm',
    run: async (g) => {
      await g.say('say.k3.handschrift');
    },
  },
  {
    a: 'bleistift',
    b: 'biffs_brief',
    run: async (g) => {
      if (!g.getFlag('flux_eingebaut')) {
        await g.say('say.k3.nachricht_noch_nicht');
        return;
      }
      g.removeItem('biffs_brief');
      g.addItem('nachricht');
      g.setFlag('nachricht_geschrieben');
      await g.say('say.k3.nachricht_geschrieben');
    },
  },
  {
    a: 'streichhoelzer',
    b: 'knallfrosch',
    run: async (g) => {
      const here = g.state.characters[g.state.activeCharacter].room;
      if (here !== 'mietstall' || !g.getFlag('buford_im_stall')) {
        await g.say('say.k3.frosch_nicht_hier');
        return;
      }
      g.removeItem('knallfrosch');
      g.addItem('knallfrosch_brennend');
      await g.say('say.k3.frosch_brennt');
    },
  },

  // Kapitel 4
  {
    a: 'wachsdose',
    b: 'mr_fusion',
    run: async (g) => {
      g.removeItem('wachsdose');
      g.setFlag('fusion_gefuettert');
      await g.say('say.k4.fusion_gefuettert');
    },
  },

  // Kapitel 5
  {
    a: 'klebeband',
    b: 'glas',
    run: async (g) => {
      g.removeItem('klebeband');
      g.removeItem('glas');
      g.addItem('folie');
      await g.say('say.k5.folie');
    },
  },

  // Nur Gags: Sie sorgen dafür, dass auch unsinnige Versuche eine Antwort bekommen.
  {
    a: 'kugelschreiber',
    b: 'foto',
    run: async (g) => {
      await g.say('say.extra.combo_stift_foto');
    },
  },
  {
    a: 'kugelschreiber',
    b: 'zeitung',
    run: async (g) => {
      await g.say('say.extra.combo_stift_zeitung');
    },
  },
  {
    a: 'banane',
    b: 'kugelschreiber',
    run: async (g) => {
      await g.say('say.extra.combo_banane_stift');
    },
  },
  {
    a: 'bleistift',
    b: 'kuchen',
    run: async (g) => {
      await g.say('say.extra.combo_stift_kuchen');
    },
  },
  {
    a: 'streichhoelzer',
    b: 'kuchen',
    run: async (g) => {
      await g.say('say.extra.combo_streichholz_kuchen');
    },
  },
  {
    a: 'streichhoelzer',
    b: 'festprogramm',
    run: async (g) => {
      await g.say('say.extra.combo_streichholz_programm');
    },
  },

  // Testräume
  {
    a: 'apfel',
    b: 'schachtel',
    run: async (g) => {
      g.removeItem('apfel');
      g.removeItem('schachtel');
      g.addItem('apfelschachtel');
      await g.say('say.test.apfel_verpackt');
    },
  },
];
