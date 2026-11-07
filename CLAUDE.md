# Hill Valley Paradox – Konventionen

Point-&-Click-Adventure im SCUMM-Stil. Phaser 4, TypeScript, Vite, inkjs, navmesh. Nur Deutsch.

**Verbindliche Vorgaben:** `SPIELKONZEPT.md` und `LOESUNGSBUCH.md`. Wird ein Rätsel im Spiel geändert, wird `LOESUNGSBUCH.md` im selben Schritt angepasst. Bei Story-, Rätsel- oder Gestaltungsfragen den Nutzer fragen, nicht raten.

## Befehle

- `npm run dev` – Dev-Server auf Port 5173
- `npm run paint` – Hintergründe, große Sprites, Titelbild, Oberfläche und Gegenstände in `assets/` malen, sofern sie fehlen (`-- --force` überschreibt alle, `-- saloon` malt nur Bilder mit „saloon“ im Namen neu)
- `npm run pixel` – Schrift, kleine Sprites und Testräume neu erzeugen; Figuren, Zeitzug und DeLorean nur, wenn sie fehlen (`npm run pixel -- --force` überschreibt auch sie)
- `npm run audio` – Musik und Effekte in `assets/audio/` erzeugen, sofern sie fehlen (`-- --force` wie oben)
- `npm run typecheck` / `npm run build`
- Veröffentlichung: Jeder Push nach `main` baut das Spiel und stellt es auf GitHub Pages (`.github/workflows/pages.yml`): https://quilmes2780.github.io/HillValley/
- `npm test` – Playwright-Durchläufe (`tests/`); nach jedem Meilenstein muss alles grün sein

## Regeln

- **Darstellung:** intern 320×200, nur ganzzahlig hochskaliert (`pixelArt: true`, `Scale.NONE` + `setZoom`). Szene 320×144, darunter Satzzeile, 9 Verben, Inventar, Porträts.
- **Texte:** nie im Code. UI, Gegenstände, Hotspots und Kommentare in `src/i18n/de.json`, Dialogtexte direkt in `src/game/dialogs/*.ink`.
- **Keine Sackgassen, kein Tod.** Scheitern führt zu einem Gag und zurück zum Ausgangspunkt. Nichts Benötigtes darf unerreichbar werden.
- **Jede Aktion bekommt eine Antwort.** Reihenfolge: Hotspot-Skript → Kombinationsregel → objektspezifischer Kommentar → Standardspruch der Figur.
- **Grafik:** Hintergründe, große Sprites, Titelbild, Oberfläche (`ui.ts`) und Gegenstände (`items.ts`, in sechsfacher Größe gemalt und verkleinert) malt `tools/paint/` in Echtfarben (`painter.ts`, Materialien in `kit.ts`, je Ort ein Modul); jedes Bild bekommt dann seine eigene 256-Farben-Palette. Stil: The Dig, Full Throttle, jede Zeitebene mit eigener Stimmung. Klickflächen stehen in `src/game/rooms/` und bestimmen, wo gemalt wird. Kleine Sprites und Figuren-Platzhalter kommen aus `tools/pixel/` mit der festen 64-Farben-Palette (`assets/palette.gpl`). Die Spielschrift steht in `tools/pixel/font.ts` (`#` voll, `+` halb hell für Rundungen; Tint färbt sie), die Schrift auf gemalten Schildern getrennt in `schild.ts`. Die Farben der Oberfläche stehen in `src/engine/theme.ts`. Eigene PNGs gleichen Namens ersetzen jedes Bild; `npm run paint` lässt vorhandene Dateien liegen. Keine Filmfiguren und kein Film-Fahrzeug zeichnen, dafür neutrale Platzhalter.
- **Figuren:** nur über `assets/characters/characters.json`. Sprites in `assets/characters/<figur>/<figur>_<animation>.png`, 32×56 je Frame, alle Frames in einer Zeile; die Frame-Anzahl ergibt sich aus der Bildbreite. Eigene PNGs müssen ohne Codeänderung funktionieren.
- **Fahrzeuge:** Zeitzug und DeLorean sind Platzhalter unter `assets/characters/<name>/`, eingebunden als Hotspot-Sprite.
- **Audio:** eigene Stücke, nie Filmmusik. Musikliste und Zuordnung zur Zeitebene in `src/game/audio.ts`, Dateien unter `assets/audio/<name>.wav`; gleichnamige Datei ersetzen genügt. `M` schaltet stumm.
- **Räume sind Daten:** ein Modul pro Raum in `src/game/rooms/`, in `rooms/index.ts` eintragen. Neue Räume dürfen keine Engine-Änderung brauchen. Walkboxes sind konvexe, zusammenhängende Polygone; `engine/validate.ts` prüft das beim Start.
- **Wege:** Innerhalb eines Gebäudes über Türen, zwischen Orten über den Stadtplan (`rooms/stadtplan.ts`, je Zeitebene eine Fassung). Neue Orte dort als Ziel eintragen.
- **Testräume:** `testraum` und `testflur` dienen nur den Engine-Tests (`?szenario=engine`) und bleiben im echten Spiel unerreichbar, außer über den Debug-Modus.
- **Spielstand ist reines JSON** (`GameState` in `src/game/state.ts`). Ändert sich das Format, `SAVE_VERSION` erhöhen.
- **Gags und Easter Eggs:** gesammelt in `src/game/rooms/extras.ts` (Klickflächen, Füllung von Lücken), Texte unter `say.extra`, Bilder in `tools/paint/extras.ts`. Sie dürfen nie Rätsel verändern.
- **Tipps:** `src/game/hints.ts` nennt je Spielstand den nächsten Schritt (Texte unter `say.hint`). Wird ein Rätsel geändert, auch hier anpassen.
- **Debug-Modus (F9)** muss für neue Inhalte weiter funktionieren: Walkboxes, Hotspots, Flags, Raumsprung, Gegenstände geben.

## Phaser 4

Vor Phaser-spezifischen APIs die passende Datei in `node_modules/phaser/skills/<thema>/SKILL.md` lesen, besonders `v3-to-v4-migration`, `text-and-bitmaptext`, `animations`, `scale-and-responsive`. Keine Phaser-3-APIs aus dem Gedächtnis verwenden (z. B. `setTintFill`, `BitmapMask` gibt es nicht mehr).

## Aufbau

- `src/engine/` – inhaltsunabhängig, keine Story
- `src/game/` – Räume, Gegenstände, Dialoge, Flags, Figuren
- `tests/` – nutzt `window.__hv` (nur mit `?test=1`), klickt aber echt auf das Canvas. `tests/walkthrough.ts` spielt das Spiel Schritt für Schritt nach `LOESUNGSBUCH.md` und wird mit jedem Kapitel erweitert.
