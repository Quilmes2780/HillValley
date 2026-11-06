import { expect, type Page } from '@playwright/test';
import {
  act,
  allSpeech,
  clickHotspot,
  clickItem,
  clickVerb,
  flag,
  giveItem,
  go,
  inventoryOf,
  lastSpeech,
  talk,
  useItem,
  waitIdle,
} from './helpers';

/**
 * Spielt das Spiel genau nach LOESUNGSBUCH.md. Die Nummern entsprechen den Schritten dort.
 * Jedes Kapitel setzt voraus, dass das vorige gespielt wurde.
 */
export async function playProlog(page: Page): Promise<void> {
  await act(page, 'nimm', 'kugelschreiber'); // 1
  await go(page, 'tuer', 'kueche');
  await act(page, 'nimm', 'banane'); // 2
  await talk(page, 'lorraine', ['Hast du Doc', 'Bis später']);
  await go(page, 'haustuer', 'vorgarten');
  await talk(page, 'biff', ['Warum bist du', 'Dann will ich']); // 3
  await go(page, 'strasse', 'stadtplan');
  await go(page, 'plan_labor', 'docs_labor');
  await act(page, 'schauan', 'einstein'); // 4
  await act(page, 'oeffne', 'schrank'); // 5
  await act(page, 'nimm', 'hundefutter');
  await useItem(page, 'hundefutter', 'napf');
  await act(page, 'schauan', 'koerbchen'); // 6
  await act(page, 'nimm', 'wachstuch');
  await act(page, 'nimm', 'docs_brief'); // 7
  await act(page, 'nimm', 'notizbuch'); // 8
  await act(page, 'nimm', 'mr_fusion'); // 9
  await clickHotspot(page, 'tuer'); // 10
  await waitIdle(page);
  const s = await page.evaluate(() => window.__hv.state());
  expect(s.chapter).toBe(1);
  expect(s.photoStage).toBe(1);
  expect(s.timeline.tannenburg).toBe(true);
}

export async function playKapitel1(page: Page): Promise<void> {
  // A – Einlass in die Schule
  await go(page, 'plan_turm', 'rathausplatz');
  await talk(page, 'kowalski', ['Schönen Tag']); // 1
  expect(await allSpeech(page)).toContain('direkten Befehl von Mr. Tannen');
  await act(page, 'schauan', 'saeule'); // 2
  expect(await allSpeech(page)).toContain('Flügelschraube');
  await go(page, 'strasse', 'stadtplan');
  await go(page, 'plan_schule', 'schule_flur');
  await act(page, 'redemit', 'strickland'); // 3
  expect(await lastSpeech(page)).toContain('Entschuldigungsschreiben');
  await go(page, 'ausgang', 'stadtplan');
  await go(page, 'plan_haus', 'vorgarten');
  await act(page, 'nimm', 'zeitung'); // 4
  await go(page, 'haustuer', 'kueche');
  await giveItem(page, 'zeitung', 'lorraine'); // 5
  expect(await inventoryOf(page)).toContain('entschuldigung');
  await go(page, 'haustuer', 'vorgarten');
  await go(page, 'strasse', 'stadtplan');
  await go(page, 'plan_schule', 'schule_flur');
  await giveItem(page, 'entschuldigung', 'strickland'); // 6
  expect(await flag(page, 'schule_zutritt')).toBe(true);

  // B – Die Kassette
  await go(page, 'zeitung_tuer', 'schuelerzeitung');
  await talk(page, 'jennifer', ['Was machst', 'Ich muss']); // 7
  expect(await inventoryOf(page)).toContain('kassette');
  await go(page, 'tuer', 'schule_flur');
  await go(page, 'bandraum', 'bandraum');
  await act(page, 'nimm', 'kabel'); // 8
  await go(page, 'tuer', 'schule_flur');
  await go(page, 'ausgang', 'stadtplan');
  await go(page, 'plan_haus', 'vorgarten');
  await go(page, 'haustuer', 'kueche');
  await go(page, 'arbeitszimmer', 'arbeitszimmer');
  await act(page, 'nimm', 'diktiergeraet'); // 9
  await go(page, 'tuer', 'kueche');
  await go(page, 'haustuer', 'vorgarten');
  await go(page, 'strasse', 'stadtplan');
  await go(page, 'plan_turm', 'rathausplatz');

  // C – Den Wachmann weglocken
  await act(page, 'oeffne', 'anschlusskasten'); // 10
  await useItem(page, 'kabel', 'anschlusskasten'); // 11
  await useItem(page, 'kassette', 'diktiergeraet', 'item'); // 12
  await useItem(page, 'diktiergeraet', 'verl_kabel');
  await act(page, 'druecke', 'diktiergeraet'); // 13
  expect(await flag(page, 'kowalski_weg')).toBe(true);
  expect(await page.evaluate(() => window.__hv.actorsInRoom())).not.toContain('kowalski');

  // D – Die Chronopost im Notbetrieb
  await go(page, 'turmtuer', 'turmeingang');
  await go(page, 'treppe', 'uhrwerk');
  await act(page, 'schauan', 'chronopost'); // 14
  await useItem(page, 'mr_fusion', 'chronopost'); // 15
  expect(await lastSpeech(page)).toContain('Ohne Futter kein Strom');
  await clickVerb(page, 'benutze'); // 16
  await clickItem(page, 'banane');
  await waitIdle(page);
  expect(await inventoryOf(page)).toContain('bananenschale');
  await useItem(page, 'bananenschale', 'fusion_im_kasten'); // 17
  const post = await page.evaluate(() => window.__hv.state().chronopost);
  expect(post.mode).toBe('notbetrieb');
  expect(post.year).toBe(1955);
  await useItem(page, 'kugelschreiber', 'notizbuch', 'item'); // 18
  expect(await inventoryOf(page)).toContain('brief_an_doc');
  await useItem(page, 'brief_an_doc', 'chronopost'); // 19
  await act(page, 'ziehe', 'sendehebel'); // 20

  const s = await page.evaluate(() => window.__hv.state());
  expect(s.chapter).toBe(2);
  expect(s.activeCharacter).toBe('doc_jung');
  const room = await page.evaluate(() => window.__hv.room());
  expect(room.id).toBe('uhrwerk');
  expect(room.era).toBe(1955);
}

export async function playKapitel2(page: Page): Promise<void> {
  // A – Material für den Verstärker
  await clickVerb(page, 'schauan'); // 1
  await clickItem(page, 'brief_von_marty');
  await waitIdle(page);
  expect(await lastSpeech(page)).toContain('Verstärker');
  await go(page, 'treppe', 'rathausplatz');
  await go(page, 'strasse', 'stadtplan');
  await go(page, 'plan_villa', 'docs_labor');
  await act(page, 'nimm', 'schraubenzieher'); // 2
  await act(page, 'nimm', 'zigarrenkiste');
  await useItem(page, 'schraubenzieher', 'helm'); // 3
  expect(await inventoryOf(page)).toContain('kupferspule');
  await go(page, 'tuer', 'stadtplan');
  await go(page, 'plan_platz', 'rathausplatz');
  await go(page, 'cafe', 'cafe');
  // Nichts aus früheren Räumen darf mitwandern (der Helm hat zwei Fassungen mit derselben ID).
  expect((await page.evaluate(() => window.__hv.worldImages())).join()).not.toContain('helm');
  await talk(page, 'lou', ['Was ist mit', 'Danke']); // 4
  await talk(page, 'goldie', ['Das glaube', 'Dann viel']);
  await useItem(page, 'schraubenzieher', 'mixer'); // 5
  expect(await inventoryOf(page)).toContain('dollar');
  await go(page, 'tuer', 'rathausplatz');
  await go(page, 'radioladen', 'radioladen');
  await giveItem(page, 'dollar', 'haendler'); // 6
  expect(await inventoryOf(page)).toContain('roehre');
  await go(page, 'tuer', 'rathausplatz');
  await go(page, 'strasse', 'stadtplan');
  await go(page, 'plan_villa', 'docs_labor');
  await useItem(page, 'kupferspule', 'zigarrenkiste', 'item'); // 7
  await useItem(page, 'roehre', 'zigarrenkiste', 'item');
  expect(await inventoryOf(page)).toContain('verstaerker');

  // B – Die Erfindungsmappe
  await go(page, 'tuer', 'stadtplan');
  await go(page, 'plan_schule', 'schule_flur');
  await act(page, 'schauan', 'biffs_spind'); // 8
  await talk(page, 'george', ['Lass ihn einfach']); // 9
  expect(await inventoryOf(page)).toEqual(expect.arrayContaining(['zettel', 'hausaufgabe']));
  await giveItem(page, 'hausaufgabe', 'strickland'); // 10
  expect(await flag(page, 'strickland_weg')).toBe(true);
  await act(page, 'oeffne', 'biffs_spind'); // 11
  await act(page, 'nimm', 'mappe');
  await clickHotspot(page, 'ausgang'); // 12
  await waitIdle(page);
  expect(await page.evaluate(() => window.__hv.room().id)).toBe('strasse_mist');
  expect(await flag(page, 'biff_im_mist')).toBe(true);
  await go(page, 'strasse', 'stadtplan');
  await go(page, 'plan_villa', 'docs_labor');
  await useItem(page, 'mappe', 'kamin'); // 13
  const after = await page.evaluate(() => window.__hv.state());
  expect(after.photoStage).toBe(2);
  expect(after.timeline.tannenburg).toBe(false);
  expect(await lastSpeech(page)).toContain('Manche Ideen sind zu gefährlich');

  // C – Verstärker einbauen
  await go(page, 'tuer', 'stadtplan');
  await go(page, 'plan_platz', 'rathausplatz');
  await go(page, 'turmtuer', 'uhrwerk');
  await useItem(page, 'verstaerker', 'chronopost'); // 14
  const end = await page.evaluate(() => window.__hv.state());
  expect(end.chapter).toBe(3);
  expect(end.chronopost.mode).toBe('verstaerkt');
  expect(end.unlockedCharacters).toEqual(expect.arrayContaining(['marty', 'doc_jung']));
  expect(await allSpeech(page)).toContain('Sitze 1885 fest');
}
