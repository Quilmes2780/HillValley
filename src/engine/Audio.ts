import Phaser from 'phaser';
import type { MusicName, SfxName } from '../game/audio';

const MUTE_KEY = 'hv_mute';
const MUSIC_VOLUME = 0.45;
const SFX_VOLUME = 0.8;

/** Musik und Effekte. Eine Instanz für das ganze Spiel, auch über Szenen hinweg. */
export class GameAudio {
  private music: Phaser.Sound.BaseSound | null = null;
  private musicKey: MusicName | null = null;
  readonly sfxLog: SfxName[] = [];

  constructor(
    private readonly game: Phaser.Game,
    private readonly persist: boolean,
  ) {
    let muted = !persist; // In Tests bleibt es still.
    if (persist) {
      try {
        muted = localStorage.getItem(MUTE_KEY) === '1';
      } catch {
        muted = false;
      }
    }
    game.sound.mute = muted;
    window.addEventListener('keydown', (event) => {
      if (event.key === 'm' || event.key === 'M') this.toggleMute();
    });
  }

  get muted(): boolean {
    return this.game.sound.mute;
  }

  get currentMusic(): MusicName | null {
    return this.musicKey;
  }

  get musicPlaying(): boolean {
    return this.music?.isPlaying ?? false;
  }

  toggleMute(): void {
    this.game.sound.mute = !this.game.sound.mute;
    if (!this.persist) return;
    try {
      localStorage.setItem(MUTE_KEY, this.game.sound.mute ? '1' : '0');
    } catch {
      // Ohne Speicher gilt die Einstellung nur bis zum Neuladen.
    }
  }

  playMusic(key: MusicName): void {
    if (this.musicKey === key) return;
    this.music?.stop();
    this.music?.destroy();
    this.musicKey = key;
    const sound = this.game.sound.add(`audio/${key}`, { loop: true, volume: MUSIC_VOLUME });
    this.music = sound;
    // Browser erlauben Ton erst nach der ersten Eingabe.
    if (this.game.sound.locked) {
      this.game.sound.once(Phaser.Sound.Events.UNLOCKED, () => {
        if (this.music === sound) sound.play();
      });
    } else {
      sound.play();
    }
  }

  sfx(key: SfxName): void {
    this.sfxLog.push(key);
    if (!this.game.sound.locked) this.game.sound.play(`audio/${key}`, { volume: SFX_VOLUME });
  }
}

let instance: GameAudio | null = null;

export function initAudio(game: Phaser.Game, persist: boolean): GameAudio {
  instance ??= new GameAudio(game, persist);
  return instance;
}

export function audio(): GameAudio {
  if (!instance) throw new Error('Audio ist noch nicht bereit.');
  return instance;
}
