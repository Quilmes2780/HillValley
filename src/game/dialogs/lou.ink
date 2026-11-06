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
+ [Danke, Lou.]
    ich: Danke, Lou.
    lou: Immer gern, Doc.
    -> END
