import Phaser from 'phaser';
import type { GameState } from '../game/state';
import { ROOMS } from '../game/rooms';
import { audio } from './Audio';
import { t } from './i18n';
import { AUTO_SLOT, SaveSystem, SLOT_COUNT } from './SaveSystem';
import { UI_AMBER, UI_DIM, UI_TEXT } from './theme';

const COLOR_NORMAL = UI_TEXT;
const COLOR_HOVER = UI_AMBER;
const COLOR_DIM = UI_DIM;
const ROW_H = 10;

interface Row {
  label: Phaser.GameObjects.BitmapText;
  y: number;
  action?: () => void;
}

/** Titelbild mit Hauptmenü: neues Spiel, Spiel laden, Ton. */
export class TitleScene extends Phaser.Scene {
  private rows: Row[] = [];
  private message = '';
  private top = 142;

  constructor() {
    super('title');
  }

  create(): void {
    this.add.image(0, 0, 'ui/title').setOrigin(0, 0);
    this.input.setDefaultCursor('none');
    const cursor = this.add.image(160, 100, 'ui/cursor').setDepth(100);
    this.input.mouse?.disableContextMenu();
    this.input.on('pointermove', (p: Phaser.Input.Pointer) => {
      cursor.setPosition(Math.round(p.x), Math.round(p.y));
      this.highlight(p.y);
    });
    this.input.on('pointerdown', (p: Phaser.Input.Pointer) => {
      cursor.setPosition(Math.round(p.x), Math.round(p.y));
      this.rowAt(p.y)?.action?.();
    });
    audio().playMusic('titel');
    this.showMain();

    if (new URLSearchParams(location.search).has('test')) {
      (window as unknown as { __hvTitle: unknown }).__hvTitle = {
        rows: () => this.rows.filter((r) => r.action).map((r) => ({ text: r.label.text, x: 160, y: r.y + 5 })),
        music: () => audio().currentMusic,
        muted: () => audio().muted,
      };
    }
  }

  private clear(): void {
    for (const row of this.rows) row.label.destroy();
    this.rows = [];
  }

  private addRow(text: string, action?: () => void): void {
    const y = this.top + this.rows.length * ROW_H;
    const label = this.add
      .bitmapText(160, y, 'hv', text, 10)
      .setOrigin(0.5, 0)
      .setTint(action ? COLOR_NORMAL : COLOR_DIM);
    this.rows.push({ label, y, action });
  }

  private showMain(): void {
    this.clear();
    this.top = 148;
    this.addRow(t('title.neu'), () => this.startGame());
    this.addRow(t('title.laden'), () => this.showLoad());
    this.addRow(this.soundLabel(), () => {
      audio().toggleMute();
      this.showMain();
    });
  }

  private soundLabel(): string {
    return t(audio().muted ? 'title.ton_aus' : 'title.ton_an');
  }

  private showLoad(): void {
    this.clear();
    this.top = this.message ? 108 : 118;
    if (this.message) this.addRow(this.message);
    for (let slot = 0; slot < SLOT_COUNT; slot++) {
      const file = SaveSystem.peek(slot);
      if (!file) {
        this.addRow(`${slot + 1}: ${t('save.empty')}`);
        continue;
      }
      const c = file.state.characters?.[file.state.activeCharacter];
      const room = ROOMS.find((r) => r.id === c?.room);
      this.addRow(`${slot + 1}: ${room ? t(room.name) : '?'} (${c?.era ?? '?'})`, () => this.loadSlot(slot));
    }
    const auto = SaveSystem.peek(AUTO_SLOT);
    if (auto) {
      const c = auto.state.characters?.[auto.state.activeCharacter];
      const room = ROOMS.find((r) => r.id === c?.room);
      this.addRow(`${t('save.auto')}: ${room ? t(room.name) : '?'} (${c?.era ?? '?'})`, () => this.loadSlot(AUTO_SLOT));
    }
    this.addRow(t('title.zurueck'), () => {
      this.message = '';
      this.showMain();
    });
  }

  private loadSlot(slot: number): void {
    const result = SaveSystem.read(slot);
    if (result.ok) {
      this.startGame(result.state);
      return;
    }
    this.message = t(result.reason === 'too_old' ? 'save.too_old' : 'save.failed');
    this.showLoad();
  }

  private startGame(state?: GameState): void {
    audio().sfx('klick');
    this.scene.start('game', { state });
  }

  private rowAt(y: number): Row | undefined {
    return this.rows.find((row) => y >= row.y && y < row.y + ROW_H);
  }

  private highlight(y: number): void {
    const hovered = this.rowAt(y);
    for (const row of this.rows) {
      if (row.action) row.label.setTint(row === hovered ? COLOR_HOVER : COLOR_NORMAL);
    }
  }
}
