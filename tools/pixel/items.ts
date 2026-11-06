import { C } from './palette.ts';
import { Canvas } from './png.ts';
import { drawGlyph } from './font.ts';

const W = 32;
const H = 20;

function icon(dir: string, name: string, paint: (c: Canvas) => void): void {
  const c = new Canvas(W, H);
  paint(c);
  c.save(`${dir}/items/${name}.png`);
}

export function buildItems(dir: string): void {
  // Das Familienfoto: fünf Stufen laut LOESUNGSBUCH.md
  for (let stage = 0; stage <= 4; stage++) {
    icon(dir, `foto_stufe${stage}`, (c) => {
      c.rect(6, 1, 20, 18, C.sand2);
      c.frame(6, 1, 20, 18, C.holz4);
      c.rect(8, 3, 16, 9, C.blau6);
      c.rect(8, 12, 16, 5, C.gruen5);
      c.rect(9, 7, 7, 5, C.weiss); // Haus
      c.rect(9, 6, 7, 1, C.rot3);
      if (stage === 1) {
        // Tannen-Werbung im Hintergrund
        c.rect(17, 3, 7, 4, C.rot3);
        c.rect(19, 4, 3, 1, C.gelb2);
      }
      // Familie vorn
      c.rect(9, 11, 2, 5, C.rot4);
      c.rect(12, 11, 2, 5, C.blau3);
      c.rect(15, 12, 2, 4, C.orange2);
      // Doc im Hintergrund: blass, wenn die Zeitlinie nicht stimmt
      const faded = stage === 1 || stage === 2;
      if (faded) {
        c.set(20, 9, C.grau6);
        c.set(21, 11, C.grau6);
        c.set(20, 13, C.grau6);
      } else {
        c.rect(20, 9, 2, 6, C.violett4);
        c.set(22, stage === 4 ? 9 : 8, C.violett4);
        if (stage === 4) c.set(20, 8, C.gelb2);
      }
    });
  }

  // Prolog
  icon(dir, 'kugelschreiber', (c) => {
    c.line(8, 15, 23, 4, C.blau5);
    c.line(9, 16, 24, 5, C.blau3);
    c.set(7, 16, C.schwarz);
    c.rect(22, 3, 3, 2, C.grau6);
  });
  icon(dir, 'banane', (c) => {
    c.poly([[7, 4], [11, 10], [19, 12], [26, 9], [27, 11], [20, 16], [11, 15], [6, 8]], C.gelb2);
    c.line(11, 14, 20, 15, C.gelb1);
    c.rect(6, 3, 2, 2, C.holz3);
  });
  icon(dir, 'bananenschale', (c) => {
    c.poly([[14, 7], [18, 7], [18, 11], [14, 11]], C.gelb2);
    c.poly([[14, 10], [8, 16], [11, 16], [15, 12]], C.gelb1);
    c.poly([[18, 10], [24, 16], [21, 16], [17, 12]], C.gelb1);
    c.poly([[15, 11], [15, 17], [17, 17], [17, 11]], C.gelb2);
    c.rect(15, 5, 2, 2, C.holz3);
  });
  icon(dir, 'hundefutter', (c) => {
    c.rect(10, 3, 12, 15, C.orange2);
    c.frame(10, 3, 12, 15, C.orange1);
    c.rect(12, 7, 8, 6, C.sand2);
    c.rect(14, 9, 4, 2, C.holz3);
  });
  icon(dir, 'wachstuch', (c) => {
    c.poly([[8, 6], [24, 4], [26, 14], [14, 17], [6, 14]], C.sand1);
    c.line(9, 9, 23, 7, C.holz6);
    c.line(9, 12, 22, 11, C.holz6);
  });
  icon(dir, 'docs_brief', (c) => {
    c.rect(7, 4, 18, 12, C.weiss);
    c.frame(7, 4, 18, 12, C.grau4);
    c.line(8, 5, 16, 11, C.grau4);
    c.line(24, 5, 16, 11, C.grau4);
  });
  icon(dir, 'notizbuch', (c) => {
    c.rect(9, 3, 15, 15, C.rot3);
    c.frame(9, 3, 15, 15, C.rot1);
    c.rect(10, 3, 2, 15, C.grau6);
    c.rect(14, 7, 8, 2, C.sand2);
  });
  icon(dir, 'mr_fusion', (c) => {
    c.rect(11, 5, 10, 14, C.grau5);
    c.frame(11, 5, 10, 14, C.grau3);
    c.rect(10, 2, 12, 3, C.grau6);
    c.rect(14, 9, 4, 5, C.gelb2);
  });

  icon(dir, 'apfel', (c) => {
    c.poly([[11, 7], [14, 5], [18, 5], [21, 7], [22, 12], [19, 17], [13, 17], [10, 12]], C.rot4);
    c.rect(13, 7, 2, 3, C.rot6);
    c.rect(15, 3, 2, 3, C.holz3);
    c.rect(17, 3, 3, 2, C.gruen5);
  });

  icon(dir, 'schachtel', (c) => {
    c.rect(8, 7, 16, 10, C.holz5);
    c.rect(8, 7, 16, 2, C.holz6);
    c.frame(8, 7, 16, 10, C.holz3);
    c.rect(14, 7, 4, 10, C.sand1);
  });

  icon(dir, 'apfelschachtel', (c) => {
    c.poly([[12, 4], [15, 2], [18, 2], [21, 4], [21, 9], [12, 9]], C.rot4);
    c.rect(16, 1, 1, 2, C.holz3);
    c.rect(8, 7, 16, 10, C.holz5);
    c.rect(8, 7, 16, 2, C.holz6);
    c.frame(8, 7, 16, 10, C.holz3);
  });

  icon(dir, 'muenze', (c) => {
    c.poly([[13, 5], [19, 5], [22, 8], [22, 12], [19, 15], [13, 15], [10, 12], [10, 8]], C.gelb1);
    c.poly([[14, 6], [18, 6], [21, 9], [21, 11], [18, 14], [14, 14], [11, 11], [11, 9]], C.gelb2);
    c.rect(15, 8, 2, 4, C.gelb1);
  });

  icon(dir, 'keks', (c) => {
    c.poly([[13, 5], [19, 5], [23, 9], [23, 12], [19, 16], [13, 16], [9, 12], [9, 9]], C.holz6);
    for (const [x, y] of [[13, 8], [18, 7], [20, 11], [14, 12], [17, 13]] as const) {
      c.rect(x, y, 2, 2, C.holz2);
    }
  });

  // Kapitel 1
  icon(dir, 'zeitung', (c) => {
    c.poly([[7, 4], [25, 2], [27, 15], [9, 17]], C.grau6);
    c.line(10, 5, 23, 4, C.schwarz);
    c.line(10, 8, 16, 7, C.grau3);
    c.line(11, 11, 16, 10, C.grau3);
    c.rect(18, 7, 6, 6, C.grau4);
  });
  icon(dir, 'entschuldigung', (c) => {
    c.rect(9, 2, 15, 16, C.weiss);
    c.frame(9, 2, 15, 16, C.grau4);
    for (let y = 5; y < 13; y += 3) c.line(11, y, 21, y, C.blau4);
    c.line(11, 15, 18, 14, C.blau2);
  });
  icon(dir, 'kassette', (c) => {
    c.rect(7, 4, 18, 12, C.grau2);
    c.frame(7, 4, 18, 12, C.grau1);
    c.rect(9, 5, 14, 4, C.sand2);
    c.rect(11, 10, 3, 3, C.schwarz);
    c.rect(18, 10, 3, 3, C.schwarz);
  });
  icon(dir, 'kabel', (c) => {
    c.poly([[10, 4], [22, 4], [26, 10], [22, 16], [10, 16], [6, 10]], C.orange1);
    c.poly([[12, 7], [20, 7], [22, 10], [20, 13], [12, 13], [10, 10]], C.schwarz);
    c.rect(24, 13, 4, 3, C.grau5);
  });
  icon(dir, 'diktiergeraet', (c) => {
    c.rect(9, 2, 14, 16, C.grau2);
    c.frame(9, 2, 14, 16, C.grau1);
    c.rect(11, 4, 10, 6, C.grau4);
    c.rect(11, 12, 3, 3, C.rot4);
    c.rect(15, 12, 3, 3, C.gruen5);
  });
  icon(dir, 'brief_an_doc', (c) => {
    c.rect(7, 4, 18, 12, C.sand2);
    c.frame(7, 4, 18, 12, C.holz4);
    c.line(10, 8, 22, 8, C.blau4);
    c.line(10, 11, 19, 11, C.blau4);
  });

  // Kapitel 2
  icon(dir, 'brief_von_marty', (c) => {
    c.rect(7, 4, 18, 12, C.sand1);
    c.frame(7, 4, 18, 12, C.holz3);
    c.line(10, 8, 22, 8, C.blau3);
    c.line(10, 11, 19, 11, C.blau3);
  });
  icon(dir, 'schraubenzieher', (c) => {
    c.line(8, 15, 13, 11, C.rot4);
    c.line(9, 16, 14, 12, C.rot4);
    c.line(8, 14, 12, 11, C.rot5);
    c.line(14, 11, 24, 3, C.grau6);
  });
  icon(dir, 'zigarrenkiste', (c) => {
    c.rect(6, 5, 20, 12, C.holz4);
    c.frame(6, 5, 20, 12, C.holz2);
    c.rect(11, 8, 10, 5, C.sand2);
  });
  icon(dir, 'kupferspule', (c) => {
    c.rect(11, 3, 10, 14, C.orange1);
    for (let y = 4; y < 16; y += 2) c.rect(11, y, 10, 1, C.orange3);
    c.rect(9, 2, 14, 1, C.grau4);
    c.rect(9, 17, 14, 1, C.grau4);
  });
  icon(dir, 'dollar', (c) => {
    c.rect(5, 5, 22, 11, C.gruen5);
    c.frame(5, 5, 22, 11, C.gruen3);
    c.rect(13, 8, 6, 5, C.gruen7);
    c.rect(8, 3, 22, 1, C.gruen3);
  });
  icon(dir, 'roehre', (c) => {
    c.poly([[12, 4], [15, 1], [18, 1], [21, 4], [21, 13], [12, 13]], C.blau8);
    c.rect(14, 5, 5, 6, C.grau4);
    c.rect(11, 13, 11, 4, C.grau2);
    c.rect(13, 17, 1, 2, C.grau5);
    c.rect(19, 17, 1, 2, C.grau5);
  });
  icon(dir, 'zettel', (c) => {
    c.rect(9, 4, 15, 12, C.gelb3);
    c.frame(9, 4, 15, 12, C.gelb1);
    c.line(11, 9, 22, 9, C.blau3);
    c.line(11, 12, 18, 12, C.blau3);
  });
  icon(dir, 'hausaufgabe', (c) => {
    c.rect(9, 2, 15, 16, C.weiss);
    c.frame(9, 2, 15, 16, C.grau4);
    for (let y = 5; y < 16; y += 2) c.line(11, y, 22, y, C.grau4);
    c.rect(19, 3, 4, 2, C.rot4);
  });
  icon(dir, 'mappe', (c) => {
    c.rect(6, 4, 21, 14, C.holz4);
    c.frame(6, 4, 21, 14, C.holz1);
    c.rect(11, 2, 8, 2, C.holz2);
    c.rect(11, 9, 11, 3, C.sand2);
  });
  icon(dir, 'verstaerker', (c) => {
    c.rect(6, 6, 20, 12, C.holz4);
    c.frame(6, 6, 20, 12, C.holz2);
    c.rect(10, 8, 5, 8, C.orange2);
    c.rect(18, 1, 4, 6, C.blau8);
    c.rect(18, 7, 4, 2, C.grau3);
  });

  // Kapitel 3
  icon(dir, 'streichhoelzer', (c) => {
    c.rect(8, 7, 16, 9, C.sand2);
    c.frame(8, 7, 16, 9, C.holz3);
    for (const x of [11, 15, 19]) {
      c.rect(x, 3, 1, 5, C.holz6);
      c.set(x, 2, C.rot4);
      c.set(x, 3, C.rot4);
    }
  });
  icon(dir, 'bleistift', (c) => {
    c.line(7, 15, 23, 5, C.gelb1);
    c.line(8, 16, 24, 6, C.gelb2);
    c.rect(6, 15, 2, 2, C.rot3);
    c.rect(24, 4, 2, 2, C.schwarz);
  });
  icon(dir, 'festprogramm', (c) => {
    c.rect(9, 1, 15, 18, C.sand2);
    c.frame(9, 1, 15, 18, C.holz4);
    c.rect(11, 4, 11, 2, C.rot3);
    for (let y = 8; y < 17; y += 2) c.rect(11, y, 10, 1, C.grau3);
  });
  icon(dir, 'kuchen', (c) => {
    c.poly([[7, 9], [25, 9], [25, 16], [7, 16]], C.holz6);
    c.rect(7, 7, 18, 3, C.pink4);
    c.rect(7, 15, 18, 2, C.holz4);
    c.rect(15, 4, 2, 3, C.rot4);
  });
  icon(dir, 'herausforderung', (c) => {
    c.rect(9, 1, 15, 18, C.sand2);
    c.frame(9, 1, 15, 18, C.holz4);
    for (let y = 4; y < 14; y += 3) c.line(11, y + 1, 22, y, C.blau3);
    c.line(14, 16, 21, 15, C.blau2);
  });
  icon(dir, 'knallfrosch', (c) => {
    c.rect(9, 7, 14, 8, C.rot4);
    c.frame(9, 7, 14, 8, C.rot2);
    c.rect(12, 9, 3, 3, C.gelb2);
    c.line(23, 8, 27, 4, C.grau2);
  });
  icon(dir, 'knallfrosch_brennend', (c) => {
    c.rect(9, 7, 14, 8, C.rot4);
    c.frame(9, 7, 14, 8, C.rot2);
    c.rect(12, 9, 3, 3, C.gelb2);
    c.line(23, 8, 26, 5, C.grau2);
    c.rect(26, 2, 3, 3, C.orange3);
    c.set(27, 1, C.gelb3);
  });
  icon(dir, 'fluxkompensator', (c) => {
    c.rect(7, 3, 18, 15, C.grau3);
    c.frame(7, 3, 18, 15, C.grau1);
    c.line(10, 15, 15, 7, C.neon);
    c.line(22, 15, 17, 7, C.neon);
    c.line(16, 7, 16, 14, C.neon);
  });
  icon(dir, 'biffs_brief', (c) => {
    c.poly([[7, 5], [25, 3], [26, 15], [8, 17]], C.sand1);
    c.line(10, 7, 22, 6, C.grau3);
    c.line(10, 10, 21, 9, C.grau3);
    c.line(11, 13, 18, 12, C.grau3);
  });
  icon(dir, 'nachricht', (c) => {
    c.poly([[7, 5], [25, 3], [26, 15], [8, 17]], C.sand2);
    c.line(10, 7, 22, 6, C.schwarz);
    c.line(10, 10, 21, 9, C.schwarz);
    c.line(11, 13, 20, 12, C.schwarz);
  });
  icon(dir, 'brecheisen', (c) => {
    c.line(8, 17, 22, 3, C.grau3);
    c.line(9, 17, 23, 3, C.grau4);
    c.rect(22, 2, 5, 2, C.grau3);
    c.rect(6, 16, 3, 3, C.grau3);
  });
  icon(dir, 'vergilbter_brief', (c) => {
    c.poly([[7, 5], [25, 3], [26, 15], [8, 17]], C.gelb3);
    c.line(10, 7, 22, 6, C.holz3);
    c.line(10, 10, 21, 9, C.holz3);
    c.line(11, 13, 18, 12, C.holz3);
  });
  icon(dir, 'sicherung', (c) => {
    c.rect(6, 7, 20, 6, C.grau6);
    c.rect(10, 4, 12, 12, C.blau8);
    c.frame(10, 4, 12, 12, C.grau3);
    c.rect(14, 8, 4, 4, C.gelb2);
  });

  // Kapitel 4
  icon(dir, 'wachsdose', (c) => {
    c.rect(9, 5, 14, 12, C.gelb1);
    c.rect(9, 3, 14, 3, C.grau5);
    c.rect(12, 8, 8, 5, C.rot3);
  });
  icon(dir, 'sendeschluessel', (c) => {
    c.rect(8, 7, 7, 7, C.gelb2);
    c.rect(10, 9, 3, 3, C.blau2);
    c.rect(15, 9, 11, 3, C.gelb2);
    c.rect(22, 12, 2, 3, C.gelb2);
    c.rect(25, 12, 2, 2, C.gelb2);
  });
  icon(dir, 'brief_2015', (c) => {
    c.rect(7, 4, 18, 12, C.weiss);
    c.frame(7, 4, 18, 12, C.neon);
    c.line(10, 8, 22, 8, C.grau3);
    c.line(10, 11, 19, 11, C.grau3);
  });

  // Vier schlichte Zusatzdinge, um das Blättern im Inventar zu prüfen.
  ['1', '2', '3', '4'].forEach((digit, i) => {
    icon(dir, `ding${digit}`, (c) => {
      const color = [C.tuerkis3, C.violett4, C.orange2, C.gruen4][i];
      c.rect(10, 4, 12, 12, color);
      c.frame(10, 4, 12, 12, C.schwarz);
      drawGlyph(c, digit, 14, 6, C.weiss);
    });
  });
}
