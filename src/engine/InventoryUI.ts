import Phaser from 'phaser';
import type { GameState } from '../game/state';
import { assetKey } from './RoomManager';
import type { ItemDef, ItemId } from './types';
import { UI_DEPTH } from './VerbUI';

const LEFT = 132;
const TOP = 156;
const CELL_W = 38;
const CELL_H = 22;
const COLS = 4;
const ROWS = 2;
const ARROW_X = 285;

export type InventoryHit = { kind: 'item'; id: ItemId } | { kind: 'up' } | { kind: 'down' };

/** 4×2 Inventarfelder mit Blätterpfeilen. */
export class InventoryUI {
  private readonly icons: Phaser.GameObjects.Image[] = [];
  private readonly up: Phaser.GameObjects.Image;
  private readonly down: Phaser.GameObjects.Image;
  private readonly hoverSlot: Phaser.GameObjects.Image;
  private ids: ItemId[] = [];
  private offset = 0;
  private visible = true;

  constructor(
    private readonly scene: Phaser.Scene,
    private readonly items: readonly ItemDef[],
    private readonly getState: () => GameState,
  ) {
    // Vor den Icons angelegt, liegt also bei gleicher Tiefe unter ihnen.
    this.hoverSlot = scene.add
      .image(LEFT, TOP, 'ui/slot_hover')
      .setOrigin(0, 0)
      .setScrollFactor(0)
      .setDepth(UI_DEPTH + 1)
      .setVisible(false);
    this.up = scene.add
      .image(ARROW_X, TOP, 'ui/arrow_up_off')
      .setOrigin(0, 0)
      .setScrollFactor(0)
      .setDepth(UI_DEPTH + 1);
    this.down = scene.add
      .image(ARROW_X, TOP + CELL_H, 'ui/arrow_down_off')
      .setOrigin(0, 0)
      .setScrollFactor(0)
      .setDepth(UI_DEPTH + 1);
  }

  private get maxOffset(): number {
    const rows = Math.ceil(this.ids.length / COLS);
    return Math.max(0, (rows - ROWS) * COLS);
  }

  refresh(ids: readonly ItemId[]): void {
    const state = this.getState();
    this.ids = [...ids];
    this.offset = Math.min(this.offset, this.maxOffset);
    for (const icon of this.icons) icon.destroy();
    this.icons.length = 0;
    this.visibleIds().forEach((id, i) => {
      const item = this.items.find((entry) => entry.id === id);
      if (!item) return;
      const { x, y } = this.cellPosition(i);
      this.icons.push(
        this.scene.add
          .image(x + 2, y, assetKey(item.iconFor ? item.iconFor(state) : item.icon))
          .setOrigin(0, 0)
          .setScrollFactor(0)
          .setDepth(UI_DEPTH + 1)
          .setVisible(this.visible),
      );
    });
    this.up.setTexture(this.offset > 0 ? 'ui/arrow_up' : 'ui/arrow_up_off');
    this.down.setTexture(this.offset < this.maxOffset ? 'ui/arrow_down' : 'ui/arrow_down_off');
  }

  private visibleIds(): ItemId[] {
    return this.ids.slice(this.offset, this.offset + COLS * ROWS);
  }

  private cellPosition(index: number): { x: number; y: number } {
    return { x: LEFT + (index % COLS) * CELL_W, y: TOP + Math.floor(index / COLS) * CELL_H };
  }

  hit(x: number, y: number): InventoryHit | null {
    if (y < TOP) return null;
    if (x >= ARROW_X && x < ARROW_X + 11) return y < TOP + CELL_H ? { kind: 'up' } : { kind: 'down' };
    if (x < LEFT || x >= LEFT + COLS * CELL_W) return null;
    const col = Math.floor((x - LEFT) / CELL_W);
    const row = Math.min(Math.floor((y - TOP) / CELL_H), ROWS - 1);
    const id = this.visibleIds()[row * COLS + col];
    return id ? { kind: 'item', id } : null;
  }

  /** Hebt das Feld unter der Maus hervor. */
  setHover(id: ItemId | null): void {
    const index = id ? this.visibleIds().indexOf(id) : -1;
    if (index < 0 || !this.visible) {
      this.hoverSlot.setVisible(false);
      return;
    }
    const { x, y } = this.cellPosition(index);
    this.hoverSlot.setPosition(x, y).setVisible(true);
  }

  scroll(direction: 'up' | 'down'): void {
    const delta = direction === 'up' ? -COLS : COLS;
    this.offset = Phaser.Math.Clamp(this.offset + delta, 0, this.maxOffset);
    this.refresh(this.ids);
  }

  setVisible(visible: boolean): void {
    this.visible = visible;
    if (!visible) this.hoverSlot.setVisible(false);
    for (const icon of this.icons) icon.setVisible(visible);
    this.up.setVisible(visible);
    this.down.setVisible(visible);
  }

  /** Sichtbare Felder mit Mittelpunkt, für den automatischen Test. */
  layout(): { id: ItemId; x: number; y: number }[] {
    return this.visibleIds().map((id, i) => {
      const { x, y } = this.cellPosition(i);
      return { id, x: x + 18, y: y + 10 };
    });
  }

  arrowCenter(direction: 'up' | 'down'): { x: number; y: number } {
    return { x: ARROW_X + 5, y: TOP + (direction === 'up' ? 10 : CELL_H + 10) };
  }
}
