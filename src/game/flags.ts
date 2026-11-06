/** Alle Flags des Spiels. Tippfehler fallen so schon beim Übersetzen auf. */
export const FLAGS = [
  'test_tuer_offen',
  'test_schrank_offen',
  'test_apfel_genommen',
  'test_keks_genommen',
  'test_schachtel_genommen',
  'test_muenze_erhalten',
  'test_muenze_abgegeben',
  'test_gefragt',
] as const;

export type FlagName = (typeof FLAGS)[number];
