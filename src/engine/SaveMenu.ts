import Phaser from 'phaser';
import { colorValue } from '../../tools/pixel/palette';
import type { GameScene } from './GameScene';
import { t } from './i18n';
import { SaveSystem, SLOT_COUNT } from './SaveSystem';
import { UI_DEPTH } from './VerbUI';

const DEPTH = UI_DEPTH + 100;
const LEFT = 40;
const TOP = 25;
const SLOT_Y = 66;
const SLOT_H = 13;
const COLOR_NORMAL = colorValue('tuerkis5');
const COLOR_HOVER = colorValue('gelb3');
const COLOR_TITLE = colorValue('gelb2');
const COLOR_DIM = colorValue('grau4');

type Mode = 'save' | 'load';
interface Row {
  text: Phaser.GameObjects.BitmapText;
  y: number;
  action: () => void;
  tint: number;
}

/** Speichern/Laden-Fenster auf F5. */
export class SaveMenu {
  open = false;
  private mode: Mode = 'save';
  private objects: Phaser.GameObjects.GameObject[] = [];
  private rows: Row[] = [];
  private message = '';

  constructor(private readonly scene: GameScene) {}

  toggle(): void {
    if (this.open) this.close();
    else this.show();
  }

  private show(): void {
    this.open = true;
    this.mode = 'save';
    this.message = '';
    this.draw();
  }

  close(): void {
    this.open = false;
    this.clear();
  }

  private clear(): void {
    for (const object of this.objects) object.destroy();
    this.objects = [];
    this.rows = [];
  }

  private label(x: number, y: number, text: string, tint: number): Phaser.GameObjects.BitmapText {
    const label = this.scene.add
      .bitmapText(x, y, 'hv', text, 10)
      .setTint(tint)
      .setScrollFactor(0)
      .setDepth(DEPTH + 1);
    this.objects.push(label);
    return label;
  }

  private row(y: number, text: string, action: () => void, tint = COLOR_NORMAL): void {
    this.rows.push({ text: this.label(LEFT + 8, y, text, tint), y, action, tint });
  }

  private draw(): void {
    this.clear();
    this.objects.push(
      this.scene.add
        .image(LEFT, TOP, 'ui/menu')
        .setOrigin(0, 0)
        .setScrollFactor(0)
        .setDepth(DEPTH),
    );
    this.label(LEFT + 8, TOP + 5, t(this.mode === 'save' ? 'save.title_save' : 'save.title_load'), COLOR_TITLE);
    const other: Mode = this.mode === 'save' ? 'load' : 'save';
    this.row(TOP + 21, t(other === 'save' ? 'save.tab_save' : 'save.tab_load'), () => {
      this.mode = other;
      this.message = '';
      this.draw();
    });

    for (let slot = 0; slot < SLOT_COUNT; slot++) {
      this.row(SLOT_Y + slot * SLOT_H, this.slotLabel(slot), () => this.useSlot(slot));
    }
    if (this.message) this.label(LEFT + 8, SLOT_Y + SLOT_COUNT * SLOT_H, this.message, COLOR_DIM);
    this.row(TOP + 135, t('save.close'), () => this.close());
  }

  private slotLabel(slot: number): string {
    const file = SaveSystem.peek(slot);
    if (!file) return `${slot + 1}: ${t('save.empty')}`;
    const c = file.state.characters?.[file.state.activeCharacter];
    const date = new Date(file.savedAt);
    const stamp = `${String(date.getDate()).padStart(2, '0')}.${String(date.getMonth() + 1).padStart(2, '0')}. ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
    return t('save.slot', {
      n: slot + 1,
      room: c ? this.scene.roomName(c.room) : '?',
      era: c?.era ?? '?',
      date: stamp,
    });
  }

  private useSlot(slot: number): void {
    if (this.mode === 'save') {
      this.message = t(this.scene.saveTo(slot) ? 'save.saved' : 'save.failed');
      this.draw();
      return;
    }
    const result = SaveSystem.read(slot);
    if (result.ok) {
      this.scene.applyLoadedState(result.state);
      this.close();
      return;
    }
    const reasons = { empty: 'save.nothing', too_old: 'save.too_old', failed: 'save.failed' } as const;
    this.message = t(reasons[result.reason]);
    this.draw();
  }

  private rowAt(y: number): Row | undefined {
    return this.rows.find((row) => y >= row.y && y < row.y + SLOT_H);
  }

  onMove(y: number): void {
    const hovered = this.rowAt(y);
    for (const row of this.rows) row.text.setTint(row === hovered ? COLOR_HOVER : row.tint);
  }

  onClick(y: number): void {
    this.rowAt(y)?.action();
  }

  /** Zeilen mit Mittelpunkt, für den automatischen Test. */
  layout(): { text: string; x: number; y: number }[] {
    return this.rows.map((row) => ({ text: row.text.text, x: LEFT + 40, y: row.y + 5 }));
  }
}
