import Phaser from 'phaser';
import type { GameState } from '../game/state';
import type { BurstSpec, RoomEffect } from './types';

const BACK_DEPTH = -400;
const FRONT_DEPTH = 200;
const MAX_PARTICLES = 500;
const GLOW_TEXTURE = 'fx_glow';
const PREWARM_STEPS = 30;
const PREWARM_MS = 100;

const between = (range: readonly [number, number]): number => range[0] + Math.random() * (range[1] - range[0]);

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  age: number;
  life: number;
  color: number;
  w: number;
  h: number;
  gravity: number;
  fade: boolean;
  front: boolean;
}

/** Ein laufender Effekt: Er bekommt die vergangene Zeit und weiß, ob er gerade gilt. */
interface Running {
  when?: (s: GameState) => boolean;
  tick(deltaMs: number, on: boolean): void;
  object?: Phaser.GameObjects.Components.Visible;
  destroy?(): void;
}

function tick(delta: number, p: Particle): void {
  const s = delta / 1000;
  p.vy += p.gravity * s;
  p.x += p.vx * s;
  p.y += p.vy * s;
  p.age += delta;
}

/** Bewegte Raumdetails aus reinen Daten: Bildstreifen, Teilchen, Lichter, Vorbeiziehendes. */
export class RoomFx {
  private running: Running[] = [];
  private particles: Particle[] = [];
  private readonly back: Phaser.GameObjects.Graphics;
  private readonly front: Phaser.GameObjects.Graphics;

  constructor(
    private readonly scene: Phaser.Scene,
    private readonly textureOf: (key: string) => string,
  ) {
    this.back = scene.add.graphics().setDepth(BACK_DEPTH + 1);
    this.front = scene.add.graphics().setDepth(FRONT_DEPTH);
    if (!scene.textures.exists(GLOW_TEXTURE)) {
      const g = scene.add.graphics();
      for (let r = 32; r > 0; r -= 2) {
        g.fillStyle(0xffffff, 0.05);
        g.fillCircle(32, 32, r);
      }
      g.generateTexture(GLOW_TEXTURE, 64, 64);
      g.destroy();
    }
  }

  start(
    effects: readonly RoomEffect[],
    spriteOfHotspot: (id: string) => Phaser.GameObjects.Image | undefined,
    state: GameState,
  ): void {
    this.clear();
    for (const effect of effects) {
      const made = this.make(effect, spriteOfHotspot);
      if (made) this.running.push(made);
    }
    // Regen und Rauch sind beim Betreten schon da, statt erst loszulegen.
    for (let i = 0; i < PREWARM_STEPS; i++) this.update(PREWARM_MS, state, false);
  }

  update(deltaMs: number, state: GameState, draw = true): void {
    for (const r of this.running) {
      const on = !r.when || r.when(state);
      r.object?.setVisible(on);
      r.tick(deltaMs, on);
    }
    for (const p of this.particles) tick(deltaMs, p);
    this.particles = this.particles.filter((p) => p.age < p.life);
    if (draw) this.drawParticles();
  }

  /** Einmaliger Ausstoß, z. B. Mistspritzer oder Funken. */
  burst(x: number, y: number, spec: BurstSpec): void {
    for (let i = 0; i < spec.count; i++) {
      const angle = between(spec.angle ?? [0, Math.PI * 2]);
      const speed = between(spec.speed);
      this.spawn({
        x: x + between(spec.spread ?? [0, 0]),
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        age: 0,
        life: between(spec.life),
        color: spec.colors[Math.floor(Math.random() * spec.colors.length)],
        w: spec.size ?? 1,
        h: spec.size ?? 1,
        gravity: spec.gravity ?? 0,
        fade: true,
        front: true,
      });
    }
  }

  clear(): void {
    for (const r of this.running) r.destroy?.();
    this.running = [];
    this.particles = [];
    this.back.clear();
    this.front.clear();
  }

  private spawn(p: Particle): void {
    if (this.particles.length < MAX_PARTICLES) this.particles.push(p);
  }

  private drawParticles(): void {
    this.back.clear();
    this.front.clear();
    for (const p of this.particles) {
      const g = p.front ? this.front : this.back;
      const left = 1 - p.age / p.life;
      g.fillStyle(p.color, p.fade ? Math.min(1, left * 1.6) : 0.85);
      g.fillRect(Math.round(p.x), Math.round(p.y), p.w, p.h);
    }
  }

  private make(effect: RoomEffect, spriteOfHotspot: (id: string) => Phaser.GameObjects.Image | undefined): Running | null {
    switch (effect.type) {
      case 'strip':
        return this.strip(effect);
      case 'particles':
        return this.emitter(effect);
      case 'glow':
        return this.glow(effect);
      case 'pass':
        return this.pass(effect);
      case 'bob': {
        const sprite = spriteOfHotspot(effect.hotspot);
        if (!sprite) return null;
        const base = sprite.y;
        let t = Math.random() * 1000;
        return {
          when: effect.when,
          tick: (delta) => {
            t += delta;
            sprite.y = Math.round(base + Math.sin((t / (effect.seconds * 1000)) * Math.PI * 2) * effect.amplitude);
          },
        };
      }
    }
  }

  private strip(e: Extract<RoomEffect, { type: 'strip' }>): Running {
    const sprite = this.scene.add
      .sprite(e.x, e.y, this.textureOf(e.key), 0)
      .setOrigin(0, 0)
      .setDepth(e.depthY ?? BACK_DEPTH);
    const frames = Math.max(1, sprite.texture.frameTotal - 1);
    let t = Math.random() * 1000;
    return {
      when: e.when,
      object: sprite,
      tick: (delta) => {
        t += delta;
        const step = Math.floor((t / 1000) * e.fps);
        let frame = step % frames;
        if (e.swing) {
          const span = Math.max(1, frames - 1) * 2;
          const at = step % span;
          frame = at < frames ? at : span - at;
        }
        sprite.setFrame(frame);
      },
      destroy: () => sprite.destroy(),
    };
  }

  private emitter(e: Extract<RoomEffect, { type: 'particles' }>): Running {
    const [x, y, w, h] = e.area;
    let due = 0;
    return {
      when: e.when,
      tick: (delta, on) => {
        if (!on) return;
        due += (delta / 1000) * e.rate;
        while (due >= 1) {
          due -= 1;
          this.spawn({
            x: x + Math.random() * w,
            y: y + Math.random() * h,
            vx: between(e.vx),
            vy: between(e.vy),
            age: 0,
            life: between(e.life),
            color: e.colors[Math.floor(Math.random() * e.colors.length)],
            w: e.size?.[0] ?? 1,
            h: e.size?.[1] ?? 1,
            gravity: e.gravity ?? 0,
            fade: e.fade ?? true,
            front: e.front ?? false,
          });
        }
      },
    };
  }

  private glow(e: Extract<RoomEffect, { type: 'glow' }>): Running {
    const [x, y, w, h] = e.area;
    const depth = e.depthY ?? BACK_DEPTH;
    const object: Phaser.GameObjects.Rectangle | Phaser.GameObjects.Image = e.hard
      ? this.scene.add.rectangle(x, y, w, h, e.color).setOrigin(0, 0)
      : this.scene.add.image(x, y, GLOW_TEXTURE).setOrigin(0, 0).setDisplaySize(w, h).setTint(e.color);
    object.setBlendMode(Phaser.BlendModes.ADD).setDepth(depth);
    let t = Math.random() * 10000;
    let dark = 0;
    return {
      when: e.when,
      object,
      tick: (delta) => {
        t += delta;
        if (dark > 0) dark -= delta;
        else if (e.flicker && Math.random() < (e.flicker * delta) / 1000) dark = 50 + Math.random() * 130;
        const wave = 0.5 + 0.5 * Math.sin((t / 1000) * e.speed * Math.PI * 2);
        const alpha = e.min + (e.max - e.min) * wave;
        object.setAlpha(dark > 0 ? alpha * 0.25 : alpha);
      },
      destroy: () => object.destroy(),
    };
  }

  private pass(e: Extract<RoomEffect, { type: 'pass' }>): Running {
    const sprite = this.scene.add
      .sprite(e.fromX, e.y, this.textureOf(e.key), 0)
      .setOrigin(0, 0)
      .setDepth(e.depthY ?? BACK_DEPTH)
      .setFlipX(e.flip === true)
      .setVisible(false);
    const frames = Math.max(1, sprite.texture.frameTotal - 1);
    let wait = between(e.pause) * 1000 * Math.random();
    let t = 0;
    return {
      when: e.when,
      tick: (delta, on) => {
        if (wait > 0) {
          wait -= delta;
          sprite.setVisible(false);
          return;
        }
        t += delta;
        const f = t / (e.seconds * 1000);
        if (f >= 1 || !on) {
          t = 0;
          wait = between(e.pause) * 1000;
          sprite.setVisible(false);
          return;
        }
        sprite.setVisible(true);
        sprite.x = Math.round(e.fromX + (e.toX - e.fromX) * f);
        sprite.y = Math.round(e.y + Math.sin(t / 240) * (e.wobble ?? 0));
        if (frames > 1) sprite.setFrame(Math.floor((t / 1000) * (e.fps ?? 8)) % frames);
      },
      destroy: () => sprite.destroy(),
    };
  }
}
