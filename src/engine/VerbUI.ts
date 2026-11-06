import Phaser from 'phaser';
import { colorValue } from '../../tools/pixel/palette';
import { t } from './i18n';
import { VERBS, type Verb } from './types';

export const UI_DEPTH = 2000;
const CELL_W = 43;
const CELL_H = 15;
const TOP = 155;

const COLOR_NORMAL = colorValue('tuerkis4');
const COLOR_HOVER = colorValue('tuerkis6');
const COLOR_DEFAULT = colorValue('weiss');
const COLOR_SELECTED = colorValue('gelb2');
const COLOR_SENTENCE = colorValue('tuerkis6');

/** Satzzeile und 3×3-Verbleiste. */
export class VerbUI {
  private readonly labels: Phaser.GameObjects.BitmapText[] = [];
  private readonly sentenceText: Phaser.GameObjects.BitmapText;
  private currentSentence = '';

  constructor(scene: Phaser.Scene) {
    this.sentenceText = scene.add
      .bitmapText(4, 145, 'hv', '', 10)
      .setTint(COLOR_SENTENCE)
      .setScrollFactor(0)
      .setDepth(UI_DEPTH + 1);
    VERBS.forEach((verb, i) => {
      const { x, y } = this.positionOf(i);
      this.labels.push(
        scene.add
          .bitmapText(x + 3, y + 3, 'hv', t(`verb.${verb}`), 10)
          .setTint(COLOR_NORMAL)
          .setScrollFactor(0)
          .setDepth(UI_DEPTH + 1),
      );
    });
  }

  private positionOf(index: number): { x: number; y: number } {
    return { x: (index % 3) * CELL_W, y: TOP + Math.floor(index / 3) * CELL_H };
  }

  hit(x: number, y: number): Verb | null {
    if (x >= CELL_W * 3 || y < TOP) return null;
    const index = Math.floor(y - TOP) / CELL_H;
    const row = Math.min(Math.floor(index), 2);
    return VERBS[row * 3 + Math.floor(x / CELL_W)] ?? null;
  }

  /** Mitte eines Verbs, für den automatischen Test. */
  centerOf(verb: Verb): { x: number; y: number } {
    const { x, y } = this.positionOf(VERBS.indexOf(verb));
    return { x: x + CELL_W / 2, y: y + CELL_H / 2 };
  }

  /** Färbt die Verben: gewählt, unter der Maus, Standardverb des Objekts unter der Maus. */
  highlight(selected: Verb | null, hovered: Verb | null, fallback: Verb | null): void {
    VERBS.forEach((verb, i) => {
      let color = COLOR_NORMAL;
      if (verb === fallback) color = COLOR_DEFAULT;
      if (verb === hovered) color = COLOR_HOVER;
      if (verb === selected) color = COLOR_SELECTED;
      this.labels[i].setTint(color);
    });
  }

  setSentence(text: string): void {
    if (text === this.currentSentence) return;
    this.currentSentence = text;
    this.sentenceText.setText(text);
  }

  get sentence(): string {
    return this.currentSentence;
  }

  setVerbsVisible(visible: boolean): void {
    for (const label of this.labels) label.setVisible(visible);
  }

  setSentenceVisible(visible: boolean): void {
    this.sentenceText.setVisible(visible);
  }
}
