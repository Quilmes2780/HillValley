import { C } from './palette.ts';
import { Canvas } from './png.ts';

export function buildUi(dir: string): void {
  // Leiste unter der Szene: y 144–199 (320×56)
  const panel = new Canvas(320, 56, C.schwarz);
  panel.rect(0, 10, 320, 46, C.blau1);
  panel.rect(0, 10, 320, 1, C.blau3);

  // Inventarfelder: x 132–283, zwei Reihen à 4 × (38×22)
  for (let row = 0; row < 2; row++) {
    for (let col = 0; col < 4; col++) {
      const x = 132 + col * 38;
      const y = 11 + row * 22 + 1;
      panel.rect(x, y, 37, 21, C.blau2);
      panel.frame(x, y, 37, 21, C.blau3);
    }
  }
  panel.save(`${dir}/ui/panel.png`);

  // Dieselbe Leiste ohne Felder, für die Antwortauswahl im Dialog
  const plain = new Canvas(320, 56, C.schwarz);
  plain.rect(0, 10, 320, 46, C.blau1);
  plain.rect(0, 10, 320, 1, C.blau3);
  plain.save(`${dir}/ui/panel_plain.png`);

  // Blätterpfeile: 11×21
  const arrow = (up: boolean, color: number, base: number): Canvas => {
    const c = new Canvas(11, 21, base);
    c.frame(0, 0, 11, 21, C.blau3);
    for (let i = 0; i < 4; i++) {
      const y = up ? 8 + i : 13 - i;
      c.rect(5 - i, y, 1 + i * 2, 1, color);
    }
    return c;
  };
  arrow(true, C.tuerkis5, C.blau2).save(`${dir}/ui/arrow_up.png`);
  arrow(false, C.tuerkis5, C.blau2).save(`${dir}/ui/arrow_down.png`);
  arrow(true, C.grau3, C.blau1).save(`${dir}/ui/arrow_up_off.png`);
  arrow(false, C.grau3, C.blau1).save(`${dir}/ui/arrow_down_off.png`);

  // Mauszeiger: Fadenkreuz 11×11
  const cursor = new Canvas(11, 11);
  for (const [x, y, w, h] of [
    [5, 0, 1, 4],
    [5, 7, 1, 4],
    [0, 5, 4, 1],
    [7, 5, 4, 1],
  ] as const) {
    cursor.rect(x, y, w, h, C.gelb3);
  }
  cursor.save(`${dir}/ui/cursor.png`);

  // Auswahlrahmen für aktive Figur: 24×15
  const active = new Canvas(24, 15);
  active.frame(0, 0, 24, 15, C.gelb2);
  active.save(`${dir}/ui/portrait_active.png`);

  // Hintergrund des Speichermenüs: 240×150
  const menu = new Canvas(240, 150, C.blau1);
  menu.frame(0, 0, 240, 150, C.blau5);
  menu.frame(1, 1, 238, 148, C.blau3);
  menu.save(`${dir}/ui/menu.png`);
}
