// Jennifer in der Schülerzeitung: Sie hat Biff auf Band (Kapitel 1, Schritt 7).
EXTERNAL hasFlag(name)
EXTERNAL setFlag(name)
EXTERNAL giveItem(id)

jennifer: Marty! Du siehst aus, als hättest du ein Gespenst gesehen.
-> hub

=== hub ===
+ {not hasFlag("kassette_erhalten")} [Was machst du da?]
    ich: Was machst du da?
    jennifer: Mein Interview mit Mr. Tannen abtippen. Mittendrin hat er seinen Wachmann angebrüllt.
    jennifer: „Kowalski! In mein Büro! Sofort!“ Hat mir fast den Rekorder zerrissen.
    ich: Das hast du auf Band? Genau das brauche ich!
    jennifer: Du bist seltsam heute. Aber bitte. Für die Zeitung ist es sowieso nicht zu gebrauchen.
    ~ giveItem("kassette")
    ~ setFlag("kassette_erhalten")
    -> hub
+ [Kommt dir an der Stadt nichts komisch vor?]
    ich: Kommt dir an der Stadt nichts komisch vor?
    jennifer: Dass sie einem Mann gehört, der keinen Satz fehlerfrei sagen kann? Doch. Schon länger.
    -> hub
+ [Ich muss los.]
    ich: Ich muss los.
    jennifer: Dann pass auf dich auf. Und ruf an, wenn du wieder normal bist.
    -> END
