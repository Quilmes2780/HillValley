import Phaser from 'phaser';
import { colorValue } from '../../tools/pixel/palette';
import { AMBIENCE, MUSIC, SFX } from '../game/audio';
import { ITEMS } from '../game/items/items';
import { PICTURES } from '../game/szenen';
import { ROOMS } from '../game/rooms';
import { initAudio } from './Audio';
import { buildCharacterAnimations, queueCharacters } from './CharacterLoader';
import { assetKey } from './RoomManager';

const UI_IMAGES = [
  'panel',
  'panel_plain',
  'key_hover',
  'key_selected',
  'slot_hover',
  'arrow_up',
  'arrow_down',
  'arrow_up_off',
  'arrow_down_off',
  'cursor',
  'portrait_active',
  'menu',
  'title',
];

/** Lädt alles, was die Spieldaten verlangen. Neue Räume brauchen hier keinen Eintrag. */
export class BootScene extends Phaser.Scene {
  constructor() {
    super('boot');
  }

  preload(): void {
    this.load.bitmapFont('hv', 'ui/font.png', 'ui/font.xml');
    for (const name of UI_IMAGES) this.load.image(`ui/${name}`, `ui/${name}.png`);
    for (const item of ITEMS) {
      for (const icon of new Set([item.icon, ...(item.iconVariants ?? [])])) {
        this.load.image(assetKey(icon), icon);
      }
    }
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
          for (const effect of variant.effects ?? []) {
            if ((effect.type !== 'strip' && effect.type !== 'pass') || seen.has(effect.key)) continue;
            seen.add(effect.key);
            if (effect.frameWidth && effect.frameHeight) {
              const frame = { frameWidth: effect.frameWidth, frameHeight: effect.frameHeight };
              this.load.spritesheet(assetKey(effect.key), effect.key, frame);
            } else {
              this.load.image(assetKey(effect.key), effect.key);
            }
          }
        }
      }
    }
    for (const picture of PICTURES) {
      this.load.spritesheet(assetKey(picture.key), picture.key, picture);
    }
    for (const name of [...MUSIC, ...AMBIENCE, ...SFX]) this.load.audio(`audio/${name}`, `audio/${name}.wav`);
    queueCharacters(this);

    // Ladebalken: Musik und Grafik brauchen beim ersten Start einen Moment.
    this.add.rectangle(60, 98, 200, 4, colorValue('grau2')).setOrigin(0, 0);
    const bar = this.add.rectangle(60, 98, 1, 4, colorValue('tuerkis5')).setOrigin(0, 0);
    this.load.on('progress', (value: number) => bar.setSize(Math.max(1, 200 * value), 4));
  }

  create(): void {
    buildCharacterAnimations(this);
    const params = new URLSearchParams(location.search);
    const testMode = params.has('test');
    initAudio(this.game, !testMode);
    // Tests starten direkt im Spiel, außer sie prüfen ausdrücklich das Titelbild.
    this.scene.start(testMode && !params.has('titel') ? 'game' : 'title');
  }
}
