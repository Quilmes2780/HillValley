# Hill Valley Paradox – Konventionen

Point-&-Click-Adventure im SCUMM-Stil. Phaser 4, TypeScript, Vite, inkjs, navmesh. Nur Deutsch.

**Verbindliche Vorgaben:** `SPIELKONZEPT.md` und `LOESUNGSBUCH.md`. Wird ein Rätsel im Spiel geändert, wird `LOESUNGSBUCH.md` im selben Schritt angepasst. Bei Story-, Rätsel- oder Gestaltungsfragen den Nutzer fragen, nicht raten.

## Befehle

- `npm run dev` – Dev-Server auf Port 5173
- `npm run pixel` – alle Grafiken in `assets/` neu erzeugen
- `npm run typecheck` / `npm run build`
- `npm test` – Playwright-Durchläufe (`tests/`); nach jedem Meilenstein muss alles grün sein

## Regeln

- **Darstellung:** intern 320×200, nur ganzzahlig hochskaliert (`pixelArt: true`, `Scale.NONE` + `setZoom`). Szene 320×144, darunter Satzzeile, 9 Verben, Inventar, Porträts.
- **Texte:** nie im Code. UI, Gegenstände, Hotspots und Kommentare in `src/i18n/de.json`, Dialogtexte direkt in `src/game/dialogs/*.ink`.
- **Keine Sackgassen, kein Tod.** Scheitern führt zu einem Gag und zurück zum Ausgangspunkt. Nichts Benötigtes darf unerreichbar werden.
- **Jede Aktion bekommt eine Antwort.** Reihenfolge: Hotspot-Skript → Kombinationsregel → objektspezifischer Kommentar → Standardspruch der Figur.
- **Grafik:** nur per Skript aus `tools/pixel/` mit der festen 64-Farben-Palette (`assets/palette.gpl`). Keine Filmfiguren und kein Film-Fahrzeug zeichnen, dafür neutrale Platzhalter.
- **Figuren:** nur über `assets/characters/characters.json`. Sprites in `assets/characters/<figur>/<figur>_<animation>.png`, 32×56 je Frame, alle Frames in einer Zeile; die Frame-Anzahl ergibt sich aus der Bildbreite. Eigene PNGs müssen ohne Codeänderung funktionieren.
- **Räume sind Daten:** ein Modul pro Raum in `src/game/rooms/`, in `rooms/index.ts` eintragen. Neue Räume dürfen keine Engine-Änderung brauchen. Walkboxes sind konvexe, zusammenhängende Polygone; `engine/validate.ts` prüft das beim Start.
- **Wege:** Innerhalb eines Gebäudes über Türen, zwischen Orten über den Stadtplan (`rooms/stadtplan.ts`, je Zeitebene eine Fassung). Neue Orte dort als Ziel eintragen.
- **Testräume:** `testraum` und `testflur` dienen nur den Engine-Tests (`?szenario=engine`) und bleiben im echten Spiel unerreichbar, außer über den Debug-Modus.
- **Spielstand ist reines JSON** (`GameState` in `src/game/state.ts`). Ändert sich das Format, `SAVE_VERSION` erhöhen.
- **Debug-Modus (F9)** muss für neue Inhalte weiter funktionieren: Walkboxes, Hotspots, Flags, Raumsprung, Gegenstände geben.

## Phaser 4

Vor Phaser-spezifischen APIs die passende Datei in `node_modules/phaser/skills/<thema>/SKILL.md` lesen, besonders `v3-to-v4-migration`, `text-and-bitmaptext`, `animations`, `scale-and-responsive`. Keine Phaser-3-APIs aus dem Gedächtnis verwenden (z. B. `setTintFill`, `BitmapMask` gibt es nicht mehr).

## Aufbau

- `src/engine/` – inhaltsunabhängig, keine Story
- `src/game/` – Räume, Gegenstände, Dialoge, Flags, Figuren
- `tests/` – nutzt `window.__hv` (nur mit `?test=1`), klickt aber echt auf das Canvas. `tests/walkthrough.ts` spielt das Spiel Schritt für Schritt nach `LOESUNGSBUCH.md` und wird mit jedem Kapitel erweitert.
