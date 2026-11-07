// Der junge George im Flur 1955 (Kapitel 2, Schritt 9).
// Falsche Antworten: Doc verplappert sich, rudert zurück, die Frage kommt neu.
EXTERNAL hasFlag(name)
EXTERNAL setFlag(name)
EXTERNAL giveItem(id)

{hasFlag("george_geholfen"):
    george_jung: Danke noch mal, Dr. Brown. Mein Held schlägt jetzt zurück. Es liest sich viel besser.
    -> danach
}
george_jung: Oh, hallo, Dr. Brown. Ich schreibe an einer Science-Fiction-Geschichte.
-> frage

=== frage ===
george_jung: Ich weiß nur nicht, wie mein Held mit dem Schurken umgehen soll. Was würden Sie tun?
+ [Lass ihn einfach zurückschlagen. Du weißt ja, wie das geht.]
    ich: Lass ihn einfach zurückschlagen. Du weißt ja, wie das geht.
    george_jung: Stimmt. Das weiß ich seit dem Tanzabend tatsächlich. Danke!
    george_jung: Sagen Sie, suchen Sie etwas in Biffs Spind? Er hat mich früher immer seine Bücher holen lassen.
    george_jung: Hier, die Kombination. Und diese alte Hausaufgabe, die ich für ihn schreiben musste. Ich brauche beides nicht mehr.
    ~ giveItem("zettel")
    ~ giveItem("hausaufgabe")
    ~ setFlag("george_geholfen")
    -> END
+ [Warten, bis er 1985 Autos wachst!]
    ich: Warten, bis er 1985 Autos wachst!
    george_jung: 1985?
    ich: Rein hypothetisch! Ein Stilmittel. Vergiss es. Wo waren wir?
    -> frage
+ [Schick ihm einen Brief durch die Zeit!]
    ich: Schick ihm einen Brief durch die Zeit!
    george_jung: Das wäre aber eine sehr gewagte Erfindung.
    ich: Völlig unmöglich, natürlich! Nur eine Idee. Fangen wir noch einmal an.
    -> frage
+ [Darüber muss ich nachdenken.]
    ich: Darüber muss ich nachdenken.
    george_jung: Natürlich. Ich bin ja hier.
    -> END

=== danach ===
+ [Worum geht es in deiner Geschichte?]
    ich: Worum geht es eigentlich in deiner Geschichte?
    george_jung: Ein Mann vom Planeten Zeta rettet die Erde. Er ist sehr mutig und hat keine Nebenhöhlen.
    ich: Keine Nebenhöhlen. Hm. Das ist vermutlich wichtig für die Handlung.
    george_jung: Ich schicke sie vielleicht an einen Verlag. Oder ich lasse es. Wahrscheinlich lasse ich es.
    ich: Schick sie ab. Ich habe das Gefühl, das könnte sich lohnen. Das ist aber nur ein Gefühl.
    -> danach
+ [Wie geht es Lorraine?]
    ich: Wie geht es Lorraine?
    george_jung: Gut, denke ich. Sie hat mir gestern ein Brot geschmiert. Mit Absicht!
    ich: Das ist, nach allem, was ich weiß, ein sehr gutes Zeichen.
    -> danach
+ [Lässt Biff dich in Ruhe?]
    ich: Lässt Biff dich jetzt eigentlich in Ruhe?
    george_jung: Meistens. Er wachst jetzt mein Fahrrad. Ich habe ihn nicht darum gebeten.
    -> danach
+ [Schreib weiter, George.]
    ich: Schreib weiter, George.
    george_jung: Das mache ich. Vermutlich.
    -> END
