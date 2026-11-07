import Phaser from 'phaser';
import type { AmbienceName, MusicName, SfxName } from '../game/audio';

const MUTE_KEY = 'hv_mute';
const MUSIC_VOLUME = 0.45;
const AMBIENCE_VOLUME = 0.4;
const SFX_VOLUME = 0.8;
const STEP_VOLUME = 0.22;
const FADE_MS = 700;

type LoopSound = Phaser.Sound.WebAudioSound | Phaser.Sound.HTML5AudioSound;

interface Fade {
  sound: LoopSound;
  from: number;
  to: number;
  elapsed: number;
  /** Beim Ausblenden wird der Ton danach entfernt. */
  drop: boolean;
}

/** Musik, Raumklang und Effekte. Eine Instanz für das ganze Spiel, auch über Szenen hinweg. */
export class GameAudio {
  private music: LoopSound | null = null;
  private musicKey: MusicName | null = null;
  private ambience: LoopSound | null = null;
  private ambienceKey: AmbienceName | null = null;
  private fades: Fade[] = [];
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
    game.events.on(Phaser.Core.Events.STEP, (_time: number, delta: number) => this.tickFades(delta));
    game.cache.audio.events.on(Phaser.Cache.Events.ADD, (_cache: unknown, key: string) => this.onLoaded(key));
  }

  get muted(): boolean {
    return this.game.sound.mute;
  }

  get currentMusic(): MusicName | null {
    return this.musicKey;
  }

  get currentAmbience(): AmbienceName | null {
    return this.ambienceKey;
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

  /** Blendet zum neuen Stück über; `null` heißt Stille. */
  playMusic(key: MusicName | null): void {
    if (this.musicKey === key) return;
    this.fadeOut(this.music);
    this.musicKey = key;
    this.music = key ? this.startMusic(key) : null;
  }

  /** Raumklang liegt leise unter der Musik und blendet beim Raumwechsel über. */
  playAmbience(key: AmbienceName | null): void {
    if (this.ambienceKey === key) return;
    this.fadeOut(this.ambience);
    this.ambienceKey = key;
    this.ambience = key ? this.startAmbience(key) : null;
  }

  sfx(key: SfxName, volume = SFX_VOLUME): void {
    this.sfxLog.push(key);
    this.playOnce(`audio/${key}`, volume);
  }

  /** Ein Schritt: Das geschieht so oft, dass es nicht ins Protokoll der Effekte gehört. */
  step(key: SfxName): void {
    this.playOnce(`audio/${key}`, STEP_VOLUME);
  }

  /** Noch nicht geladene Effekte entfallen einfach; der Ton kommt im Hintergrund nach. */
  private playOnce(key: string, volume: number): void {
    if (!this.game.sound.locked && this.game.cache.audio.exists(key)) this.game.sound.play(key, { volume });
  }

  /** Ein Stück, das schon laufen sollte, setzt ein, sobald seine Datei da ist. */
  private onLoaded(key: string): void {
    if (!this.music && this.musicKey && key === `audio/${this.musicKey}`) {
      this.music = this.startMusic(this.musicKey);
    }
    if (!this.ambience && this.ambienceKey && key === `audio/${this.ambienceKey}`) {
      this.ambience = this.startAmbience(this.ambienceKey);
    }
  }

  private startMusic(key: MusicName): LoopSound | null {
    return this.startLoop(`audio/${key}`, MUSIC_VOLUME, () => this.musicKey === key);
  }

  private startAmbience(key: AmbienceName): LoopSound | null {
    return this.startLoop(`audio/${key}`, AMBIENCE_VOLUME, () => this.ambienceKey === key);
  }

  private startLoop(key: string, volume: number, wanted: () => boolean): LoopSound | null {
    if (!this.game.cache.audio.exists(key)) return null;
    const sound = this.game.sound.add(key, { loop: true, volume: 0 }) as LoopSound;
    const begin = (): void => {
      if (!wanted()) return;
      sound.play();
      this.fades.push({ sound, from: 0, to: volume, elapsed: 0, drop: false });
    };
    // Browser erlauben Ton erst nach der ersten Eingabe.
    if (this.game.sound.locked) this.game.sound.once(Phaser.Sound.Events.UNLOCKED, begin);
    else begin();
    return sound;
  }

  private fadeOut(sound: LoopSound | null): void {
    if (!sound) return;
    this.fades = this.fades.filter((f) => f.sound !== sound);
    this.fades.push({ sound, from: sound.volume, to: 0, elapsed: 0, drop: true });
  }

  private tickFades(delta: number): void {
    if (this.fades.length === 0) return;
    this.fades = this.fades.filter((f) => {
      f.elapsed += delta;
      const t = Math.min(1, f.elapsed / FADE_MS);
      f.sound.setVolume(f.from + (f.to - f.from) * t);
      if (t < 1) return true;
      if (f.drop) {
        f.sound.stop();
        f.sound.destroy();
      }
      return false;
    });
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
