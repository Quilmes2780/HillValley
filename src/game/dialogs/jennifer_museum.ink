// Jennifer im Museum (Kapitel 5, Schritt 11).
EXTERNAL setFlag(name)

jennifer: Hier hat also ein Biff Tannen die Zeitmaschine erfunden. Ich lerne heute so viel.
-> hub

=== hub ===
+ [Kannst du den Roboter weglocken?]
    ich: Kannst du den Roboter weglocken? Ich muss in den Kofferraum.
    jennifer: Klar. Entschuldigung! Ich wünsche eine ausführliche Führung zur Geschichte der Familie Tannen. Von Anfang an, und mit allen Fußnoten.
    ~ setFlag("roboter_fuehrt")
    -> END
+ [Was hältst du von der Ausstellung?]
    ich: Was hältst du von der Ausstellung?
    jennifer: Die Bilder sind besser als die Wahrheit. Das scheint hier der Zweck zu sein.
    -> hub
+ [Könntest du darüber schreiben?]
    ich: Könntest du darüber nicht mal etwas schreiben?
    jennifer: Worauf denn? Hier kostet schon das Papier eine Mitgliedschaft.
    jennifer: Aber ich merke mir alles. Das ist bei Tannens immer das Einzige, was sie nicht kaufen können.
    -> hub
+ [Bis gleich.]
    ich: Bis gleich.
    jennifer: Bis gleich.
    -> END
