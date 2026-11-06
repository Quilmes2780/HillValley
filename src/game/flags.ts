/** Alle Flags des Spiels. Tippfehler fallen so schon beim Übersetzen auf. */
export const FLAGS = [
  // Testräume (Engine-Szenario)
  'test_tuer_offen',
  'test_schrank_offen',
  'test_apfel_genommen',
  'test_keks_genommen',
  'test_schachtel_genommen',
  'test_muenze_erhalten',
  'test_muenze_abgegeben',
  'test_gefragt',
  // Prolog
  'kugelschreiber_genommen',
  'banane_genommen',
  'labor_schrank_offen',
  'hundefutter_genommen',
  'einstein_satt',
  'wachstuch_genommen',
  'brief_genommen',
  'notizbuch_genommen',
  'mr_fusion_genommen',
] as const;

export type FlagName = (typeof FLAGS)[number];
