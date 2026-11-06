// Biff im Vorgarten. Prolog: nur Stimmung. Kapitel 4: Er lacht Marty aus.
EXTERNAL hasFlag(name)

{hasFlag("k4_begonnen"):
    biff: Na, McFly? Noch immer auf der Suche nach deinem Dingsda?
    ich: Du hast Docs Sendeschlüssel. Er hängt an deinem Rückspiegel!
    biff: Der hier? Ha! Komm und hol ihn dir, du Winzling. Ich drehe mich auch nicht um.
    biff: Ha ha ha! Gute Idee von dir, oder?
    -> END
}
biff: Morgen, McFly! Herrlicher Tag, was?
ich: Biff? Du bist gut gelaunt. Das macht mir Angst.
-> hub

=== hub ===
+ [Warum bist du denn so fröhlich?]
    ich: Warum bist du denn so fröhlich?
    biff: Ach, einfach so. Hab heute Morgen wichtige Post verschickt.
    biff: Sagen wir: Manche Leute bekommen bald die Anerkennung, die ihnen zusteht.
    ich: Das hat bei dir noch nie etwas Gutes bedeutet.
    -> hub
+ [Wie läuft es mit dem Auto?]
    ich: Wie läuft es mit dem Auto?
    biff: Zweite Schicht Wachs. Dein Vater bekommt das beste Auto der Straße.
    biff: Solange es noch ihm gehört.
    ich: Wie bitte?
    biff: Nichts, nichts. Geh spielen, McFly.
    -> hub
+ [Dann will ich nicht weiter stören.]
    ich: Dann will ich nicht weiter stören.
    biff: Jedenfalls nicht lange. Ha!
    -> END
