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

  // --- Template: Common ---
  'tpl.field': { de: 'Feld', en: 'Field' },
  'tpl.value': { de: 'Wert', en: 'Value' },
  'tpl.nutrient': { de: 'Nährstoff', en: 'Nutrient' },
  'tpl.amount': { de: 'Menge', en: 'Amount' },
  'tpl.calories': { de: 'Kalorien', en: 'Calories' },
  'tpl.protein': { de: 'Protein', en: 'Protein' },
  'tpl.carbs': { de: 'Kohlenhydrate', en: 'Carbohydrates' },
  'tpl.fat': { de: 'Fett', en: 'Fat' },
  'tpl.fiber': { de: 'Ballaststoffe', en: 'Fiber' },
  'tpl.sugar': { de: 'Zucker', en: 'Sugar' },
  'tpl.salt': { de: 'Salz', en: 'Salt' },
  'tpl.zinc': { de: 'Zink', en: 'Zinc' },
  'tpl.status': { de: 'Status', en: 'Status' },
  'tpl.time': { de: 'Uhrzeit', en: 'Time' },
  'tpl.notes': { de: 'Notizen', en: 'Notes' },
  'tpl.progress': { de: 'Fortschritt', en: 'Progress' },
  'tpl.days_suffix': { de: 'Tage', en: 'days' },
  'tpl.min_suffix': { de: 'Min', en: 'min' },
  'tpl.years_suffix': { de: 'Jahre', en: 'years' },

  // --- Template: Weekdays ---
  'tpl.weekday.0': { de: 'Sonntag', en: 'Sunday' },
  'tpl.weekday.1': { de: 'Montag', en: 'Monday' },
  'tpl.weekday.2': { de: 'Dienstag', en: 'Tuesday' },
  'tpl.weekday.3': { de: 'Mittwoch', en: 'Wednesday' },
  'tpl.weekday.4': { de: 'Donnerstag', en: 'Thursday' },
  'tpl.weekday.5': { de: 'Freitag', en: 'Friday' },
  'tpl.weekday.6': { de: 'Samstag', en: 'Saturday' },

  // --- Template: Blood Pressure ---
  'tpl.bp.optimal': { de: 'Optimal', en: 'Optimal' },
  'tpl.bp.normal': { de: 'Normal', en: 'Normal' },
  'tpl.bp.high_normal': { de: 'Hoch-Normal', en: 'High-Normal' },
  'tpl.bp.grade_1': { de: 'Grad 1', en: 'Grade 1' },
  'tpl.bp.grade_2': { de: 'Grad 2', en: 'Grade 2' },
  'tpl.bp.grade_3': { de: 'Grad 3', en: 'Grade 3' },

  // --- Template: Inventory Categories ---
  'tpl.cat.fridge': { de: 'Kühlschrank', en: 'Fridge' },
  'tpl.cat.freezer': { de: 'Tiefkühler', en: 'Freezer' },
  'tpl.cat.pantry': { de: 'Vorratskammer', en: 'Pantry' },
  'tpl.cat.other': { de: 'Sonstiges', en: 'Other' },

  // --- Template: Shopping Categories ---
  'tpl.shop.produce': { de: '🥬 Obst & Gemüse', en: '🥬 Fruits & Vegetables' },
  'tpl.shop.grains': { de: '🌾 Getreide & Hülsenfrüchte', en: '🌾 Grains & Legumes' },
  'tpl.shop.protein': { de: '🥜 Proteinquellen', en: '🥜 Protein Sources' },
  'tpl.shop.dairy': { de: '🥛 Milchalternativen', en: '🥛 Dairy Alternatives' },
  'tpl.shop.bakery': { de: '🍞 Backwaren', en: '🍞 Bakery' },
  'tpl.shop.cheese': { de: '🧀 Käse', en: '🧀 Cheese' },
  'tpl.shop.meat': { de: '🥩 Fleisch & Alternativen', en: '🥩 Meat & Alternatives' },
  'tpl.shop.spices': { de: '🧂 Gewürze & Öle', en: '🧂 Spices & Oils' },
  'tpl.shop.frozen': { de: '❄️ Tiefkühl', en: '❄️ Frozen' },
  'tpl.shop.household': { de: '🧹 Haushalt', en: '🧹 Household' },
  'tpl.shop.other': { de: '📦 Sonstiges', en: '📦 Other' },

  // --- Template: Recipe ---
  'tpl.recipe.unknown': { de: 'Unbekanntes Rezept', en: 'Unknown Recipe' },
  'tpl.recipe.favorite': { de: 'Favorit', en: 'Favorite' },
  'tpl.recipe.nutrition': { de: 'Nährwerte', en: 'Nutrition' },
  'tpl.recipe.micro_highlights': { de: 'Mikronährstoff-Highlights', en: 'Micronutrient Highlights' },
  'tpl.recipe.ingredients': { de: 'Zutaten', en: 'Ingredients' },
  'tpl.recipe.instructions': { de: 'Zubereitung', en: 'Instructions' },
  'tpl.recipe.activity_context': { de: 'Aktivitäts-Kontext', en: 'Activity Context' },
  'tpl.recipe.carb_stretch': { de: 'Carb-Stretch Technik', en: 'Carb-Stretch Technique' },

  // --- Template: Daily Note ---
  'tpl.daily.weight': { de: '⚖️ Gewicht', en: '⚖️ Weight' },
  'tpl.daily.meals': { de: '🍽️ Mahlzeiten', en: '🍽️ Meals' },
  'tpl.daily.total': { de: 'Gesamt', en: 'Total' },
  'tpl.daily.meal': { de: 'Mahlzeit', en: 'Meal' },
  'tpl.daily.protein_g': { de: 'Protein (g)', en: 'Protein (g)' },
  'tpl.daily.carbs_g': { de: 'KH (g)', en: 'Carbs (g)' },
  'tpl.daily.fat_g': { de: 'Fett (g)', en: 'Fat (g)' },
  'tpl.daily.goal_comparison': { de: 'Ziel-Vergleich', en: 'Goal Comparison' },
  'tpl.daily.actual': { de: 'Ist', en: 'Actual' },
  'tpl.daily.goal': { de: 'Ziel', en: 'Goal' },
  'tpl.daily.diff': { de: 'Differenz', en: 'Difference' },
  'tpl.daily.water': { de: '💧 Wasser', en: '💧 Water' },
  'tpl.daily.medications': { de: '💊 Medikamente', en: '💊 Medications' },
  'tpl.daily.medication': { de: 'Medikament', en: 'Medication' },
  'tpl.daily.blood_pressure': { de: '❤️ Blutdruck', en: '❤️ Blood Pressure' },
  'tpl.daily.bp_value': { de: 'Blutdruck', en: 'Blood Pressure' },
  'tpl.daily.rating': { de: 'Bewertung', en: 'Rating' },
  'tpl.daily.pulse': { de: 'Puls', en: 'Pulse' },
  'tpl.daily.no_data': { de: 'Keine Daten für diesen Tag.', en: 'No data for this day.' },

  // --- Template: Profile ---
  'tpl.profile.title': { de: 'Profil', en: 'Profile' },
  'tpl.profile.personal': { de: 'Persönliche Daten', en: 'Personal Data' },
  'tpl.profile.name': { de: 'Name', en: 'Name' },
  'tpl.profile.display_name': { de: 'Anzeigename', en: 'Display Name' },
  'tpl.profile.email': { de: 'E-Mail', en: 'Email' },
  'tpl.profile.age': { de: 'Alter', en: 'Age' },
  'tpl.profile.gender': { de: 'Geschlecht', en: 'Gender' },
  'tpl.profile.male': { de: 'Männlich', en: 'Male' },
  'tpl.profile.female': { de: 'Weiblich', en: 'Female' },
  'tpl.profile.diverse': { de: 'Divers', en: 'Diverse' },
  'tpl.profile.height': { de: 'Größe', en: 'Height' },
  'tpl.profile.occupation': { de: 'Beruf', en: 'Occupation' },
  'tpl.profile.diet': { de: 'Ernährung', en: 'Diet' },
  'tpl.profile.vegan': { de: 'Vegan', en: 'Vegan' },
  'tpl.profile.vegetarian': { de: 'Vegetarisch', en: 'Vegetarian' },
  'tpl.profile.omnivore': { de: 'Omnivore', en: 'Omnivore' },
  'tpl.profile.activity': { de: 'Aktivitätslevel', en: 'Activity Level' },
  'tpl.profile.sedentary': { de: 'Sitzend', en: 'Sedentary' },
  'tpl.profile.light': { de: 'Leicht aktiv', en: 'Lightly Active' },
  'tpl.profile.moderate': { de: 'Moderat aktiv', en: 'Moderately Active' },
  'tpl.profile.active': { de: 'Sehr aktiv', en: 'Very Active' },
  'tpl.profile.weight_goals': { de: 'Gewicht & Ziele', en: 'Weight & Goals' },
  'tpl.profile.current_weight': { de: 'Aktuelles Gewicht', en: 'Current Weight' },
  'tpl.profile.target_weight': { de: 'Zielgewicht', en: 'Target Weight' },
  'tpl.profile.goal': { de: 'Ziel', en: 'Goal' },
  'tpl.profile.lose': { de: 'Abnehmen', en: 'Lose Weight' },
  'tpl.profile.maintain': { de: 'Halten', en: 'Maintain' },
  'tpl.profile.gain': { de: 'Zunehmen', en: 'Gain Weight' },
  'tpl.profile.per_month': { de: 'Pro Monat', en: 'Per Month' },
  'tpl.profile.target_date': { de: 'Zieldatum', en: 'Target Date' },
  'tpl.profile.strategy': { de: 'Ernährungsstrategie', en: 'Nutrition Strategy' },
  'tpl.profile.cal_day': { de: 'Kalorien/Tag', en: 'Calories/Day' },
  'tpl.profile.water_settings': { de: 'Wasser-Einstellungen', en: 'Water Settings' },
  'tpl.profile.daily_goal': { de: 'Tagesziel', en: 'Daily Goal' },
  'tpl.profile.reminders': { de: 'Erinnerungen', en: 'Reminders' },
  'tpl.profile.reminder_active': { de: 'Aktiv', en: 'Active' },
  'tpl.profile.reminder_inactive': { de: 'Inaktiv', en: 'Inactive' },
  'tpl.profile.interval': { de: 'Intervall', en: 'Interval' },
  'tpl.profile.timeframe': { de: 'Zeitraum', en: 'Time Range' },

  // --- Template: Inventory ---
  'tpl.inventory.title': { de: 'Inventar', en: 'Inventory' },
  'tpl.inventory.empty': { de: 'Keine Artikel im Inventar.', en: 'No items in inventory.' },
  'tpl.inventory.item': { de: 'Artikel', en: 'Item' },
  'tpl.inventory.best_before': { de: 'Haltbar bis', en: 'Best Before' },
  'tpl.inventory.expired': { de: '🔴 Abgelaufen', en: '🔴 Expired' },
  'tpl.inventory.restock': { de: '📉 Nachkaufen', en: '📉 Restock' },

  // --- Template: Medications ---
  'tpl.meds.title': { de: 'Medikamente & Supplements', en: 'Medications & Supplements' },
  'tpl.meds.empty': { de: 'Keine Medikamente eingetragen.', en: 'No medications recorded.' },
  'tpl.meds.type_medication': { de: 'Medikamente', en: 'Medications' },
  'tpl.meds.type_vitamin': { de: 'Vitamine', en: 'Vitamins' },
  'tpl.meds.type_supplement': { de: 'Supplemente', en: 'Supplements' },
  'tpl.meds.name': { de: 'Name', en: 'Name' },
  'tpl.meds.dosage': { de: 'Dosierung', en: 'Dosage' },
  'tpl.meds.times': { de: 'Zeiten', en: 'Times' },
  'tpl.meds.reminder': { de: 'Erinnerung', en: 'Reminder' },
  'tpl.meds.active': { de: '✅ Aktiv', en: '✅ Active' },
  'tpl.meds.paused': { de: '⏸️ Pausiert', en: '⏸️ Paused' },

  // --- Template: Shopping List ---
  'tpl.shopping.title': { de: 'Einkaufsliste', en: 'Shopping List' },
  'tpl.shopping.empty': { de: 'Keine Artikel auf der Einkaufsliste.', en: 'No items on the shopping list.' },

  // --- Template: Mealprep ---
  'tpl.mealprep.fallback_title': { de: 'Mealprep', en: 'Meal Prep' },
  'tpl.mealprep.status_planning': { de: '📝 Planung', en: '📝 Planning' },
  'tpl.mealprep.status_active': { de: '🟢 Aktiv', en: '🟢 Active' },
  'tpl.mealprep.status_completed': { de: '✅ Abgeschlossen', en: '✅ Completed' },
  'tpl.mealprep.status_cancelled': { de: '❌ Abgebrochen', en: '❌ Cancelled' },
  'tpl.mealprep.daily_plan': { de: 'Tagesplan', en: 'Daily Plan' },
  'tpl.mealprep.rest_day': { de: 'Ruhetag – keine Mahlzeiten geplant', en: 'Rest day – no meals planned' },
  'tpl.mealprep.breakfast': { de: 'Frühstück', en: 'Breakfast' },
  'tpl.mealprep.lunch': { de: 'Mittagessen', en: 'Lunch' },
  'tpl.mealprep.dinner': { de: 'Abendessen', en: 'Dinner' },
  'tpl.mealprep.snack': { de: 'Snack', en: 'Snack' },
  'tpl.mealprep.recipe': { de: 'Rezept', en: 'Recipe' },
  'tpl.mealprep.portions': { de: 'Portionen', en: 'Portions' },
  'tpl.mealprep.info': { de: 'Info', en: 'Info' },
  'tpl.mealprep.preparation': { de: 'Vorbereitung', en: 'Preparation' },
  'tpl.mealprep.shopping_list': { de: 'Einkaufsliste', en: 'Shopping List' },
  'tpl.mealprep.feedback': { de: 'Feedback', en: 'Feedback' },
  'tpl.mealprep.rating': { de: 'Bewertung', en: 'Rating' },
  'tpl.mealprep.portions_feedback': { de: 'Portionen', en: 'Portions' },
  'tpl.mealprep.too_little': { de: 'Zu wenig', en: 'Too little' },
  'tpl.mealprep.perfect': { de: 'Perfekt', en: 'Perfect' },
  'tpl.mealprep.too_much': { de: 'Zu viel', en: 'Too much' },
  'tpl.mealprep.time_issues': { de: 'Zeitprobleme', en: 'Time Issues' },
  'tpl.mealprep.yes': { de: 'Ja', en: 'Yes' },
  'tpl.mealprep.storage': { de: 'Lagerung', en: 'Storage' },
  'tpl.mealprep.leftover': { de: '♻️ Reste', en: '♻️ Leftover' },
  'tpl.mealprep.cooked': { de: '✅ Gekocht', en: '✅ Cooked' },

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
