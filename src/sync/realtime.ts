import type { SupabaseClient, RealtimeChannel } from '@supabase/supabase-js'
import type { SyncEngine } from './sync-engine'

interface RealtimePayload {
  new: Record<string, unknown>
  old: Record<string, unknown>
  eventType: 'INSERT' | 'UPDATE' | 'DELETE'
}

/**
 * Manages Supabase Realtime subscriptions for all relevant tables.
 * Uses 2-second debounce per table to avoid excessive syncs.
 */
export class RealtimeManager {
  private channels: RealtimeChannel[] = []
  private debounceTimers: Map<string, ReturnType<typeof setTimeout>> = new Map()
  private readonly DEBOUNCE_MS = 2000

  constructor(
    private client: SupabaseClient,
    private syncEngine: SyncEngine,
  ) {}

  /**
   * Subscribes to all relevant tables.
   */
  subscribeAll(): void {
    this.unsubscribeAll()

    // Recipes: sync individual recipe
    this.subscribeToTable('recipes', (payload) => {
      const id = (payload.new as Record<string, string>)?.id
      if (id) {
        this.debounce('recipe-' + id, () => this.syncEngine.syncRecipe(id))
      }
    })

    // Meals: sync daily note for the date
    this.subscribeToTable('meals', (payload) => {
      const date = (payload.new as Record<string, string>)?.date
      if (date) {
        this.debounce('daily-' + date, () =>
          this.syncEngine.syncDailyNote(date),
        )
      }
    })

    // Water logs: sync daily note
    this.subscribeToTable('water_logs', (payload) => {
      const date = (payload.new as Record<string, string>)?.date
      if (date) {
        this.debounce('daily-' + date, () =>
          this.syncEngine.syncDailyNote(date),
        )
      }
    })

    // Weight logs: sync daily note
    this.subscribeToTable('weight_logs', (payload) => {
      const date = (payload.new as Record<string, string>)?.date
      if (date) {
        this.debounce('daily-' + date, () =>
          this.syncEngine.syncDailyNote(date),
        )
      }
    })

    // Mealprep plans: sync individual plan
    this.subscribeToTable('mealprep_plans', (payload) => {
      const id = (payload.new as Record<string, string>)?.id
      if (id) {
        this.debounce('mealprep-' + id, () =>
          this.syncEngine.syncMealprepPlan(id),
        )
      }
    })

    // Inventory items: sync entire inventory file
    this.subscribeToTable('inventory_items', () => {
      this.debounce('inventory', () => this.syncEngine.syncInventory())
    })

    // Medications: sync entire medications file
    this.subscribeToTable('medications', () => {
      this.debounce('medications', () => this.syncEngine.syncMedications())
    })

    // Medication logs: sync daily note
    this.subscribeToTable('medication_logs', (payload) => {
      const date = (payload.new as Record<string, string>)?.scheduled_date
      if (date) {
        this.debounce('daily-' + date, () =>
          this.syncEngine.syncDailyNote(date),
        )
      }
    })

    // Blood pressure logs: sync daily note
    this.subscribeToTable('blood_pressure_logs', (payload) => {
      const measuredAt = (payload.new as Record<string, string>)?.measured_at
      if (measuredAt) {
        const date = measuredAt.split('T')[0]
        if (date) {
          this.debounce('daily-' + date, () =>
            this.syncEngine.syncDailyNote(date),
          )
        }
      }
    })

    // Shopping items: sync entire shopping list file
    this.subscribeToTable('shopping_items', () => {
      this.debounce('shopping', () => this.syncEngine.syncShoppingList())
    })
  }

  /**
   * Unsubscribes from all channels and clears debounce timers.
   */
  unsubscribeAll(): void {
    for (const channel of this.channels) {
      this.client.removeChannel(channel)
    }
    this.channels = []

    for (const timer of this.debounceTimers.values()) {
      clearTimeout(timer)
    }
    this.debounceTimers.clear()
  }

  // --- Private Helpers ---

  private subscribeToTable(
    table: string,
    handler: (payload: RealtimePayload) => void,
  ): void {
    const channel = this.client
      .channel(`fit-assistent-${table}`)
      .on(
        'postgres_changes' as 'system',
        {
          event: '*',
          schema: 'public',
          table,
        } as Record<string, string>,
        (payload: unknown) => {
          try {
            handler(payload as RealtimePayload)
          } catch (e) {
            console.error(`[FitAssistent] Realtime error for ${table}:`, e)
          }
        },
      )
      .subscribe()

    this.channels.push(channel)
  }

  private debounce(key: string, fn: () => Promise<void>): void {
    const existing = this.debounceTimers.get(key)
    if (existing) {
      clearTimeout(existing)
    }

    const timer = setTimeout(async () => {
      this.debounceTimers.delete(key)
      try {
        await fn()
      } catch (e) {
        console.error(`[FitAssistent] Debounced sync error for ${key}:`, e)
      }
    }, this.DEBOUNCE_MS)

    this.debounceTimers.set(key, timer)
  }
}
