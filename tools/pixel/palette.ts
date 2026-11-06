/**
 * Feste 64-Farben-Palette des Spiels. Wird als assets/palette.gpl exportiert.
 * Rampen laufen von dunkel nach hell, damit sich Schattierungen einfach wählen lassen.
 */
const ENTRIES = [
  // Grau (8)
  ['schwarz', '#0b0b12'], ['grau1', '#23242e'], ['grau2', '#3b3d4a'], ['grau3', '#575a68'],
  ['grau4', '#7a7d8b'], ['grau5', '#a2a5b0'], ['grau6', '#cdd0d6'], ['weiss', '#f6f6ee'],
  // Holz und Sepia (8) – vor allem 1885
  ['holz1', '#2a1a14'], ['holz2', '#452a1c'], ['holz3', '#633d25'], ['holz4', '#85552f'],
  ['holz5', '#a8743e'], ['holz6', '#c79a5b'], ['sand1', '#dcbd84'], ['sand2', '#efdcae'],
  // Haut (4)
  ['haut1', '#8a5a44'], ['haut2', '#b67f5e'], ['haut3', '#dba987'], ['haut4', '#f1cdb0'],
  // Rot (6)
  ['rot1', '#3f0f18'], ['rot2', '#6b1824'], ['rot3', '#982530'], ['rot4', '#c63a39'],
  ['rot5', '#e4624d'], ['rot6', '#f4957a'],
  // Orange und Gelb (6)
  ['orange1', '#a2501c'], ['orange2', '#d97a26'], ['orange3', '#f2a33c'],
  ['gelb1', '#c4a02c'], ['gelb2', '#ecd14f'], ['gelb3', '#f8ee96'],
  // Grün (8)
  ['gruen1', '#12261c'], ['gruen2', '#1c4029'], ['gruen3', '#2c5f35'], ['gruen4', '#46803f'],
  ['gruen5', '#6ea34a'], ['gruen6', '#9ac55c'], ['gruen7', '#c5e07e'], ['mint', '#9fe3b4'],
  // Türkis (6) – Pastell 1955
  ['tuerkis1', '#0f3339'], ['tuerkis2', '#17555a'], ['tuerkis3', '#23807e'], ['tuerkis4', '#3eaea3'],
  ['tuerkis5', '#74d3c1'], ['tuerkis6', '#b6eadc'],
  // Blau (8)
  ['blau1', '#0d1533'], ['blau2', '#16245a'], ['blau3', '#22398a'], ['blau4', '#3056b8'],
  ['blau5', '#4f82d8'], ['blau6', '#7daeea'], ['blau7', '#aed3f4'], ['blau8', '#dcecfa'],
  // Violett (5)
  ['violett1', '#221540'], ['violett2', '#3a2269'], ['violett3', '#583493'], ['violett4', '#7f52bd'],
  ['violett5', '#ab85dd'],
  // Neon und Rosa (5) – 2015
  ['pink1', '#7c1c6a'], ['pink2', '#b82a8c'], ['pink3', '#e94fb0'], ['pink4', '#f58ccb'],
  ['neon', '#33f0e0'],
] as const;

export type ColorName = (typeof ENTRIES)[number][0];

export const PALETTE: readonly { name: ColorName; hex: string; rgb: [number, number, number] }[] =
  ENTRIES.map(([name, hex]) => ({
    name,
    hex,
    rgb: [
      parseInt(hex.slice(1, 3), 16),
      parseInt(hex.slice(3, 5), 16),
      parseInt(hex.slice(5, 7), 16),
    ] as [number, number, number],
  }));

if (PALETTE.length !== 64) {
  throw new Error(`Palette muss 64 Farben haben, hat aber ${PALETTE.length}.`);
}

/** Palette-Index zu einem Farbnamen. */
export const C = Object.fromEntries(PALETTE.map((p, i) => [p.name, i])) as Record<ColorName, number>;

/** Farbwert (0xRRGGBB) zu einem Namen, z. B. für Textfarben im Spiel. */
export function colorValue(name: string): number {
  const entry = PALETTE.find((p) => p.name === name);
  if (!entry) throw new Error(`Unbekannte Palettenfarbe: ${name}`);
  return parseInt(entry.hex.slice(1), 16);
}

export function toGpl(): string {
  const lines = ['GIMP Palette', 'Name: Hill Valley Paradox', 'Columns: 8', '#'];
  for (const p of PALETTE) {
    const [r, g, b] = p.rgb;
    lines.push(
      `${String(r).padStart(3)} ${String(g).padStart(3)} ${String(b).padStart(3)}\t${p.name}`,
    );
  }
  return lines.join('\n') + '\n';
}
