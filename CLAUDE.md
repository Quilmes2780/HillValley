# Hill Valley Paradox – Konventionen

Point-&-Click-Adventure im SCUMM-Stil. Phaser 4, TypeScript, Vite, inkjs, navmesh. Nur Deutsch.

**Verbindliche Vorgaben:** `SPIELKONZEPT.md` und `LOESUNGSBUCH.md`. Wird ein Rätsel im Spiel geändert, wird `LOESUNGSBUCH.md` im selben Schritt angepasst. Bei Story-, Rätsel- oder Gestaltungsfragen den Nutzer fragen, nicht raten.

## Befehle

- `npm run dev` – Dev-Server auf Port 5173
- `npm run paint` – Hintergründe, große Sprites, Titelbild, Oberfläche, Gegenstände und Figuren in `assets/` malen, sofern sie fehlen (`-- --force` überschreibt alle, `-- saloon` malt nur Bilder mit „saloon“ im Namen neu, `-- figur_marty` nur diese Figur)
- `npm run pixel` – Schrift, kleine Sprites und Testräume neu erzeugen
- `npm run audio` – Musik, Raumklang und Effekte in `assets/audio/` erzeugen, sofern sie fehlen (`-- --force` wie oben)
- `npm run typecheck` / `npm run build`
- Veröffentlichung: Jeder Push nach `main` baut das Spiel und stellt es auf GitHub Pages (`.github/workflows/pages.yml`): https://quilmes2780.github.io/HillValley/
- `npm test` – alle Playwright-Tests (`tests/`, vier Worker, etwa 4–5 Minuten); nach jedem Meilenstein muss alles grün sein
- `npm run test:schnell` – dasselbe ohne die Durchläufe durch das ganze Spiel (`komplett.spec.ts`), etwa 2 Minuten. Reicht bei reinen Bild- und Textwechseln, wenn der geänderte Raum zusätzlich gezielt geprüft wird; der volle Lauf folgt dann gesammelt nach einigen Räumen und immer vor dem Abschluss einer Arbeitsrunde. Während ein Lauf läuft, keine Dateien unter `src/` ändern: Vite lädt die Seite sonst neu, und der Lauf bricht ab.

## Regeln

- **Darstellung:** intern 320×200, nur ganzzahlig hochskaliert (`pixelArt: true`, `Scale.NONE` + `setZoom`). Szene 320×144, darunter Satzzeile, 9 Verben, Inventar, Porträts.
- **Texte:** nie im Code. UI, Gegenstände, Hotspots und Kommentare in `src/i18n/de.json`, Dialogtexte direkt in `src/game/dialogs/*.ink`.
- **Keine Sackgassen, kein Tod.** Scheitern führt zu einem Gag und zurück zum Ausgangspunkt. Nichts Benötigtes darf unerreichbar werden.
- **Jede Aktion bekommt eine Antwort.** Reihenfolge: Hotspot-Skript → Kombinationsregel → objektspezifischer Kommentar (`comments` am Hotspot, dann Reaktionstabellen) → Standardspruch der Figur.
- **Reaktionstabellen in `de.json`:** `reaktion.<raum>_<jahr>.<hotspot>.<verb>`, dazu `mit_<gegenstand>`, `mit` und `gib` für zwei Objekte; `reaktion_item.<gegenstand>.<verb>`, dazu `mit_<gegenstand>`, `benutze_mit` und `gib_an`. Ein Wert ist ein Text der aktiven Figur oder `["sprecher", "Text"]`. Standardsprüche unter `comments.<figur>`, mit eigenen Pools `person`, `ausgang`, `gegenstand` und je Zeitebene `e<jahr>`. `tests/m8-texte.spec.ts` meldet tote oder falsch zugeordnete Einträge. Reaktionen dürfen nichts am Spielstand ändern und müssen zu jedem Zustand der Klickfläche passen.
- **Stimmen:** Marty lässig, kurz, ironisch. Junger Doc zögerlich („vermutlich“, „das sollte ich notieren“). Doc mit Ausrufen und „Das ist ein Problem!“. Die Tannens verdrehen Sprichwörter. Dialoge haben höchstens 4 Antworten je Knoten; Nebengespräche liegen in eigenen Knoten, Rätselantworten bleiben auf der ersten Ebene.
- **Grafik:** Hintergründe, große Sprites, Titelbild, Oberfläche (`ui.ts`), Gegenstände (`items.ts`) und Figuren (`figuren.ts`), die letzten beiden in sechsfacher Größe gemalt und verkleinert, malt `tools/paint/` in Echtfarben (`painter.ts`, Materialien in `kit.ts`, je Ort ein Modul); jedes Bild bekommt dann seine eigene 256-Farben-Palette. Stil: The Dig, Full Throttle, jede Zeitebene mit eigener Stimmung. Klickflächen stehen in `src/game/rooms/` und bestimmen, wo gemalt wird. Kleine Sprites kommen aus `tools/pixel/` mit der festen 64-Farben-Palette (`assets/palette.gpl`). Die Spielschrift steht in `tools/pixel/font.ts` (`#` voll, `+` halb hell für Rundungen; Tint färbt sie), die Schrift auf gemalten Schildern getrennt in `tools/paint/schrift.ts` (Stile `antiqua`, `block`, `western`, `neon`, Stämme auf dem Pixelraster); `schild.ts` liefert nur noch Einzelzeichen für Gegenstände und das Breitenmaß. Die Farben der Oberfläche stehen in `src/engine/theme.ts`. Eigene PNGs gleichen Namens ersetzen jedes Bild; `npm run paint` lässt vorhandene Dateien liegen. Vom Nutzer gezeichnete Bilder stehen in `EIGENE_BILDER`, seine Figuren in `EIGENE_FIGUREN` (`tools/paint/build.ts`) und werden auch mit `--force` nie übermalt. Die Figuren tragen die Namen der Geschichte und dürfen den Filmfiguren, -schauspielern und -kostümen ähnlich sehen. Kowalski, Strickland und Jennifer sind mit Higgsfield erzeugt: Modellblatt und Bewegungen mit Nano Banana Pro auf Magenta-Grund, dann `tools/higgsfield/` (`extract.cjs` schneidet aus und verkleinert, `compose.cjs` legt die Frames mit gemeinsamer Palette an, `figur.cjs` zerlegt sie mit Augen und Mund aus `figuren/<figur>.json` in die zehn Dateien). Referenzbilder des Nutzers liegen nur lokal unter `referenzen/`.
- **Figuren:** nur über `assets/characters/characters.json`. Sprites in `assets/characters/<figur>/<figur>_<animation>.png`, 40×72 je Frame, alle Frames in einer Zeile; die Frame-Anzahl ergibt sich aus der Bildbreite. Aussehen und Gerüst stehen in `tools/paint/figuren.ts` (`LOOKS`). `height` in `characters.json` ist die Figurenhöhe, darüber stehen die Sprechtexte. Fehlt eine Animation, greift eine Ersatzregel. Eigene PNGs müssen ohne Codeänderung funktionieren. Die Klickfläche einer Nebenfigur steht beim Hotspot im Raum und muss zur Figurenhöhe passen.
- **Fahrzeuge:** liegen unter `assets/characters/<name>/`, eingebunden als Hotspot-Sprite. Zeitzug (180×76) und Wagen im Museum (130×44) malen `zeitzug` und `zeitwagen` in `tools/paint/sprites.ts` (eigene Entwürfe, ohne Filmsymbol).
- **Audio:** eigene Stücke, nie Filmmusik. Alle Stücke teilen ein Leitmotiv (`tools/audio/build.ts`, Stufen statt Noten; FM-Stimmen in `synth.ts`). Listen, Stimmen und Zuordnung zur Zeitebene in `src/game/audio.ts`, Dateien unter `assets/audio/<name>.wav`; gleichnamige Datei ersetzen genügt. `M` schaltet stumm. Der Ton lädt im Hintergrund (`engine/AudioLoadScene.ts`); das Spiel wartet nie darauf, ein Stück setzt ein, sobald seine Datei da ist.
- **Leben und Klang:** `src/game/rooms/leben.ts` legt je Raum und Jahr Effekte (`strip`, `particles`, `glow`, `pass`, `bob`), Raumklang (`ambience`), Boden für die Schritte (`floor`), eigenes Stück (`music`) und Beschäftigung der Nebenfiguren (`fidget`) fest. Das ist reine Darstellung und darf nie Rätsel oder Spielstand berühren. Bildstreifen malt `tools/paint/leben.ts`. Bausteine für große Szenen (`hop`, `moveSprite`, `burst`, `yearRoll`, `showPicture`, `setMusic`) stehen in `ScriptApi`, fertige Abläufe in `src/game/szenen.ts`.
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
