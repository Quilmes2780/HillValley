import { C } from './palette.ts';
import { Canvas } from './png.ts';

// Kugelschreiber (Martys Zimmer) und Banane (Küche) hat der Nutzer gezeichnet; sie werden hier nicht mehr erzeugt.

function labor(dir: string): void {
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

export function buildPrologBackgrounds(dir: string): void {
  labor(dir);
}
