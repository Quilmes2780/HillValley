// Gegenstand aus einer bearbeiteten Raumfassung gewinnen: geänderte Pixel im Suchrechteck behalten,
// einzelne Ausreißer entfernen, auf den Inhalt zuschneiden und die Lage im Raum melden.
// node cut.cjs <hintergrund> <cx,cy,cw,ch> <bearbeitet.png> <sx,sy,sw,sh> <schwelle> <aus.png> [zielhöhe]
// Mit zielhöhe wird das Ergebnis (Seitenverhältnis bleibt) auf diese Höhe verkleinert.
const { PNG } = require('pngjs');
const fs = require('fs');
const [, , bgName, cropS, editFile, rectS, thr, out, hS] = process.argv;
const [cx, cy, cw, ch] = cropS.split(',').map(Number);
const [sx, sy, sw, sh] = rectS.split(',').map(Number);
const bg = PNG.sync.read(fs.readFileSync(`assets/backgrounds/${bgName}.png`));
const ed = PNG.sync.read(fs.readFileSync(editFile));
const fx = ed.width / cw, fy = ed.height / ch;
const cell = (gx, gy, a = 0.25, b = 0.75) => {
  const cols = [];
  for (let y = Math.floor((gy + a) * fy); y < Math.ceil((gy + b) * fy); y++)
    for (let x = Math.floor((gx + a) * fx); x < Math.ceil((gx + b) * fx); x++) {
      const i = (y * ed.width + x) * 4; cols.push([ed.data[i], ed.data[i + 1], ed.data[i + 2]]);
    }
  const m = (c) => cols.map((k) => k[c]).sort((u, v) => u - v)[cols.length >> 1];
  return [m(0), m(1), m(2)];
};
const keep = new Uint8Array(sw * sh), col = [];
for (let y = 0; y < sh; y++) for (let x = 0; x < sw; x++) {
  const gx = sx + x, gy = sy + y, e = cell(gx - cx, gy - cy), b = (gy * bg.width + gx) * 4;
  const d = Math.abs(e[0] - bg.data[b]) + Math.abs(e[1] - bg.data[b + 1]) + Math.abs(e[2] - bg.data[b + 2]);
  col[y * sw + x] = e; keep[y * sw + x] = d > Number(thr) ? 1 : 0;
}
// Ausreißer: weniger als zwei behaltene Nachbarn
const k2 = keep.slice();
for (let y = 0; y < sh; y++) for (let x = 0; x < sw; x++) {
  if (!keep[y * sw + x]) continue;
  let n = 0;
  for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) if ((dx || dy) && keep[(y + dy) * sw + x + dx] && x + dx >= 0 && x + dx < sw && y + dy >= 0 && y + dy < sh) n++;
  if (n < 2) k2[y * sw + x] = 0;
}
// Kleine zusammenhängende Flecken (weniger als MIN Pixel, Vorgabe 12) verwerfen
const MIN = Number(process.env.MIN || 12), seen = new Uint8Array(sw * sh);
for (let i = 0; i < sw * sh; i++) {
  if (!k2[i] || seen[i]) continue;
  const comp = [i]; seen[i] = 1;
  for (let j = 0; j < comp.length; j++) {
    const x = comp[j] % sw, y = (comp[j] / sw) | 0;
    for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) {
      const X = x + dx, Y = y + dy, q = Y * sw + X;
      if (X >= 0 && X < sw && Y >= 0 && Y < sh && k2[q] && !seen[q]) { seen[q] = 1; comp.push(q); }
    }
  }
  if (comp.length < MIN) for (const q of comp) k2[q] = 0;
}
let x0 = sw, y0 = sh, x1 = -1, y1 = -1;
for (let y = 0; y < sh; y++) for (let x = 0; x < sw; x++) if (k2[y * sw + x]) { x0 = Math.min(x0, x); y0 = Math.min(y0, y); x1 = Math.max(x1, x); y1 = Math.max(y1, y); }
if (x1 < 0) { console.log(out, 'leer'); process.exit(1); }
const W = x1 - x0 + 1, H = y1 - y0 + 1;
const s = hS ? Number(hS) / H : 1;
const OW = Math.max(1, Math.round(W * s)), OH = Math.max(1, Math.round(H * s));
const o = new PNG({ width: OW, height: OH });
for (let y = 0; y < OH; y++) for (let x = 0; x < OW; x++) {
  // Quelle: Mehrheitsentscheid über die abgedeckten Spielpixel
  const ax = x0 + Math.floor(x / s), bx = Math.max(ax + 1, x0 + Math.floor((x + 1) / s));
  const ay = y0 + Math.floor(y / s), by = Math.max(ay + 1, y0 + Math.floor((y + 1) / s));
  const cs = []; let tot = 0;
  for (let yy = ay; yy < by; yy++) for (let xx = ax; xx < bx; xx++) { tot++; if (k2[yy * sw + xx]) cs.push(col[yy * sw + xx]); }
  if (cs.length < tot * 0.5) continue;
  cs.sort((p, q) => p[0] + p[1] + p[2] - (q[0] + q[1] + q[2]));
  const m = cs[cs.length >> 1], t = (y * OW + x) * 4;
  o.data[t] = m[0]; o.data[t + 1] = m[1]; o.data[t + 2] = m[2]; o.data[t + 3] = 255;
}
fs.writeFileSync(out, PNG.sync.write(o));
console.log(out, 'x', sx + x0, 'y', sy + y0, 'w', W, 'h', H, hS ? `→ ${OW}x${OH}` : '');
