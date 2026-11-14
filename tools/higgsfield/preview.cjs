// Vorschau: Streifen vergrößert auf grauem Grund, optional neben einer Vergleichsfigur.
// node preview.cjs <ausgabe.png> <zoom> <streifen.png> [streifen.png ...]
const { PNG } = require('pngjs');
const fs = require('fs');
const [, , out, zoom, ...files] = process.argv;
const Z = Number(zoom);
const imgs = files.map((f) => PNG.sync.read(fs.readFileSync(f)));
const W = Math.max(...imgs.map((p) => p.width)) * Z, H = imgs.reduce((s, p) => s + p.height + 2, 0) * Z;
const o = new PNG({ width: W, height: H });
for (let i = 0; i < o.data.length; i += 4) { o.data[i] = 112; o.data[i + 1] = 124; o.data[i + 2] = 112; o.data[i + 3] = 255; }
let top = 0;
for (const p of imgs) {
  for (let y = 0; y < p.height; y++) for (let x = 0; x < p.width; x++) {
    const s = (y * p.width + x) * 4; const line = x % 40 === 0 || y === p.height - 1;
    for (let dy = 0; dy < Z; dy++) for (let dx = 0; dx < Z; dx++) {
      const t = (((top + y) * Z + dy) * W + x * Z + dx) * 4;
      if (p.data[s + 3] > 127) { o.data[t] = p.data[s]; o.data[t + 1] = p.data[s + 1]; o.data[t + 2] = p.data[s + 2]; }
      else if (line) { o.data[t] = 190; o.data[t + 1] = 70; o.data[t + 2] = 70; }
    }
  }
  top += p.height + 2;
}
fs.writeFileSync(out, PNG.sync.write(o));
