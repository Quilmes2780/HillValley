import { existsSync, readFileSync } from 'node:fs';
import { expect, test } from '@playwright/test';
import type { RoomEffect } from '../src/engine/types';
import { AMBIENCE, MUSIC, SFX } from '../src/game/audio';
import { ROOMS } from '../src/game/rooms/index';
import { PICTURES } from '../src/game/szenen';
import { act, lastSpeech, openGame, talk, waitIdle, watchErrors } from './helpers';

/** Liest Größe eines 8-Bit-WAV: Daten ab Byte 44. */
function samples(name: string): Buffer {
  return readFileSync(`assets/audio/${name}.wav`).subarray(44);
}

test.describe('Meilenstein 9: Leben und Klang', () => {
  test('Alle Klänge gibt es, und sie sind weder stumm noch dauerhaft übersteuert', () => {
    for (const name of [...MUSIC, ...AMBIENCE, ...SFX]) {
      expect(existsSync(`assets/audio/${name}.wav`), name).toBe(true);
      const data = samples(name);
      let peak = 0;
      let clipped = 0;
      for (const v of data) {
        const a = Math.abs(v - 127.5);
        peak = Math.max(peak, a);
        if (a >= 127) clipped++;
      }
      expect(peak, `${name} ist stumm`).toBeGreaterThan(8);
      expect(clipped / data.length, `${name} übersteuert`).toBeLessThan(0.05);
    }
  });

  test('Alle Effektbilder gibt es, Bildstreifen passen genau in ihre Bildgröße', () => {
    const effects: RoomEffect[] = ROOMS.flatMap((room) =>
      Object.values(room.eras).flatMap((variants) => variants.flatMap((v) => v.effects ?? [])),
    );
    expect(effects.length).toBeGreaterThan(60);
    const checks = [
      ...effects.flatMap((e) => (e.type === 'strip' || e.type === 'pass' ? [e] : [])),
      ...PICTURES,
    ];
    for (const e of checks) {
      const path = `assets/${e.key}`;
      expect(existsSync(path), path).toBe(true);
      const png = readFileSync(path);
      const width = png.readUInt32BE(16);
      const height = png.readUInt32BE(20);
      if (e.frameWidth) {
        expect(width % e.frameWidth, path).toBe(0);
        expect(height, path).toBe(e.frameHeight);
      }
    }
  });

  test('Musik und Raumklang folgen dem Raum, Effekte laufen ohne Fehler in jedem Raum', async ({ page }) => {
    test.setTimeout(120000);
    const errors = watchErrors(page);
    await openGame(page);
    await page.keyboard.press('F9');
    const expected: [string, string, string, string][] = [
      ['saloon', '1885', 'saloon', 'amb_kneipe'],
      ['cafe', '1955', 'diner', 'amb_cafe'],
      ['cafe80er', '2015', 'cafe80er', 'amb_zukunft'],
      ['buero', '2015', 'showdown', 'amb_zukunft'],
      ['uhrwerk', '1986', 'jahr1986', 'amb_uhrwerk'],
      ['gasse', '2015', 'jahr2015', 'amb_regen'],
    ];
    for (const [room, era, music, ambience] of expected) {
      await page.selectOption('#hv-debug-room', room);
      await page.selectOption('#hv-debug-era', era);
      await page.click('#hv-debug-go');
      expect(await page.evaluate(() => window.__hv.music()), room).toBe(music);
      expect(await page.evaluate(() => window.__hv.ambience()), room).toBe(ambience);
    }
    for (const room of ROOMS) {
      for (const era of Object.keys(room.eras)) {
        await page.selectOption('#hv-debug-room', room.id);
        await page.selectOption('#hv-debug-era', era);
        await page.click('#hv-debug-go');
        await page.waitForTimeout(40);
      }
    }
    expect(errors).toEqual([]);
  });

  test('Flug mit Sprechtext: Marty stürzt im Büro, landet in der Lobby, die Bedienung kommt zurück', async ({ page }) => {
    const errors = watchErrors(page);
    await openGame(page);
    await page.keyboard.press('F9');
    await page.selectOption('#hv-debug-room', 'buero');
    await page.selectOption('#hv-debug-era', '2015');
    await page.click('#hv-debug-go');
    await page.keyboard.press('F9');
    await talk(page, 'brix', ['Niemand nennt']);
    await waitIdle(page);
    expect(await page.evaluate(() => window.__hv.room().id)).toBe('lobby');
    expect(await lastSpeech(page)).toContain('Erdgeschoss');
    // Die Figur steht wieder aufrecht und läuft normal.
    await act(page, 'schauan', 'bueste');
    expect(await page.evaluate(() => window.__hv.isIdle())).toBe(true);
    expect(errors).toEqual([]);
  });
});
