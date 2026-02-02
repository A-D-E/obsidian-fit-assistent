import type { FitAssistentSettings, SyncState } from './types'

export const PLUGIN_VERSION = '1.0.0'

/**
 * Legacy default settings from v0.x — used for migration detection.
 * Only folder-related fields are listed; if a user's settings match
 * these values exactly, they are migrated to the new defaults.
 */
export const LEGACY_FOLDER_DEFAULTS = {
  basePath: 'FitAssistent',
  recipesFolder: 'Rezepte',
  trackerFolder: 'Tracker',
  mealprepFolder: 'Mealprep',
  healthFolder: 'Gesundheit',
  listsFolder: 'Listen',
} as const

export const DEFAULT_SETTINGS: FitAssistentSettings = {
  connectionToken: '',

  autoSync: true,
  syncIntervalMinutes: 15,
  realtimeEnabled: true,

  syncRecipes: true,
  syncMeals: true,
  syncWater: true,
  syncWeight: true,
  syncMealprep: true,
  syncProfile: true,
  syncInventory: true,
  syncMedications: true,
  syncBloodPressure: true,
  syncShoppingList: true,
  syncMedicationLogs: true,

  basePath: '',
  recipesFolder: 'rezepte',
  trackerFolder: 'tracker',
  mealprepFolder: 'mealprep',
  healthFolder: 'gesundheit',
  listsFolder: 'listen',
  profileFileName: 'Profil.md',

  showStatusBar: true,
  showNutritionGoals: true,
}

/**
 * Cross-link paths for Obsidian [[wikilinks]] in templates.
 * Derived from the default folder settings. If users customise folder names
 * in the plugin settings, these wikilinks may point to non-existent notes
 * (Obsidian will show them as "create new note" links — harmless).
 */
export const CROSS_LINKS = {
  /** Medications list: gesundheit/Medikamente */
  medications: `${DEFAULT_SETTINGS.healthFolder}/Medikamente`,
  /** Tracker overview dashboard */
  trackerOverview: `${DEFAULT_SETTINGS.trackerFolder}/📊 Tracker Übersicht`,
  /** Health home page */
  healthHome: `${DEFAULT_SETTINGS.healthFolder}/💊 Gesundheit`,
  /** Vault home note */
  home: 'HOME',
} as const

/**
 * Builds the wikilink path for a daily note given a date string (YYYY-MM-DD).
 * Matches the folder structure from VaultManager.getDailyNotePath().
 */
export function dailyNoteLinkPath(date: string): string {
  const [year, month] = date.split('-')
  return `${DEFAULT_SETTINGS.trackerFolder}/${year}/${month}/${date}`
}

export const DEFAULT_SYNC_STATE: SyncState = {
  lastFullSync: null,
  lastSyncPerTable: {},
  fileMappings: {},
  syncErrors: [],
}
