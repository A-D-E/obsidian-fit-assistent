// ============================================
// FitAssistent Obsidian Plugin - Type Definitions
// ============================================

// --- Database Types (snake_case, matching Supabase schema) ---

export interface Recipe {
  id: string
  user_id: string
  title: string
  description: string
  type?: 'generated' | 'user_dish'
  total_weight?: string
  preparation_time?: number
  ingredients: string[] | StructuredIngredient[]
  instructions: string[]
  calories: number
  protein: number
  carbs: number
  fat: number
  fiber?: number
  sugar?: number
  salt?: number
  zinc?: number
  micros_highlights?: MicrosHighlight[]
  meta?: {
    activity_context?: string
    carb_stretch_technique?: string
  }
  tags: string[]
  created_at: number
  image_url?: string
  is_favorite?: boolean
  is_cooked?: boolean
  cooked_at?: number
  visibility: 'public' | 'private'
}

export interface StructuredIngredient {
  item: string
  amount: string
  type?: string
}

export interface MicrosHighlight {
  name: string
  amount: string
  benefit: string
}

export interface Meal {
  id: string
  user_id: string
  description: string
  calories: number
  protein: number
  carbs: number
  fat: number
  date: string
  timestamp: number
}

export interface WaterLog {
  id: string
  user_id: string
  amount: number
  date: string
  timestamp: number
}

export interface WeightLog {
  id: string
  user_id: string
  weight: number
  date: string
  timestamp: number
}

export interface MealPrepPlan {
  id: string
  user_id: string
  name?: string
  start_date: string
  end_date: string
  duration: '3' | '5' | '7'
  days: MealPrepDay[]
  shopping_list: MealPrepShoppingItem[]
  status: 'planning' | 'active' | 'completed' | 'cancelled'
  feedback?: MealPrepFeedback
  created_at: number
}

export interface MealPrepDay {
  date: string
  day_index: number
  meals: {
    breakfast?: MealSlot | null
    lunch?: MealSlot | null
    dinner?: MealSlot | null
    snacks: MealSlot[]
  }
  prep_instructions?: string
  is_rest_day?: boolean
}

export interface MealSlot {
  recipe_id: string
  portions: number
  is_leftover: boolean
  from_day_index?: number
  is_cooked: boolean
  cooked_at?: number
}

export interface MealPrepShoppingItem {
  id: string
  ingredient: string
  quantity: number
  unit: string
  category: ShoppingCategory
  checked: boolean
  from_recipes: string[]
}

export interface MealPrepFeedback {
  overall_rating: number
  portion_feedback: 'too_little' | 'perfect' | 'too_much'
  favorite_recipe_id?: string
  worst_recipe_id?: string
  time_issues: boolean
  storage_issues?: string
  freeform_notes?: string
  wasted_food?: string[]
  submitted_at: number
}

export interface UserProfile {
  uid: string
  role?: string
  first_name?: string
  last_name?: string
  display_name?: string
  email?: string
  photo_url?: string
  phone_number?: string
  address?: string
  city?: string
  zip_code?: string
  country?: string
  bio?: string
  current_weight?: number
  height?: number
  age?: number
  gender?: 'male' | 'female' | 'other'
  target_weight?: number
  goal?: 'lose' | 'maintain' | 'gain'
  weight_loss_per_month?: number
  target_date?: string
  activity_level?: 'sedentary' | 'light' | 'moderate' | 'active'
  occupation?: string
  dietary_preference?: 'vegan' | 'vegetarian' | 'omnivore'
  coffee_intake?: number
  milk_type?: string
  strategy?: {
    daily_calories: number
    protein_target: number
    fat_target: number
    carb_target: number
    last_updated: number
  }
  water_settings?: {
    daily_goal: number
    increment?: number
    reminder_enabled: boolean
    reminder_interval: number
    start_time: string
    end_time: string
  }
  medication_settings?: {
    show_in_fab: boolean
  }
  blood_pressure_settings?: {
    show_in_fab: boolean
  }
}

export interface InventoryItem {
  id: string
  user_id: string
  barcode?: string | null
  name: string
  quantity: number
  unit: string
  category: 'fridge' | 'freezer' | 'pantry'
  expiry_date?: string | null
  importance?: number | null
  min_quantity?: number | null
  updated_at: number
  macros?: {
    calories?: number
    protein?: number
    carbs?: number
    fat?: number
  } | null
  group_id?: string | null
}

export interface Medication {
  id: string
  user_id: string
  name: string
  type: 'medication' | 'vitamin' | 'supplement'
  dosage?: string | null
  dosage_unit?: string | null
  schedule_times: string[]
  reminder_enabled: boolean
  icon?: string | null
  color?: string | null
  notes?: string | null
  is_active: boolean
  created_at: number
  updated_at: number
}

export interface MedicationLog {
  id: string
  user_id: string
  medication_id: string
  scheduled_date: string
  scheduled_time: string
  status: 'pending' | 'taken' | 'missed' | 'skipped'
  actual_time?: string | null
  notes?: string | null
  created_at: number
}

export interface BloodPressureLog {
  id: string
  user_id: string
  measured_at: string
  period?: 'morning' | 'evening' | 'other'
  systolic: number
  diastolic: number
  pulse?: number | null
  notes?: string | null
  created_at: number
}

export type ShoppingCategory =
  | 'produce'
  | 'grains'
  | 'protein'
  | 'dairy'
  | 'spices'
  | 'frozen'
  | 'bakery'
  | 'household'
  | 'meat'
  | 'cheese'
  | 'other'

export interface ShoppingItem {
  id: string
  user_id: string
  ingredient: string
  quantity: number
  unit: string
  category: ShoppingCategory
  checked: boolean
  from_recipes: string[]
  group_id?: string | null
}

// --- Plugin Settings ---

export interface FitAssistentSettings {
  connectionToken: string

  // Sync config
  autoSync: boolean
  syncIntervalMinutes: number
  realtimeEnabled: boolean

  // Content toggles
  syncRecipes: boolean
  syncMeals: boolean
  syncWater: boolean
  syncWeight: boolean
  syncMealprep: boolean
  syncProfile: boolean
  syncInventory: boolean
  syncMedications: boolean
  syncBloodPressure: boolean
  syncShoppingList: boolean
  syncMedicationLogs: boolean

  // Folder config
  basePath: string
  recipesFolder: string
  trackerFolder: string
  mealprepFolder: string
  healthFolder: string
  listsFolder: string
  profileFileName: string

  // Display
  showStatusBar: boolean
  showNutritionGoals: boolean
}

// --- Sync State ---

export interface SyncState {
  lastFullSync: number | null
  lastSyncPerTable: Record<string, number>
  fileMappings: Record<string, string> // id -> vault path
  syncErrors: SyncError[]
}

export interface SyncError {
  table: string
  itemId: string
  message: string
  timestamp: number
}

export interface SyncResult {
  success: boolean
  filesCreated: number
  filesUpdated: number
  errors: SyncError[]
  duration: number
}

// --- Data aggregation for Daily Notes ---

export interface DailyData {
  date: string
  meals: Meal[]
  waterLogs: WaterLog[]
  weightLogs: WeightLog[]
  medicationLogs: MedicationLog[]
  bloodPressureLogs: BloodPressureLog[]
}
