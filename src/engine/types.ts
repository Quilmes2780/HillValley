import type { FlagName } from '../game/flags';
import type { CharacterId, GameState } from '../game/state';

export type Era = 1885 | 1955 | 1986 | 2015;
export const ERAS: readonly Era[] = [1885, 1955, 1986, 2015];

export type Pt = readonly [number, number];
export type Polygon = readonly Pt[];
export type Dir = 'links' | 'rechts' | 'vorne' | 'hinten';

export type Verb =
  | 'gib'
  | 'oeffne'
  | 'schliesse'
  | 'nimm'
  | 'schauan'
  | 'redemit'
  | 'benutze'
  | 'druecke'
  | 'ziehe';

/** Reihenfolge laut SPIELKONZEPT.md, zeilenweise in der 3×3-Leiste. */
export const VERBS: readonly Verb[] = [
  'gib',
  'oeffne',
  'schliesse',
  'nimm',
  'schauan',
  'redemit',
  'benutze',
  'druecke',
  'ziehe',
];

export type ItemId = string;
export type Condition = (s: GameState) => boolean;
export type Script = (g: ScriptApi) => Promise<void>;
export type TextParams = Record<string, string | number>;

/** Alles, was Raum- und Gegenstandsskripte tun dürfen. */
export interface ScriptApi {
  readonly state: GameState;
  /** Aktive Figur sagt einen Text aus de.json. */
  say(key: string, params?: TextParams): Promise<void>;
  /** Eine bestimmte Figur sagt einen Text aus de.json. */
  sayAs(actor: string, key: string, params?: TextParams): Promise<void>;
  /** Läuft zu einem Punkt; ohne `actor` die aktive Figur. `speed` multipliziert das Tempo. */
  walkTo(to: Pt, actor?: string, speed?: number): Promise<void>;
  face(dir: Dir, actor?: string): void;
  /** Spielt eine Animation einmal ab, z. B. `pickup`. */
  playAnim(anim: string, actor?: string): Promise<void>;
  addItem(id: ItemId): void;
  removeItem(id: ItemId): void;
  hasItem(id: ItemId): boolean;
  setFlag(name: FlagName, value?: boolean | number): void;
  getFlag(name: FlagName): boolean | number;
  goToRoom(room: string, era?: Era, at?: Pt, face?: Dir): Promise<void>;
  dialog(id: string): Promise<void>;
  wait(ms: number): Promise<void>;
  /** Blendet die Bedienleiste für die Dauer der Sequenz aus. */
  cutscene(run: () => Promise<void>): Promise<void>;
  unlockCharacter(id: CharacterId): void;
  switchCharacter(id: CharacterId): Promise<void>;
  setPhotoStage(stage: GameState['photoStage']): void;
  /** Schwarze Titelkarte; ein Klick oder einige Sekunden beenden sie. */
  showCard(titleKey: string, subtitleKey?: string): Promise<void>;
  /** Die Zeitwelle: Das Bild blitzt, bebt und kippt. */
  timeWave(): Promise<void>;
  shake(ms?: number): void;
  flash(ms?: number): void;
}

/** Objektspezifische Kommentare: i18n-Schlüssel je Verb, `default` für alle übrigen. */
export type Comments = Partial<Record<Verb | 'default', string>>;

export interface HotspotSprite {
  /** Pfad unter assets/, z. B. 'backgrounds/sprites/apfel.png' */
  key: string;
  x: number;
  y: number;
  /** Tiefe wie die Fußlinie einer Figur; ohne Angabe liegt das Sprite hinter allen Figuren. */
  depthY?: number;
  when?: Condition;
}

export interface Exit {
  room: string;
  era?: Era;
  at: Pt;
  face?: Dir;
  /** Darf die Figur durch? Gibt false zurück und erklärt selbst per say(), warum nicht. */
  guard?: (g: ScriptApi) => Promise<boolean>;
}

export interface Hotspot {
  id: string;
  /** i18n-Schlüssel für den Namen in der Satzzeile. */
  name: string;
  area: Polygon;
  walkTo: Pt;
  face?: Dir;
  /** Rechtsklick; ohne Angabe Schau an, bei Ausgängen Gehe zu. */
  defaultVerb?: Verb;
  visible?: Condition;
  sprite?: HotspotSprite;
  verbs?: Partial<Record<Verb, Script>>;
  /** Benutze/Gib Gegenstand mit/an diesem Hotspot; als Schlüssel geht auch die ID eines anderen Hotspots. */
  useWith?: Record<ItemId, Script>;
  comments?: Comments;
  exit?: Exit;
}

export interface ActorPlacement {
  id: string;
  x: number;
  y: number;
  face?: Dir;
  visible?: Condition;
}

export interface DepthScale {
  yFar: number;
  sFar: number;
  yNear: number;
  sNear: number;
}

export interface RoomVariant {
  /** Erste Variante der Zeitebene, deren Bedingung passt, wird gezeigt. */
  when?: Condition;
  /** Pfad unter assets/; die Bildbreite bestimmt, ob der Raum scrollt. */
  background: string;
  /** Konvexe, zusammenhängende Teilflächen. Leer = hier läuft niemand. */
  walkable: readonly Polygon[];
  scale?: DepthScale;
  /** Die aktive Figur ist hier nicht zu sehen, z. B. auf dem Stadtplan. */
  hidePlayer?: boolean;
  hotspots: readonly Hotspot[];
  actors?: readonly ActorPlacement[];
  onEnter?: Script;
}

export interface RoomDef {
  id: string;
  /** i18n-Schlüssel, u. a. für Speicherstände. */
  name: string;
  eras: Partial<Record<Era, readonly RoomVariant[]>>;
}

export interface ItemDef {
  id: ItemId;
  name: string;
  /** Pfad unter assets/, 32×20 */
  icon: string;
  /** Bild abhängig vom Spielstand, z. B. das Foto je Stufe. Alle Bilder in `iconVariants` eintragen. */
  iconFor?: (s: GameState) => string;
  iconVariants?: readonly string[];
  /** i18n-Schlüssel für Schau an; bei Funktionen abhängig vom Spielstand. */
  description: string | ((s: GameState) => string);
  /** Direkt ausführbare Verben, z. B. Benutze Banane. */
  verbs?: Partial<Record<Verb, Script>>;
  comments?: Comments;
}

/** Unabhängig von der Reihenfolge: A mit B entspricht B mit A. */
export interface Combo {
  a: ItemId;
  b: ItemId;
  run: Script;
}
