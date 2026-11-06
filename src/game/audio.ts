import type { GameState } from './state';

/** Dateien unter assets/audio/<name>.wav. Eigene Stücke ersetzen einfach die gleichnamige Datei. */
export const MUSIC = ['titel', 'jahr1986', 'tannenburg', 'jahr1955', 'jahr1885', 'jahr2015'] as const;
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
] as const;

export type MusicName = (typeof MUSIC)[number];
export type SfxName = (typeof SFX)[number];

/** Figuren, die statt mit dem Mund mit einem Geräusch sprechen. */
export const SPEECH_SFX: Partial<Record<string, SfxName>> = { einstein: 'bellen' };

/** Die Musik folgt der Zeitebene der aktiven Figur. */
export function musicFor(state: GameState): MusicName {
  const era = state.characters[state.activeCharacter].era;
  if (era === 1885) return 'jahr1885';
  if (era === 1955) return 'jahr1955';
  if (era === 2015) return 'jahr2015';
  return state.timeline.tannenburg ? 'tannenburg' : 'jahr1986';
}
