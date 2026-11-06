import type { Polygon, Script, ScriptApi } from '../../engine/types';

export const rect = (x: number, y: number, w: number, h: number): Polygon => [
  [x, y],
  [x + w, y],
  [x + w, y + h],
  [x, y + h],
];

/** Figur bückt sich, danach passiert `then`. Für alle Gegenstände, die im Raum liegen. */
export const pickup =
  (then: (g: ScriptApi) => void): Script =>
  async (g) => {
    await g.playAnim('pickup');
    then(g);
  };
