// Gegenstand aus einem Bild schneiden und auf Spielgröße bringen.
// node cutobj.cjs <bild> <suchrechteck x0,y0,x1,y1 als Anteile 0..1> <maske> <breite,höhe> <aus.png> [rand]
// maske: green | orange | light | red | all ; Pixel der Maske bestimmen den Rahmen.
// Bei "orange" bleiben nur Maskenpixel (plus dunkle Kontur daneben), sonst der ganze Rahmen.
const { PNG } = require('pngjs');
const fs = require('fs');
const [, , file, rectS, mode, sizeS, out, padS] = process.argv;
const p = PNG.sync.read(fs.readFileSync(file));
const [a0, b0, a1, b1] = rectS.split(',').map(Number);
const X0 = Math.round(a0 * p.width), Y0 = Math.round(b0 * p.height), X1 = Math.round(a1 * p.width), Y1 = Math.round(b1 * p.height);
const [W, H] = sizeS.split(',').map(Number);
const pad = Number(padS || 0);
const px = (x, y) => { const i = (y * p.width + x) * 4; return [p.data[i], p.data[i + 1], p.data[i + 2]]; };
const test = {
  green: ([r, g, b]) => g > r + 50 && g > b + 30,
  orange: ([r, g, b]) => (r > 170 && g > 70 && g < 170 && b < 110) || (r > 200 && g > 200 && b > 190),
  light: ([r, g, b]) => r > 200 && g > 190 && b > 160,
  red: ([r, g, b]) => r > 170 && g < 90 && b < 90,
  all: () => true,
}[mode];
let x0 = 1e9, y0 = 1e9, x1 = -1, y1 = -1;
for (let y = Y0; y < Y1; y++) for (let x = X0; x < X1; x++) if (test(px(x, y))) { x0 = Math.min(x0, x); y0 = Math.min(y0, y); x1 = Math.max(x1, x); y1 = Math.max(y1, y); }
x0 = Math.max(0, x0 - pad); y0 = Math.max(0, y0 - pad); x1 = Math.min(p.width - 1, x1 + pad); y1 = Math.min(p.height - 1, y1 + pad);
const fx = (x1 - x0 + 1) / W, fy = (y1 - y0 + 1) / H;
const o = new PNG({ width: W, height: H });
for (let gy = 0; gy < H; gy++) for (let gx = 0; gx < W; gx++) {
  const cols = []; let hit = 0, tot = 0;
  for (let y = Math.floor(y0 + gy * fy); y < Math.floor(y0 + (gy + 1) * fy); y++) for (let x = Math.floor(x0 + gx * fx); x < Math.floor(x0 + (gx + 1) * fx); x++) {
    const c = px(x, y); tot++; const lum = c[0] + c[1] + c[2];
    if (mode !== 'orange' || test(c) || (lum < 150 && c[2] < c[0] + 10)) { cols.push(c); if (mode !== 'orange' || test(c)) hit++; }
  }
  if (mode === 'orange' && hit < tot * 0.25) continue;
  if (!cols.length) continue;
  cols.sort((a, b) => a[0] + a[1] + a[2] - (b[0] + b[1] + b[2]));
  const m = cols[cols.length >> 1]; const t = (gy * W + gx) * 4;
  o.data[t] = m[0]; o.data[t + 1] = m[1]; o.data[t + 2] = m[2]; o.data[t + 3] = 255;
}
fs.writeFileSync(out, PNG.sync.write(o));
console.log(out, 'Rahmen', x0, y0, x1, y1);
