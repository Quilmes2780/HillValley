import type { Script } from '../engine/types';

/** Läuft einmal beim Start eines neuen Spiels. */
export const START_SCRIPT: Script = async (g) => {
  await g.cutscene(async () => {
    await g.showCard('chapter.prolog.title', 'chapter.prolog.subtitle');
  });
};
