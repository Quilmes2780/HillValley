import type { RoomDef } from '../../engine/types';
import { abstellgleis } from './abstellgleis';
import { arbeitszimmer } from './arbeitszimmer';
import { bandraum } from './bandraum';
import { cafe } from './cafe';
import { docsLabor } from './docs_labor';
import { festplatz } from './festplatz';
import { kueche } from './kueche';
import { martysZimmer } from './martys_zimmer';
import { mietstall } from './mietstall';
import { radioladen } from './radioladen';
import { rathausplatz } from './rathausplatz';
import { saloon } from './saloon';
import { schmiede } from './schmiede';
import { schuelerzeitung } from './schuelerzeitung';
import { schuleFlur } from './schule_flur';
import { stadtplan } from './stadtplan';
import { strasseMist } from './strasse_mist';
import { testflur } from './testflur';
import { testraum } from './testraum';
import { turmeingang } from './turmeingang';
import { uhrwerk } from './uhrwerk';
import { veranda } from './veranda';
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
  abstellgleis,
  schmiede,
  saloon,
  festplatz,
  mietstall,
  veranda,
  // Nur für die Engine-Tests (?szenario=engine) und den Debug-Modus
  testraum,
  testflur,
];
