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
+ [Mal was anderes, Mom.]
    ich: Mal was anderes, Mom.
    lorraine: Ist es wieder wegen des Autos? Dein Vater sagt Nein.
    -> plaudern
+ [Bis später, Mom.]
    ich: Bis später, Mom.
    lorraine: Bis später. Und sei pünktlich zum Essen!
    -> END

=== plaudern ===
+ [Ist noch etwas vom Frühstück da?]
    ich: Ist noch etwas vom Frühstück da?
    lorraine: In der Obstschale liegt noch etwas. Das ist gesünder als das, was du sonst isst.
    -> plaudern
+ [Wie habt ihr euch eigentlich kennengelernt, du und Dad?]
    ich: Wie habt ihr euch eigentlich kennengelernt, du und Dad?
    lorraine: Das habe ich dir doch schon hundertmal erzählt. Ein Tanzabend, ein Sturm und ein sehr netter Junge mit seltsamer Weste.
    ich: Dad trug eine seltsame Weste?
    lorraine: Nein, nein. Das war jemand anderes. Komisch, du siehst ihm wirklich ähnlich.
    ich: Ja. Das höre ich öfter. Wechseln wir das Thema.
    -> plaudern
+ [Woran schreibt Dad gerade?]
    ich: Woran schreibt Dad gerade?
    lorraine: Band 13. Ein Außerirdischer verliebt sich in eine Schreibmaschine.
    ich: Klingt, als wäre das sehr persönlich.
    lorraine: Sei nett. Das Buch bezahlt deine Gitarrensaiten.
    -> plaudern
+ [Egal. Zurück zum Wichtigen.]
    ich: Egal. Zurück zum Wichtigen.
    lorraine: Gut. Iss was.
    -> hub
