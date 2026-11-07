import type { RoomDef } from '../../engine/types';
import { withExtras } from './extras';
import { abstellgleis } from './abstellgleis';
import { arbeitszimmer } from './arbeitszimmer';
import { bandraum } from './bandraum';
import { buero } from './buero';
import { cafe } from './cafe';
import { cafe80er } from './cafe80er';
import { docsLabor } from './docs_labor';
import { festplatz } from './festplatz';
import { gasse } from './gasse';
import { kueche } from './kueche';
import { lobby } from './lobby';
import { martysZimmer } from './martys_zimmer';
import { mietstall } from './mietstall';
import { museum } from './museum';
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
import { turmplatz } from './turmplatz';
import { uhrwerk } from './uhrwerk';
import { veranda } from './veranda';
import { vorgarten } from './vorgarten';

/** Neue Räume hier eintragen. Mehr ist nicht nötig. */
export const ROOMS: readonly RoomDef[] = withExtras([
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
  turmplatz,
  cafe80er,
  museum,
  lobby,
  buero,
  gasse,
  // Nur für die Engine-Tests (?szenario=engine) und den Debug-Modus
  testraum,
  testflur,
]);
