// Testdialog für den Engine-Kern.
// Zeilen beginnen mit "figur:". Ohne Angabe oder mit "ich:" spricht die aktive Figur.
EXTERNAL setFlag(name)
EXTERNAL hasFlag(name)
EXTERNAL giveItem(id)
EXTERNAL unlock(id)

test_npc: Guten Tag. Ich bin nur zum Testen hier.
-> hub

=== hub ===
+ [Was genau testest du hier?]
    ich: Was genau testest du hier?
    test_npc: Ob Gespräche funktionieren. Bisher sieht es gut aus.
    ~ setFlag("test_gefragt")
    -> hub
+ {not hasFlag("test_muenze_erhalten")} [Hast du etwas für mich?]
    ich: Hast du etwas für mich?
    test_npc: Hier, eine Münze. Gib sie mir ruhig später zurück.
    ~ giveItem("muenze")
    ~ setFlag("test_muenze_erhalten")
    -> hub
+ [Ich möchte mit den anderen Figuren weitermachen.]
    ich: Ich möchte mit den anderen Figuren weitermachen.
    test_npc: Dann schalte ich sie frei. Rechts unten findest du ihre Porträts.
    ~ unlock("doc_jung")
    ~ unlock("doc")
    -> hub
+ [Auf Wiedersehen.]
    ich: Auf Wiedersehen.
    test_npc: Bis zum nächsten Test.
    -> END
