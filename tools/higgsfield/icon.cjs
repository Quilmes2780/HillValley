// Gegenstand auf Magenta in ein Bild fester Größe einpassen (Seitenverhältnis bleibt, mittig, transparent).
// node icon.cjs <bild> <suchrechteck x0,y0,x1,y1 als Anteile> <rahmenB,rahmenH> <maxB,maxH> <aus.png>
const { PNG } = require('pngjs');
const fs = require('fs');
const [, , file, rectS, frameS, maxS, out] = process.argv;
const p = PNG.sync.read(fs.readFileSync(file));
const [a0, b0, a1, b1] = rectS.split(',').map(Number);
const X0 = Math.round(a0 * p.width), Y0 = Math.round(b0 * p.height), X1 = Math.round(a1 * p.width), Y1 = Math.round(b1 * p.height);
const [FW, FH] = frameS.split(',').map(Number), [MW, MH] = maxS.split(',').map(Number);
const px = (x, y) => { const i = (y * p.width + x) * 4; return [p.data[i], p.data[i + 1], p.data[i + 2]]; };
const mag = ([r, g, b]) => r > 150 && b > 150 && g < 110;
let x0 = 1e9, y0 = 1e9, x1 = -1, y1 = -1;
for (let y = Y0; y < Y1; y++) for (let x = X0; x < X1; x++) if (!mag(px(x, y))) { x0 = Math.min(x0, x); y0 = Math.min(y0, y); x1 = Math.max(x1, x); y1 = Math.max(y1, y); }
const bw = x1 - x0 + 1, bh = y1 - y0 + 1; const s = Math.min(MW / bw, MH / bh);
const W = Math.max(1, Math.round(bw * s)), H = Math.max(1, Math.round(bh * s));
const ox = Math.floor((FW - W) / 2), oy = Math.floor((FH - H) / 2);
const o = new PNG({ width: FW, height: FH });
for (let gy = 0; gy < H; gy++) for (let gx = 0; gx < W; gx++) {
  const cols = []; let tot = 0;
  for (let y = Math.floor(y0 + gy / s); y < Math.floor(y0 + (gy + 1) / s); y++) for (let x = Math.floor(x0 + gx / s); x < Math.floor(x0 + (gx + 1) / s); x++) { tot++; const c = px(x, y); if (!mag(c)) cols.push(c); }
  if (cols.length < tot * 0.45) continue;
  cols.sort((a, b) => a[0] + a[1] + a[2] - (b[0] + b[1] + b[2]));
  const dark = cols.filter((c) => c[0] + c[1] + c[2] < 150);
  const m = dark.length > cols.length * 0.35 ? dark[dark.length >> 1] : cols[cols.length >> 1];
  const t = ((oy + gy) * FW + ox + gx) * 4; o.data[t] = m[0]; o.data[t + 1] = m[1]; o.data[t + 2] = m[2]; o.data[t + 3] = 255;
}
fs.writeFileSync(out, PNG.sync.write(o));
console.log(out, W + 'x' + H);
