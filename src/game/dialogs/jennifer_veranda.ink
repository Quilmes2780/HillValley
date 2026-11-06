// Jennifer auf der Veranda (Kapitel 4, Schritt 4).
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
+ [Bis später.]
    ich: Bis später.
    jennifer: Bis später.
    -> END
