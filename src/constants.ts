import type { FitAssistentSettings, SyncState } from './types'

export const PLUGIN_VERSION = '1.0.0'

export const DEFAULT_SETTINGS: FitAssistentSettings = {
  supabaseUrl: '',
  supabaseAnonKey: '',
  email: '',
  password: '',

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

  basePath: 'FitAssistent',
  recipesFolder: 'Rezepte',
  trackerFolder: 'Tracker',
  mealprepFolder: 'Mealprep',
  healthFolder: 'Gesundheit',
  listsFolder: 'Listen',
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
