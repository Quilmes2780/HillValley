// Der Barkeeper im Palace Saloon (Kapitel 3, Schritt 3).
EXTERNAL hasFlag(name)
EXTERNAL setFlag(name)

{hasFlag("barkeeper_schuld"):
    barkeeper: Sie schulden mir noch einen Whisky, Doc. Wasser gibt es immer noch nicht.
- else:
    barkeeper: Was darf es sein, Doc? Wasser gibt es nicht, das verdirbt den Ruf.
}
-> hub

=== hub ===
+ [Hat Buford eine blinkende Kiste bei sich?]
    ich: Hat Buford eine blinkende Kiste bei sich?
    barkeeper: Trägt sie am Gürtel, als Glücksbringer. Seit gestern hält er sich für unbesiegbar.
    -> hub
+ [Wie kommt man an Bufords Gürtel heran?]
    ich: Wie kommt man an Bufords Gürtel heran?
    barkeeper: Gar nicht. Aber er ist eitel auf sein Pferd und nimmt jede Herausforderung an. Jede.
    barkeeper: Lesen tut er aber nur, was schön geschrieben ist. Alles andere bekommt sein Pferd zum Fressen.
    -> hub
+ [Was ist das eigentlich in dem Krug?]
    ich: Was ist das eigentlich in dem Krug? Bemerkenswerte Blasenbildung!
    barkeeper: Hausmarke. Fragen Sie nicht, was drin ist. Fragen Sie, was noch steht.
    ich: Das ist ein Problem, und zwar ein chemisches!
    barkeeper: Das macht einen weiteren Whisky.
    ~ setFlag("barkeeper_schuld")
    -> hub
+ [Danke für die Auskunft.]
    ich: Danke für die Auskunft.
    barkeeper: Macht einen Whisky. Sie schulden ihn mir.
    ~ setFlag("barkeeper_schuld")
    -> END
