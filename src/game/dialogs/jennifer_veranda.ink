// Jennifer auf der Veranda (Kapitel 4, Schritt 4).
EXTERNAL hasFlag(name)
EXTERNAL setFlag(name)

jennifer: Marty! Ich dachte, du wärst noch immer auf der Jagd nach deinem Kasten.
-> hub

=== hub ===
+ [Kannst du Biff ablenken?]
    ich: Kannst du Biff ablenken? Ich brauche etwas aus Dads Auto.
    jennifer: Biff? Ich frage ihn einfach nach seinen großen Plänen. Dann redet er bis zum Abend und dreht jedem den Rücken zu, der nicht bewundernd schaut.
    ich: Du bist die Beste.
    jennifer: Das weiß ich. Bis gleich!
    ~ setFlag("jennifer_lenkt_ab")
    -> END
+ [Was gibt es Neues?]
    ich: Was gibt es Neues?
    jennifer: Hill Valley ist seit gestern wieder Hill Valley. Niemand außer mir scheint das seltsam zu finden.
    -> hub
+ [Erinnerst du dich an die Sache mit Mr. Tannen?]
    ich: Erinnerst du dich an die Sache mit Mr. Tannen, mit der Kassette?
    jennifer: Welche Kassette? Es gibt keinen Mr. Tannen. Biff wäscht Autos.
    jennifer: Komisch ist nur, dass auf meinem Schreibtisch ein Interview liegt, das ich nie geführt habe.
    ich: Lies das lieber nicht bis zum Ende. Es wird nicht besser.
    {hasFlag("jennifer_band_gehoert"):
        jennifer: Und irgendjemand hat mich zu einer Bandprobe eingeladen. Ich habe noch die Ohrstöpsel in der Tasche.
        ich: Ähm. Das war dann wohl ich. Ungefähr.
    }
    -> hub
+ [Bis später.]
    ich: Bis später.
    jennifer: Bis später.
    -> END
