import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname } from 'node:path';
import { PNG } from 'pngjs';

/**
 * Die Spielschrift: proportional, mit weich gerundeten Ecken.
 * Zeilenraster: Zeile 0 = Umlautpunkte über Großbuchstaben, Zeilen 1–7 = Großbuchstaben,
 * Zeilen 3–7 = Kleinbuchstaben, Zeilen 8–9 = Unterlängen.
 * Jede Glyphe: [erste Zeile, Muster]. `#` ist ein voller Pixel, `+` ein halb heller für Rundungen.
 */
const G: Record<string, [number, string]> = {
  ' ': [7, '..'],
  A: [1, '.+#+./.#.#./+#.#+/#...#/#####/#...#/#...#'],
  B: [1, '####+/#...#/#...#/####./#...#/#...#/####+'],
  C: [1, '.+###/+#.../#..../#..../#..../+#.../.+###'],
  D: [1, '###+./#..+#/#...#/#...#/#...#/#..+#/###+.'],
  E: [1, '####/#.../#.../###./#.../#.../####'],
  F: [1, '####/#.../#.../###./#.../#.../#...'],
  G: [1, '.+###/+#.../#..../#.###/#...#/+#..#/.+###'],
  H: [1, '#...#/#...#/#...#/#####/#...#/#...#/#...#'],
  I: [1, '###/.#./.#./.#./.#./.#./###'],
  J: [1, '..##/...#/...#/...#/...#/#..#/+##+'],
  K: [1, '#..+#/#.+#./#+#../##.../#+#../#.+#./#..+#'],
  L: [1, '#.../#.../#.../#.../#.../#.../####'],
  M: [1, '#...#/##.##/#+#+#/#.#.#/#...#/#...#/#...#'],
  N: [1, '#...#/##..#/#+#.#/#.#.#/#.#+#/#..##/#...#'],
  O: [1, '+###+/#...#/#...#/#...#/#...#/#...#/+###+'],
  P: [1, '####+/#...#/#...#/####+/#..../#..../#....'],
  Q: [1, '+###+/#...#/#...#/#...#/#.#.#/#..#+/+##+#'],
  R: [1, '####+/#...#/#...#/####+/#.+#./#..#+/#...#'],
  S: [1, '+###+/#...+/#..../+###+/....#/+...#/+###+'],
  T: [1, '#####/..#../..#../..#../..#../..#../..#..'],
  U: [1, '#...#/#...#/#...#/#...#/#...#/#...#/+###+'],
  V: [1, '#...#/#...#/#...#/+#.#+/.#.#./.#.#./..#..'],
  W: [1, '#...#/#...#/#...#/#.#.#/#.#.#/##+##/#...#'],
  X: [1, '#...#/+#.#+/.#+#./..#../.#+#./+#.#+/#...#'],
  Y: [1, '#...#/+#.#+/.#+#./..#../..#../..#../..#..'],
  Z: [1, '#####/...+#/..+#./.+#../+#.../#+.../#####'],
  a: [3, '+##+/...#/+###/#..#/+###'],
  b: [1, '#.../#.../###+/#..#/#..#/#..#/###+'],
  c: [3, '+##/#../#../#../+##'],
  d: [1, '...#/...#/+###/#..#/#..#/#..#/+###'],
  e: [3, '+##+/#..#/####/#.../+##+'],
  f: [1, '.+#/.#./###/.#./.#./.#./.#.'],
  g: [3, '+###/#..#/#..#/+###/...#/+##+'],
  h: [1, '#.../#.../###+/#..#/#..#/#..#/#..#'],
  i: [1, '#/./#/#/#/#/#'],
  j: [1, '.#/../.#/.#/.#/.#/.#/.#/#+'],
  k: [1, '#.../#.../#..#/#.#+/##../#.#+/#..#'],
  l: [1, '#./#./#./#./#./#./+#'],
  m: [3, '####+/#.#.#/#.#.#/#.#.#/#.#.#'],
  n: [3, '###+/#..#/#..#/#..#/#..#'],
  o: [3, '+##+/#..#/#..#/#..#/+##+'],
  p: [3, '###+/#..#/#..#/#..#/###+/#.../#...'],
  q: [3, '+###/#..#/#..#/#..#/+###/...#/...#'],
  r: [3, '#+#/#+./#../#../#..'],
  s: [3, '+##/#../+#+/..#/##+'],
  t: [2, '.#./###/.#./.#./.#./.+#'],
  u: [3, '#..#/#..#/#..#/#..#/+###'],
  v: [3, '#.#/#.#/#.#/+#+/.#.'],
  w: [3, '#...#/#...#/#.#.#/#.#.#/+#+#+'],
  x: [3, '#.#/#.#/.#./#.#/#.#'],
  y: [3, '#..#/#..#/#..#/+###/...#/+##+'],
  z: [3, '####/..+#/.+#./#+../####'],
  Ä: [0, '.#.#./...../.+#+./+#.#+/#...#/#####/#...#/#...#'],
  Ö: [0, '.#.#./...../+###+/#...#/#...#/#...#/#...#/+###+'],
  Ü: [0, '.#.#./...../#...#/#...#/#...#/#...#/#...#/+###+'],
  ä: [1, '#..#/..../+##+/...#/+###/#..#/+###'],
  ö: [1, '#..#/..../+##+/#..#/#..#/#..#/+##+'],
  ü: [1, '#..#/..../#..#/#..#/#..#/#..#/+###'],
  é: [1, '..#./.#../+##+/#..#/####/#.../+##+'],
  ê: [0, '.#../#..#/####/#.../+##+'],
  ß: [1, '+##+/#..#/#.#+/#.#+/#..#/#..#/#.#+/#...'],
  '0': [1, '+##+/#..#/#.##/#..#/##.#/#..#/+##+'],
  '1': [1, '.#./##./.#./.#./.#./.#./###'],
  '2': [1, '+##+/#..#/...#/..+#/.+#./+#../####'],
  '3': [1, '###+/...#/...#/.##+/...#/...#/###+'],
  '4': [1, '#..#/#..#/#..#/####/...#/...#/...#'],
  '5': [1, '####/#.../###+/...#/...#/#..#/+##+'],
  '6': [1, '+##+/#.../#.../###+/#..#/#..#/+##+'],
  '7': [1, '####/...#/..+#/..#./.+#./.#../.#..'],
  '8': [1, '+##+/#..#/#..#/+##+/#..#/#..#/+##+'],
  '9': [1, '+##+/#..#/#..#/+###/...#/...#/+##+'],
  '.': [7, '#'],
  ',': [7, '#/+'],
  ':': [3, '#/././#/.'],
  ';': [3, '.#/../../.#/+#'],
  '!': [1, '#/#/#/#/#/./#'],
  '?': [1, '+##+/#..#/...#/..+#/.#../..../.#..'],
  '-': [5, '###'],
  '–': [5, '#####'],
  _: [8, '####'],
  '+': [3, '.#./.#./###/.#./.#.'],
  '=': [4, '###/.../###'],
  '/': [1, '...#/...#/..+#/..#./.+#./.#../#...'],
  '\\': [1, '#.../.#../.#+./..#./..+#/...#/...#'],
  '(': [1, '.#/+#/#./#./#./+#/.#'],
  ')': [1, '#./#+/.#/.#/.#/#+/#.'],
  '[': [1, '##/#./#./#./#./#./##'],
  ']': [1, '##/.#/.#/.#/.#/.#/##'],
  "'": [1, '#/+'],
  '"': [1, '#.#/+.+'],
  '„': [7, '#.#/+.+'],
  '“': [1, '+.+/#.#'],
  '”': [1, '#.#/+.+'],
  '‚': [7, '#/+'],
  '‘': [1, '+/#'],
  '’': [1, '#/+'],
  '…': [7, '#.#.#'],
  '·': [4, '#'],
  '%': [1, '#..#/...#/..+#/..#./.+#./#.../#..#'],
  '&': [1, '+##+/#..#/+##+/+#../#.##/#..#/+###'],
  '#': [2, '.#.#./#####/.#.#./.#.#./#####/.#.#.'],
  '*': [2, '#.#/.#./#.#'],
  '<': [2, '..#/.#./#../.#./..#'],
  '>': [2, '#../.#./..#/.#./#..'],
  $: [1, '.+##+/+#+../#.#../+###+/..#.#/..+#+/+##+.'],
  '@': [1, '+###+/#...#/#.###/#.#.#/#.###/#..../+###+'],
  '°': [1, '+#+/#.#/+#+'],
};

const CELL_H = 12; // 10 Rasterzeilen + 1 Pixel Rand oben/unten
const ATLAS_W = 256;
/** Helligkeit eines `+`-Pixels. */
const SOFT = 0.55;
/** Helligkeit in der untersten Zeile. Der leichte Verlauf nach unten wirkt gemalt, nicht gestempelt. */
const BOTTOM_LIGHT = 0.8;
/** Deckkraft des Randes an den Ecken. Der Rand bleibt so rund und nicht klobig. */
const CORNER_EDGE = 0.5;

const rowsOf = (pattern: string): string[] => pattern.split('/');

/**
 * Baut den Schrift-Atlas: helle Glyphen mit dunklem Rand. Tint färbt nur das Helle,
 * der Rand bleibt dunkel, sodass Text auf jedem Hintergrund lesbar bleibt.
 */
export function buildFont(pngPath: string, xmlPath: string): void {
  const layout: { char: string; x: number; y: number; w: number; adv: number }[] = [];
  let cx = 0;
  let cy = 0;
  for (const [char, [, pattern]] of Object.entries(G)) {
    const gw = Math.max(...rowsOf(pattern).map((r) => r.length));
    if (cx + gw + 3 > ATLAS_W) {
      cx = 0;
      cy += CELL_H + 1;
    }
    layout.push({ char, x: cx, y: cy, w: gw + 2, adv: gw + 1 });
    cx += gw + 3;
  }
  const png = new PNG({ width: ATLAS_W, height: cy + CELL_H + 1 });
  png.data.fill(0);
  const put = (x: number, y: number, light: number, alpha: number): void => {
    if (x < 0 || y < 0 || x >= png.width || y >= png.height) return;
    const o = (y * png.width + x) * 4;
    const v = Math.round(light * 255);
    png.data[o] = v;
    png.data[o + 1] = v;
    png.data[o + 2] = v;
    png.data[o + 3] = Math.max(png.data[o + 3], Math.round(alpha * 255));
  };
  const xmlChars: string[] = [];
  for (const item of layout) {
    const [top, pattern] = G[item.char];
    const rows = rowsOf(pattern);
    const isOn = (gx: number, gy: number): boolean => {
      const ch = rows[gy]?.[gx];
      return ch === '#' || ch === '+';
    };
    if (item.char !== ' ') {
      for (let gy = -1; gy <= rows.length; gy++) {
        for (let gx = -1; gx <= item.w - 2; gx++) {
          if (isOn(gx, gy)) continue;
          const straight = isOn(gx - 1, gy) || isOn(gx + 1, gy) || isOn(gx, gy - 1) || isOn(gx, gy + 1);
          const corner = isOn(gx - 1, gy - 1) || isOn(gx + 1, gy - 1) || isOn(gx - 1, gy + 1) || isOn(gx + 1, gy + 1);
          if (straight) put(item.x + 1 + gx, item.y + 1 + top + gy, 0, 1);
          else if (corner) put(item.x + 1 + gx, item.y + 1 + top + gy, 0, CORNER_EDGE);
        }
      }
    }
    rows.forEach((row, gy) => {
      const shade = 1 - ((top + gy) / 9) * (1 - BOTTOM_LIGHT);
      [...row].forEach((ch, gx) => {
        if (ch === '#') put(item.x + 1 + gx, item.y + 1 + top + gy, shade, 1);
        else if (ch === '+') put(item.x + 1 + gx, item.y + 1 + top + gy, shade * SOFT, 1);
      });
    });
    xmlChars.push(
      `    <char id="${item.char.codePointAt(0)}" x="${item.x}" y="${item.y}" width="${item.w}" ` +
        `height="${CELL_H}" xoffset="-1" yoffset="-1" xadvance="${item.adv}" page="0" chnl="15"/>`,
    );
  }
  mkdirSync(dirname(pngPath), { recursive: true });
  writeFileSync(pngPath, PNG.sync.write(png));
  const xml = `<?xml version="1.0"?>
<font>
  <info face="hv" size="10" bold="0" italic="0" charset="" unicode="1" stretchH="100" smooth="0" aa="0" padding="0,0,0,0" spacing="0,0"/>
  <common lineHeight="10" base="8" scaleW="${png.width}" scaleH="${png.height}" pages="1" packed="0"/>
  <pages><page id="0" file="font.png"/></pages>
  <chars count="${xmlChars.length}">
${xmlChars.join('\n')}
  </chars>
</font>
`;
  mkdirSync(dirname(xmlPath), { recursive: true });
  writeFileSync(xmlPath, xml, 'utf8');
}
