import Phaser from 'phaser';
import type { GameState } from '../game/state';
import { Actor } from './Actor';
import { Pathfinder } from './Pathfinder';
import type { ActorPlacement, Era, Hotspot, Polygon, RoomDef, RoomVariant } from './types';

export function pointInPolygon(x: number, y: number, poly: Polygon): boolean {
  let inside = false;
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    const [xi, yi] = poly[i];
    const [xj, yj] = poly[j];
    if (yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) inside = !inside;
  }
  return inside;
}

export function assetKey(path: string): string {
  return `asset:${path}`;
}

/** Zeigt den aktuellen Raum: Hintergrund, Hotspot-Sprites, Figuren, Wegfindung. */
export class RoomManager {
  roomId = '';
  era: Era = 1986;
  variant!: RoomVariant;
  pathfinder = new Pathfinder([]);
  width = 320;
  readonly actors = new Map<string, Actor>();

  private background: Phaser.GameObjects.Image | null = null;
  private readonly spriteOf = new Map<Hotspot, Phaser.GameObjects.Image>();

  constructor(
    private readonly scene: Phaser.Scene,
    private readonly rooms: readonly RoomDef[],
    private readonly getState: () => GameState,
    private readonly speedFactor: number,
  ) {}

  getRoomDef(id: string): RoomDef {
    const room = this.rooms.find((r) => r.id === id);
    if (!room) throw new Error(`Unbekannter Raum: ${id}`);
    return room;
  }

  allRooms(): readonly RoomDef[] {
    return this.rooms;
  }

  private pickVariant(roomId: string, era: Era): RoomVariant {
    const variants = this.getRoomDef(roomId).eras[era];
    const variant = variants?.find((v) => !v.when || v.when(this.getState()));
    if (!variant) throw new Error(`Raum ${roomId} hat keine passende Variante für ${era}.`);
    return variant;
  }

  /** Baut den Raum neu auf. Alle spielbaren Figuren an diesem Ort werden mit aufgestellt. */
  enter(roomId: string, era: Era): void {
    this.clear();
    this.roomId = roomId;
    this.era = era;
    this.variant = this.pickVariant(roomId, era);
    this.pathfinder = new Pathfinder(this.variant.walkable);

    this.background = this.scene.add
      .image(0, 0, assetKey(this.variant.background))
      .setOrigin(0, 0)
      .setDepth(-1000);
    this.width = this.background.width;
    this.scene.cameras.main.setBounds(0, 0, Math.max(this.width, 320), 200);

    for (const hs of this.variant.hotspots) {
      if (!hs.sprite) continue;
      const image = this.scene.add
        .image(hs.sprite.x, hs.sprite.y, assetKey(hs.sprite.key))
        .setOrigin(0, 0)
        .setDepth(hs.sprite.depthY ?? -500);
      this.spriteOf.set(hs, image);
    }

    const state = this.getState();
    if (!this.variant.hidePlayer) {
      for (const [id, c] of Object.entries(state.characters)) {
        if (c.room === roomId && c.era === era) this.addActor(id, c.x, c.y, c.face);
      }
    }
    for (const p of this.wantedActors().values()) {
      this.addActor(p.id, p.x, p.y, p.face ?? 'vorne');
    }
    this.refreshSprites();
  }

  /** Je Figur gilt der erste Eintrag, dessen Bedingung passt. So kann eine Figur je nach Spielstand woanders stehen. */
  private wantedActors(): Map<string, ActorPlacement> {
    const state = this.getState();
    const wanted = new Map<string, ActorPlacement>();
    for (const p of this.variant.actors ?? []) {
      if (!wanted.has(p.id) && (!p.visible || p.visible(state))) wanted.set(p.id, p);
    }
    return wanted;
  }

  /** Nach Skripten: Sichtbarkeiten aktualisieren. Liefert true, wenn eine andere Variante gilt. */
  refresh(): boolean {
    if (this.pickVariant(this.roomId, this.era) !== this.variant) return true;
    const wanted = this.wantedActors();
    for (const p of this.variant.actors ?? []) {
      const actor = this.actors.get(p.id);
      const placement = wanted.get(p.id);
      if (placement && !actor) {
        this.addActor(p.id, placement.x, placement.y, placement.face ?? 'vorne');
      } else if (!placement && actor) {
        actor.destroy();
        this.actors.delete(p.id);
      }
    }
    this.refreshSprites();
    return false;
  }

  private refreshSprites(): void {
    const state = this.getState();
    for (const hs of this.variant.hotspots) {
      const image = this.spriteOf.get(hs);
      if (!image || !hs.sprite) continue;
      const hotspotOn = !hs.visible || hs.visible(state);
      image.setVisible(hotspotOn && (!hs.sprite.when || hs.sprite.when(state)));
    }
  }

  visibleHotspots(): Hotspot[] {
    const state = this.getState();
    return this.variant.hotspots.filter((hs) => !hs.visible || hs.visible(state));
  }

  /** Der zuletzt eingetragene Hotspot liegt oben. */
  hotspotAt(worldX: number, worldY: number): Hotspot | null {
    const hits = this.visibleHotspots().filter((hs) => pointInPolygon(worldX, worldY, hs.area));
    return hits.length > 0 ? hits[hits.length - 1] : null;
  }

  update(deltaMs: number): void {
    for (const actor of this.actors.values()) actor.update(deltaMs);
  }

  private addActor(id: string, x: number, y: number, face: Actor['dir']): void {
    this.actors.set(id, new Actor(this.scene, id, x, y, face, this.variant.scale, this.speedFactor));
  }

  private clear(): void {
    this.background?.destroy();
    this.background = null;
    for (const image of this.spriteOf.values()) image.destroy();
    this.spriteOf.clear();
    for (const actor of this.actors.values()) actor.destroy();
    this.actors.clear();
  }
}
