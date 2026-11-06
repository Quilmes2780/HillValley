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
+ [Ich muss weiter.]
    ich: Ich muss weiter.
    clara: Pass auf dich auf, Emmett.
    -> END
