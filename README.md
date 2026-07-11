# El Pollo Loco

El Pollo Loco ist ein browserbasiertes 2D-Jump-and-Run-Spiel mit HTML5 Canvas, CSS und objektorientiertem JavaScript. Der Spieler steuert Pepe, sammelt Coins und Salsa-Flaschen, weicht Huehnern aus und kaempft sich durch mehrere Level bis zum Endboss.

Das Projekt ist als Lern- und Portfolio-Projekt entstanden und zeigt den praktischen Einsatz von Canvas-Rendering, Klassenstruktur, Spiellogik, Kollisionserkennung, Audio, responsivem Design und UI-Overlays.

## Features

- 2D-Gameplay mit HTML5 Canvas
- Objektorientierte JavaScript-Struktur
- Drei spielbare Level
- Bewegung, Springen und Flaschenwurf
- Normale Huehner, kleine Huehner und animierter Endboss
- Kollisionserkennung fuer Gegner, Sammelobjekte und Wurfobjekte
- Statusleisten fuer Leben, Coins, Flaschen und Endboss
- Hintergrundmusik und Soundeffekte
- Startscreen, Pause, Neustart und Endscreen
- Tastatursteuerung und automatische Touch-Steuerung auf mobilen Geraeten
- Responsives Layout mit Landscape-Hinweis
- Mehrsprachige UI: Deutsch, Englisch und Spanisch
- Speicherung von Einstellungen im `localStorage`
- Lokale Rangliste fuer Spielergebnisse
- Optionale Firestore-Anbindung fuer Remote-Uebersetzungen

## Tech Stack

- HTML5
- CSS3
- JavaScript
- HTML5 Canvas
- Firebase Firestore via CDN

Es wird kein Framework, kein Package Manager und kein Build-Prozess benoetigt.

## Installation

Repository klonen:

```bash
git clone <repository-url>
cd el-pollo-loco
```

Danach kann das Spiel direkt ueber die Datei `index.html` im Browser geoeffnet werden.

Fuer die lokale Entwicklung empfiehlt sich ein kleiner Webserver, zum Beispiel:

```bash
npx serve .
```

Anschliessend die angezeigte lokale URL im Browser oeffnen.

## Steuerung

| Aktion | Taste |
| --- | --- |
| Nach links laufen | Pfeil links |
| Nach rechts laufen | Pfeil rechts |
| Springen | Leertaste |
| Flasche werfen | D |
| Overlay schliessen | Escape |

Auf Touch-Geraeten werden die mobilen Steuerungsbuttons automatisch eingeblendet.

## Projektstruktur

```text
.
|-- audio/      # Musik und Soundeffekte
|-- classes/    # Spiellogik, Figuren, Gegner, Welt und UI-Klassen
|-- css/        # Game-, UI- und Responsive-Styles
|-- fonts/      # Lokale Fonts
|-- img/        # Sprites, Hintergruende, Icons und Statusleisten
|-- js/         # Startlogik, UI, Einstellungen, Controls, Audio, i18n und Rangliste
|-- levels/     # Level-Definitionen
|-- index.html  # Hauptdatei und Script-Einstieg
`-- style.css   # Globale Styles
```

## Spielablauf

1. Spiel ueber den Startscreen starten.
2. Durch das Level laufen und Coins sowie Flaschen sammeln.
3. Gegnern ausweichen oder sie besiegen.
4. Gesammelte Flaschen gegen den Endboss einsetzen.
5. Nach einem gewonnenen Level zum naechsten Level wechseln.
6. Das Spielergebnis wird in der lokalen Rangliste gespeichert.

## Entwicklungsnotizen

- Alle Scripte werden direkt in `index.html` eingebunden.
- Einstellungen wie Sprache, Audio-Status und aktuelles Level werden im `localStorage` gespeichert.
- Lokale Uebersetzungen sind sofort verfuegbar. Firestore kann bei Bedarf Remote-Uebersetzungen liefern.
- Die zentrale Spiellogik liegt in den Klassen unter `classes/`.
- Leveldaten befinden sich im Ordner `levels/`.

## Credits

Erstellt von Igor Boger als Lern- und Portfolio-Projekt.

Grafiken, Sounds und Quellcode werden zu Lern- und Demonstrationszwecken verwendet.
