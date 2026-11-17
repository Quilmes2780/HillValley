// Fahrzeug aus einem Higgsfield-Bild mit Magenta-Grund und mitgemaltem Boden ausschneiden:
// Alles über der Bodenkante bleibt, die Reifen werden unterhalb der Kante aus ihrer oberen Hälfte gespiegelt ergänzt.
// node wagen.cjs <bild.png> <bodenkante> <rad cx,cy,r[;cx,cy,r...]> <zielbreite> <aus.png> [x0,x1[,y0]]
// Mit x0,x1 wird waagerecht genau dieser Bereich genommen (gleicher Maßstab wie bei einer früheren Fassung).
const { PNG } = require('pngjs');
const fs = require('fs');
const [, , file, ftS, wheelsS, twS, out, fixS] = process.argv;
const p = PNG.sync.read(fs.readFileSync(file));
const W = p.width, H = p.height, d = p.data, FT = Number(ftS);
const wheels = wheelsS.split(';').map((s) => s.split(',').map(Number));
const mag = (r, g, b) => (r > 150 && b > 150 && g < 110) || (r - g > 60 && b - g > 60);
const src = (x, y) => {
  if (y < FT) { const i = (y * W + x) * 4; return mag(d[i], d[i + 1], d[i + 2]) ? null : [d[i], d[i + 1], d[i + 2]]; }
  for (const [cx, cy, r] of wheels) if ((x - cx) ** 2 + (y - cy) ** 2 <= r * r) { const my = 2 * cy - y; const i = (my * W + x) * 4; return [d[i], d[i + 1], d[i + 2]]; }
  return null;
};
let x0 = W, x1 = -1, y0 = H, y1 = -1;
for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) if (src(x, y)) { x0 = Math.min(x0, x); x1 = Math.max(x1, x); y0 = Math.min(y0, y); y1 = Math.max(y1, y); }
if (fixS) { const f = fixS.split(',').map(Number); [x0, x1] = f; if (f.length > 2) y0 = f[2]; }
const s = Number(twS) / (x1 - x0 + 1);
const OW = Number(twS), OH = Math.round((y1 - y0 + 1) * s);
const o = new PNG({ width: OW, height: OH });
const lum = (c) => c[0] * 0.3 + c[1] * 0.59 + c[2] * 0.11;
for (let oy = 0; oy < OH; oy++) for (let ox = 0; ox < OW; ox++) {
  const cols = []; let tot = 0;
  for (let y = Math.floor(y0 + oy / s); y < Math.min(y1 + 1, Math.ceil(y0 + (oy + 1) / s)); y++)
    for (let x = Math.floor(x0 + ox / s); x < Math.min(x1 + 1, Math.ceil(x0 + (ox + 1) / s)); x++) { tot++; const c = src(x, y); if (c) cols.push(c); }
  if (!tot || cols.length / tot < 0.5) continue;
  cols.sort((a, b) => lum(a) - lum(b));
  const m = cols[cols.length >> 1], t = (oy * OW + ox) * 4;
  o.data[t] = m[0]; o.data[t + 1] = m[1]; o.data[t + 2] = m[2]; o.data[t + 3] = 255;
}
fs.writeFileSync(out, PNG.sync.write(o));
console.log(out, OW + 'x' + OH, 'Ausschnitt', x0, y0, x1 - x0 + 1, y1 - y0 + 1, 'Maßstab', s);
