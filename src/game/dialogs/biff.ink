// Biff im Vorgarten. Prolog: nur Stimmung. Kapitel 4: Er lacht Marty aus.
// Beim zweiten Mal in Kapitel 4 stichelt er: Wer auf „Feigling“ anspringt, blamiert sich. Keine Folgen.
EXTERNAL hasFlag(name)
EXTERNAL setFlag(name)

{hasFlag("zeitlinie_geheilt"):
    biff: Morgen, McFly! Vierte Schicht. Man sieht sich schon fast selbst drin.
    ich: Schön für dich, Biff. Wirklich.
    biff: Morgenstund hat Wachs im Mund, sag ich immer.
    -> END
}
{hasFlag("k4_begonnen"):
    {hasFlag("biff_k4_gesprochen"):
        biff: Schon wieder du, McFly? Wer zuletzt lacht, lacht am letztesten.
        -> stichelei
    }
    ~ setFlag("biff_k4_gesprochen")
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
+ [Dein Geheimnis beim Wachsen?]
    ich: Was ist eigentlich dein Geheimnis beim Wachsen?
    biff: Man muss das Auto spüren lassen, wer der Chef ist. Dann glänzt es von selbst.
    biff: Morgenstund hat Wachs im Mund, sag ich immer.
    ich: Das sagt sonst niemand, Biff.
    biff: Weil keiner so früh aufsteht.
    -> hub
+ [Dann will ich nicht weiter stören.]
    ich: Dann will ich nicht weiter stören.
    biff: Jedenfalls nicht lange. Ha!
    -> END

=== stichelei ===
+ [Gib mir den Schlüssel, Biff.]
    ich: Gib mir den Schlüssel, Biff.
    biff: Was denn, sonst nichts? Du traust dich ja doch nicht her. Feigling.
    -> stichelei
+ {hasFlag("jennifer_lenkt_ab")} [Wie war das mit deinen großen Plänen?]
    ich: Wie war das mit deinen großen Plänen?
    biff: Hab ich dir doch schon alles erzählt! Nee, warte. Der Teil mit den Aktien war noch nicht dran.
    -> END
+ [Wie hast du mich gerade genannt?]
    ~ setFlag("biff_feigling_gehoert")
    ich: Wie hast du mich gerade genannt?
    biff: Feigling. Du kannst das Wort gern aufschreiben. Ich buchstabier's dir nur nicht.
    ich: Niemand nennt mich einen ...
    biff: Vorsicht, die Einfahrt ist frisch gewachst.
    ich: Uff! Wer wachst denn eine Einfahrt?
    biff: Ha ha ha! Immer wieder schön.
    ich: Okay. Das war jetzt nicht mein bester Auftritt. Ich sollte da nicht immer drauf anspringen.
    -> END
+ [Vergiss es. Mach weiter.]
    ich: Vergiss es. Mach weiter.
    biff: Tu ich. Das ist der Unterschied zwischen uns, McFly.
    -> END
