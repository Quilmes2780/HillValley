// Kopf von Frame 0 (vorn) und 1 (Seite) als Zeichenraster ausgeben: node face.cjs <streifen.png> <y0> <y1>
const { PNG } = require('pngjs');
const fs = require('fs');
const [, , file, y0, y1] = process.argv;
const p = PNG.sync.read(fs.readFileSync(file));
const map = new Map(); const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
for (const f of [0, 1]) {
  console.log('Frame', f, '(x 6..33)');
  for (let y = Number(y0); y <= Number(y1); y++) {
    let s = '';
    for (let x = 6; x < 34; x++) {
      const i = (y * p.width + f * 40 + x) * 4;
      if (!p.data[i + 3]) { s += '.'; continue; }
      const k = [p.data[i], p.data[i + 1], p.data[i + 2]].join(',');
      if (!map.has(k)) map.set(k, chars[map.size]);
      s += map.get(k);
    }
    console.log(String(y).padStart(2), s);
  }
}
console.log([...map].map(([k, v]) => `${v}=${k}`).join(' '));
