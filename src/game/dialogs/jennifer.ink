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
+ [Können wir über was anderes reden?]
    ich: Können wir kurz über was anderes reden? Irgendwas Normales?
    jennifer: Du fragst nach etwas Normalem. Das ist schon das Unnormalste heute.
    -> privat
+ [Ich muss los.]
    ich: Ich muss los.
    jennifer: Dann pass auf dich auf. Und ruf an, wenn du wieder normal bist.
    -> END

=== privat ===
+ [Wie ist das Interview gelaufen?]
    ich: Wie war dieser Tannen denn so im Interview?
    jennifer: Ich habe gefragt, wie man so reich wird. Er sagte: „Früh aufstehen und anderen Leuten Sachen wegnehmen.“
    jennifer: Danach hat er gefragt, wie man „Interview“ schreibt.
    -> privat
+ [Die Band probt bald wieder. Kommst du?]
    ~ setFlag("jennifer_band_gehoert")
    ich: Die Band probt bald wieder. Kommst du?
    jennifer: Beim letzten Mal hat die Schulleitung den Probenraum evakuiert.
    ich: Das war unser bester Auftritt!
    jennifer: Ich komme. Aber ich bringe Ohrstöpsel und einen Fragebogen mit.
    -> privat
+ [Schreibst du auch mal etwas über mich?]
    ich: Schreibst du auch mal etwas über mich?
    jennifer: Klar. Sobald du etwas tust, was man nachprüfen kann.
    -> privat
+ [Zurück zum Ernst des Lebens.]
    ich: Zurück zum Ernst des Lebens.
    jennifer: Ich war nie weg.
    -> hub
