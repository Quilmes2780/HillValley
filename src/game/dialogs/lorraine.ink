// Lorraine in der Küche. Prolog: Hinweis auf Docs Reise. Kapitel 1: die Entschuldigung.
EXTERNAL hasFlag(name)
EXTERNAL hasItem(id)

{hasFlag("k1_begonnen"):
    lorraine: Morgen, Marty. Hast du schon die Durchsagen gehört? Mr. Tannen hat wieder die Parksteuer erhöht.
    ich: Mr. Tannen. Natürlich. Wie immer.
- else:
    lorraine: Guten Morgen, Marty. Du bist aber früh auf.
}
-> hub

=== hub ===
+ {hasFlag("strickland_gefragt") && not hasFlag("entschuldigung_erhalten") && not hasItem("zeitung")} [Schreibst du mir eine Entschuldigung für die Schule?]
    ich: Schreibst du mir eine Entschuldigung für die Schule? Strickland lässt mich sonst nicht hinein.
    lorraine: Ohne meine Morgenzeitung schreibe ich gar nichts. Sie liegt sicher wieder draußen im Vorgarten.
    -> hub
+ {not hasFlag("k1_begonnen")} [Hast du Doc in letzter Zeit gesehen?]
    ich: Hast du Doc in letzter Zeit gesehen?
    lorraine: Gestern erst. Er hat irgendwas von einer Reise erzählt.
    lorraine: Mit der ganzen Familie und reichlich Gepäck. Und er hat gefragt, ob jemand seinen Hund füttert.
    ich: Sein Hund? Das klingt nach mir.
    -> hub
+ {hasFlag("k1_begonnen")} [Mom, seit wann gehört die Stadt den Tannens?]
    ich: Mom, seit wann gehört die Stadt den Tannens?
    lorraine: Marty, was für eine Frage. Schon immer. Hast du Fieber?
    -> hub
+ [Ist noch etwas vom Frühstück da?]
    ich: Ist noch etwas vom Frühstück da?
    lorraine: In der Obstschale liegt noch etwas. Das ist gesünder als das, was du sonst isst.
    -> hub
+ [Bis später, Mom.]
    ich: Bis später, Mom.
    lorraine: Bis später. Und sei pünktlich zum Essen!
    -> END
