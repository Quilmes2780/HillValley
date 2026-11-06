import { expect, test } from '@playwright/test';
import {
  act,
  allSpeech,
  chooseAnswer,
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
import { playKapitel1, playKapitel2, playKapitel3, playKapitel4, playKapitel5, playProlog, switchTo } from './walkthrough';

test('Komplett-Durchlauf nach LOESUNGSBUCH.md: vom Prolog bis zum Abspann', async ({ page }) => {
  const errors = watchErrors(page);
  await openGame(page);
  await playProlog(page);
  await playKapitel1(page);
  await playKapitel2(page);
  await playKapitel3(page);
  await playKapitel4(page);
  await playKapitel5(page);
  expect(errors).toEqual([]);
});

test('Kapitel 5: Sperren halten, falsche Antworten führen zurück in die Lobby', async ({ page }) => {
  const errors = watchErrors(page);
  await openGame(page);
  await playProlog(page);
  await playKapitel1(page);
  await playKapitel2(page);
  await playKapitel3(page);
  await playKapitel4(page);

  // Lobby: Der Aufzug öffnet nur mit dem Daumen von Brix.
  await go(page, 'turmtuer', 'lobby');
  await act(page, 'oeffne', 'aufzug');
  await act(page, 'benutze', 'scanner');
  expect(await lastSpeech(page)).toContain('Meinen Daumen mag er nicht');
  expect((await page.evaluate(() => window.__hv.hotspots())).some((h) => h.id === 'knopf_88')).toBe(false);
  await go(page, 'tuer', 'turmplatz');

  // Museum: Ohne Karte kommt man nicht an den Wagen.
  await go(page, 'museum', 'museum');
  await act(page, 'oeffne', 'kofferraum');
  expect(await lastSpeech(page)).toContain('Eintritt nur mit Karte');
  await act(page, 'schauan', 'delorean');
  expect(await lastSpeech(page)).toContain('Eintritt nur mit Karte');
  await go(page, 'tuer', 'turmplatz');

  // Café: Das Glas ist erst frei, wenn Brix weg und der Kellner verwirrt ist.
  await act(page, 'redemit', 'doc');
  await go(page, 'cafe', 'cafe80er');
  await act(page, 'nimm', 'glas');
  expect(await lastSpeech(page)).toContain('Brix gerade in der Hand');
  await talk(page, 'jennifer', ['Kannst du']); // Reihenfolge frei: erst Jennifer, dann Brix
  await talk(page, 'brix', []);
  await act(page, 'nimm', 'glas');
  expect(await inventoryOf(page)).toContain('glas');
  await useItem(page, 'muenze_2015', 'automat');
  await go(page, 'tuer', 'turmplatz');

  // Mit dem Glas allein geht der Scanner nicht.
  await go(page, 'turmtuer', 'lobby');
  await useItem(page, 'glas', 'scanner');
  expect(await lastSpeech(page)).toContain('Ich muss ihn irgendwie davon abnehmen');
  await go(page, 'tuer', 'turmplatz');

  // Museum, diesmal zuerst Jennifer, dann der Kofferraum.
  await go(page, 'museum', 'museum');
  await giveItem(page, 'freikarte', 'museumsroboter');
  await act(page, 'oeffne', 'kofferraum');
  expect(await lastSpeech(page)).toContain('Alarm');
  await talk(page, 'jennifer', ['Kannst du']);
  await act(page, 'oeffne', 'kofferraum');
  await act(page, 'nimm', 'klebeband');
  await useItem(page, 'glas', 'klebeband', 'item');
  await go(page, 'tuer', 'turmplatz');
  await go(page, 'turmtuer', 'lobby');
  await useItem(page, 'folie', 'scanner');
  await act(page, 'druecke', 'knopf_88');

  // Showdown: Jede falsche Antwort endet in der Lobby, Runde 1 beginnt neu.
  const wrong = async (answers: string[]): Promise<void> => {
    await talk(page, 'brix', answers);
    expect(await page.evaluate(() => window.__hv.room().id)).toBe('lobby');
    expect(await flag(page, 'brix_gestuerzt')).toBeFalsy();
    await act(page, 'druecke', 'knopf_88');
    expect(await page.evaluate(() => window.__hv.room().id)).toBe('buero');
  };
  await wrong(['Niemand nennt']);
  await wrong(['Nenn mich', 'Das nimmst']);
  await wrong(['Nenn mich', 'Dein Opa', 'Mach doch']);
  await talk(page, 'brix', ['Nenn mich', 'Dein Opa', 'Ich geh']);
  expect(await flag(page, 'brix_gestuerzt')).toBe(true);
  expect(await page.evaluate(() => window.__hv.actorsInRoom())).not.toContain('brix');

  // Der Aktenvernichter tut nichts ohne den Brief.
  await act(page, 'benutze', 'aktenvernichter');
  expect(await page.evaluate(() => window.__hv.state().chapter)).toBe(5);
  await act(page, 'nimm', 'brief');
  await useItem(page, 'brief_brix', 'aktenvernichter');
  expect(await page.evaluate(() => window.__hv.state().chapter)).toBe(6);
  expect(errors).toEqual([]);
});

test('Kapitel 3: Sperren halten, Gags haben keine Folgen, nichts geht verloren', async ({ page }) => {
  const errors = watchErrors(page);
  await openGame(page);
  await playProlog(page);
  await playKapitel1(page);
  await playKapitel2(page);

  // Whisky: Doc wacht in der Schmiede auf, ohne Folgen.
  await go(page, 'strasse', 'stadtplan');
  await go(page, 'plan_saloon', 'saloon');
  await talk(page, 'buford', ['Einen Whisky']);
  expect(await page.evaluate(() => window.__hv.room().id)).toBe('schmiede');
  expect(await flag(page, 'doc_trinkt')).toBeFalsy();

  // Handschrift: Doc kann es nicht selbst schreiben.
  await act(page, 'nimm', 'bleistift');
  await act(page, 'nimm', 'streichhoelzer');
  await go(page, 'tuer', 'stadtplan');
  await go(page, 'plan_festplatz', 'festplatz');
  await act(page, 'nimm', 'festprogramm');
  await useItem(page, 'bleistift', 'festprogramm', 'item');
  expect(await lastSpeech(page)).toContain('Handschrift');
  expect(await inventoryOf(page)).toContain('festprogramm');

  // Knallfrosch zünden geht nur im Mietstall bei Buford.
  await talk(page, 'clara', ['Riecht', 'Ich muss']);
  await giveItem(page, 'kuchen', 'feuerwerker');
  await useItem(page, 'streichhoelzer', 'knallfrosch', 'item');
  expect(await inventoryOf(page)).toContain('knallfrosch');
  expect(await lastSpeech(page)).toContain('Nicht hier');

  // Marty: Grundstein massiv, solange Doc 1885 nichts eingemauert hat.
  await switchTo(page, 'marty');
  await go(page, 'treppe', 'turmeingang');
  await go(page, 'tuer', 'rathausplatz');
  await go(page, 'strasse', 'stadtplan');
  await go(page, 'plan_labor', 'docs_labor');
  await act(page, 'nimm', 'brecheisen');
  await go(page, 'tuer', 'stadtplan');
  await go(page, 'plan_turm', 'rathausplatz');
  await useItem(page, 'brecheisen', 'grundstein');
  expect(await lastSpeech(page)).toContain('massiver Stein');
  expect(await flag(page, 'grundstein_aufgebrochen')).toBeFalsy();
  await act(page, 'schauan', 'grundstein');
  expect(await lastSpeech(page)).toBe('Massiver Stein von 1885. Was sollte da drin sein?');

  // Ohne den gelesenen Brief hat Marty keinen Grund für die Sicherung.
  await go(page, 'strasse', 'stadtplan');
  await go(page, 'plan_labor', 'docs_labor');
  await act(page, 'oeffne', 'sicherungskasten');
  await act(page, 'nimm', 'sicherung');
  expect(await inventoryOf(page)).not.toContain('sicherung');

  // Sendung ins falsche Jahr: Das Wählrad steht noch auf 1955, die Sicherung bleibt bei Marty.
  await page.keyboard.press('F9');
  await page.selectOption('#hv-debug-item', 'sicherung');
  await page.click('#hv-debug-give');
  await page.keyboard.press('F9');
  await go(page, 'tuer', 'stadtplan');
  await go(page, 'plan_turm', 'rathausplatz');
  await go(page, 'turmtuer', 'turmeingang');
  await go(page, 'treppe', 'uhrwerk');
  await useItem(page, 'sicherung', 'chronopost');
  expect(await lastSpeech(page)).toContain('das Wählrad steht aber anders');
  expect(await inventoryOf(page)).toContain('sicherung');
  expect(errors).toEqual([]);
});

test('Kapitel 4: Einstein und Doc in falscher Reihenfolge', async ({ page }) => {
  const errors = watchErrors(page);
  await openGame(page);
  await playProlog(page);
  await playKapitel1(page);
  await playKapitel2(page);
  await playKapitel3(page);

  // Kapitel 4: Einstein holt den Schlüssel erst, wenn Biff abgelenkt ist.
  await go(page, 'treppe', 'turmeingang');
  await go(page, 'tuer', 'rathausplatz');
  await go(page, 'strasse', 'stadtplan');
  await go(page, 'plan_labor', 'docs_labor');
  await giveItem(page, 'wachstuch', 'einstein');
  await go(page, 'tuer', 'stadtplan');
  await go(page, 'plan_haus', 'vorgarten');
  await act(page, 'nimm', 'schluesselbund');
  expect(await lastSpeech(page)).toContain('Allein komme ich da nicht heran');
  await act(page, 'redemit', 'einstein');
  expect(await flag(page, 'einstein_apportiert')).toBeFalsy();
  await act(page, 'nimm', 'wachsdose');
  await go(page, 'veranda', 'veranda');
  await talk(page, 'jennifer', ['Kannst du']);
  await go(page, 'treppe', 'vorgarten');
  await act(page, 'redemit', 'einstein');
  await act(page, 'nimm', 'sendeschluessel');
  // Einstein bleibt in 1986: Er ist wieder im Labor.
  await go(page, 'strasse', 'stadtplan');
  await go(page, 'plan_labor', 'docs_labor');
  expect(await page.evaluate(() => window.__hv.actorsInRoom())).toContain('einstein');
  await go(page, 'tuer', 'stadtplan');
  await go(page, 'plan_turm', 'rathausplatz');
  await go(page, 'turmtuer', 'turmeingang');
  await go(page, 'treppe', 'uhrwerk');

  // Mr. Fusion bleibt, solange der Schlüssel nicht steckt.
  await act(page, 'ziehe', 'fusion_im_kasten');
  expect(await inventoryOf(page)).not.toContain('mr_fusion');
  await useItem(page, 'sendeschluessel', 'chronopost');
  // Schritt 8 und 9 in umgekehrter Reihenfolge.
  await act(page, 'ziehe', 'fusion_im_kasten');
  expect(await flag(page, 'zug_da')).toBeFalsy();
  await act(page, 'nimm', 'brief_2015');
  expect(await flag(page, 'zug_da')).toBe(true);

  // Doc: Ohne Energie kein Start, leerer Mr. Fusion reicht nicht.
  await giveItem(page, 'brief_2015', 'doc');
  expect(await inventoryOf(page)).toContain('brief_2015');
  await giveItem(page, 'mr_fusion', 'doc');
  expect(await inventoryOf(page)).toContain('mr_fusion');
  await useItem(page, 'wachsdose', 'mr_fusion', 'item');
  await giveItem(page, 'mr_fusion', 'doc');
  await giveItem(page, 'brief_2015', 'doc');
  expect(await page.evaluate(() => window.__hv.state().chapter)).toBe(5);
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
