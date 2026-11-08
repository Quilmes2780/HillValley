# Prompt: Figuren-Animationen (Beispiel Marty)

Für andere Figuren nur den Abschnitt **Figur** austauschen und die Figurenhöhe anpassen.

---

## Aufgabe

Erstelle die vollständigen Pixel-Art-Animationen für eine spielbare Figur eines Point-&-Click-Adventures: Marty, ein 17-jähriger Schüler aus dem Jahr 1985. Das Aussehen (Frisur, Gesicht, Kleidung, Farben) richtet sich nach den **beigefügten Referenzfotos**. Übertrage es in Pixel-Art, nicht fotorealistisch. Alle Frames und Dateien zeigen dieselbe Figur mit identischen Farben, Proportionen und Details.

## Stil

Die Figur soll aussehen wie eine handgepixelte Figur aus klassischen Point-&-Click-Adventures wie **The Dig**, **Indiana Jones and the Fate of Atlantis**, **The Secret of Monkey Island 2: LeChuck's Revenge** und **Thimbleweed Park**.

- Klare, gut lesbare Silhouette, auch in der kleinen Spielgröße.
- Leicht stilisierte Proportionen: Der Kopf ist etwa ein Sechstel der Körperhöhe, Hände und Schuhe sind etwas betont.
- Licht fällt von links oben. Je Material eine Grundfarbe mit ein bis zwei Schattentönen und höchstens einem Glanzlicht.
- Eine dunkle, selektive Kontur: kräftig an der Außenkante und unten, innen nur dort, wo Formen sich trennen. Keine durchgehend schwarze Comic-Linie.
- Gesicht mit wenigen Pixeln: Augen als 1–2 Pixel, Mund als kurze Linie. Keine Glanzpunkte in den Augen.
- Kein Dithering-Rauschen, keine Verläufe, kein Weichzeichnen, kein Kantenglätten.
- Höchstens 32 Farben für die ganze Figur, in allen Dateien dieselben.

## Technische Vorgaben

| Vorgabe | Wert |
|---|---|
| Frame-Größe | genau **40 × 72 Pixel** |
| Hintergrund | vollständig transparent; jedes Pixel ist entweder voll deckend oder voll durchsichtig (keine halbtransparenten Kanten) |
| Fußlinie | Die Schuhsohlen liegen auf der **untersten Pixelzeile (y = 71)**, in jedem Frame, vollständig sichtbar, nie abgeschnitten |
| Figurenhöhe | **63 Pixel** von der Sohle bis zum Scheitel (oberstes Pixel bei y = 9), in jedem Frame gleich, außer beim Bücken |
| Mitte | Vorder- und Rückansicht: Körperachse bei **x = 20**. Seitenansicht: Mitte zwischen den Füßen bei x = 18–20 |
| Rand | Die Figur bleibt mindestens 1 Pixel innerhalb des Frames, auch Arme und Hände beim Gestikulieren |
| Blickrichtung | Alle Seitenansichten blicken **nach rechts**; das Spiel spiegelt sie für links |
| Anordnung | Alle Frames einer Animation **nebeneinander in einer Zeile**, ohne Abstand, ohne Rahmen, ohne Nummern, ohne Hilfslinien |
| Format | PNG mit Alphakanal |
| Abspielgeschwindigkeit | 8 Bilder pro Sekunde |

## Animationen

| Datei | Frames | Bildgröße | Ansicht | Inhalt |
|---|---|---|---|---|
| `marty_idle.png` | 12 | 480 × 72 | vorn | Steht ruhig. Frames 1–8 und 10–12 sind **pixelgenau identisch**, Frame 9 ist ein Blinzeln (nur die Augen geschlossen, sonst nichts verändert). |
| `marty_idle_side.png` | 12 | 480 × 72 | rechts | Wie oben, in der Seitenansicht, Blinzeln ebenfalls in Frame 9. |
| `marty_idle_back.png` | 1 | 40 × 72 | Rücken | Steht ruhig, von hinten. |
| `marty_walk_side.png` | 8 | 320 × 72 | rechts | Gehzyklus auf der Stelle: Kontakt, Abfedern, Durchschwingen, Hochkommen, dann dasselbe mit dem anderen Bein. Arme schwingen gegengleich. Der Kopf hebt und senkt sich höchstens um 1 Pixel. Der Körper bleibt waagerecht an derselben Stelle, das Spiel bewegt die Figur. |
| `marty_walk_front.png` | 4 | 160 × 72 | vorn | Gehzyklus auf uns zu: linker Fuß vorn, Mitte, rechter Fuß vorn, Mitte. |
| `marty_walk_back.png` | 4 | 160 × 72 | Rücken | Gehzyklus von uns weg, wie oben. |
| `marty_talk_front.png` | 4 | 160 × 72 | vorn | Spricht. Frame 1 entspricht dem Stand. In den übrigen Frames ändern sich **nur der Mund** und höchstens eine Hand für eine kleine Geste; alles andere bleibt pixelgenau gleich. |
| `marty_talk_side.png` | 4 | 160 × 72 | rechts | Wie oben, in der Seitenansicht. |
| `marty_pickup.png` | 4 | 160 × 72 | rechts | Hebt etwas auf: aufrecht, halb gebückt, ganz gebückt mit der Hand am Boden, halb gebückt. Die Füße bleiben dabei an derselben Stelle auf y = 71. |
| `marty_portrait.png` | 1 | 22 × 13 | vorn | Kopf und Schulteransatz als kleines Porträt für den Figurenwechsel, deckend auf dunklem, neutralem Hintergrund. |

## Konsistenz

Das ist der wichtigste Teil. Die Figur darf im Stand nicht flackern oder wandern.

1. Zeichne zuerst **einen** Grundframe je Ansicht (vorn, rechts, Rücken) und leite alle anderen Frames davon ab.
2. Was sich in einer Animation nicht bewegt, wird **pixelgenau kopiert**, nicht neu gezeichnet.
3. Umriss, Höhe, Fußposition und Farben sind in allen Frames einer Ansicht gleich.
4. Die Ansichten passen zueinander: gleiche Kleidung, gleiche Farben, gleiche Größe.

## Häufige Fehler, die vermieden werden müssen

- Figur steht nicht auf der untersten Zeile oder Schuhe sind unten abgeschnitten.
- Figur hat von Frame zu Frame eine andere Höhe oder Breite.
- Standframes sind einzeln gezeichnet und unterscheiden sich in vielen Pixeln, dadurch „flackert“ die Figur.
- Die Figur verschiebt sich im Stand seitlich („wandert“).
- Halbtransparente oder weichgezeichnete Kanten, Farbsäume, Hintergrundreste.
- Seitenansicht blickt nach links.
- Frames mit Abstand, Rahmen oder Nummern.

## Falls das Werkzeug nicht pixelgenau arbeiten kann

Zeichne in **achtfacher Größe** (Frame 320 × 576), wobei jedes Spielpixel ein sauberer, einfarbiger Block von 8 × 8 Pixeln auf einem festen Raster ist. Danach wird das Bild ohne Glättung (Nearest Neighbor) auf 40 × 72 je Frame verkleinert.

## Lieferung

Zehn PNG-Dateien mit genau den Namen und Größen aus der Tabelle oben.
