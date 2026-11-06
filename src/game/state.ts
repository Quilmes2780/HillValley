import type { Dir, Era, ItemId } from '../engine/types';
import type { FlagName } from './flags';

/** Beim Ändern des Formats erhöhen: Ältere Spielstände werden dann abgewiesen. */
export const SAVE_VERSION = 1;

export type CharacterId = 'marty' | 'doc_jung' | 'doc';

export interface CharacterState {
  room: string;
  era: Era;
  x: number;
  y: number;
  face: Dir;
  inventory: ItemId[];
}

export interface GameState {
  version: number;
  flags: Partial<Record<FlagName, boolean | number>>;
  chapter: number;
  photoStage: 0 | 1 | 2 | 3 | 4;
  timeline: { tannenburg: boolean };
  chronopost: {
    mode: 'aus' | 'notbetrieb' | 'verstaerkt' | 'schluessel';
    year: Era;
    inbox: ItemId[];
  };
  activeCharacter: CharacterId;
  unlockedCharacters: CharacterId[];
  characters: Record<CharacterId, CharacterState>;
}

/** `spiel` ist das echte Spiel. `engine` startet in den Testräumen und dient den Engine-Tests. */
export type Scenario = 'spiel' | 'engine';

export function createInitialState(scenario: Scenario = 'spiel'): GameState {
  const state = createEngineState();
  if (scenario === 'spiel') {
    state.characters.marty = {
      room: 'martys_zimmer',
      era: 1986,
      x: 200,
      y: 116,
      face: 'vorne',
      inventory: ['foto'],
    };
  }
  return state;
}

function createEngineState(): GameState {
  return {
    version: SAVE_VERSION,
    flags: {},
    chapter: 0,
    photoStage: 0,
    timeline: { tannenburg: false },
    chronopost: { mode: 'aus', year: 1955, inbox: [] },
    activeCharacter: 'marty',
    unlockedCharacters: ['marty'],
    characters: {
      marty: { room: 'testraum', era: 1986, x: 110, y: 122, face: 'vorne', inventory: ['foto'] },
      doc_jung: { room: 'testraum', era: 1885, x: 220, y: 120, face: 'links', inventory: [] },
      doc: { room: 'testflur', era: 1986, x: 300, y: 122, face: 'links', inventory: [] },
    },
  };
}
