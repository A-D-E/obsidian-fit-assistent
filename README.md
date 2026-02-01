# Obsidian Fit-Assistent

**[DE]** Synchronisiert deine [Fit-Assistent](https://fit-assistent.me)-Daten als Markdown in deinen Obsidian-Vault. Rezepte, Tracking, Mealprep, Medikamente und mehr.

**[EN]** Syncs your [Fit-Assistent](https://fit-assistent.me) data as Markdown into your Obsidian vault. Recipes, tracking, meal prep, medications and more.

![Obsidian](https://img.shields.io/badge/Obsidian-Plugin-7C3AED?style=flat-square&logo=obsidian&logoColor=white)
![License](https://img.shields.io/badge/License-MIT-green?style=flat-square)

---

## Features / Funktionen

### Rezepte / Recipes
**[DE]** Alle gespeicherten Rezepte als formatierte Markdown-Dateien mit Frontmatter (Dataview-kompatibel), Makros, Mikronährstoffen, Zutaten und Zubereitungsschritten.

**[EN]** All saved recipes as formatted Markdown files with frontmatter (Dataview-compatible), macros, micronutrients, ingredients, and instructions.

### Tages-Tracker / Daily Tracker
**[DE]** Tagesnotizen mit Mahlzeiten, Wasser, Gewicht, Medikamenten-Einnahmen und Blutdruck. Nährwert-Tabelle mit Ziel-Vergleich.

**[EN]** Daily notes aggregating meals, water, weight, medication logs, and blood pressure. Nutrition table with goal comparison.

### Mealprep-Pläne / Meal Prep Plans
**[DE]** Mealprep-Pläne als Markdown mit Tagesübersicht, Rezept-Verknüpfungen und Einkaufsliste.

**[EN]** Meal prep plans as Markdown with daily overview, recipe links, and shopping list.

### Medikamente / Medications
**[DE]** Medikamenten-, Vitamin- und Supplement-Liste gruppiert nach Typ mit Dosierung und Einnahmezeiten.

**[EN]** Medication, vitamin, and supplement list grouped by type with dosage and schedule times.

### Inventar / Inventory
**[DE]** Kücheninventar gruppiert nach Kategorie (Kühlschrank, Tiefkühler, Vorratskammer) mit Ablaufwarnungen.

**[EN]** Kitchen inventory grouped by category (fridge, freezer, pantry) with expiry warnings.

### Einkaufsliste / Shopping List
**[DE]** Einkaufsliste mit Checkboxen, gruppiert nach Kategorie, mit Fortschrittsbalken.

**[EN]** Shopping list with checkboxes, grouped by category, with progress bar.

### Profil / Profile
**[DE]** Profildaten, Ernährungsstrategie und Wasser-Einstellungen.

**[EN]** Profile data, nutrition strategy, and water settings.

### Synchronisation / Sync
**[DE]**
- **Full Sync** — Alle Daten komplett synchronisieren
- **Inkrementeller Sync** — Nur geänderte Daten laden
- **Realtime** — Echtzeit-Updates via Supabase Realtime
- **Auto-Sync** — Automatisch im einstellbaren Intervall

**[EN]**
- **Full Sync** — Sync all data completely
- **Incremental Sync** — Only fetch changed data
- **Realtime** — Live updates via Supabase Realtime
- **Auto-Sync** — Automatically at configurable intervals

---

## Datentypen / Data Types

| # | DE | EN | Tabelle / Table | Ausgabe / Output |
|---|----|----|-----------------|------------------|
| 1 | Rezepte | Recipes | `recipes` | `rezepte/<Titel>.md` |
| 2 | Mahlzeiten | Meals | `meals` | Daily Note |
| 3 | Wasser | Water | `water_logs` | Daily Note |
| 4 | Gewicht | Weight | `weight_logs` | Daily Note |
| 5 | Mealprep | Meal Prep | `mealprep_plans` | `mealprep/KW<XX>-<YYYY>.md` |
| 6 | Profil | Profile | `profiles_decrypted` | `Profil.md` |
| 7 | Inventar | Inventory | `inventory_items` | `listen/Inventar.md` |
| 8 | Medikamente | Medications | `medications_decrypted` | `gesundheit/Medikamente.md` |
| 9 | Med.-Logs | Med. Logs | `medication_logs_decrypted` | Daily Note |
| 10 | Blutdruck | Blood Pressure | `blood_pressure_logs_decrypted` | Daily Note |
| 11 | Einkaufsliste | Shopping List | `shopping_items` | `listen/Einkaufsliste.md` |

---

## Vault-Struktur / Vault Structure

By default, folders are created at vault root level with lowercase names. An optional base path can be configured in settings.

```
rezepte/                     # Individuelle Rezept-Dateien / Individual recipe files
├── Protein-Pancakes.md
└── ...
tracker/                     # Tagesnotizen / Daily notes
└── 2026/01/
    ├── 2026-01-30.md
    └── 2026-01-31.md
mealprep/                    # Mealprep-Pläne / Meal prep plans
└── KW05-2026.md
gesundheit/                  # Medikamente / Medications
└── Medikamente.md
listen/                      # Inventar & Einkaufsliste / Inventory & shopping list
├── Inventar.md
└── Einkaufsliste.md
Profil.md                    # Profildaten / Profile data
```

---

## Installation

### Manuell / Manual

**[DE]**
1. Lade `main.js`, `manifest.json` und `styles.css` aus dem [neuesten Release](https://github.com/A-D-E/obsidian-fit-assistent/releases/latest)
2. Erstelle den Ordner `.obsidian/plugins/fit-assistent/` in deinem Vault
3. Kopiere die drei Dateien dort hinein
4. Obsidian neustarten und das Plugin unter Einstellungen → Community Plugins aktivieren

**[EN]**
1. Download `main.js`, `manifest.json`, and `styles.css` from the [latest release](https://github.com/A-D-E/obsidian-fit-assistent/releases/latest)
2. Create the folder `.obsidian/plugins/fit-assistent/` in your vault
3. Copy the three files into it
4. Restart Obsidian and enable the plugin under Settings → Community Plugins

---

## Einrichtung / Setup

**[DE]**
1. Plugin-Einstellungen öffnen
2. **Verbindungstoken** eingeben — generiert in der FitAssistent-App unter *Einstellungen → API-Zugangstoken*
3. Auf **Verbinden** klicken
4. **Full Sync** starten — fertig!

**[EN]**
1. Open plugin settings
2. Enter your **Connection Token** — generated in the FitAssistent app under *Settings → API Access Tokens*
3. Click **Connect**
4. Start **Full Sync** — done!

---

## Einstellungen / Settings

**[DE]**
- **Verbindung** — Verbindungstoken, Verbinden/Trennen
- **Synchronisation** — Auto-Sync, Intervall, Realtime an/aus
- **Inhalte** — Individuelle Toggles für alle 11 Datentypen
- **Ordner** — Basis-Ordner (optional) und Unterordner konfigurierbar
- **Anzeige** — Statusleiste, Nährwert-Ziele in Tagesnotizen
- **Erweitert** — Sync-State zurücksetzen

**[EN]**
- **Connection** — Connection token, connect/disconnect
- **Sync** — Auto-sync, interval, realtime on/off
- **Content** — Individual toggles for all 11 data types
- **Folders** — Base folder (optional) and subfolders configurable
- **Display** — Status bar, nutrition goals in daily notes
- **Advanced** — Reset sync state

---

## Entwicklung / Development

```bash
# Repository klonen / Clone the repo
git clone https://github.com/A-D-E/obsidian-fit-assistent.git
cd obsidian-fit-assistent

# Abhängigkeiten installieren / Install dependencies
bun install   # or: npm install

# Entwicklungs-Build / Development build (watch mode)
bun run dev

# Produktions-Build / Production build
bun run build

# Build + kopieren ins Obsidian Vault / Build + copy to Obsidian vault
bun run deploy
```

### Testen / Testing

**[DE]**
1. Test-Vault in Obsidian erstellen
2. Symlink: `ln -s /pfad/zum/repo /pfad/zum/vault/.obsidian/plugins/fit-assistent`
3. [Hot Reload](https://github.com/pjeby/hot-reload) Plugin installieren
4. Plugin in Obsidian aktivieren

**[EN]**
1. Create a test vault in Obsidian
2. Symlink: `ln -s /path/to/repo /path/to/vault/.obsidian/plugins/fit-assistent`
3. Install the [Hot Reload](https://github.com/pjeby/hot-reload) plugin
4. Enable the plugin in Obsidian settings

---

## Projektstruktur / Project Structure

```
src/
├── main.ts                      # Plugin Entry Point
├── settings.ts                  # Settings Tab UI
├── types.ts                     # Alle Interfaces / All interfaces
├── constants.ts                 # Default-Werte / Default values
├── i18n.ts                      # Übersetzungen DE/EN / Translations DE/EN
├── api/
│   ├── supabase-client.ts       # Supabase + CORS-Bypass
│   ├── token.ts                 # Connection Token Decoder
│   └── data-service.ts          # Queries (11 Datentypen / data types)
├── sync/
│   ├── sync-engine.ts           # Full/Incremental/Single-Item Sync
│   ├── sync-state.ts            # State-Persistenz / State persistence
│   └── realtime.ts              # Supabase Realtime Subscriptions
├── templates/
│   ├── template-utils.ts        # Frontmatter, Tabellen, Formatierung / Tables, formatting
│   ├── recipe-template.ts       # Rezept / Recipe
│   ├── daily-template.ts        # Tagesnotiz / Daily note
│   ├── mealprep-template.ts     # Mealprep
│   ├── profile-template.ts      # Profil / Profile
│   ├── inventory-template.ts    # Inventar / Inventory
│   ├── medications-template.ts  # Medikamente / Medications
│   └── shopping-list-template.ts # Einkaufsliste / Shopping list
└── vault/
    ├── vault-manager.ts         # Datei-CRUD + Pfade / File CRUD + paths
    └── folder-structure.ts      # Ordner-Erstellung / Folder creation
```

---

## Datenschutz / Privacy

**[DE]** Verschlüsselte Tabellen (`profiles`, `medications`, `medication_logs`, `blood_pressure_logs`) werden ausschließlich über `_decrypted` Views gelesen. Keine Daten werden an Dritte gesendet — alles bleibt zwischen deiner Supabase-Instanz und deinem Vault.

**[EN]** Encrypted tables (`profiles`, `medications`, `medication_logs`, `blood_pressure_logs`) are read exclusively via `_decrypted` views. No data is sent to third parties — everything stays between your Supabase instance and your vault.

---

## Lizenz / License

[MIT](LICENSE) — [Andrej Daiker](https://github.com/A-D-E)

---

<p align="center">
  <a href="https://fit-assistent.me">fit-assistent.me</a>
</p>
