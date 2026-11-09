# Prompt: Animationen für Einstein (Hund)

---

## Aufgabe

Erstelle die vollständigen Pixel-Art-Animationen für eine Nebenfigur eines Point-&-Click-Adventures: Einstein, einen mittelgroßen, zotteligen Hund. Er ist der treue Begleiter eines Erfinders: aufmerksam, gutmütig, verfressen und mit einer hervorragenden Spürnase. Das Aussehen (Rasse, Fell, Farben, Halsband) richtet sich nach den **beigefügten Referenzfotos**. Übertrage es in Pixel-Art, nicht fotorealistisch. Alle Frames und Dateien zeigen denselben Hund mit identischen Farben, Proportionen und Details.

Was der Hund im Spiel tut: Er liegt bzw. steht neben seinem Napf, läuft zum Napf und frisst, bellt, schaut sich um, nimmt eine Fährte auf, läuft quer über einen Vorgarten und bringt ein Schlüsselbund zurück.

## Stil

Der Hund soll aussehen wie ein handgepixeltes Tier aus klassischen Point-&-Click-Adventures wie **The Dig**, **Indiana Jones and the Fate of Atlantis**, **The Secret of Monkey Island 2: LeChuck's Revenge** und **Thimbleweed Park**.

- Klare, gut lesbare Silhouette, auch in der kleinen Spielgröße: Kopf, Ohren, Schnauze, Rute und vier Beine müssen sich deutlich voneinander abheben.
- Leicht stilisiert und sympathisch: etwas größerer Kopf, ausdrucksstarke Ohren und Augen, aber kein Comic-Hund mit menschlichen Zügen.
- Fell als wenige klare Flächen mit ein bis zwei Schattentönen und einzelnen Strähnen an der Kontur, kein Fellrauschen aus Einzelpixeln.
- Licht fällt von links oben.
- Eine dunkle, selektive Kontur: kräftig an der Außenkante und unten, innen nur dort, wo Formen sich trennen (Ohr vor Kopf, Bein vor Bauch).
- Kein Dithering-Rauschen, keine Verläufe, kein Weichzeichnen, kein Kantenglätten.
- Höchstens 24 Farben für den ganzen Hund, in allen Dateien dieselben.

## Technische Vorgaben

Das Spiel verwendet für alle Figuren dasselbe Frame-Format. Der Hund füllt deshalb nur den unteren Teil des Frames; oben bleibt der Frame leer.

| Vorgabe | Wert |
|---|---|
| Frame-Größe | genau **40 × 72 Pixel** |
| Hintergrund | vollständig transparent; jedes Pixel ist entweder voll deckend oder voll durchsichtig (keine halbtransparenten Kanten) |
| Fußlinie | Alle Pfoten, die den Boden berühren, liegen auf der **untersten Pixelzeile (y = 71)**, in jedem Frame, vollständig sichtbar, nie abgeschnitten |
| Höhe | **28 Pixel** von den Pfoten bis zur Ohren- bzw. Kopfspitze (oberstes Pixel bei y = 44), in jedem Frame gleich, außer beim Bellen (Kopf höchstens 1 Pixel höher) und beim Schnüffeln |
| Länge (Seitenansicht) | etwa **34 Pixel** von der Schnauze bis zum Rutenansatz; die Rute darf darüber hinausgehen, aber der ganze Hund bleibt zwischen x = 2 und x = 37 |
| Breite (Vorder- und Rückansicht) | etwa 16–20 Pixel |
| Mitte | Seitenansicht: Körpermitte (zwischen Vorder- und Hinterbeinen) bei **x = 20**. Vorder- und Rückansicht: Körperachse bei **x = 20** |
| Blickrichtung | Alle Seitenansichten blicken **nach rechts**; das Spiel spiegelt sie für links |
| Anordnung | Alle Frames einer Animation **nebeneinander in einer Zeile**, ohne Abstand, ohne Rahmen, ohne Nummern, ohne Hilfslinien |
| Format | PNG mit Alphakanal |
| Abspielgeschwindigkeit | 8 Bilder pro Sekunde |

## Animationen

| Datei | Frames | Bildgröße | Ansicht | Inhalt |
|---|---|---|---|---|
| `einstein_idle.png` | 12 | 480 × 72 | vorn | Steht und schaut uns an. Frames 1–8 und 10–12 sind **pixelgenau identisch**, Frame 9 ist ein Blinzeln (nur die Augen geschlossen). |
| `einstein_idle_side.png` | 12 | 480 × 72 | rechts | Steht ruhig, nach rechts. Der Körper ist in allen Frames **pixelgenau identisch**. Erlaubt sind nur: ein langsames Rutenwedeln (die Rute pendelt in 2–3 Stellungen) und ein Blinzeln in Frame 9. |
| `einstein_idle_back.png` | 1 | 40 × 72 | Rücken | Steht ruhig, von hinten (Rute und Hinterteil sichtbar, Ohren über dem Kopf). |
| `einstein_walk_side.png` | 8 | 320 × 72 | rechts | Lockerer Trab auf der Stelle: Die Beine bewegen sich diagonal paarweise (vorn rechts mit hinten links), dazwischen Schwebephasen. Der Körper hebt und senkt sich höchstens um 1 Pixel, Ohren und Rute federn leicht nach. Der Körper bleibt waagerecht an derselben Stelle, das Spiel bewegt den Hund. |
| `einstein_walk_front.png` | 4 | 160 × 72 | vorn | Trab auf uns zu: Vorderpfoten abwechselnd vorn, Kopf leicht wippend (höchstens 1 Pixel). |
| `einstein_walk_back.png` | 4 | 160 × 72 | Rücken | Trab von uns weg, Rute wippt mit. |
| `einstein_talk_side.png` | 4 | 160 × 72 | rechts | Bellt. Frame 1 entspricht dem Stand. Frames 2 und 3: Schnauze **deutlich geöffnet**, Kopf höchstens 1 Pixel angehoben, Ohren zucken. Frame 4: Schnauze halb geschlossen. Der Körper bleibt pixelgenau gleich. |
| `einstein_talk_front.png` | 4 | 160 × 72 | vorn | Wie oben, von vorn: Maul deutlich offen in Frames 2 und 3. |
| `einstein_pickup.png` | 4 | 160 × 72 | rechts | Senkt die Schnauze zum Boden, um zu schnüffeln, zu fressen oder etwas aufzunehmen: stehend, Kopf halb gesenkt, Schnauze am Boden (berührt y = 71), Kopf halb gesenkt. Die Pfoten bleiben an derselben Stelle. |
| `einstein_portrait.png` | 1 | 22 × 13 | vorn | Kopf mit Ohren als kleines Porträt, deckend auf dunklem, neutralem Hintergrund. |

## Konsistenz

Das ist der wichtigste Teil. Der Hund darf im Stand nicht flackern oder wandern.

1. Zeichne zuerst **einen** Grundframe je Ansicht (vorn, rechts, Rücken) und leite alle anderen Frames davon ab.
2. Was sich in einer Animation nicht bewegt, wird **pixelgenau kopiert**, nicht neu gezeichnet.
3. Umriss, Höhe, Pfotenposition und Farben sind in allen Frames einer Ansicht gleich.
4. Die Ansichten passen zueinander: gleiches Fell, gleiche Farben, gleiche Größe.

## Häufige Fehler, die vermieden werden müssen

- Pfoten stehen nicht auf der untersten Zeile oder sind unten abgeschnitten.
- Der Hund ist in der Seitenansicht zu lang und stößt an den Rand des Frames.
- Beim Traben bewegen sich alle vier Beine gleichzeitig oder die Beine verschwinden hintereinander.
- Standframes sind einzeln gezeichnet und unterscheiden sich in vielen Pixeln, dadurch „flackert“ der Hund.
- Der Hund verschiebt sich im Stand seitlich („wandert“).
- Fell besteht aus unruhigem Pixelrauschen statt aus klaren Flächen.
- Lose Einzelpixel neben dem Hund.
- Halbtransparente oder weichgezeichnete Kanten, Farbsäume, Hintergrundreste.
- Seitenansicht blickt nach links.
- Frames mit Abstand, Rahmen oder Nummern.

## Falls das Werkzeug nicht pixelgenau arbeiten kann

Zeichne in **achtfacher Größe** (Frame 320 × 576), wobei jedes Spielpixel ein sauberer, einfarbiger Block von 8 × 8 Pixeln auf einem festen Raster ist. Danach wird das Bild ohne Glättung (Nearest Neighbor) auf 40 × 72 je Frame verkleinert.

## Lieferung

Zehn PNG-Dateien mit genau den Namen und Größen aus der Tabelle oben.
