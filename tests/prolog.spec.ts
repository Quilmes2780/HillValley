import { expect, test, type Page } from '@playwright/test';
import {
  act,
  chooseAnswer,
  clickGame,
  clickHotspot,
  clickItem,
  clickVerb,
  inventoryOf,
  lastSpeech,
  moveGame,
  hotspot,
  openGame,
  waitIdle,
  watchErrors,
} from './helpers';

const room = (page: Page): Promise<string> => page.evaluate(() => window.__hv.room().id);

/** Klickt mit „Gehe zu“ auf einen Ausgang und prüft das Ziel. */
async function go(page: Page, exit: string, target: string): Promise<void> {
  await clickHotspot(page, exit);
  await waitIdle(page);
  expect(await room(page)).toBe(target);
}

/** Spielt ein Gespräch bis zum Abschied durch. */
async function talk(page: Page, id: string, answers: string[]): Promise<void> {
  await clickVerb(page, 'redemit');
  await clickHotspot(page, id);
  for (const answer of answers) await chooseAnswer(page, answer);
  await waitIdle(page);
}

test.describe('Prolog laut LOESUNGSBUCH.md', () => {
  test('Kompletter Durchlauf: alle Schritte in der Reihenfolge des Lösungsbuchs', async ({ page }) => {
    const errors = watchErrors(page);
    await openGame(page);

    // Start: Titelkarte, Martys Zimmer, nur das Foto im Gepäck
    expect((await page.evaluate(() => window.__hv.speech()))[0].text).toBe('Prolog – Ein ganz normaler Morgen');
    expect(await room(page)).toBe('martys_zimmer');
    expect(await inventoryOf(page)).toEqual(['foto']);
    expect(await page.evaluate(() => window.__hv.state().photoStage)).toBe(0);
    await clickVerb(page, 'schauan');
    await clickItem(page, 'foto');
    await waitIdle(page);
    expect(await lastSpeech(page)).toBe('Ein ganz normaler Herbsttag.');

    // 1. Martys Zimmer: Nimm Kugelschreiber
    await act(page, 'nimm', 'kugelschreiber');
    expect(await inventoryOf(page)).toContain('kugelschreiber');

    // 2. Küche: Nimm Banane, Rede mit Lorraine (Hinweis auf die Reise)
    await go(page, 'tuer', 'kueche');
    await act(page, 'nimm', 'banane');
    expect(await inventoryOf(page)).toContain('banane');
    await talk(page, 'lorraine', ['Hast du Doc', 'Bis später']);
    const lines = await page.evaluate(() => window.__hv.speech().map((s) => s.text));
    expect(lines.some((l) => l.includes('von einer Reise'))).toBe(true);

    // 3. Vorgarten: Rede mit Biff (nur Stimmung)
    await go(page, 'haustuer', 'vorgarten');
    await talk(page, 'biff', ['Warum bist du', 'Dann will ich']);

    // Über den Stadtplan ins Labor
    await go(page, 'strasse', 'stadtplan');
    await go(page, 'plan_labor', 'docs_labor');

    // 4. Schau an Einstein: Er bellt seinen leeren Napf an
    await act(page, 'schauan', 'einstein');
    const einstein = await page.evaluate(() => window.__hv.speech().filter((s) => s.actor === 'einstein'));
    expect(einstein.at(-1)?.text).toBe('Wuff!');

    // 5. Öffne Schrank, Nimm Hundefutter, Benutze Hundefutter mit Napf
    await act(page, 'oeffne', 'schrank');
    await act(page, 'nimm', 'hundefutter');
    expect(await inventoryOf(page)).toContain('hundefutter');
    await clickVerb(page, 'benutze');
    await clickItem(page, 'hundefutter');
    await moveGame(page, await hotspot(page, 'napf'));
    await expect.poll(() => page.evaluate(() => window.__hv.sentence())).toBe('Benutze Hundefutter mit Napf');
    await clickHotspot(page, 'napf');
    await waitIdle(page);
    expect(await inventoryOf(page)).not.toContain('hundefutter');
    expect(await page.evaluate(() => window.__hv.state().flags.einstein_satt)).toBe(true);

    // 6. Schau an Körbchen: leer. Nimm Wachstuch.
    await act(page, 'schauan', 'koerbchen');
    const basket = await page.evaluate(() => window.__hv.speech().map((s) => s.text));
    expect(basket.some((l) => l.includes('Das Versteck ist leer'))).toBe(true);
    await act(page, 'nimm', 'wachstuch');
    expect(await inventoryOf(page)).toContain('wachstuch');
    await clickVerb(page, 'schauan');
    await clickItem(page, 'wachstuch');
    await waitIdle(page);
    expect(await lastSpeech(page)).toContain('Autowachs');

    // 7. Nimm Docs Brief: Doc erklärt Chronopost und Notbetrieb
    await act(page, 'nimm', 'docs_brief');
    expect(await inventoryOf(page)).toContain('docs_brief');
    const doc = await page.evaluate(() =>
      window.__hv.speech().filter((s) => s.actor === 'doc').map((s) => s.text).join(' '),
    );
    expect(doc).toContain('Chronopost');
    expect(doc).toContain('Notbetrieb');

    // 8. Nimm Notizbuch
    await act(page, 'nimm', 'notizbuch');
    expect(await inventoryOf(page)).toContain('notizbuch');

    // 9. Nimm Mr. Fusion: „Leer. Typisch Doc.“
    await act(page, 'nimm', 'mr_fusion');
    expect(await inventoryOf(page)).toContain('mr_fusion');
    expect(await lastSpeech(page)).toBe('Leer. Typisch Doc.');

    // 10. Labor verlassen: Zeitwelle, Foto Stufe 1, Kapitel 1
    await clickHotspot(page, 'tuer');
    await waitIdle(page);
    const state = await page.evaluate(() => window.__hv.state());
    expect(state.photoStage).toBe(1);
    expect(state.chapter).toBe(1);
    expect(state.timeline.tannenburg).toBe(true);
    expect(await room(page)).toBe('stadtplan');
    expect(await lastSpeech(page)).toBe('Kapitel 1 – Tannenburg');
    expect((await page.evaluate(() => window.__hv.room())).background).toBe(
      'backgrounds/stadtplan_1986_tannenburg.png',
    );

    // Foto: neuer Hinweis auf das nächste Ziel
    await clickVerb(page, 'schauan');
    await clickItem(page, 'foto');
    await waitIdle(page);
    expect(await lastSpeech(page)).toBe('Irgendwas stimmt hier nicht. Ich muss zum Rathausturm.');

    // Der Vorgarten zeigt jetzt Tannenburg, Biff ist weg
    await go(page, 'plan_haus', 'vorgarten');
    expect((await page.evaluate(() => window.__hv.room())).background).toBe(
      'backgrounds/vorgarten_1986_tannenburg.png',
    );
    expect(await page.evaluate(() => window.__hv.actorsInRoom())).not.toContain('biff');
    expect(errors).toEqual([]);
  });

  test('Labor lässt sich erst mit Brief, Notizbuch und Mr. Fusion verlassen', async ({ page }) => {
    const errors = watchErrors(page);
    await openGame(page);
    await page.keyboard.press('F9');
    await page.selectOption('#hv-debug-room', 'docs_labor');
    await page.selectOption('#hv-debug-era', '1986');
    await page.click('#hv-debug-go');
    await page.keyboard.press('F9');

    const tryLeave = async (): Promise<void> => {
      await clickHotspot(page, 'tuer');
      await waitIdle(page);
    };

    await tryLeave();
    expect(await room(page)).toBe('docs_labor');
    expect(await lastSpeech(page)).toContain('erst alles zusammensuchen');

    await act(page, 'nimm', 'docs_brief');
    await tryLeave();
    expect(await room(page)).toBe('docs_labor');
    await act(page, 'nimm', 'notizbuch');
    await tryLeave();
    expect(await room(page)).toBe('docs_labor');
    await act(page, 'nimm', 'mr_fusion');
    await tryLeave();
    expect(await room(page)).toBe('stadtplan');
    expect(await page.evaluate(() => window.__hv.state().chapter)).toBe(1);
    expect(errors).toEqual([]);
  });

  test('Keine Sackgasse: Ohne Fütterung verlassen, Wachstuch und Rest bleiben erreichbar', async ({ page }) => {
    const errors = watchErrors(page);
    await openGame(page);
    await page.keyboard.press('F9');
    await page.selectOption('#hv-debug-room', 'docs_labor');
    await page.selectOption('#hv-debug-era', '1986');
    await page.click('#hv-debug-go');
    await page.keyboard.press('F9');

    // Vor dem Füttern gibt es das Wachstuch nicht, das Körbchen ist blockiert.
    const ids = async (): Promise<string[]> => page.evaluate(() => window.__hv.hotspots().map((h) => h.id));
    expect(await ids()).not.toContain('wachstuch');
    await act(page, 'schauan', 'koerbchen');
    expect(await lastSpeech(page)).toContain('lässt mich nicht heran');

    // Nur das Nötigste nehmen und gehen: Die Zeitwelle läuft.
    await act(page, 'nimm', 'docs_brief');
    await act(page, 'nimm', 'notizbuch');
    await act(page, 'nimm', 'mr_fusion');
    await clickHotspot(page, 'tuer');
    await waitIdle(page);
    expect(await page.evaluate(() => window.__hv.state().chapter)).toBe(1);

    // Zurück ins Labor: Hund füttern und Wachstuch holen geht weiterhin.
    await go(page, 'plan_labor', 'docs_labor');
    await act(page, 'oeffne', 'schrank');
    await act(page, 'nimm', 'hundefutter');
    await clickVerb(page, 'benutze');
    await clickItem(page, 'hundefutter');
    await clickHotspot(page, 'einstein');
    await waitIdle(page);
    await act(page, 'nimm', 'wachstuch');
    expect(await inventoryOf(page)).toContain('wachstuch');

    // Kugelschreiber und Banane liegen auch noch dort.
    await go(page, 'tuer', 'stadtplan');
    await go(page, 'plan_haus', 'vorgarten');
    await go(page, 'haustuer', 'kueche');
    await act(page, 'nimm', 'banane');
    await go(page, 'treppe', 'martys_zimmer');
    await act(page, 'nimm', 'kugelschreiber');
    expect(await inventoryOf(page)).toContain('kugelschreiber');
    expect(errors).toEqual([]);
  });

  test('Optionaler Gag: Gitarre mit Riesenverstärker, keine Folgen', async ({ page }) => {
    const errors = watchErrors(page);
    await openGame(page);
    await page.keyboard.press('F9');
    await page.selectOption('#hv-debug-room', 'docs_labor');
    await page.selectOption('#hv-debug-era', '1986');
    await page.click('#hv-debug-go');
    await page.keyboard.press('F9');

    const before = await inventoryOf(page);
    await clickVerb(page, 'benutze');
    await clickHotspot(page, 'gitarre');
    await moveGame(page, await hotspot(page, 'riesenverstaerker'));
    await expect.poll(() => page.evaluate(() => window.__hv.sentence())).toBe('Benutze Gitarre mit Riesenverstärker');
    await clickHotspot(page, 'riesenverstaerker');
    await waitIdle(page);
    expect(await lastSpeech(page)).toBe('Autsch. Etwas zu laut.');
    // Marty ist gegen das Regal geflogen, sonst ändert sich nichts.
    expect(Math.round((await page.evaluate(() => window.__hv.actor()!)).x)).toBe(80);
    expect(await inventoryOf(page)).toEqual(before);
    expect(errors).toEqual([]);
  });

  test('Banane: Benutzen ergibt Bananenschale (für Kapitel 1)', async ({ page }) => {
    await openGame(page);
    await go(page, 'tuer', 'kueche');
    await act(page, 'nimm', 'banane');
    await clickVerb(page, 'benutze');
    await clickItem(page, 'banane');
    await waitIdle(page);
    expect(await inventoryOf(page)).toEqual(['foto', 'bananenschale']);
  });

  test('Spielstand nach der Zeitwelle bleibt erhalten', async ({ page }) => {
    const errors = watchErrors(page);
    await openGame(page);
    await page.keyboard.press('F9');
    await page.selectOption('#hv-debug-room', 'docs_labor');
    await page.selectOption('#hv-debug-era', '1986');
    await page.click('#hv-debug-go');
    await page.keyboard.press('F9');
    await act(page, 'nimm', 'docs_brief');
    await act(page, 'nimm', 'notizbuch');
    await act(page, 'nimm', 'mr_fusion');
    await clickHotspot(page, 'tuer');
    await waitIdle(page);
    await page.keyboard.press('F5');
    const row = await page.evaluate(() => window.__hv.menu()!.find((r) => r.text.startsWith('1:'))!);
    await clickGame(page, row);
    await page.keyboard.press('Escape');

    await page.reload();
    await page.waitForFunction(() => window.__hv !== undefined);
    await waitIdle(page);
    expect(await page.evaluate(() => window.__hv.state().chapter)).toBe(0);
    await page.keyboard.press('F5');
    const tab = await page.evaluate(() => window.__hv.menu()!.find((r) => r.text.startsWith('Laden'))!);
    await clickGame(page, tab);
    const slot = await page.evaluate(() => window.__hv.menu()!.find((r) => r.text.startsWith('1:'))!);
    await clickGame(page, slot);
    await expect.poll(() => page.evaluate(() => window.__hv.state().chapter)).toBe(1);
    expect(await page.evaluate(() => window.__hv.state().photoStage)).toBe(1);
    expect(await room(page)).toBe('stadtplan');
    expect(errors).toEqual([]);
  });
});
