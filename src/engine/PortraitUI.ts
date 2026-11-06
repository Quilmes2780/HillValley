import Phaser from 'phaser';
import { portraitKey } from './CharacterLoader';
import { UI_DEPTH } from './VerbUI';

const LEFT = 296;
const TOP = 155;
const SLOT_H = 15;

/** Porträt-Spalte für den Figurenwechsel. Erscheint erst ab zwei freigeschalteten Figuren. */
export class PortraitUI {
  private readonly images: Phaser.GameObjects.GameObject[] = [];
  private ids: string[] = [];
  private visible = true;

  constructor(private readonly scene: Phaser.Scene) {}

  refresh(unlocked: readonly string[], active: string): void {
    for (const image of this.images) image.destroy();
    this.images.length = 0;
    this.ids = unlocked.length >= 2 ? [...unlocked] : [];
    this.ids.forEach((id, i) => {
      const y = TOP + i * SLOT_H;
      const portrait = this.scene.add
        .image(LEFT + 1, y + 1, portraitKey(id))
        .setOrigin(0, 0)
        .setScrollFactor(0)
        .setDepth(UI_DEPTH + 1)
        .setVisible(this.visible);
      this.images.push(portrait);
      if (id === active) {
        this.images.push(
          this.scene.add
            .image(LEFT, y, 'ui/portrait_active')
            .setOrigin(0, 0)
            .setScrollFactor(0)
            .setDepth(UI_DEPTH + 2)
            .setVisible(this.visible),
        );
      }
    });
  }

  hit(x: number, y: number): string | null {
    if (x < LEFT || y < TOP) return null;
    return this.ids[Math.floor((y - TOP) / SLOT_H)] ?? null;
  }

  setVisible(visible: boolean): void {
    this.visible = visible;
    for (const image of this.images) {
      (image as Phaser.GameObjects.Image).setVisible(visible);
    }
  }

  layout(): { id: string; x: number; y: number }[] {
    return this.ids.map((id, i) => ({ id, x: LEFT + 12, y: TOP + i * SLOT_H + 7 }));
  }
}
