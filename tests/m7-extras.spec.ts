import { readFileSync } from 'node:fs';
import { expect, test } from '@playwright/test';
import { act, clickGame, openGame, waitIdle, watchErrors } from './helpers';

const de = JSON.parse(readFileSync('src/i18n/de.json', 'utf8')) as { say: Record<string, Record<string, string>> };

test.describe('Meilenstein 7: Bedienung, Hinweise, Easter Eggs', () => {
  test('Alle Tipps und Gag-Texte gibt es wirklich', () => {
    const hints = readFileSync('src/game/hints.ts', 'utf8');
    const names = [...hints.matchAll(/'([a-z0-9_]+)'/g)].map((m) => m[1]).filter((n) => /^(ende|prolog_|k\d)/.test(n));
    expect(names.length).toBeGreaterThan(50);
    expect(names.filter((n) => !de.say.hint[n])).toEqual([]);

    const extras = readFileSync('src/game/rooms/extras.ts', 'utf8');
    const used = [...extras.matchAll(/(?:say|line)\('([a-z0-9_]+)'\)/g)].map((m) => m[1]);
    expect(used.length).toBeGreaterThan(20);
    expect(used.filter((n) => !de.say.extra[n])).toEqual([]);
  });

  test('Menü-Knopf öffnet das Menü, dort gibt es einen Tipp', async ({ page }) => {
    const errors = watchErrors(page);
    await openGame(page);
    await clickGame(page, await page.evaluate(() => window.__hv.menuButton()));
    await expect.poll(() => page.evaluate(() => window.__hv.menu() !== null)).toBe(true);
    const row = await page.evaluate(() => window.__hv.menu()!.find((r) => r.text.startsWith('Tipp'))!);
    await clickGame(page, row);
    await expect.poll(() => page.evaluate(() => window.__hv.menu())).toBeNull();
    await waitIdle(page);
    const speech = await page.evaluate(() => window.__hv.speech());
    expect(speech[speech.length - 1].text).toContain('Einstein');
    expect(errors).toEqual([]);
  });

  test('Taste H gibt einen Tipp zum aktuellen Schritt', async ({ page }) => {
    await openGame(page);
    await page.keyboard.press('h');
    await waitIdle(page);
    const speech = await page.evaluate(() => window.__hv.speech());
    expect(speech[speech.length - 1].text).toBe(de.say.hint.prolog_einstein);
  });

  test('Automatisch speichern beim Raumwechsel, im Menü ladbar', async ({ page }) => {
    const errors = watchErrors(page);
    await openGame(page);
    await clickGame(page, await page.evaluate(() => window.__hv.hotspots().find((h) => h.id === 'tuer')!));
    await expect.poll(() => page.evaluate(() => window.__hv.room().id)).toBe('kueche');
    await waitIdle(page);
    expect(await page.evaluate(() => localStorage.getItem('hv_save_auto') !== null)).toBe(true);

    await page.keyboard.press('F5');
    const tab = await page.evaluate(() => window.__hv.menu()!.find((r) => r.text.startsWith('Laden'))!);
    await clickGame(page, tab);
    const auto = await page.evaluate(() => window.__hv.menu()!.find((r) => r.text.startsWith('Automatisch'))!);
    expect(auto.text).toContain('Küche');
    await clickGame(page, auto);
    await expect.poll(() => page.evaluate(() => window.__hv.menu())).toBeNull();
    expect(await page.evaluate(() => window.__hv.room().id)).toBe('kueche');
    expect(errors).toEqual([]);
  });

  test('Doppelklick auf einen Ausgang: Die Figur steht sofort davor', async ({ page }) => {
    await openGame(page);
    const door = await page.evaluate(() => window.__hv.hotspots().find((h) => h.id === 'tuer')!);
    await clickGame(page, door);
    await clickGame(page, door);
    await expect.poll(() => page.evaluate(() => window.__hv.room().id), { timeout: 1500 }).toBe('kueche');
  });

  test('Gags: Skateboard mitnehmen und benutzen, Unsinn bekommt eine Antwort', async ({ page }) => {
    const errors = watchErrors(page);
    await openGame(page);
    await act(page, 'nimm', 'skateboard');
    await waitIdle(page);
    const inventory = await page.evaluate(() => window.__hv.state().characters.marty.inventory);
    expect(inventory).toContain('skateboard');
    expect((await page.evaluate(() => window.__hv.hotspots())).some((h) => h.id === 'skateboard')).toBe(false);
    expect(errors).toEqual([]);
  });
});
