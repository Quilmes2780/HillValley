import type { RoomDef } from '../../engine/types';
import { arbeitszimmer } from './arbeitszimmer';
import { docsLabor } from './docs_labor';
import { kueche } from './kueche';
import { martysZimmer } from './martys_zimmer';
import { stadtplan } from './stadtplan';
import { testflur } from './testflur';
import { testraum } from './testraum';
import { vorgarten } from './vorgarten';

/** Neue Räume hier eintragen. Mehr ist nicht nötig. */
export const ROOMS: readonly RoomDef[] = [
  martysZimmer,
  kueche,
  arbeitszimmer,
  vorgarten,
  docsLabor,
  stadtplan,
  // Nur für die Engine-Tests (?szenario=engine) und den Debug-Modus
  testraum,
  testflur,
];
