import { drawText } from './font.ts';
import { C } from './palette.ts';
import { Canvas, seeded } from './png.ts';
import { baseboard, door } from './prolog.ts';

const FLOOR_Y = 88;

function sprite(dir: string, name: string, w: number, h: number, paint: (c: Canvas) => void): void {
  const c = new Canvas(w, h);
  paint(c);
  c.save(`${dir}/backgrounds/sprites/${name}.png`);
}

/** Der Platz vor dem Turm. 1986 als Tannen-Turm oder Rathaus, 1955 mit Café und Radioladen. */
function rathausplatz(dir: string, kind: 'tannen' | 'rathaus' | '1955'): void {
  const old = kind === '1955';
  const c = new Canvas(320, 144, C.schwarz);
  c.gradient(0, 0, 320, 92, old ? [C.tuerkis4, C.tuerkis5, C.tuerkis6] : kind === 'tannen' ? [C.grau4, C.grau5, C.orange3] : [C.blau5, C.blau6, C.blau7]);
  c.gradient(0, 90, 320, 54, old ? [C.grau4, C.grau5, C.grau5] : [C.grau3, C.grau4, C.grau5]);
  for (let y = 96; y < 144; y += 8) c.rect(0, y, 320, 1, C.grau3);

  // Rathaus mit Turm
  const wall = old ? C.sand1 : C.grau5;
  c.rect(100, 34, 120, 58, wall);
  c.frame(100, 34, 120, 58, C.grau2);
  c.rect(142, 6, 36, 30, wall);
  c.frame(142, 6, 36, 30, C.grau2);
  c.poly([[138, 8], [160, 0], [182, 8]], kind === 'tannen' ? C.rot3 : C.gruen3);
  // Uhr: 1955 steht sie seit dem Blitz
  c.poly([[152, 12], [168, 12], [172, 18], [172, 26], [168, 32], [152, 32], [148, 26], [148, 18]], C.weiss);
  c.line(160, 22, old ? 155 : 160, old ? 19 : 14, C.schwarz);
  c.line(160, 22, old ? 161 : 166, old ? 15 : 22, C.schwarz);
  // Fenster
  for (const x of [108, 124, 190, 206]) {
    c.rect(x, 54, 8, 14, C.blau3);
    c.frame(x, 54, 8, 14, C.grau2);
  }
  door(c, 146, 60, 28, 32, C.holz3, C.holz2, C.grau2);
  c.rect(118, 40, 84, 11, kind === 'tannen' ? C.rot2 : C.holz3);
  const label = kind === 'tannen' ? 'TANNEN-TURM' : 'RATHAUS';
  drawText(c, label, kind === 'tannen' ? 133 : 142, 40, kind === 'tannen' ? C.gelb2 : C.sand2);
  // Grundstein von 1885
  c.rect(104, 80, 18, 12, C.grau4);
  c.frame(104, 80, 18, 12, C.grau2);
  c.rect(108, 84, 10, 2, C.grau2);

  if (old) {
    // Lous Café
    c.rect(8, 40, 82, 52, C.rot6);
    c.frame(8, 40, 82, 52, C.rot3);
    c.rect(8, 40, 82, 12, C.tuerkis2);
    drawText(c, 'LOU', 40, 41, C.pink4);
    c.rect(14, 58, 20, 18, C.blau7);
    c.rect(68, 58, 18, 18, C.blau7);
    door(c, 40, 56, 22, 36, C.tuerkis3, C.tuerkis2, C.weiss);
    // Radioladen
    c.rect(230, 40, 68, 52, C.gelb3);
    c.frame(230, 40, 68, 52, C.orange1);
    c.rect(230, 40, 68, 12, C.orange1);
    drawText(c, 'RADIO', 249, 41, C.weiss);
    c.rect(234, 58, 16, 18, C.blau7);
    c.rect(238, 64, 8, 8, C.holz3);
    door(c, 254, 56, 22, 36, C.orange2, C.orange1, C.weiss);
    c.rect(280, 58, 14, 18, C.blau7);
  } else {
    // Lautsprechersäule
    c.rect(38, 30, 14, 62, C.grau2);
    c.frame(38, 30, 14, 62, C.grau1);
    c.poly([[34, 18], [56, 18], [52, 30], [38, 30]], C.grau3);
    c.rect(40, 21, 10, 3, C.schwarz);
    c.rect(40, 66, 10, 10, C.grau4);
    c.frame(40, 66, 10, 10, C.grau1);
    c.rect(44, 70, 2, 2, C.gelb2);
    // Bank rechts
    c.rect(232, 44, 66, 48, C.grau4);
    c.frame(232, 44, 66, 48, C.grau2);
    c.rect(232, 44, 66, 11, kind === 'tannen' ? C.rot2 : C.grau3);
    drawText(c, kind === 'tannen' ? 'TANNEN BANK' : 'BANK', kind === 'tannen' ? 234 : 256, 44, kind === 'tannen' ? C.gelb2 : C.weiss);
    c.rect(240, 62, 14, 18, C.blau3);
    c.rect(276, 62, 14, 18, C.blau3);
    c.rect(260, 66, 12, 26, C.holz2);
    if (kind === 'tannen') {
      c.rect(60, 34, 34, 22, C.rot3);
      c.frame(60, 34, 34, 22, C.gelb2);
      drawText(c, 'B.T.', 66, 39, C.gelb2);
      c.rect(66, 56, 3, 36, C.grau1);
      c.rect(86, 56, 3, 36, C.grau1);
    }
  }
  if (kind === 'rathaus') {
    // Gleise für die Rückkehr des Zuges (Kapitel 4)
    c.rect(0, 132, 320, 2, C.grau1);
    c.rect(0, 138, 320, 2, C.grau1);
    for (let x = 4; x < 320; x += 10) c.rect(x, 130, 3, 12, C.holz2);
  }
  const suffix = old ? '1955' : kind === 'tannen' ? '1986_tannenburg' : '1986';
  c.save(`${dir}/backgrounds/rathausplatz_${suffix}.png`);
}

function turmeingang(dir: string): void {
  const c = new Canvas(320, 144, C.schwarz);
  c.gradient(0, 0, 320, FLOOR_Y, [C.grau1, C.grau2, C.grau3]);
  const rnd = seeded(7);
  for (let y = 0; y < FLOOR_Y; y += 12) {
    c.rect(0, y, 320, 1, C.grau1);
    for (let x = Math.floor(rnd() * 30); x < 320; x += 24 + Math.floor(rnd() * 20)) c.rect(x, y, 1, 12, C.grau1);
  }
  baseboard(c, C.grau1, C.grau3);
  c.gradient(0, FLOOR_Y, 320, 56, [C.holz2, C.holz3, C.holz3]);
  door(c, 14, 24, 36, 64, C.holz3, C.holz2, C.grau1);
  // Schaukasten
  c.rect(92, 28, 44, 34, C.holz3);
  c.rect(95, 31, 38, 28, C.sand2);
  c.rect(99, 36, 30, 2, C.grau3);
  c.rect(99, 42, 22, 2, C.grau3);
  c.rect(99, 48, 26, 2, C.grau3);
  // Treppe nach oben
  c.rect(250, 12, 60, 76, C.schwarz);
  for (let i = 0; i < 8; i++) {
    c.rect(250 + i * 3, 80 - i * 9, 60 - i * 3, 4, C.holz5);
    c.rect(250 + i * 3, 84 - i * 9, 60 - i * 3, 5, C.holz3);
  }
  c.save(`${dir}/backgrounds/turmeingang_1986.png`);

  sprite(dir, 'bueste', 26, 38, (s) => {
    s.rect(4, 26, 18, 12, C.grau3);
    s.rect(6, 22, 14, 4, C.grau4);
    s.poly([[8, 4], [18, 4], [20, 10], [18, 18], [14, 22], [12, 22], [8, 18], [6, 10]], C.gelb1);
    s.rect(7, 2, 12, 4, C.gelb1);
    s.rect(10, 9, 2, 2, C.schwarz);
    s.rect(15, 9, 2, 2, C.schwarz);
  });
}

function uhrwerk(dir: string, era: 1955 | 1986): void {
  const old = era === 1955;
  const c = new Canvas(320, 144, C.schwarz);
  c.gradient(0, 0, 320, FLOOR_Y, old ? [C.holz1, C.holz2, C.holz3] : [C.grau1, C.grau2, C.holz2]);
  baseboard(c, C.holz1, C.holz3);
  c.gradient(0, FLOOR_Y, 320, 56, [C.holz2, C.holz3, C.holz4]);
  for (let x = 8; x < 320; x += 24) c.line(x, FLOOR_Y, x + (x - 160) / 2, 143, C.holz1);

  // Treppe nach unten
  c.rect(4, 34, 26, 54, C.schwarz);
  c.frame(4, 34, 26, 54, C.holz4);
  for (let i = 0; i < 4; i++) c.rect(6, 74 + i * 3, 22, 1, C.holz3);

  // Zifferblatt von hinten
  const glow = old ? C.sand1 : C.gelb3;
  c.poly([[148, 6], [182, 6], [196, 20], [196, 44], [182, 58], [148, 58], [134, 44], [134, 20]], glow);
  c.line(165, 32, 165, 12, C.holz1);
  c.line(165, 32, 180, 32, C.holz1);
  c.rect(163, 30, 5, 5, C.holz1);

  // Zahnräder
  const gear = (x: number, y: number, r: number, color: number): void => {
    const pts: [number, number][] = [];
    for (let i = 0; i < 16; i++) {
      const a = (i / 16) * Math.PI * 2;
      const rr = i % 2 === 0 ? r : r - 3;
      pts.push([x + Math.cos(a) * rr, y + Math.sin(a) * rr]);
    }
    c.poly(pts, color);
    c.poly([[x - r / 3, y - r / 3], [x + r / 3, y - r / 3], [x + r / 3, y + r / 3], [x - r / 3, y + r / 3]], C.holz1);
  };
  gear(62, 40, 24, C.gelb1);
  gear(102, 56, 18, C.orange1);
  gear(98, 22, 14, C.gelb1);
  c.rect(40, 62, 80, 4, C.holz2);

  // Chronopost: Messingkasten
  c.rect(206, 46, 60, 42, C.gelb1);
  c.frame(206, 46, 60, 42, C.orange1);
  c.rect(206, 46, 60, 3, C.gelb2);
  c.rect(212, 52, 22, 3, C.schwarz); // Einwurfschlitz
  c.rect(238, 54, 16, 16, C.orange1); // Wählrad
  c.poly([[240, 57], [252, 57], [252, 67], [240, 67]], C.gelb3);
  c.line(246, 62, 246, 58, C.schwarz);
  c.rect(212, 72, 22, 10, C.holz2); // Empfangsfach
  c.frame(212, 72, 22, 10, C.orange1);
  // Sendehebel
  c.rect(267, 64, 6, 8, C.grau2);
  c.line(270, 64, 276, 46, C.grau5);
  c.line(271, 64, 277, 46, C.grau5);
  c.rect(274, 42, 6, 5, C.rot4);
  c.save(`${dir}/backgrounds/uhrwerk_${era}.png`);
}

function uhrwerkSprites(dir: string): void {
  sprite(dir, 'chronopost_lampe', 8, 6, (s) => {
    s.rect(0, 0, 8, 6, C.grau1);
    s.rect(1, 1, 6, 4, C.neon);
    s.rect(2, 1, 2, 1, C.weiss);
  });
  sprite(dir, 'kabel_kasten', 24, 30, (s) => {
    // vom Anschlusskasten zum Boden
    s.line(2, 0, 2, 22, C.schwarz);
    s.line(2, 22, 20, 28, C.schwarz);
    s.line(3, 0, 3, 22, C.orange1);
    s.line(3, 22, 21, 28, C.orange1);
  });
  sprite(dir, 'diktiergeraet', 14, 10, (s) => {
    s.rect(0, 1, 14, 9, C.grau2);
    s.frame(0, 1, 14, 9, C.grau1);
    s.rect(3, 3, 8, 4, C.grau4);
    s.rect(10, 0, 3, 2, C.rot4);
  });
  sprite(dir, 'kasten_offen', 12, 12, (s) => {
    s.rect(1, 1, 10, 10, C.schwarz);
    s.frame(1, 1, 10, 10, C.grau4);
    s.rect(3, 3, 2, 2, C.rot4);
    s.rect(7, 3, 2, 2, C.gelb2);
    s.rect(3, 7, 6, 1, C.grau5);
  });
}

function schuleFlur(dir: string, era: 1955 | 1986): void {
  const old = era === 1955;
  const c = new Canvas(320, 144, C.schwarz);
  c.gradient(0, 0, 320, FLOOR_Y, old ? [C.tuerkis5, C.tuerkis6, C.tuerkis5] : [C.grau5, C.grau6, C.grau5]);
  c.rect(0, 0, 320, 6, C.grau2);
  baseboard(c, C.holz3, C.holz4);
  const a = old ? C.holz5 : C.grau3;
  const b = old ? C.holz6 : C.grau4;
  for (let y = FLOOR_Y; y < 144; y += 6) c.rect(0, y, 320, 6, (y / 6) % 2 === 0 ? a : b);

  door(c, 36, 24, 34, 64, C.holz4, C.holz3, C.grau3);
  c.rect(42, 12, 22, 8, C.schwarz);
  door(c, 116, 24, 34, 64, C.holz4, C.holz3, C.grau3);
  c.rect(122, 12, 22, 8, C.schwarz);

  // Spinde
  const locker = old ? C.tuerkis2 : C.blau3;
  const lockerDark = old ? C.tuerkis1 : C.blau1;
  for (let x = 162; x < 290; x += 24) {
    c.rect(x, 26, 22, 62, locker);
    c.frame(x, 26, 22, 62, lockerDark);
    c.rect(x + 5, 32, 12, 2, lockerDark);
    c.rect(x + 5, 36, 12, 2, lockerDark);
    c.rect(x + 16, 52, 3, 8, C.grau5);
  }
  // Schwarzes Brett
  c.rect(78, 26, 30, 28, C.holz4);
  c.rect(80, 28, 26, 24, C.holz6);
  c.rect(83, 31, 9, 8, C.weiss);
  c.rect(94, 34, 9, 10, C.gelb3);
  c.rect(84, 42, 8, 7, C.pink4);

  // Ausgang rechts
  door(c, 294, 22, 24, 66, old ? C.tuerkis3 : C.grau4, old ? C.tuerkis2 : C.grau3, C.grau2);
  c.save(`${dir}/backgrounds/schule_flur_${era}.png`);
}

function bandraum(dir: string): void {
  const c = new Canvas(320, 144, C.schwarz);
  c.gradient(0, 0, 320, FLOOR_Y, [C.violett2, C.violett3, C.violett2]);
  baseboard(c, C.grau1, C.grau3);
  c.gradient(0, FLOOR_Y, 320, 56, [C.grau2, C.grau3, C.grau3]);
  door(c, 270, 24, 36, 64, C.holz4, C.holz3, C.grau3);
  // Schlagzeug
  c.poly([[60, 60], [90, 60], [96, 72], [90, 88], [60, 88], [54, 72]], C.rot4);
  c.poly([[66, 66], [84, 66], [88, 74], [84, 84], [66, 84], [62, 74]], C.rot6);
  c.rect(30, 52, 22, 6, C.gelb1);
  c.rect(40, 58, 2, 30, C.grau5);
  c.rect(96, 56, 18, 8, C.grau5);
  c.rect(104, 64, 2, 24, C.grau5);
  // Verstärker und Bandposter
  c.rect(140, 48, 44, 40, C.grau1);
  c.frame(140, 48, 44, 40, C.grau4);
  c.rect(146, 54, 32, 22, C.grau2);
  c.rect(146, 80, 6, 4, C.rot4);
  c.rect(200, 20, 42, 30, C.schwarz);
  c.frame(200, 20, 42, 30, C.grau5);
  c.rect(206, 26, 30, 6, C.orange3);
  c.rect(206, 36, 18, 3, C.weiss);
  c.save(`${dir}/backgrounds/bandraum_1986.png`);

  sprite(dir, 'kabelrolle', 18, 12, (s) => {
    s.poly([[4, 1], [14, 1], [17, 5], [14, 11], [4, 11], [1, 5]], C.orange1);
    s.poly([[6, 3], [12, 3], [14, 6], [12, 9], [6, 9], [4, 6]], C.schwarz);
  });
}

function schuelerzeitung(dir: string): void {
  const c = new Canvas(320, 144, C.schwarz);
  c.gradient(0, 0, 320, FLOOR_Y, [C.sand1, C.sand2, C.sand1]);
  baseboard(c, C.holz3, C.holz4);
  c.gradient(0, FLOOR_Y, 320, 56, [C.tuerkis2, C.tuerkis3, C.tuerkis3]);
  door(c, 14, 24, 36, 64, C.holz4, C.holz3, C.grau3);
  // Pinnwand mit Artikeln
  c.rect(70, 14, 96, 42, C.holz4);
  c.rect(72, 16, 92, 38, C.holz6);
  const rnd = seeded(5);
  for (let i = 0; i < 9; i++) {
    const x = 74 + (i % 5) * 18;
    const y = 18 + Math.floor(i / 5) * 18;
    c.rect(x, y, 14, 14, C.weiss);
    c.rect(x + 2, y + 2, 10, 2, C.grau2);
    for (let l = 0; l < 3; l++) c.rect(x + 2, y + 6 + l * 2, 6 + Math.floor(rnd() * 5), 1, C.grau4);
  }
  // Tisch mit Schreibmaschine und Kassettenrekorder
  c.rect(186, 60, 90, 5, C.holz5);
  c.rect(188, 65, 5, 27, C.holz3);
  c.rect(268, 65, 5, 27, C.holz3);
  c.rect(196, 50, 26, 10, C.grau2);
  c.rect(202, 42, 14, 9, C.weiss);
  c.rect(238, 52, 22, 8, C.grau3);
  c.rect(242, 54, 6, 4, C.grau1);
  c.rect(251, 54, 6, 4, C.grau1);
  c.save(`${dir}/backgrounds/schuelerzeitung_1986.png`);
}

function docsLabor1955(dir: string): void {
  const c = new Canvas(320, 144, C.schwarz);
  c.gradient(0, 0, 320, FLOOR_Y, [C.gruen2, C.gruen3, C.gruen3]);
  for (let x = 4; x < 320; x += 12) c.rect(x, 0, 1, FLOOR_Y, C.gruen2);
  baseboard(c, C.holz2, C.holz4);
  c.gradient(0, FLOOR_Y, 320, 56, [C.holz3, C.holz4, C.holz4]);
  for (let y = FLOOR_Y + 8; y < 144; y += 10) c.rect(0, y, 320, 1, C.holz2);
  // Kamin
  c.rect(16, 24, 68, 64, C.grau3);
  c.frame(16, 24, 68, 64, C.grau1);
  c.rect(12, 20, 76, 6, C.holz3);
  c.rect(28, 44, 44, 44, C.schwarz);
  c.poly([[34, 88], [40, 66], [46, 74], [52, 58], [58, 72], [64, 66], [68, 88]], C.orange2);
  c.poly([[42, 88], [46, 76], [52, 70], [58, 78], [60, 88]], C.gelb2);
  // Werkbank
  c.rect(136, 60, 96, 5, C.holz5);
  c.rect(136, 60, 96, 1, C.holz6);
  c.rect(138, 65, 5, 27, C.holz2);
  c.rect(225, 65, 5, 27, C.holz2);
  // Tafel mit Formeln
  c.rect(136, 12, 96, 34, C.gruen1);
  c.frame(136, 12, 96, 34, C.holz4);
  const rnd = seeded(55);
  for (let i = 0; i < 7; i++) {
    c.rect(142 + Math.floor(rnd() * 30), 16 + i * 4, 20 + Math.floor(rnd() * 34), 1, C.grau6);
  }
  // Ständer für den Helm
  c.rect(102, 58, 3, 30, C.grau3);
  c.rect(96, 86, 15, 2, C.grau3);
  // Tür
  door(c, 270, 24, 36, 64, C.holz4, C.holz3, C.grau6);
  c.save(`${dir}/backgrounds/docs_labor_1955.png`);

  sprite(dir, 'helm', 26, 22, (s) => {
    s.poly([[4, 8], [8, 3], [18, 3], [22, 8], [22, 16], [4, 16]], C.grau5);
    s.rect(4, 15, 18, 3, C.grau3);
    for (let x = 6; x < 22; x += 4) s.line(x, 3, x + 1, 0, C.orange1);
    s.rect(8, 7, 3, 3, C.rot4);
    s.rect(15, 7, 3, 3, C.gelb2);
  });
  sprite(dir, 'helm_ohne_spule', 26, 22, (s) => {
    s.poly([[4, 8], [8, 3], [18, 3], [22, 8], [22, 16], [4, 16]], C.grau5);
    s.rect(4, 15, 18, 3, C.grau3);
    s.rect(8, 7, 3, 3, C.grau2);
    s.rect(15, 7, 3, 3, C.grau2);
  });
  sprite(dir, 'schraubenzieher', 14, 4, (s) => {
    s.rect(0, 1, 5, 3, C.rot4);
    s.rect(5, 2, 9, 1, C.grau6);
  });
  sprite(dir, 'zigarrenkiste', 18, 9, (s) => {
    s.rect(0, 0, 18, 9, C.holz4);
    s.frame(0, 0, 18, 9, C.holz2);
    s.rect(5, 3, 8, 3, C.sand2);
  });
}

function cafe(dir: string): void {
  const c = new Canvas(320, 144, C.schwarz);
  c.gradient(0, 0, 320, FLOOR_Y, [C.tuerkis4, C.tuerkis5, C.tuerkis5]);
  c.rect(0, 0, 320, 6, C.rot3);
  c.rect(0, FLOOR_Y - 4, 320, 4, C.grau2);
  // Schachbrettboden
  for (let y = FLOOR_Y; y < 144; y += 8) {
    for (let x = 0; x < 320; x += 12) c.rect(x, y, 12, 8, ((x / 12 + y / 8) | 0) % 2 === 0 ? C.grau6 : C.grau2);
  }
  door(c, 6, 28, 30, 60, C.tuerkis3, C.tuerkis2, C.weiss);
  // Regal hinter der Theke
  c.rect(84, 22, 150, 34, C.holz3);
  c.rect(84, 36, 150, 2, C.holz2);
  for (let x = 90; x < 228; x += 12) {
    c.rect(x, 26, 6, 10, x % 24 === 6 ? C.rot4 : C.gelb1);
    c.rect(x + 2, 42, 6, 10, x % 36 === 6 ? C.blau5 : C.weiss);
  }
  // Musikbox
  c.poly([[272, 40], [284, 32], [296, 40], [298, 88], [270, 88]], C.pink3);
  c.rect(275, 44, 18, 16, C.gelb3);
  c.rect(275, 64, 18, 18, C.pink1);
  c.save(`${dir}/backgrounds/cafe_1955.png`);

  sprite(dir, 'cafe_theke', 170, 30, (s) => {
    s.rect(0, 0, 170, 5, C.grau6);
    s.rect(0, 5, 170, 25, C.rot3);
    for (let x = 6; x < 170; x += 28) s.rect(x, 9, 14, 17, C.rot2);
  });
  sprite(dir, 'mixer', 14, 18, (s) => {
    s.rect(3, 0, 8, 10, C.blau7);
    s.frame(3, 0, 8, 10, C.grau3);
    s.rect(2, 10, 10, 8, C.grau5);
    s.rect(5, 13, 4, 2, C.rot4);
  });
}

function radioladen(dir: string): void {
  const c = new Canvas(320, 144, C.schwarz);
  c.gradient(0, 0, 320, FLOOR_Y, [C.sand1, C.sand2, C.sand1]);
  baseboard(c, C.holz3, C.holz4);
  c.gradient(0, FLOOR_Y, 320, 56, [C.holz4, C.holz5, C.holz5]);
  door(c, 270, 24, 36, 64, C.orange2, C.orange1, C.weiss);
  // Regale voller Radios
  c.rect(20, 14, 150, 44, C.holz2);
  c.rect(20, 34, 150, 2, C.holz4);
  const rnd = seeded(19);
  for (let x = 26; x < 160; x += 24) {
    for (const y of [20, 42]) {
      const color = [C.holz4, C.rot3, C.tuerkis3, C.grau4][Math.floor(rnd() * 4)];
      c.rect(x, y, 18, 12, color);
      c.rect(x + 2, y + 2, 7, 8, C.sand2);
      c.rect(x + 12, y + 3, 3, 3, C.gelb2);
    }
  }
  // Fernseher
  c.rect(184, 28, 44, 40, C.holz3);
  c.rect(188, 32, 28, 24, C.grau2);
  c.rect(192, 35, 20, 18, C.blau7);
  c.rect(220, 36, 4, 4, C.gelb2);
  c.rect(220, 46, 4, 4, C.gelb2);
  c.rect(200, 22, 1, 6, C.grau1);
  c.rect(212, 22, 1, 6, C.grau1);
  c.save(`${dir}/backgrounds/radioladen_1955.png`);

  sprite(dir, 'laden_theke', 180, 28, (s) => {
    s.rect(0, 0, 180, 4, C.holz6);
    s.rect(0, 4, 180, 24, C.holz3);
    for (let x = 8; x < 180; x += 40) s.rect(x, 8, 26, 16, C.holz2);
    // Elektronenröhren in der Auslage
    for (const x of [12, 20, 28]) {
      s.rect(x, 12, 4, 8, C.blau8);
      s.rect(x + 1, 18, 2, 3, C.grau2);
    }
  });
}

function strasse(dir: string): void {
  const c = new Canvas(320, 144, C.schwarz);
  c.gradient(0, 0, 320, 84, [C.tuerkis4, C.tuerkis5, C.tuerkis6]);
  c.rect(0, 62, 320, 28, C.gruen5);
  for (let x = 6; x < 320; x += 42) {
    c.rect(x, 44, 28, 34, C.sand2);
    c.poly([[x - 3, 44], [x + 14, 30], [x + 31, 44]], C.rot3);
    c.rect(x + 11, 62, 7, 16, C.holz3);
  }
  c.gradient(0, 86, 320, 58, [C.grau3, C.grau4, C.grau4]);
  c.rect(0, 86, 320, 3, C.grau6);
  for (let x = 6; x < 320; x += 36) c.rect(x, 118, 18, 2, C.weiss);
  c.save(`${dir}/backgrounds/strasse_1955.png`);

  sprite(dir, 'mistlaster', 112, 58, (s) => {
    // Führerhaus
    s.rect(82, 16, 30, 28, C.gruen3);
    s.rect(88, 20, 18, 12, C.blau7);
    s.rect(82, 44, 30, 6, C.gruen2);
    // Ladefläche mit Mist
    s.rect(0, 26, 78, 24, C.holz3);
    s.frame(0, 26, 78, 24, C.holz1);
    s.poly([[4, 26], [18, 10], [38, 2], [58, 8], [74, 26]], C.holz2);
    s.poly([[20, 22], [32, 10], [46, 14], [56, 22]], C.holz1);
    // Räder
    for (const x of [14, 90]) {
      s.poly([[x, 46], [x + 10, 46], [x + 14, 52], [x + 10, 57], [x, 57], [x - 4, 52]], C.schwarz);
      s.rect(x + 3, 50, 4, 4, C.grau5);
    }
  });
  sprite(dir, 'mist_beine', 20, 16, (s) => {
    s.rect(4, 0, 4, 12, C.grau2);
    s.rect(12, 2, 4, 10, C.grau2);
    s.rect(2, 0, 6, 2, C.schwarz);
    s.rect(12, 0, 6, 2, C.schwarz);
  });
}

function stadtplan1955(dir: string): void {
  const c = new Canvas(320, 144, C.sand2);
  c.gradient(0, 0, 320, 144, [C.sand2, C.sand2, C.sand1]);
  c.frame(2, 2, 316, 140, C.tuerkis3);
  c.frame(4, 4, 312, 136, C.tuerkis4);
  const road = C.holz6;
  c.rect(6, 70, 308, 5, road);
  c.rect(150, 6, 5, 132, road);
  c.rect(60, 76, 3, 22, road);
  c.rect(155, 56, 110, 4, road);
  c.rect(262, 44, 4, 14, road);
  const rnd = seeded(1955);
  for (let i = 0; i < 34; i++) {
    const x = 14 + Math.floor(rnd() * 290);
    const y = 12 + Math.floor(rnd() * 118);
    if (Math.abs(x - 152) < 26 && y < 68) continue;
    c.rect(x, y, 3, 3, C.gruen5);
  }
  // Rathausturm
  c.rect(142, 28, 22, 34, C.sand1);
  c.frame(142, 28, 22, 34, C.grau2);
  c.poly([[140, 28], [153, 12], [166, 28]], C.gruen3);
  c.rect(148, 34, 10, 10, C.weiss);
  c.frame(148, 34, 10, 10, C.grau1);
  c.line(153, 39, 150, 37, C.schwarz);
  c.line(153, 39, 154, 35, C.schwarz);
  // Schule
  c.rect(240, 26, 46, 22, C.rot4);
  c.poly([[238, 26], [263, 16], [288, 26]], C.grau3);
  c.rect(258, 36, 8, 12, C.holz2);
  // Docs Villa
  c.rect(44, 96, 38, 24, C.weiss);
  c.frame(44, 96, 38, 24, C.grau3);
  c.poly([[40, 96], [63, 80], [86, 96]], C.gruen2);
  c.rect(58, 106, 8, 14, C.holz3);
  for (const x of [48, 72]) c.rect(x, 100, 6, 8, C.blau6);
  c.rect(74, 80, 5, 10, C.grau3); // Kamin
  drawText(c, 'HILL VALLEY', 12, 10, C.tuerkis2);
  drawText(c, '1955', 12, 22, C.tuerkis2);
  c.save(`${dir}/backgrounds/stadtplan_1955.png`);
}

export function buildK1K2Backgrounds(dir: string): void {
  rathausplatz(dir, 'tannen');
  rathausplatz(dir, 'rathaus');
  rathausplatz(dir, '1955');
  turmeingang(dir);
  uhrwerk(dir, 1986);
  uhrwerk(dir, 1955);
  uhrwerkSprites(dir);
  schuleFlur(dir, 1986);
  schuleFlur(dir, 1955);
  bandraum(dir);
  schuelerzeitung(dir);
  docsLabor1955(dir);
  cafe(dir);
  radioladen(dir);
  strasse(dir);
  stadtplan1955(dir);

  sprite(dir, 'zeitung', 16, 8, (s) => {
    s.poly([[1, 2], [14, 0], [15, 6], [2, 7]], C.grau6);
    s.line(3, 3, 12, 2, C.grau3);
    s.line(4, 5, 13, 4, C.grau4);
  });
  sprite(dir, 'spind_offen', 22, 62, (s) => {
    s.rect(0, 0, 22, 62, C.schwarz);
    s.frame(0, 0, 22, 62, C.tuerkis1);
    s.rect(2, 22, 18, 2, C.tuerkis2);
  });
  sprite(dir, 'mappe', 14, 10, (s) => {
    s.rect(0, 0, 14, 10, C.holz4);
    s.frame(0, 0, 14, 10, C.holz1);
    s.rect(4, 3, 6, 2, C.sand2);
  });
}
