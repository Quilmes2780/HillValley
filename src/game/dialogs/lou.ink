// Lou in seinem Café 1955 (Kapitel 2, Schritt 4).
EXTERNAL hasFlag(name)
EXTERNAL setFlag(name)

lou: Morgen, Doc. Kaffee? Milchshake gibt es heute nicht.
-> hub

=== hub ===
+ {not hasFlag("mixer_repariert")} [Was ist mit dem Milchshake?]
    ich: Was ist mit dem Milchshake?
    lou: Der Mixer ist kaputt. Zwei Dollar gebe ich dem, der ihn repariert.
    ~ setFlag("lou_gefragt")
    -> hub
+ [Wissen Sie, wo man Elektronenröhren bekommt?]
    ich: Wissen Sie, wo man Elektronenröhren bekommt?
    lou: Im Radioladen gegenüber. Aber der gibt nichts umsonst her.
    -> hub
+ [Was gibt es sonst Neues?]
    ich: Was gibt es sonst Neues?
    lou: Das fragen Sie mich, Doc?
    -> neues
+ [Danke, Lou.]
    ich: Danke, Lou.
    lou: Immer gern, Doc.
    -> END

=== neues ===
+ [Was halten Sie von Goldie?]
    ich: Was halten Sie von Ihrem Angestellten? Er spricht vom Rathaus.
    lou: Goldie? Ein guter Junge. Nächste Woche will er Oberbürgermeister sein und übernächste Woche Papst.
    ich: Ich würde ihm, sagen wir, einen Kredit geben. Nur so ein Gefühl.
    -> neues
+ [Haben Sie etwas ohne Zucker?]
    ich: Haben Sie vielleicht etwas ohne Zucker? Ich experimentiere gerade.
    lou: Ohne Zucker? Doc, das hier ist Hill Valley. Wenn Sie was ohne wollen, müssen Sie auswandern.
    -> neues
+ [Hat Sie die stehende Turmuhr gestört?]
    ich: Hat Sie die Turmuhr eigentlich sehr gestört, solange sie stand?
    lou: Ich gehe nach dem Magen, Doc. Der geht immer richtig.
    ich: Das sollte ich vermutlich notieren.
    -> neues
+ [Zurück zum Geschäft.]
    ich: Zurück zum Geschäft, wenn es Ihnen recht ist.
    -> hub
