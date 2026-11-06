import Phaser from 'phaser';
import { UI_AMBER, UI_TEXT } from './theme';
import { musicFor, SPEECH_SFX } from '../game/audio';
import { COMBOS } from '../game/items/combos';
import { ITEMS } from '../game/items/items';
import { ROOMS } from '../game/rooms';
import { START_SCRIPT } from '../game/start';
import {
  createInitialState,
  type CharacterId,
  type CharacterState,
  type GameState,
  type Scenario,
} from '../game/state';
import type { Actor } from './Actor';
import { audio } from './Audio';
import { textColorOf } from './CharacterLoader';
import { Debug, installTestApi } from './Debug';
import { Dialog } from './Dialog';
import { t } from './i18n';
import { Interaction, type Action, type Target } from './Interaction';
import { InventoryUI } from './InventoryUI';
import { PortraitUI } from './PortraitUI';
import { RoomManager } from './RoomManager';
import { SaveMenu } from './SaveMenu';
import { SaveSystem } from './SaveSystem';
import { ScriptRunner } from './ScriptRunner';
import type { Dir, Era, ItemDef, ItemId, Pt, Script, Verb } from './types';
import { validateContent } from './validate';
import { UI_DEPTH, VerbUI } from './VerbUI';

const SCENE_HEIGHT = 144;
const SPEECH_MAX_WIDTH = 220;
const MS_PER_CHAR = 55;
const MIN_SPEECH_MS = 1400;
const CARD_MS = 3500;
const FADE_MS = 180;
const CREDITS_SPEED = 14;

/** Hauptszene: verbindet Raum, Figuren, Bedienung und Skripte. */
export class GameScene extends Phaser.Scene {
  state!: GameState;
  rooms!: RoomManager;
  runner!: ScriptRunner;
  dialog!: Dialog;
  verbUi!: VerbUI;
  inventoryUi!: InventoryUI;
  portraitUi!: PortraitUI;
  saveMenu!: SaveMenu;
  debug!: Debug;
  readonly items: readonly ItemDef[] = ITEMS;
  readonly speechLog: { actor: string; text: string }[] = [];

  private interaction!: Interaction;
  private panel!: Phaser.GameObjects.Image;
  private cursor!: Phaser.GameObjects.Image;
  private fader!: Phaser.GameObjects.Rectangle;
  private testMode = false;
  private uiVisible = true;
  private pendingToken = 0;
  private pendingWalk = false;
  private lockedSentence: string | null = null;
  private finishSpeech: (() => void) | null = null;
  private pointerX = 160;
  private pointerY = 72;

  constructor() {
    super('game');
  }

  create(data: { state?: GameState } = {}): void {
    const params = new URLSearchParams(location.search);
    this.testMode = params.has('test');
    const scenario: Scenario = params.get('szenario') === 'engine' ? 'engine' : 'spiel';
    this.state = data.state ?? createInitialState(scenario);
    this.input.mouse?.disableContextMenu();
    this.input.setDefaultCursor('none');

    this.rooms = new RoomManager(this, ROOMS, () => this.state, this.testMode ? 8 : 1);
    this.interaction = new Interaction(ITEMS);
    this.runner = new ScriptRunner(this);
    this.dialog = new Dialog(this);
    this.panel = this.add
      .image(0, SCENE_HEIGHT, 'ui/panel')
      .setOrigin(0, 0)
      .setScrollFactor(0)
      .setDepth(UI_DEPTH);
    this.verbUi = new VerbUI(this);
    this.inventoryUi = new InventoryUI(this, ITEMS, () => this.state);
    this.portraitUi = new PortraitUI(this);
    this.saveMenu = new SaveMenu(this);
    this.debug = new Debug(this);
    this.cursor = this.add
      .image(160, 72, 'ui/cursor')
      .setScrollFactor(0)
      .setDepth(UI_DEPTH + 500);

    this.input.on('pointermove', (p: Phaser.Input.Pointer) => this.onPointerMove(p));
    this.input.on('pointerdown', (p: Phaser.Input.Pointer) => this.onPointerDown(p));
    window.addEventListener('keydown', (event) => this.onKeyDown(event));

    const errors = validateContent(ROOMS, ITEMS, COMBOS);
    for (const error of errors) console.error(`Spieldaten: ${error}`);
    if (this.testMode) installTestApi(this, errors);

    this.showCurrentRoom();
    this.refreshUi();
    this.fader = this.add.rectangle(0, 0, 320, SCENE_HEIGHT, 0x000000).setOrigin(0, 0).setScrollFactor(0).setDepth(UI_DEPTH - 2).setAlpha(0);
    if (!data.state && scenario === 'spiel') void this.runner.run(START_SCRIPT);
    else void this.fade(0, 1);
  }

  update(_time: number, delta: number): void {
    this.rooms.update(delta);
    this.syncCharacters();
    this.followActive();
    this.updateHover();
  }

  // --- Zustand -----------------------------------------------------------------------------

  activeState(): CharacterState {
    return this.state.characters[this.state.activeCharacter];
  }

  actorOf(id: string): Actor | undefined {
    return this.rooms.actors.get(id);
  }

  roomName(id: string): string {
    const room = ROOMS.find((r) => r.id === id);
    return room ? t(room.name) : id;
  }

  hasPendingWalk(): boolean {
    return this.pendingWalk;
  }

  /** Überträgt die Positionen der spielbaren Figuren im Raum in den Spielstand. */
  private syncCharacters(): void {
    for (const [id, actor] of this.rooms.actors) {
      const c = this.state.characters[id as CharacterId];
      // Ein Skript kann die Figur gerade woandershin versetzt haben: Das bleibt dann so.
      if (!c || c.room !== this.rooms.roomId || c.era !== this.rooms.era) continue;
      c.x = actor.x;
      c.y = actor.y;
      c.face = actor.dir;
    }
  }

  private followActive(): void {
    const actor = this.actorOf(this.state.activeCharacter);
    if (!actor) return;
    // Selbst begrenzen: Phaser tut das erst beim Zeichnen, die Klicks brauchen den Wert aber sofort.
    const maxScroll = Math.max(this.rooms.width - 320, 0);
    this.cameras.main.scrollX = Phaser.Math.Clamp(Math.round(actor.x - 160), 0, maxScroll);
  }

  private showCurrentRoom(): void {
    const c = this.activeState();
    this.rooms.enter(c.room, c.era);
    audio().playMusic(musicFor(this.state));
    this.cameras.main.setScroll(0, 0);
    this.followActive();
    this.debug.refresh();
  }

  refreshRoom(): void {
    if (this.rooms.refresh()) {
      this.syncCharacters();
      this.showCurrentRoom();
    }
    this.debug.refresh();
  }

  refreshInventory(): void {
    this.inventoryUi.refresh(this.activeState().inventory);
  }

  private refreshUi(): void {
    this.refreshInventory();
    this.portraitUi.refresh(this.state.unlockedCharacters, this.state.activeCharacter);
  }

  afterScript(): void {
    this.lockedSentence = null;
    this.refreshRoom();
    this.refreshUi();
  }

  addItem(id: ItemId): void {
    const inventory = this.activeState().inventory;
    if (!inventory.includes(id)) inventory.push(id);
    this.refreshUi();
  }

  removeItem(id: ItemId): void {
    const c = this.activeState();
    c.inventory = c.inventory.filter((item) => item !== id);
    this.refreshUi();
  }

  unlockCharacter(id: CharacterId): void {
    if (!this.state.unlockedCharacters.includes(id)) this.state.unlockedCharacters.push(id);
    this.refreshUi();
  }

  switchCharacter(id: CharacterId): void {
    if (id === this.state.activeCharacter) return;
    this.cancelPending();
    this.actorOf(this.state.activeCharacter)?.stop();
    this.syncCharacters();
    this.state.activeCharacter = id;
    this.interaction.reset();
    this.showCurrentRoom();
    this.refreshUi();
    void this.fade(0, 1);
  }

  debugJump(room: string, era: Era): void {
    this.cancelPending();
    this.actorOf(this.state.activeCharacter)?.stop();
    const c = this.activeState();
    c.room = room;
    c.era = era;
    const variant = this.rooms.getRoomDef(room).eras[era]?.[0];
    const start = variant?.walkable[0]?.[0];
    if (start) [c.x, c.y] = [start[0] + 8, start[1] + 8];
    this.showCurrentRoom();
  }

  saveTo(slot: number): boolean {
    this.syncCharacters();
    return SaveSystem.write(slot, this.state);
  }

  applyLoadedState(state: GameState): void {
    this.cancelPending();
    this.state = state;
    this.interaction.reset();
    this.showCurrentRoom();
    this.refreshUi();
  }

  // --- Skript-Bausteine --------------------------------------------------------------------

  wait(ms: number): Promise<void> {
    const scaled = this.testMode ? ms / 8 : ms;
    return new Promise((resolve) => this.time.delayedCall(scaled, () => resolve()));
  }

  /** Ohne sichtbare Figur (z. B. auf dem Stadtplan) gilt das Ziel sofort als erreicht. */
  async walkActor(id: string, to: Pt, speed?: number): Promise<boolean> {
    const actor = this.actorOf(id);
    if (!actor) return true;
    return actor.walk(this.rooms.pathfinder.path([actor.x, actor.y], to), speed);
  }

  /** Blendet die Szene aus oder ein; die Bedienleiste bleibt stehen. Im Testmodus sofort. */
  private fade(to: 0 | 1, from?: 0 | 1): Promise<void> {
    if (from !== undefined) this.fader.setAlpha(from);
    if (this.testMode) {
      this.fader.setAlpha(to);
      return Promise.resolve();
    }
    return new Promise((resolve) => {
      this.tweens.add({ targets: this.fader, alpha: to, duration: FADE_MS, onComplete: () => resolve() });
    });
  }

  /** Rollender Abspann. Ein Klick beendet ihn vorzeitig. */
  showCredits(lines: readonly string[]): Promise<void> {
    const text = lines.join('\n');
    this.speechLog.push({ actor: 'abspann', text });
    const depth = UI_DEPTH + 300;
    const back = this.add.rectangle(0, 0, 320, 200, 0x000000).setOrigin(0, 0).setScrollFactor(0).setDepth(depth);
    const label = this.add
      .bitmapText(160, 200, 'hv', text, 10)
      .setCenterAlign()
      .setOrigin(0.5, 0)
      .setTint(UI_TEXT)
      .setScrollFactor(0)
      .setDepth(depth + 1);
    return new Promise((resolve) => {
      const distance = 200 + label.height;
      const tween = this.tweens.add({
        targets: label,
        y: -label.height,
        duration: this.testMode ? 40 : (distance / CREDITS_SPEED) * 1000,
        onComplete: () => this.finishSpeech?.(),
      });
      this.finishSpeech = () => {
        this.finishSpeech = null;
        tween.stop();
        back.destroy();
        label.destroy();
        resolve();
      };
    });
  }

  /** Schwarze Titelkarte. Ein Klick beendet sie vorzeitig. */
  showCard(title: string, subtitle?: string): Promise<void> {
    this.speechLog.push({ actor: 'karte', text: subtitle ? `${title} – ${subtitle}` : title });
    const depth = UI_DEPTH + 300;
    const objects: Phaser.GameObjects.GameObject[] = [
      this.add.rectangle(0, 0, 320, 200, 0x000000).setOrigin(0, 0).setScrollFactor(0).setDepth(depth),
      this.add
        .bitmapText(160, subtitle ? 88 : 100, 'hv', title, 10)
        .setOrigin(0.5, 0.5)
        .setTint(UI_AMBER)
        .setScrollFactor(0)
        .setDepth(depth + 1),
    ];
    if (subtitle) {
      objects.push(
        this.add
          .bitmapText(160, 104, 'hv', subtitle, 10)
          .setOrigin(0.5, 0.5)
          .setTint(UI_TEXT)
          .setScrollFactor(0)
          .setDepth(depth + 1),
      );
    }
    return new Promise((resolve) => {
      const timer = this.time.delayedCall(this.testMode ? 40 : CARD_MS, () => this.finishSpeech?.());
      this.finishSpeech = () => {
        this.finishSpeech = null;
        timer.remove();
        for (const object of objects) object.destroy();
        resolve();
      };
    });
  }

  /** Die Zeitwelle: Das Bild blitzt, bebt und kippt hin und her. */
  async playTimeWave(): Promise<void> {
    audio().sfx('welle');
    const camera = this.cameras.main;
    const scale = this.testMode ? 0.125 : 1;
    camera.flash(500 * scale, 255, 255, 255);
    camera.shake(1800 * scale, 0.012);
    camera.rotateTo(0.16, false, 600 * scale, 'Sine.easeInOut');
    await this.wait(600);
    camera.rotateTo(-0.12, false, 600 * scale, 'Sine.easeInOut');
    await this.wait(600);
    camera.rotateTo(0, false, 600 * scale, 'Sine.easeInOut');
    await this.wait(600);
    camera.setRotation(0);
    camera.flash(300 * scale, 255, 255, 255);
  }

  async goToRoom(room: string, era?: Era, at?: Pt, face?: Dir): Promise<void> {
    this.syncCharacters();
    const c = this.activeState();
    c.room = room;
    if (era !== undefined) c.era = era;
    if (at) [c.x, c.y] = at;
    if (face) c.face = face;
    await this.fade(1);
    this.showCurrentRoom();
    await this.fade(0);
    await this.rooms.variant.onEnter?.(this.runner.api);
  }

  /** Zeigt eine Zeile über dem Kopf in der Figurenfarbe. Ein Klick beendet sie vorzeitig. */
  sayLine(actorId: string, text: string): Promise<void> {
    this.speechLog.push({ actor: actorId, text });
    const speechSfx = SPEECH_SFX[actorId];
    if (speechSfx) audio().sfx(speechSfx);
    const actor = this.actorOf(actorId);
    const view = this.cameras.main.scrollX;
    const label = this.add
      .bitmapText(0, 0, 'hv', text, 10)
      .setTint(textColorOf(actorId))
      .setMaxWidth(SPEECH_MAX_WIDTH)
      .setCenterAlign()
      .setOrigin(0.5, 1)
      .setDepth(UI_DEPTH - 1);
    const halfWidth = label.width / 2;
    const anchorX = actor ? actor.x : view + 160;
    const anchorY = actor ? actor.headY - 2 : 40;
    label.setPosition(
      Math.round(Phaser.Math.Clamp(anchorX, view + halfWidth + 2, view + 318 - halfWidth)),
      Math.round(Math.max(anchorY, label.height + 1)),
    );
    actor?.startTalking();

    const duration = this.testMode ? 40 : Math.max(MIN_SPEECH_MS, text.length * MS_PER_CHAR);
    return new Promise((resolve) => {
      const timer = this.time.delayedCall(duration, () => this.finishSpeech?.());
      this.finishSpeech = () => {
        this.finishSpeech = null;
        timer.remove();
        label.destroy();
        actor?.stopTalking();
        resolve();
      };
    });
  }

  setUiVisible(visible: boolean): void {
    this.uiVisible = visible;
    this.panel.setVisible(visible);
    this.verbUi.setVerbsVisible(visible);
    this.verbUi.setSentenceVisible(visible);
    this.inventoryUi.setVisible(visible);
    this.portraitUi.setVisible(visible);
  }

  /** Antwortauswahl ersetzt Verben, Inventar und Porträts. */
  setPanelForChoices(choosing: boolean): void {
    this.panel.setTexture(choosing ? 'ui/panel_plain' : 'ui/panel');
    this.verbUi.setSentenceVisible(!choosing);
    this.verbUi.setVerbsVisible(!choosing);
    this.inventoryUi.setVisible(!choosing);
    this.portraitUi.setVisible(!choosing);
  }

  // --- Eingabe -----------------------------------------------------------------------------

  private onKeyDown(event: KeyboardEvent): void {
    if (event.key === 'F5') {
      event.preventDefault();
      if (!this.runner.busy && !this.dialog.choosing) this.saveMenu.toggle();
    } else if (event.key === 'F9') {
      event.preventDefault();
      this.debug.toggle();
    } else if (event.key === 'Escape' && this.saveMenu.open) {
      this.saveMenu.close();
    }
  }

  private onPointerMove(pointer: Phaser.Input.Pointer): void {
    this.pointerX = pointer.x;
    this.pointerY = pointer.y;
    this.cursor.setPosition(Math.round(pointer.x), Math.round(pointer.y));
    if (this.saveMenu.open) this.saveMenu.onMove(pointer.y);
    else if (this.dialog.choosing) this.dialog.onMove(pointer.y);
  }

  private targetAt(x: number, y: number): Target | null {
    if (y < SCENE_HEIGHT) {
      const hotspot = this.rooms.hotspotAt(x + this.cameras.main.scrollX, y);
      return hotspot ? { kind: 'hotspot', hotspot } : null;
    }
    const hit = this.inventoryUi.hit(x, y);
    return hit?.kind === 'item' ? { kind: 'item', id: hit.id } : null;
  }

  private updateHover(): void {
    const blocked = this.runner.busy || this.dialog.choosing || this.saveMenu.open;
    this.cursor.setVisible(!this.runner.busy || this.dialog.choosing);
    if (blocked) {
      this.inventoryUi.setHover(null);
      if (this.lockedSentence === null) this.verbUi.setSentence('');
      else this.verbUi.setSentence(this.lockedSentence);
      return;
    }
    const target = this.targetAt(this.pointerX, this.pointerY);
    this.interaction.hover = target;
    this.inventoryUi.setHover(target?.kind === 'item' ? target.id : null);
    this.verbUi.setSentence(this.lockedSentence ?? this.interaction.sentence());
    const hoveredVerb: Verb | null = this.verbUi.hit(this.pointerX, this.pointerY);
    const fallback = target && !this.interaction.verb ? this.interaction.defaultVerbOf(target) : null;
    this.verbUi.highlight(this.interaction.verb, hoveredVerb, fallback);
  }

  private onPointerDown(pointer: Phaser.Input.Pointer): void {
    this.onPointerMove(pointer); // Touch-Geräte senden vor dem Tippen keine Mausbewegung.
    const { x, y } = pointer;
    const right = pointer.rightButtonDown();
    if (this.saveMenu.open) {
      this.saveMenu.onClick(y);
      return;
    }
    if (this.finishSpeech) {
      this.finishSpeech();
      return;
    }
    if (this.dialog.choosing) {
      this.dialog.onClick(y);
      return;
    }
    if (this.runner.busy || !this.uiVisible) return;

    if (y < SCENE_HEIGHT) {
      const target = this.targetAt(x, y);
      if (target) this.handleTarget(target, right);
      else this.walkTo(Math.floor(x) + this.cameras.main.scrollX, Math.floor(y));
      return;
    }
    const verb = this.verbUi.hit(x, y);
    if (verb) {
      this.cancelPending();
      audio().sfx('klick');
      this.interaction.selectVerb(verb);
      return;
    }
    const portrait = this.portraitUi.hit(x, y);
    if (portrait) {
      void this.runner.run(async (g) => g.switchCharacter(portrait as CharacterId));
      return;
    }
    const hit = this.inventoryUi.hit(x, y);
    if (hit?.kind === 'item') this.handleTarget({ kind: 'item', id: hit.id }, right);
    else if (hit) this.inventoryUi.scroll(hit.kind);
  }

  private cancelPending(): void {
    this.pendingToken++;
    this.pendingWalk = false;
    this.lockedSentence = null;
  }

  private walkTo(x: number, y: number): void {
    this.cancelPending();
    this.interaction.reset();
    void this.walkActor(this.state.activeCharacter, [x, y]);
  }

  private handleTarget(target: Target, right: boolean): void {
    const action = this.interaction.click(target, right);
    if (action) void this.perform(action);
  }

  /** Läuft bei Bedarf zum Hotspot und führt dann die Reaktion aus. Neue Klicks brechen den Weg ab. */
  private async perform(action: Action): Promise<void> {
    this.cancelPending();
    this.lockedSentence = this.interaction.describeAction(action);
    const token = this.pendingToken;
    this.interaction.reset();

    // Bei zwei Hotspots läuft die Figur zum zweiten, dem eigentlichen Ziel.
    const hotspot =
      action.b?.kind === 'hotspot' ? action.b.hotspot : action.a.kind === 'hotspot' ? action.a.hotspot : null;

    if (hotspot) {
      this.pendingWalk = true;
      const arrived = await this.walkActor(this.state.activeCharacter, hotspot.walkTo);
      if (token !== this.pendingToken) return;
      this.pendingWalk = false;
      if (!arrived) {
        this.lockedSentence = null;
        return;
      }
      if (hotspot.face) this.actorOf(this.state.activeCharacter)?.face(hotspot.face);
    }

    if (action.verb === null) {
      const exit = hotspot?.exit;
      if (!exit) {
        this.lockedSentence = null;
        return;
      }
      await this.runner.run(async (g) => {
        if (exit.guard && !(await exit.guard(g))) return;
        // Karte und Straße sind keine Türen.
        if (!this.rooms.variant.hidePlayer && exit.room !== 'stadtplan') audio().sfx('tuer');
        await g.goToRoom(exit.room, exit.era, exit.at, exit.face);
      });
      return;
    }

    const script: Script | null = this.interaction.resolve(action, COMBOS);
    if (script) await this.runner.run(script);
    else this.lockedSentence = null;
  }
}
