// Jennifer auf dem Platz vor dem Turm (Kapitel 5). Nur Gespräch, kein Rätsel.
EXTERNAL hasFlag(name)

jennifer: Ich sehe mir das Café und das Museum an. Wenn du jemanden ablenken lassen musst, sag Bescheid.
-> hub

=== hub ===
+ [Was hältst du von dem Turm?]
    ich: Was hältst du von dem Turm?
    jennifer: Hundert Stockwerke und keine einzige Bibliothek. Dafür drei Stockwerke Fitnessraum für Roboter.
    -> hub
+ [Machst du dir keine Sorgen wegen uns? In der Zukunft?]
    ich: Machst du dir keine Sorgen? Was aus uns wird, meine ich. Hier, in der Zukunft.
    jennifer: Marty, wenn wir das hier schaffen, gibt es diese Zukunft gar nicht mehr. Das macht es angenehm unverbindlich.
    ich: So habe ich das noch nie gesehen.
    jennifer: Deshalb bin ich mitgekommen.
    -> hub
+ [Wie lange brauchst du noch?]
    ich: Wie lange brauchst du noch?
    jennifer: Bis 16:29 Uhr. Das weiß doch jeder hier. Sogar die Tauben haben Termine.
    -> hub
+ [Bis gleich.]
    ich: Bis gleich.
    jennifer: Lass dich nicht von einer Reklame anquatschen.
    -> END
