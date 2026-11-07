import { readFileSync } from 'node:fs';
import { expect, test } from '@playwright/test';
import type { Hotspot, RoomVariant } from '../src/engine/types';
import { ITEMS } from '../src/game/items/items';
import { ROOMS } from '../src/game/rooms/index';
import { act, chooseAnswer, clickHotspot, clickItem, clickVerb, go, lastSpeech, openGame, useItem, waitIdle, watchErrors } from './helpers';

type Reaction = string | [string, string];

const de = JSON.parse(readFileSync('src/i18n/de.json', 'utf8')) as {
  reaktion: Record<string, Record<string, Record<string, Reaction>>>;
  reaktion_item: Record<string, Record<string, Reaction>>;
};

const VERBS = ['gib', 'oeffne', 'schliesse', 'nimm', 'schauan', 'redemit', 'benutze', 'druecke', 'ziehe'];
const SPEECH_LIMIT = 170;

const itemIds = new Set(ITEMS.map((i) => i.id));

function variantsOf(place: string): readonly RoomVariant[] {
  for (const room of ROOMS) {
    for (const [era, variants] of Object.entries(room.eras)) {
      if (`${room.id}_${era}` === place) return variants as readonly RoomVariant[];
    }
  }
  return [];
}

/** Antwortet diese Klickfläche schon selbst, käme die Reaktion nie zum Zug. */
function isDead(spots: readonly Hotspot[], verb: string): boolean {
  return spots.every((h) => {
    const v = verb as keyof NonNullable<Hotspot['verbs']>;
    if (h.verbs?.[v] || h.comments?.[v]) return true;
    return verb === 'benutze' && Object.keys(h.useWith ?? {}).length > 0;
  });
}

const textOf = (r: Reaction): string => (typeof r === 'string' ? r : r[1]);

test.describe('Meilenstein 8: Text-Runde', () => {
  test('Reaktionen gehören zu echten Orten, Klickflächen und Gegenständen und kommen auch zum Zug', () => {
    const problems: string[] = [];
    for (const [place, spots] of Object.entries(de.reaktion)) {
      const variants = variantsOf(place);
      if (variants.length === 0) problems.push(`Ort fehlt: ${place}`);
      // Spielbare Figuren stehen nicht in der Raumliste, können aber im Raum sein.
      const actors = new Set(['doc', 'marty', ...variants.flatMap((v) => (v.actors ?? []).map((a) => a.id))]);
      for (const [spot, reactions] of Object.entries(spots)) {
        const hotspots = variants.flatMap((v) => v.hotspots).filter((h) => h.id === spot);
        if (hotspots.length === 0) problems.push(`Klickfläche fehlt: ${place}.${spot}`);
        for (const [what, reaction] of Object.entries(reactions)) {
          const where = `${place}.${spot}.${what}`;
          if (what.startsWith('mit_')) {
            const item = what.slice(4);
            if (!itemIds.has(item)) problems.push(`Gegenstand fehlt: ${where}`);
            if (hotspots.length > 0 && hotspots.every((h) => h.useWith?.[item])) problems.push(`Verdeckt von useWith: ${where}`);
          } else if (what !== 'mit' && !VERBS.includes(what)) {
            problems.push(`Unbekanntes Verb: ${where}`);
          } else if (VERBS.includes(what) && what !== 'gib' && isDead(hotspots, what)) {
            problems.push(`Verdeckt vom Raum: ${where}`);
          }
          if (typeof reaction !== 'string' && !actors.has(reaction[0])) problems.push(`Sprecher fehlt im Raum: ${where}`);
        }
      }
    }
    expect(problems).toEqual([]);
  });

  test('Reaktionen auf Gegenstände gehören zu echten Gegenständen und kommen auch zum Zug', () => {
    const problems: string[] = [];
    for (const [id, reactions] of Object.entries(de.reaktion_item)) {
      const item = ITEMS.find((i) => i.id === id);
      if (!item) {
        problems.push(`Gegenstand fehlt: ${id}`);
        continue;
      }
      for (const what of Object.keys(reactions)) {
        const where = `${id}.${what}`;
        if (what.startsWith('mit_')) {
          if (!itemIds.has(what.slice(4))) problems.push(`Gegenstand fehlt: ${where}`);
        } else if (what === 'gib_an' || what === 'benutze_mit') {
          continue;
        } else if (!VERBS.includes(what) || what === 'gib' || what === 'benutze' || what === 'schauan') {
          problems.push(`Nie erreichbar: ${where}`);
        } else if (item.verbs?.[what as keyof NonNullable<typeof item.verbs>]) {
          problems.push(`Verdeckt vom Gegenstand: ${where}`);
        }
      }
    }
    expect(problems).toEqual([]);
  });

  test('Im Spiel: Reaktion, Antwort einer Nebenfigur, Gegenstand, Ausgang und Nebengespräch', async ({ page }) => {
    const errors = watchErrors(page);
    await openGame(page);
    const room = de.reaktion.martys_zimmer_1986;

    // Reaktion aus der Tabelle statt Standardspruch.
    await act(page, 'schliesse', 'fenster');
    expect(await lastSpeech(page)).toBe(room.fenster.schliesse);

    // Auch die Dinge auf dem Regal antworten.
    await act(page, 'druecke', 'stereoanlage');
    expect(await lastSpeech(page)).toBe(room.stereoanlage.druecke);
    await act(page, 'redemit', 'pflanze');
    expect(await lastSpeech(page)).toBe(room.pflanze.redemit);
    await act(page, 'oeffne', 'regal');
    expect(await lastSpeech(page)).toBe(room.regal.oeffne);

    // „Benutze Gegenstand mit Klickfläche“ nimmt nicht den Text für „Benutze Klickfläche“.
    await useItem(page, 'foto', 'bett');
    expect(await lastSpeech(page)).toBe(de.reaktion_item.foto.benutze_mit);

    // Reaktion auf einen Gegenstand im Inventar.
    await clickVerb(page, 'redemit');
    await clickItem(page, 'foto');
    await waitIdle(page);
    expect(await lastSpeech(page)).toBe(de.reaktion_item.foto.redemit);

    // Ausgang: eigener Spruch statt „Das lässt sich nicht öffnen“.
    await act(page, 'oeffne', 'tuer');
    expect(await lastSpeech(page)).toBe('Dafür muss ich nur hingehen.');

    // Nebenfigur antwortet selbst.
    await go(page, 'tuer', 'kueche');
    await act(page, 'oeffne', 'haengeschrank');
    expect(await lastSpeech(page)).toBe(de.reaktion.kueche_1986.haengeschrank.oeffne);
    await go(page, 'arbeitszimmer', 'arbeitszimmer');
    await act(page, 'druecke', 'lampe');
    expect(await lastSpeech(page)).toBe(de.reaktion.arbeitszimmer_1986.lampe.druecke);
    await go(page, 'tuer', 'kueche');
    await act(page, 'ziehe', 'lorraine');
    const said = await page.evaluate(() => window.__hv.speech().at(-1));
    expect(said?.actor).toBe('lorraine');
    expect(said?.text).toBe((de.reaktion.kueche_1986.lorraine.ziehe as [string, string])[1]);

    // Nebengespräch im Untermenü und zurück.
    await clickVerb(page, 'redemit');
    await clickHotspot(page, 'lorraine');
    await chooseAnswer(page, 'Mal was anderes');
    await chooseAnswer(page, 'Woran schreibt Dad');
    await chooseAnswer(page, 'Egal');
    await chooseAnswer(page, 'Bis später');
    await waitIdle(page);
    expect(errors).toEqual([]);
  });

  test('Sprechtexte bleiben kurz genug für den Bildschirm', () => {
    const tooLong: string[] = [];
    const all = [
      ...Object.values(de.reaktion).flatMap((spots) => Object.values(spots).flatMap((r) => Object.values(r))),
      ...Object.values(de.reaktion_item).flatMap((r) => Object.values(r)),
    ];
    for (const reaction of all) {
      if (textOf(reaction).length > SPEECH_LIMIT) tooLong.push(textOf(reaction));
    }
    expect(tooLong).toEqual([]);
  });
});
