import Phaser from 'phaser';
import { AMBIENCE, MUSIC, SFX } from '../game/audio';

/**
 * Lädt den Ton im Hintergrund, während das Spiel schon läuft. Das Spiel wartet nie darauf:
 * Eine langsame Leitung oder eine hängende Datei kostet höchstens den Klang, nie den Start.
 */
export class AudioLoadScene extends Phaser.Scene {
  constructor() {
    super({ key: 'audioload', loader: { maxParallelDownloads: 4, timeout: 120_000 } });
  }

  preload(): void {
    // Zuerst, was sofort zu hören sein soll; die großen Musikstücke zuletzt.
    const [first, ...rest] = MUSIC;
    for (const name of [first, ...SFX, ...AMBIENCE, ...rest]) {
      this.load.audio(`audio/${name}`, `audio/${name}.wav`);
    }
  }
}
