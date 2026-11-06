import type { RoomDef } from '../../engine/types';
import { arbeitszimmer } from './arbeitszimmer';
import { bandraum } from './bandraum';
import { cafe } from './cafe';
import { docsLabor } from './docs_labor';
import { kueche } from './kueche';
import { martysZimmer } from './martys_zimmer';
import { radioladen } from './radioladen';
import { rathausplatz } from './rathausplatz';
import { schuelerzeitung } from './schuelerzeitung';
import { schuleFlur } from './schule_flur';
import { stadtplan } from './stadtplan';
import { strasseMist } from './strasse_mist';
import { testflur } from './testflur';
import { testraum } from './testraum';
import { turmeingang } from './turmeingang';
import { uhrwerk } from './uhrwerk';
import { vorgarten } from './vorgarten';

/** Neue Räume hier eintragen. Mehr ist nicht nötig. */
export const ROOMS: readonly RoomDef[] = [
  martysZimmer,
  kueche,
  arbeitszimmer,
  vorgarten,
  docsLabor,
  stadtplan,
  rathausplatz,
  turmeingang,
  uhrwerk,
  schuleFlur,
  bandraum,
  schuelerzeitung,
  cafe,
  radioladen,
  strasseMist,
  // Nur für die Engine-Tests (?szenario=engine) und den Debug-Modus
  testraum,
  testflur,
];
