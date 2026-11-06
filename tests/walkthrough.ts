import { expect, type Page } from '@playwright/test';
import {
  act,
  allSpeech,
  clickGame,
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
  expect(end.activeCharacter).toBe('doc');
  expect(await page.evaluate(() => window.__hv.room().id)).toBe('abstellgleis');
}

/** Wechselt per Porträt-Button die Figur. */
export async function switchTo(page: Page, id: string): Promise<void> {
  const portrait = await page.evaluate((who) => window.__hv.portraits().find((p) => p.id === who), id);
  if (!portrait) throw new Error(`Kein Porträt für ${id}`);
  await clickGame(page, portrait);
  await waitIdle(page);
  expect(await page.evaluate(() => window.__hv.state().activeCharacter)).toBe(id);
}

export async function playKapitel3(page: Page): Promise<void> {
  // A – Lage klären (Doc)
  await act(page, 'schauan', 'zeitzug'); // 1
  expect(await lastSpeech(page)).toContain('Der Fluxkompensator fehlt');
  await talk(page, 'verne', ['Was ist in der', 'Passt gut']); // 2
  expect(await allSpeech(page)).toContain('blinkende Kiste');
  await go(page, 'strasse', 'stadtplan');
  await go(page, 'plan_saloon', 'saloon');
  await talk(page, 'barkeeper', ['Hat Buford', 'Wie kommt', 'Danke']); // 3
  expect(await allSpeech(page)).toContain('Gürtel');
  await talk(page, 'buford', ['Ich trinke']); // 4

  // B – Die Herausforderung (Doc)
  await go(page, 'tuer', 'stadtplan');
  await go(page, 'plan_schmiede', 'schmiede');
  await act(page, 'nimm', 'streichhoelzer'); // 5
  await act(page, 'nimm', 'bleistift');
  await go(page, 'tuer', 'stadtplan');
  await go(page, 'plan_festplatz', 'festplatz');
  await act(page, 'nimm', 'festprogramm'); // 6
  await talk(page, 'clara', ['Riecht', 'Ich muss']); // 7
  expect(await inventoryOf(page)).toContain('kuchen');
  await giveItem(page, 'festprogramm', 'clara'); // 8
  expect(await inventoryOf(page)).toContain('herausforderung');
  await giveItem(page, 'kuchen', 'feuerwerker'); // 9
  expect(await inventoryOf(page)).toContain('knallfrosch');
  await go(page, 'strasse', 'stadtplan');
  await go(page, 'plan_saloon', 'saloon');
  await giveItem(page, 'herausforderung', 'buford'); // 10
  expect(await flag(page, 'buford_im_stall')).toBe(true);
  expect(await page.evaluate(() => window.__hv.actorsInRoom())).not.toContain('buford');

  // C – Der Misthaufen (Doc)
  await go(page, 'tuer', 'stadtplan');
  await go(page, 'plan_stall', 'mietstall');
  await useItem(page, 'streichhoelzer', 'knallfrosch', 'item'); // 11
  expect(await inventoryOf(page)).toContain('knallfrosch_brennend');
  await useItem(page, 'knallfrosch_brennend', 'pferd'); // 12
  expect(await flag(page, 'buford_im_mist')).toBe(true);
  // Buford steht nach dem Sturz neben dem Haufen, nicht mehr in Reithöhe.
  expect((await page.evaluate(() => window.__hv.actor('buford')!)).y).toBe(112);
  await act(page, 'nimm', 'fluxkompensator'); // 13
  await act(page, 'nimm', 'knitterbrief');
  expect(await inventoryOf(page)).toEqual(expect.arrayContaining(['fluxkompensator', 'biffs_brief']));

  // D – Nachricht an die Zukunft (Doc)
  await go(page, 'strasse', 'stadtplan');
  await go(page, 'plan_gleis', 'abstellgleis');
  await useItem(page, 'fluxkompensator', 'zeitzug'); // 14
  expect(await lastSpeech(page)).toContain('30-Ampere-Sicherung');
  await useItem(page, 'bleistift', 'biffs_brief', 'item'); // 15
  await go(page, 'strasse', 'stadtplan');
  await go(page, 'plan_festplatz', 'festplatz');
  await act(page, 'schauan', 'grundstein'); // 16
  expect(await lastSpeech(page)).toContain('noch offen');
  await useItem(page, 'nachricht', 'grundstein');
  expect(await flag(page, 'grundstein_zu')).toBe(true);

  // E – Die Sicherung (Marty, Figurenwechsel)
  await switchTo(page, 'marty');
  expect(await page.evaluate(() => window.__hv.room().id)).toBe('uhrwerk');
  await go(page, 'treppe', 'turmeingang');
  await go(page, 'tuer', 'rathausplatz');
  expect((await page.evaluate(() => window.__hv.room())).background).toBe('backgrounds/rathausplatz_1986.png');
  await go(page, 'strasse', 'stadtplan');
  await go(page, 'plan_labor', 'docs_labor');
  await act(page, 'nimm', 'brecheisen'); // 17
  await go(page, 'tuer', 'stadtplan');
  await go(page, 'plan_turm', 'rathausplatz');
  await useItem(page, 'brecheisen', 'grundstein'); // 18
  await act(page, 'nimm', 'gelber_brief');
  await clickVerb(page, 'schauan');
  await clickItem(page, 'vergilbter_brief');
  await waitIdle(page);
  expect(await allSpeech(page)).toContain('30-Ampere-Sicherung');
  expect(await lastSpeech(page)).toContain('Enkels Brix aus dem Jahr 2015');
  await go(page, 'strasse', 'stadtplan');
  await go(page, 'plan_labor', 'docs_labor');
  await act(page, 'oeffne', 'sicherungskasten'); // 19
  await act(page, 'nimm', 'sicherung');
  expect(await inventoryOf(page)).toContain('sicherung');
  await go(page, 'tuer', 'stadtplan');
  await go(page, 'plan_turm', 'rathausplatz');
  await go(page, 'turmtuer', 'turmeingang');
  await go(page, 'treppe', 'uhrwerk');
  await act(page, 'druecke', 'waehlrad'); // 20
  expect((await page.evaluate(() => window.__hv.state().chronopost)).year).toBe(1885);
  await useItem(page, 'sicherung', 'chronopost');
  await act(page, 'ziehe', 'sendehebel');
  expect(await flag(page, 'sicherung_gesendet')).toBe(true);

  // F – Abfahrt (Doc)
  await switchTo(page, 'doc');
  await go(page, 'geruest', 'uhrwerk');
  expect((await page.evaluate(() => window.__hv.room())).era).toBe(1885);
  await act(page, 'nimm', 'sicherung_fach'); // 21
  await go(page, 'leiter', 'festplatz');
  await go(page, 'strasse', 'stadtplan');
  await go(page, 'plan_gleis', 'abstellgleis');
  await useItem(page, 'sicherung', 'zeitzug'); // 22
  expect(await page.evaluate(() => window.__hv.state().photoStage)).toBe(3);
  await go(page, 'strasse', 'stadtplan');
  await go(page, 'plan_festplatz', 'festplatz');
  await act(page, 'redemit', 'clara'); // 23
  const s = await page.evaluate(() => window.__hv.state());
  expect(s.chapter).toBe(4);
  expect(s.activeCharacter).toBe('marty');
  expect(s.unlockedCharacters).toEqual(['marty']);
  expect(await allSpeech(page)).toContain('Das zahl ich dir heim');
}

export async function playKapitel4(page: Page): Promise<void> {
  expect(await page.evaluate(() => window.__hv.room().id)).toBe('uhrwerk');
  await go(page, 'treppe', 'turmeingang');
  await go(page, 'tuer', 'rathausplatz');
  await go(page, 'strasse', 'stadtplan');
  await go(page, 'plan_haus', 'vorgarten');
  await act(page, 'schauan', 'biff'); // 1
  expect(await lastSpeech(page)).toContain('Schlüsselbund');
  await talk(page, 'biff', []);
  expect(await allSpeech(page)).toContain('Komm und hol ihn dir');
  await act(page, 'nimm', 'wachsdose'); // 2
  await go(page, 'strasse', 'stadtplan');
  await go(page, 'plan_labor', 'docs_labor');
  await giveItem(page, 'wachstuch', 'einstein'); // 3
  expect(await flag(page, 'einstein_folgt')).toBe(true);
  await go(page, 'tuer', 'stadtplan');
  await go(page, 'plan_haus', 'vorgarten');
  expect(await page.evaluate(() => window.__hv.actorsInRoom())).toContain('einstein');
  await go(page, 'veranda', 'veranda');
  await talk(page, 'jennifer', ['Kannst du']); // 4
  expect(await flag(page, 'jennifer_lenkt_ab')).toBe(true);
  await go(page, 'treppe', 'vorgarten');
  expect(await page.evaluate(() => window.__hv.actorsInRoom())).toContain('jennifer');
  await act(page, 'redemit', 'einstein'); // 5
  expect(await flag(page, 'einstein_apportiert')).toBe(true);
  await act(page, 'nimm', 'sendeschluessel'); // 6
  expect(await inventoryOf(page)).toContain('sendeschluessel');
  await go(page, 'strasse', 'stadtplan');
  await go(page, 'plan_turm', 'rathausplatz');
  await go(page, 'turmtuer', 'turmeingang');
  await go(page, 'treppe', 'uhrwerk');
  await useItem(page, 'sendeschluessel', 'chronopost'); // 7
  expect((await page.evaluate(() => window.__hv.state().chronopost)).mode).toBe('schluessel');
  await act(page, 'nimm', 'brief_2015'); // 8
  expect(await lastSpeech(page)).toContain('16:29');
  await act(page, 'ziehe', 'fusion_im_kasten'); // 9 und 10: Doc kommt zurück
  expect(await page.evaluate(() => window.__hv.room().id)).toBe('rathausplatz');
  expect(await flag(page, 'zug_da')).toBe(true);
  expect(await page.evaluate(() => window.__hv.actorsInRoom())).toContain('doc');
  await act(page, 'redemit', 'doc'); // 11
  expect(await lastSpeech(page)).toContain('Energie');
  await useItem(page, 'wachsdose', 'mr_fusion', 'item'); // 12
  await giveItem(page, 'mr_fusion', 'doc');
  await giveItem(page, 'brief_2015', 'doc'); // 13
  expect(await page.evaluate(() => window.__hv.state().chapter)).toBe(5);
  expect(await allSpeech(page)).toContain('21. Oktober 2015');
}
