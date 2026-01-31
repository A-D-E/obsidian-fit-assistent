import type { DataService } from '../api/data-service'
import { t } from '../i18n'
import type {
  FitAssistentSettings,
  Medication,
  Recipe,
  SyncResult,
  UserProfile,
} from '../types'
import { renderDailyNote } from '../templates/daily-template'
import { renderInventory } from '../templates/inventory-template'
import { renderMealprepPlan } from '../templates/mealprep-template'
import { renderMedications } from '../templates/medications-template'
import { renderProfile } from '../templates/profile-template'
import { renderRecipe } from '../templates/recipe-template'
import { renderShoppingList } from '../templates/shopping-list-template'
import type { VaultManager } from '../vault/vault-manager'
import type { SyncStateManager } from './sync-state'

/**
 * Orchestrates sync operations for all 11 data types.
 * Error handling per item — one failure never crashes the entire sync.
 */
export class SyncEngine {
  private profile: UserProfile | null = null
  private medicationMap: Map<string, Medication> = new Map()
  private recipeMap: Map<string, Recipe> = new Map()

  constructor(
    private dataService: DataService,
    private vaultManager: VaultManager,
    private syncState: SyncStateManager,
    private settings: FitAssistentSettings,
  ) {}

  updateSettings(settings: FitAssistentSettings): void {
    this.settings = settings
  }

  // --- Full Sync ---

  async fullSync(
    onProgress?: (message: string) => void,
  ): Promise<SyncResult> {
    const start = Date.now()
    let filesCreated = 0
    let filesUpdated = 0
    const errors = this.syncState.getErrors()
    this.syncState.clearErrors()

    const report = (created: boolean) => {
      if (created) filesCreated++
      else filesUpdated++
    }

    try {
      // 1. Load profile (needed for daily notes goal comparison)
      if (this.settings.syncProfile) {
        onProgress?.(t('progress.profile'))
        try {
          this.profile = await this.dataService.getProfile()
          if (this.profile) {
            const content = renderProfile(this.profile)
            const path = this.vaultManager.getProfilePath()
            report(await this.vaultManager.createOrUpdateFile(path, content))
            this.syncState.setFileMapping('profile', path)
          }
        } catch (e) {
          this.addError('profiles_decrypted', 'profile', e)
        }
      }

      // 2. Load medications (needed for medication log name lookup)
      if (this.settings.syncMedications) {
        onProgress?.(t('progress.medications'))
        try {
          const medications = await this.dataService.getMedications()
          this.medicationMap.clear()
          for (const med of medications) {
            this.medicationMap.set(med.id, med)
          }
          const content = renderMedications(medications)
          const path = this.vaultManager.getMedicationsPath()
          report(await this.vaultManager.createOrUpdateFile(path, content))
          this.syncState.setFileMapping('medications', path)
        } catch (e) {
          this.addError('medications_decrypted', 'all', e)
        }
      }

      // 3. Recipes
      if (this.settings.syncRecipes) {
        onProgress?.(t('progress.recipes'))
        try {
          const recipes = await this.dataService.getRecipes()
          this.recipeMap.clear()
          for (const recipe of recipes) {
            this.recipeMap.set(recipe.id, recipe)
            try {
              const content = renderRecipe(recipe)
              const path = this.vaultManager.getRecipePath(recipe)
              report(await this.vaultManager.createOrUpdateFile(path, content))
              this.syncState.setFileMapping(recipe.id, path)
            } catch (e) {
              this.addError('recipes', recipe.id, e)
            }
          }
        } catch (e) {
          this.addError('recipes', 'all', e)
        }
      }

      // 4. Mealprep Plans
      if (this.settings.syncMealprep) {
        onProgress?.(t('progress.mealprep'))
        try {
          const plans = await this.dataService.getMealprepPlans()
          for (const plan of plans) {
            try {
              const content = renderMealprepPlan(plan, this.recipeMap)
              const path = this.vaultManager.getMealprepPath(plan)
              report(await this.vaultManager.createOrUpdateFile(path, content))
              this.syncState.setFileMapping(plan.id, path)
            } catch (e) {
              this.addError('mealprep_plans', plan.id, e)
            }
          }
        } catch (e) {
          this.addError('mealprep_plans', 'all', e)
        }
      }

      // 5. Inventory
      if (this.settings.syncInventory) {
        onProgress?.(t('progress.inventory'))
        try {
          const items = await this.dataService.getInventoryItems()
          const content = renderInventory(items)
          const path = this.vaultManager.getInventoryPath()
          report(await this.vaultManager.createOrUpdateFile(path, content))
          this.syncState.setFileMapping('inventory', path)
        } catch (e) {
          this.addError('inventory_items', 'all', e)
        }
      }

      // 6. Shopping List
      if (this.settings.syncShoppingList) {
        onProgress?.(t('progress.shopping'))
        try {
          const items = await this.dataService.getShoppingItems()
          const content = renderShoppingList(items)
          const path = this.vaultManager.getShoppingListPath()
          report(await this.vaultManager.createOrUpdateFile(path, content))
          this.syncState.setFileMapping('shopping_list', path)
        } catch (e) {
          this.addError('shopping_items', 'all', e)
        }
      }

      // 7. Daily Notes (aggregate meals + water + weight + med-logs + BP)
      onProgress?.(t('progress.daily_notes'))
      try {
        const dates = await this.dataService.getAllTrackedDates()

        for (const date of dates) {
          try {
            await this.syncDailyNote(date)
            report(true) // Approximate: count each date as one file
          } catch (e) {
            this.addError('daily_notes', date, e)
          }
        }
      } catch (e) {
        this.addError('daily_notes', 'all', e)
      }

      // Update sync timestamps
      const now = Date.now()
      await this.syncState.updateFullSync()

      const tables = [
        'recipes',
        'meals',
        'water_logs',
        'weight_logs',
        'mealprep_plans',
        'profiles_decrypted',
        'inventory_items',
        'medications_decrypted',
        'medication_logs_decrypted',
        'blood_pressure_logs_decrypted',
        'shopping_items',
      ]
      for (const table of tables) {
        await this.syncState.updateLastSync(table, now)
      }
    } catch (e) {
      this.addError('sync_engine', 'full_sync', e)
    }

    await this.syncState.save()

    return {
      success: this.syncState.getErrors().length === 0,
      filesCreated,
      filesUpdated,
      errors: this.syncState.getErrors(),
      duration: Date.now() - start,
    }
  }

  // --- Incremental Sync ---

  async incrementalSync(
    onProgress?: (message: string) => void,
  ): Promise<SyncResult> {
    const start = Date.now()
    let filesCreated = 0
    let filesUpdated = 0
    this.syncState.clearErrors()

    const report = (created: boolean) => {
      if (created) filesCreated++
      else filesUpdated++
    }

    try {
      const now = Date.now()

      // Profile
      if (this.settings.syncProfile) {
        onProgress?.(t('progress.check_profile'))
        try {
          this.profile = await this.dataService.getProfile()
          if (this.profile) {
            const content = renderProfile(this.profile)
            const path = this.vaultManager.getProfilePath()
            report(await this.vaultManager.createOrUpdateFile(path, content))
          }
        } catch (e) {
          this.addError('profiles_decrypted', 'profile', e)
        }
      }

      // Medications
      if (this.settings.syncMedications) {
        onProgress?.(t('progress.check_medications'))
        try {
          const medications = await this.dataService.getMedications()
          this.medicationMap.clear()
          for (const med of medications) {
            this.medicationMap.set(med.id, med)
          }
          const content = renderMedications(medications)
          const path = this.vaultManager.getMedicationsPath()
          report(await this.vaultManager.createOrUpdateFile(path, content))
        } catch (e) {
          this.addError('medications_decrypted', 'all', e)
        }
      }

      // Recipes (incremental)
      if (this.settings.syncRecipes) {
        onProgress?.(t('progress.check_recipes'))
        const since = this.syncState.getLastSync('recipes')
        try {
          const recipes = await this.dataService.getRecipes(since ?? undefined)
          for (const recipe of recipes) {
            this.recipeMap.set(recipe.id, recipe)
            try {
              const content = renderRecipe(recipe)
              const path = this.vaultManager.getRecipePath(recipe)
              report(await this.vaultManager.createOrUpdateFile(path, content))
              this.syncState.setFileMapping(recipe.id, path)
            } catch (e) {
              this.addError('recipes', recipe.id, e)
            }
          }
          await this.syncState.updateLastSync('recipes', now)
        } catch (e) {
          this.addError('recipes', 'incremental', e)
        }
      }

      // Mealprep Plans (incremental)
      if (this.settings.syncMealprep) {
        onProgress?.(t('progress.check_mealprep'))
        const since = this.syncState.getLastSync('mealprep_plans')
        try {
          const plans = await this.dataService.getMealprepPlans(
            since ?? undefined,
          )
          for (const plan of plans) {
            try {
              const content = renderMealprepPlan(plan, this.recipeMap)
              const path = this.vaultManager.getMealprepPath(plan)
              report(await this.vaultManager.createOrUpdateFile(path, content))
              this.syncState.setFileMapping(plan.id, path)
            } catch (e) {
              this.addError('mealprep_plans', plan.id, e)
            }
          }
          await this.syncState.updateLastSync('mealprep_plans', now)
        } catch (e) {
          this.addError('mealprep_plans', 'incremental', e)
        }
      }

      // Inventory (always full refresh since it's aggregated)
      if (this.settings.syncInventory) {
        onProgress?.(t('progress.check_inventory'))
        try {
          const items = await this.dataService.getInventoryItems()
          const content = renderInventory(items)
          const path = this.vaultManager.getInventoryPath()
          report(await this.vaultManager.createOrUpdateFile(path, content))
        } catch (e) {
          this.addError('inventory_items', 'all', e)
        }
      }

      // Shopping List (always full refresh since it's aggregated)
      if (this.settings.syncShoppingList) {
        onProgress?.(t('progress.check_shopping'))
        try {
          const items = await this.dataService.getShoppingItems()
          const content = renderShoppingList(items)
          const path = this.vaultManager.getShoppingListPath()
          report(await this.vaultManager.createOrUpdateFile(path, content))
        } catch (e) {
          this.addError('shopping_items', 'all', e)
        }
      }

      // Daily Notes (incremental)
      onProgress?.(t('progress.check_daily'))
      const dailySince = Math.min(
        this.syncState.getLastSync('meals') ?? 0,
        this.syncState.getLastSync('water_logs') ?? 0,
        this.syncState.getLastSync('weight_logs') ?? 0,
        this.syncState.getLastSync('medication_logs_decrypted') ?? 0,
        this.syncState.getLastSync('blood_pressure_logs_decrypted') ?? 0,
      )

      try {
        const dates = await this.dataService.getAllTrackedDates(
          dailySince || undefined,
        )
        for (const date of dates) {
          try {
            await this.syncDailyNote(date)
            report(true)
          } catch (e) {
            this.addError('daily_notes', date, e)
          }
        }

        await this.syncState.updateLastSync('meals', now)
        await this.syncState.updateLastSync('water_logs', now)
        await this.syncState.updateLastSync('weight_logs', now)
        await this.syncState.updateLastSync('medication_logs_decrypted', now)
        await this.syncState.updateLastSync(
          'blood_pressure_logs_decrypted',
          now,
        )
      } catch (e) {
        this.addError('daily_notes', 'incremental', e)
      }
    } catch (e) {
      this.addError('sync_engine', 'incremental', e)
    }

    await this.syncState.save()

    return {
      success: this.syncState.getErrors().length === 0,
      filesCreated,
      filesUpdated,
      errors: this.syncState.getErrors(),
      duration: Date.now() - start,
    }
  }

  // --- Single Item Sync (for Realtime updates) ---

  async syncRecipe(recipeId: string): Promise<void> {
    if (!this.settings.syncRecipes) return
    const recipe = await this.dataService.getRecipeById(recipeId)
    if (!recipe) return
    this.recipeMap.set(recipe.id, recipe)
    const content = renderRecipe(recipe)
    const path = this.vaultManager.getRecipePath(recipe)
    await this.vaultManager.createOrUpdateFile(path, content)
    this.syncState.setFileMapping(recipe.id, path)
    await this.syncState.save()
  }

  async syncDailyNote(date: string): Promise<void> {
    const hasAnyDailySync =
      this.settings.syncMeals ||
      this.settings.syncWater ||
      this.settings.syncWeight ||
      this.settings.syncMedicationLogs ||
      this.settings.syncBloodPressure

    if (!hasAnyDailySync) return

    const dailyData = await this.dataService.getDailyData(date)

    // Skip empty days
    if (
      dailyData.meals.length === 0 &&
      dailyData.waterLogs.length === 0 &&
      dailyData.weightLogs.length === 0 &&
      dailyData.medicationLogs.length === 0 &&
      dailyData.bloodPressureLogs.length === 0
    ) {
      return
    }

    const content = renderDailyNote(
      dailyData,
      this.profile,
      this.medicationMap,
    )
    const path = this.vaultManager.getDailyNotePath(date)
    await this.vaultManager.createOrUpdateFile(path, content)
    this.syncState.setFileMapping(`daily-${date}`, path)
  }

  async syncInventory(): Promise<void> {
    if (!this.settings.syncInventory) return
    const items = await this.dataService.getInventoryItems()
    const content = renderInventory(items)
    const path = this.vaultManager.getInventoryPath()
    await this.vaultManager.createOrUpdateFile(path, content)
  }

  async syncMedications(): Promise<void> {
    if (!this.settings.syncMedications) return
    const medications = await this.dataService.getMedications()
    this.medicationMap.clear()
    for (const med of medications) {
      this.medicationMap.set(med.id, med)
    }
    const content = renderMedications(medications)
    const path = this.vaultManager.getMedicationsPath()
    await this.vaultManager.createOrUpdateFile(path, content)
  }

  async syncShoppingList(): Promise<void> {
    if (!this.settings.syncShoppingList) return
    const items = await this.dataService.getShoppingItems()
    const content = renderShoppingList(items)
    const path = this.vaultManager.getShoppingListPath()
    await this.vaultManager.createOrUpdateFile(path, content)
  }

  async syncMealprepPlan(planId: string): Promise<void> {
    if (!this.settings.syncMealprep) return
    const plans = await this.dataService.getMealprepPlans()
    const plan = plans.find((p) => p.id === planId)
    if (!plan) return
    const content = renderMealprepPlan(plan, this.recipeMap)
    const path = this.vaultManager.getMealprepPath(plan)
    await this.vaultManager.createOrUpdateFile(path, content)
    this.syncState.setFileMapping(plan.id, path)
    await this.syncState.save()
  }

  // --- Helpers ---

  private addError(table: string, itemId: string, error: unknown): void {
    const message =
      error instanceof Error ? error.message : String(error)
    this.syncState.addError({
      table,
      itemId,
      message,
      timestamp: Date.now(),
    })
  }
}
