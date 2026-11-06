import { expect, test } from '@playwright/test';
import { PNG } from 'pngjs';
import {
  act,
  chooseAnswer,
  clickGame,
  clickHotspot,
  clickItem,
  clickVerb,
  hotspot,
  inventoryOf,
  lastSpeech,
  menuRow,
  moveGame,
  openGame,
  waitIdle,
  watchErrors,
} from './helpers';

test.describe('Meilenstein 1: Engine-Kern', () => {
  test('Darstellung: ganzzahliger Zoom, Pixel bleiben gleich groß', async ({ page }) => {
    await page.setViewportSize({ width: 1000, height: 700 });
    await openGame(page, 'engine');
    expect(await page.evaluate(() => window.__hv.zoom())).toBe(3);
    await expect.poll(async () => (await page.locator('canvas').boundingBox())?.width).toBe(960);

    await page.setViewportSize({ width: 1400, height: 900 });
    await expect.poll(() => page.evaluate(() => window.__hv.zoom())).toBe(4);
    await expect.poll(async () => (await page.locator('canvas').boundingBox())?.width).toBe(1280);
  });

  test('Laufen: Weg führt um den Tisch herum, Figur steht hinter dem Tisch', async ({ page }) => {
    const errors = watchErrors(page);
    await openGame(page, 'engine');

    const path = await page.evaluate(() => window.__hv.walkPathLength(210, 105));
    expect(path.length).toBeGreaterThan(1);
    // Kein Teilstück darf die Tischfläche (x 130–190, y 100–118) schneiden.
    const start = await page.evaluate(() => window.__hv.actor()!);
    let [px, py] = [start.x, start.y];
    for (const [x, y] of path) {
      for (let i = 0; i <= 20; i++) {
        const sx = px + ((x - px) * i) / 20;
        const sy = py + ((y - py) * i) / 20;
        expect(sx > 130.5 && sx < 189.5 && sy > 100.5 && sy < 117.5).toBe(false);
      }
      [px, py] = [x, y];
    }

    await clickGame(page, { x: 210, y: 105 });
    await waitIdle(page);
    const end = await page.evaluate(() => window.__hv.actor()!);
    expect(Math.round(end.x)).toBe(210);
    expect(Math.round(end.y)).toBe(105);

    // Klick außerhalb der Walkbox: Figur läuft zum nächsten begehbaren Punkt.
    await clickGame(page, { x: 210, y: 70 });
    await waitIdle(page);
    expect(Math.round((await page.evaluate(() => window.__hv.actor()!)).y)).toBe(92);

    // Hinter dem Tisch: Tiefe kleiner als die Tischkante (118).
    await clickGame(page, { x: 160, y: 95 });
    await waitIdle(page);
    expect((await page.evaluate(() => window.__hv.actor()!)).depth).toBeLessThan(118);
    expect(errors).toEqual([]);
  });

  test('Verben: Satzzeile baut sich auf, Rechtsklick nutzt das Standardverb', async ({ page }) => {
    const errors = watchErrors(page);
    await openGame(page, 'engine');
    const sentence = (): Promise<string> => page.evaluate(() => window.__hv.sentence());

    await moveGame(page, await hotspot(page, 'tuer'));
    await expect.poll(sentence).toBe('Gehe zu Tür');
    await clickVerb(page, 'oeffne');
    await expect.poll(sentence).toBe('Öffne');
    await moveGame(page, await hotspot(page, 'tuer'));
    await expect.poll(sentence).toBe('Öffne Tür');
    await clickVerb(page, 'schauan');
    await clickHotspot(page, 'schrank');
    // Während des Laufens steht der vollständige Satz in der Zeile.
    expect(await sentence()).toBe('Schau an Schrank');
    await waitIdle(page);
    expect(await lastSpeech(page)).toBe('Ein Schrank. Könnte etwas enthalten.');

    // Gehe zu: ebenfalls ohne „mit“ am Ende.
    await clickHotspot(page, 'tisch');
    expect(await sentence()).toBe('Gehe zu Tisch');
    await waitIdle(page);

    // Rechtsklick: Standardverb. Tür hat Öffne, Apfel hat Schau an.
    await clickHotspot(page, 'tuer', 'right');
    await waitIdle(page);
    expect(await page.evaluate(() => window.__hv.state().flags.test_tuer_offen)).toBe(true);
    await clickHotspot(page, 'apfel', 'right');
    await waitIdle(page);
    expect(await lastSpeech(page)).toContain('Ein Apfel auf einem Tisch');

    // Alle Verben: Nichts bleibt ohne Antwort, und kein Text fehlt.
    const before = await page.evaluate(() => window.__hv.speech().length);
    for (const verb of ['gib', 'schliesse', 'nimm', 'redemit', 'druecke', 'ziehe']) {
      await act(page, verb, 'tisch');
    }
    const lines = await page.evaluate((from) => window.__hv.speech().slice(from), before);
    expect(lines.length).toBe(6);
    for (const line of lines) expect(line.text.startsWith('[')).toBe(false);
    expect(errors).toEqual([]);
  });

  test('Inventar: Nehmen, Kombinieren in beiden Reihenfolgen, falsche Kombination, Blättern', async ({ page }) => {
    const errors = watchErrors(page);
    await openGame(page, 'engine');

    expect(await inventoryOf(page)).toEqual(['foto']);
    await act(page, 'schauan', 'schrank');
    await act(page, 'oeffne', 'schrank');
    await act(page, 'nimm', 'schachtel');
    await act(page, 'nimm', 'apfel');
    expect(await inventoryOf(page)).toEqual(['foto', 'schachtel', 'apfel']);
    expect((await page.evaluate(() => window.__hv.hotspots())).some((h) => h.id === 'apfel')).toBe(false);

    // Foto: Schau an liefert den Text der aktuellen Stufe.
    await clickVerb(page, 'schauan');
    await clickItem(page, 'foto');
    await waitIdle(page);
    expect(await lastSpeech(page)).toBe('Ein ganz normaler Herbsttag.');

    // Falsche Kombination bekommt einen Kommentar der Figur.
    await clickVerb(page, 'benutze');
    await clickItem(page, 'apfel');
    await moveGame(page, (await page.evaluate(() => window.__hv.inventory().find((i) => i.id === 'foto')))!);
    await expect.poll(() => page.evaluate(() => window.__hv.sentence())).toBe('Benutze Apfel mit Familienfoto');
    await clickItem(page, 'foto');
    await waitIdle(page);
    expect(['Damit weiß ich nichts anzufangen.', 'Wie soll ich das denn benutzen?', 'Das passt nicht zusammen.']).toContain(
      await lastSpeech(page),
    );
    expect(await inventoryOf(page)).toContain('apfel');

    // Richtige Kombination: Reihenfolge B mit A.
    await clickVerb(page, 'benutze');
    await clickItem(page, 'schachtel');
    await clickItem(page, 'apfel');
    await waitIdle(page);
    expect(await inventoryOf(page)).toEqual(['foto', 'apfelschachtel']);

    // Blättern: Debug-Panel füllt das Inventar auf 9 Dinge.
    await page.keyboard.press('F9');
    for (const id of ['apfel', 'schachtel', 'muenze', 'keks', 'ding1', 'ding2', 'ding3']) {
      await page.selectOption('#hv-debug-item', id);
      await page.click('#hv-debug-give');
    }
    await page.keyboard.press('F9');
    expect((await inventoryOf(page)).length).toBe(9);
    expect(await page.evaluate(() => window.__hv.inventory().length)).toBe(8);
    await clickGame(page, await page.evaluate(() => window.__hv.arrow('down')));
    // Geblättert wird zeilenweise: Die zweite Zeile rückt nach oben.
    await expect
      .poll(() => page.evaluate(() => window.__hv.inventory().map((i) => i.id)))
      .toEqual(['muenze', 'keks', 'ding1', 'ding2', 'ding3']);
    await clickGame(page, await page.evaluate(() => window.__hv.arrow('up')));
    await expect.poll(() => page.evaluate(() => window.__hv.inventory().length)).toBe(8);

    // Direkt benutzbarer Gegenstand: Keks wird gegessen.
    await clickVerb(page, 'benutze');
    await clickItem(page, 'keks');
    await waitIdle(page);
    expect(await inventoryOf(page)).not.toContain('keks');
    expect(errors).toEqual([]);
  });

  test('Ausgänge und Zeitebenen: Bedingung, Raumwechsel, Scrollen, andere Hotspots', async ({ page }) => {
    const errors = watchErrors(page);
    await openGame(page, 'engine');

    // Geschlossene Tür hält auf.
    await clickHotspot(page, 'tuer');
    await waitIdle(page);
    expect(await lastSpeech(page)).toBe('Die Tür ist zu.');
    expect((await page.evaluate(() => window.__hv.room())).id).toBe('testraum');

    await act(page, 'oeffne', 'tuer');
    await clickHotspot(page, 'tuer');
    await waitIdle(page);
    expect((await page.evaluate(() => window.__hv.room())).id).toBe('testflur');

    // Der Flur ist breiter als der Bildschirm: Die Kamera folgt.
    expect((await page.evaluate(() => window.__hv.room())).scrollX).toBe(0);
    await clickGame(page, { x: 310, y: 120 });
    await waitIdle(page);
    await clickGame(page, { x: 310, y: 120 });
    await waitIdle(page);
    expect((await page.evaluate(() => window.__hv.room())).scrollX).toBeGreaterThan(0);

    // Zurück und in die andere Zeitebene.
    await clickGame(page, { x: 5, y: 120 });
    await waitIdle(page);
    await clickGame(page, { x: 5, y: 120 });
    await waitIdle(page);
    await clickHotspot(page, 'tuer');
    await waitIdle(page);
    expect((await page.evaluate(() => window.__hv.room())).id).toBe('testraum');

    const ids = async (): Promise<string[]> =>
      page.evaluate(() => window.__hv.hotspots().map((h) => h.id));
    expect(await ids()).toContain('tisch');

    await act(page, 'druecke', 'schalter');
    const old = await page.evaluate(() => window.__hv.room());
    expect(old.era).toBe(1885);
    expect(old.background).toBe('backgrounds/testraum_1885.png');
    expect(await ids()).toContain('laterne');
    expect(await ids()).not.toContain('tisch');

    await act(page, 'druecke', 'schalter');
    expect((await page.evaluate(() => window.__hv.room())).era).toBe(1986);
    // Das Flag aus 1986 ist noch gesetzt: Die Tür bleibt offen.
    expect(await page.evaluate(() => window.__hv.state().flags.test_tuer_offen)).toBe(true);
    expect(errors).toEqual([]);
  });

  test('Dialog: Antworten wählen, Flags, Gegenstand, Figuren freischalten', async ({ page }) => {
    const errors = watchErrors(page);
    await openGame(page, 'engine');
    expect(await page.evaluate(() => window.__hv.portraits().length)).toBe(0);

    await clickVerb(page, 'redemit');
    await clickHotspot(page, 'testfigur');
    await page.waitForFunction(() => window.__hv.isChoosing());
    const first = await page.evaluate(() => window.__hv.choices().map((c) => c.text));
    expect(first.length).toBe(4);

    await chooseAnswer(page, 'Was genau');
    await page.waitForFunction(() => window.__hv.isChoosing());
    expect(await page.evaluate(() => window.__hv.state().flags.test_gefragt)).toBe(true);

    await chooseAnswer(page, 'Hast du');
    await page.waitForFunction(() => window.__hv.isChoosing());
    expect(await inventoryOf(page)).toContain('muenze');
    // Die Frage nach der Münze wird nicht mehr angeboten.
    expect(await page.evaluate(() => window.__hv.choices().length)).toBe(3);

    await chooseAnswer(page, 'Ich möchte');
    await page.waitForFunction(() => window.__hv.isChoosing());
    await chooseAnswer(page, 'Auf Wieder');
    await waitIdle(page);

    const speakers = await page.evaluate(() => window.__hv.speech().map((s) => s.actor));
    expect(speakers).toContain('test_npc');
    expect(speakers).toContain('marty');
    expect(await page.evaluate(() => window.__hv.portraits().length)).toBe(3);

    // Gib Münze an Testfigur
    await clickVerb(page, 'gib');
    await clickItem(page, 'muenze');
    await moveGame(page, await hotspot(page, 'testfigur'));
    await expect.poll(() => page.evaluate(() => window.__hv.sentence())).toBe('Gib Münze an Testfigur');
    await clickHotspot(page, 'testfigur');
    await waitIdle(page);
    expect(await inventoryOf(page)).not.toContain('muenze');
    expect(await lastSpeech(page)).toContain('Danke');
    expect(errors).toEqual([]);
  });

  test('Figurenwechsel: Ort und Inventar bleiben je Figur erhalten', async ({ page }) => {
    const errors = watchErrors(page);
    await openGame(page, 'engine');

    await act(page, 'nimm', 'apfel');
    await clickGame(page, { x: 230, y: 125 });
    await waitIdle(page);

    await page.keyboard.press('F9');
    await page.click('#hv-debug-char-doc_jung');
    await page.click('#hv-debug-char-doc');
    await page.click('#hv-debug-char-marty');
    await page.keyboard.press('F9');
    expect(await page.evaluate(() => window.__hv.portraits().map((p) => p.id))).toEqual([
      'marty',
      'doc_jung',
      'doc',
    ]);

    const portrait = async (id: string): Promise<{ x: number; y: number }> =>
      (await page.evaluate((who) => window.__hv.portraits().find((p) => p.id === who), id))!;
    const marty = await page.evaluate(() => window.__hv.actor()!);

    await clickGame(page, await portrait('doc_jung'));
    await waitIdle(page);
    expect(await page.evaluate(() => window.__hv.state().activeCharacter)).toBe('doc_jung');
    expect((await page.evaluate(() => window.__hv.room())).era).toBe(1885);
    expect(await inventoryOf(page)).toEqual([]);

    await clickGame(page, await portrait('doc'));
    await waitIdle(page);
    expect((await page.evaluate(() => window.__hv.room())).id).toBe('testflur');

    await clickGame(page, await portrait('marty'));
    await waitIdle(page);
    expect((await page.evaluate(() => window.__hv.room())).era).toBe(1986);
    expect(await inventoryOf(page)).toContain('apfel');
    const back = await page.evaluate(() => window.__hv.actor()!);
    expect(Math.round(back.x)).toBe(Math.round(marty.x));
    expect(Math.round(back.y)).toBe(Math.round(marty.y));
    expect(errors).toEqual([]);
  });

  test('Speichern und Laden: mehrere Plätze, Neuladen, veraltete Spielstände', async ({ page }) => {
    const errors = watchErrors(page);
    await openGame(page, 'engine');

    await act(page, 'nimm', 'apfel');
    await page.keyboard.press('F5');
    await clickGame(page, await menuRow(page, '1:'));
    await page.keyboard.press('Escape');

    await act(page, 'oeffne', 'tuer');
    await page.keyboard.press('F5');
    await clickGame(page, await menuRow(page, '2:'));
    expect((await menuRow(page, '2:')) !== null).toBe(true);
    await page.keyboard.press('Escape');

    await page.reload();
    await page.waitForFunction(() => window.__hv !== undefined);
    expect(await inventoryOf(page)).toEqual(['foto']);

    await page.keyboard.press('F5');
    await clickGame(page, await menuRow(page, 'Laden'));
    await clickGame(page, await menuRow(page, '1:'));
    await expect.poll(() => inventoryOf(page)).toEqual(['foto', 'apfel']);
    expect(await page.evaluate(() => window.__hv.state().flags.test_tuer_offen)).toBeFalsy();

    await page.keyboard.press('F5');
    await clickGame(page, await menuRow(page, 'Laden'));
    await clickGame(page, await menuRow(page, '2:'));
    await expect.poll(() => page.evaluate(() => window.__hv.state().flags.test_tuer_offen)).toBe(true);

    // Nach dem Laden stimmen auch die Hotspots: Der Apfel liegt nicht wieder auf dem Tisch.
    expect((await page.evaluate(() => window.__hv.hotspots())).some((h) => h.id === 'apfel')).toBe(false);

    // Veralteter Spielstand wird abgewiesen, das Spiel läuft weiter.
    await page.evaluate(() => {
      const s = JSON.parse(localStorage.getItem('hv_save_0')!);
      s.state.version = 0;
      localStorage.setItem('hv_save_2', JSON.stringify(s));
    });
    await page.keyboard.press('F5');
    await clickGame(page, await menuRow(page, 'Laden'));
    await clickGame(page, await menuRow(page, '3:'));
    expect(await page.evaluate(() => window.__hv.menu() !== null)).toBe(true);
    expect(await page.evaluate(() => window.__hv.state().flags.test_tuer_offen)).toBe(true);
    await page.keyboard.press('Escape');
    expect(errors).toEqual([]);
  });

  test('Debug-Modus: Overlay, Raumsprung, Gegenstand geben, Flags', async ({ page }) => {
    const errors = watchErrors(page);
    await openGame(page, 'engine');
    await expect(page.locator('#hv-debug')).toHaveCount(0);

    await page.keyboard.press('F9');
    await expect(page.locator('#hv-debug')).toBeVisible();
    expect(await page.evaluate(() => window.__hv.debugOpen())).toBe(true);

    await page.selectOption('#hv-debug-room', 'testflur');
    await page.selectOption('#hv-debug-era', '1986');
    await page.click('#hv-debug-go');
    expect((await page.evaluate(() => window.__hv.room())).id).toBe('testflur');

    await page.selectOption('#hv-debug-item', 'muenze');
    await page.click('#hv-debug-give');
    expect(await inventoryOf(page)).toContain('muenze');

    await page.locator('#hv-debug-flags label', { hasText: 'test_schrank_offen' }).locator('input').check();
    expect(await page.evaluate(() => window.__hv.state().flags.test_schrank_offen)).toBe(true);

    await page.keyboard.press('F9');
    await expect(page.locator('#hv-debug')).toHaveCount(0);
    expect(errors).toEqual([]);
  });

  test('Figuren-Austausch: eigene PNGs funktionieren ohne Codeänderung', async ({ page }) => {
    const pageErrors: string[] = [];
    page.on('pageerror', (error) => pageErrors.push(error.message));

    // Eigenes Spritesheet mit 3 statt 2 Frames.
    const sheet = new PNG({ width: 32 * 3, height: 56 });
    sheet.data.fill(255);
    await page.route('**/characters/marty/marty_idle.png', (route) =>
      route.fulfill({ status: 200, contentType: 'image/png', body: PNG.sync.write(sheet) }),
    );
    // Fehlende Animation: Ersatzregel greift, kein Absturz.
    await page.route('**/characters/marty/marty_pickup.png', (route) => route.fulfill({ status: 404 }));

    await openGame(page, 'engine');
    expect(await page.evaluate(() => window.__hv.frames('marty', 'idle'))).toBe(3);
    expect(await page.evaluate(() => window.__hv.frames('marty', 'pickup'))).toBe(0);

    await act(page, 'nimm', 'apfel');
    expect(await inventoryOf(page)).toContain('apfel');
    expect(pageErrors).toEqual([]);
  });
});
