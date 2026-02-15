# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Obsidian plugin that syncs data from the [FitAssistent](https://fit-assistent.me) app into an Obsidian vault as Markdown files. Connects to Supabase via a connection token (PAT), fetches 11 data types (recipes, meals, water, weight, mealprep plans, profile, inventory, medications, medication logs, blood pressure, shopping list), and renders them as formatted Markdown with frontmatter.

## Build Commands

```bash
bun install          # Install dependencies
bun run dev          # Development build (watch mode, inline sourcemaps)
bun run build        # Production build (minified, no sourcemaps)
bun run deploy       # Production build + copy to local Obsidian vault
bun run version [patch|minor|major]  # Bump version, commit, tag, push
```

Build uses esbuild (`esbuild.config.mjs`), outputs a single `main.js` (CJS, ES2018 target). Obsidian API and CodeMirror packages are externals. No test framework is configured.

## Architecture

### Entry Point & Plugin Lifecycle

`src/main.ts` — `FitAssistentPlugin` extends Obsidian's `Plugin`. Manages the full lifecycle: settings loading, connection (PAT → JWT), sync orchestration, auto-sync intervals, JWT refresh, realtime subscriptions, iOS app resume handling, and health checks.

### Layer Structure

```
main.ts (Plugin)
  ├── api/           # Supabase communication
  │   ├── supabase-client.ts  — Singleton client with Obsidian CORS bypass (requestUrl)
  │   ├── token.ts             — Decodes fa_<base64url> connection tokens
  │   └── data-service.ts      — All 11 Supabase queries
  ├── sync/          # Sync orchestration
  │   ├── sync-engine.ts       — Full/incremental/single-item sync for all data types
  │   ├── sync-state.ts        — Persists last-sync timestamps + file mappings via plugin data
  │   └── realtime.ts          — Supabase Realtime subscriptions → single-item sync
  ├── templates/     # Markdown rendering (pure functions, no side effects)
  │   ├── template-utils.ts    — Frontmatter, tables, formatting helpers
  │   └── *-template.ts        — One renderer per data type
  ├── vault/         # File system operations
  │   ├── vault-manager.ts     — Path builders + create/update/delete via Obsidian Vault API
  │   └── folder-structure.ts  — Ensures folder hierarchy exists
  ├── settings.ts    — Settings tab UI (PluginSettingTab)
  ├── types.ts       — All TypeScript interfaces (DB types match Supabase snake_case)
  ├── constants.ts   — Default settings, legacy migration values, cross-link paths
  └── i18n.ts        — DE/EN translations with {placeholder} interpolation
```

### Key Data Flow

1. **Auth**: Connection token (`fa_<base64>`) → decoded to `{url, anonKey, secret}` → PAT validation via edge function → JWT → `setSession` on Supabase client
2. **Sync**: `SyncEngine.fullSync()` fetches all data types in order (profile → medications → recipes → mealprep → inventory → shopping → daily notes). Each type: query Supabase → render template → write to vault. Errors per-item, never crash entire sync.
3. **Incremental sync**: Uses `lastSyncPerTable` timestamps; recipes/mealprep use `since` parameter, aggregated types (inventory, shopping) always full-refresh.
4. **Realtime**: Supabase Realtime channel subscriptions trigger single-item sync methods on `SyncEngine`.
5. **Daily notes**: Aggregate meals + water + weight + medication logs + blood pressure for a given date into one Markdown file at `tracker/YYYY/MM/YYYY-MM-DD.md`.

### CORS Bypass

`supabase-client.ts` provides a custom `obsidianFetch` using Obsidian's `requestUrl` (Electron's net module) — all Supabase HTTP goes through this to avoid browser CORS restrictions.

### i18n

Two locales: `de` (default) and `en`. Detected from Obsidian's locale setting at plugin load. All user-facing strings use `t('key')` with optional `{placeholder}` interpolation. Translation keys are flat dot-notation strings in a single `translations` object.

## Conventions

- **TypeScript strict**: `strictNullChecks` and `noImplicitAny` enabled
- **DB types use snake_case** matching Supabase schema; plugin settings use camelCase
- **Templates are pure functions**: `render*(data) → string`, no vault/API side effects
- **Encrypted Supabase tables** are read via `_decrypted` views (profiles, medications, medication_logs, blood_pressure_logs)
- **Folder defaults are lowercase** (`rezepte`, `tracker`, `mealprep`, `gesundheit`, `listen`); legacy uppercase defaults are auto-migrated
- **Version synced across 3 files**: `package.json`, `manifest.json`, `versions.json` — use `bun run version` to bump
