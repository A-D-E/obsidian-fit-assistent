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

export const DEFAULT_SYNC_STATE: SyncState = {
  lastFullSync: null,
  lastSyncPerTable: {},
  fileMappings: {},
  syncErrors: [],
}
