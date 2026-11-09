# Prompt: Gegenstände für das Adventure

---

## Aufgabe

Erstelle Pixel-Art-Gegenstände für ein Point-&-Click-Adventure. Jeder Gegenstand braucht bis zu zwei Bilder:

1. **Inventarbild**: der Gegenstand groß und gut erkennbar, so wie er im Inventar unten im Bild liegt.
2. **Raumbild** (nur wenn der Gegenstand im Raum liegt): derselbe Gegenstand klein, so wie er im Raum auf dem Tisch, Boden oder an der Wand zu sehen ist. Er wird über den Hintergrund gelegt und verschwindet, sobald man ihn nimmt.

Beide Bilder zeigen denselben Gegenstand mit denselben Farben.

## Stil

Wie handgepixelte Gegenstände aus **The Dig**, **Indiana Jones and the Fate of Atlantis**, **The Secret of Monkey Island 2** und **Thimbleweed Park**:

- Klare Silhouette, auf den ersten Blick erkennbar, auch klein.
- Licht von links oben, ein bis zwei Schattentöne, ein Glanzpunkt bei Metall, Glas oder Lack.
- Dunkle Außenkontur (nicht reines Schwarz), innen nur, wo Teile sich trennen.
- Kein Dithering-Rauschen, keine Verläufe, kein Weichzeichnen, kein Kantenglätten.
- Höchstens 16 Farben je Gegenstand.

## Technische Vorgaben

| Vorgabe | Inventarbild | Raumbild |
|---|---|---|
| Größe | genau **32 × 20 Pixel** | genau die Größe aus der Tabelle des Raums |
| Hintergrund | vollständig transparent | vollständig transparent |
| Kanten | jedes Pixel voll deckend oder voll durchsichtig | ebenso |
| Lage | mittig, 1 Pixel Rand rundum frei | füllt das Bild, Unterkante liegt auf der Ablagefläche |
| Ansicht | leicht schräg von vorn oben, gern diagonal liegend, damit er die Breite nutzt | so, wie man ihn im Raum aus Spielerhöhe sieht |
| Format | PNG mit Alphakanal | PNG mit Alphakanal |

Das Raumbild muss zum Licht und zu den Farben des Raumhintergrunds passen (Bildschirmfoto des Raums liegt bei).

## Falls das Werkzeug nicht pixelgenau arbeiten kann

In **achtfacher Größe** zeichnen (Inventarbild 256 × 160), jedes Spielpixel ein sauberer, einfarbiger 8 × 8-Block auf festem Raster; danach ohne Glättung (Nearest Neighbor) verkleinern.

## Häufige Fehler

- Gegenstand zu klein im Inventarbild, viel leere Fläche.
- Halbtransparente Kanten, Farbsäume, Hintergrundreste.
- Lose Einzelpixel neben dem Gegenstand.
- Raumbild in anderer Größe als vorgegeben oder in anderer Farbe als das Inventarbild.
- Schrift oder echte Markennamen auf dem Gegenstand.

---

# Prolog – Martys Zimmer

| Datei | Größe | Inhalt |
|---|---|---|
| `assets/items/foto_stufe0.png` … `foto_stufe4.png` | je 32 × 20 | **Familienfoto** im Holzrahmen (nur Inventar), fünf Fassungen, siehe unten |
| `assets/items/kugelschreiber.png` | 32 × 20 | **Kugelschreiber**, einfacher Druckkuli, diagonal liegend |
| `assets/backgrounds/sprites/kugelschreiber.png` | 9 × 3 | derselbe Kuli flach auf dem Schreibtisch, waagerecht |
| `assets/items/skateboard.png` | 32 × 20 | **Skateboard**, von schräg vorn, Rollen sichtbar |
| `assets/backgrounds/sprites/skateboard_wand.png` | 12 × 28 | dasselbe Skateboard senkrecht an die Wand gelehnt, Unterseite mit Rollen zu uns, unteres Ende auf dem Boden |

## Familienfoto – fünf Stufen

Rahmen, Bildaufteilung und Personen bleiben in allen fünf Bildern **pixelgenau gleich**; es ändert sich nur, was die Tabelle nennt. Das Foto zeigt die Familie vor ihrem Haus an einem Herbsttag, im Hintergrund winkt ein älterer Erfinder mit weißem Haar. Die Personen sind winzig (wenige Pixel), es kommt auf Farben und Umrisse an, nicht auf Gesichter.

| Datei | Aussehen |
|---|---|
| `foto_stufe0.png` | Familie vor dem Haus, der Erfinder winkt im Hintergrund |
| `foto_stufe1.png` | Himmel düster-orange, große rote Werbetafel im Hintergrund, der Erfinder fast unsichtbar (nur blasser Umriss) |
| `foto_stufe2.png` | Werbetafel weg, Himmel wieder normal, der Erfinder weiterhin blass |
| `foto_stufe3.png` | der Erfinder wieder deutlich zu sehen |
| `foto_stufe4.png` | alles wie Stufe 0, der Erfinder grinst und schaut in die Kamera |

### Großansicht

Bei „Schau an Familienfoto“ wird das Foto groß auf schwarzem Grund eingeblendet, solange Marty spricht. Dafür gibt es zu jeder Stufe eine große Fassung mit demselben Inhalt, nur so detailliert, dass die Personen gut zu erkennen sind (Gesichter, Kleidung, die winkende Hand des Erfinders).

| Datei | Größe |
|---|---|
| `assets/items/foto_gross_stufe0.png` … `foto_gross_stufe4.png` | je genau **160 × 100 Pixel**, deckend oder mit transparentem Rand; Rahmen eingeschlossen |

Der Sprechtext erscheint über Martys Kopf und kann den oberen Rand des Fotos überdecken; wichtige Details deshalb nicht in die obersten 15 Pixel legen. Auch hier bleiben Rahmen und Personen in allen fünf Fassungen pixelgenau gleich.

---

# Prolog – Küche

| Datei | Größe | Inhalt |
|---|---|---|
| `assets/items/banane.png` | 32 × 20 | **Banane**, reif, mit ersten braunen Flecken („noch nicht ganz schwarz“), leicht gebogen liegend |
| `assets/backgrounds/sprites/banane.png` | 16 × 8 | dieselbe Banane klein, sie liegt oben auf der Obstschale neben dem Fenster (Unterkante auf den Äpfeln) |
| `assets/items/bananenschale.png` | 32 × 20 | **Bananenschale**: die leere, aufgeklappte Schale derselben Banane (entsteht, wenn Marty die Banane isst; nur Inventar) |
| `assets/backgrounds/sprites/x_mikrowelle.png` | 18 × 13 | **Mikrowelle** auf der Arbeitsplatte rechts neben dem Fenster, von vorn: Tür mit dunklem Sichtfenster links, Bedienfeld rechts. Kein Gegenstand fürs Inventar, nur eine Klickfläche für einen Gag; sie steht fest im Raum |
