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
