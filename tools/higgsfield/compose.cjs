// Figuren-JSONs gemeinsam auf eine Palette bringen und als Frames 40×72 in einen Streifen legen.
// node compose.cjs <ausgabe.png> <farben> <json> [json ...]
// Ein JSON-Pfad mit Anhang "@dx" verschiebt die Figur waagerecht.
const { PNG } = require('pngjs');
const fs = require('fs');
const [, , out, ncol, ...files] = process.argv;
const figs = files.map((f) => { const [pa, mode] = f.split('#'); const [path, dx] = pa.split('@'); return { ...JSON.parse(fs.readFileSync(path)), dx: Number(dx || 0), mode: mode || 'box' }; });
// Palette: k-means über alle deckenden Pixel
const all = figs.flatMap((f) => f.px.filter((p) => p[3]));
const K = Number(ncol);
let cent = []; const step = Math.max(1, Math.floor(all.length / K));
const sorted = [...all].sort((a, b) => (a[0] + a[1] + a[2]) - (b[0] + b[1] + b[2]));
for (let i = 0; i < K; i++) cent.push([...sorted[Math.min(sorted.length - 1, i * step + (step >> 1))]]);
const near = (c) => { let bi = 0, bd = 1e9; cent.forEach((k, i) => { const dd = (c[0] - k[0]) ** 2 * 3 + (c[1] - k[1]) ** 2 * 4 + (c[2] - k[2]) ** 2 * 2; if (dd < bd) { bd = dd; bi = i; } }); return bi; };
for (let it = 0; it < 12; it++) {
  const acc = cent.map(() => [0, 0, 0, 0]);
  for (const c of all) { const i = near(c); acc[i][0] += c[0]; acc[i][1] += c[1]; acc[i][2] += c[2]; acc[i][3]++; }
  cent = cent.map((k, i) => (acc[i][3] ? [acc[i][0] / acc[i][3], acc[i][1] / acc[i][3], acc[i][2] / acc[i][3]] : k));
}
cent = cent.map((k) => k.map(Math.round));
const png = new PNG({ width: 40 * figs.length, height: 72 });
figs.forEach((f, fi) => {
  // unterste Zeile mit Inhalt auf y = 71, Mitte der Box auf x = 20
  let bottom = 0; for (let y = 0; y < f.h; y++) for (let x = 0; x < f.w; x++) if (f.px[y * f.w + x][3]) bottom = y;
  const rowsCenter = (y0, y1) => { let s = 0, n = 0; for (let y = Math.max(0, y0); y <= Math.min(f.h - 1, y1); y++) for (let x = 0; x < f.w; x++) if (f.px[y * f.w + x][3]) { s += x; n++; } return n ? s / n : f.w / 2; };
  let top = f.h; for (let y = 0; y < f.h && top === f.h; y++) for (let x = 0; x < f.w; x++) if (f.px[y * f.w + x][3]) { top = y; break; }
  const cx = f.mode === 'head' ? rowsCenter(top, top + 14) : f.mode === 'feet' ? rowsCenter(bottom - 3, bottom) : f.w / 2;
  const oy = 71 - bottom, ox = 20 - Math.round(cx) + f.dx;
  for (let y = 0; y < f.h; y++) for (let x = 0; x < f.w; x++) {
    const c = f.px[y * f.w + x]; if (!c[3]) continue;
    const X = ox + x, Y = oy + y; if (X < 0 || X >= 40 || Y < 0 || Y >= 72) continue;
    const k = cent[near(c)]; const i = (Y * png.width + fi * 40 + X) * 4;
    png.data[i] = k[0]; png.data[i + 1] = k[1]; png.data[i + 2] = k[2]; png.data[i + 3] = 255;
  }
});
fs.writeFileSync(out, PNG.sync.write(png));
console.log('geschrieben', out, figs.map((f) => f.w + 'x' + f.h).join(' '));
