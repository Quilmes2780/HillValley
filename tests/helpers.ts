import { expect, type Page } from '@playwright/test';

type GamePoint = { x: number; y: number };

export interface HvApi {
  validationErrors: string[];
  state(): {
    chapter: number;
    photoStage: number;
    chronopost: { mode: string; year: number };
    timeline: { tannenburg: boolean };
    flags: Record<string, boolean | number>;
    activeCharacter: string;
    unlockedCharacters: string[];
    characters: Record<string, { room: string; era: number; x: number; y: number; inventory: string[] }>;
  };
  isIdle(): boolean;
  isChoosing(): boolean;
  speech(): { actor: string; text: string }[];
  sentence(): string;
  room(): { id: string; era: number; background: string; width: number; scrollX: number };
  hotspots(): ({ id: string } & GamePoint)[];
  actor(id?: string): ({ depth: number } & GamePoint) | null;
  actorsInRoom(): string[];
  worldImages(): string[];
  walkPathLength(x: number, y: number): [number, number][];
  verb(verb: string): GamePoint;
  menuButton(): GamePoint;
  inventory(): ({ id: string } & GamePoint)[];
  arrow(direction: 'up' | 'down'): GamePoint;
  portraits(): ({ id: string } & GamePoint)[];
  choices(): ({ text: string } & GamePoint)[];
  menu(): ({ text: string } & GamePoint)[] | null;
  debugOpen(): boolean;
  music(): string | null;
  musicPlaying(): boolean;
  muted(): boolean;
  sfx(): string[];
  frames(id: string, anim: string): number;
  zoom(): number;
}

declare global {
  interface Window {
    __hv: HvApi;
  }
}

/** Öffnet das Spiel im Testmodus und wartet, bis es bereit ist. */
export async function openGame(page: Page, scenario: 'spiel' | 'engine' = 'spiel'): Promise<void> {
  await page.goto(scenario === 'engine' ? '/?test=1&szenario=engine' : '/?test=1');
  await page.waitForFunction(() => window.__hv !== undefined);
  expect(await page.evaluate(() => window.__hv.validationErrors)).toEqual([]);
  await waitIdle(page);
}

/** Wandelt Spielpixel in Bildschirmkoordinaten um. */
async function toClient(page: Page, p: GamePoint): Promise<GamePoint> {
  const box = await page.locator('canvas').boundingBox();
  if (!box) throw new Error('Kein Canvas gefunden');
  const factor = box.width / 320;
  return { x: box.x + (p.x + 0.5) * factor, y: box.y + (p.y + 0.5) * factor };
}

export async function clickGame(page: Page, p: GamePoint, button: 'left' | 'right' = 'left'): Promise<void> {
  const c = await toClient(page, p);
  await page.mouse.move(c.x, c.y);
  await page.mouse.down({ button });
  await page.mouse.up({ button });
}

export async function moveGame(page: Page, p: GamePoint): Promise<void> {
  const c = await toClient(page, p);
  await page.mouse.move(c.x, c.y);
}

export async function waitIdle(page: Page): Promise<void> {
  await page.waitForFunction(() => window.__hv.isIdle(), undefined, { timeout: 15_000 });
}

export async function hotspot(page: Page, id: string): Promise<GamePoint> {
  const found = await page.evaluate(
    (wanted) => window.__hv.hotspots().find((h) => h.id === wanted),
    id,
  );
  if (!found) throw new Error(`Hotspot ${id} ist nicht sichtbar`);
  return found;
}

export async function clickVerb(page: Page, verb: string): Promise<void> {
  await clickGame(page, await page.evaluate((v) => window.__hv.verb(v), verb));
}

export async function clickHotspot(page: Page, id: string, button: 'left' | 'right' = 'left'): Promise<void> {
  await clickGame(page, await hotspot(page, id), button);
}

/** Klickt auf einen Gegenstand und blättert das Inventar dafür bei Bedarf. */
export async function clickItem(page: Page, id: string): Promise<void> {
  const find = (): Promise<({ id: string } & GamePoint) | undefined> =>
    page.evaluate((wanted) => window.__hv.inventory().find((i) => i.id === wanted), id);
  const arrow = async (direction: 'up' | 'down'): Promise<void> => {
    await clickGame(page, await page.evaluate((d) => window.__hv.arrow(d), direction));
    await page.waitForTimeout(30);
  };
  for (const direction of ['down', 'up', 'up', 'up', 'up', 'down', 'down', 'down'] as const) {
    const item = await find();
    if (item) {
      await clickGame(page, item);
      return;
    }
    await arrow(direction);
  }
  throw new Error(`Gegenstand ${id} ist nicht im Inventar`);
}

/** Benutze Gegenstand mit Hotspot oder Gegenstand. */
export async function useItem(page: Page, id: string, target: string, kind: 'hotspot' | 'item' = 'hotspot'): Promise<void> {
  await clickVerb(page, 'benutze');
  await clickItem(page, id);
  if (kind === 'item') await clickItem(page, target);
  else await clickHotspot(page, target);
  await waitIdle(page);
}

/** Gib Gegenstand an Hotspot. */
export async function giveItem(page: Page, id: string, target: string): Promise<void> {
  await clickVerb(page, 'gib');
  await clickItem(page, id);
  await clickHotspot(page, target);
  await waitIdle(page);
}

/** Klickt mit „Gehe zu“ auf einen Ausgang und prüft das Ziel. */
export async function go(page: Page, exit: string, target: string): Promise<void> {
  await clickHotspot(page, exit);
  await waitIdle(page);
  expect(await page.evaluate(() => window.__hv.room().id)).toBe(target);
}

/** Rede mit jemandem und wähle nacheinander die genannten Antworten. */
export async function talk(page: Page, id: string, answers: string[]): Promise<void> {
  await clickVerb(page, 'redemit');
  await clickHotspot(page, id);
  for (const answer of answers) await chooseAnswer(page, answer);
  await waitIdle(page);
}

/** Alle bisher gesprochenen Texte. */
export async function allSpeech(page: Page): Promise<string> {
  return page.evaluate(() => window.__hv.speech().map((s) => s.text).join(' | '));
}

export async function flag(page: Page, name: string): Promise<boolean | number | undefined> {
  return page.evaluate((n) => window.__hv.state().flags[n], name);
}

/** Verb + Hotspot, danach warten, bis alles fertig ist. */
export async function act(page: Page, verb: string, id: string): Promise<void> {
  await clickVerb(page, verb);
  await clickHotspot(page, id);
  await waitIdle(page);
}

export async function lastSpeech(page: Page): Promise<string> {
  return page.evaluate(() => window.__hv.speech().at(-1)?.text ?? '');
}

export async function inventoryOf(page: Page, who?: string): Promise<string[]> {
  return page.evaluate((id) => {
    const s = window.__hv.state();
    return s.characters[id ?? s.activeCharacter].inventory;
  }, who);
}

export async function chooseAnswer(page: Page, startsWith: string): Promise<void> {
  await page.waitForFunction(() => window.__hv.isChoosing());
  const choice = await page.evaluate(
    (text) => window.__hv.choices().find((c) => c.text.startsWith(text)),
    startsWith,
  );
  if (!choice) throw new Error(`Antwort „${startsWith}“ wird nicht angeboten`);
  await clickGame(page, choice);
  // Die Antwortzeilen verschwinden sofort; danach läuft der Dialog weiter.
  await page.waitForFunction(() => !window.__hv.isChoosing());
}

export async function menuRow(page: Page, startsWith: string): Promise<GamePoint> {
  const row = await page.evaluate(
    (text) => window.__hv.menu()?.find((r) => r.text.startsWith(text)),
    startsWith,
  );
  if (!row) throw new Error(`Menüzeile „${startsWith}“ fehlt`);
  return row;
}

/** Sammelt unerwartete Fehler; am Testende muss die Liste leer sein. */
export function watchErrors(page: Page): string[] {
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(`pageerror: ${error.message}`));
  page.on('console', (message) => {
    if (message.type() === 'error') errors.push(`console: ${message.text()}`);
  });
  return errors;
}
