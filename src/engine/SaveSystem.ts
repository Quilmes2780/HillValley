import { SAVE_VERSION, type GameState } from '../game/state';

export const SLOT_COUNT = 6;
/** Eigener Platz für das automatische Speichern beim Raumwechsel. */
export const AUTO_SLOT = -1;
const key = (slot: number): string => (slot === AUTO_SLOT ? 'hv_save_auto' : `hv_save_${slot}`);

export interface SaveFile {
  savedAt: number;
  state: GameState;
}

export type LoadResult =
  | { ok: true; state: GameState }
  | { ok: false; reason: 'empty' | 'too_old' | 'failed' };

/** Spielstände in localStorage. Der Speicher kann fehlen oder gesperrt sein, daher überall try/catch. */
export const SaveSystem = {
  write(slot: number, state: GameState): boolean {
    try {
      const file: SaveFile = { savedAt: Date.now(), state };
      localStorage.setItem(key(slot), JSON.stringify(file));
      return true;
    } catch {
      return false;
    }
  },

  peek(slot: number): SaveFile | null {
    try {
      const raw = localStorage.getItem(key(slot));
      return raw ? (JSON.parse(raw) as SaveFile) : null;
    } catch {
      return null;
    }
  },

  read(slot: number): LoadResult {
    let raw: string | null;
    try {
      raw = localStorage.getItem(key(slot));
    } catch {
      return { ok: false, reason: 'failed' };
    }
    if (!raw) return { ok: false, reason: 'empty' };
    try {
      const file = JSON.parse(raw) as SaveFile;
      if (file.state?.version !== SAVE_VERSION) return { ok: false, reason: 'too_old' };
      return { ok: true, state: file.state };
    } catch {
      return { ok: false, reason: 'failed' };
    }
  },
};
