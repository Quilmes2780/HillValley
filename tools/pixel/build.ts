import { mkdirSync, writeFileSync } from 'node:fs';
import { toGpl } from './palette.ts';
import { buildFont } from './font.ts';
import { buildUi } from './ui.ts';
import { buildItems } from './items.ts';
import { buildBackgrounds } from './backgrounds.ts';
import { buildCharacters } from './characters.ts';

const DIR = 'assets';
mkdirSync(DIR, { recursive: true });
writeFileSync(`${DIR}/palette.gpl`, toGpl(), 'utf8');
buildFont(`${DIR}/ui/font.png`, `${DIR}/ui/font.xml`);
buildUi(DIR);
buildItems(DIR);
buildBackgrounds(DIR);
buildCharacters(DIR);
console.log('Grafiken erzeugt.');
