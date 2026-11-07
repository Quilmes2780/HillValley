// Jennifer im Café 80er (Kapitel 5, Schritt 5).
EXTERNAL hasFlag(name)
EXTERNAL setFlag(name)

jennifer: Marty, dieser Roboter hat mich gefragt, ob ich den Geschmack „Nostalgie“ möchte.
-> hub

=== hub ===
+ [Kannst du den Kellner beschäftigen?]
    ich: Kannst du den Kellner beschäftigen? Ich brauche Brix' Glas.
    jennifer: Ganz einfach. Entschuldigung! Ich hätte gern etwas ganz Normales aus 1986.
    ~ setFlag("roboter_verwirrt")
    -> END
+ [Wie gefällt dir 2015?]
    ich: Wie gefällt dir 2015?
    jennifer: Die Schuhe binden sich selbst, aber niemand schaut sich mehr an. Ich hatte mehr Fortschritt erwartet.
    -> hub
+ [Sehen wir hier wirklich so aus?]
    ich: Das hier soll unsere Zeit sein? Sehen wir wirklich so aus?
    jennifer: Du hast den Automaten da gesehen und bist feucht in den Augen geworden.
    ich: Das war die Klimaanlage.
    {hasFlag("jennifer_band_gehoert"):
        jennifer: Die spielen hier übrigens auch dein Lieblingsgeräusch. Es heißt jetzt „klassisch“.
    }
    -> hub
+ [Bis gleich.]
    ich: Bis gleich.
    jennifer: Pass auf dich auf.
    -> END
