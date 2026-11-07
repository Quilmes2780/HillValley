# Hill Valley Paradox – Spielkonzept & Bauanleitung für Claude Code

> Arbeitstitel. Fan-Projekt im Stil der LucasArts-Adventures der frühen 90er (SCUMM-Ära), Thema: *Zurück in die Zukunft*.
> Diese Datei gehört ins Wurzelverzeichnis des Projekts. Claude Code liest sie als verbindliche Vorgabe.
> **Die verbindliche Rätsel- und Lösungsstruktur steht in `LOESUNGSBUCH.md`.** Beide Dateien müssen synchron bleiben: Wird ein Rätsel im Spiel geändert, wird das Lösungsbuch im selben Schritt angepasst.

---

## Teil A – Tools & Setup

### Was du selbst installierst (einmalig)

| Programm | Woher | Wofür |
|---|---|---|
| **Node.js (LTS)** | nodejs.org | Laufzeit für Phaser, Vite und Playwright |
| **Git for Windows** | git-scm.com | Versionierung; außerdem nutzt Claude Code unter Windows damit die Bash |
| **Claude Code** | PowerShell: `irm https://claude.ai/install.ps1 \| iex` (oder die Desktop-App mit „Code“-Tab) | Der Entwickler |

### Was Claude Code selbst erledigt

- **Phaser 4, TypeScript, Vite, inkjs, navmesh** werden *nicht* von Hand heruntergeladen, sondern von Claude Code per `npm install` ins Projekt geholt.
- **Playwright MCP** richtest du (oder Claude Code auf Zuruf) mit einem Befehl im Projektordner ein:

```bash
claude mcp add playwright --scope project -- npx -y @playwright/mcp@latest
```

Danach Claude Code neu starten und mit `/mcp` prüfen, ob „playwright“ verbunden ist. Beim ersten Start lädt Playwright einen eigenen Chromium-Browser (ca. 300 MB).

### Technik-Stack

| Baustein | Wahl | Warum |
|---|---|---|
| Engine | **Phaser 4** (MIT) + **TypeScript** + **Vite** | Läuft im Browser, ausgereift; das Phaser-Repo enthält Skill-Dateien für KI-Coding-Agenten |
| Dialogbäume | **ink / inkjs** (MIT) | Verzweigte Gespräche in lesbaren Textdateien |
| Wegfindung | Begehbare Polygone + Navmesh | Figuren laufen um Hindernisse herum |
| Selbsttest | **Playwright MCP** | Claude Code öffnet das Spiel im Browser, klickt sich durch, prüft Screenshots |
| Versionierung | **Git** | Jeder Zwischenstand rückholbar |
| Hosting | lokal (`npm run dev`), optional GitHub Pages | Kostenlos |

### Grafik & Sound

- Claude Code malt die Hintergründe per Skript im Stil von The Dig und Full Throttle (Echtfarbe, je Bild eine eigene 256-Farben-Palette). Oberfläche und Inventar-Icons malt das Skript ebenso. Die Schrift und kleine Sprites entstehen als Pixelgrafik per Skript.
- **Figuren und die Zeitmaschine:** Claude Code zeichnet keine Filmgesichter, keine Filmkostüme und kein Film-Fahrzeug. Die Figuren sind erfunden und im Malstil gezeichnet (`tools/paint/figuren.ts`). Alle Figuren-Sprites liegen als austauschbare PNGs in `assets/characters/<figur>/` und werden über eine Konfigurationsdatei eingebunden – eigene Sprites ersetzen sie ohne Codeänderung.
- **Musik:** BeepBox (Browser, kostenlos), eigenes Thema – nicht die Filmmusik.
- **Soundeffekte:** jsfxr (Browser, kostenlos).

### Kurzanleitung Piskel (für eigene Figuren-Sprites)

Piskel läuft kostenlos im Browser auf piskelapp.com (es gibt auch eine Desktop-Version).

1. **Neues Sprite anlegen:** „Create Sprite“. Rechts unter *Resize* die Größe einstellen: **40 × 72 Pixel** pro Bild (passt zur Spielauflösung 320 × 200; die Figur selbst ca. 60–66 px hoch, die Füße 2 px über dem unteren Rand).
2. **Werkzeuge (links):** Stift, Radierer, Fülleimer, Pipette, Linie, Rechteck, Auswahl. Pipette (Alt + Klick) holt eine Farbe aus dem Bild. Unbedingt „Pixel Perfect“-Stift nutzen, sonst entstehen Treppenkanten.
3. **Palette:** Rechts unter *Palettes* eine Palette importieren (die Datei `assets/palette.gpl`, die Claude Code anlegt). So passen die Figuren farblich zu den Hintergründen.
4. **Frames (links neben der Zeichenfläche):** Jeder Frame ist ein Animationsbild. „Add new frame“ legt ein leeres Bild an, „Duplicate“ kopiert das aktuelle – Animationen am besten durch Duplizieren und leichtes Verändern bauen.
5. **Zwiebelschale (Onion Skin):** Oben rechts einschalten – zeigt das vorherige Bild durchscheinend, damit Bewegungen flüssig werden.
6. **Vorschau:** Oben rechts läuft die Animation in Schleife; FPS-Regler auf ca. 8–10 stellen.
7. **Benötigte Animationen pro Figur:** `idle` (1–12 Frames, vier je Sekunde; wahlweise auch `idle_side` und `idle_back`), `walk_side` (6 Frames, nach rechts laufend – links wird gespiegelt), `walk_front` (4), `walk_back` (4), `talk_side` (2–3, nur Mund), `talk_front` (2–3), `pickup` (2). Jede Animation als eigenes Piskel-Projekt anlegen.
8. **Export:** „Export“ → Reiter „PNG“ → *Spritesheet* mit allen Frames **in einer Zeile**. Datei benennen wie `marty_walk_side.png` und in `assets/characters/marty/` ablegen.
9. **Sichern:** „Save“ → „Save offline as File“ (.piskel-Datei), damit du später weiterarbeiten kannst – der Browser-Speicher allein ist nicht verlässlich.

### Alternativen zur Engine

- **Godot 4 + Popochiu** (kostenlos, HTML5-Export möglich) – für Claude Code holpriger, weil editor-zentriert.
- **Adventure Game Studio** (kostenlos, Windows) – sehr authentisch, aber für Claude Code am wenigsten geeignet.

### Rechtlicher Hinweis

Privates Fan-Projekt; vor jeder Veröffentlichung Marken- und Urheberrechte von Universal/Amblin selbst bewerten.

---

## Teil B – Technische Vorgaben für Claude Code

### Look & Feel

- Interne Auflösung **320 × 200**, ganzzahlig hochskaliert, `pixelArt: true`.
- Layout wie *Monkey Island 1*: Szene oben (320 × 144), darunter Satzzeile, **9-Verben-Leiste** und Inventar.
- **Verben:** Gib · Öffne · Schließe · Nimm · Schau an · Rede mit · Benutze · Drücke · Ziehe
- Satzzeile baut sich live auf („Benutze Bananenschale mit Mr. Fusion“). Rechtsklick = sinnvolles Standardverb (Schau an / Rede mit / Öffne).
- Dialoge: Text in Figurenfarbe über dem Kopf; Antwortauswahl unten (bis zu 4 Optionen).
- **Nur Deutsch.** Alle Texte in `src/i18n/de.json`.
- **Eine Schwierigkeitsstufe.**

### Design-Grundsätze

1. Kein Tod, keine Sackgassen. Scheitern führt zu einer komischen Szene und zurück zum Ausgangspunkt.
2. Jedes Rätsel hat eine faire, im Spiel auffindbare Logik und mindestens einen Hinweis.
3. Falsche Kombinationen erzeugen individuelle, witzige Kommentare (pro Figur mindestens 15 Standardsprüche, dazu objektspezifische).
4. Ton: **Abenteuer mit Witz** (Monkey Island, Indiana Jones) – trockene Pointen, keine Albernheit um ihrer selbst willen.

### Architektur

```
src/
  engine/        # Szenen, Figuren, Wegfindung, Verben, Inventar, Dialog, Script-Runner, Speichern, Figurenwechsel
  game/
    rooms/       # ein Modul pro Raum: Hintergrund, Walkbox-Polygone, Hotspots, Skripte
    items/       # Gegenstände + Kombinationsregeln
    dialogs/     # .ink-Dateien
    state.ts     # Flags, Zeitlinien-Stufe, Chronopost-Status
  i18n/de.json
assets/
  backgrounds/  characters/<figur>/  items/  ui/  audio/  palette.gpl
tools/paint/     # Skripte, die Hintergründe, große Sprites, Titelbild, Oberfläche und Icons malen
tools/pixel/     # Skripte, die Schrift, kleine Sprites und Platzhalter als Pixelgrafik erzeugen
tests/           # Playwright-Durchläufe je Kapitel anhand LOESUNGSBUCH.md
```

- Räume datengetrieben; neue Räume ohne Engine-Änderung.
- Ein Raum kann in mehreren Zeitebenen existieren (gleicher Ort, eigener Hintergrund, eigene Hotspots) – wichtig für Turm, Schule und Diner.
- **Debug-Modus** (F9): Walkboxes, Hotspots, Flags, Raumsprung, Gegenstände geben.
- **Speichern/Laden** über `localStorage`, mehrere Slots.
- **Figurenwechsel** per Porträt-Buttons (wie *Day of the Tentacle*), freigeschaltet laut Lösungsbuch.
- **Automatischer Komplett-Durchlauf:** Ein Playwright-Test spielt das Spiel nach dem Lösungsbuch durch. Er muss nach jedem Meilenstein grün sein.

### Meilensteine

1. **Engine-Kern:** Testraum, Platzhalterfigur, Verben, Inventar, Dialog, Speichern, Figurenwechsel.
2. **Vertikaler Schnitt:** Prolog komplett spielbar.
3. Kapitel 1 und 2.
4. Kapitel 3 und 4.
5. Kapitel 5 und Epilog.
6. Feinschliff: Musik, Sounds, Übergänge, Titelbild, Abspann, Kommentar-Texte.

---

## Teil C – Story

### Prämisse

**Hill Valley, Oktober 1986.** Doc Brown ist mit Clara, Jules und Verne im Zeitzug zu einem Besuch ins Jahr **1885** aufgebrochen – zum Fest der Einweihung der Rathausuhr. Marty hat er seine neueste Erfindung anvertraut: die **Chronopost** im Uhrwerk des Rathausturms.

Was niemand weiß: Im Jahr **2015** hat **Brix Tannen** – Biffs zweiter Enkel, Griffs ehrgeiziger Cousin, Chef der Firma *Tannen Futuretech* – die Chronopost im Turm entdeckt. Er schickt seinem Großvater Biff ins Jahr 1986 einen Brief mit genauer Anleitung. Biff stiehlt Marty den Sendeschlüssel und verschickt zwei Briefe:

- an seinen Urgroßonkel **Buford „Mad Dog“ Tannen (1885)**: wo der Zeitzug steht und welches Teil man herausreißen muss,
- an sein **jüngeres Ich (Dezember 1955)**: Docs Erfindungsmappe, damit der junge Biff die Erfindungen als seine eigenen ausgibt.

Nach der verbrannten Mappe (Kapitel 2) ist 1986 geheilt. Brix schickt seinem Großvater aber weiter Briefe mit Aktienkursen und Grundstücken, deshalb gehört ihm 2015 trotzdem fast alles. Erst ohne den allerersten Brief löst sich das auf. Wer die Chronopost benutzt hat, behält sein Gedächtnis: Marty, Doc und Biff.

Am Morgen danach ist Hill Valley **„Tannenburg“**: Das Rathaus heißt „Tannen-Turm“, überall Werbung für *Tannen Industries*, und Doc sitzt in 1885 fest.

### Die Chronopost – Spielregeln

- Ein Messingkasten mit Einwurfschlitz, Jahreswählrad und Sendehebel im Uhrwerk des Turms. Der Turm steht 1885, 1955, 1986 und 2015 am selben Ort.
- **Rückwärts** (spätere → frühere Zeit) geht nur über den Schlitz – nur flache, kleine Dinge (Brief, Foto, Sicherung, Folie).
- **Vorwärts** geht nur durch Verstecken: etwas in der Vergangenheit verbergen und in der Zukunft wieder herausholen.
- **Notbetrieb** ohne Schlüssel: nur Richtung 1955 (dort hat der Blitz vom November 1955 eine „Resonanz“ hinterlassen), Energie über Mr. Fusion.
- **Verstärker** (gebaut 1955): schaltet zusätzlich 1885 frei.
- **Sendeschlüssel:** schaltet alle Jahre einschließlich 2015 frei.

### Figuren

| Figur | Zeit | Status |
|---|---|---|
| **Marty McFly** | 1986, später 2015 | spielbar (Hauptfigur) |
| **Junger Doc** | Dezember 1955 | spielbar ab Kapitel 2 |
| **Doc Brown** | 1885 | spielbar ab Kapitel 3; in Kapitel 5 Begleiter (nicht spielbar) |
| **Jennifer Parker** | 1986, 2015 | Helferin (nicht spielbar), rätselrelevant |
| **Einstein** (Hund) | 1986 | Helfer (nicht spielbar), rätselrelevant: Spürnase, Apportieren |
| Gegenspieler | Buford Tannen (1885), junger Biff (1955), Biff (1986), **Brix Tannen (2015, neu)** | |
| Nebenfiguren | Lorraine, George, Mr. Strickland (1955 und 1986), Lou (Diner 1955), Clara, Jules, Verne, Barkeeper, Feuerwerker (1885), Museumsroboter (2015) | |

### Hommagen (Pflicht)

| Hommage | Wo |
|---|---|
| **DeLorean** | 2015 im Tannen-Zeitmuseum (aus dem Wrack rekonstruiert), Rätselort; im Epilog an Doc zurückgegeben |
| **Uhr / Rathausturm** | Zentraler Ort in allen vier Zeiten |
| **Misthaufen** | 1955 (Zwischensequenz), 1885 (Rätsel), 2015 (Finale) – Tannen landen jedes Mal im Mist |
| **Jahrmarkt** | 1885, Einweihungsfest der Uhr |
| **Diner** | Lous Café 1955, Café 80er 2015 |
| **Schule** | Hill Valley High 1986 und 1955 |

### Fortschrittsanzeige

Marty trägt ein **Familienfoto**. Es verändert sich in Stufen (Tannen-Werbung im Hintergrund, verblassende Personen, Rückkehr). Schau an Foto liefert gleichzeitig einen Hinweis auf das nächste Ziel.

### Kapitelübersicht

| Kapitel | Zeit | Figur | Ziel |
|---|---|---|---|
| Prolog – Ein ganz normaler Morgen | 1986 | Marty | Docs Nachricht finden, Schlüssel ist weg |
| 1 – Tannenburg | 1986 | Marty | In den Turm, Notbetrieb starten, Brief an den jungen Doc |
| 2 – Briefe aus der Zukunft | 1955 | Junger Doc | Erfindungsmappe zurückholen, Verstärker bauen |
| 3 – Gestrandet | 1885 (+1986) | Doc, Marty | Bauteil von Buford zurück, Zeitzug reparieren |
| 4 – Der Schlüssel | 1986 | Marty | Sendeschlüssel zurück, Brix entlarven, Doc kehrt zurück |
| 5 – Hill Valley 2015 | 2015 | Marty | Brix' ersten Brief verhindern |
| Epilog | 2015/1986 | – | Zeitlinie wiederhergestellt |

Die vollständige Rätselkette steht in `LOESUNGSBUCH.md`.

Umfang: ca. 30 Räume, ca. 45 Gegenstände, Spielzeit 4–6 Stunden.

---

## Teil D – Festgelegte Entscheidungen

| Frage | Entscheidung |
|---|---|
| Ton | Abenteuer mit Witz |
| Bedienung | 9-Verben-Leiste |
| Umfang | Volles Spiel |
| Schwierigkeit | Eine Stufe |
| Jennifer & Einstein | Kommen vor, rätselrelevant, nicht spielbar |
| Gegenspieler | Je Zeitebene ein Tannen; 2015 neuer Nachfahre Brix Tannen |
| Zeitebenen | 1885, 1955, 1986, 2015 |
| Hommagen | DeLorean, Uhr, Misthaufen, Jahrmarkt, Diner, Schule |
| Grafik | Gemalte Figuren aus `tools/paint/figuren.ts`, eigene Sprites per Piskel ersetzen sie |
| Sprache | Nur Deutsch |
| Dialogtexte | Direkt in den `.ink`-Dateien, alle übrigen Texte in `src/i18n/de.json` |
| Palette | Figuren: 64 Farben (`assets/palette.gpl`); Hintergründe, Oberfläche, Icons: je Bild bis zu 256 Farben |
| Porträts | Spalte rechts neben dem Inventar |
| Wege in der Stadt | Stadtplan, je Zeitebene ein eigener |
| Neue Rätsel | Dürfen dazukommen, das Lösungsbuch wird mitgepflegt |
| Figuren | Claude legt sie im Malstil neu an: erfundene Figuren, keine Filmgesichter, etwa 40×72 |
| Anspielungen | Zunächst alle einbauen, was nicht gut ist, wird später entfernt (`src/game/rooms/extras.ts`) |
| Kapitelanfang | Titelkarte (schwarzer Bildschirm mit Kapitelname) |
| Rathausplatz 1955 | Lous Café und Radioladen mit Türen direkt am Platz |
| Verstärker (K2) | Einbau erst nach der verbrannten Erfindungsmappe |
| Musik und Effekte | Eigene Stücke per Skript (`npm run audio`) im Klang früher Soundkarten, alle mit demselben Leitmotiv: je Zeitebene eines, dazu Titel, Tannenburg, Saloon, Diner, Café 80er, Showdown und Abspann. Dazu Raumklang, Schritte und Sprechlaute. Exporte aus BeepBox oder jsfxr ersetzen einfach die gleichnamige Datei in `assets/audio/` |
| Hosting | GitHub Pages über GitHub Actions, https://quilmes2780.github.io/HillValley/ |
| Tasten | F5 Speichern/Laden, M Ton, F9 Debug; ein Klick überspringt Text und Karten |
| Hill Valley 2015 | Café 80er, Museum, Lobby und Gasse mit Türen am Platz, kein eigener Stadtplan |
| DeLorean | Neutraler Platzhalter unter `assets/characters/delorean/delorean.png` (130×44), austauschbar ohne Codeänderung |
| Zeitzug | Neutraler Platzhalter unter `assets/characters/zeitzug/zeitzug.png` (160×48), austauschbar ohne Codeänderung |

---

## Teil E – Startprompt für Claude Code

`SPIELKONZEPT.md` und `LOESUNGSBUCH.md` in einen leeren Projektordner legen, dort Claude Code starten und eingeben:

```
Lies SPIELKONZEPT.md und LOESUNGSBUCH.md vollständig. Beide sind die
verbindliche Vorgabe für dieses Projekt.

Ziel: ein klassisches Point-&-Click-Adventure im Stil der LucasArts-SCUMM-Spiele
(Monkey Island 1), spielbar im Browser, gebaut mit Phaser 4, TypeScript und
Vite, Dialoge mit inkjs. Nur deutsche Texte.

Vorgehen:
1. Prüfe, ob Node.js und Git installiert sind, und richte das Playwright-MCP
   ein, falls es noch fehlt (Befehl steht in SPIELKONZEPT.md, Teil A).
2. Wechsle in den Plan-Modus. Lege mir einen Umsetzungsplan für Meilenstein 1
   vor: Ordnerstruktur, Module, Datenformat für Räume, Hotspots, Walkboxes,
   Gegenstände, Flags und Zeitebenen. Warte auf meine Freigabe.
3. Prüfe, ob das Phaser-Paket bzw. -Repository Skill-Dateien für KI-Agenten
   enthält, und nutze sie für Phaser-4-spezifische APIs.
4. Lege eine CLAUDE.md mit den wichtigsten Konventionen an (320x200,
   Pixel-Art-Rendering, Texte nur über i18n, keine Sackgassen, Debug-Modus,
   Lösungsbuch ist verbindlich und wird bei Änderungen mitgepflegt).
5. Grafik: Hintergründe, Gegenstände, UI und Schrift erzeugst du per Skript
   in tools/pixel/ mit einer festen Palette, die du auch als
   assets/palette.gpl exportierst. Für alle Figuren verwendest du neutrale
   Platzhalter; Sprites werden über eine Konfigurationsdatei aus
   assets/characters/<figur>/ geladen und müssen sich durch meine eigenen
   PNG-Spritesheets (Format siehe Piskel-Anleitung) ersetzen lassen.
6. Nach jedem Meilenstein: Dev-Server starten, Spiel mit dem Playwright-MCP
   öffnen, die Schritte aus LOESUNGSBUCH.md für die fertigen Kapitel
   durchspielen, Screenshots prüfen, Fehler beheben, mit Git committen.
7. Bei Story-, Rätsel- oder Gestaltungsfragen frag mich, statt zu raten.
```
