import { drawText } from './font.ts';
import { C } from './palette.ts';
import { Canvas, seeded } from './png.ts';

const FLOOR_Y = 88;

export function baseboard(c: Canvas, color: number, light: number): void {
  c.rect(0, FLOOR_Y - 4, c.w, 4, color);
  c.rect(0, FLOOR_Y - 4, c.w, 1, light);
}

export function door(c: Canvas, x: number, y: number, w: number, h: number, wood: number, dark: number, frame: number): void {
  c.rect(x - 2, y - 2, w + 4, h + 2, frame);
  c.rect(x, y, w, h, wood);
  c.rect(x + 4, y + 5, w - 8, h / 2 - 8, dark);
  c.rect(x + 4, y + h / 2 + 2, w - 8, h / 2 - 8, dark);
  c.rect(x + w - 5, y + h / 2 - 2, 2, 3, C.gelb2);
}

function carpet(c: Canvas, ramp: readonly number[]): void {
  c.gradient(0, FLOOR_Y, c.w, c.h - FLOOR_Y, ramp);
  c.rect(0, FLOOR_Y, c.w, 1, ramp[0]);
}

function tiles(c: Canvas, a: number, b: number): void {
  for (let y = FLOOR_Y; y < c.h; y++) {
    const depth = (y - FLOOR_Y) / (c.h - FLOOR_Y);
    const size = 12 + depth * 16;
    const row = Math.floor(Math.log(1 + depth * 3) * 6);
    for (let x = 0; x < c.w; x++) {
      const col = Math.floor((x - c.w / 2) / size);
      c.set(x, y, (col + row) % 2 === 0 ? a : b);
    }
  }
}

function martysZimmer(dir: string): void {
  const c = new Canvas(320, 144, C.schwarz);
  c.gradient(0, 0, 320, FLOOR_Y, [C.blau3, C.blau3, C.blau2]);
  baseboard(c, C.grau3, C.grau5);
  carpet(c, [C.grau2, C.grau3, C.grau3, C.grau4]);

  // Fenster
  c.rect(30, 18, 50, 44, C.weiss);
  c.gradient(33, 21, 44, 38, [C.blau6, C.blau7, C.blau8]);
  c.rect(54, 21, 2, 38, C.weiss);
  c.rect(33, 39, 44, 2, C.weiss);
  c.rect(33, 50, 44, 9, C.gruen5);

  // Bett
  c.rect(8, 76, 84, 28, C.holz3);
  c.rect(10, 70, 80, 22, C.rot3);
  c.rect(10, 70, 80, 3, C.rot5);
  c.rect(12, 62, 22, 12, C.grau6);
  c.rect(12, 62, 22, 2, C.weiss);
  c.rect(8, 104, 4, 6, C.holz2);
  c.rect(88, 104, 4, 6, C.holz2);

  // Poster mit Blitz und schlichtes Bandposter
  c.rect(110, 18, 30, 42, C.schwarz);
  c.frame(110, 18, 30, 42, C.grau4);
  c.poly([[128, 22], [118, 40], [124, 40], [119, 56], [132, 36], [126, 36]], C.gelb2);
  c.rect(146, 26, 22, 30, C.rot2);
  c.frame(146, 26, 22, 30, C.grau5);
  c.rect(150, 31, 14, 8, C.orange3);
  c.rect(150, 43, 14, 2, C.weiss);
  c.rect(150, 47, 10, 2, C.weiss);

  // Schreibtisch mit Lampe und Büchern
  c.rect(172, 62, 76, 5, C.holz5);
  c.rect(172, 62, 76, 1, C.holz6);
  c.rect(174, 67, 22, 25, C.holz3);
  c.rect(176, 71, 18, 7, C.holz4);
  c.rect(176, 81, 18, 7, C.holz4);
  c.rect(242, 67, 4, 25, C.holz3);
  c.rect(176, 52, 5, 10, C.rot4);
  c.rect(181, 54, 5, 8, C.blau5);
  c.rect(186, 51, 4, 11, C.gruen5);
  c.rect(232, 50, 2, 12, C.grau4);
  c.poly([[226, 50], [240, 50], [236, 42], [230, 42]], C.gelb1);

  // Skateboard an der Wand, Tür
  c.rect(255, 62, 8, 26, C.rot4);
  c.rect(254, 64, 10, 2, C.grau2);
  c.rect(254, 84, 10, 2, C.grau2);
  door(c, 270, 24, 36, 64, C.grau6, C.grau5, C.grau4);
  c.save(`${dir}/backgrounds/martys_zimmer_1986.png`);

  const pen = new Canvas(9, 3);
  pen.rect(0, 1, 8, 1, C.blau5);
  pen.rect(0, 0, 3, 1, C.blau3);
  pen.set(8, 1, C.schwarz);
  pen.save(`${dir}/backgrounds/sprites/kugelschreiber.png`);
}

function kueche(dir: string): void {
  const c = new Canvas(320, 144, C.schwarz);
  c.gradient(0, 0, 320, FLOOR_Y, [C.sand2, C.sand1, C.sand1]);
  for (let y = 44; y < 56; y += 4) c.rect(0, y, 320, 1, C.holz6);
  baseboard(c, C.holz4, C.holz5);
  tiles(c, C.grau5, C.grau6);

  // Treppe nach oben
  c.rect(6, 20, 34, 68, C.holz2);
  for (let i = 0; i < 7; i++) {
    c.rect(6 + i * 2, 80 - i * 9, 34 - i * 2, 4, C.holz5);
    c.rect(6 + i * 2, 84 - i * 9, 34 - i * 2, 5, C.holz3);
  }
  // Tür zum Arbeitszimmer
  door(c, 60, 24, 34, 64, C.holz4, C.holz3, C.grau6);
  // Kühlschrank
  c.rect(120, 20, 30, 68, C.grau6);
  c.frame(120, 20, 30, 68, C.grau4);
  c.rect(120, 44, 30, 1, C.grau4);
  c.rect(144, 28, 2, 12, C.grau3);
  c.rect(144, 50, 2, 14, C.grau3);
  // Herd
  c.rect(154, 56, 32, 32, C.grau5);
  c.frame(154, 56, 32, 32, C.grau3);
  c.rect(158, 66, 24, 18, C.grau2);
  c.rect(154, 54, 32, 3, C.grau1);
  c.rect(160, 48, 10, 6, C.rot3);
  // Arbeitsplatte, Obstschale
  c.rect(190, 56, 62, 4, C.holz6);
  c.rect(190, 60, 62, 28, C.holz4);
  c.rect(192, 64, 28, 22, C.holz3);
  c.rect(222, 64, 28, 22, C.holz3);
  c.poly([[208, 49], [234, 49], [229, 56], [213, 56]], C.tuerkis3);
  c.rect(208, 49, 26, 1, C.tuerkis5);
  c.rect(226, 45, 6, 5, C.rot4);
  c.rect(209, 46, 6, 4, C.orange2);
  // Fenster über der Arbeitsplatte
  c.rect(196, 12, 46, 30, C.weiss);
  c.gradient(199, 15, 40, 24, [C.blau6, C.blau7]);
  c.rect(218, 15, 2, 24, C.weiss);
  // Haustür
  door(c, 270, 24, 36, 64, C.rot3, C.rot2, C.grau6);
  c.save(`${dir}/backgrounds/kueche_1986.png`);

  const banana = new Canvas(16, 8);
  banana.poly([[1, 1], [4, 4], [10, 5], [14, 3], [15, 4], [11, 7], [4, 7], [0, 3]], C.gelb2);
  banana.rect(0, 1, 2, 1, C.holz3);
  banana.rect(4, 6, 7, 1, C.gelb1);
  banana.save(`${dir}/backgrounds/sprites/banane.png`);
}

function arbeitszimmer(dir: string): void {
  const c = new Canvas(320, 144, C.schwarz);
  c.gradient(0, 0, 320, FLOOR_Y, [C.gruen3, C.gruen3, C.gruen2]);
  baseboard(c, C.holz3, C.holz4);
  carpet(c, [C.rot2, C.rot3, C.rot3, C.rot2]);

  // Bücherregal
  c.rect(20, 12, 90, 76, C.holz2);
  c.frame(20, 12, 90, 76, C.holz1);
  const rnd = seeded(42);
  const colors = [C.rot3, C.blau4, C.gruen4, C.orange1, C.violett3, C.grau4, C.holz6];
  for (let shelf = 0; shelf < 4; shelf++) {
    const y = 16 + shelf * 18;
    c.rect(22, y + 15, 86, 2, C.holz4);
    for (let x = 24; x < 104; ) {
      const w = 3 + Math.floor(rnd() * 4);
      const h = 9 + Math.floor(rnd() * 6);
      c.rect(x, y + 15 - h, w, h, colors[Math.floor(rnd() * colors.length)]);
      x += w + (rnd() < 0.15 ? 5 : 0);
    }
  }
  // Schreibtisch mit Schreibmaschine und Papierstapel
  c.rect(130, 60, 90, 5, C.holz5);
  c.rect(130, 60, 90, 1, C.holz6);
  c.rect(133, 65, 24, 27, C.holz3);
  c.rect(212, 65, 5, 27, C.holz3);
  c.rect(160, 50, 28, 10, C.grau2);
  c.rect(163, 46, 22, 5, C.grau1);
  c.rect(167, 38, 14, 9, C.weiss);
  c.rect(164, 53, 22, 1, C.grau4);
  c.rect(164, 56, 22, 1, C.grau4);
  c.rect(196, 54, 16, 6, C.weiss);
  c.rect(196, 54, 16, 1, C.grau5);
  // Bild, Tür
  c.rect(235, 18, 24, 30, C.holz4);
  c.rect(238, 21, 18, 24, C.blau2);
  for (let i = 0; i < 6; i++) c.set(240 + i * 3, 25 + ((i * 7) % 17), C.gelb3);
  door(c, 270, 24, 36, 64, C.holz4, C.holz3, C.grau6);
  c.save(`${dir}/backgrounds/arbeitszimmer_1986.png`);
}

function vorgarten(dir: string, tannenburg: boolean): void {
  const c = new Canvas(320, 144, C.schwarz);
  c.gradient(0, 0, 320, 92, tannenburg ? [C.grau4, C.grau5, C.orange3] : [C.blau5, C.blau6, C.blau7, C.blau8]);
  // Rasen und Weg
  c.gradient(0, 90, 320, 54, [C.gruen4, C.gruen5, C.gruen5, C.gruen6]);
  c.poly([[112, 92], [138, 92], [150, 143], [90, 143]], C.sand1);
  c.poly([[170, 92], [320, 92], [320, 143], [150, 143]], C.grau4);
  c.rect(170, 92, 150, 1, C.grau3);
  // Haus
  c.rect(0, 22, 146, 70, C.sand2);
  c.poly([[0, 22], [0, 6], [146, 6], [160, 22]], C.rot2);
  c.rect(0, 22, 160, 2, C.rot1);
  for (let y = 28; y < 92; y += 5) c.rect(0, y, 146, 1, C.sand1);
  c.rect(14, 36, 34, 30, C.weiss);
  c.gradient(17, 39, 28, 24, [C.blau3, C.blau5]);
  c.rect(30, 39, 2, 24, C.weiss);
  c.rect(62, 36, 34, 30, C.weiss);
  c.gradient(65, 39, 28, 24, [C.blau3, C.blau5]);
  c.rect(78, 39, 2, 24, C.weiss);
  door(c, 110, 46, 30, 46, C.rot3, C.rot2, C.weiss);
  // Hecke
  c.rect(0, 80, 104, 12, C.gruen3);
  c.rect(0, 80, 104, 2, C.gruen4);
  // Briefkasten
  c.rect(150, 80, 2, 12, C.grau2);
  c.rect(146, 74, 10, 7, C.blau4);
  c.rect(154, 75, 2, 4, C.rot4);
  // Baum im Hintergrund
  c.rect(300, 40, 7, 52, C.holz3);
  c.poly([[282, 40], [292, 14], [314, 10], [320, 18], [320, 44], [302, 50]], tannenburg ? C.gruen2 : C.gruen3);

  if (tannenburg) {
    // Werbetafel: Alles gehört jetzt den Tannens.
    c.rect(214, 8, 6, 40, C.grau1);
    c.rect(262, 8, 6, 40, C.grau1);
    c.rect(190, 6, 104, 32, C.rot2);
    c.frame(190, 6, 104, 32, C.gelb2);
    drawText(c, 'TANNEN', 214, 11, C.gelb2);
    drawText(c, 'INDUSTRIES', 204, 23, C.weiss);
  }
  c.save(`${dir}/backgrounds/vorgarten_1986${tannenburg ? '_tannenburg' : ''}.png`);
}

/** Bewusst schlichte Limousine, kein Film-Fahrzeug. */
function auto(dir: string): void {
  const c = new Canvas(102, 46);
  c.poly([[24, 2], [72, 2], [86, 18], [14, 18]], C.grau5);
  c.poly([[28, 5], [47, 5], [47, 17], [20, 17]], C.blau7);
  c.poly([[50, 5], [70, 5], [80, 17], [50, 17]], C.blau7);
  c.rect(2, 18, 98, 18, C.blau4);
  c.rect(2, 18, 98, 2, C.blau6);
  c.rect(0, 34, 102, 4, C.grau4);
  c.rect(47, 20, 1, 14, C.blau2);
  c.rect(52, 24, 5, 1, C.grau6);
  c.rect(30, 24, 5, 1, C.grau6);
  c.rect(0, 22, 3, 6, C.rot4);
  c.rect(98, 22, 4, 6, C.gelb3);
  c.poly([[12, 32], [28, 32], [31, 40], [27, 45], [13, 45], [9, 40]], C.schwarz);
  c.poly([[72, 32], [88, 32], [91, 40], [87, 45], [73, 45], [69, 40]], C.schwarz);
  c.rect(16, 37, 8, 5, C.grau5);
  c.rect(76, 37, 8, 5, C.grau5);
  c.save(`${dir}/backgrounds/sprites/auto.png`);
}

function labor(dir: string): void {
  const c = new Canvas(320, 144, C.schwarz);
  c.gradient(0, 0, 320, FLOOR_Y, [C.violett1, C.violett2, C.grau2]);
  for (let x = 0; x < 320; x += 40) c.rect(x, 0, 1, FLOOR_Y, C.grau1);
  c.rect(0, 8, 320, 2, C.grau3);
  baseboard(c, C.grau1, C.grau3);
  c.gradient(0, FLOOR_Y, 320, 56, [C.grau2, C.grau3, C.grau3, C.grau4]);
  for (let i = 0; i < 40; i++) {
    const x = (i * 83) % 320;
    c.rect(x, 96 + ((i * 37) % 44), 3 + (i % 5), 1, C.grau2);
  }

  // Tür nach draußen
  door(c, 6, 24, 34, 66, C.grau5, C.grau4, C.grau1);
  // Regal
  c.rect(50, 14, 60, 52, C.holz1);
  c.frame(50, 14, 60, 52, C.holz3);
  c.rect(52, 42, 56, 2, C.holz3);
  c.rect(90, 30, 10, 12, C.blau4);
  c.rect(54, 32, 12, 10, C.grau4);
  c.rect(56, 52, 16, 12, C.holz4);
  c.rect(78, 56, 22, 8, C.grau3);
  // Werkbank
  c.rect(158, 58, 84, 5, C.holz5);
  c.rect(158, 58, 84, 1, C.holz6);
  c.rect(160, 63, 5, 27, C.holz3);
  c.rect(235, 63, 5, 27, C.holz3);
  c.rect(170, 72, 62, 2, C.holz3);
  c.rect(176, 66, 12, 6, C.grau3);
  c.rect(222, 53, 10, 5, C.grau4);
  // Uhren: Docs Sammlung, alle gehen anders
  const clocks = [[168, 28, 8], [190, 22, 6], [208, 30, 9], [228, 22, 7]] as const;
  clocks.forEach(([x, y, r], i) => {
    c.poly([[x - r, y - 3], [x - 3, y - r], [x + 3, y - r], [x + r, y - 3], [x + r, y + 3], [x + 3, y + r], [x - 3, y + r], [x - r, y + 3]], C.holz4);
    const inner = r - 2;
    c.poly([[x - inner, y - 2], [x - 2, y - inner], [x + 2, y - inner], [x + inner, y - 2], [x + inner, y + 2], [x + 2, y + inner], [x - 2, y + inner], [x - inner, y + 2]], C.sand2);
    c.line(x, y, x, y - inner + 1, C.schwarz);
    c.line(x, y, x + ((i * 3) % 5) - 2, y + 2, C.schwarz);
  });
  // Riesenverstärker
  c.rect(258, 20, 46, 70, C.grau1);
  c.frame(258, 20, 46, 70, C.grau3);
  c.poly([[272, 34], [290, 34], [296, 42], [296, 54], [290, 62], [272, 62], [266, 54], [266, 42]], C.schwarz);
  c.poly([[276, 42], [286, 42], [289, 46], [289, 50], [286, 54], [276, 54], [273, 50], [273, 46]], C.grau2);
  for (let i = 0; i < 4; i++) c.rect(266 + i * 8, 24, 4, 4, C.grau4);
  c.rect(262, 68, 38, 14, C.grau2);
  c.rect(266, 72, 4, 4, C.rot4);
  // Gitarre angelehnt
  c.poly([[245, 76], [252, 76], [255, 83], [252, 91], [245, 91], [242, 83]], C.rot3);
  c.rect(247, 52, 3, 25, C.holz2);
  c.rect(246, 49, 5, 4, C.holz3);
  c.rect(247, 81, 3, 3, C.schwarz);
  // Schrank
  c.rect(118, 24, 32, 66, C.grau2);
  c.frame(118, 24, 32, 66, C.grau1);
  c.rect(120, 66, 28, 2, C.grau3);
  c.rect(120, 46, 28, 2, C.grau3);
  // Körbchen und Napf am Boden
  c.poly([[12, 110], [42, 110], [46, 122], [8, 122]], C.holz4);
  c.poly([[16, 108], [38, 108], [40, 114], [14, 114]], C.rot2);
  c.rect(8, 120, 38, 2, C.holz2);
  c.poly([[79, 119], [91, 119], [93, 124], [77, 124]], C.blau4);
  c.rect(80, 119, 10, 1, C.grau1);
  c.save(`${dir}/backgrounds/docs_labor_1986.png`);

  const cabinet = new Canvas(32, 66, C.grau4);
  cabinet.frame(0, 0, 32, 66, C.grau1);
  cabinet.rect(15, 1, 2, 64, C.grau1);
  cabinet.rect(12, 30, 2, 6, C.gelb2);
  cabinet.rect(18, 30, 2, 6, C.gelb2);
  cabinet.save(`${dir}/backgrounds/sprites/labor_schrank_zu.png`);

  const food = new Canvas(12, 12, C.orange2);
  food.frame(0, 0, 12, 12, C.orange1);
  food.rect(2, 3, 8, 5, C.sand2);
  food.rect(4, 5, 4, 2, C.holz3);
  food.save(`${dir}/backgrounds/sprites/hundefutter.png`);

  const letter = new Canvas(12, 8, C.weiss);
  letter.frame(0, 0, 12, 8, C.grau4);
  letter.line(1, 1, 5, 4, C.grau4);
  letter.line(10, 1, 6, 4, C.grau4);
  letter.save(`${dir}/backgrounds/sprites/brief.png`);

  const notebook = new Canvas(12, 8, C.rot3);
  notebook.frame(0, 0, 12, 8, C.rot1);
  notebook.rect(1, 0, 1, 8, C.grau6);
  notebook.rect(4, 3, 6, 1, C.sand2);
  notebook.save(`${dir}/backgrounds/sprites/notizbuch.png`);

  const fusion = new Canvas(12, 16);
  fusion.rect(2, 4, 8, 12, C.grau5);
  fusion.frame(2, 4, 8, 12, C.grau3);
  fusion.rect(1, 1, 10, 3, C.grau6);
  fusion.rect(4, 8, 4, 4, C.gelb2);
  fusion.save(`${dir}/backgrounds/sprites/mr_fusion.png`);

  const cloth = new Canvas(14, 7);
  cloth.poly([[1, 1], [12, 0], [13, 5], [7, 6], [0, 5]], C.sand1);
  cloth.line(2, 3, 11, 2, C.holz6);
  cloth.save(`${dir}/backgrounds/sprites/wachstuch.png`);
}

function stadtplan(dir: string, tannenburg: boolean): void {
  const c = new Canvas(320, 144, C.sand2);
  c.gradient(0, 0, 320, 144, [C.sand2, C.sand2, C.sand1]);
  c.frame(2, 2, 316, 140, C.holz3);
  c.frame(4, 4, 312, 136, C.holz5);
  // Straßen
  const road = tannenburg ? C.grau4 : C.holz6;
  c.rect(6, 70, 308, 5, road);
  c.rect(150, 6, 5, 132, road);
  c.line(60, 72, 60, 92, road);
  c.line(61, 72, 61, 92, road);
  c.rect(236, 72, 4, 24, road);
  c.rect(155, 56, 110, 4, road);
  c.rect(262, 44, 4, 14, road);
  // Bach
  c.line(6, 118, 110, 128, C.blau5);
  c.line(6, 119, 110, 129, C.blau5);
  c.line(110, 128, 314, 110, C.blau5);
  c.line(110, 129, 314, 111, C.blau5);
  // Bäume
  const rnd = seeded(tannenburg ? 2 : 1);
  for (let i = 0; i < 26; i++) {
    const x = 14 + Math.floor(rnd() * 290);
    const y = 12 + Math.floor(rnd() * 118);
    if (Math.abs(x - 152) < 26 && y < 68) continue;
    c.rect(x, y, 3, 3, tannenburg ? C.grau4 : C.gruen5);
  }

  // Rathausturm
  c.rect(142, 28, 22, 34, C.grau5);
  c.frame(142, 28, 22, 34, C.grau2);
  c.poly([[140, 28], [153, 12], [166, 28]], tannenburg ? C.rot3 : C.gruen3);
  c.rect(148, 34, 10, 10, C.weiss);
  c.frame(148, 34, 10, 10, C.grau1);
  c.line(153, 39, 153, 35, C.schwarz);
  c.line(153, 39, 156, 39, C.schwarz);
  // Schule
  c.rect(240, 26, 46, 22, C.rot4);
  c.poly([[238, 26], [263, 16], [288, 26]], C.grau3);
  c.rect(258, 36, 8, 12, C.holz2);
  for (let x = 244; x < 284; x += 10) if (x < 254 || x > 268) c.rect(x, 31, 5, 5, C.blau7);
  // Martys Haus
  c.rect(44, 92, 34, 20, C.weiss);
  c.poly([[40, 92], [61, 80], [82, 92]], C.rot3);
  c.rect(58, 101, 6, 11, C.rot2);
  c.rect(48, 96, 6, 6, C.blau6);
  c.rect(68, 96, 6, 6, C.blau6);
  // Docs Labor
  c.rect(224, 100, 36, 22, C.grau4);
  c.frame(224, 100, 36, 22, C.grau2);
  c.rect(238, 108, 8, 14, C.grau1);
  c.rect(228, 104, 6, 5, C.gelb3);
  c.rect(250, 104, 6, 5, C.gelb3);
  c.poly([[222, 100], [242, 92], [262, 100]], C.grau2);

  const name = tannenburg ? 'TANNENBURG' : 'HILL VALLEY';
  drawText(c, name, 12, 10, tannenburg ? C.rot2 : C.holz2);
  if (tannenburg) {
    // Überall Tannen-Werbung
    for (const [x, y] of [[84, 44], [188, 80], [100, 96]] as const) {
      c.rect(x, y, 22, 12, C.rot3);
      c.frame(x, y, 22, 12, C.gelb2);
      drawText(c, 'T', x + 9, y, C.gelb2);
    }
  }
  c.save(`${dir}/backgrounds/stadtplan_1986${tannenburg ? '_tannenburg' : ''}.png`);
}

export function buildPrologBackgrounds(dir: string): void {
  martysZimmer(dir);
  kueche(dir);
  arbeitszimmer(dir);
  vorgarten(dir, false);
  vorgarten(dir, true);
  auto(dir);
  labor(dir);
  stadtplan(dir, false);
  stadtplan(dir, true);
}
