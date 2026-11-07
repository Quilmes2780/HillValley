import Phaser from 'phaser';
import { heightOf, resolveAnim, type AnimName } from './CharacterLoader';
import type { DepthScale, Dir, Fidget, HopOptions, Pt } from './types';

const SPEED_X = 56;
const SPEED_Y = 32;
const SHADOW_W = 20;
const SHADOW_H = 5;

/** Eine Figur im Raum. Die Position meint die Füße. */
export class Actor {
  readonly sprite: Phaser.GameObjects.Sprite;
  private path: Pt[] = [];
  private arrive: ((arrived: boolean) => void) | null = null;
  private talking = false;
  private walkSpeed = 1;
  private readonly shadow: Phaser.GameObjects.Ellipse;
  private hidden = false;
  private destroyed = false;
  private hopping = false;
  private fidgeting = false;
  dir: Dir;

  constructor(
    private readonly scene: Phaser.Scene,
    readonly id: string,
    x: number,
    y: number,
    dir: Dir,
    private readonly depthScale: DepthScale | undefined,
    private readonly speedFactor: number,
  ) {
    this.sprite = scene.add.sprite(x, y, `char:${id}:idle`, 'f0').setOrigin(0.5, 1);
    this.shadow = scene.add.ellipse(x, y, SHADOW_W, SHADOW_H, 0x000000, 0.32);
    this.dir = dir;
    this.applyDepth();
    this.showIdle();
  }

  get x(): number {
    return this.sprite.x;
  }

  get y(): number {
    return this.sprite.y;
  }

  get isWalking(): boolean {
    return this.path.length > 0;
  }

  /** Steht die Figur gerade unbeschäftigt herum? */
  get isIdle(): boolean {
    return !this.isWalking && !this.talking && !this.hopping && !this.fidgeting && !this.hidden;
  }

  /** Eine kleine Bewegung zwischendurch. */
  fidget(kind: Fidget): void {
    if (!this.isIdle) return;
    if (kind === 'blick') {
      this.face(this.dir === 'vorne' ? (Math.random() < 0.5 ? 'links' : 'rechts') : 'vorne');
      return;
    }
    const side = this.dir === 'links' || this.dir === 'rechts';
    const anim: AnimName = kind === 'pickup' ? 'pickup' : side ? 'talk_side' : 'talk_front';
    const key = resolveAnim(this.scene, this.id, anim);
    if (!key) return;
    this.fidgeting = true;
    this.sprite.setFlipX(this.dir === 'links');
    this.sprite.play({ key, repeat: 0 });
    this.sprite.once(`${Phaser.Animations.Events.ANIMATION_COMPLETE_KEY}${key}`, () => {
      if (!this.fidgeting) return;
      this.fidgeting = false;
      this.showIdle();
    });
  }

  private endFidget(): void {
    if (!this.fidgeting) return;
    this.fidgeting = false;
    this.sprite.anims.stop();
  }

  /** Flug, Sturz oder Rutschpartie ohne Rücksicht auf die begehbaren Flächen. */
  hop(to: Pt, options: HopOptions): Promise<void> {
    this.stop();
    this.endFidget();
    const fromX = this.sprite.x;
    const fromY = this.sprite.y;
    const spin = options.spin ?? 0;
    const arc = options.arc ?? 0;
    // Beim Überschlag dreht sich die Figur um die Körpermitte, nicht um die Füße.
    const midair = spin !== 0 && !options.keepSpin;
    const lift = midair ? (this.sprite.height * this.sprite.scaleY) / 2 : 0;
    if (midair) this.sprite.setOrigin(0.5, 0.5);
    this.hopping = true;
    this.shadow.setVisible(false);
    return new Promise((resolve) => {
      this.scene.tweens.addCounter({
        from: 0,
        to: 1,
        duration: options.ms / this.speedFactor,
        ease: options.ease ?? 'Linear',
        onUpdate: (tween) => {
          if (this.destroyed) return;
          const t = tween.getValue() ?? 0;
          this.sprite.setPosition(
            fromX + (to[0] - fromX) * t,
            fromY + (to[1] - fromY) * t - Math.sin(Math.PI * t) * arc - lift,
          );
          this.sprite.setRotation(spin * t);
          this.sprite.setDepth(this.sprite.y + lift);
        },
        onComplete: () => {
          if (!this.destroyed) {
            this.hopping = false;
            if (midair) this.sprite.setOrigin(0.5, 1);
            this.sprite.setPosition(to[0], to[1]);
            if (!options.keepSpin) this.sprite.setRotation(0);
            this.applyDepth();
          }
          resolve();
        },
      });
    });
  }

  setHidden(hidden: boolean): void {
    this.hidden = hidden;
    this.sprite.setVisible(!hidden);
    this.applyDepth();
  }

  /** Kopfhöhe für Sprechtexte. */
  get headY(): number {
    return this.sprite.y - heightOf(this.id) * this.sprite.scaleY;
  }

  /** Beginnt einen Weg. Das Versprechen liefert false, wenn er abgebrochen wurde. */
  walk(points: Pt[], speed = 1): Promise<boolean> {
    this.finish(false);
    this.walkSpeed = speed;
    const wasWalking = this.isWalking;
    this.path = [...points];
    if (points.length === 0) {
      if (wasWalking) this.showIdle();
      return Promise.resolve(true);
    }
    return new Promise((resolve) => {
      this.arrive = resolve;
    });
  }

  stop(): void {
    if (this.isWalking) {
      this.path = [];
      this.showIdle();
    }
    this.finish(false);
  }

  update(deltaMs: number): void {
    if (this.path.length === 0) return;
    this.endFidget();
    let budget = (deltaMs / 1000) * this.speedFactor * this.walkSpeed;
    while (budget > 0 && this.path.length > 0) {
      const [tx, ty] = this.path[0];
      const dx = tx - this.sprite.x;
      const dy = ty - this.sprite.y;
      this.updateWalkAnim(dx, dy);
      // Zeit, die dieses Teilstück braucht: Tiefe ist langsamer als Breite.
      const needed = Math.hypot(dx / SPEED_X, dy / SPEED_Y);
      if (needed <= budget) {
        this.sprite.setPosition(tx, ty);
        this.path.shift();
        budget -= needed;
      } else {
        const f = budget / needed;
        this.sprite.setPosition(this.sprite.x + dx * f, this.sprite.y + dy * f);
        budget = 0;
      }
    }
    this.applyDepth();
    if (this.path.length === 0) {
      this.showIdle();
      this.finish(true);
    }
  }

  /** Stellt die Figur sofort woanders hin, z. B. wenn der Spielstand ihren Platz ändert. */
  place(x: number, y: number, dir: Dir): void {
    this.stop();
    this.endFidget();
    this.sprite.setRotation(0);
    this.sprite.setPosition(x, y);
    this.dir = dir;
    this.applyDepth();
    this.showIdle();
  }

  face(dir: Dir): void {
    this.dir = dir;
    if (this.talking) this.startTalking();
    else if (!this.isWalking) this.showIdle();
  }

  startTalking(): void {
    this.endFidget();
    this.talking = true;
    const side = this.dir === 'links' || this.dir === 'rechts';
    this.play(side ? 'talk_side' : 'talk_front');
    this.sprite.setFlipX(this.dir === 'links');
  }

  stopTalking(): void {
    if (this.destroyed) return;
    this.talking = false;
    this.showIdle();
  }

  /** Spielt eine Animation einmal durch. */
  playOnce(anim: AnimName): Promise<void> {
    const key = resolveAnim(this.scene, this.id, anim);
    if (!key) return Promise.resolve();
    return new Promise((resolve) => {
      this.sprite.once(Phaser.Animations.Events.ANIMATION_COMPLETE, () => {
        this.showIdle();
        resolve();
      });
      this.sprite.play(key);
      if (this.sprite.anims.currentAnim?.repeat === -1) {
        // Ersatzanimation läuft in Schleife: nach kurzer Zeit selbst beenden.
        this.scene.time.delayedCall(400 / this.speedFactor, () => {
          this.sprite.removeAllListeners(Phaser.Animations.Events.ANIMATION_COMPLETE);
          this.showIdle();
          resolve();
        });
      }
    });
  }

  destroy(): void {
    this.destroyed = true;
    this.finish(false);
    this.sprite.destroy();
    this.shadow.destroy();
  }

  private finish(arrived: boolean): void {
    const done = this.arrive;
    this.arrive = null;
    done?.(arrived);
  }

  private updateWalkAnim(dx: number, dy: number): void {
    let dir: Dir;
    if (Math.abs(dx) >= Math.abs(dy)) dir = dx < 0 ? 'links' : 'rechts';
    else dir = dy < 0 ? 'hinten' : 'vorne';
    this.dir = dir;
    if (dir === 'links' || dir === 'rechts') {
      this.play('walk_side');
      this.sprite.setFlipX(dir === 'links');
    } else {
      this.play(dir === 'hinten' ? 'walk_back' : 'walk_front');
      this.sprite.setFlipX(false);
    }
  }

  private showIdle(): void {
    const side = this.dir === 'links' || this.dir === 'rechts';
    this.play(side ? 'idle_side' : this.dir === 'hinten' ? 'idle_back' : 'idle');
    this.sprite.setFlipX(this.dir === 'links');
  }

  private play(anim: AnimName): void {
    const key = resolveAnim(this.scene, this.id, anim);
    if (key) this.sprite.play(key, true);
  }

  private applyDepth(): void {
    this.sprite.setDepth(this.sprite.y);
    const s = this.depthScale;
    if (s) {
      const t = Phaser.Math.Clamp((this.sprite.y - s.yFar) / (s.yNear - s.yFar), 0, 1);
      this.sprite.setScale(s.sFar + (s.sNear - s.sFar) * t);
    }
    // Wer oberhalb des Bodens steht (auf dem Pferd, hinter der Theke), wirft hier keinen Schatten.
    this.shadow
      .setPosition(this.sprite.x, this.sprite.y)
      .setDepth(this.sprite.y - 0.5)
      .setScale(this.sprite.scaleX)
      .setVisible(!this.hidden && (!s || this.sprite.y >= s.yFar - 4));
  }
}
