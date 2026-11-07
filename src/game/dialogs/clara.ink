// Clara am Kuchenstand (Kapitel 3, Schritt 7).
EXTERNAL hasFlag(name)
EXTERNAL setFlag(name)
EXTERNAL giveItem(id)

clara: Emmett! Wie weit bist du mit dem Zug?
-> hub

=== hub ===
+ {not hasFlag("kuchen_erhalten")} [Riecht das nach Kuchen?]
    ich: Riecht das nach Kuchen?
    clara: Für den Stand. Aber hier, nimm einen. Du denkst sonst den ganzen Tag ans Essen und nicht an die Arbeit.
    ~ giveItem("kuchen")
    ~ setFlag("kuchen_erhalten")
    -> hub
+ [Könntest du für mich etwas schreiben?]
    ich: Könntest du für mich etwas schreiben?
    clara: Gern. Dein Handwerk ist die Wissenschaft, meines ist das Lesbare. Bring mir nur ein Blatt.
    -> hub
+ [Wie hältst du das hier aus, Clara?]
    ich: Wie hältst du das hier eigentlich aus, Clara? Mit mir und mit diesem Jahrhundert?
    clara: Das Jahrhundert ist leicht. Es explodiert nur selten von allein.
    -> ehe
+ [Ich muss weiter.]
    ich: Ich muss weiter.
    clara: Pass auf dich auf, Emmett.
    -> END

=== ehe ===
+ [Fehlt dir etwas aus der Zukunft?]
    ich: Fehlt dir eigentlich etwas aus der Zukunft?
    clara: Ein Staubsauger, bei dem du nicht mitgeholfen hast.
    ich: Der war doch fast fertig!
    clara: Er hat die Katze angesaugt, Emmett.
    ich: Ein Prototyp! Bemerkenswert stark, das schon!
    -> ehe
+ [Glaubst du, dass wir hier wegkommen?]
    ich: Glaubst du wirklich, dass wir hier wegkommen?
    clara: Ich habe dich mit einem Zug ankommen sehen, der noch gar nicht erfunden war. Ich glaube an alles.
    ich: Das beruhigt mich, Clara. Danke. Das ist kein Problem.
    -> ehe
+ [Hältst du mich für verrückt?]
    ich: Hältst du mich eigentlich für verrückt?
    clara: Selbstverständlich. Das war in der Mitgift mit drin.
    -> ehe
+ [Zurück an die Arbeit!]
    ich: Zurück an die Arbeit!
    clara: Da warst du nie weg, Emmett.
    -> hub
