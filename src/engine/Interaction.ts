import { hasText, t, textList } from './i18n';
import type { Combo, Comments, Hotspot, ItemDef, ItemId, Script, Verb } from './types';

export type Target = { kind: 'hotspot'; hotspot: Hotspot } | { kind: 'item'; id: ItemId };

export interface Action {
  verb: Verb | null;
  a: Target;
  b?: Target;
}

function sameTarget(x: Target, y: Target): boolean {
  if (x.kind === 'item' && y.kind === 'item') return x.id === y.id;
  if (x.kind === 'hotspot' && y.kind === 'hotspot') return x.hotspot.id === y.hotspot.id;
  return false;
}

/** Zustand der Satzzeile: gewähltes Verb, erstes Objekt, Objekt unter dem Mauszeiger. */
export class Interaction {
  verb: Verb | null = null;
  first: Target | null = null;
  hover: Target | null = null;

  constructor(private readonly items: readonly ItemDef[]) {}

  private item(id: ItemId): ItemDef {
    const item = this.items.find((i) => i.id === id);
    if (!item) throw new Error(`Unbekannter Gegenstand: ${id}`);
    return item;
  }

  nameOf(target: Target): string {
    return t(target.kind === 'item' ? this.item(target.id).name : target.hotspot.name);
  }

  reset(): void {
    this.verb = null;
    this.first = null;
  }

  selectVerb(verb: Verb): void {
    this.verb = verb;
    this.first = null;
  }

  /** Verb, das ein Rechtsklick auf dieses Objekt auslöst; null heißt Gehe zu. */
  defaultVerbOf(target: Target): Verb | null {
    if (target.kind === 'item') return 'schauan';
    return target.hotspot.defaultVerb ?? (target.hotspot.exit ? null : 'schauan');
  }

  /** Verarbeitet einen Klick auf ein Objekt. Liefert eine Aktion, sobald der Satz vollständig ist. */
  click(target: Target, right: boolean): Action | null {
    if (right) {
      const action: Action = { verb: this.defaultVerbOf(target), a: target };
      this.reset();
      return action;
    }
    if (this.first) {
      if (sameTarget(this.first, target)) return null;
      const action: Action = { verb: this.verb, a: this.first, b: target };
      this.reset();
      return action;
    }
    if (this.verb === null) {
      if (target.kind === 'hotspot') return { verb: null, a: target };
      this.verb = 'benutze';
    }
    if (this.needsSecondObject(this.verb, target)) {
      this.first = target;
      return null;
    }
    const action: Action = { verb: this.verb, a: target };
    this.reset();
    return action;
  }

  private needsSecondObject(verb: Verb, target: Target): boolean {
    if (verb === 'gib') return target.kind === 'item';
    if (verb !== 'benutze') return false;
    if (target.kind === 'item') return !this.item(target.id).verbs?.benutze;
    const hs = target.hotspot;
    return !hs.verbs?.benutze && Object.keys(hs.useWith ?? {}).length > 0;
  }

  /** Text der Satzzeile, z. B. „Benutze Banane mit Mr. Fusion“. */
  sentence(): string {
    return this.describe(this.verb, this.first, this.hover);
  }

  describeAction(action: Action): string {
    return action.b
      ? this.describe(action.verb, action.a, action.b)
      : this.describe(action.verb, null, action.a);
  }

  private describe(verb: Verb | null, first: Target | null, second: Target | null): string {
    const word = verb ? t(`verb.${verb}`) : t('sentence.gehe');
    if (!first) return second ? `${word} ${this.nameOf(second)}` : word;
    const prep = t(verb === 'gib' ? 'sentence.an' : 'sentence.mit');
    const head = `${word} ${this.nameOf(first)} ${prep}`;
    return second && !sameTarget(first, second) ? `${head} ${this.nameOf(second)}` : head;
  }

  /**
   * Bestimmt die Reaktion in fester Reihenfolge: Hotspot-Skript, Kombinationsregel,
   * objektspezifischer Kommentar, Standardspruch der aktiven Figur.
   */
  resolve(action: Action, combos: readonly Combo[]): Script | null {
    const { verb, a, b } = action;
    if (verb === null) return null;
    if (!b) {
      if (a.kind === 'hotspot') {
        return a.hotspot.verbs?.[verb] ?? commentScript(verb, a.hotspot.comments);
      }
      const item = this.item(a.id);
      const direct = item.verbs?.[verb];
      if (direct) return direct;
      if (verb === 'schauan') {
        return async (g) => {
          const d = item.description;
          await g.say(typeof d === 'function' ? d(g.state) : d);
        };
      }
      return commentScript(verb, item.comments);
    }
    const hotspot = a.kind === 'hotspot' ? a.hotspot : b.kind === 'hotspot' ? b.hotspot : null;
    const itemTarget = a.kind === 'item' ? a : b.kind === 'item' ? b : null;
    if (hotspot) {
      const script = itemTarget && hotspot.useWith?.[itemTarget.id];
      return script || commentScript(verb, hotspot.comments);
    }
    if (a.kind === 'item' && b.kind === 'item') {
      const combo = combos.find(
        (c) => (c.a === a.id && c.b === b.id) || (c.a === b.id && c.b === a.id),
      );
      if (combo) return combo.run;
      return commentScript(verb, this.item(a.id).comments);
    }
    return commentScript(verb);
  }
}

function commentScript(verb: Verb, comments?: Comments): Script {
  return async (g) => {
    const specific = comments?.[verb] ?? comments?.default;
    if (specific && hasText(specific)) {
      await g.say(specific);
      return;
    }
    const who = g.state.activeCharacter;
    for (const key of [
      `comments.${who}.${verb}`,
      `comments.${who}.default`,
      `comments.default.${verb}`,
      'comments.default.default',
    ]) {
      const pool = textList(key);
      if (pool.length > 0) {
        await g.say(`${key}.${Math.floor(Math.random() * pool.length)}`);
        return;
      }
    }
  };
}
