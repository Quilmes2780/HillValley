import { existsSync } from 'node:fs';
import { EXTRA_SPRITES, skateboardIcon, skateboardWand } from './extras.ts';
import { ANIMS, FIGURE_IDS, figurePortrait, figureSheet } from './figuren.ts';
import * as H from './haus.ts';
import { ITEM_ICONS } from './items.ts';
import { savePicture, type Picture } from './painter.ts';
import { paintRathausplatz } from './rathausplatz.ts';
import * as S from './schule.ts';
import * as Sp from './sprites.ts';
import * as Leben from './leben.ts';
import { paintStadtplan } from './stadtplan.ts';
import { paintTitel } from './titel.ts';
import * as T from './turm.ts';
import * as U from './ui.ts';
import * as We from './westen.ts';
import * as Z from './zukunft.ts';

/**
 * Malt alle Hintergründe, großen Sprites, die Oberfläche, die Gegenstände und die Figuren. Eigene Bilder haben Vorrang: Eine Datei, die schon
 * da ist, bleibt liegen, solange nicht `-- --force` übergeben wird.
 *
 * `npm run paint -- raumname` malt nur Bilder, deren Name den Text enthält (und überschreibt sie).
 */
const BACKGROUNDS: Record<string, () => Picture> = {
  martys_zimmer_1986: H.martysZimmer,
  kueche_1986: H.kueche,
  arbeitszimmer_1986: H.arbeitszimmer,
  vorgarten_1986: () => H.vorgarten(false),
  vorgarten_1986_tannenburg: () => H.vorgarten(true),
  veranda_1986: T.veranda,
  docs_labor_1986: T.labor1986,
  docs_labor_1955: T.labor1955,
  stadtplan_1986: () => paintStadtplan('hill_valley'),
  stadtplan_1986_tannenburg: () => paintStadtplan('tannen'),
  stadtplan_1955: () => paintStadtplan('1955'),
  stadtplan_1885: () => paintStadtplan('1885'),
  rathausplatz_1986_tannenburg: () => paintRathausplatz('tannen'),
  rathausplatz_1986: () => paintRathausplatz('rathaus'),
  rathausplatz_1955: () => paintRathausplatz('1955'),
  turmeingang_1986: T.turmeingang,
  uhrwerk_1986: () => T.uhrwerk(1986),
  uhrwerk_1955: () => T.uhrwerk(1955),
  uhrwerk_1885: () => T.uhrwerk(1885),
  schule_flur_1986: () => S.schulFlur(1986),
  schule_flur_1955: () => S.schulFlur(1955),
  bandraum_1986: S.bandraum,
  schuelerzeitung_1986: S.schuelerzeitung,
  cafe_1955: S.cafe1955,
  radioladen_1955: S.radioladen,
  strasse_1955: S.strasse1955,
  abstellgleis_1885: We.abstellgleis,
  schmiede_1885: We.schmiede,
  saloon_1885: We.saloon,
  festplatz_1885: We.festplatz,
  mietstall_1885: We.mietstall,
  turmplatz_2015: () => Z.turmplatz2015(false),
  turmplatz_2015_geheilt: () => Z.turmplatz2015(true),
  cafe80er_2015: Z.cafe80er,
  museum_2015: () => Z.museum2015(false),
  museum_2015_geheilt: () => Z.museum2015(true),
  lobby_2015: Z.lobby2015,
  buero_2015: Z.buero2015,
  gasse_2015: Z.gasse2015,
};

const SPRITES: Record<string, () => Picture> = {
  auto: H.auto,
  spind_offen: S.spindOffen,
  cafe_theke: S.cafeTheke,
  mixer: S.mixer,
  laden_theke: S.ladenTheke,
  mistlaster: () => S.mistlaster(false),
  hover_mistlaster: () => S.mistlaster(true),
  mist_beine: () => S.beine('#3a4a6a'),
  brix_beine: () => S.beine('#26283a'),
  saloon_theke: We.saloonTheke,
  misthaufen: We.misthaufen,
  pferd: We.pferd,
  aufzug_zu: Z.aufzugZu,
  labor_schrank_zu: Sp.laborSchrankZu,
  bueste: Sp.bueste,
  helm: Sp.helm,
  helm_ohne_spule: Sp.helmOhneSpule,
  sicherungskasten: Sp.sicherungskasten,
  sicherungskasten_offen: Sp.sicherungskastenOffen,
  kasten_offen: Sp.kastenOffen,
  kabel_kasten: Sp.kabelKasten,
  grundstein_auf: Sp.grundsteinAuf,
  kofferraum_offen: Sp.kofferraumOffen,
  skateboard_wand: skateboardWand,
  ...EXTRA_SPRITES,
};

const UI: Record<string, () => Picture> = {
  panel: U.panel,
  panel_plain: U.panelPlain,
  key_hover: U.keyHover,
  key_selected: U.keySelected,
  slot_hover: U.slotHover,
  arrow_up: U.arrowUp,
  arrow_down: U.arrowDown,
  arrow_up_off: U.arrowUpOff,
  arrow_down_off: U.arrowDownOff,
  cursor: U.cursor,
  portrait_active: U.portraitActive,
  menu: U.menu,
};

/** Vom Nutzer gezeichnete Bilder: Sie werden nie übermalt, auch nicht mit --force oder Namensfilter. */
const EIGENE_BILDER = new Set(['titel', 'martys_zimmer_1986', 'kueche_1986', 'arbeitszimmer_1986', 'vorgarten_1986', 'vorgarten_1986_tannenburg', 'veranda_1986', 'docs_labor_1986', 'stadtplan_1986', 'stadtplan_1986_tannenburg', 'rathausplatz_1986', 'rathausplatz_1986_tannenburg', 'turmeingang_1986', 'uhrwerk_1986', 'schule_flur_1986', 'bandraum_1986', 'schuelerzeitung_1986',
  // Gegenstände
  'foto_stufe0', 'foto_stufe1', 'foto_stufe2', 'foto_stufe3', 'foto_stufe4', 'kugelschreiber', 'skateboard', 'skateboard_wand',
  'banane', 'bananenschale', 'x_mikrowelle', 'diktiergeraet',
  'auto', 'zeitung', 'wachsdose', 'sendeschluessel']);

const args = process.argv.slice(2);
const force = args.includes('--force');
const filter = args.find((a) => !a.startsWith('--'));

let painted = 0;
let kept = 0;
const run = (name: string, path: string, paint: () => Picture, transparent: boolean): void => {
  if (EIGENE_BILDER.has(name) || (filter && !name.includes(filter))) return;
  if (!filter && !force && existsSync(path)) {
    kept++;
    return;
  }
  savePicture(paint(), path, 1, transparent);
  painted++;
};

for (const [name, paint] of Object.entries(BACKGROUNDS)) run(name, `assets/backgrounds/${name}.png`, paint, false);
for (const [name, paint] of Object.entries(SPRITES)) run(name, `assets/backgrounds/sprites/${name}.png`, paint, true);
for (const [name, paint] of Object.entries(Leben)) run(name, `assets/backgrounds/sprites/${name}.png`, paint, true);
for (const [name, paint] of Object.entries(UI)) run(name, `assets/ui/${name}.png`, paint, name === 'cursor' || name === 'portrait_active');
for (const [name, paint] of Object.entries(ITEM_ICONS)) run(name, `assets/items/${name}.png`, paint, true);
run('skateboard', 'assets/items/skateboard.png', skateboardIcon, true);
run('titel', 'assets/ui/title.png', paintTitel, false);
run('delorean', 'assets/characters/delorean/delorean.png', Sp.zeitwagen, true);
run('zeitzug', 'assets/characters/zeitzug/zeitzug.png', Sp.zeitzug, true);
/** Vom Nutzer gezeichnete Figuren: Alle ihre Animationen und das Porträt bleiben unangetastet. */
const EIGENE_FIGUREN = new Set(['marty', 'lorraine', 'biff', 'einstein']);

for (const id of FIGURE_IDS) {
  if (EIGENE_FIGUREN.has(id)) continue;
  for (const anim of Object.keys(ANIMS)) run(`figur_${id}_${anim}`, `assets/characters/${id}/${id}_${anim}.png`, () => figureSheet(id, anim), true);
  run(`figur_${id}_portrait`, `assets/characters/${id}/${id}_portrait.png`, () => figurePortrait(id), false);
}
console.log(`Gemalt: ${painted}, unverändert: ${kept}.`);
