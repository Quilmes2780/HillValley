// Aus einem bearbeiteten Raumausschnitt ein Sprite gewinnen: Bild auf Spielauflösung bringen,
// mit dem Hintergrund vergleichen und nur geänderte Pixel im Zielrechteck behalten.
// node diffsprite.cjs <hintergrund> <cx,cy,cw,ch> <bearbeitet.png> <sx,sy,sw,sh> <schwelle> <aus.png> [filter]
// filter: "orange" behält nur orangene/weiße Pixel (Kabel)
const { PNG } = require('pngjs');
const fs = require('fs');
const [, , bgName, cropS, editFile, rectS, thr, out, filter] = process.argv;
const [cx, cy, cw, ch] = cropS.split(',').map(Number);
const [sx, sy, sw, sh] = rectS.split(',').map(Number);
const bg = PNG.sync.read(fs.readFileSync(`assets/backgrounds/${bgName}.png`));
const ed = PNG.sync.read(fs.readFileSync(editFile));
const fx = ed.width / cw, fy = ed.height / ch;
// Spielpixel = Median der inneren Hälfte der Zelle
const cell = (gx, gy) => {
  const cols = [];
  for (let y = Math.floor((gy + 0.25) * fy); y < Math.ceil((gy + 0.75) * fy); y++)
    for (let x = Math.floor((gx + 0.25) * fx); x < Math.ceil((gx + 0.75) * fx); x++) {
      const i = (y * ed.width + x) * 4; cols.push([ed.data[i], ed.data[i + 1], ed.data[i + 2]]);
    }
  const m = (c) => cols.map((k) => k[c]).sort((a, b) => a - b)[cols.length >> 1];
  return [m(0), m(1), m(2)];
};
const o = new PNG({ width: sw, height: sh });
let n = 0;
for (let y = 0; y < sh; y++) for (let x = 0; x < sw; x++) {
  const gx = sx + x, gy = sy + y;
  const e = cell(gx - cx, gy - cy);
  const b = (gy * bg.width + gx) * 4;
  const d = Math.abs(e[0] - bg.data[b]) + Math.abs(e[1] - bg.data[b + 1]) + Math.abs(e[2] - bg.data[b + 2]);
  let keep = d > Number(thr);
  if (filter === 'orange') keep = keep && ((e[0] > 150 && e[1] > 60 && e[1] < 150 && e[2] < 80) || (e[0] > 180 && e[1] > 180 && e[2] > 170) || (e[0] > 90 && e[1] < 70 && e[2] < 40));
  if (!keep) continue;
  const t = (y * sw + x) * 4; o.data[t] = e[0]; o.data[t + 1] = e[1]; o.data[t + 2] = e[2]; o.data[t + 3] = 255; n++;
}
fs.writeFileSync(out, PNG.sync.write(o));
console.log(out, sw + 'x' + sh, n, 'Pixel');
