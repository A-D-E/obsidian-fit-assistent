# Changelog

All notable changes to the Obsidian FitAssistent plugin will be documented in this file.

## [1.0.0] — 2026-02-01

### Added
- **Connection Token auth** — secure PAT-based authentication (replaces email/password)
- **11 data types** synced as Markdown: recipes, meals, water, weight, mealprep, profile, inventory, medications, medication logs, blood pressure, shopping list
- **Full Sync** — complete data synchronisation
- **Incremental Sync** — only fetch changed data since last sync
- **Realtime Updates** — live sync via Supabase Realtime subscriptions (2s debounce)
- **Auto-Sync** — configurable interval (5–120 min)
- **Bilingual UI** — German and English, auto-detected from Obsidian locale
- **Dataview-compatible frontmatter** on all generated files
- **Nutrition goal comparison** in daily notes
- **Settings migration** from legacy folder defaults to new flat/lowercase structure
- **JWT auto-refresh** before token expiry
- **Status bar** showing sync state
- **Individual content toggles** for each of the 11 data types
- **Configurable folder structure** with optional base path
- **CORS bypass** via Obsidian's native requestUrl

### Security
- Encrypted tables (profile, medications, medication logs, blood pressure) read exclusively via `_decrypted` views
- No data sent to third parties — all traffic stays between Supabase instance and vault
