// Der Showdown in Brix' Büro (Kapitel 5, Schritt 16).
// Drei Runden. Wer anbeißt, stürzt und landet wieder unten; Runde 1 beginnt dann von vorn.
EXTERNAL setFlag(name)

brix: Da ist ja unser kleiner Besucher. Komm, trau dich näher. Oder bist du etwa ein Feigling?
-> runde1

=== runde1 ===
+ [Nenn mich, wie du willst. Ich hab Zeit.]
    ich: Nenn mich, wie du willst. Ich hab Zeit.
    brix: Zeit? Mir gehört die Zeit, Junge. Ganz Hill Valley kennt mich, und dich? Niemand! Feigling!
    -> runde2
+ [Was hast du da gesagt?]
    ich: Was hast du da gesagt?
    -> angebissen
+ [Niemand nennt mich einen Feigling!]
    ich: Niemand nennt mich einen Feigling!
    -> angebissen

=== runde2 ===
+ [Wer nennt mich hier Feigling?]
    ich: Wer nennt mich hier Feigling?
    -> angebissen
+ [Dein Opa hat das auch immer versucht. Hat nie geklappt.]
    ich: Dein Opa hat das auch immer versucht. Hat nie geklappt.
    brix: Lass meinen Großvater aus dem Spiel! Nur noch ein Wort, und ich schicke diesen Brief ab, du Feigling!
    -> runde3
+ [Das nimmst du zurück!]
    ich: Das nimmst du zurück!
    -> angebissen

=== runde3 ===
+ [Dir werd ich es zeigen!]
    ich: Dir werd ich es zeigen!
    -> angebissen
+ [Mach doch! Komm her!]
    ich: Mach doch! Komm her!
    -> angebissen
+ [Ich geh jetzt. Und den Brief nehm ich mit.]
    ich: Ich geh jetzt. Und den Brief nehm ich mit.
    ~ setFlag("brix_verliert")
    -> END

=== angebissen ===
brix: Ha! Komm nur!
~ setFlag("marty_beisst_an")
-> END
