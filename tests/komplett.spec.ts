import { expect, test } from '@playwright/test';
import {
  act,
  allSpeech,
  chooseAnswer,
  clickGame,
  clickHotspot,
  clickVerb,
  flag,
  giveItem,
  go,
  inventoryOf,
  lastSpeech,
  openGame,
  talk,
  useItem,
  waitIdle,
  watchErrors,
} from './helpers';
import { playKapitel1, playKapitel2, playProlog } from './walkthrough';

test('Komplett-Durchlauf nach LOESUNGSBUCH.md: Prolog bis Beginn Kapitel 3', async ({ page }) => {
  const errors = watchErrors(page);
  await openGame(page);
  await playProlog(page);
  await playKapitel1(page);
  await playKapitel2(page);

  // Figurenwechsel: Marty wartet in seinem Uhrwerk, die Stadt ist wieder Hill Valley.
  const marty = await page.evaluate(() => window.__hv.portraits().find((p) => p.id === 'marty')!);
  await clickGame(page, marty);
  await waitIdle(page);
  const room = await page.evaluate(() => window.__hv.room());
  expect(room.id).toBe('uhrwerk');
  expect(room.era).toBe(1986);
  await go(page, 'treppe', 'turmeingang');
  await go(page, 'tuer', 'rathausplatz');
  expect((await page.evaluate(() => window.__hv.room())).background).toBe('backgrounds/rathausplatz_1986.png');
  expect(errors).toEqual([]);
});

test('Kapitel 1: Sperren halten, freie Reihenfolgen funktionieren', async ({ page }) => {
  const errors = watchErrors(page);
  await openGame(page);
  await playProlog(page);

  // Der Turm ist zu, solange Kowalski davor steht.
  await go(page, 'plan_turm', 'rathausplatz');
  await clickHotspot(page, 'turmtuer');
  await waitIdle(page);
  expect(await page.evaluate(() => window.__hv.room().id)).toBe('rathausplatz');
  expect(await lastSpeech(page)).toContain('direkten Befehl');

  // Grundstein ist massiv (Hinweis im Lösungsbuch).
  await act(page, 'schauan', 'grundstein');
  expect(await lastSpeech(page)).toBe('Massiver Stein von 1885. Was sollte da drin sein?');

  // Schule: Ohne Schreiben kommt man nicht in die Räume.
  await go(page, 'strasse', 'stadtplan');
  await go(page, 'plan_schule', 'schule_flur');
  await clickHotspot(page, 'bandraum');
  await waitIdle(page);
  expect(await page.evaluate(() => window.__hv.room().id)).toBe('schule_flur');

  // Lorraine gibt den Hinweis auf die Zeitung, nachdem Strickland nein gesagt hat.
  await go(page, 'ausgang', 'stadtplan');
  await go(page, 'plan_haus', 'vorgarten');
  await go(page, 'haustuer', 'kueche');
  await talk(page, 'lorraine', ['Schreibst du', 'Bis später']);
  expect(await allSpeech(page)).toContain('Morgenzeitung');
  await go(page, 'haustuer', 'vorgarten');
  await act(page, 'nimm', 'zeitung');
  await go(page, 'haustuer', 'kueche');
  await giveItem(page, 'zeitung', 'lorraine');
  await go(page, 'arbeitszimmer', 'arbeitszimmer');
  await act(page, 'nimm', 'diktiergeraet');
  await go(page, 'tuer', 'kueche');
  await go(page, 'haustuer', 'vorgarten');
  await go(page, 'strasse', 'stadtplan');
  await go(page, 'plan_schule', 'schule_flur');
  await giveItem(page, 'entschuldigung', 'strickland');
  await go(page, 'bandraum', 'bandraum');
  await act(page, 'nimm', 'kabel');
  await go(page, 'tuer', 'schule_flur');
  await go(page, 'zeitung_tuer', 'schuelerzeitung');
  await talk(page, 'jennifer', ['Was machst', 'Ich muss']);
  await go(page, 'tuer', 'schule_flur');
  await go(page, 'ausgang', 'stadtplan');
  await go(page, 'plan_turm', 'rathausplatz');

  // Kabel an den geschlossenen Kasten geht nicht, Gerät ohne Kabel auch nicht.
  await useItem(page, 'kabel', 'anschlusskasten');
  expect(await lastSpeech(page)).toContain('noch zu');
  await useItem(page, 'diktiergeraet', 'anschlusskasten');
  expect(await lastSpeech(page)).toContain('Erst muss das Kabel');

  // Andere Reihenfolge: erst das Gerät anschließen, dann die Kassette einlegen.
  await act(page, 'oeffne', 'anschlusskasten');
  await useItem(page, 'kabel', 'anschlusskasten');
  await useItem(page, 'diktiergeraet', 'verl_kabel');
  await act(page, 'druecke', 'diktiergeraet');
  expect(await lastSpeech(page)).toContain('Ohne Kassette');
  expect(await flag(page, 'kowalski_weg')).toBeFalsy();
  await useItem(page, 'kassette', 'diktiergeraet');
  await act(page, 'druecke', 'diktiergeraet');
  expect(await flag(page, 'kowalski_weg')).toBe(true);

  // Chronopost: Hebel und Schlitz ohne Strom antworten, nichts geht verloren.
  await go(page, 'turmtuer', 'turmeingang');
  await go(page, 'treppe', 'uhrwerk');
  await act(page, 'ziehe', 'sendehebel');
  expect(await lastSpeech(page)).toBe('Nichts. Kein Strom.');
  await useItem(page, 'kugelschreiber', 'notizbuch', 'item');
  await useItem(page, 'brief_an_doc', 'chronopost');
  expect(await inventoryOf(page)).toContain('brief_an_doc');
  expect(errors).toEqual([]);
});

test('Kapitel 2: Sperren halten, freie Reihenfolgen funktionieren', async ({ page }) => {
  const errors = watchErrors(page);
  await openGame(page);
  await playProlog(page);
  await playKapitel1(page);

  // B vor A: zuerst die Schule.
  await go(page, 'treppe', 'rathausplatz');
  await go(page, 'strasse', 'stadtplan');
  await go(page, 'plan_schule', 'schule_flur');

  // Spind geht nicht, solange Strickland davor steht.
  await act(page, 'oeffne', 'biffs_spind');
  expect(await lastSpeech(page)).toContain('Strickland');

  // George: Falsche Antwort rudert zurück, die Frage kommt neu.
  await clickVerb(page, 'redemit');
  await clickHotspot(page, 'george');
  await chooseAnswer(page, 'Warten, bis');
  await chooseAnswer(page, 'Schick ihm');
  expect(await allSpeech(page)).toContain('Rein hypothetisch');
  await chooseAnswer(page, 'Darüber muss');
  await waitIdle(page);
  expect(await inventoryOf(page)).not.toContain('zettel');
  await talk(page, 'george', ['Lass ihn einfach']);
  await giveItem(page, 'hausaufgabe', 'strickland');
  await act(page, 'oeffne', 'biffs_spind');
  await act(page, 'nimm', 'mappe');
  await clickHotspot(page, 'ausgang');
  await waitIdle(page);
  await go(page, 'strasse', 'stadtplan');

  // Spule und Röhre lassen sich nur im Labor einbauen.
  await go(page, 'plan_villa', 'docs_labor');
  await act(page, 'nimm', 'schraubenzieher');
  await act(page, 'nimm', 'zigarrenkiste');
  await useItem(page, 'schraubenzieher', 'helm');
  await go(page, 'tuer', 'stadtplan');
  await go(page, 'plan_platz', 'rathausplatz');
  await useItem(page, 'kupferspule', 'zigarrenkiste', 'item');
  expect(await lastSpeech(page)).toContain('Werkbank');
  await go(page, 'cafe', 'cafe');
  await useItem(page, 'schraubenzieher', 'mixer');
  await go(page, 'tuer', 'rathausplatz');
  await go(page, 'radioladen', 'radioladen');
  await act(page, 'nimm', 'roehren');
  expect(await lastSpeech(page)).toContain('kaufen');
  await giveItem(page, 'dollar', 'haendler');
  await go(page, 'tuer', 'rathausplatz');
  await go(page, 'strasse', 'stadtplan');
  await go(page, 'plan_villa', 'docs_labor');

  // Reihenfolge frei: Röhre zuerst, dann Spule.
  await useItem(page, 'roehre', 'zigarrenkiste', 'item');
  await useItem(page, 'zigarrenkiste', 'kupferspule', 'item');
  expect(await inventoryOf(page)).toContain('verstaerker');

  // Verstärker einbauen erst, wenn die Mappe verbrannt ist.
  await go(page, 'tuer', 'stadtplan');
  await go(page, 'plan_platz', 'rathausplatz');
  await go(page, 'turmtuer', 'uhrwerk');
  await useItem(page, 'verstaerker', 'chronopost');
  expect(await lastSpeech(page)).toContain('Erst muss die Erfindungsmappe');
  expect(await page.evaluate(() => window.__hv.state().chapter)).toBe(2);
  expect(await inventoryOf(page)).toContain('verstaerker');

  await go(page, 'treppe', 'rathausplatz');
  await go(page, 'strasse', 'stadtplan');
  await go(page, 'plan_villa', 'docs_labor');
  await useItem(page, 'mappe', 'kamin');
  await go(page, 'tuer', 'stadtplan');
  await go(page, 'plan_platz', 'rathausplatz');
  await go(page, 'turmtuer', 'uhrwerk');
  await useItem(page, 'verstaerker', 'chronopost');
  expect(await page.evaluate(() => window.__hv.state().chapter)).toBe(3);
  expect(errors).toEqual([]);
});
