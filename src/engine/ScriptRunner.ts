import type { AnimName } from './CharacterLoader';
import type { GameScene } from './GameScene';
import { t } from './i18n';
import type { Script, ScriptApi } from './types';

/** Führt Skripte aus und sperrt währenddessen die Bedienung. */
export class ScriptRunner {
  busy = false;
  readonly api: ScriptApi;

  constructor(private readonly scene: GameScene) {
    const self = scene;
    this.api = {
      get state() {
        return self.state;
      },
      say: (key, params) => self.sayLine(self.state.activeCharacter, t(key, params)),
      sayAs: (actor, key, params) => self.sayLine(actor, t(key, params)),
      walkTo: async (to, actor, speed) => {
        await self.walkActor(actor ?? self.state.activeCharacter, to, speed);
      },
      face: (dir, actor) => self.actorOf(actor ?? self.state.activeCharacter)?.face(dir),
      playAnim: async (anim, actor) => {
        await self.actorOf(actor ?? self.state.activeCharacter)?.playOnce(anim as AnimName);
      },
      addItem: (id) => self.addItem(id),
      removeItem: (id) => self.removeItem(id),
      hasItem: (id) => self.activeState().inventory.includes(id),
      setFlag: (name, value = true) => {
        self.state.flags[name] = value;
        self.refreshRoom();
      },
      getFlag: (name) => self.state.flags[name] ?? false,
      goToRoom: (room, era, at, face) => self.goToRoom(room, era, at, face),
      dialog: (id) => self.dialog.run(id, this.api),
      wait: (ms) => self.wait(ms),
      cutscene: async (run) => {
        self.setUiVisible(false);
        try {
          await run();
        } finally {
          self.setUiVisible(true);
        }
      },
      unlockCharacter: (id) => self.unlockCharacter(id),
      switchCharacter: async (id) => self.switchCharacter(id),
      setPhotoStage: (stage) => {
        self.state.photoStage = stage;
        self.refreshInventory();
      },
      showCard: (titleKey, subtitleKey) => self.showCard(t(titleKey), subtitleKey && t(subtitleKey)),
      timeWave: () => self.playTimeWave(),
      shake: (ms = 400) => void self.cameras.main.shake(ms, 0.01),
      flash: (ms = 250) => void self.cameras.main.flash(ms),
    };
  }

  async run(script: Script): Promise<void> {
    if (this.busy) {
      console.warn('Skript ignoriert: Es läuft bereits eines.');
      return;
    }
    this.busy = true;
    try {
      await script(this.api);
    } catch (error) {
      // Ein Fehler im Skript darf das Spiel nicht einfrieren: Sackgassen sind verboten.
      console.error('Fehler im Skript:', error);
    } finally {
      this.busy = false;
      this.scene.afterScript();
    }
  }
}
