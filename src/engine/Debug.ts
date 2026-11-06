import Phaser from 'phaser';
import { FLAGS, type FlagName } from '../game/flags';
import type { CharacterId } from '../game/state';
import { ERAS, type Era } from './types';
import type { GameScene } from './GameScene';
import { frameCountOf, type AnimName } from './CharacterLoader';
import { t } from './i18n';

const OVERLAY_DEPTH = 1500;

/** F9: Walkboxes und Hotspots im Bild, daneben ein HTML-Panel für Flags, Raumsprung, Gegenstände. */
export class Debug {
  open = false;
  private readonly graphics: Phaser.GameObjects.Graphics;
  private labels: Phaser.GameObjects.BitmapText[] = [];
  private panel: HTMLDivElement | null = null;
  private info: HTMLDivElement | null = null;

  constructor(private readonly scene: GameScene) {
    this.graphics = scene.add.graphics().setDepth(OVERLAY_DEPTH).setVisible(false);
  }

  toggle(): void {
    this.open = !this.open;
    this.graphics.setVisible(this.open);
    if (this.open) {
      this.buildPanel();
      this.refresh();
    } else {
      this.panel?.remove();
      this.panel = null;
      this.clearLabels();
    }
  }

  private clearLabels(): void {
    for (const label of this.labels) label.destroy();
    this.labels = [];
  }

  /** Nach Raumwechsel oder Skript aufrufen. */
  refresh(): void {
    if (!this.open) return;
    const g = this.graphics;
    const rooms = this.scene.rooms;
    g.clear();
    this.clearLabels();

    g.lineStyle(1, 0x33f0e0, 1);
    for (const poly of rooms.variant.walkable) {
      g.strokePoints(poly.map(([x, y]) => new Phaser.Math.Vector2(x, y)), true);
    }
    for (const hs of rooms.visibleHotspots()) {
      g.lineStyle(1, hs.exit ? 0xe94fb0 : 0xecd14f, 1);
      g.strokePoints(hs.area.map(([x, y]) => new Phaser.Math.Vector2(x, y)), true);
      g.fillStyle(0xf6f6ee, 1);
      g.fillRect(hs.walkTo[0] - 1, hs.walkTo[1] - 1, 3, 3);
      this.labels.push(
        this.scene.add
          .bitmapText(hs.area[0][0], hs.area[0][1], 'hv', hs.id, 10)
          .setTint(0xecd14f)
          .setDepth(OVERLAY_DEPTH + 1),
      );
    }
    this.refreshPanel();
  }

  private buildPanel(): void {
    const scene = this.scene;
    const panel = document.createElement('div');
    panel.id = 'hv-debug';

    const heading = (text: string): void => {
      const h = document.createElement('h3');
      h.textContent = text;
      panel.append(h);
    };
    const select = (id: string, options: string[]): HTMLSelectElement => {
      const el = document.createElement('select');
      el.id = id;
      for (const option of options) el.append(new Option(option, option));
      panel.append(el);
      return el;
    };
    const button = (id: string, text: string, onClick: () => void): void => {
      const el = document.createElement('button');
      el.id = id;
      el.textContent = text;
      el.addEventListener('click', onClick);
      panel.append(el);
    };

    heading(t('debug.title'));
    this.info = document.createElement('div');
    this.info.id = 'hv-debug-info';
    panel.append(this.info);

    heading(t('debug.room'));
    const roomSelect = select('hv-debug-room', scene.rooms.allRooms().map((room) => room.id));
    const eraSelect = select('hv-debug-era', ERAS.map(String));
    button('hv-debug-go', t('debug.go'), () => {
      const room = scene.rooms.getRoomDef(roomSelect.value);
      const era = Number(eraSelect.value) as Era;
      if (room.eras[era]) scene.debugJump(room.id, era);
    });

    heading(t('debug.item'));
    const itemSelect = select('hv-debug-item', scene.items.map((item) => item.id));
    button('hv-debug-give', t('debug.give'), () => scene.addItem(itemSelect.value));

    heading(t('debug.character'));
    for (const id of Object.keys(scene.state.characters) as CharacterId[]) {
      button(`hv-debug-char-${id}`, id, () => {
        scene.unlockCharacter(id);
        void scene.switchCharacter(id);
      });
    }

    heading(t('debug.flags'));
    const flagBox = document.createElement('div');
    flagBox.id = 'hv-debug-flags';
    panel.append(flagBox);

    document.body.append(panel);
    this.panel = panel;
  }

  private refreshPanel(): void {
    if (!this.panel || !this.info) return;
    const scene = this.scene;
    const c = scene.activeState();
    this.info.textContent = t('debug.info', {
      who: scene.state.activeCharacter,
      room: c.room,
      era: c.era,
      x: Math.round(c.x),
      y: Math.round(c.y),
    });
    const box = this.panel.querySelector<HTMLDivElement>('#hv-debug-flags');
    if (!box) return;
    box.replaceChildren(
      ...FLAGS.map((name: FlagName) => {
        const label = document.createElement('label');
        label.className = 'flag';
        const check = document.createElement('input');
        check.type = 'checkbox';
        check.checked = Boolean(scene.state.flags[name]);
        check.addEventListener('change', () => {
          scene.state.flags[name] = check.checked;
          scene.refreshRoom();
          this.refresh();
        });
        label.append(check, ` ${name}`);
        return label;
      }),
    );
  }
}

/** Schnittstelle für die Playwright-Tests, nur mit ?test=1. Alle Koordinaten sind Spielpixel. */
export function installTestApi(scene: GameScene, validationErrors: readonly string[]): void {
  (window as unknown as { __hv: unknown }).__hv = {
    validationErrors,
    state: () => scene.state,
    isIdle: () =>
      !scene.runner.busy &&
      !scene.dialog.choosing &&
      !scene.hasPendingWalk() &&
      !scene.actorOf(scene.state.activeCharacter)?.isWalking,
    isChoosing: () => scene.dialog.choosing,
    speech: () => scene.speechLog,
    sentence: () => scene.verbUi.sentence,
    room: () => ({
      id: scene.rooms.roomId,
      era: scene.rooms.era,
      background: scene.rooms.variant.background,
      width: scene.rooms.width,
      scrollX: scene.cameras.main.scrollX,
    }),
    hotspots: () =>
      scene.rooms.visibleHotspots().map((hs) => {
        const xs = hs.area.map((p) => p[0]);
        const ys = hs.area.map((p) => p[1]);
        return {
          id: hs.id,
          x: (Math.min(...xs) + Math.max(...xs)) / 2 - scene.cameras.main.scrollX,
          y: (Math.min(...ys) + Math.max(...ys)) / 2,
        };
      }),
    actor: (id?: string) => {
      const actor = scene.actorOf(id ?? scene.state.activeCharacter);
      return actor ? { x: actor.x, y: actor.y, depth: actor.sprite.depth } : null;
    },
    actorsInRoom: () => [...scene.rooms.actors.keys()],
    walkPathLength: (x: number, y: number) => {
      const actor = scene.actorOf(scene.state.activeCharacter)!;
      return scene.rooms.pathfinder.path([actor.x, actor.y], [x, y]);
    },
    verb: (verb: Parameters<GameScene['verbUi']['centerOf']>[0]) => scene.verbUi.centerOf(verb),
    inventory: () => scene.inventoryUi.layout(),
    arrow: (direction: 'up' | 'down') => scene.inventoryUi.arrowCenter(direction),
    portraits: () => scene.portraitUi.layout(),
    choices: () => scene.dialog.layout(),
    menu: () => (scene.saveMenu.open ? scene.saveMenu.layout() : null),
    debugOpen: () => scene.debug.open,
    frames: (id: string, anim: AnimName) => frameCountOf(scene, id, anim),
    zoom: () => scene.scale.zoom,
  };
}
