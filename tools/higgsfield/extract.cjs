// Higgsfield-Bilder in Spielfiguren umwandeln: extract.cjs schneidet aus, compose.cjs legt Frames mit gemeinsamer Palette an, preview.cjs zeigt sie vergrößert.
// Figuren aus einem KI-Bild mit einfarbigem Hintergrund ausschneiden und auf Spielgröße bringen.
// node extract.cjs <bild.png> <zielhoehe> <ausgabe-präfix>
// Schreibt <präfix>_<n>.json mit {w,h,px:[[r,g,b,a]...]} je Figur (von links nach rechts), noch ohne Palette.
const { PNG } = require('pngjs');
const fs = require('fs');
const [, , file, targetH, prefix] = process.argv;
const p = PNG.sync.read(fs.readFileSync(file));
const W = p.width, H = p.height, d = p.data;
// Hintergrundfarbe: Median der Ecken
const corners = [[5, 5], [W - 6, 5], [5, H - 6], [W - 6, H - 6]].map(([x, y]) => { const i = (y * W + x) * 4; return [d[i], d[i + 1], d[i + 2]]; });
const bg = [0, 1, 2].map((c) => corners.map((k) => k[c]).sort((a, b) => a - b)[1]);
const fg = new Uint8Array(W * H);
for (let i = 0; i < W * H; i++) {
  const r = d[i * 4], g = d[i * 4 + 1], b = d[i * 4 + 2];
  const dist = Math.abs(r - bg[0]) + Math.abs(g - bg[1]) + Math.abs(b - bg[2]);
  // Magenta-artige Töne (r und b hoch, g niedrig) gehören zum Hintergrund
  const magenta = r > 120 && b > 80 && g < r * 0.55 && g < b * 0.75;
  fg[i] = dist > 90 && !magenta ? 1 : 0;
}
// Bodenlinien entfernen: Zeilen mit einem durchgehenden Lauf über mehr als 30 % der Breite
for (let y = 0; y < H; y++) { let run = 0, best = 0; for (let x = 0; x < W; x++) { run = fg[y * W + x] ? run + 1 : 0; best = Math.max(best, run); } if (best > W * 0.3) for (let x = 0; x < W; x++) fg[y * W + x] = 0; }
// Zusammenhängende Bereiche finden, kleine verwerfen
const lab = new Int32Array(W * H).fill(-1);
const comps = [];
for (let s = 0; s < W * H; s++) {
  if (!fg[s] || lab[s] >= 0) continue;
  const id = comps.length; const st = [s]; lab[s] = id;
  let n = 0, x0 = W, x1 = 0, y0 = H, y1 = 0;
  while (st.length) {
    const q = st.pop(); n++; const x = q % W, y = (q / W) | 0;
    x0 = Math.min(x0, x); x1 = Math.max(x1, x); y0 = Math.min(y0, y); y1 = Math.max(y1, y);
    for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
      const nx = x + dx, ny = y + dy; if (nx < 0 || ny < 0 || nx >= W || ny >= H) continue;
      const k = ny * W + nx; if (fg[k] && lab[k] < 0) { lab[k] = id; st.push(k); }
    }
  }
  comps.push({ id, n, x0, x1, y0, y1 });
}
// Figuren = große Bereiche; dünne, breite Linien (Bodenlinie) und Schrift verwerfen
const figs = comps.filter((c) => c.n > W * H * 0.01 && (c.y1 - c.y0) > H * 0.3).sort((a, b) => (Math.abs(a.y1 - b.y1) > H * 0.15 ? a.y1 - b.y1 : a.x0 - b.x0));
const scale = Number(targetH) / Math.max(...figs.map((f) => f.y1 - f.y0 + 1));
figs.forEach((f, fi) => {
  // Kleine abgetrennte Teile (z. B. Mützenabzeichen) in der Box mitnehmen
  const keep = new Set(comps.filter((c) => c.x0 >= f.x0 - 5 && c.x1 <= f.x1 + 5 && c.y0 >= f.y0 - 5 && c.y1 <= f.y1 + 5 && c.n > 30).map((c) => c.id));
  const ow = Math.ceil((f.x1 - f.x0 + 1) * scale), oh = Math.ceil((f.y1 - f.y0 + 1) * scale);
  const px = [];
  for (let oy = 0; oy < oh; oy++) for (let ox = 0; ox < ow; ox++) {
    const sx0 = f.x0 + ox / scale, sx1 = f.x0 + (ox + 1) / scale, sy0 = f.y0 + oy / scale, sy1 = f.y0 + (oy + 1) / scale;
    let tot = 0, cnt = 0, r = 0, g = 0, b = 0; const cols = [];
    for (let y = Math.floor(sy0); y < Math.ceil(sy1); y++) for (let x = Math.floor(sx0); x < Math.ceil(sx1); x++) {
      if (x > f.x1 || y > f.y1) continue; tot++;
      const k = y * W + x; if (!fg[k] || !keep.has(lab[k])) continue; cnt++;
      cols.push([d[k * 4], d[k * 4 + 1], d[k * 4 + 2]]);
    }
    if (!tot || cnt / tot < 0.45) { px.push([0, 0, 0, 0]); continue; }
    // Median statt Mittelwert: hält Kanten und Konturen hart
    const lum = (c) => c[0] * 0.3 + c[1] * 0.59 + c[2] * 0.11;
    cols.sort((a, b2) => lum(a) - lum(b2));
    // dunkle Kontur bevorzugen, wenn sie einen guten Teil der Zelle füllt
    const dark = cols.filter((c) => lum(c) < 40);
    const m = dark.length > cols.length * 0.35 ? dark[dark.length >> 1] : cols[cols.length >> 1];
    px.push([m[0], m[1], m[2], 255]);
  }
  fs.writeFileSync(`${prefix}_${fi}.json`, JSON.stringify({ w: ow, h: oh, px }));
  console.log('Figur', fi, 'Box', f.x0, f.y0, f.x1 - f.x0 + 1, f.y1 - f.y0 + 1, '->', ow, 'x', oh);
});
