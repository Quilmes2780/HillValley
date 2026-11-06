import Phaser from 'phaser';
import { BootScene } from './engine/BootScene';
import { GameScene } from './engine/GameScene';
import { TitleScene } from './engine/TitleScene';

const GAME_W = 320;
const GAME_H = 200;

/** Größter ganzzahliger Faktor, der ins Fenster passt: So bleiben alle Pixel gleich groß. */
function integerZoom(): number {
  return Math.max(1, Math.floor(Math.min(window.innerWidth / GAME_W, window.innerHeight / GAME_H)));
}

const game = new Phaser.Game({
  type: Phaser.AUTO,
  parent: 'game',
  backgroundColor: '#000000',
  pixelArt: true,
  scale: {
    mode: Phaser.Scale.NONE,
    width: GAME_W,
    height: GAME_H,
    zoom: integerZoom(),
  },
  scene: [BootScene, TitleScene, GameScene],
});

window.addEventListener('resize', () => game.scale.setZoom(integerZoom()));
