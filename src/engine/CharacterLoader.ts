import Phaser from 'phaser';
import { colorValue } from '../../tools/pixel/palette';

export const ANIMATIONS = [
  'idle',
  'walk_side',
  'walk_front',
  'walk_back',
  'talk_side',
  'talk_front',
  'pickup',
] as const;
export type AnimName = (typeof ANIMATIONS)[number];

interface CharacterEntry {
  folder: string;
  /** Name einer Palettenfarbe */
  textColor: string;
  portrait: string;
  frameWidth?: number;
  frameHeight?: number;
}

interface CharactersFile {
  frameWidth: number;
  frameHeight: number;
  fps: number;
  characters: Record<string, CharacterEntry>;
}

/** Wenn eine Animation fehlt, spielt die erste vorhandene aus dieser Liste. */
const FALLBACKS: Record<AnimName, AnimName[]> = {
  idle: ['talk_front', 'walk_front', 'walk_side'],
  walk_side: ['walk_front', 'idle'],
  walk_front: ['walk_side', 'idle'],
  walk_back: ['walk_front', 'walk_side', 'idle'],
  talk_side: ['talk_front', 'idle'],
  talk_front: ['talk_side', 'idle'],
  pickup: ['idle'],
};

const CONFIG_KEY = 'characters-config';
const textureKey = (id: string, anim: AnimName): string => `char:${id}:${anim}`;
const animKey = (id: string, anim: AnimName): string => `${id}:${anim}`;
export const portraitKey = (id: string): string => `char:${id}:portrait`;

let config: CharactersFile;

/** Lädt die Konfiguration und reiht danach alle Spritesheets ein. */
export function queueCharacters(scene: Phaser.Scene): void {
  scene.load.json(CONFIG_KEY, 'characters/characters.json');
  scene.load.once(`filecomplete-json-${CONFIG_KEY}`, () => {
    config = scene.cache.json.get(CONFIG_KEY) as CharactersFile;
    for (const [id, entry] of Object.entries(config.characters)) {
      const base = `characters/${entry.folder}/${id}`;
      for (const anim of ANIMATIONS) scene.load.image(textureKey(id, anim), `${base}_${anim}.png`);
      scene.load.image(portraitKey(id), `characters/${entry.folder}/${entry.portrait}`);
    }
  });
}

/**
 * Zerlegt die geladenen Bilder in Frames. Die Anzahl ergibt sich aus der Bildbreite,
 * eigene Spritesheets können also beliebig viele Frames haben.
 */
export function buildCharacterAnimations(scene: Phaser.Scene): void {
  for (const [id, entry] of Object.entries(config.characters)) {
    const fw = entry.frameWidth ?? config.frameWidth;
    const fh = entry.frameHeight ?? config.frameHeight;
    for (const anim of ANIMATIONS) {
      const key = textureKey(id, anim);
      if (!scene.textures.exists(key)) {
        console.warn(`Figur ${id}: Animation ${anim} fehlt, Ersatz wird verwendet.`);
        continue;
      }
      const texture = scene.textures.get(key);
      const source = texture.getSourceImage() as { width: number; height: number };
      const count = Math.floor(source.width / fw);
      if (count < 1 || source.height < fh || source.width % fw !== 0) {
        console.warn(
          `Figur ${id}: ${anim} hat ${source.width}×${source.height} Pixel, erwartet wird ` +
            `eine Zeile aus Frames mit ${fw}×${fh}.`,
        );
      }
      const frames: { key: string; frame: string }[] = [];
      for (let i = 0; i < Math.max(count, 1); i++) {
        texture.add(`f${i}`, 0, i * fw, 0, fw, fh);
        frames.push({ key, frame: `f${i}` });
      }
      scene.anims.create({
        key: animKey(id, anim),
        frames,
        frameRate: anim === 'idle' ? 2 : config.fps,
        repeat: anim === 'pickup' ? 0 : -1,
      });
    }
  }
}

export function resolveAnim(scene: Phaser.Scene, id: string, anim: AnimName): string | null {
  for (const candidate of [anim, ...FALLBACKS[anim]]) {
    const key = animKey(id, candidate);
    if (scene.anims.exists(key)) return key;
  }
  return null;
}

export function textColorOf(id: string): number {
  const entry = config.characters[id];
  return entry ? colorValue(entry.textColor) : 0xffffff;
}

export function characterIds(): string[] {
  return Object.keys(config.characters);
}

export function frameCountOf(scene: Phaser.Scene, id: string, anim: AnimName): number {
  return scene.anims.get(animKey(id, anim))?.frames.length ?? 0;
}
