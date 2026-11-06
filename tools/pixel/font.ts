import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname } from 'node:path';
import { C } from './palette.ts';
import { Canvas } from './png.ts';

/**
 * Proportionale Bitmapschrift. Zeilenraster: Zeile 0 = Umlautpunkte über Großbuchstaben,
 * Zeilen 1–7 = Großbuchstaben, Zeilen 3–7 = Kleinbuchstaben, Zeilen 8–9 = Unterlängen.
 * Jede Glyphe: [erste Zeile, Muster mit # für Pixel und / als Zeilentrenner].
 */
const G: Record<string, [number, string]> = {
  ' ': [7, '...'],
  A: [1, '.##./#..#/#..#/####/#..#/#..#/#..#'],
  B: [1, '###./#..#/#..#/###./#..#/#..#/###.'],
  C: [1, '.###/#.../#.../#.../#.../#.../.###'],
  D: [1, '###./#..#/#..#/#..#/#..#/#..#/###.'],
  E: [1, '####/#.../#.../###./#.../#.../####'],
  F: [1, '####/#.../#.../###./#.../#.../#...'],
  G: [1, '.###/#.../#.../#.##/#..#/#..#/.###'],
  H: [1, '#..#/#..#/#..#/####/#..#/#..#/#..#'],
  I: [1, '###/.#./.#./.#./.#./.#./###'],
  J: [1, '..##/...#/...#/...#/...#/#..#/.##.'],
  K: [1, '#..#/#..#/#.#./##../#.#./#..#/#..#'],
  L: [1, '#.../#.../#.../#.../#.../#.../####'],
  M: [1, '#...#/##.##/#.#.#/#.#.#/#...#/#...#/#...#'],
  N: [1, '#..#/##.#/##.#/#.##/#.##/#..#/#..#'],
  O: [1, '.##./#..#/#..#/#..#/#..#/#..#/.##.'],
  P: [1, '###./#..#/#..#/###./#.../#.../#...'],
  Q: [1, '.##./#..#/#..#/#..#/#.##/#..#/.##.#'],
  R: [1, '###./#..#/#..#/###./#.#./#..#/#..#'],
  S: [1, '.###/#.../#.../.##./...#/...#/###.'],
  T: [1, '#####/..#../..#../..#../..#../..#../..#..'],
  U: [1, '#..#/#..#/#..#/#..#/#..#/#..#/.##.'],
  V: [1, '#...#/#...#/#...#/#...#/.#.#./.#.#./..#..'],
  W: [1, '#...#/#...#/#...#/#.#.#/#.#.#/##.##/#...#'],
  X: [1, '#..#/#..#/#..#/.##./#..#/#..#/#..#'],
  Y: [1, '#...#/#...#/.#.#./..#../..#../..#../..#..'],
  Z: [1, '####/...#/..#./.#../#.../#.../####'],
  a: [3, '.##./...#/.###/#..#/.###'],
  b: [1, '#.../#.../###./#..#/#..#/#..#/###.'],
  c: [3, '.##/#../#../#../.##'],
  d: [1, '...#/...#/.###/#..#/#..#/#..#/.###'],
  e: [3, '.##./#..#/####/#.../.###'],
  f: [1, '.##/#../###/#../#../#../#..'],
  g: [3, '.###/#..#/#..#/.###/...#/.##.'],
  h: [1, '#.../#.../###./#..#/#..#/#..#/#..#'],
  i: [1, '#/./#/#/#/#/#'],
  j: [1, '..#/.../..#/..#/..#/..#/..#/#.#/.#.'],
  k: [1, '#../#../#.#/#.#/##./#.#/#.#'],
  l: [1, '##/.#/.#/.#/.#/.#/.#'],
  m: [3, '####./#.#.#/#.#.#/#.#.#/#.#.#'],
  n: [3, '###./#..#/#..#/#..#/#..#'],
  o: [3, '.##./#..#/#..#/#..#/.##.'],
  p: [3, '###./#..#/#..#/#..#/###./#.../#...'],
  q: [3, '.###/#..#/#..#/#..#/.###/...#/...#'],
  r: [3, '#.#/##./#../#../#..'],
  s: [3, '.##/#../.#./..#/##.'],
  t: [2, '#../###/#../#../#../.##'],
  u: [3, '#..#/#..#/#..#/#..#/.###'],
  v: [3, '#.#/#.#/#.#/#.#/.#.'],
  w: [3, '#...#/#.#.#/#.#.#/#.#.#/.#.#.'],
  x: [3, '#.#/#.#/.#./#.#/#.#'],
  y: [3, '#..#/#..#/#..#/.###/...#/.##.'],
  z: [3, '###/..#/.#./#../###'],
  Ä: [0, '#..#/..../.##./#..#/####/#..#/#..#/#..#'],
  Ö: [0, '#..#/..../.##./#..#/#..#/#..#/#..#/.##.'],
  Ü: [0, '#..#/..../#..#/#..#/#..#/#..#/#..#/.##.'],
  ä: [1, '#..#/..../.##./...#/.###/#..#/.###'],
  ö: [1, '#..#/..../.##./#..#/#..#/#..#/.##.'],
  ü: [1, '#..#/..../#..#/#..#/#..#/#..#/.###'],
  ß: [1, '.##./#..#/#.#./#.#./#..#/#..#/#.#./#...'],
  '0': [1, '.##./#..#/#.##/#..#/##.#/#..#/.##.'],
  '1': [1, '.#./##./.#./.#./.#./.#./###'],
  '2': [1, '.##./#..#/...#/..#./.#../#.../####'],
  '3': [1, '###./...#/...#/.##./...#/...#/###.'],
  '4': [1, '#..#/#..#/#..#/####/...#/...#/...#'],
  '5': [1, '####/#.../###./...#/...#/#..#/.##.'],
  '6': [1, '.##./#.../#.../###./#..#/#..#/.##.'],
  '7': [1, '####/...#/..#./..#./.#../.#../.#..'],
  '8': [1, '.##./#..#/#..#/.##./#..#/#..#/.##.'],
  '9': [1, '.##./#..#/#..#/.###/...#/...#/.##.'],
  '.': [7, '#'],
  ',': [7, '#/#'],
  ':': [3, '#/././#/#'],
  ';': [3, '.#/../../.#/.#/#.'],
  '!': [1, '#/#/#/#/#/./#'],
  '?': [1, '.##./#..#/...#/..#./.#../..../.#..'],
  '-': [5, '###'],
  '–': [5, '#####'],
  _: [8, '####'],
  '+': [3, '.#./.#./###/.#./.#.'],
  '=': [4, '###/.../###'],
  '/': [1, '...#/...#/..#./..#./.#../.#../#...'],
  '\\': [1, '#.../.#../.#../..#./..#./...#/...#'],
  '(': [1, '.#/#./#./#./#./#./.#'],
  ')': [1, '#./.#/.#/.#/.#/.#/#.'],
  '[': [1, '##/#./#./#./#./#./##'],
  ']': [1, '##/.#/.#/.#/.#/.#/##'],
  "'": [1, '#/#'],
  '"': [1, '#.#/#.#'],
  '„': [7, '#.#/#.#'],
  '“': [1, '#.#/#.#'],
  '”': [1, '#.#/#.#'],
  '‚': [7, '#/#'],
  '‘': [1, '#/#'],
  '’': [1, '#/#'],
  '…': [7, '#.#.#'],
  '·': [4, '#'],
  '%': [1, '#..#/...#/..#./..#./.#../#.../#..#'],
  '&': [1, '.##./#..#/.##./.#../#.##/#..#/.###'],
  '#': [2, '.#.#./#####/.#.#./.#.#./#####/.#.#.'],
  '*': [2, '#.#/.#./#.#'],
  '<': [2, '..#/.#./#../.#./..#'],
  '>': [2, '#../.#./..#/.#./#..'],
  '$': [1, '.###/#.#./#.#./.###/..#.#/..#.#/####.'],
  '@': [1, '.###./#...#/#.###/#.#.#/#.###/#..../.###.'],
  '°': [1, '###/#.#/###'],
};

const CELL_H = 12; // 10 Rasterzeilen + 1 Pixel Rand oben/unten
const ATLAS_W = 256;

function rowsOf(pattern: string): string[] {
  return pattern.split('/');
}

/**
 * Baut den Schrift-Atlas: weiße Glyphen mit schwarzem Rand. Tint färbt nur das Weiß,
 * der Rand bleibt schwarz, sodass Text auf jedem Hintergrund lesbar bleibt.
 */
export function buildFont(pngPath: string, xmlPath: string): void {
  const entries = Object.entries(G);
  const layout: { char: string; x: number; y: number; w: number; adv: number }[] = [];
  let cx = 0;
  let cy = 0;
  for (const [char, [, pattern]] of entries) {
    const gw = Math.max(...rowsOf(pattern).map((r) => r.length));
    if (cx + gw + 3 > ATLAS_W) {
      cx = 0;
      cy += CELL_H + 1;
    }
    layout.push({ char, x: cx, y: cy, w: gw + 2, adv: char === ' ' ? 4 : gw + 1 });
    cx += gw + 3;
  }
  const canvas = new Canvas(ATLAS_W, cy + CELL_H + 1);
  const xmlChars: string[] = [];
  for (const item of layout) {
    const [top, pattern] = G[item.char];
    const rows = rowsOf(pattern);
    const isOn = (gx: number, gy: number): boolean => rows[gy]?.[gx] === '#';
    // Rand zuerst
    for (let gy = -1; gy <= rows.length; gy++) {
      for (let gx = -1; gx <= item.w - 2; gx++) {
        let near = false;
        for (let dy = -1; dy <= 1; dy++) {
          for (let dx = -1; dx <= 1; dx++) if (isOn(gx + dx, gy + dy)) near = true;
        }
        if (near) canvas.set(item.x + 1 + gx, item.y + 1 + top + gy, C.schwarz);
      }
    }
    rows.forEach((row, gy) => {
      [...row].forEach((ch, gx) => {
        if (ch === '#') canvas.set(item.x + 1 + gx, item.y + 1 + top + gy, C.weiss);
      });
    });
    xmlChars.push(
      `    <char id="${item.char.codePointAt(0)}" x="${item.x}" y="${item.y}" width="${item.w}" ` +
        `height="${CELL_H}" xoffset="-1" yoffset="-1" xadvance="${item.adv}" page="0" chnl="15"/>`,
    );
  }
  canvas.save(pngPath);
  const xml = `<?xml version="1.0"?>
<font>
  <info face="hv" size="10" bold="0" italic="0" charset="" unicode="1" stretchH="100" smooth="0" aa="0" padding="0,0,0,0" spacing="0,0"/>
  <common lineHeight="10" base="8" scaleW="${canvas.w}" scaleH="${canvas.h}" pages="1" packed="0"/>
  <pages><page id="0" file="font.png"/></pages>
  <chars count="${xmlChars.length}">
${xmlChars.join('\n')}
  </chars>
</font>
`;
  mkdirSync(dirname(xmlPath), { recursive: true });
  writeFileSync(xmlPath, xml, 'utf8');
}

/** Schreibt einen Eigennamen direkt ins Bild, z. B. auf Schilder. */
export function drawText(canvas: Canvas, text: string, x: number, y: number, color: number): void {
  let cx = x;
  for (const char of text) {
    const glyph = G[char];
    if (!glyph) continue;
    drawGlyph(canvas, char, cx, y + glyph[0], color);
    cx += Math.max(...rowsOf(glyph[1]).map((row) => row.length)) + 1;
  }
}

/** Zeichnet Text direkt ins Bild (für Buchstaben auf Platzhaltern). */
export function drawGlyph(canvas: Canvas, char: string, x: number, y: number, color: number): void {
  const glyph = G[char];
  if (!glyph) return;
  rowsOf(glyph[1]).forEach((row, gy) => {
    [...row].forEach((ch, gx) => {
      if (ch === '#') canvas.set(x + gx, y + gy, color);
    });
  });
}
