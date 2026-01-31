/**
 * Lightweight i18n for the FitAssistent Obsidian plugin.
 * Detects Obsidian's locale and provides t() for all user-facing strings.
 */

export type Locale = 'de' | 'en'

let currentLocale: Locale = 'de'

/**
 * Detects locale from Obsidian's language setting.
 * Call once during plugin load.
 */
export function initLocale(obsidianLocale?: string): void {
  if (obsidianLocale?.startsWith('de')) {
    currentLocale = 'de'
  } else {
    currentLocale = 'en'
  }
}

export function getLocale(): Locale {
  return currentLocale
}

const translations: Record<string, Record<Locale, string>> = {
  // --- Connection ---
  'connection.title': {
    de: 'Verbindung',
    en: 'Connection',
  },
  'connection.supabase_url': {
    de: 'Supabase URL',
    en: 'Supabase URL',
  },
  'connection.supabase_url_desc': {
    de: 'Die URL deiner Self-Hosted Supabase-Instanz',
    en: 'The URL of your self-hosted Supabase instance',
  },
  'connection.supabase_url_placeholder': {
    de: 'https://supabase.example.com',
    en: 'https://supabase.example.com',
  },
  'connection.anon_key': {
    de: 'Supabase Anon Key',
    en: 'Supabase Anon Key',
  },
  'connection.anon_key_desc': {
    de: 'Der öffentliche Anon-Key deiner Supabase-Instanz',
    en: 'The public anon key of your Supabase instance',
  },
  'connection.email': {
    de: 'E-Mail',
    en: 'Email',
  },
  'connection.email_desc': {
    de: 'Deine FitAssistent Login-E-Mail',
    en: 'Your FitAssistent login email',
  },
  'connection.password': {
    de: 'Passwort',
    en: 'Password',
  },
  'connection.password_desc': {
    de: 'Dein FitAssistent-Passwort',
    en: 'Your FitAssistent password',
  },
  'connection.login_logout': {
    de: 'Anmelden / Abmelden',
    en: 'Sign In / Sign Out',
  },
  'connection.login_logout_desc': {
    de: 'Verbindung zur FitAssistent-App herstellen',
    en: 'Connect to the FitAssistent app',
  },
  'connection.sign_in': {
    de: 'Anmelden',
    en: 'Sign In',
  },
  'connection.sign_out': {
    de: 'Abmelden',
    en: 'Sign Out',
  },
  'connection.connected': {
    de: 'Verbunden',
    en: 'Connected',
  },
  'connection.disconnected': {
    de: 'Nicht verbunden',
    en: 'Not connected',
  },
  'connection.error': {
    de: 'Verbindungsfehler',
    en: 'Connection error',
  },

  // --- Sync ---
  'sync.title': {
    de: 'Synchronisation',
    en: 'Sync',
  },
  'sync.auto': {
    de: 'Auto-Sync',
    en: 'Auto-Sync',
  },
  'sync.auto_desc': {
    de: 'Automatisch synchronisieren nach Zeitintervall',
    en: 'Automatically sync at regular intervals',
  },
  'sync.interval': {
    de: 'Sync-Intervall',
    en: 'Sync Interval',
  },
  'sync.interval_desc': {
    de: 'Intervall für automatische Synchronisation (Minuten)',
    en: 'Interval for automatic sync (minutes)',
  },
  'sync.realtime': {
    de: 'Realtime Updates',
    en: 'Realtime Updates',
  },
  'sync.realtime_desc': {
    de: 'Echtzeit-Updates über Supabase Realtime (sofortige Synchronisation bei Änderungen)',
    en: 'Real-time updates via Supabase Realtime (instant sync on changes)',
  },
  'sync.now': {
    de: 'Jetzt synchronisieren',
    en: 'Sync Now',
  },
  'sync.now_desc': {
    de: 'Vollständige Synchronisation aller Daten starten',
    en: 'Start a full sync of all data',
  },
  'sync.full': {
    de: 'Full Sync',
    en: 'Full Sync',
  },
  'sync.started': {
    de: 'Sync gestartet...',
    en: 'Sync started...',
  },
  'sync.syncing': {
    de: 'Synchronisiere...',
    en: 'Syncing...',
  },
  'sync.ok': {
    de: 'Sync OK',
    en: 'Sync OK',
  },
  'sync.error': {
    de: 'Sync Fehler',
    en: 'Sync Error',
  },

  // --- Content Toggles ---
  'content.title': {
    de: 'Inhalte',
    en: 'Content',
  },
  'content.recipes': {
    de: 'Rezepte',
    en: 'Recipes',
  },
  'content.recipes_desc': {
    de: 'Individuelle Rezept-Dateien synchronisieren',
    en: 'Sync individual recipe files',
  },
  'content.meals': {
    de: 'Mahlzeiten',
    en: 'Meals',
  },
  'content.meals_desc': {
    de: 'Mahlzeiten in Tagesnotizen',
    en: 'Meals in daily notes',
  },
  'content.water': {
    de: 'Wasser',
    en: 'Water',
  },
  'content.water_desc': {
    de: 'Wasser-Einträge in Tagesnotizen',
    en: 'Water entries in daily notes',
  },
  'content.weight': {
    de: 'Gewicht',
    en: 'Weight',
  },
  'content.weight_desc': {
    de: 'Gewichts-Einträge in Tagesnotizen',
    en: 'Weight entries in daily notes',
  },
  'content.mealprep': {
    de: 'Mealprep',
    en: 'Meal Prep',
  },
  'content.mealprep_desc': {
    de: 'Mealprep-Pläne synchronisieren',
    en: 'Sync meal prep plans',
  },
  'content.profile': {
    de: 'Profil',
    en: 'Profile',
  },
  'content.profile_desc': {
    de: 'Profildaten synchronisieren',
    en: 'Sync profile data',
  },
  'content.inventory': {
    de: 'Inventar',
    en: 'Inventory',
  },
  'content.inventory_desc': {
    de: 'Kücheninventar synchronisieren',
    en: 'Sync kitchen inventory',
  },
  'content.medications': {
    de: 'Medikamente',
    en: 'Medications',
  },
  'content.medications_desc': {
    de: 'Medikamentenliste synchronisieren',
    en: 'Sync medications list',
  },
  'content.medication_logs': {
    de: 'Medikamenten-Logs',
    en: 'Medication Logs',
  },
  'content.medication_logs_desc': {
    de: 'Medikamenten-Einnahmen in Tagesnotizen',
    en: 'Medication intake in daily notes',
  },
  'content.blood_pressure': {
    de: 'Blutdruck',
    en: 'Blood Pressure',
  },
  'content.blood_pressure_desc': {
    de: 'Blutdruck-Messungen in Tagesnotizen',
    en: 'Blood pressure readings in daily notes',
  },
  'content.shopping_list': {
    de: 'Einkaufsliste',
    en: 'Shopping List',
  },
  'content.shopping_list_desc': {
    de: 'Einkaufsliste synchronisieren',
    en: 'Sync shopping list',
  },

  // --- Folders ---
  'folders.title': {
    de: 'Ordner',
    en: 'Folders',
  },
  'folders.base': {
    de: 'Basis-Ordner',
    en: 'Base Folder',
  },
  'folders.base_desc': {
    de: 'Hauptordner für alle FitAssistent-Daten',
    en: 'Root folder for all FitAssistent data',
  },
  'folders.recipes': {
    de: 'Rezepte',
    en: 'Recipes',
  },
  'folders.recipes_desc': {
    de: 'Unterordner für Rezepte',
    en: 'Subfolder for recipes',
  },
  'folders.tracker': {
    de: 'Tracker',
    en: 'Tracker',
  },
  'folders.tracker_desc': {
    de: 'Unterordner für Tagesnotizen',
    en: 'Subfolder for daily notes',
  },
  'folders.mealprep': {
    de: 'Mealprep',
    en: 'Meal Prep',
  },
  'folders.mealprep_desc': {
    de: 'Unterordner für Mealprep-Pläne',
    en: 'Subfolder for meal prep plans',
  },
  'folders.health': {
    de: 'Gesundheit',
    en: 'Health',
  },
  'folders.health_desc': {
    de: 'Unterordner für Medikamente',
    en: 'Subfolder for medications',
  },
  'folders.lists': {
    de: 'Listen',
    en: 'Lists',
  },
  'folders.lists_desc': {
    de: 'Unterordner für Inventar & Einkaufsliste',
    en: 'Subfolder for inventory & shopping list',
  },

  // --- Display ---
  'display.title': {
    de: 'Anzeige',
    en: 'Display',
  },
  'display.status_bar': {
    de: 'Status Bar',
    en: 'Status Bar',
  },
  'display.status_bar_desc': {
    de: 'Sync-Status in der Statusleiste anzeigen',
    en: 'Show sync status in the status bar',
  },
  'display.nutrition_goals': {
    de: 'Nährwert-Ziele',
    en: 'Nutrition Goals',
  },
  'display.nutrition_goals_desc': {
    de: 'Ziel-Vergleich in Tagesnotizen anzeigen',
    en: 'Show goal comparison in daily notes',
  },

  // --- Advanced ---
  'advanced.title': {
    de: 'Erweitert',
    en: 'Advanced',
  },
  'advanced.reset': {
    de: 'Sync-State zurücksetzen',
    en: 'Reset Sync State',
  },
  'advanced.reset_desc': {
    de: 'Setzt den Sync-State zurück. Der nächste Sync wird alle Daten neu laden.',
    en: 'Resets the sync state. The next sync will reload all data.',
  },
  'advanced.reset_button': {
    de: 'Zurücksetzen',
    en: 'Reset',
  },
  'advanced.reset_done': {
    de: 'Sync-State zurückgesetzt',
    en: 'Sync state reset',
  },
  'advanced.last_sync': {
    de: 'Letzter Full Sync',
    en: 'Last Full Sync',
  },
  'advanced.last_errors': {
    de: 'Letzte Fehler',
    en: 'Last Errors',
  },

  // --- Commands ---
  'cmd.full_sync': {
    de: 'Vollständige Synchronisation',
    en: 'Full Sync',
  },
  'cmd.incremental_sync': {
    de: 'Inkrementelle Synchronisation',
    en: 'Incremental Sync',
  },

  // --- Notices ---
  'notice.signed_out': {
    de: 'Abgemeldet',
    en: 'Signed out',
  },
  'notice.connected': {
    de: 'Verbunden!',
    en: 'Connected!',
  },
  'notice.error': {
    de: 'Fehler',
    en: 'Error',
  },
  'notice.please_sign_in': {
    de: 'Bitte zuerst anmelden',
    en: 'Please sign in first',
  },
  'notice.sync_done': {
    de: '{created} erstellt, {updated} aktualisiert',
    en: '{created} created, {updated} updated',
  },
  'notice.sync_errors': {
    de: 'Sync mit {count} Fehlern abgeschlossen',
    en: 'Sync completed with {count} errors',
  },
  'notice.sync_ok': {
    de: 'Sync OK ({count} Dateien)',
    en: 'Sync OK ({count} files)',
  },
  'notice.not_connected': {
    de: 'Nicht verbunden',
    en: 'Not connected',
  },

  // --- Auth Errors ---
  'auth.no_user': {
    de: 'Kein Benutzer gefunden',
    en: 'No user found',
  },
  'auth.url_key_required': {
    de: 'Supabase URL und Key erforderlich',
    en: 'Supabase URL and key required',
  },
  'auth.email_password_required': {
    de: 'E-Mail und Passwort erforderlich',
    en: 'Email and password required',
  },

  // --- Data Service Errors ---
  'data.recipes_failed': {
    de: 'Rezepte laden fehlgeschlagen',
    en: 'Failed to load recipes',
  },
  'data.meals_failed': {
    de: 'Mahlzeiten laden fehlgeschlagen',
    en: 'Failed to load meals',
  },
  'data.water_failed': {
    de: 'Wasser-Logs laden fehlgeschlagen',
    en: 'Failed to load water logs',
  },
  'data.weight_failed': {
    de: 'Gewichts-Logs laden fehlgeschlagen',
    en: 'Failed to load weight logs',
  },
  'data.mealprep_failed': {
    de: 'Mealprep-Pläne laden fehlgeschlagen',
    en: 'Failed to load meal prep plans',
  },
  'data.inventory_failed': {
    de: 'Inventar laden fehlgeschlagen',
    en: 'Failed to load inventory',
  },
  'data.medications_failed': {
    de: 'Medikamente laden fehlgeschlagen',
    en: 'Failed to load medications',
  },
  'data.medication_logs_failed': {
    de: 'Medikamenten-Logs laden fehlgeschlagen',
    en: 'Failed to load medication logs',
  },
  'data.blood_pressure_failed': {
    de: 'Blutdruck-Logs laden fehlgeschlagen',
    en: 'Failed to load blood pressure logs',
  },
  'data.shopping_failed': {
    de: 'Einkaufsliste laden fehlgeschlagen',
    en: 'Failed to load shopping list',
  },

  // --- Sync Progress ---
  'progress.profile': {
    de: 'Profil laden...',
    en: 'Loading profile...',
  },
  'progress.medications': {
    de: 'Medikamente laden...',
    en: 'Loading medications...',
  },
  'progress.recipes': {
    de: 'Rezepte synchronisieren...',
    en: 'Syncing recipes...',
  },
  'progress.mealprep': {
    de: 'Mealprep-Pläne synchronisieren...',
    en: 'Syncing meal prep plans...',
  },
  'progress.inventory': {
    de: 'Inventar synchronisieren...',
    en: 'Syncing inventory...',
  },
  'progress.shopping': {
    de: 'Einkaufsliste synchronisieren...',
    en: 'Syncing shopping list...',
  },
  'progress.daily_notes': {
    de: 'Tagesnotizen synchronisieren...',
    en: 'Syncing daily notes...',
  },
  'progress.check_profile': {
    de: 'Profil prüfen...',
    en: 'Checking profile...',
  },
  'progress.check_medications': {
    de: 'Medikamente prüfen...',
    en: 'Checking medications...',
  },
  'progress.check_recipes': {
    de: 'Neue Rezepte prüfen...',
    en: 'Checking new recipes...',
  },
  'progress.check_mealprep': {
    de: 'Mealprep-Pläne prüfen...',
    en: 'Checking meal prep plans...',
  },
  'progress.check_inventory': {
    de: 'Inventar prüfen...',
    en: 'Checking inventory...',
  },
  'progress.check_shopping': {
    de: 'Einkaufsliste prüfen...',
    en: 'Checking shopping list...',
  },
  'progress.check_daily': {
    de: 'Neue Tagesnotizen prüfen...',
    en: 'Checking new daily notes...',
  },
}

/**
 * Returns the translated string for the given key.
 * Supports {placeholder} interpolation.
 */
export function t(
  key: string,
  params?: Record<string, string | number>,
): string {
  const entry = translations[key]
  if (!entry) return key

  let text = entry[currentLocale] ?? entry.de ?? key

  if (params) {
    for (const [k, v] of Object.entries(params)) {
      text = text.replace(`{${k}}`, String(v))
    }
  }

  return text
}
