// Nimmt die Bilder für das Lösungsbuch im laufenden Spiel auf (Dev-Server auf Port 5173 muss laufen).
// node tools/loesungsbuch/screens.cjs [name…]   – ohne Namen alle Aufnahmen
const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');
const OUT = path.join(__dirname, '.screens');
fs.mkdirSync(OUT, { recursive: true });

// Spielstand je Kapitel: Kapitelnummer, Tannenburg-Zeitlinie, aktive Figur
const P = { chapter: 0, tb: false };
const K1 = { chapter: 1, tb: true };
const K2 = { chapter: 2, tb: true, who: 'doc_jung' };
const K3 = { chapter: 3, tb: false, who: 'doc' };
const K3M = { chapter: 3, tb: false };
const K4 = { chapter: 4, tb: false };
const K5 = { chapter: 5, tb: false };
// name, raum, jahr, stand, flags, inventar, laufziel [x, y] in Spielpixeln
const SHOTS = [
  ['p_zimmer', 'martys_zimmer', 1986, P, {}, ['foto'], [150, 124]],
  ['p_kueche', 'kueche', 1986, P, { kugelschreiber_genommen: 1 }, ['foto', 'kugelschreiber'], [140, 124]],
  ['p_vorgarten', 'vorgarten', 1986, P, {}, ['foto', 'kugelschreiber', 'banane'], [120, 124]],
  ['p_labor', 'docs_labor', 1986, P, { labor_schrank_offen: 1 }, ['foto', 'kugelschreiber', 'banane'], [150, 124]],
  ['k1_plan', 'stadtplan', 1986, K1, {}, [], null],
  ['k1_platz', 'rathausplatz', 1986, K1, {}, ['foto', 'docs_brief', 'notizbuch', 'mr_fusion', 'banane', 'kugelschreiber'], [150, 126]],
  ['k1_flur', 'schule_flur', 1986, K1, {}, ['foto', 'zeitung', 'notizbuch', 'mr_fusion'], [120, 126]],
  ['k1_zeitung', 'schuelerzeitung', 1986, K1, { schule_zutritt: 1 }, ['foto', 'notizbuch', 'mr_fusion'], [120, 126]],
  ['k1_platz_kasten', 'rathausplatz', 1986, K1, { kasten_offen: 1, kabel_angeschlossen: 1, diktiergeraet_angeschlossen: 1, kassette_eingelegt: 1 }, ['foto', 'notizbuch', 'mr_fusion'], [150, 126]],
  ['k1_uhrwerk', 'uhrwerk', 1986, K1, { kowalski_weg: 1, chronopost_gesehen: 1 }, ['foto', 'notizbuch', 'mr_fusion', 'bananenschale', 'kugelschreiber'], [140, 126]],
  ['k2_uhrwerk', 'uhrwerk', 1955, K2, { brief_gesendet: 1 }, ['brief_von_marty'], [140, 126]],
  ['k2_labor', 'docs_labor', 1955, K2, {}, ['brief_von_marty', 'schraubenzieher'], [150, 126]],
  ['k2_platz', 'rathausplatz', 1955, K2, {}, ['brief_von_marty', 'schraubenzieher', 'zigarrenkiste'], [150, 126]],
  ['k2_cafe', 'cafe', 1955, K2, {}, ['brief_von_marty', 'schraubenzieher', 'kupferspule'], [150, 126]],
  ['k2_radio', 'radioladen', 1955, K2, { mixer_repariert: 1 }, ['brief_von_marty', 'dollar', 'kupferspule'], [150, 126]],
  ['k2_flur', 'schule_flur', 1955, K2, {}, ['brief_von_marty', 'verstaerker'], [120, 126]],
  ['k2_strasse', 'strasse_mist', 1955, K2, { biff_im_mist: 1 }, ['mappe', 'verstaerker'], [150, 126]],
  ['k3_gleis', 'abstellgleis', 1885, K3, {}, [], [200, 126]],
  ['k3_saloon', 'saloon', 1885, K3, {}, [], [150, 126]],
  ['k3_schmiede', 'schmiede', 1885, K3, {}, ['streichhoelzer'], [150, 126]],
  ['k3_fest', 'festplatz', 1885, K3, {}, ['streichhoelzer', 'bleistift'], [150, 126]],
  ['k3_stall', 'mietstall', 1885, K3, { buford_im_stall: 1 }, ['streichhoelzer', 'knallfrosch', 'bleistift'], [130, 126]],
  ['k3_geruest', 'uhrwerk', 1885, K3, { sicherung_gesendet: 1 }, ['fluxkompensator'], [140, 126]],
  ['k3_grundstein', 'rathausplatz', 1986, K3M, { kowalski_weg: 1, grundstein_zu: 1, grundstein_aufgebrochen: 1 }, ['foto', 'brecheisen', 'mr_fusion'], [150, 126]],
  ['k4_vorgarten', 'vorgarten', 1986, K4, {}, ['foto', 'wachstuch', 'mr_fusion'], [120, 126]],
  ['k4_veranda', 'veranda', 1986, K4, { einstein_folgt: 1 }, ['foto', 'wachsdose', 'mr_fusion'], [150, 126]],
  ['k4_zug', 'rathausplatz', 1986, K4, { kowalski_weg: 1, schluessel_eingesetzt: 1, brief_2015_genommen: 1, zug_da: 1 }, ['foto', 'wachsdose', 'mr_fusion', 'brief_2015'], [120, 126]],
  ['k5_platz', 'turmplatz', 2015, K5, {}, ['foto', 'muenze_2015'], [130, 124]],
  ['k5_cafe', 'cafe80er', 2015, K5, {}, ['foto', 'muenze_2015'], [190, 130]],
  ['k5_museum', 'museum', 2015, K5, { museum_eintritt: 1 }, ['foto', 'glas'], [200, 126]],
  ['k5_lobby', 'lobby', 2015, K5, {}, ['foto', 'glas', 'klebeband'], [150, 126]],
  ['k5_buero', 'buero', 2015, K5, { aufzug_offen: 1 }, ['foto', 'folie'], [120, 126]],
  ['k5_gasse', 'gasse', 2015, K5, { brix_gestuerzt: 1 }, ['foto', 'folie'], [150, 126]],
  ['e_museum', 'museum', 2015, K5, { zeitlinie_geheilt: 1, museum_eintritt: 1 }, ['foto'], [200, 126]],
  ['e_platz', 'turmplatz', 2015, K5, { zeitlinie_geheilt: 1 }, ['foto'], [130, 124]],
];

(async () => {
  const only = process.argv.slice(2);
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: 1280, height: 800 } });
  for (const [name, room, era, ctx, flags, items, walk] of SHOTS) {
    if (only.length && !only.includes(name)) continue;
    await p.goto('http://localhost:5173/?test=1');
    await p.waitForFunction(() => window.__hv && window.__hv.isIdle(), null, { timeout: 30000 });
    const who = ctx.who || 'marty';
    const setup = async () =>
      p.evaluate(({ ctx, flags, items, who }) => {
        const s = window.__hv.state();
        s.chapter = ctx.chapter;
        s.timeline.tannenburg = ctx.tb;
        for (const [k, v] of Object.entries(flags)) s.flags[k] = v === 1 ? true : v;
        s.characters[who].inventory = [];
      }, { ctx, flags, items, who });
    await setup();
    await p.keyboard.press('F9');
    if (ctx.who) {
      await p.click(`#hv-debug-char-${who}`);
      await p.waitForTimeout(800);
      await setup();
    }
    // Über das Debug-Menü geben, damit die Inventarleiste mitzieht
    for (const it of items) {
      await p.selectOption('#hv-debug-item', it);
      await p.click('#hv-debug-give');
    }
    await p.selectOption('#hv-debug-room', room);
    await p.selectOption('#hv-debug-era', String(era));
    await p.click('#hv-debug-go');
    await p.waitForFunction((r) => window.__hv.room().id === r, room, { timeout: 15000 });
    await p.waitForTimeout(600);
    await p.keyboard.press('F9');
    await p.waitForTimeout(300);
    const box = await p.locator('canvas').boundingBox();
    const zoom = await p.evaluate(() => window.__hv.zoom());
    if (walk) {
      const sx = await p.evaluate(() => window.__hv.room().scrollX);
      await p.mouse.click(box.x + (walk[0] - sx) * zoom, box.y + walk[1] * zoom);
      await p.waitForTimeout(300);
      await p.waitForFunction(() => window.__hv.isIdle(), null, { timeout: 15000 });
    }
    // Zeiger aus dem Bild, damit keine Hervorhebung stört
    await p.mouse.move(box.x + 2, box.y + box.height - 2);
    await p.waitForTimeout(900);
    await p.locator('canvas').screenshot({ path: path.join(OUT, `${name}.png`) });
    console.log(name, 'zoom', zoom);
  }
  await b.close();
})();
