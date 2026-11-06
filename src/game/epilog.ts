import type { Script } from '../engine/types';

/**
 * Finale und Epilog: Brix' Brief wird vernichtet, die Zeitlinie heilt.
 * Danach ist Marty wieder in seinem Hill Valley und kann sich frei bewegen.
 */
export const epilog: Script = async (g) => {
  g.removeItem('brief_brix');
  await g.cutscene(async () => {
    await g.say('say.epilog.vernichten');
    await g.timeWave();
    g.setFlag('zeitlinie_geheilt');
    g.state.chapter = 6;
    g.state.timeline.tannenburg = false;
    g.setPhotoStage(4);

    await g.goToRoom('turmplatz', 2015, [160, 120], 'hinten');
    await g.say('say.epilog.platz');

    g.state.characters.doc = { room: 'museum', era: 2015, x: 202, y: 118, face: 'links', inventory: [] };
    await g.goToRoom('museum', 2015, [130, 118], 'rechts');
    await g.say('say.epilog.schild');
    await g.sayAs('doc', 'say.epilog.doc_zwinkert');
    await g.sayAs('doc', 'say.epilog.paradox_1');
    await g.sayAs('doc', 'say.epilog.paradox_2');
    await g.say('say.epilog.narbe');

    // Zurück nach 1986: Alles ist wieder an seinem Platz.
    g.setFlag('jennifer_lenkt_ab', false);
    g.setFlag('zug_da', false);
    g.setFlag('kabel_angeschlossen', false);
    g.setFlag('diktiergeraet_angeschlossen', false);
    g.setFlag('einstein_folgt', false);
    await g.goToRoom('vorgarten', 1986, [100, 118], 'rechts');
    await g.sayAs('biff', 'say.epilog.biff');
    await g.goToRoom('rathausplatz', 1986, [160, 118], 'hinten');
    await g.say('say.epilog.rathaus');
    await g.goToRoom('docs_labor', 1986, [140, 118], 'links');
    await g.sayAs('einstein', 'say.prolog.einstein_bellt');
    await g.say('say.epilog.einstein');
    await g.say('item.foto.stufe4');

    await g.showCard('chapter.ende.title', 'chapter.ende.subtitle');
    await g.showCard('chapter.abspann1.title', 'chapter.abspann1.subtitle');
    await g.showCard('chapter.abspann2.title', 'chapter.abspann2.subtitle');
  });
};
