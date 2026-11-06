// Jennifer im Café 80er (Kapitel 5, Schritt 5).
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
+ [Bis gleich.]
    ich: Bis gleich.
    jennifer: Pass auf dich auf.
    -> END
