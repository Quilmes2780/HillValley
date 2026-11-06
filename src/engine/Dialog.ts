import { Story } from 'inkjs';
import Phaser from 'phaser';
import { colorValue } from '../../tools/pixel/palette';
import type { FlagName } from '../game/flags';
import type { CharacterId } from '../game/state';
import type { GameScene } from './GameScene';
import type { ScriptApi } from './types';
import { UI_DEPTH } from './VerbUI';

const stories = import.meta.glob<string>('../game/dialogs/*.ink', { eager: true, import: 'default' });

const MAX_CHOICES = 4;
const MAX_WIDTH = 312;
const LEFT = 4;
const TOP = 155;
const ROW_H = 11;
const COLOR_NORMAL = colorValue('tuerkis5');
const COLOR_HOVER = colorValue('gelb3');

/** Spielt .ink-Dialoge ab: Zeilen über den Köpfen, Antworten anstelle der Verbleiste. */
export class Dialog {
  private rows: Phaser.GameObjects.BitmapText[] = [];
  private choose: ((index: number) => void) | null = null;

  constructor(private readonly scene: GameScene) {}

  get choosing(): boolean {
    return this.choose !== null;
  }

  async run(id: string, api: ScriptApi): Promise<void> {
    const entry = Object.entries(stories).find(([path]) => path.endsWith(`/${id}.ink`));
    if (!entry) throw new Error(`Unbekannter Dialog: ${id}`);
    const story = new Story(entry[1]);
    story.BindExternalFunction('setFlag', (name: string) => api.setFlag(name as FlagName));
    story.BindExternalFunction('hasFlag', (name: string) => Boolean(api.getFlag(name as FlagName)));
    story.BindExternalFunction('giveItem', (item: string) => api.addItem(item));
    story.BindExternalFunction('unlock', (who: string) => api.unlockCharacter(who as CharacterId));

    for (;;) {
      while (story.canContinue) {
        const line = (story.Continue() ?? '').trim();
        if (!line) continue;
        const match = /^([a-z_]+):\s*(.*)$/.exec(line);
        const speaker = match && match[1] !== 'ich' ? match[1] : this.scene.state.activeCharacter;
        await this.scene.sayLine(speaker, match ? match[2] : line);
      }
      if (story.currentChoices.length === 0) break;
      const index = await this.askChoice(story.currentChoices.map((choice) => choice.text));
      story.ChooseChoiceIndex(index);
    }
  }

  private askChoice(texts: string[]): Promise<number> {
    if (texts.length > MAX_CHOICES) {
      console.warn(`Dialog hat ${texts.length} Antworten, erlaubt sind ${MAX_CHOICES}.`);
    }
    this.scene.setPanelForChoices(true);
    this.rows = texts.slice(0, MAX_CHOICES).map((text, i) => {
      const row = this.scene.add
        .bitmapText(LEFT, TOP + i * ROW_H, 'hv', text, 10)
        .setTint(COLOR_NORMAL)
        .setScrollFactor(0)
        .setDepth(UI_DEPTH + 1);
      if (row.width > MAX_WIDTH) console.warn(`Antwort zu lang (${row.width} px): ${text}`);
      return row;
    });
    return new Promise((resolve) => {
      this.choose = (index) => {
        this.choose = null;
        for (const row of this.rows) row.destroy();
        this.rows = [];
        this.scene.setPanelForChoices(false);
        resolve(index);
      };
    });
  }

  private rowAt(y: number): number {
    const index = Math.floor((y - TOP) / ROW_H);
    return index >= 0 && index < this.rows.length ? index : -1;
  }

  onMove(y: number): void {
    const hovered = this.rowAt(y);
    this.rows.forEach((row, i) => row.setTint(i === hovered ? COLOR_HOVER : COLOR_NORMAL));
  }

  onClick(y: number): void {
    const index = this.rowAt(y);
    if (index >= 0) this.choose?.(index);
  }

  /** Antworten mit Mittelpunkt, für den automatischen Test. */
  layout(): { text: string; x: number; y: number }[] {
    return this.rows.map((row, i) => ({
      text: row.text,
      x: LEFT + 10,
      y: TOP + i * ROW_H + ROW_H / 2,
    }));
  }
}
