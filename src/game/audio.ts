import type { RoomVariant } from '../engine/types';
import type { GameState } from './state';

/** Dateien unter assets/audio/<name>.wav. Eigene Stücke ersetzen einfach die gleichnamige Datei. */
export const MUSIC = [
  'titel',
  'jahr1986',
  'tannenburg',
  'jahr1955',
  'jahr1885',
  'jahr2015',
  'saloon',
  'diner',
  'cafe80er',
  'showdown',
  'abspann',
] as const;

export const FLOORS = ['holz', 'stein', 'teppich', 'erde', 'metall'] as const;

export const SFX = [
  'klick',
  'nimm',
  'tuer',
  'welle',
  'senden',
  'bellen',
  'alarm',
  'knall',
  'platsch',
  'gitarre',
  'rekord',
  'reissen',
  'scanner',
  'aufzug',
  'akzent',
  'zeitsprung',
  'pferd',
  'pfeife',
  'fall',
  'arcade',
  'funken',
  'dampf',
  'schritt_holz',
  'schritt_stein',
  'schritt_teppich',
  'schritt_erde',
  'schritt_metall',
  'murmel_hoch',
  'murmel_mittel',
  'murmel_tief',
  'murmel_robot',
] as const;

/** Leise Dauerschleifen, die unter der Musik liegen. */
export const AMBIENCE = [
  'amb_uhrwerk',
  'amb_labor',
  'amb_regen',
  'amb_wind',
  'amb_kneipe',
  'amb_cafe',
  'amb_stadt',
  'amb_schule',
  'amb_esse',
  'amb_zukunft',
] as const;

export type MusicName = (typeof MUSIC)[number];
export type SfxName = (typeof SFX)[number];
export type AmbienceName = (typeof AMBIENCE)[number];
export type FloorName = (typeof FLOORS)[number];

const VOICES: Record<string, SfxName> = {
  einstein: 'bellen',
  lorraine: 'murmel_hoch',
  jennifer: 'murmel_hoch',
  clara: 'murmel_hoch',
  george_jung: 'murmel_hoch',
  verne: 'murmel_hoch',
  jules: 'murmel_hoch',
  marty: 'murmel_mittel',
  doc_jung: 'murmel_mittel',
  doc: 'murmel_mittel',
  lou: 'murmel_mittel',
  goldie: 'murmel_mittel',
  haendler: 'murmel_mittel',
  feuerwerker: 'murmel_mittel',
  biff: 'murmel_tief',
  biff_jung: 'murmel_tief',
  buford: 'murmel_tief',
  brix: 'murmel_tief',
  kowalski: 'murmel_tief',
  strickland: 'murmel_tief',
  barkeeper: 'murmel_tief',
  maurer: 'murmel_tief',
  kellnerroboter: 'murmel_robot',
  museumsroboter: 'murmel_robot',
};

/** Keine Sprachausgabe, nur ein kurzer Laut pro Zeile. */
export function voiceOf(actor: string): SfxName | undefined {
  return VOICES[actor];
}

/** Ein Raum kann ein eigenes Stück haben, sonst folgt die Musik der Zeitebene der aktiven Figur. */
export function musicFor(state: GameState, variant?: RoomVariant): MusicName {
  if (variant?.music) return variant.music;
  const era = state.characters[state.activeCharacter].era;
  if (era === 1885) return 'jahr1885';
  if (era === 1955) return 'jahr1955';
  if (era === 2015) return 'jahr2015';
  return state.timeline.tannenburg ? 'tannenburg' : 'jahr1986';
}
