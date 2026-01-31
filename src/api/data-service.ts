import type { SupabaseClient } from '@supabase/supabase-js'
import type {
  BloodPressureLog,
  DailyData,
  InventoryItem,
  Meal,
  MealPrepPlan,
  Medication,
  MedicationLog,
  Recipe,
  ShoppingItem,
  UserProfile,
  WaterLog,
  WeightLog,
} from '../types'

/**
 * Data service for querying all 11 data types from Supabase.
 * CRITICAL: Uses _decrypted views for encrypted tables (GDPR).
 */
export class DataService {
  constructor(private client: SupabaseClient) {}

  // --- Recipes ---

  async getRecipes(since?: number): Promise<Recipe[]> {
    let query = this.client
      .from('recipes')
      .select('*')
      .order('created_at', { ascending: false })

    if (since) {
      query = query.gt('created_at', since)
    }

    const { data, error } = await query
    if (error) throw new Error(`Rezepte laden fehlgeschlagen: ${error.message}`)
    return (data ?? []) as Recipe[]
  }

  async getRecipeById(id: string): Promise<Recipe | null> {
    const { data, error } = await this.client
      .from('recipes')
      .select('*')
      .eq('id', id)
      .single()

    if (error) return null
    return data as Recipe
  }

  // --- Meals ---

  async getMeals(since?: number): Promise<Meal[]> {
    let query = this.client
      .from('meals')
      .select('*')
      .order('timestamp', { ascending: false })

    if (since) {
      query = query.gt('timestamp', since)
    }

    const { data, error } = await query
    if (error)
      throw new Error(`Mahlzeiten laden fehlgeschlagen: ${error.message}`)
    return (data ?? []) as Meal[]
  }

  async getMealsByDate(date: string): Promise<Meal[]> {
    const { data, error } = await this.client
      .from('meals')
      .select('*')
      .eq('date', date)
      .order('timestamp', { ascending: true })

    if (error) return []
    return (data ?? []) as Meal[]
  }

  // --- Water Logs ---

  async getWaterLogs(since?: number): Promise<WaterLog[]> {
    let query = this.client
      .from('water_logs')
      .select('*')
      .order('timestamp', { ascending: false })

    if (since) {
      query = query.gt('timestamp', since)
    }

    const { data, error } = await query
    if (error)
      throw new Error(`Wasser-Logs laden fehlgeschlagen: ${error.message}`)
    return (data ?? []) as WaterLog[]
  }

  async getWaterLogsByDate(date: string): Promise<WaterLog[]> {
    const { data, error } = await this.client
      .from('water_logs')
      .select('*')
      .eq('date', date)
      .order('timestamp', { ascending: true })

    if (error) return []
    return (data ?? []) as WaterLog[]
  }

  // --- Weight Logs ---

  async getWeightLogs(since?: number): Promise<WeightLog[]> {
    let query = this.client
      .from('weight_logs')
      .select('*')
      .order('timestamp', { ascending: false })

    if (since) {
      query = query.gt('timestamp', since)
    }

    const { data, error } = await query
    if (error)
      throw new Error(`Gewichts-Logs laden fehlgeschlagen: ${error.message}`)
    return (data ?? []) as WeightLog[]
  }

  async getWeightLogsByDate(date: string): Promise<WeightLog[]> {
    const { data, error } = await this.client
      .from('weight_logs')
      .select('*')
      .eq('date', date)
      .order('timestamp', { ascending: true })

    if (error) return []
    return (data ?? []) as WeightLog[]
  }

  // --- Mealprep Plans ---

  async getMealprepPlans(since?: number): Promise<MealPrepPlan[]> {
    let query = this.client
      .from('mealprep_plans')
      .select('*')
      .order('created_at', { ascending: false })

    if (since) {
      query = query.gt('updated_at', since)
    }

    const { data, error } = await query
    if (error)
      throw new Error(`Mealprep-Pläne laden fehlgeschlagen: ${error.message}`)
    return (data ?? []) as MealPrepPlan[]
  }

  // --- Profile (ENCRYPTED - use profiles_decrypted!) ---

  async getProfile(): Promise<UserProfile | null> {
    const { data, error } = await this.client
      .from('profiles_decrypted')
      .select('*')
      .single()

    if (error) return null
    return data as UserProfile
  }

  // --- Inventory ---

  async getInventoryItems(): Promise<InventoryItem[]> {
    const { data, error } = await this.client
      .from('inventory_items')
      .select('*')
      .order('name', { ascending: true })

    if (error)
      throw new Error(`Inventar laden fehlgeschlagen: ${error.message}`)
    return (data ?? []) as InventoryItem[]
  }

  // --- Medications (ENCRYPTED - use medications_decrypted!) ---

  async getMedications(): Promise<Medication[]> {
    const { data, error } = await this.client
      .from('medications_decrypted')
      .select('*')
      .order('name', { ascending: true })

    if (error)
      throw new Error(`Medikamente laden fehlgeschlagen: ${error.message}`)

    return ((data ?? []) as Medication[]).map((med) => ({
      ...med,
      schedule_times: this.parseScheduleTimes(med.schedule_times),
    }))
  }

  // --- Medication Logs (ENCRYPTED - use medication_logs_decrypted!) ---

  async getMedicationLogs(since?: number): Promise<MedicationLog[]> {
    let query = this.client
      .from('medication_logs_decrypted')
      .select('*')
      .order('created_at', { ascending: false })

    if (since) {
      query = query.gt('created_at', since)
    }

    const { data, error } = await query
    if (error)
      throw new Error(`Medikamenten-Logs laden fehlgeschlagen: ${error.message}`)
    return (data ?? []) as MedicationLog[]
  }

  async getMedicationLogsByDate(date: string): Promise<MedicationLog[]> {
    const { data, error } = await this.client
      .from('medication_logs_decrypted')
      .select('*')
      .eq('scheduled_date', date)
      .order('scheduled_time', { ascending: true })

    if (error) return []
    return (data ?? []) as MedicationLog[]
  }

  // --- Blood Pressure (ENCRYPTED - use blood_pressure_logs_decrypted!) ---

  async getBloodPressureLogs(since?: number): Promise<BloodPressureLog[]> {
    let query = this.client
      .from('blood_pressure_logs_decrypted')
      .select('*')
      .order('measured_at', { ascending: false })

    if (since) {
      query = query.gt('created_at', since)
    }

    const { data, error } = await query
    if (error)
      throw new Error(`Blutdruck-Logs laden fehlgeschlagen: ${error.message}`)
    return (data ?? []) as BloodPressureLog[]
  }

  async getBloodPressureLogsByDate(date: string): Promise<BloodPressureLog[]> {
    const { data, error } = await this.client
      .from('blood_pressure_logs_decrypted')
      .select('*')
      .like('measured_at', `${date}%`)
      .order('measured_at', { ascending: true })

    if (error) return []
    return (data ?? []) as BloodPressureLog[]
  }

  // --- Shopping List ---

  async getShoppingItems(): Promise<ShoppingItem[]> {
    const { data, error } = await this.client
      .from('shopping_items')
      .select('*')
      .is('group_id', null)
      .order('category', { ascending: true })

    if (error)
      throw new Error(`Einkaufsliste laden fehlgeschlagen: ${error.message}`)
    return (data ?? []) as ShoppingItem[]
  }

  // --- Daily Data Aggregation ---

  async getDailyData(date: string): Promise<DailyData> {
    const [meals, waterLogs, weightLogs, medicationLogs, bloodPressureLogs] =
      await Promise.all([
        this.getMealsByDate(date),
        this.getWaterLogsByDate(date),
        this.getWeightLogsByDate(date),
        this.getMedicationLogsByDate(date),
        this.getBloodPressureLogsByDate(date),
      ])

    return {
      date,
      meals,
      waterLogs,
      weightLogs,
      medicationLogs,
      bloodPressureLogs,
    }
  }

  // --- Helper: Get all unique dates from tracked data ---

  async getAllTrackedDates(since?: number): Promise<string[]> {
    const dates = new Set<string>()

    const [meals, waterLogs, weightLogs, medLogs, bpLogs] = await Promise.all([
      this.getMeals(since),
      this.getWaterLogs(since),
      this.getWeightLogs(since),
      this.getMedicationLogs(since),
      this.getBloodPressureLogs(since),
    ])

    for (const m of meals) dates.add(m.date)
    for (const w of waterLogs) dates.add(w.date)
    for (const w of weightLogs) dates.add(w.date)
    for (const m of medLogs) dates.add(m.scheduled_date)
    for (const b of bpLogs) {
      const date = b.measured_at.split('T')[0]
      if (date) dates.add(date)
    }

    return Array.from(dates).sort()
  }

  // --- Private Helpers ---

  private parseScheduleTimes(times: unknown): string[] {
    if (Array.isArray(times)) return times as string[]
    if (typeof times === 'string') {
      try {
        const parsed = JSON.parse(times)
        return Array.isArray(parsed) ? parsed : []
      } catch {
        return []
      }
    }
    return []
  }
}
