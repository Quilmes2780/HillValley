# Prompt: Figuren aus Kapitel 1 (Kowalski, Strickland, Jennifer)

Grundlage ist `FIGUREN_PROMPT.md`: Stil, technische Vorgaben, Animationstabelle, Konsistenz, häufige Fehler und 8×-Ersatz gelten unverändert. Für jede Figur werden nur die folgenden Angaben ausgetauscht:

- In der Aufgabe statt Marty die **Beschreibung** der Figur (unten).
- Unter Figurenhöhe die **Höhe** und das **oberste Pixel** aus der Tabelle.
- In allen Dateinamen `marty_` durch den **Dateipräfix** ersetzen.

Es sind nicht spielbare Nebenfiguren, sie brauchen aber dieselben zehn Dateien wie Marty. Sie gehen in Zwischenszenen (Kowalski rennt vom Platz), sprechen und schauen sich um; fehlende Animationen würden durch Ersatzbilder gefüllt, die nicht zur Zeichnung passen.

| Figur | Dateipräfix | Höhe | oberstes Pixel | Ordner |
|---|---|---|---|---|
| Wachmann Kowalski | `kowalski_` | 69 | y = 3 | `assets/characters/kowalski/` |
| Mr. Strickland | `strickland_` | 64 | y = 8 | `assets/characters/strickland/` |
| Jennifer | `jennifer_` | 61 | y = 11 | `assets/characters/jennifer/` |

Zum Größenvergleich: Marty ist 63, Lorraine 60 und Biff 66 Pixel hoch.

---

## Wachmann Kowalski

**Beschreibung:** Ein Wachmann in den Vierzigern im Dienst von Mr. Tannen. In „Tannenburg“ (1986) bewacht er die Tür des Rathausturms. Er ist groß und breitschultrig, hat einen leichten Bauchansatz und steht stramm. Er soll Respekt einflößen, ist aber nervös: Bei jeder Tannen-Durchsage aus dem Lautsprecher zuckt er zusammen.

- Kleidung: dunkelblaue Wachuniform, Hemd und Hose im gleichen Blau (Hose etwas dunkler), Schirmmütze in Uniformblau mit schwarzem Schirm, goldenes Abzeichen auf der Brust, schwarzer Gürtel mit goldener Schnalle, schwarze Schuhe.
- Haare: kurz, dunkelbraun, unter der Mütze kaum sichtbar.
- Gesicht: kräftiges Kinn, leicht angespannter Ausdruck.
- Kein Filmkostüm, keine erkennbare echte Uniform (kein Polizeiwappen).
- Die Mütze zählt zur Höhe: Die Spitze der Mütze ist das oberste Pixel.

## Mr. Strickland

**Beschreibung:** Der strenge stellvertretende Schulleiter der Hill Valley High. Er erscheint 1986 und 1955 mit **demselben Sprite**, sein Aussehen muss also zeitlos sein. Hager, aufrecht, missbilligender Blick. Er steht im Flur und lässt niemanden ohne Entschuldigungsschreiben durch.

- Kleidung: brauner Anzug (Jacke und Hose), cremeweißes Hemd, dunkelgrüne Krawatte, dunkelbraune Schuhe.
- Haare: grau, kurz und glatt nach hinten gekämmt, hohe Stirn.
- Gesicht: schmal, mit Brille, grauem Schnurrbart und finster zusammengezogenen Brauen (Dauerzustand).
- Haltung: Hände gern hinter dem Rücken oder in die Hüfte; beim Sprechen erhebt er mahnend den Zeigefinger.

## Jennifer

**Beschreibung:** Martys Freundin, 17 Jahre alt, freundlich, wach und schlagfertig. Sie arbeitet an der Schülerzeitung und erscheint 1986 (Schülerzeitung, Vorgarten, Veranda) und 2015 mit **demselben Sprite**.

- Kleidung: korallenroter Pullover oder Jacke mit V-Ausschnitt über einer cremeweißen Bluse, dunkelbrauner Gürtel, blaue Jeans, helle Turnschuhe.
- Haare: dunkelbraun, halblang, zum Pferdeschwanz gebunden, mit etwas Stirnhaar.
- Gesicht: freundlich, offener Blick.
- Kein Filmkostüm; die Figur trägt den Namen der Geschichte, sieht aber eigenständig aus.

---

## Lieferung

Je Figur zehn PNG-Dateien nach der Tabelle in `FIGUREN_PROMPT.md`:

- `idle` (12 Frames)
- `idle_side` (12)
- `idle_back` (1)
- `walk_side` (8)
- `walk_front` (4)
- `walk_back` (4)
- `talk_front` (4)
- `talk_side` (4)
- `pickup` (4)
- `portrait` (22 × 13)

Einfach die vorhandenen Dateien im jeweiligen Ordner überschreiben. Danach prüfe ich Größen, Fußlinie und Transparenz, passe bei Bedarf `height` in `characters.json` und die Klickflächen an und schütze die Figur vor `npm run paint`.
