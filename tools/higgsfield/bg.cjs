// Neu gezeichneten Hintergrund auf 320×144 bringen und mit dem alten vergleichen.
// node bg.cjs <neu.png> <alt.png> <aus.png> [pad=8]
// Das Bild wird auf (320+2*pad)×144 verkleinert (Median je Zelle), dann wird der Rand abgeschnitten.
// Danach wird die beste Verschiebung gegenüber dem alten Bild gesucht und gemeldet (nicht angewandt).
const { PNG } = require('pngjs');
const fs = require('fs');
const [, , neu, alt, out, padS] = process.argv;
const pad = Number(padS ?? 8);
const p = PNG.sync.read(fs.readFileSync(neu));
const a = PNG.sync.read(fs.readFileSync(alt));
const W = 320 + 2 * pad, H = 144, fx = p.width / W, fy = p.height / H;
const o = new PNG({ width: 320, height: 144 });
for (let gy = 0; gy < H; gy++) for (let gx = pad; gx < pad + 320; gx++) {
  const cols = [];
  for (let y = Math.floor((gy + 0.2) * fy); y < Math.ceil((gy + 0.8) * fy); y++)
    for (let x = Math.floor((gx + 0.2) * fx); x < Math.ceil((gx + 0.8) * fx); x++) { const i = (y * p.width + x) * 4; cols.push([p.data[i], p.data[i + 1], p.data[i + 2]]); }
  const m = (c) => cols.map((k) => k[c]).sort((u, v) => u - v)[cols.length >> 1];
  const t = (gy * 320 + gx - pad) * 4; o.data[t] = m(0); o.data[t + 1] = m(1); o.data[t + 2] = m(2); o.data[t + 3] = 255;
}
fs.writeFileSync(out, PNG.sync.write(o));
// Kanten beider Bilder vergleichen, Verschiebung ±6 Pixel
const edge = (img) => { const e = new Float32Array(320 * 144); const L = (x, y) => { const i = (y * img.width + x) * 4; return img.data[i] * 0.3 + img.data[i + 1] * 0.59 + img.data[i + 2] * 0.11; };
  for (let y = 1; y < 143; y++) for (let x = 1; x < 319; x++) e[y * 320 + x] = Math.abs(L(x + 1, y) - L(x - 1, y)) + Math.abs(L(x, y + 1) - L(x, y - 1)); return e; };
const ea = edge(a), eo = edge(o);
let best = [0, 0, -1];
for (let dy = -6; dy <= 6; dy++) for (let dx = -6; dx <= 6; dx++) {
  let s = 0; for (let y = 8; y < 136; y++) for (let x = 8; x < 312; x++) s += ea[y * 320 + x] * eo[(y + dy) * 320 + x + dx];
  if (s > best[2]) best = [dx, dy, s];
}
console.log(out, 'beste Verschiebung neu gegenüber alt: dx', best[0], 'dy', best[1]);
