import { mkdirSync, writeFileSync } from 'node:fs';
import { C } from './palette.ts';
import { Canvas } from './png.ts';
import { drawGlyph } from './font.ts';

const FW = 32;
const FH = 56;

type View = 'side' | 'front' | 'back';
interface Pose {
  view: View;
  /** Bein-Versatz: linkes und rechtes Bein in Pixeln (horizontal bei side, Länge sonst). */
  legA: number;
  legB: number;
  bob: number;
  mouth?: boolean;
  armUp?: boolean;
}

/** Neutrale Silhouette mit Buchstabe: bewusst keine erkennbare Figur. */
function drawFigure(c: Canvas, ox: number, pose: Pose, body: number, shade: number, letter: string): void {
  const cx = ox + 16;
  const y = 4 + pose.bob; // Kopf oben, Füße bei y=53
  // Kopf
  c.rect(cx - 5, y, 10, 11, C.grau5);
  c.frame(cx - 5, y, 10, 11, C.grau3);
  if (pose.view === 'front') {
    c.rect(cx - 3, y + 4, 2, 2, C.schwarz);
    c.rect(cx + 1, y + 4, 2, 2, C.schwarz);
    if (pose.mouth) c.rect(cx - 2, y + 8, 4, 2, C.schwarz);
  } else if (pose.view === 'side') {
    c.rect(cx + 2, y + 4, 2, 2, C.schwarz);
    c.rect(cx + 5, y + 5, 1, 2, C.grau5); // Nase zeigt die Blickrichtung
    if (pose.mouth) c.rect(cx + 2, y + 8, 3, 2, C.schwarz);
  }
  // Rumpf
  const tw = pose.view === 'side' ? 5 : 7;
  c.rect(cx - tw, y + 11, tw * 2, 19, body);
  c.frame(cx - tw, y + 11, tw * 2, 19, shade);
  if (pose.view !== 'back') drawGlyph(c, letter, cx - 2, y + 13, C.weiss);
  // Arme
  if (pose.armUp) {
    c.rect(cx + tw, y + 8, 3, 12, shade);
  } else {
    const armY = y + 12;
    if (pose.view === 'side') c.rect(cx - 1 + pose.legA, armY, 3, 13, shade);
    else {
      c.rect(cx - tw - 2, armY, 2, 14, shade);
      c.rect(cx + tw, armY, 2, 14, shade);
    }
  }
  // Beine
  const hip = y + 30;
  const foot = 53;
  if (pose.view === 'side') {
    c.rect(cx - 2 + pose.legA, hip, 4, foot - hip + 1, C.grau2);
    c.rect(cx - 2 + pose.legB, hip, 4, foot - hip + 1, C.grau1);
    c.rect(cx - 2 + pose.legA, foot, 6, 1, C.schwarz);
    c.rect(cx - 2 + pose.legB, foot, 6, 1, C.schwarz);
  } else {
    c.rect(cx - 5, hip, 4, foot - hip + 1 - pose.legA, C.grau2);
    c.rect(cx + 1, hip, 4, foot - hip + 1 - pose.legB, C.grau2);
    c.rect(cx - 6, foot - pose.legA, 5, 1, C.schwarz);
    c.rect(cx + 1, foot - pose.legB, 5, 1, C.schwarz);
  }
}

/** Neutrale Hunde-Silhouette: ein flacher Körper mit Buchstabe, keine erkennbare Figur. */
function drawDog(c: Canvas, ox: number, pose: Pose, body: number, shade: number, letter: string): void {
  const foot = 53;
  const y = 34 + pose.bob;
  const legs = (x: number, shift: number): void => c.rect(ox + x + shift, y + 12, 3, foot - y - 11, shade);
  if (pose.view === 'side') {
    c.rect(ox + 5, y + 3, 20, 10, body);
    c.frame(ox + 5, y + 3, 20, 10, shade);
    c.rect(ox + 22, y - 4, 9, 9, C.grau5);
    c.frame(ox + 22, y - 4, 9, 9, C.grau3);
    c.rect(ox + 27, y - 2, 2, 2, C.schwarz);
    if (pose.mouth) c.rect(ox + 27, y + 2, 3, 2, C.schwarz);
    c.rect(ox + 2, y + 1, 3, 2, shade); // Schwanz
    drawGlyph(c, letter, ox + 12, y + 3, C.weiss);
    legs(7, pose.legA > 0 ? 1 : -1);
    legs(20, pose.legB > 0 ? 1 : -1);
  } else {
    c.rect(ox + 9, y + 3, 14, 10, body);
    c.frame(ox + 9, y + 3, 14, 10, shade);
    if (pose.view === 'front') {
      c.rect(ox + 11, y - 5, 10, 9, C.grau5);
      c.frame(ox + 11, y - 5, 10, 9, C.grau3);
      c.rect(ox + 13, y - 3, 2, 2, C.schwarz);
      c.rect(ox + 17, y - 3, 2, 2, C.schwarz);
      if (pose.mouth) c.rect(ox + 14, y + 1, 4, 2, C.schwarz);
      drawGlyph(c, letter, ox + 14, y + 4, C.weiss);
    }
    legs(10, 0);
    legs(19, 0);
  }
}

const ANIMATIONS: Record<string, Pose[]> = {
  idle: [
    { view: 'front', legA: 0, legB: 0, bob: 0 },
    { view: 'front', legA: 0, legB: 0, bob: 0 },
  ],
  walk_side: [
    { view: 'side', legA: 5, legB: -5, bob: 0 },
    { view: 'side', legA: 2, legB: -2, bob: 1 },
    { view: 'side', legA: -1, legB: 1, bob: 0 },
    { view: 'side', legA: -5, legB: 5, bob: 0 },
    { view: 'side', legA: -2, legB: 2, bob: 1 },
    { view: 'side', legA: 1, legB: -1, bob: 0 },
  ],
  walk_front: [
    { view: 'front', legA: 0, legB: 3, bob: 0 },
    { view: 'front', legA: 0, legB: 0, bob: 1 },
    { view: 'front', legA: 3, legB: 0, bob: 0 },
    { view: 'front', legA: 0, legB: 0, bob: 1 },
  ],
  walk_back: [
    { view: 'back', legA: 0, legB: 3, bob: 0 },
    { view: 'back', legA: 0, legB: 0, bob: 1 },
    { view: 'back', legA: 3, legB: 0, bob: 0 },
    { view: 'back', legA: 0, legB: 0, bob: 1 },
  ],
  talk_side: [
    { view: 'side', legA: 1, legB: -1, bob: 0, mouth: true },
    { view: 'side', legA: 1, legB: -1, bob: 0 },
  ],
  talk_front: [
    { view: 'front', legA: 0, legB: 0, bob: 0, mouth: true },
    { view: 'front', legA: 0, legB: 0, bob: 0 },
  ],
  pickup: [
    { view: 'side', legA: 1, legB: -1, bob: 1, armUp: true },
    { view: 'side', legA: 1, legB: -1, bob: 0, armUp: true },
  ],
};

const FIGURES = [
  { id: 'marty', letter: 'M', body: C.blau4, shade: C.blau2, textColor: 'blau7' },
  { id: 'doc_jung', letter: 'J', body: C.gruen4, shade: C.gruen2, textColor: 'gruen7' },
  { id: 'doc', letter: 'D', body: C.violett4, shade: C.violett2, textColor: 'violett5' },
  { id: 'test_npc', letter: 'T', body: C.orange1, shade: C.holz3, textColor: 'orange3' },
  { id: 'lorraine', letter: 'L', body: C.pink1, shade: C.rot1, textColor: 'pink4' },
  { id: 'biff', letter: 'B', body: C.gruen3, shade: C.gruen1, textColor: 'gruen6' },
  { id: 'einstein', letter: 'E', body: C.holz4, shade: C.holz2, textColor: 'sand2', dog: true },
  { id: 'kowalski', letter: 'K', body: C.blau2, shade: C.blau1, textColor: 'blau6' },
  { id: 'strickland', letter: 'S', body: C.grau3, shade: C.grau1, textColor: 'grau6' },
  { id: 'jennifer', letter: 'N', body: C.pink2, shade: C.pink1, textColor: 'pink3' },
  { id: 'lou', letter: 'O', body: C.weiss, shade: C.grau4, textColor: 'tuerkis6' },
  { id: 'goldie', letter: 'Y', body: C.tuerkis2, shade: C.tuerkis1, textColor: 'tuerkis5' },
  { id: 'haendler', letter: 'H', body: C.orange1, shade: C.holz2, textColor: 'orange3' },
  { id: 'george_jung', letter: 'G', body: C.gelb1, shade: C.holz3, textColor: 'gelb3' },
  { id: 'biff_jung', letter: 'b', body: C.gruen4, shade: C.gruen2, textColor: 'gruen7' },
] as const;

export function buildCharacters(dir: string): void {
  const config: Record<string, unknown> = {};
  for (const figure of FIGURES) {
    const folder = `${dir}/characters/${figure.id}`;
    mkdirSync(folder, { recursive: true });
    for (const [anim, poses] of Object.entries(ANIMATIONS)) {
      const sheet = new Canvas(FW * poses.length, FH);
      poses.forEach((pose, i) => {
        const draw = 'dog' in figure ? drawDog : drawFigure;
        draw(sheet, i * FW, pose, figure.body, figure.shade, figure.letter);
      });
      sheet.save(`${folder}/${figure.id}_${anim}.png`);
    }
    // Porträt für den Figurenwechsel: 22×13
    const portrait = new Canvas(22, 13, figure.shade);
    portrait.rect(6, 1, 10, 11, C.grau5);
    portrait.frame(6, 1, 10, 11, C.grau3);
    drawGlyph(portrait, figure.letter, 9, 2, figure.body);
    portrait.save(`${folder}/${figure.id}_portrait.png`);

    config[figure.id] = {
      folder: figure.id,
      textColor: figure.textColor,
      portrait: `${figure.id}_portrait.png`,
    };
  }
  writeFileSync(
    `${dir}/characters/characters.json`,
    JSON.stringify({ frameWidth: FW, frameHeight: FH, fps: 8, characters: config }, null, 2) + '\n',
    'utf8',
  );
}
