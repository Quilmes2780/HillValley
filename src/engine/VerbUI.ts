import Phaser from 'phaser';
import { t } from './i18n';
import { UI_AMBER, UI_BRIGHT, UI_TEXT } from './theme';
import { VERBS, type Verb } from './types';

export const UI_DEPTH = 2000;
const CELL_W = 43;
const CELL_H = 15;
const TOP = 155;

/** Die Taste liegt im Feld, 1 Pixel Abstand links. Maße wie in tools/paint/ui.ts. */
const KEY_LEFT = 1;
const LABEL_Y = 3;

/** Satzzeile und 3×3-Verbleiste. */
export class VerbUI {
  private readonly labels: Phaser.GameObjects.BitmapText[] = [];
  private readonly keys: Phaser.GameObjects.Image[] = [];
  private readonly sentenceText: Phaser.GameObjects.BitmapText;
  private currentSentence = '';
  private verbsVisible = true;

  constructor(scene: Phaser.Scene) {
    this.sentenceText = scene.add
      .bitmapText(4, 145, 'hv', '', 10)
      .setTint(UI_AMBER)
      .setScrollFactor(0)
      .setDepth(UI_DEPTH + 1);
    VERBS.forEach((verb, i) => {
      const { x, y } = this.positionOf(i);
      // Die erleuchtete Taste liegt über dem Bild der Leiste und ist nur bei Bedarf zu sehen.
      this.keys.push(
        scene.add
          .image(x + KEY_LEFT, y, 'ui/key_hover')
          .setOrigin(0, 0)
          .setScrollFactor(0)
          .setDepth(UI_DEPTH + 1)
          .setVisible(false),
      );
      const label = scene.add
        .bitmapText(x, y + LABEL_Y, 'hv', t(`verb.${verb}`), 10)
        .setTint(UI_TEXT)
        .setScrollFactor(0)
        .setDepth(UI_DEPTH + 2);
      label.setX(x + Math.round((CELL_W - label.width) / 2));
      this.labels.push(label);
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
      const { y } = this.positionOf(i);
      const isSelected = verb === selected;
      const lit = isSelected || verb === hovered;
      let color = UI_TEXT;
      if (verb === fallback) color = UI_AMBER;
      if (lit) color = UI_BRIGHT;
      this.labels[i].setTint(color).setY(y + LABEL_Y + (isSelected ? 1 : 0)); // Gewählt: Taste ist gedrückt
      this.keys[i].setTexture(isSelected ? 'ui/key_selected' : 'ui/key_hover').setVisible(lit && this.verbsVisible);
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
    this.verbsVisible = visible;
    for (const label of this.labels) label.setVisible(visible);
    if (!visible) for (const key of this.keys) key.setVisible(false);
  }

  setSentenceVisible(visible: boolean): void {
    this.sentenceText.setVisible(visible);
  }
}
