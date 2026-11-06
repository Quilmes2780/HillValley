// Buford im Saloon (Kapitel 3, Schritt 4). Der Whisky ist ein Gag ohne Folgen.
EXTERNAL setFlag(name)

buford: Na, wenn das nicht der Erfinder ist. Trink einen mit mir, Doc. Oder hast du Angst?
-> hub

=== hub ===
+ [Geben Sie mir mein Eigentum zurück!]
    ich: Geben Sie mir mein Eigentum zurück!
    buford: Das hier? Bringt mir Glück. Dir hat es offenbar nicht viel gebracht.
    -> hub
+ [Einen Whisky? Na schön.]
    ich: Einen Whisky? Na schön.
    buford: Das nenne ich einen Mann!
    ~ setFlag("doc_trinkt")
    -> END
+ [Ich trinke nicht mit Verbrechern.]
    ich: Ich trinke nicht mit Verbrechern.
    buford: Dann trinke ich eben deinen mit. Hau ab.
    -> END
