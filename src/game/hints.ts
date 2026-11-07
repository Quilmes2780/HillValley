import type { GameState } from './state';

/**
 * Der nächste sinnvolle Schritt als Text aus de.json (`say.hint.*`), passend zur aktiven Figur.
 * Die Reihenfolge folgt LOESUNGSBUCH.md. Wo sie frei ist, nennt der Tipp nur einen möglichen Schritt.
 */
export function hintKey(s: GameState): string {
  const f = s.flags;
  const who = s.activeCharacter;
  const has = (id: string): boolean => s.characters[who].inventory.includes(id);
  const key = (name: string): string => `say.hint.${name}`;

  if (f.zeitlinie_geheilt) return key('ende');

  if (s.chapter === 0) {
    if (!f.einstein_satt) return key('prolog_einstein');
    if (!f.brief_genommen || !f.notizbuch_genommen) return key('prolog_werkbank');
    if (!f.mr_fusion_genommen) return key('prolog_fusion');
    return key('prolog_raus');
  }

  if (s.chapter === 1) {
    if (!f.schule_zutritt) {
      if (!f.strickland_gefragt) return key('k1_schule');
      if (!f.entschuldigung_erhalten) return key(f.zeitung_genommen ? 'k1_lorraine' : 'k1_zeitung');
      return key('k1_strickland');
    }
    if (!f.kassette_erhalten) return key('k1_jennifer');
    if (!f.kabel_genommen) return key('k1_kabel');
    if (!f.diktiergeraet_genommen) return key('k1_diktier');
    if (!f.kowalski_weg) return key('k1_platz');
    if (!f.fusion_eingebaut) return key('k1_fusion');
    if (s.chronopost.mode === 'aus') return key('k1_schale');
    if (!f.brief_geschrieben) return key('k1_brief');
    return key(f.brief_im_schlitz ? 'k1_hebel' : 'k1_schlitz');
  }

  if (s.chapter === 2) {
    if (!f.mappe_verbrannt) {
      if (f.mappe_genommen) return key('k2_kamin');
      if (!f.george_geholfen) return key('k2_george');
      return key(f.strickland_weg ? 'k2_spind' : 'k2_strickland');
    }
    if (!f.schraubenzieher_genommen) return key('k2_schraubenzieher');
    if (!f.spule_ausgebaut) return key('k2_helm');
    if (!f.zigarrenkiste_genommen) return key('k2_kiste');
    if (!f.roehre_gekauft) return key(f.mixer_repariert ? 'k2_roehre' : 'k2_mixer');
    if (!f.kiste_hat_spule || !f.kiste_hat_roehre) return key('k2_bauen');
    return key('k2_einbau');
  }

  if (s.chapter === 3) {
    if (who === 'doc_jung') return key('k3_jung');
    if (who === 'marty') {
      if (!f.grundstein_zu) return key('k3m_warten');
      if (!f.brecheisen_genommen) return key('k3m_brecheisen');
      if (!f.grundstein_aufgebrochen) return key('k3m_grundstein');
      if (!f.gelber_brief_gelesen) return key('k3m_brief');
      if (!f.sicherung_genommen) return key('k3m_kasten');
      return key(f.sicherung_gesendet ? 'k3m_doc' : 'k3m_senden');
    }
    if (!f.buford_im_mist) {
      if (!f.streichhoelzer_genommen || !f.bleistift_genommen) return key('k3_schmiede');
      if (!f.festprogramm_genommen) return key('k3_programm');
      if (!f.kuchen_erhalten) return key('k3_clara');
      if (!f.buford_im_stall && !has('herausforderung')) return key('k3_diktat');
      if (!f.knallfrosch_erhalten) return key('k3_feuerwerker');
      return key(f.buford_im_stall ? 'k3_pferd' : 'k3_buford');
    }
    if (!f.flux_genommen || !f.knitterbrief_genommen) return key('k3_nehmen');
    if (!f.flux_eingebaut) return key('k3_einbau');
    if (!f.nachricht_geschrieben) return key('k3_nachricht');
    if (!f.grundstein_zu) return key('k3_grundstein');
    if (!f.sicherung_gesendet) return key('k3_marty');
    if (!f.sicherung_abgeholt) return key('k3_fach');
    return key(f.zug_repariert ? 'k3_abfahrt' : 'k3_zug');
  }

  if (s.chapter === 4) {
    if (!f.schluessel_genommen) {
      if (!f.einstein_folgt) return key('k4_tuch');
      if (!f.jennifer_lenkt_ab) return key('k4_jennifer');
      return key(f.einstein_apportiert ? 'k4_nimm' : 'k4_hol');
    }
    if (!f.schluessel_eingesetzt) return key('k4_uhrwerk');
    if (!f.zug_da) return key('k4_fach');
    if (!f.fusion_gefuettert) return key(f.wachsdose_genommen ? 'k4_dose' : 'k4_dose_holen');
    return key(f.fusion_an_doc ? 'k4_ziel' : 'k4_gib');
  }

  if (!f.muenze_erhalten) return key('k5_doc');
  if (!f.aufzug_offen) {
    if (!f.glas_genommen) {
      if (!f.brix_im_museum) return key('k5_brix');
      return key(f.roboter_verwirrt ? 'k5_glas' : 'k5_kellner');
    }
    if (!f.museum_eintritt) return key(has('freikarte') ? 'k5_karte' : 'k5_automat');
    if (!f.klebeband_genommen) return key(f.roboter_fuehrt ? 'k5_kofferraum' : 'k5_fuehrung');
    return key(has('klebeband') ? 'k5_folie' : 'k5_scanner');
  }
  if (!f.brix_gestuerzt) return key('k5_showdown');
  return key(f.brief_genommen_brix ? 'k5_vernichten' : 'k5_brief');
}
