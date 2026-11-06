import type { Combo } from '../../engine/types';

export const COMBOS: readonly Combo[] = [
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
