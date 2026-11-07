import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { expect, test } from '@playwright/test';
import { act, clickGame, openGame, waitIdle, watchErrors } from './helpers';
import { playProlog } from './walkthrough';

interface TitleApi {
  rows(): { text: string; x: number; y: number }[];
  music(): string | null;
  muted(): boolean;
}

declare global {
  interface Window {
    __hvTitle: TitleApi;
  }
}

const de = JSON.parse(readFileSync('src/i18n/de.json', 'utf8')) as Record<string, unknown>;

/** Zeichenbreiten aus der erzeugten Schrift. */
function fontWidths(): Map<string, number> {
  const xml = readFileSync('assets/ui/font.xml', 'utf8');
  const map = new Map<string, number>();
  for (const m of xml.matchAll(/<char id="(\d+)"[^>]*xadvance="(\d+)"/g)) {
    map.set(String.fromCodePoint(Number(m[1])), Number(m[2]));
  }
  return map;
}

function allStrings(node: unknown, out: string[] = []): string[] {
  if (typeof node === 'string') out.push(node);
  else if (Array.isArray(node)) node.forEach((n) => allStrings(n, out));
  else if (node && typeof node === 'object') Object.values(node).forEach((n) => allStrings(n, out));
  return out;
}

const INK_DIR = 'src/game/dialogs';
const inkFiles = readdirSync(INK_DIR).map((f) => readFileSync(join(INK_DIR, f), 'utf8'));

test.describe('Meilenstein 6: Feinschliff', () => {
  test('Standardsprüche: mindestens 15 je spielbarer Figur', () => {
    const comments = de.comments as Record<string, { default: string[] }>;
    for (const who of ['marty', 'doc_jung', 'doc']) {
      expect(new Set(comments[who].default).size, who).toBeGreaterThanOrEqual(15);
    }
  });

  test('Schrift: Jedes Zeichen aus Texten und Dialogen ist vorhanden', () => {
    const widths = fontWidths();
    const missing = new Set<string>();
    const texts = [...allStrings(de), ...inkFiles.flatMap((f) => f.split('\n').filter((l) => !l.startsWith('//')))];
    for (const text of texts) {
      for (const ch of text.replace(/\{\w+\}/g, '')) {
        if (ch.trim() && !widths.has(ch)) missing.add(ch);
      }
    }
    // Ink-Syntax erscheint nie auf dem Bildschirm.
    for (const syntax of ['{', '}', '~', '|', '^']) missing.delete(syntax);
    expect([...missing]).toEqual([]);
  });

  test('Dialoge: Keine Antwort ist breiter als der Bildschirm, nie mehr als 4 auf einmal', () => {
    const widths = fontWidths();
    const tooWide: string[] = [];
    for (const ink of inkFiles) {
      for (const m of ink.matchAll(/^\s*[+*].*?\[(.+?)\]/gm)) {
        const w = [...m[1]].reduce((sum, ch) => sum + (widths.get(ch) ?? 5), 0);
        if (w > 312) tooWide.push(`${w}: ${m[1]}`);
      }
      for (const knot of ink.split(/^===/m)) {
        // Antworten, die es nur vor Kapitel 1 gibt, schließen sich mit denen danach aus.
        const exclusive = (knot.match(/^\s*[+*] \{not hasFlag\("k1_begonnen"\)\}/gm) ?? []).length;
        const count = (knot.match(/^\s*[+*] /gm) ?? []).length - exclusive;
        expect(count, knot.slice(0, 30)).toBeLessThanOrEqual(4);
      }
    }
    expect(tooWide).toEqual([]);
  });

  test('Titelbild: Neues Spiel startet den Prolog, Laden setzt den Spielstand fort', async ({ page }) => {
    const errors = watchErrors(page);
    await page.goto('/?test=1&titel=1');
    await page.waitForFunction(() => window.__hvTitle !== undefined);
    expect(await page.evaluate(() => window.__hvTitle.music())).toBe('titel');
    const rows = await page.evaluate(() => window.__hvTitle.rows().map((r) => r.text));
    expect(rows[0]).toBe('Neues Spiel');
    expect(rows[1]).toBe('Spiel laden');
    await page.screenshot({ path: 'test-results/titel.png' });

    // Ton umschalten über die Menüzeile, Beschriftung folgt
    const row = async (start: string): Promise<{ x: number; y: number }> =>
      (await page.evaluate((s) => window.__hvTitle.rows().find((r) => r.text.startsWith(s)), start))!;
    const before = await page.evaluate(() => window.__hvTitle.muted());
    await clickGame(page, await row('Ton'));
    await expect.poll(() => page.evaluate(() => window.__hvTitle.muted())).toBe(!before);

    // Ohne Spielstand gibt es beim Laden nichts anzuklicken außer Zurück.
    await clickGame(page, await row('Spiel laden'));
    await expect.poll(() => page.evaluate(() => window.__hvTitle.rows().map((r) => r.text))).toEqual(['Zurück']);
    await clickGame(page, await row('Zurück'));

    await expect.poll(() => page.evaluate(() => window.__hvTitle.rows().length)).toBe(3);
    await clickGame(page, await row('Neues Spiel'));
    await page.waitForFunction(() => window.__hv !== undefined);
    await waitIdle(page);
    expect(await page.evaluate(() => window.__hv.room().id)).toBe('martys_zimmer');
    expect((await page.evaluate(() => window.__hv.speech()))[0].text).toContain('Prolog');
    expect(await page.evaluate(() => window.__hv.music())).toBe('jahr1986');
    // Nach dem ersten Klick läuft das Stück tatsächlich.
    await expect.poll(() => page.evaluate(() => window.__hv.musicPlaying())).toBe(true);

    // Speichern, zurück zum Titel, von dort laden: Ohne Titelkarte weiter im selben Zustand.
    await act(page, 'nimm', 'kugelschreiber');
    await page.keyboard.press('F5');
    const slot = await page.evaluate(() => window.__hv.menu()!.find((r) => r.text.startsWith('1:'))!);
    await clickGame(page, slot);
    await page.goto('/?test=1&titel=1');
    await page.waitForFunction(() => window.__hvTitle !== undefined);
    await clickGame(page, await row('Spiel laden'));
    await expect.poll(() => page.evaluate(() => window.__hvTitle.rows().length)).toBeGreaterThan(1);
    await clickGame(page, await row('1:'));
    await page.waitForFunction(() => window.__hv !== undefined);
    await waitIdle(page);
    expect(await page.evaluate(() => window.__hv.state().flags.kugelschreiber_genommen)).toBe(true);
    expect((await page.evaluate(() => window.__hv.speech())).length).toBe(0);
    expect(errors).toEqual([]);
  });

  test('Musik folgt der Zeitebene und Tannenburg, Effekte erklingen, M schaltet stumm', async ({ page }) => {
    const errors = watchErrors(page);
    await openGame(page);
    const music = (): Promise<string | null> => page.evaluate(() => window.__hv.music());
    expect(await music()).toBe('jahr1986');

    await page.keyboard.press('F9');
    for (const [room, era, track] of [
      ['rathausplatz', '1955', 'jahr1955'],
      ['festplatz', '1885', 'jahr1885'],
      ['turmplatz', '2015', 'jahr2015'],
      ['docs_labor', '1986', 'jahr1986'],
    ] as const) {
      await page.selectOption('#hv-debug-room', room);
      await page.selectOption('#hv-debug-era', era);
      await page.click('#hv-debug-go');
      expect(await music(), room).toBe(track);
    }
    await page.keyboard.press('F9');

    // Ein neues Spiel: Die Zeitwelle wechselt das Stück nach Tannenburg.
    await page.goto('/?test=1');
    await page.waitForFunction(() => window.__hv !== undefined);
    await waitIdle(page);
    await playProlog(page);
    expect(await music()).toBe('tannenburg');

    const sfx = await page.evaluate(() => window.__hv.sfx());
    for (const name of ['klick', 'nimm', 'bellen', 'welle']) expect(sfx, name).toContain(name);

    const before = await page.evaluate(() => window.__hv.muted());
    await page.keyboard.press('m');
    await expect.poll(() => page.evaluate(() => window.__hv.muted())).toBe(!before);
    expect(errors).toEqual([]);
  });
});
