import { hasText, t, textList } from './i18n';
import type { Combo, Comments, Hotspot, ItemDef, ItemId, Script, ScriptApi, Verb } from './types';

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
    // Ein eigener Benutze-Kommentar antwortet sofort; „Benutze Gegenstand mit Hotspot“ geht weiterhin.
    return !hs.verbs?.benutze && !hs.comments?.benutze && Object.keys(hs.useWith ?? {}).length > 0;
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
        const hotspot = a.hotspot;
        return (
          hotspot.verbs?.[verb] ??
          commentScript(verb, {
            comments: hotspot.comments,
            reactions: (g) => [hotspotReaction(g, hotspot, verb)],
            pool: poolOf(hotspot),
          })
        );
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
      return commentScript(verb, {
        comments: item.comments,
        reactions: () => [`reaktion_item.${a.id}.${verb}`],
        pool: 'gegenstand',
      });
    }
    if (a.kind === 'hotspot' && b.kind === 'hotspot') {
      const script = a.hotspot.useWith?.[b.hotspot.id] ?? b.hotspot.useWith?.[a.hotspot.id];
      const hotspot = b.hotspot;
      return (
        script ??
        commentScript(verb, {
          comments: pairComments(verb, hotspot),
          reactions: (g) => [hotspotReaction(g, hotspot, 'mit')],
          pool: poolOf(hotspot),
        })
      );
    }
    if (a.kind === 'item' && b.kind === 'item') {
      const combo = combos.find(
        (c) => (c.a === a.id && c.b === b.id) || (c.a === b.id && c.b === a.id),
      );
      if (combo) return combo.run;
      return commentScript(verb, {
        comments: this.item(a.id).comments,
        reactions: () => [
          `reaktion_item.${a.id}.mit_${b.id}`,
          `reaktion_item.${b.id}.mit_${a.id}`,
          `reaktion_item.${a.id}.benutze_mit`,
        ],
      });
    }
    const hotspot = a.kind === 'hotspot' ? a.hotspot : b.kind === 'hotspot' ? b.hotspot : null;
    const itemTarget = a.kind === 'item' ? a : b.kind === 'item' ? b : null;
    if (!hotspot || !itemTarget) return commentScript(verb);
    const giving = verb === 'gib';
    return (
      hotspot.useWith?.[itemTarget.id] ??
      commentScript(verb, {
        // Reihenfolge: genau dieser Gegenstand an dieser Stelle, dann die Stelle, dann der Gegenstand.
        early: (g) => [
          hotspotReaction(g, hotspot, `mit_${itemTarget.id}`),
          hotspotReaction(g, hotspot, giving ? 'gib' : 'mit'),
        ],
        comments: pairComments(verb, hotspot),
        reactions: () => [`reaktion_item.${itemTarget.id}.${giving ? 'gib_an' : 'benutze_mit'}`],
        pool: poolOf(hotspot),
      })
    );
  }
}

/** Schlüssel einer Reaktion aus de.json: je Ort und Zeitebene, dann Klickfläche und Verb. */
function hotspotReaction(g: ScriptApi, hotspot: Hotspot, what: string): string {
  const here = g.state.characters[g.state.activeCharacter];
  return `reaktion.${here.room}_${here.era}.${hotspot.id}.${what}`;
}

/** Ein Kommentar zu „Benutze X“ passt nicht zu „Benutze Gegenstand mit X“; der zu „Gib“ schon. */
function pairComments(verb: Verb, hotspot: Hotspot): Comments | undefined {
  return verb === 'benutze' ? undefined : hotspot.comments;
}

/** Eigene Standardsprüche für Personen und Ausgänge. */
function poolOf(hotspot: Hotspot): string | undefined {
  if (hotspot.defaultVerb === 'redemit') return 'person';
  return hotspot.exit ? 'ausgang' : undefined;
}

/** Eine Reaktion ist ein Text der aktiven Figur oder ein Paar aus Sprecher und Text. */
async function sayReaction(g: ScriptApi, key: string): Promise<void> {
  const pair = textList(key);
  if (pair.length === 2) await g.sayAs(pair[0], `${key}.1`);
  else await g.say(key);
}

const lastComment = new Map<string, number>();

interface CommentSources {
  /** Reaktionen, die noch vor dem Kommentar der Klickfläche kommen. */
  early?: (g: ScriptApi) => string[];
  comments?: Comments;
  reactions?: (g: ScriptApi) => string[];
  /** Name eines eigenen Spruch-Pools, z. B. `person`. */
  pool?: string;
}

/** Schlüssel der Standardsprüche: zuerst der eigene Pool, sonst Figur und Zeitebene zusammen. */
function poolKeys(g: ScriptApi, verb: Verb, pool?: string): string[] {
  const who = g.state.activeCharacter;
  const expand = (list: string): string[] => textList(list).map((_, i) => `${list}.${i}`);
  if (pool) {
    const own = expand(`comments.${who}.${pool}.${verb}`);
    if (own.length > 0) return own;
  }
  const era = `comments.${who}.e${g.state.characters[who].era}`;
  for (const slot of [verb, 'default']) {
    const keys = [...expand(`${era}.${slot}`), ...expand(`comments.${who}.${slot}`)];
    if (keys.length > 0) return keys;
  }
  return [...expand(`comments.default.${verb}`), ...expand('comments.default.default')];
}

function commentScript(verb: Verb, sources: CommentSources = {}): Script {
  return async (g) => {
    for (const key of sources.early?.(g) ?? []) {
      if (hasText(key)) {
        await sayReaction(g, key);
        return;
      }
    }
    const specific = sources.comments?.[verb] ?? sources.comments?.default;
    if (specific && hasText(specific)) {
      await g.say(specific);
      return;
    }
    for (const key of sources.reactions?.(g) ?? []) {
      if (hasText(key)) {
        await sayReaction(g, key);
        return;
      }
    }
    const keys = poolKeys(g, verb, sources.pool);
    if (keys.length === 0) return;
    // Nicht zweimal hintereinander derselbe Spruch.
    const id = keys[0];
    let index = Math.floor(Math.random() * keys.length);
    if (keys.length > 1 && index === lastComment.get(id)) index = (index + 1) % keys.length;
    lastComment.set(id, index);
    await g.say(keys[index]);
  };
}
