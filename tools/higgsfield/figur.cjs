// Einen zusammengesetzten Streifen (Reihenfolge wie unten) in die zehn Figurendateien zerlegen,
// Augen, Blinzeln und Mundbewegung nach einer Gesichtsbeschreibung setzen.
// node figur.cjs <streifen.png> <konfig.json> <ausgabeordner>
// Streifen: 0 vorn, 1 Seite, 2 hinten, 3–10 Gehen Seite, 11–14 Gehen vorn, 15–18 Gehen hinten, 19–22 Bücken
// Konfig: { name, eyeColor, lidColor, lipColor, openColor, front: { eyes, mouth, talk: [[...],[...],[...]] },
//           side: { ...gleich }, portrait: [x0, y0], portraitBg }
const { PNG } = require('pngjs');
const fs = require('fs');
const [, , file, cfgFile, OUT] = process.argv;
const src = PNG.sync.read(fs.readFileSync(file));
const cfg = JSON.parse(fs.readFileSync(cfgFile));
const frame = (i) => { const f = new PNG({ width: 40, height: 72 }); for (let y = 0; y < 72; y++) for (let x = 0; x < 40; x++) { const s = (y * src.width + i * 40 + x) * 4, t = (y * 40 + x) * 4; for (let c = 0; c < 4; c++) f.data[t + c] = src.data[s + c]; } return f; };
const set = (f, pts, col) => { for (const [x, y] of pts || []) { const t = (y * f.width + x) * 4; f.data[t] = col[0]; f.data[t + 1] = col[1]; f.data[t + 2] = col[2]; f.data[t + 3] = 255; } return f; };
const copy = (f) => { const g = new PNG({ width: f.width, height: f.height }); f.data.copy(g.data); return g; };
const strip = (frames, anim) => {
  const o = new PNG({ width: 40 * frames.length, height: 72 });
  frames.forEach((f, i) => { for (let y = 0; y < 72; y++) for (let x = 0; x < 40; x++) { const s = (y * 40 + x) * 4, t = (y * o.width + i * 40 + x) * 4; for (let c = 0; c < 4; c++) o.data[t + c] = f.data[s + c]; } });
  fs.writeFileSync(`${OUT}/${cfg.name}_${anim}.png`, PNG.sync.write(o));
};
const view = (idx, v) => {
  const base = set(set(frame(idx), v.eyes, cfg.eyeColor), v.mouth, cfg.lipColor);
  const blink = set(copy(base), v.eyes, cfg.lidColor);
  const talk = [base, ...v.talk.map((pts) => set(copy(base), pts, cfg.openColor))];
  return { base, blink, talk };
};
const fr = view(0, cfg.front), sd = view(1, cfg.side);
strip([...Array(8).fill(fr.base), fr.blink, ...Array(3).fill(fr.base)], 'idle');
strip([...Array(8).fill(sd.base), sd.blink, ...Array(3).fill(sd.base)], 'idle_side');
strip(fr.talk, 'talk_front');
strip(sd.talk, 'talk_side');
strip([frame(2)], 'idle_back');
strip([3, 4, 5, 6, 7, 8, 9, 10].map(frame), 'walk_side');
strip([11, 12, 13, 14].map(frame), 'walk_front');
strip([15, 16, 17, 18].map(frame), 'walk_back');
strip([sd.base, ...[20, 21, 22].map(frame)], 'pickup');
const por = new PNG({ width: 22, height: 13 }); const [px, py] = cfg.portrait; const bg = cfg.portraitBg || [26, 24, 34];
for (let y = 0; y < 13; y++) for (let x = 0; x < 22; x++) {
  const s = ((y + py) * 40 + x + px) * 4, t = (y * 22 + x) * 4; const a = fr.base.data[s + 3];
  for (let c = 0; c < 3; c++) por.data[t + c] = a ? fr.base.data[s + c] : bg[c]; por.data[t + 3] = 255;
}
fs.writeFileSync(`${OUT}/${cfg.name}_portrait.png`, PNG.sync.write(por));
console.log('fertig', cfg.name);
