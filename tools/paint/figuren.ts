import { Ink, cyl } from './items.ts';
import { clamp01, hex, mix, Picture, type RGB, shade } from './painter.ts';

/**
 * Die Figuren, 40×72 je Frame, von links beleuchtet und dunkel umrandet.
 * Alle Menschen teilen ein Gerüst aus Gelenken; das Aussehen steckt in `Look`.
 * Alle Figuren sind erfunden: Keine trägt die Kleidung oder das Gesicht aus den Filmen.
 */
export const FRAME_W = 40;
export const FRAME_H = 72;
const FOOT = 70;
const CX = 20;

type Hair = 'mop' | 'slick' | 'crew' | 'tufts' | 'bob' | 'pony' | 'bun' | 'duck' | 'bald';
type Hat = 'flatcap' | 'peaked' | 'stetson' | 'paper' | 'stocking';

export interface Look {
  /** Höhe vom Boden bis zum Scheitel, ohne Hut. */
  h: number;
  /** Halbe Breite der Schultern und der Hüfte. */
  sh: number;
  hip: number;
  limb: number;
  leg: number;
  head: number;
  /** Kiefer: 0.18 ist schmal, 0 ist breit. */
  jaw?: number;
  belly?: number;
  skin: string;
  hair: string;
  hairStyle: Hair;
  hat?: Hat;
  hatColor?: string;
  beard?: 'full' | 'goatee' | 'stubble';
  beardColor?: string;
  moustache?: boolean;
  glasses?: boolean;
  goggles?: boolean;
  scowl?: boolean;
  top: string;
  sleeve?: string;
  rolled?: boolean;
  inner?: string;
  /** Breite des Spalts, in dem `inner` zu sehen ist. */
  opening?: number;
  /** Ausschnitt läuft nach unten spitz zu. */
  vee?: boolean;
  stripe?: string;
  plaid?: string;
  tie?: string;
  bow?: string;
  scarf?: string;
  apron?: string;
  belt?: string;
  buckle?: string;
  badge?: boolean;
  /** Kleine Kiste am Gürtel. */
  gadget?: boolean;
  suspenders?: string;
  /** Mantel oder Rock bis zu diesem Anteil des Beins. */
  coat?: number;
  skirt?: number;
  skirtColor?: string;
  pants: string;
  /** Andere Farbe unter dem Knie, etwa kurze Hosen. */
  shin?: string;
  shoes: string;
  boots?: boolean;
}

type View = 'front' | 'side' | 'back';

export interface Frame {
  view: View;
  /** Laufphase 0..1; fehlt sie, steht die Figur. */
  phase?: number;
  mouth?: 0 | 1 | 2;
  blink?: boolean;
  gesture?: boolean;
  /** Bücken 0..1. */
  crouch?: number;
}

const walk = (view: View, n: number): Frame[] => Array.from({ length: n }, (_, k) => ({ view, phase: k / n }));
const talk = (view: View): Frame[] => [
  { view, mouth: 2 },
  { view, mouth: 1, gesture: true },
  { view, mouth: 2, gesture: true },
  { view, mouth: 0 },
];
const stand = (view: View): Frame[] => [...Array.from({ length: 11 }, () => ({ view })), { view, blink: true }];

export const ANIMS: Record<string, Frame[]> = {
  idle: stand('front'),
  idle_side: stand('side'),
  idle_back: [{ view: 'back' }],
  walk_side: walk('side', 8),
  walk_front: walk('front', 4),
  walk_back: walk('back', 4),
  talk_side: talk('side'),
  talk_front: talk('front'),
  pickup: [
    { view: 'side', crouch: 0.5 },
    { view: 'side', crouch: 1 },
    { view: 'side', crouch: 1 },
    { view: 'side', crouch: 0.5 },
  ],
};

// --- Gesicht und Haare -----------------------------------------------------------------------

const px = (i: Ink, x: number, y: number, w: number, h: number, c: RGB): void => {
  for (let yy = 0; yy < h; yy++) for (let xx = 0; xx < w; xx++) i.rect(x + xx, y + yy, 1, 1, c);
};

function skinShader(base: string, hx: number, hy: number, r: number, ry: number) {
  const c = hex(base);
  return (u: number, v: number): RGB => {
    const nx = (u - hx) / r;
    const ny = (v - hy) / ry;
    const nz = Math.sqrt(Math.max(0, 1 - nx * nx - ny * ny));
    return shade(c, 0.76 + clamp01(-0.5 * nx - 0.45 * ny + 0.7 * nz) * 0.34);
  };
}

function hairShader(base: string, hx: number, hy: number, r: number, ry: number) {
  const c = hex(base);
  return (u: number, v: number): RGB => {
    const nx = (u - hx) / (r * 1.25);
    const ny = (v - hy) / (ry * 1.25);
    const sheen = Math.exp(-(((nx + 0.3) / 0.28) ** 2 + ((ny + 0.62) / 0.2) ** 2)) * 0.26;
    const f = 0.62 + clamp01(0.55 - 0.5 * nx - 0.5 * ny) * 0.5;
    return mix(shade(c, f), [255, 245, 225], sheen);
  };
}

/** Haare und Bärte hinter dem Kopf. */
function hairBehind(i: Ink, L: Look, hx: number, hy: number, view: View): void {
  const r = L.head;
  const ry = r * 1.14;
  const c = hairShader(L.hair, hx, hy, r, ry);
  if (L.hairStyle === 'bob') {
    const dx = view === 'side' ? -2 : 0;
    i.rect(hx + dx - r - 1.2, hy - ry * 0.6, 2 * r + 2.4, ry * 1.65, c, 2.6);
  }
  if (L.hairStyle === 'pony') {
    if (view === 'side') {
      i.tube((t) => [hx - r - 0.5 - t * 2.6, hy - ry * 0.55 + t * 12, 2 - t * 0.9], () => L.hair, 30);
    } else if (view === 'front') {
      i.tube((t) => [hx + r + t * 0.8, hy - ry * 0.3 + t * 9, 1.5 - t * 0.6], () => L.hair, 24);
    }
  }
}

function drawHairOnHead(i: Ink, L: Look, hx: number, hy: number, view: View): void {
  const r = L.head;
  const ry = r * 1.14;
  const c = hairShader(L.hair, hx, hy, r, ry);
  const inHead = (u: number, v: number, grow: number): boolean => ((u - hx) / r) ** 2 + ((v - hy) / ry) ** 2 <= (1 + grow) ** 2;
  const put = (grow: number, test: (nx: number, ny: number) => boolean, pad = 3): void => {
    i.fill(hx - r - pad, hy - ry - pad, hx + r + pad, hy + ry + pad, (u, v) => inHead(u, v, grow) && test((u - hx) / r, (v - hy) / ry), c);
  };
  const zig = (nx: number, f = 9, a = 0.16): number => Math.sin(nx * f) * a;
  switch (L.hairStyle) {
    case 'mop':
      if (view === 'front') put(0.2, (nx, ny) => ny < -0.3 + zig(nx));
      else if (view === 'side') put(0.2, (nx, ny) => ny < -0.3 + zig(nx) || (nx < -0.25 && ny < 0.45 + zig(ny, 8)));
      else put(0.2, (nx, ny) => ny < 0.55 + zig(nx));
      break;
    case 'slick':
      if (view === 'front') put(0.09, (nx, ny) => ny < -0.5 - 0.22 * nx);
      else if (view === 'side') put(0.09, (nx, ny) => ny < -0.48 || (nx < -0.2 && ny < 0.42));
      else put(0.09, (_nx, ny) => ny < 0.5);
      break;
    case 'crew':
      if (view === 'front') put(0.13, (nx, ny) => ny < -0.6 && ny > -1.05 - Math.abs(nx) * 0);
      else if (view === 'side') put(0.13, (nx, ny) => ny < -0.55 || (nx < -0.35 && ny < 0.25));
      else put(0.13, (_nx, ny) => ny < 0.35);
      break;
    case 'tufts':
      // Kahl oben, zerzauster Kranz an den Seiten
      if (view === 'front') put(0.24, (nx, ny) => Math.abs(nx) > 0.8 && ny > -0.42 + zig(ny, 11, 0.1) && ny < 0.3, 4);
      else if (view === 'side') put(0.2, (nx, ny) => nx < -0.3 && ny > -0.42 && ny < 0.5 + zig(nx, 12), 4);
      else put(0.14, (nx, ny) => ny > -0.36 + zig(nx, 11) && ny < 0.55, 4);
      break;
    case 'bob':
      if (view === 'front') put(0.14, (nx, ny) => ny < -0.38 + Math.abs(nx) * 0.16);
      else if (view === 'side') put(0.14, (nx, ny) => ny < -0.38 || nx < -0.1);
      else put(0.2, () => true);
      break;
    case 'pony':
    case 'bun':
      if (view === 'front') put(0.09, (nx, ny) => ny < -0.42 + Math.abs(nx) * 0.12);
      else if (view === 'side') put(0.09, (nx, ny) => ny < -0.44 || (nx < -0.12 && ny < 0.3));
      else put(0.09, (_nx, ny) => ny < 0.5);
      if (L.hairStyle === 'bun') {
        if (view === 'side') i.ball(hx - r * 0.86, hy - ry * 0.7, 2.5, 2.5, L.hair);
        else i.ball(hx, hy - ry - 1.4, 2.6, 2.3, L.hair);
      } else if (view === 'back') {
        i.tube((t) => [hx + Math.sin(t * 3) * 0.6, hy - ry * 0.45 + t * 13, 2 - t * 0.9], () => L.hair, 30);
      }
      break;
    case 'duck':
      if (view === 'front') {
        put(0.1, (_nx, ny) => ny < -0.5);
        i.ball(hx - 1, hy - ry * 0.98, r * 0.82, 2.6, L.hair);
      } else if (view === 'side') {
        put(0.1, (nx, ny) => ny < -0.5 || (nx < -0.1 && ny < 0.5));
        i.ball(hx + r * 0.42, hy - ry * 0.96, r * 0.72, 2.6, L.hair);
      } else {
        put(0.16, (nx, ny) => ny < 0.62 - Math.abs(nx) * 0.6);
      }
      break;
    case 'bald':
      break;
  }
}

function drawHat(i: Ink, L: Look, hx: number, hy: number, view: View): void {
  if (!L.hat) return;
  const r = L.head;
  const ry = r * 1.14;
  const col = L.hatColor ?? '#55504a';
  const top = hy - ry;
  const crown = cyl(col, hx - r - 1, hx + r + 1);
  const dark = shade(hex(col), 0.55);
  const dir = view === 'side' ? 1 : 0;
  switch (L.hat) {
    case 'flatcap':
      i.ellipse(hx + dir * 0.6, top + 2.2, r + 1.2, 3.3, crown);
      if (view === 'front') i.ellipse(hx, top + 4.6, r * 0.82, 1.2, dark);
      if (view === 'side') i.ellipse(hx + r * 0.95, top + 4.6, 3.2, 1, dark);
      break;
    case 'peaked':
      i.rect(hx - r - 0.6, top - 2.4, 2 * r + 1.2, 5, crown, 1.6);
      i.rect(hx - r - 0.2, top + 2.2, 2 * r + 0.4, 2, shade(hex(col), 0.5));
      if (view === 'front') {
        i.ellipse(hx, top + 4.6, r * 0.9, 1.2, hex('#14141c'));
        i.rect(hx - 1, top - 0.6, 2, 2, hex('#e8c860'));
      }
      if (view === 'side') i.ellipse(hx + r * 0.95, top + 4.6, 3.2, 0.9, hex('#14141c'));
      break;
    case 'stetson':
      i.rect(hx - r * 0.84, top - 5, 2 * r * 0.84, 8, crown, 2.2);
      i.rect(hx - r * 0.86, top + 0.6, 2 * r * 0.86, 1.4, hex('#2a1c14'));
      i.ellipse(hx, top + 2.8, r + 5, view === 'back' ? 1.6 : 1.5, (u) => mix(hex(col), shade(hex(col), 0.5), clamp01((u - hx + r + 5) / (2 * r + 10))));
      break;
    case 'paper':
      i.poly([[hx - r * 0.86, top + 3.4], [hx + r * 0.86, top + 3.4], [hx + r * 0.6, top - 2.4], [hx - r * 0.6, top - 2.4]], (u) => mix(hex('#fbfaf4'), hex('#b8b8b4'), clamp01((u - hx + r) / (2 * r))));
      i.rect(hx - r * 0.86, top + 2.6, 2 * r * 0.86, 1, hex('#c83a3a'));
      break;
    case 'stocking':
      i.ellipse(hx, top + 2, r + 0.8, 3.4, crown);
      i.tube((t) => [hx - (view === 'side' ? 2 + t * 5 : t * 2.5), top + 1 + t * 7, 2.4 - t * 1.2], () => col, 20);
      i.rect(hx - r - 0.5, top + 3, 2 * r + 1, 1.6, dark);
      break;
  }
}

/** Kopf. `hx`, `hy` sind ganzzahlig, damit die Augen als scharfe Pixel erscheinen. */
export function drawHead(i: Ink, L: Look, hx: number, hy: number, view: View, mouth: 0 | 1 | 2, blink: boolean): void {
  const r = L.head;
  const ry = r * 1.14;
  const jaw = L.jaw ?? 0.16;
  const sk = hex(L.skin);
  const skinDark = shade(sk, 0.58);
  const skin = skinShader(L.skin, hx, hy, r, ry);
  const inFace = (rx: number) => (u: number, v: number): boolean => {
    const nx = (u - hx) / rx;
    const ny = (v - hy) / ry;
    const narrow = 1 - Math.max(0, ny) * jaw * 1.6;
    return (nx / narrow) ** 2 + ny ** 2 <= 1;
  };
  const face = (rx: number): void => i.fill(hx - rx - 1, hy - ry - 1, hx + rx + 1, hy + ry + 1, inFace(rx), skin);

  if (view === 'back') {
    face(r);
    i.ellipse(hx - r - 0.2, hy + 0.5, 1, 1.5, skin);
    i.ellipse(hx + r + 0.2, hy + 0.5, 1, 1.5, skin);
    drawHairOnHead(i, L, hx, hy, view);
    drawHat(i, L, hx, hy, view);
    return;
  }

  const ey = hy - 1;
  const beardCol = L.beardColor ?? L.hair;
  const eyeWhite = hex('#f4f0e6');
  const eyeDark = hex('#18121a');
  const browCol = L.hairStyle === 'bald' || L.hairStyle === 'tufts' ? shade(hex(beardCol), 0.75) : shade(hex(L.hair), 0.72);
  const mouthDark = hex('#4a1418');
  const lip = mix(sk, hex('#7a2a2a'), 0.75);

  if (view === 'front') {
    i.ellipse(hx - r - 0.2, hy + 0.5, 1.1, 1.7, skin);
    i.ellipse(hx + r + 0.2, hy + 0.5, 1.1, 1.7, skin);
    face(r);
    if (L.beard === 'stubble') {
      const c = mix(sk, hex(beardCol), 0.4);
      i.fill(hx - r, hy + 1, hx + r, hy + ry, (u, v) => inFace(r)(u, v) && (v - hy) / ry > 0.28, c);
    }
    if (L.beard === 'full') {
      const c = hairShader(beardCol, hx, hy, r, ry);
      i.fill(hx - r - 1, hy, hx + r + 1, hy + ry + 3, (u, v) => {
        const nx = (u - hx) / (r * 1.08);
        const ny = (v - hy - 1) / (ry * 1.08);
        return nx * nx + ny * ny <= 1 && (v - hy) / ry > 0.18;
      }, c);
    }
    if (L.beard === 'goatee') i.ellipse(hx, hy + ry - 0.4, 2.4, 2.5, hairShader(beardCol, hx, hy, r, ry));
    // Augen
    for (const [x, pupil] of [[hx - 5, hx - 4], [hx + 2, hx + 3]] as const) {
      if (blink) {
        px(i, x, ey + 1, 3, 1, skinDark);
      } else {
        px(i, x, ey, 3, 2, eyeWhite);
        px(i, pupil, ey, 1, 2, eyeDark);
      }
    }
    // Brauen
    px(i, hx - 5, ey - 1, 3, 1, browCol);
    px(i, hx + 2, ey - 1, 3, 1, browCol);
    if (L.scowl) {
      px(i, hx - 3, ey, 1, 1, browCol);
      px(i, hx + 2, ey, 1, 1, browCol);
    }
    // Nase
    px(i, hx - 1, ey + 2, 2, 2, mix(sk, skinDark, 0.5));
    px(i, hx - 1, ey + 3, 2, 1, skinDark);
    if (L.moustache) i.rect(hx - 3.2, ey + 4, 6.4, 1.5, hex(beardCol), 0.6);
    const my = ey + 5 + (L.moustache ? 1 : 0);
    if (mouth === 2) {
      px(i, hx - 2, my, 4, 3, mouthDark);
      px(i, hx - 2, my, 4, 1, hex('#efe8dc'));
    } else if (mouth === 1) {
      px(i, hx - 2, my, 4, 2, mouthDark);
    } else {
      px(i, hx - 2, my, 4, 1, lip);
    }
    drawHairOnHead(i, L, hx, hy, view);
    if (L.glasses) {
      const fr = hex('#1a1820');
      for (const x of [hx - 6, hx + 1]) {
        px(i, x, ey - 1, 5, 1, fr);
        px(i, x, ey + 2, 5, 1, fr);
        px(i, x, ey, 1, 2, fr);
        px(i, x + 4, ey, 1, 2, fr);
      }
      px(i, hx - 1, ey, 2, 1, fr);
    }
    if (L.goggles) {
      i.rect(hx - r - 0.5, hy - ry * 0.74, 2 * r + 1, 1.4, hex('#3a2a1c'));
      i.ball(hx - 3, hy - ry * 0.72, 2.3, 2.1, '#c89a44');
      i.ball(hx + 3, hy - ry * 0.72, 2.3, 2.1, '#c89a44');
      i.ellipse(hx - 3, hy - ry * 0.72, 1.2, 1.1, hex('#7ab8d0'));
      i.ellipse(hx + 3, hy - ry * 0.72, 1.2, 1.1, hex('#7ab8d0'));
    }
    drawHat(i, L, hx, hy, view);
    return;
  }

  // Seitenansicht, Blick nach rechts
  const rs = r * 0.94;
  face(rs);
  i.ellipse(hx + rs + 0.1, ey + 2.6, 1.5, 1.3, skin);
  i.ellipse(hx - 1.5, hy + 0.5, 1.2, 1.8, shade(sk, 0.82));
  if (L.beard === 'stubble') {
    const c = mix(sk, hex(beardCol), 0.4);
    i.fill(hx - 1, hy + 1, hx + r, hy + ry, (u, v) => inFace(rs)(u, v) && (v - hy) / ry > 0.28, c);
  }
  if (L.beard === 'full') {
    const c = hairShader(beardCol, hx, hy, r, ry);
    i.fill(hx - 3, hy, hx + r + 1, hy + ry + 3, (u, v) => {
      const nx = (u - hx) / (r * 1.08);
      const ny = (v - hy - 1) / (ry * 1.08);
      return nx * nx + ny * ny <= 1 && (v - hy) / ry > 0.18 && nx > -0.35;
    }, c);
  }
  if (L.beard === 'goatee') i.ellipse(hx + rs * 0.62, hy + ry - 0.3, 2, 2.4, hairShader(beardCol, hx, hy, r, ry));
  if (blink) {
    px(i, hx + 2, ey + 1, 3, 1, skinDark);
  } else {
    px(i, hx + 2, ey, 3, 2, eyeWhite);
    px(i, hx + 4, ey, 1, 2, eyeDark);
  }
  px(i, hx + 2, ey - 1, 3, 1, browCol);
  if (L.scowl) px(i, hx + 4, ey, 1, 1, browCol);
  if (L.moustache) i.rect(hx + 1.6, ey + 4, 5, 1.5, hex(beardCol), 0.6);
  const my = ey + 5 + (L.moustache ? 1 : 0);
  if (mouth === 2) {
    px(i, hx + 2, my, 4, 3, mouthDark);
    px(i, hx + 2, my, 4, 1, hex('#efe8dc'));
  } else if (mouth === 1) {
    px(i, hx + 2, my, 4, 2, mouthDark);
  } else {
    px(i, hx + 2, my, 4, 1, lip);
  }
  drawHairOnHead(i, L, hx, hy, view);
  if (L.glasses) {
    const fr = hex('#1a1820');
    px(i, hx + 1, ey - 1, 5, 1, fr);
    px(i, hx + 1, ey + 2, 5, 1, fr);
    px(i, hx + 1, ey, 1, 2, fr);
    px(i, hx - 3, ey, 4, 1, fr);
    px(i, hx + 5, ey, 1, 2, fr);
  }
  if (L.goggles) {
    i.rect(hx - r, hy - ry * 0.74, 2 * r, 1.4, hex('#3a2a1c'));
    i.ball(hx + 3, hy - ry * 0.72, 2.4, 2.1, '#c89a44');
    i.ellipse(hx + 3.4, hy - ry * 0.72, 1.2, 1.1, hex('#7ab8d0'));
  }
  drawHat(i, L, hx, hy, view);
}

// --- Körper ----------------------------------------------------------------------------------

/** Bein oder Arm aus zwei Stücken. */
const limb2 = (i: Ink, ax: number, ay: number, bx: number, by: number, cx: number, cy: number, w: number, top: string | RGB, low: string | RGB): void => {
  i.rod(bx, by, cx, cy, w * 0.92, low);
  i.rod(ax, ay, bx, by, w, top);
};

const toHex = (c: RGB): string => `#${c.map((v) => Math.round(Math.max(0, Math.min(255, v))).toString(16).padStart(2, '0')).join('')}`;
const darker = (c: string, f: number): string => toHex(shade(hex(c), f));

function torsoShader(L: Look, x0: number, x1: number) {
  const base = cyl(L.top, x0, x1);
  if (!L.plaid) return (u: number, _v: number): RGB => mix(base(u), hex(L.top), 0.35);
  const line = hex(L.plaid);
  return (u: number, v: number): RGB => {
    const c = mix(base(u), hex(L.top), 0.35);
    const a = Math.floor(u * 0.55) % 2 === 0;
    const b = Math.floor(v * 0.55) % 2 === 0;
    return a && b ? mix(c, line, 0.7) : a || b ? mix(c, line, 0.25) : c;
  };
}

function figure(i: Ink, base: Look, f: Frame): void {
  const L: Look = { ...base, leg: base.leg * 1.3, limb: base.limb * 1.14, hip: base.hip * 1.06 };
  const view = f.view;
  const walking = f.phase !== undefined;
  const phi = (f.phase ?? 0) * Math.PI * 2;
  const crouch = f.crouch ?? 0;
  const r = L.head;
  const ry = r * 1.14;
  const legLen = L.h * 0.44;
  const torsoLen = L.h - legLen - 2 * ry - 2.5;
  const armLen = torsoLen * 1.12;
  const shirt = L.sleeve ?? L.top;
  const lowArm = L.rolled ? L.skin : shirt;

  if (view === 'side') {
    const L1 = legLen * 0.5;
    const L2 = legLen * 0.5;
    const leg = (a: number, k: number) => {
      const kx = Math.sin(a) * L1;
      const ky = Math.cos(a) * L1;
      return { kx, ky, ax: kx + Math.sin(a - k) * L2, ay: ky + Math.cos(a - k) * L2 };
    };
    const swing = (p: number): [number, number] => [0.46 * Math.sin(p), 0.08 + 0.95 * Math.max(0, Math.cos(p)) ** 1.5];
    const [aN, kN] = walking ? swing(phi) : [0.1 + crouch * 0.9, 0.05 + crouch * 1.5];
    const [aF, kF] = walking ? swing(phi + Math.PI) : [-0.1 + crouch * 0.7, 0.05 + crouch * 1.3];
    const near = leg(aN, kN);
    const far = leg(aF, kF);
    const hipY = FOOT - 1.4 - Math.max(near.ay, far.ay);
    const hipX = CX - crouch * 3;
    const lean = crouch * 10 + (walking ? 1 : 0);
    const sx = hipX + lean;
    const sy = hipY - torsoLen * (1 - crouch * 0.18);
    const hx = Math.round(sx + 1 + lean * 0.12);
    const hy = Math.round(sy - 1.2 - ry);
    const dS = L.sh * 0.82;
    const dH = L.hip * 0.86;
    const belly = L.belly ?? 0;

    const drawLeg = (g: { kx: number; ky: number; ax: number; ay: number }, x0: number, darken: number): void => {
      const top = darker(L.pants, darken);
      const low = darker(L.shin ?? L.pants, darken);
      const ankleX = x0 + g.ax;
      const ankleY = hipY + g.ay;
      limb2(i, x0, hipY, x0 + g.kx, hipY + g.ky, ankleX, ankleY, L.leg, top, low);
      const shoe = shade(hex(L.shoes), darken);
      if (L.boots) i.rod(x0 + g.kx * 0.6 + g.ax * 0.4, hipY + g.ky * 0.6 + g.ay * 0.4, ankleX, ankleY, L.leg + 0.4, toHex(shoe));
      i.rect(ankleX - L.leg * 0.5 - 0.3, ankleY - 1, L.leg + 3.8, 2.6, (u) => mix(shoe, shade(shoe, 0.7), clamp01((u - ankleX) / 6)), 1);
    };
    const armAngle = (p: number): number => -0.5 * Math.sin(p) + 0.08;
    const drawArm = (b: number, flex: number, darken: number, x0 = sx, y0 = sy + 1.2): void => {
      const up = armLen * 0.5;
      const ex = x0 + Math.sin(b) * up;
      const ey = y0 + Math.cos(b) * up;
      const hx2 = ex + Math.sin(b + flex) * up;
      const hy2 = ey + Math.cos(b + flex) * up;
      limb2(i, x0, y0, ex, ey, hx2, hy2, L.limb, darker(shirt, darken), darker(lowArm, darken));
      i.ball(hx2, hy2 + 0.5, L.limb * 0.62, L.limb * 0.7, darker(L.skin, darken));
    };

    // Hinten: ferner Arm und fernes Bein
    if (crouch) drawArm(0.1 + crouch * 0.25, 0.1, 0.68, sx + 1);
    else drawArm(walking ? armAngle(phi + Math.PI) : 0.02, walking ? 0.3 : 0.12, 0.68, sx + 1);
    drawLeg(far, hipX + 0.8, 0.68);
    hairBehind(i, L, hx, hy, view);
    drawLeg(near, hipX - 0.4, 1);

    // Rock oder Mantel
    const hemF = L.coat ?? L.skirt;
    if (hemF) {
      const col = L.skirt ? (L.skirtColor ?? L.top) : L.top;
      const hemY = hipY + legLen * hemF - crouch * 6;
      const sway = walking ? -Math.sin(phi) * 1.6 : -crouch * 3;
      const flare = 1.6 + hemF * 2;
      i.poly(
        [
          [hipX - dH, hipY - 3],
          [hipX + dH, hipY - 3],
          [hipX + dH + flare + sway + crouch * 2, hemY],
          [hipX - dH - flare + sway, hemY],
        ],
        (u) => mix(cyl(col, hipX - dH - flare, hipX + dH + flare)(u), hex(col), 0.3),
      );
    }

    // Rumpf
    const shader = torsoShader(L, sx - dS - 1, sx + dS + belly + 1);
    i.poly(
      [
        [sx - dS, sy + 1.4],
        [sx - dS * 0.4, sy - 0.6],
        [sx + dS * 0.6, sy - 0.6],
        [sx + dS, sy + 1.6],
        [(sx + hipX) / 2 + dH + belly, (sy + hipY) / 2 + 1],
        [hipX + dH + belly * 0.5, hipY],
        [hipX - dH, hipY],
      ],
      shader,
    );
    const fx = (t: number): number => sx + dS + (hipX + dH + belly * 0.5 - sx - dS) * t;
    const fy = (t: number): number => sy + 1 + (hipY - sy - 1) * t;
    if (L.inner && L.opening) {
      const end = L.vee ? 0.3 : 0.75;
      i.poly([[fx(0) - 1.6, fy(0)], [fx(0) + 0.2, fy(0)], [fx(end) + 0.2, fy(end)], [fx(end) - (L.vee ? 0 : 1.3), fy(end)]], hex(L.inner));
    }
    if (L.stripe) i.poly([[sx - dS, sy + 5], [sx + dS, sy + 5], [sx + dS + belly * 0.3, sy + 7.4], [sx - dS, sy + 7.4]], hex(L.stripe));
    if (L.suspenders) i.stroke(sx + 1.2, sy, hipX + 1.2, hipY - 1, 1.1, hex(L.suspenders));
    if (L.apron) i.poly([[fx(0.3) - 3, fy(0.3)], [fx(0.3) + 0.5, fy(0.3)], [hipX + dH + 2.2, hipY + legLen * 0.62], [hipX + dH - 2.6, hipY + legLen * 0.62]], (u) => mix(hex(L.apron!), shade(hex(L.apron!), 0.72), clamp01((hipX + dH + 2 - u) / 5)));
    if (L.belt) {
      i.rect(hipX - dH, hipY - 1.6, 2 * dH + belly * 0.5, 1.8, hex(L.belt));
      if (L.buckle) i.rect(hipX + dH - 1 + belly * 0.5, hipY - 1.6, 1.4, 1.8, hex(L.buckle));
    }
    if (L.gadget) {
      i.rect(hipX - 2, hipY - 2, 4.4, 4.4, (u) => mix(hex('#8a8c94'), hex('#4a4c54'), clamp01((u - hipX + 2) / 4.4)), 0.5);
      i.rect(hipX + 0.6, hipY - 1.4, 1, 1, hex('#ff4a3a'));
    }
    if (L.scarf) i.ellipse(sx + 1, sy, dS + 0.6, 1.8, hex(L.scarf));

    // Hals und Kopf
    i.rect(sx - 1.4, sy - 2.6, 3.4, 3.4, shade(hex(L.skin), 0.82));
    drawHead(i, L, hx, hy, 'side', f.mouth ?? 0, f.blink ?? false);

    // Vorn: naher Arm
    if (crouch) drawArm(0.3 + crouch * 0.2, 0.05, 1);
    else if (f.gesture) drawArm(0.85, 1.1, 1);
    else drawArm(walking ? armAngle(phi) : -0.03, walking ? 0.32 : 0.14, 1);
    return;
  }

  // Von vorn und von hinten
  const sinP = Math.sin(phi);
  const liftL = walking ? Math.max(0, sinP) * 3.2 : 0;
  const liftR = walking ? Math.max(0, -sinP) * 3.2 : 0;
  const bob = walking ? Math.round(Math.abs(Math.cos(phi)) * 0.8) : 0;
  const hipY = FOOT - 1.4 - legLen + bob;
  const sy = hipY - torsoLen;
  const sx = CX;
  const hx = CX;
  const hy = Math.round(sy - 1.2 - ry);
  const sh = L.sh;
  const hip = L.hip;
  const belly = L.belly ?? 0;
  const legX = hip * 0.5;

  if (view === 'front') hairBehind(i, L, hx, hy, view);

  const drawLeg = (x: number, lift: number, side: number): void => {
    const ay = FOOT - 1.4 - lift;
    const kneeY = hipY + (ay - hipY) * 0.5;
    const footX = x + side * 0.6;
    limb2(i, x, hipY, x + side * 0.2, kneeY, footX, ay, L.leg, L.pants, L.shin ?? L.pants);
    if (L.boots) i.rod(x + side * 0.3, kneeY + 3, footX, ay, L.leg + 0.4, L.shoes);
    const shoe = hex(L.shoes);
    if (view === 'front') {
      i.rect(footX - L.leg * 0.5 - 0.5, ay - 0.8, L.leg + 1, 2.6, (u) => mix(shoe, shade(shoe, 0.7), clamp01((u - footX + 2) / 4)), 1);
    } else {
      i.rect(footX - L.leg * 0.5 - 0.3, ay - 0.6, L.leg + 0.6, 2.2, shade(shoe, 0.78), 0.8);
    }
  };
  drawLeg(CX - legX, liftL, -1);
  drawLeg(CX + legX, liftR, 1);

  const hemF = L.coat ?? L.skirt;
  if (hemF) {
    const col = L.skirt ? (L.skirtColor ?? L.top) : L.top;
    const hemY = hipY + legLen * hemF;
    const flare = hip + 1.4 + hemF * 2.6;
    const shader = (u: number): RGB => mix(cyl(col, CX - flare - 1, CX + flare + 1)(u), hex(col), 0.3);
    const gap = L.coat && view === 'front' ? 1.4 : 0;
    i.poly([[CX - hip, hipY - 3], [CX - gap, hipY - 3], [CX - gap, hemY], [CX - flare, hemY]], shader);
    i.poly([[CX + gap, hipY - 3], [CX + hip, hipY - 3], [CX + flare, hemY], [CX + gap, hemY]], shader);
  }

  // Rumpf
  i.poly(
    [
      [sx - sh, sy + 1.6],
      [sx - sh * 0.5, sy - 0.8],
      [sx + sh * 0.5, sy - 0.8],
      [sx + sh, sy + 1.6],
      [sx + hip + belly, (sy + hipY) / 2 + 2],
      [sx + hip, hipY],
      [sx - hip, hipY],
      [sx - hip - belly, (sy + hipY) / 2 + 2],
    ],
    torsoShader(L, sx - sh - belly - 1, sx + sh + belly + 1),
  );
  if (view === 'front') {
    if (L.inner && L.opening) {
      const o = L.opening;
      if (L.vee) {
        i.poly([[sx - o, sy - 0.8], [sx + o, sy - 0.8], [sx, sy + torsoLen * 0.34]], hex(L.inner));
        i.stroke(sx, sy + torsoLen * 0.34, sx, hipY, 0.5, shade(hex(L.top), 0.55));
      } else {
        i.poly([[sx - o, sy - 0.8], [sx + o, sy - 0.8], [sx + o * 0.65, hipY], [sx - o * 0.65, hipY]], hex(L.inner));
      }
    }
    if (L.tie) i.poly([[sx - 0.9, sy], [sx + 0.9, sy], [sx + 1.2, sy + torsoLen * 0.7], [sx, sy + torsoLen * 0.8], [sx - 1.2, sy + torsoLen * 0.7]], hex(L.tie));
    if (L.bow) {
      i.poly([[sx, sy + 0.8], [sx - 2.8, sy - 0.5], [sx - 2.8, sy + 2]], hex(L.bow));
      i.poly([[sx, sy + 0.8], [sx + 2.8, sy - 0.5], [sx + 2.8, sy + 2]], hex(L.bow));
    }
    if (L.badge) i.ball(sx - sh * 0.5, sy + 5, 1.2, 1.3, '#e8c860');
    if (L.apron) i.poly([[sx - sh * 0.62, sy + 3.5], [sx + sh * 0.62, sy + 3.5], [sx + hip + 0.8, hipY - 2], [sx + hip + 1.2, hipY + legLen * 0.6], [sx - hip - 1.2, hipY + legLen * 0.6], [sx - hip - 0.8, hipY - 2]], (u) => mix(hex(L.apron!), shade(hex(L.apron!), 0.76), clamp01((u - sx + hip) / (2 * hip))));
  }
  if (L.stripe) i.poly([[sx - sh, sy + 5], [sx + sh, sy + 5], [sx + sh, sy + 7.4], [sx - sh, sy + 7.4]], hex(L.stripe));
  if (L.suspenders) {
    if (view === 'front') {
      i.stroke(sx - sh * 0.5, sy, sx - hip * 0.5, hipY - 1, 1.1, hex(L.suspenders));
      i.stroke(sx + sh * 0.5, sy, sx + hip * 0.5, hipY - 1, 1.1, hex(L.suspenders));
    } else {
      i.stroke(sx - sh * 0.5, sy, sx, sy + torsoLen * 0.5, 1.1, hex(L.suspenders));
      i.stroke(sx + sh * 0.5, sy, sx, sy + torsoLen * 0.5, 1.1, hex(L.suspenders));
      i.stroke(sx, sy + torsoLen * 0.5, sx, hipY - 1, 1.1, hex(L.suspenders));
    }
  }
  if (L.belt) {
    i.rect(sx - hip, hipY - 1.6, 2 * hip, 1.8, hex(L.belt));
    if (L.buckle && view === 'front') i.rect(sx - 1, hipY - 1.8, 2, 2.2, hex(L.buckle));
  }
  if (L.gadget && view === 'front') {
    i.rect(sx + hip - 3, hipY - 2, 4.4, 4.4, (u) => mix(hex('#8a8c94'), hex('#4a4c54'), clamp01((u - sx - hip + 3) / 4.4)), 0.5);
    i.rect(sx + hip - 1.6, hipY - 1.4, 1, 1, hex('#ff4a3a'));
  }
  if (L.scarf) i.ellipse(sx, sy, sh * 0.7, 2, hex(L.scarf));

  // Arme
  const armSwing = walking ? sinP * 1.8 : 0;
  const drawArm = (side: number, swing: number, gesture: boolean): void => {
    const ax = sx + side * (sh + L.limb * 0.05);
    const ay = sy + 1.6;
    const ex = ax + side * (gesture ? 2.4 : 0.8);
    const ey = ay + armLen * (gesture ? 0.46 : 0.5);
    const wx = gesture ? ax + side * 0.2 : ax + side * 0.7 + swing * 0.2;
    const wy = gesture ? ay + 2 : ay + armLen - Math.abs(swing) * 0.3 + swing;
    limb2(i, ax, ay, ex, ey, wx, wy, L.limb, shirt, lowArm);
    i.ball(wx, wy + 0.4, L.limb * 0.66, L.limb * 0.72, L.skin);
  };
  drawArm(-1, armSwing, false);
  drawArm(1, -armSwing, !!f.gesture && view === 'front');

  i.rect(sx - 1.6, sy - 2.6, 3.2, 3.4, shade(hex(L.skin), 0.8));
  drawHead(i, L, hx, hy, view, f.mouth ?? 0, f.blink ?? false);
  if (view === 'back') hairBehind(i, L, hx, hy, view);
}

// --- Hund ------------------------------------------------------------------------------------

function dog(i: Ink, f: Frame): void {
  const fur = '#a8703c';
  const light = '#e8d8b8';
  const dark = '#5a3a1c';
  const collar = hex('#c8342c');
  const phi = (f.phase ?? 0) * Math.PI * 2;
  const walking = f.phase !== undefined;
  const y = FOOT - 21;
  if (f.view === 'side') {
    const legSwing = (p: number): number => (walking ? Math.sin(p) * 2.6 : 0);
    const leg = (x: number, p: number, c: string): void => {
      i.rod(x, y + 12, x + legSwing(p), FOOT - 1, 2.6, c);
      i.ellipse(x + legSwing(p) + 0.8, FOOT - 0.8, 2, 1, hex(c));
    };
    leg(9, phi + Math.PI, dark);
    leg(25, phi, dark);
    const wag = (f.blink ? 1.5 : 0) + (walking ? Math.sin(phi * 2) * 1.2 : 0) + (f.mouth !== undefined ? 1 : 0);
    i.tube((t) => [6 - t * 3.4, y + 8 - t * (5 + wag), 1.8 - t * 0.8], () => fur, 16);
    i.rect(6, y + 5, 22, 11, (_u, v) => mix(hex(fur), hex(light), clamp01((v - y - 11) / 5)), 5);
    i.ellipse(14, y + 8, 5, 3, hex(dark));
    leg(12, phi, fur);
    leg(28, phi + Math.PI, fur);
    i.rect(24, y + 3, 5, 3, collar);
    i.ball(29, y + 0.5, 5.4, 5, fur);
    i.rect(30, y + 0.5, 7.4, 4.4, (u) => mix(hex(fur), hex(light), clamp01((u - 30) / 4)), 2);
    i.ellipse(37, y + 1.4, 1.3, 1.2, hex('#14101a'));
    px(i, 31, Math.round(y - 2), 2, 2, hex('#14101a'));
    i.tube((t) => [26 + t * 0.2, y - 3 + t * 7, 2.2], () => dark, 14);
    if (f.mouth) i.rect(32, y + 4.6, 5, 1.8, hex('#d84a5a'), 0.6);
    return;
  }
  if (f.view === 'back') {
    i.rod(15, y + 10, 15, FOOT - 1, 3, dark);
    i.rod(25, y + 10, 25, FOOT - 1, 3, dark);
    i.ball(20, y + 8, 8.6, 9, fur);
    i.tube((t) => [20 + Math.sin(phi * 2 + t) * 1.4, y + 2 - t * 7, 1.9 - t * 0.8], () => fur, 16);
    i.ball(20, y - 4, 5.2, 4.8, fur);
    i.ellipse(14.6, y - 2, 2, 3.8, hex(dark));
    i.ellipse(25.4, y - 2, 2, 3.8, hex(dark));
    return;
  }
  i.rod(15, y + 10, 15, FOOT - 1, 3, fur);
  i.rod(25, y + 10, 25, FOOT - 1, 3, fur);
  i.ellipse(15, FOOT - 0.8, 2.2, 1, hex(light));
  i.ellipse(25, FOOT - 0.8, 2.2, 1, hex(light));
  i.ball(20, y + 8, 8, 8.4, fur);
  i.ellipse(20, y + 10, 4.6, 6, hex(light));
  i.rect(14.4, y + 2.6, 11.2, 2.4, collar);
  i.ball(20, y - 4, 6.4, 5.8, fur);
  i.ellipse(13.2, y - 2.6, 2.2, 4.4, hex(dark));
  i.ellipse(26.8, y - 2.6, 2.2, 4.4, hex(dark));
  i.ellipse(20, y - 1.6, 3.4, 2.8, hex(light));
  i.ellipse(20, y - 2.6, 1.3, 1.1, hex('#14101a'));
  const ey = Math.round(y - 6);
  if (f.blink) {
    px(i, 16, ey + 1, 2, 1, hex(dark));
    px(i, 22, ey + 1, 2, 1, hex(dark));
  } else {
    px(i, 16, ey, 2, 2, hex('#14101a'));
    px(i, 22, ey, 2, 2, hex('#14101a'));
  }
  if (f.mouth) i.rect(18, y, 4, 2.2, hex('#d84a5a'), 0.6);
}

// --- Roboter ---------------------------------------------------------------------------------

interface Bot {
  metal: string;
  accent: string;
  tall: number;
  tray?: boolean;
  sign?: boolean;
}

function robot(i: Ink, B: Bot, f: Frame): void {
  const phi = (f.phase ?? 0) * Math.PI * 2;
  const bob = f.phase !== undefined ? Math.round(Math.abs(Math.sin(phi)) * 0.6) : 0;
  const top = FOOT - B.tall + bob;
  const side = f.view === 'side';
  const cx = CX;
  const hw = side ? 6.4 : 8;
  const bodyTop = top + 15;
  const bodyLow = FOOT - 8;
  // Rad
  i.ball(cx, FOOT - 4, side ? 4.4 : 3, 4, '#2a2c34');
  i.ellipse(cx, FOOT - 4, side ? 1.8 : 1, 1.6, hex(B.accent));
  i.rect(cx - 3, bodyLow - 1, 6, 4, hex('#3a3c46'));
  // Ferner Arm
  const shoulderY = bodyTop + 3;
  if (side) i.rod(cx - 1, shoulderY, cx + 2, shoulderY + 12, 2, B.metal);
  // Rumpf
  i.poly([[cx - hw, bodyTop], [cx + hw, bodyTop], [cx + hw - 2, bodyLow], [cx - hw + 2, bodyLow]], cyl(B.metal, cx - hw, cx + hw));
  i.rect(cx - hw - 0.4, bodyTop + 6, 2 * hw + 0.8, 2, hex(B.accent));
  if (f.view === 'front') {
    i.rect(cx - 4, bodyTop + 10, 8, 5, hex('#16222c'), 1);
    for (const [k, c] of [[0, '#ff5a4a'], [1, '#ffd84a'], [2, '#5aff9a']] as const) i.rect(cx - 3 + k * 2.4, bodyTop + 12, 1.4, 1.4, hex(c));
  }
  if (side) i.rect(cx + hw - 4.4, bodyTop + 10, 2.6, 5, hex('#16222c'), 0.6);
  // Kopf
  i.rect(cx - 1.6, top + 11, 3.2, 5, hex('#3a3c46'));
  const hr = side ? 5.6 : 6.6;
  i.rect(cx - hr, top + 3, 2 * hr, 9.6, cyl(B.metal, cx - hr, cx + hr), 3);
  i.stroke(cx, top + 3, cx, top - 1, 1, hex('#8a8c94'));
  i.ball(cx, top - 1.4, 1.4, 1.4, f.mouth ? '#ff5a4a' : B.accent);
  if (f.view !== 'back') {
    const gx = side ? cx + 1 : cx - 5;
    const gw = side ? 4.4 : 10;
    i.rect(gx, top + 5, gw, 3, hex('#101820'), 1);
    if (f.blink) {
      i.rect(gx + 1, top + 6, gw - 2, 1, hex('#3a5a66'));
    } else if (side) {
      px(i, cx + 3, top + 5, 2, 2, hex('#7ae8ff'));
    } else {
      px(i, cx - 4, top + 5, 2, 2, hex('#7ae8ff'));
      px(i, cx + 2, top + 5, 2, 2, hex('#7ae8ff'));
    }
    const mouthW = f.mouth ? 5 : 3;
    i.rect((side ? cx + 3 : cx) - mouthW / 2, top + 9.4, mouthW, f.mouth === 2 ? 2 : 1, hex('#202830'));
  }
  // Nahe Arme
  const swing = f.phase !== undefined ? Math.sin(phi) * 1.5 : 0;
  if (side) {
    if (B.tray) {
      i.rod(cx, shoulderY, cx + 8, shoulderY + 4, 2.2, B.metal);
      i.ellipse(cx + 10, shoulderY + 3, 6, 1.1, hex('#d8dce4'));
      i.rect(cx + 9, shoulderY - 0.6, 2.4, 3, hex('#e88a3a'), 0.6);
    } else if (B.sign && f.gesture) {
      i.rod(cx, shoulderY, cx + 11, shoulderY - 4, 2.2, B.metal);
    } else {
      i.rod(cx, shoulderY, cx + 1 + swing, shoulderY + 13, 2.2, B.metal);
    }
    return;
  }
  i.rod(cx - hw - 1, shoulderY, cx - hw - 2 + swing, shoulderY + 12, 2.2, B.metal);
  if (B.tray && f.view === 'front') {
    i.rod(cx + hw + 1, shoulderY, cx + hw + 3, shoulderY + 6, 2.2, B.metal);
    i.ellipse(cx + hw + 3, shoulderY + 6, 6, 1.1, hex('#d8dce4'));
    i.rect(cx + hw + 2, shoulderY + 2.4, 2.4, 3.2, hex('#e88a3a'), 0.6);
  } else if (B.sign && f.gesture) {
    i.rod(cx + hw + 1, shoulderY, cx + hw + 5, shoulderY - 8, 2.2, B.metal);
  } else {
    i.rod(cx + hw + 1, shoulderY, cx + hw + 2 - swing, shoulderY + 12, 2.2, B.metal);
  }
}

// --- Besetzung -------------------------------------------------------------------------------

const SKIN = '#e0a880';
const PALE = '#e8bc9a';
const WEATHER = '#c88c60';
const BROWN = '#8c5c3c';

/** Die Tannens: rote Haare, breiter Kiefer, finsterer Blick. Über drei Zeitebenen wiederzuerkennen. */
const TANNEN = { hair: '#b04a1c', jaw: 0.02, scowl: true, skin: PALE };

export const LOOKS: Record<string, Look> = {
  // Ein Jugendlicher der 80er: rotblonder Wuschelkopf, Windjacke mit Streifen
  marty: { h: 62, sh: 7.6, hip: 5.4, limb: 2.9, leg: 3.5, head: 6.6, skin: PALE, hair: '#c47a34', hairStyle: 'mop', top: '#1f7a88', inner: '#f0ece0', opening: 1.8, vee: true, stripe: '#e8bc38', pants: '#6a7080', shoes: '#ece8e0' },
  // Der junge Erfinder: gescheitelt, Hornbrille, Arbeitskittel, Fliege
  doc_jung: { h: 64, sh: 7.2, hip: 5.2, limb: 2.7, leg: 3.2, head: 6.6, skin: SKIN, hair: '#3c2a22', hairStyle: 'slick', glasses: true, top: '#7c8c74', coat: 0.52, inner: '#ece6d4', opening: 1.8, bow: '#b83030', pants: '#3e3e4c', shoes: '#2a221e' },
  // Derselbe Erfinder dreißig Jahre später: Glatze, Haarkranz, Spitzbart, Schweißerbrille auf der Stirn
  doc: { h: 65, sh: 7.2, hip: 5.2, limb: 2.7, leg: 3.2, head: 6.6, skin: WEATHER, hair: '#a8a8a4', hairStyle: 'tufts', beard: 'goatee', beardColor: '#a8a8a4', goggles: true, top: '#a8803c', coat: 0.62, inner: '#e8e0c8', opening: 1.8, bow: '#b83030', pants: '#4a3c30', shoes: '#2a1c14', boots: true },
  jennifer: { h: 60, sh: 6.8, hip: 5.4, limb: 2.5, leg: 3.2, head: 6.4, jaw: 0.2, skin: SKIN, hair: '#2a1c22', hairStyle: 'pony', top: '#d8604a', inner: '#f4e8d8', opening: 1.4, vee: true, belt: '#3a2a22', pants: '#39527e', shoes: '#e8e0d4' },
  lorraine: { h: 59, sh: 6.8, hip: 6, limb: 2.5, leg: 3, head: 6.4, jaw: 0.2, skin: PALE, hair: '#7c3a2a', hairStyle: 'bob', top: '#8a6aa0', inner: '#ece4e0', opening: 1.5, vee: true, skirt: 0.68, skirtColor: '#4a4560', pants: '#d0a080', shoes: '#3a2c30' },
  biff: { ...TANNEN, h: 65, sh: 9.8, hip: 7.2, limb: 3.5, leg: 4, head: 6.8, belly: 1.6, hairStyle: 'crew', beard: 'stubble', beardColor: '#8a3a18', top: '#2f6a4a', plaid: '#17382a', belt: '#2a1c14', buckle: '#d8b040', pants: '#4a3a2c', shoes: '#2a1c14', boots: true },
  biff_jung: { ...TANNEN, h: 64, sh: 9.4, hip: 6.4, limb: 3.4, leg: 3.8, head: 6.6, hairStyle: 'duck', top: '#26242c', inner: '#f0ece0', opening: 2, pants: '#3a4a6a', shoes: '#1c1820' },
  buford: { ...TANNEN, h: 65, sh: 9.4, hip: 6.8, limb: 3.4, leg: 3.8, head: 6.8, hairStyle: 'crew', hat: 'stetson', hatColor: '#6a5a48', beard: 'full', beardColor: '#a8461c', top: '#6a4a2c', coat: 0.7, inner: '#8a3028', opening: 2, belt: '#20140c', buckle: '#c8a040', gadget: true, pants: '#3e3026', shoes: '#20140c', boots: true },
  brix: { ...TANNEN, h: 64, sh: 9, hip: 6, limb: 3.2, leg: 3.6, head: 6.6, hairStyle: 'slick', top: '#2e2844', inner: '#e8e4f0', opening: 1.7, tie: '#39ff9c', pants: '#26283a', shoes: '#14121c' },
  kowalski: { h: 65, sh: 10, hip: 6.6, limb: 3.5, leg: 3.8, head: 6.6, skin: SKIN, hair: '#4a3a2c', hairStyle: 'crew', hat: 'peaked', hatColor: '#2c3a66', top: '#2c3f6e', badge: true, belt: '#16161e', buckle: '#d8c060', pants: '#232d4e', shoes: '#14141c' },
  strickland: { h: 63, sh: 6.8, hip: 4.8, limb: 2.5, leg: 3, head: 6.2, jaw: 0.24, scowl: true, skin: PALE, hair: '#8c8a80', hairStyle: 'slick', moustache: true, beardColor: '#6c6a60', glasses: true, top: '#5e4a36', inner: '#e8e0cc', opening: 1.5, tie: '#34603c', pants: '#4c3c2c', shoes: '#1e1610' },
  lou: { h: 61, sh: 8.4, hip: 7, limb: 3.1, leg: 3.4, head: 6.6, belly: 2, skin: SKIN, hair: '#2c2420', hairStyle: 'crew', hat: 'paper', moustache: true, beardColor: '#2c2420', top: '#ece8dc', bow: '#20202a', apron: '#f8f6f0', pants: '#4a4a54', shoes: '#1e1a1c' },
  goldie: { h: 62, sh: 7.4, hip: 5.2, limb: 2.8, leg: 3.2, head: 6.4, skin: BROWN, hair: '#1c1416', hairStyle: 'crew', top: '#6a8aa0', belt: '#3a4a58', pants: '#5a7a90', shoes: '#26201c' },
  haendler: { h: 60, sh: 7, hip: 5.6, limb: 2.6, leg: 3.1, head: 6.4, skin: PALE, hair: '#6c665c', hairStyle: 'tufts', moustache: true, beardColor: '#6c665c', top: '#8a8678', coat: 0.5, inner: '#e0d8c8', opening: 1.5, tie: '#7a3a2a', pants: '#44403a', shoes: '#241e1a' },
  george_jung: { h: 63, sh: 6.4, hip: 4.6, limb: 2.3, leg: 2.8, head: 6.2, jaw: 0.24, skin: PALE, hair: '#c8a860', hairStyle: 'slick', glasses: true, top: '#c8a23a', sleeve: '#f0ece0', bow: '#3a5a8a', pants: '#8a7a5c', shoes: '#4a3424' },
  barkeeper: { h: 62, sh: 8, hip: 6.2, limb: 3, leg: 3.3, head: 6.6, belly: 1, skin: WEATHER, hair: '#2a201c', hairStyle: 'bald', moustache: true, beardColor: '#2a201c', top: '#6a2a30', sleeve: '#ece6d8', rolled: false, bow: '#16141c', pants: '#2c2622', shoes: '#16100c' },
  verne: { h: 47, sh: 5.4, hip: 4.2, limb: 2.2, leg: 2.6, head: 6, jaw: 0.22, skin: SKIN, hair: '#7c4a22', hairStyle: 'mop', hat: 'flatcap', hatColor: '#6a5c4a', top: '#c8b898', suspenders: '#4a3424', rolled: true, pants: '#6a4c30', shin: SKIN, shoes: '#2a1c14' },
  jules: { h: 53, sh: 5.8, hip: 4.4, limb: 2.3, leg: 2.7, head: 6.2, jaw: 0.22, skin: SKIN, hair: '#7c4a22', hairStyle: 'slick', glasses: true, top: '#7c8ca4', suspenders: '#2a2a3a', pants: '#4a4238', shoes: '#2a1c14' },
  clara: { h: 60, sh: 6.6, hip: 6, limb: 2.5, leg: 3, head: 6.4, jaw: 0.2, skin: PALE, hair: '#6a3c28', hairStyle: 'bun', top: '#5a4a80', scarf: '#efe8dc', skirt: 1, skirtColor: '#4e4070', pants: '#3a3050', shoes: '#241a1c' },
  feuerwerker: { h: 61, sh: 8, hip: 5.8, limb: 3, leg: 3.3, head: 6.6, skin: WEATHER, hair: '#8a8478', hairStyle: 'crew', hat: 'stocking', hatColor: '#a03028', moustache: true, beardColor: '#8a8478', top: '#7c7464', rolled: true, scarf: '#c8452c', apron: '#5a3c24', pants: '#3e3428', shoes: '#1e140c', boots: true },
  maurer: { h: 63, sh: 8.8, hip: 6.2, limb: 3.4, leg: 3.6, head: 6.6, skin: WEATHER, hair: '#4a3a2a', hairStyle: 'crew', hat: 'flatcap', hatColor: '#8a8474', moustache: true, beardColor: '#4a3a2a', top: '#b0a288', rolled: true, apron: '#c8c4b8', belt: '#3a2a1c', pants: '#6a6054', shoes: '#2a2018', boots: true },
  test_npc: { h: 60, sh: 7, hip: 5.4, limb: 2.7, leg: 3.2, head: 6.4, skin: '#b8b0a8', hair: '#6a6a70', hairStyle: 'slick', top: '#a8742c', pants: '#55504a', shoes: '#2a2628' },
};

const BOTS: Record<string, Bot> = {
  kellnerroboter: { metal: '#5cc0c0', accent: '#e8f0f0', tall: 54, tray: true },
  museumsroboter: { metal: '#d8b048', accent: '#8a3028', tall: 60, sign: true },
};

/** Alle Figuren, Hund und Roboter eingeschlossen. */
export const FIGURE_IDS = [...Object.keys(LOOKS), ...Object.keys(BOTS), 'einstein'];

function drawFrame(id: string, f: Frame): Picture {
  const i = new Ink(FRAME_W, FRAME_H);
  if (id === 'einstein') dog(i, f);
  else if (BOTS[id]) robot(i, BOTS[id], f);
  else figure(i, LOOKS[id], f);
  return i.finish();
}

/** Eine Animation als Zeile aus Frames. */
export function figureSheet(id: string, anim: string): Picture {
  const frames = ANIMS[anim];
  const out = new Picture(FRAME_W * frames.length, FRAME_H);
  frames.forEach((f, k) => {
    const pic = drawFrame(id, f);
    for (let y = 0; y < FRAME_H; y++) {
      for (let x = 0; x < FRAME_W; x++) {
        if (pic.touched[y * FRAME_W + x]) out.set(k * FRAME_W + x, y, pic.get(x, y));
      }
    }
  });
  return out;
}

/** Porträt für den Figurenwechsel, 22×13. */
export function figurePortrait(id: string): Picture {
  const out = new Picture(22, 13);
  const L = LOOKS[id];
  const back = hex(L ? L.top : '#3a4450');
  for (let y = 0; y < 13; y++) {
    for (let x = 0; x < 22; x++) out.set(x, y, shade(mix(back, hex('#141820'), 0.55), 1 - y * 0.03));
  }
  const i = new Ink(22, 20);
  if (L) {
    i.rect(1, 13, 20, 7, hex(L.top), 2);
    drawHead(i, L, 11, 8, 'front', 0, false);
  } else if (id === 'einstein') {
    i.ball(11, 8, 6.4, 5.8, '#a8703c');
    i.ellipse(4.2, 9, 2.2, 4.4, hex('#5a3a1c'));
    i.ellipse(17.8, 9, 2.2, 4.4, hex('#5a3a1c'));
    i.ellipse(11, 10.2, 3.4, 2.8, hex('#e8d8b8'));
    i.ellipse(11, 9.2, 1.3, 1.1, hex('#14101a'));
    px(i, 7, 5, 2, 2, hex('#14101a'));
    px(i, 13, 5, 2, 2, hex('#14101a'));
  } else {
    const B = BOTS[id];
    i.rect(4, 3, 14, 11, cyl(B.metal, 4, 18), 3);
    i.rect(6, 6, 10, 3, hex('#101820'), 1);
    px(i, 7, 6, 2, 2, hex('#7ae8ff'));
    px(i, 13, 6, 2, 2, hex('#7ae8ff'));
  }
  const pic = i.finish();
  for (let y = 0; y < 13; y++) {
    for (let x = 0; x < 22; x++) {
      if (pic.touched[y * 22 + x]) out.set(x, y, pic.get(x, y));
    }
  }
  return out;
}
