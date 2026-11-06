import Phaser from 'phaser';
import { ITEMS } from '../game/items/items';
import { ROOMS } from '../game/rooms';
import { buildCharacterAnimations, queueCharacters } from './CharacterLoader';
import { assetKey } from './RoomManager';

const UI_IMAGES = [
  'panel',
  'panel_plain',
  'arrow_up',
  'arrow_down',
  'arrow_up_off',
  'arrow_down_off',
  'cursor',
  'portrait_active',
  'menu',
];

/** Lädt alles, was die Spieldaten verlangen. Neue Räume brauchen hier keinen Eintrag. */
export class BootScene extends Phaser.Scene {
  constructor() {
    super('boot');
  }

  preload(): void {
    this.load.bitmapFont('hv', 'ui/font.png', 'ui/font.xml');
    for (const name of UI_IMAGES) this.load.image(`ui/${name}`, `ui/${name}.png`);
    for (const item of ITEMS) this.load.image(assetKey(item.icon), item.icon);
    const seen = new Set<string>();
    for (const room of ROOMS) {
      for (const variants of Object.values(room.eras)) {
        for (const variant of variants) {
          const paths = [variant.background];
          for (const hs of variant.hotspots) if (hs.sprite) paths.push(hs.sprite.key);
          for (const path of paths) {
            if (!seen.has(path)) this.load.image(assetKey(path), path);
            seen.add(path);
          }
        }
      }
    }
    queueCharacters(this);
  }

  create(): void {
    buildCharacterAnimations(this);
    this.scene.start('game');
  }
}
