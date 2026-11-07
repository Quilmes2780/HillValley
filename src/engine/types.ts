import type { AmbienceName, FloorName, MusicName, SfxName } from '../game/audio';
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
  /** Rollender Abspann: Zeilen aus de.json. */
  showCredits(key: string): Promise<void>;
  sfx(name: SfxName): void;
  shake(ms?: number): void;
  flash(ms?: number): void;
  /** Figur fliegt, rutscht oder fällt, unabhängig von den begehbaren Flächen. */
  hop(actor: string | undefined, to: Pt, options: HopOptions): Promise<void>;
  /** Figur bleibt im Raum, ist aber nicht zu sehen, z. B. nach dem Einsteigen. */
  hideActor(actor?: string, hidden?: boolean): void;
  /** Verschiebt das Bild einer Klickfläche relativ zur jetzigen Stelle. */
  moveSprite(hotspot: string, by: Pt, ms: number, ease?: string): Promise<void>;
  /** Einmaliger Teilchenausstoß an einer Stelle des Raums. */
  burst(x: number, y: number, spec: BurstSpec): void;
  /** Festes Stück für eine Szene, 'stille' für keine Musik, null für zurück zum Raum. */
  setMusic(name: MusicName | 'stille' | null): void;
  /** Jahreszahl läuft groß über das Bild von einem Jahr zum anderen. */
  yearRoll(from: number, to: number): Promise<void>;
  /** Bildschirmfüllendes Bild aus einem Bildstreifen unter assets/. Bleibt bis hidePicture(). */
  showPicture(key: string, fps: number): void;
  hidePicture(): void;
}

export interface HopOptions {
  ms: number;
  /** Höhe des Bogens in Pixeln. */
  arc?: number;
  /** Drehung im Bogenmaß über den ganzen Weg. */
  spin?: number;
  /** Die Figur bleibt danach so gedreht liegen. */
  keepSpin?: boolean;
  ease?: string;
}

export interface BurstSpec {
  count: number;
  colors: readonly number[];
  /** Pixel je Sekunde. */
  speed: readonly [number, number];
  life: readonly [number, number];
  gravity?: number;
  /** Richtung im Bogenmaß; ohne Angabe in alle Richtungen. */
  angle?: readonly [number, number];
  /** Streuung des Startpunkts entlang x. */
  spread?: readonly [number, number];
  size?: number;
}

type Rect = readonly [number, number, number, number];

/**
 * Bewegte Raumdetails als Daten. Alle Effekte verändern nur das Bild, nie den Spielstand.
 * Ohne `depthY` liegen sie vor dem Hintergrund und hinter den Figuren.
 */
export type RoomEffect =
  | { type: 'strip'; key: string; frameWidth: number; frameHeight: number; x: number; y: number; fps: number; swing?: boolean; depthY?: number; when?: Condition }
  | {
      type: 'particles';
      area: Rect;
      colors: readonly number[];
      /** Teilchen je Sekunde. */
      rate: number;
      life: readonly [number, number];
      vx: readonly [number, number];
      vy: readonly [number, number];
      gravity?: number;
      size?: readonly [number, number];
      fade?: boolean;
      /** Vor den Figuren, z. B. Regen. */
      front?: boolean;
      when?: Condition;
    }
  | { type: 'glow'; area: Rect; color: number; min: number; max: number; speed: number; flicker?: number; hard?: boolean; depthY?: number; when?: Condition }
  | { type: 'pass'; key: string; frameWidth?: number; frameHeight?: number; y: number; fromX: number; toX: number; seconds: number; pause: readonly [number, number]; fps?: number; wobble?: number; flip?: boolean; depthY?: number; when?: Condition }
  | { type: 'bob'; hotspot: string; amplitude: number; seconds: number; when?: Condition };

/** Was eine Nebenfigur zwischendurch tut. */
export type Fidget = 'pickup' | 'talk' | 'blick';

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
  /** Kleine Bewegungen, wenn gerade nichts los ist. */
  fidget?: readonly Fidget[];
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
  /** Bewegte Details, siehe `RoomEffect`. */
  effects?: readonly RoomEffect[];
  /** Leise Klangschleife unter der Musik. */
  ambience?: AmbienceName;
  /** Bodenbelag für die Schritte; ohne Angabe bleibt es still. */
  floor?: FloorName;
  /** Eigenes Stück statt der Musik der Zeitebene. */
  music?: MusicName;
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
