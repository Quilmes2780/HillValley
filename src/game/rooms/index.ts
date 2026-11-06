import type { RoomDef } from '../../engine/types';
import { testflur } from './testflur';
import { testraum } from './testraum';

/** Neue Räume hier eintragen. Mehr ist nicht nötig. */
export const ROOMS: readonly RoomDef[] = [testraum, testflur];
