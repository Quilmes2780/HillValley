// Baut das Lösungsbuch als PDF aus LOESUNGSBUCH.md, den Spielbildern und den Aufnahmen aus screens.cjs.
// node tools/loesungsbuch/build.cjs   → Loesungsbuch.pdf im Projektordner
const { chromium } = require('playwright');
const { PNG } = require('pngjs');
const fs = require('fs');
const path = require('path');
const { pathToFileURL } = require('url');

const ROOT = path.join(__dirname, '..', '..');
const SCREENS = path.join(__dirname, '.screens');
const BUILD = path.join(__dirname, '.build');
fs.mkdirSync(BUILD, { recursive: true });
const de = require(path.join(ROOT, 'src/i18n/de.json'));

// ---------- Bilder: kleine Pixelbilder hart vergrößern, damit sie im PDF scharf bleiben ----------
const read = (f) => PNG.sync.read(fs.readFileSync(f));
function scaled(src, factor, name, crop) {
  const out = path.join(BUILD, name);
  const p = read(src);
  const [cx, cy, cw, ch] = crop || [0, 0, p.width, p.height];
  const o = new PNG({ width: cw * factor, height: ch * factor });
  for (let y = 0; y < o.height; y++)
    for (let x = 0; x < o.width; x++) {
      const s = ((cy + Math.floor(y / factor)) * p.width + cx + Math.floor(x / factor)) * 4;
      const t = (y * o.width + x) * 4;
      p.data.copy(o.data, t, s, s + 4);
    }
  fs.writeFileSync(out, PNG.sync.write(o));
  return pathToFileURL(out).href;
}
const asset = (rel) => path.join(ROOT, 'assets', rel);
const item = (id) => scaled(asset(`items/${id}.png`), 6, `item_${id}.png`);
const figur = (id) => {
  const f = asset(`characters/${id}/${id}_idle.png`);
  const p = read(f);
  // erstes Bild, seitlich auf die Figur zugeschnitten
  let x0 = 40, x1 = 0;
  for (let y = 0; y < p.height; y++)
    for (let x = 0; x < 40; x++)
      if (p.data[(y * p.width + x) * 4 + 3]) { x0 = Math.min(x0, x); x1 = Math.max(x1, x); }
  return { src: scaled(f, 6, `fig_${id}.png`, [x0, 0, x1 - x0 + 1, p.height]), h: p.height };
};
const portrait = (id) => scaled(asset(`characters/${id}/${id}_portrait.png`), 10, `por_${id}.png`);
// Nur die Szene (320×144 Spielpixel, viermal vergrößert), ohne Bedienleiste
const shot = (name) => scaled(path.join(SCREENS, `${name}.png`), 1, `shot_${name}.png`, [0, 0, 1280, 576]);
const ROOM = (id) => de.room[id] || id;

// ---------- Text aus LOESUNGSBUCH.md ----------
const md = fs.readFileSync(path.join(ROOT, 'LOESUNGSBUCH.md'), 'utf8').replace(/\r/g, '');
const sections = {};
for (const part of md.split(/\n## /).slice(1)) {
  const nl = part.indexOf('\n');
  sections[part.slice(0, nl).trim()] = part.slice(nl + 1).replace(/\n---\s*$/m, '').trim();
}
const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const VERBS = ['Gib', 'Öffne', 'Schließe', 'Nimm', 'Schau an', 'Rede mit', 'Benutze', 'Drücke', 'Ziehe', 'Gehe zu'];
function inline(s) {
  s = esc(s);
  s = s.replace(/^\*\*([^*]+?):\*\*\s*/, '<span class="ort">$1</span> ');
  s = s.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
  s = s.replace(/\*([^*]+?)\*/g, (m, w) => (VERBS.includes(w) ? `<span class="verb">${w}</span>` : `<em>${w}</em>`));
  s = s.replace(/„([^“]+)“/g, '„<span class="zitat">$1</span>“');
  s = s.replace(/ → /g, ' <span class="pfeil">→</span> ');
  return s;
}

// Zerlegt einen Kapitelabschnitt in Kopfdaten, Unterabschnitte (### …) und deren Blöcke.
function parseChapter(text) {
  const head = [];
  const subs = [];
  let cur = null;
  const lines = text.split('\n');
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (!line.trim()) continue;
    if (line.startsWith('### ')) {
      cur = { title: line.slice(4).trim(), blocks: [] };
      subs.push(cur);
      continue;
    }
    if (!cur && /^(\*\*[^*]+:\*\*|\*Wege:\*)/.test(line)) {
      head.push(line);
      continue;
    }
    if (!cur) {
      cur = { title: null, blocks: [] };
      subs.push(cur);
    }
    const num = line.match(/^(\d+)\.\s+(.*)$/);
    if (num) {
      const step = { n: Number(num[1]), text: num[2], extra: [] };
      while (i + 1 < lines.length && /^\s{2,}\S/.test(lines[i + 1])) step.extra.push(lines[++i].trim());
      cur.blocks.push({ type: 'step', ...step });
    } else if (line.startsWith('>')) {
      const q = [line.replace(/^>\s?/, '')];
      while (i + 1 < lines.length && lines[i + 1].startsWith('>')) q.push(lines[++i].replace(/^>\s?/, ''));
      cur.blocks.push({ type: 'note', lines: q.filter((l) => l.trim()) });
    } else if (line.startsWith('- ')) {
      const items = [line.slice(2)];
      while (i + 1 < lines.length && lines[i + 1].startsWith('- ')) items.push(lines[++i].slice(2));
      cur.blocks.push({ type: 'list', items });
    } else {
      cur.blocks.push({ type: 'para', text: line });
    }
  }
  return { head, subs };
}

function table(text) {
  const rows = text.split('\n').filter((l) => l.startsWith('|')).map((l) => l.split('|').slice(1, -1).map((c) => c.trim()));
  return { head: rows[0], rows: rows.slice(2) };
}

// ---------- Kapitel ----------
const ERA = {
  prolog: { cls: 'e1986', jahr: '1986' },
  k1: { cls: 'e1986t', jahr: '1986' },
  k2: { cls: 'e1955', jahr: '1955' },
  k3: { cls: 'e1885', jahr: '1885' },
  k4: { cls: 'e1986', jahr: '1986' },
  k5: { cls: 'e2015', jahr: '2015' },
  epilog: { cls: 'e2015', jahr: '2015 / 1986' },
};
const CHAPTERS = [
  { key: 'prolog', md: 'Prolog', label: 'Prolog', title: 'Ein ganz normaler Morgen', who: ['marty'], opener: 'p_zimmer',
    figs: { _: [['p_kueche', 'kueche', 1986], ['p_labor', 'docs_labor', 1986]] } },
  { key: 'k1', md: 'Kapitel 1', label: 'Kapitel 1', title: 'Tannenburg', who: ['marty'], opener: 'k1_platz',
    figs: { A: [['k1_plan', 'stadtplan', 1986], ['k1_flur', 'schule_flur', 1986]], B: [['k1_zeitung', 'schuelerzeitung', 1986]],
      C: [['k1_platz_kasten', 'rathausplatz', 1986]], D: [['k1_uhrwerk', 'uhrwerk', 1986]] } },
  { key: 'k2', md: 'Kapitel 2', label: 'Kapitel 2', title: 'Briefe aus der Zukunft', who: ['doc_jung'], opener: 'k2_platz',
    figs: { A: [['k2_labor', 'docs_labor', 1955], ['k2_cafe', 'cafe', 1955], ['k2_radio', 'radioladen', 1955]],
      B: [['k2_flur', 'schule_flur', 1955], ['k2_strasse', 'strasse_mist', 1955]], C: [['k2_uhrwerk', 'uhrwerk', 1955]] } },
  { key: 'k3', md: 'Kapitel 3', label: 'Kapitel 3', title: 'Gestrandet', who: ['doc', 'marty'], opener: 'k3_gleis',
    figs: { A: [['k3_saloon', 'saloon', 1885]], B: [['k3_schmiede', 'schmiede', 1885], ['k3_fest', 'festplatz', 1885]],
      C: [['k3_stall', 'mietstall', 1885]], E: [['k3_grundstein', 'rathausplatz', 1986]], F: [['k3_geruest', 'uhrwerk', 1885]] } },
  { key: 'k4', md: 'Kapitel 4', label: 'Kapitel 4', title: 'Der Schlüssel', who: ['marty'], big: ['marty', 'einstein'], opener: 'k4_vorgarten',
    figs: { _: [['k4_veranda', 'veranda', 1986], ['k4_zug', 'rathausplatz', 1986]] } },
  { key: 'k5', md: 'Kapitel 5', label: 'Kapitel 5', title: 'Hill Valley 2015', who: ['marty'], big: ['marty', 'jennifer'], opener: 'k5_platz',
    figs: { A: [['k5_lobby', 'lobby', 2015]], B: [['k5_cafe', 'cafe80er', 2015]], C: [['k5_museum', 'museum', 2015]],
      D: [['k5_buero', 'buero', 2015], ['k5_gasse', 'gasse', 2015]] } },
  { key: 'epilog', md: 'Epilog', label: 'Epilog', title: 'Zurück in der Gegenwart', who: [], big: ['doc', 'marty'], opener: 'e_museum', inline: true, figs: {} },
];
const WHO_NAME = { marty: 'Marty', doc_jung: 'Junger Doc', doc: 'Doc' };

function figures(list) {
  if (!list || !list.length) return '';
  return `<div class="figs n${list.length}">${list
    .map(([s, room, year]) => `<figure><img src="${shot(s)}"><figcaption>${esc(ROOM(room))} · ${year}</figcaption></figure>`)
    .join('')}</div>`;
}

function blockHtml(b) {
  if (b.type === 'step') {
    const extra = b.extra.length
      ? `<div class="extra">${b.extra.map((e) => (e.startsWith('- ') ? `<div class="runde">${inline(e.slice(2))}</div>` : `<div>${inline(e)}</div>`)).join('')}</div>`
      : '';
    return `<li class="step"><span class="nr">${b.n}</span><div class="txt">${inline(b.text)}${extra}</div></li>`;
  }
  if (b.type === 'note') return `<aside class="note"><b>Gut zu wissen</b>${b.lines.map((l) => `<p>${inline(l)}</p>`).join('')}</aside>`;
  if (b.type === 'list') return `<ul class="list">${b.items.map((t) => `<li>${inline(t)}</li>`).join('')}</ul>`;
  if (/^\*(Optionaler Gag|Vorab möglich)/.test(b.text)) {
    const m = b.text.match(/^\*([^*]+?):?\*:?\s*(.*)$/);
    return `<aside class="gag"><b>${esc(m[1].replace(/:$/, ''))}</b><p>${inline(m[2])}</p></aside>`;
  }
  return `<p class="para">${inline(b.text)}</p>`;
}

function chapterHtml(ch) {
  const text = Object.entries(sections).find(([k]) => k.startsWith(ch.md))[1];
  const { head, subs } = parseChapter(text);
  const era = ERA[ch.key];
  const info = head
    .map((h) => {
      const m = h.match(/^\*\*([^*]+):\*\*\s*(.*)$/) || h.match(/^\*([^*]+):\*\s*(.*)$/);
      return `<div class="info"><b>${esc(m[1])}</b><span>${inline(m[2])}</span></div>`;
    })
    .join('');
  const who = ch.who
    .map((id) => `<div class="who"><img src="${portrait(id)}"><span>${WHO_NAME[id]}</span></div>`)
    .join('');
  // Epilog: Stichpunkte stehen direkt im Abschnitt
  const body = subs
    .map((s) => {
      const letter = s.title ? s.title.split(' ')[0] : '_';
      const figs = figures(ch.figs[letter]);
      let html = '';
      let open = false;
      for (const b of s.blocks) {
        if (b.type === 'step' && !open) { html += '<ol class="steps">'; open = true; }
        if (b.type !== 'step' && open) { html += '</ol>'; open = false; }
        html += blockHtml(b);
      }
      if (open) html += '</ol>';
      const title = s.title
        ? `<h3><span class="abc">${esc(letter)}</span>${esc(s.title.replace(/^[A-Z] – /, ''))}</h3>`
        : '';
      return `<section class="sub">${title}${figs}${html}</section>`;
    })
    .join('');
  const big = (ch.big || ch.who).map((id) => `<img src="${figur(id).src}">`).join('');
  const figCls = big ? ((ch.big || ch.who).length > 1 ? ' hasfig hasfig2' : ' hasfig') : '';
  const num = ch.key.startsWith('k') ? ch.key.slice(1) : '';
  return `
  <div class="opener ${era.cls}${figCls}" id="${ch.key}">
    <div class="op-floor"></div>
    ${num ? `<div class="op-num">${num}</div>` : ''}
    ${big ? `<div class="op-fig${(ch.big || ch.who).length > 1 ? ' two' : ''}">${big}</div>` : ''}
    <div class="op-shot"><img src="${shot(ch.opener)}"></div>
    <div class="op-text">
      <div class="op-label">${ch.label}<span class="op-year">${era.jahr}</span></div>
      <h2>${esc(ch.title)}</h2>
      ${who ? `<div class="whos">${who}</div>` : ''}
      <div class="infos">${info}</div>
      ${ch.inline ? `<div class="op-body">${body}</div>` : ''}
    </div>
  </div>
  ${ch.inline ? '' : `<div class="content ${era.cls}">${body}</div>`}`;
}

// ---------- Sonderseiten ----------
const titleImg = scaled(asset('ui/title.png'), 8, 'title.png', [0, 0, 320, 132]);
const coverFigs = ['marty', 'jennifer', 'doc', 'einstein', 'biff', 'brix']
  .map((id) => { const f = figur(id); return `<img src="${f.src}" style="height:${f.h * 0.95}mm">`; })
  .join('');

const ueb = table(sections['Übersicht'].split('###')[0]);
const fotoTab = table(sections['Übersicht'].split('### Familienfoto – Stufen')[1]);
const items = table(sections['Gegenstandsliste']);
const NAME_TO_ITEM = Object.fromEntries(Object.entries(de.item).map(([k, v]) => [v.name || v, k]));
const ITEM_ALIAS = { 'Banane / Bananenschale': ['banane', 'bananenschale'], 'Spindkombination, Hausaufgabe': ['zettel', 'hausaufgabe'],
  'Streichhölzer, Bleistift': ['streichhoelzer', 'bleistift'], 'Biffs Brief / Nachricht': ['biffs_brief', 'nachricht'],
  Familienfoto: ['foto_stufe0'], Sicherung: ['sicherung'], 'Brix\' Brief': ['brief_brix'] };
const itemIcons = (name) =>
  (ITEM_ALIAS[name] || [NAME_TO_ITEM[name]]).filter(Boolean).map((id) => `<img src="${item(id)}">`).join('');

const verbsUi = scaled(path.join(SCREENS, 'p_kueche.png'), 1, 'ui_full.png');

const html = `<!doctype html><html lang="de"><head><meta charset="utf-8">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=Pixelify+Sans:wght@400;600;700&family=Source+Sans+3:ital,wght@0,400;0,600;0,700;1,400&display=swap" rel="stylesheet">
<style>${fs.readFileSync(path.join(__dirname, 'style.css'), 'utf8')}</style></head><body>

<div class="cover">
  <div class="cover-img"><img src="${titleImg}"></div>
  <div class="cover-text">
    <div class="cover-kicker">Die Komplettlösung</div>
    <h1>Lösungsbuch</h1>
    <div class="cover-sub">Alle Rätsel, alle Wege, alle Zeitebenen<br>1885 · 1955 · 1986 · 2015</div>
  </div>
  <div class="cover-figs">${coverFigs}</div>
  <div class="cover-warn">Achtung: Dieses Buch verrät alles.</div>
</div>

<div class="content intro e1986">
  <h2 class="page-h">Bevor es losgeht</h2>
  <p class="lead">Hill Valley steckt in einem Zeitparadox. Jemand schickt Briefe in die Vergangenheit, und aus der Stadt ist Tannenburg geworden.
  Dieses Buch führt Schritt für Schritt durch alle fünf Kapitel. Wer nur einen Anstoß braucht, liest am besten nur den nächsten Schritt.</p>
  <figure class="ui-fig"><img src="${verbsUi}"><figcaption>Der Spielbildschirm: oben die Szene, darunter Satzzeile, neun Verben, Inventar und Porträts.</figcaption></figure>
  <div class="cols2">
    <div>
      <h3 class="small">Bedienung</h3>
      <p>Jede Aktion besteht aus einem Verb und einem Ziel, etwa <span class="verb">Nimm</span> Banane oder
      <span class="verb">Benutze</span> Schraubenzieher <em>mit</em> Mixer. Ein Klick in die Szene ohne Verb lässt die Figur dorthin gehen.</p>
      <p>Ab Kapitel 3 wechseln die <b>Porträts</b> rechts unten die Figur. Jede Figur behält ihren Ort und ihr Inventar.</p>
    </div>
    <div>
      <h3 class="small">Hilfe im Spiel</h3>
      <p>Tipps gibt es mit der Taste <span class="key">H</span>, über das Menü oder per Klick aufs eigene Porträt. Sie nennen immer nur den nächsten Schritt.</p>
      <p>Niemand stirbt, und nichts geht verloren. Wer scheitert, bekommt einen Gag und darf es noch einmal versuchen.</p>
    </div>
  </div>
  <h3 class="small">Die Kapitel</h3>
  <table class="tab"><thead><tr>${ueb.head.map((h) => `<th>${esc(h)}</th>`).join('')}</tr></thead>
  <tbody>${ueb.rows.map((r) => `<tr>${r.map((c, i) => `<td>${i === 0 ? `<a href="#${c.startsWith('Prolog') ? 'prolog' : c.startsWith('Epilog') ? 'epilog' : 'k' + c[0]}">${esc(c)}</a>` : esc(c)}</td>`).join('')}</tr>`).join('')}</tbody></table>
</div>

<div class="content foto e1986">
  <h2 class="page-h">Das Familienfoto</h2>
  <p class="lead">Martys Familienfoto zeigt, wie es um die Zeitlinie steht. <span class="verb">Schau an</span> Foto verrät jederzeit einen Hinweis.</p>
  <div class="fotos">${fotoTab.rows
    .map((r) => `<div class="foto-card"><img src="${scaled(asset(`items/foto_gross_stufe${r[0]}.png`), 4, `foto${r[0]}.png`)}">
      <div><b>Stufe ${esc(r[0])}</b> · ${esc(r[1])}<p>${esc(r[2])}</p><p class="q">${esc(r[3])}</p></div></div>`)
    .join('')}</div>
</div>

${CHAPTERS.map(chapterHtml).join('\n')}

<div class="content extras e2015">
  <h2 class="page-h">Gags und Easter Eggs</h2>
  <p class="lead">Für die Lösung nicht nötig, aber es lohnt sich, überall herumzuklicken. Das Skateboard aus Martys Zimmer lässt sich mitnehmen und reagiert je nach Ort.
  Fast jede Kombination aus Verb und Gegenstand hat ihre eigene Antwort.</p>
  <h2 class="page-h">Alle Gegenstände</h2>
  <table class="tab items"><thead><tr><th></th>${items.head.map((h) => `<th>${esc(h)}</th>`).join('')}</tr></thead>
  <tbody>${items.rows.map((r) => `<tr><td class="ic">${itemIcons(r[0])}</td>${r.map((c) => `<td>${esc(c)}</td>`).join('')}</tr>`).join('')}</tbody></table>
</div>

<div class="back">
  <div class="back-shot"><img src="${shot('e_platz')}"></div>
  <div class="back-text"><div class="cover-kicker">Ende</div><p>„Die Zeitlinie heilt sich selbst.“</p>
  <img class="back-logo" src="${titleImg}"></div>
</div>
</body></html>`;

const htmlFile = path.join(BUILD, 'loesungsbuch.html');
fs.writeFileSync(htmlFile, html);

(async () => {
  const b = await chromium.launch();
  const p = await b.newPage();
  await p.goto(pathToFileURL(htmlFile).href, { waitUntil: 'networkidle' });
  await p.evaluate(() => document.fonts.ready);
  const out = path.join(ROOT, 'Loesungsbuch.pdf');
  await p.pdf({ path: out, format: 'A4', printBackground: true, preferCSSPageSize: true });
  await b.close();
  console.log(out, Math.round(fs.statSync(out).size / 1024), 'KB');
})();
