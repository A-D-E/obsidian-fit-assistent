# 🏋️ Obsidian Fit-Assistent

> **🚧 Coming Soon** — This plugin is currently under active development.

Sync your **[Fit-Assistent](https://fit-assistent.de)** data directly into your Obsidian vault. Recipes, nutrition tracking, meal plans, and more — beautifully formatted as Markdown, ready for your personal knowledge base.

![Status](https://img.shields.io/badge/Status-Coming%20Soon-orange?style=flat-square)
![Obsidian](https://img.shields.io/badge/Obsidian-Plugin-7C3AED?style=flat-square&logo=obsidian&logoColor=white)
![License](https://img.shields.io/badge/License-MIT-green?style=flat-square)

---

## ✨ Features (Planned)

### 🍽️ Recipe Sync
- All your saved recipes as beautifully formatted Markdown notes
- Full macro & micronutrient data in frontmatter (Dataview-compatible!)
- Ingredients, instructions, and cooking times
- Tags for easy filtering

### 📊 Daily Nutrition Tracker
- Daily summaries with calories, protein, carbs, fat
- Water intake tracking 💧
- Weight log & trends
- Auto-generated daily notes

### 🗓️ Meal Prep Plans
- Weekly meal prep plans as linked Markdown files
- Shopping lists as checklists
- Calendar-style overview

### 👤 Profile & Goals
- Your nutritional goals & preferences synced
- Activity level & personal data
- Progress snapshots

### 🔄 Automatic Sync
- **Initial sync** — pulls all your data on first connect
- **Incremental sync** — only fetches what changed
- **Live sync** — real-time updates via Supabase Realtime *(Phase 2)*
- **Bidirectional** — rate recipes & add notes from Obsidian *(Phase 3)*

---

## 📁 Vault Structure

```
YourVault/
└── FitAssistent/
    ├── Rezepte/
    │   ├── Seidentofu-Bowl mit Erdnuss-Glasnudeln.md
    │   ├── Protein-Pancakes mit Beeren.md
    │   └── ...
    ├── Tracker/
    │   └── 2026/
    │       └── 01/
    │           ├── 2026-01-30.md
    │           └── ...
    ├── Mealprep/
    │   ├── KW05-2026.md
    │   └── ...
    └── Profil.md
```

---

## 📋 Example: Recipe Note

```markdown
---
fit_id: "abc123"
fit_type: "recipe"
title: "Seidentofu-Bowl mit Erdnuss-Glasnudeln"
calories: 620
protein: 55
carbs: 70
fat: 20
fiber: 15
tags: [high-protein, bowl, tofu, quick]
prep_time: 25
servings: 1
synced_at: 2026-01-30T18:56:00Z
---

# 🍜 Seidentofu-Bowl mit Erdnuss-Glasnudeln

> 620 kcal · 55g Protein · 70g Carbs · 20g Fett

## Zutaten
- 200g Seidentofu
- 100g Glasnudeln
- 2 EL Erdnussmehl
- 100g Mungobohnen-Sprossen
- Frühlingszwiebeln, Koriander
- Sojasauce, Limette

## Zubereitung
1. Glasnudeln nach Packungsanweisung kochen
2. Seidentofu würfeln
3. Erdnuss-Sauce anrühren
4. Alles in einer Bowl anrichten
5. Mit Sprossen und Kräutern toppen

## Mikronährstoffe
| Nährstoff | Menge |
|-----------|-------|
| Eisen | 4mg |
| Zink | 4.5mg |
| Ballaststoffe | 15g |
```

---

## 🔧 Installation

> **🚧 Not yet available** — Watch this repo or follow [@ADE](https://github.com/A-D-E) for updates!

Once released, you'll be able to install it directly from Obsidian:

1. Open **Settings → Community Plugins → Browse**
2. Search for **"Fit-Assistent"**
3. Click **Install** → **Enable**
4. Go to Plugin Settings → Log in with your Fit-Assistent account
5. Hit **Sync Now** — done! 🎉

---

## 🗺️ Roadmap

| Phase | Features | Status |
|-------|----------|--------|
| **MVP** | Recipes, Tracker, Mealprep, Profile Sync | 🔨 In Development |
| **Phase 2** | Live Sync, Inventory, Reports, Medications | 📋 Planned |
| **Phase 3** | Bidirectional Sync, Custom API Keys | 💡 Concept |

---

## 🛠️ Development

```bash
# Clone the repo
git clone https://github.com/A-D-E/obsidian-fit-assistent.git
cd obsidian-fit-assistent

# Install dependencies
npm install

# Build (dev mode with hot-reload)
npm run dev

# Production build
npm run build
```

### Testing
1. Create a test vault in Obsidian
2. Symlink the build output: `ln -s /path/to/dist /path/to/vault/.obsidian/plugins/fit-assistent`
3. Install [Hot Reload](https://github.com/pjeby/hot-reload) plugin
4. Enable the plugin in Obsidian settings

---

## 🤝 Contributing

Contributions are welcome! Please read our [Code of Conduct](CODE_OF_CONDUCT.md) before participating.

---

## 📄 License

[MIT](LICENSE) © [Andrej Daiker](https://github.com/A-D-E)

---

<p align="center">
  <b>Built with ❤️ for the Obsidian & Fitness community</b><br>
  <a href="https://fit-assistent.de">fit-assistent.de</a>
</p>
