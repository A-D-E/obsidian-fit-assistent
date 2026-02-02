import type { SupabaseClient, RealtimeChannel } from '@supabase/supabase-js'
import type { SyncEngine } from './sync-engine'

interface RealtimePayload {
  new: Record<string, unknown>
  old: Record<string, unknown>
  eventType: 'INSERT' | 'UPDATE' | 'DELETE'
}

type ChannelStatus = 'SUBSCRIBED' | 'CLOSED' | 'CHANNEL_ERROR' | 'TIMED_OUT'

interface ChannelInfo {
  table: string
  channel: RealtimeChannel
  status: ChannelStatus | 'PENDING'
  retryCount: number
  retryTimer: ReturnType<typeof setTimeout> | null
}

/**
 * Manages Supabase Realtime subscriptions for all relevant tables.
 * Uses 2-second debounce per table to avoid excessive syncs.
 *
 * Includes channel health monitoring and auto-reconnect logic
 * for iOS compatibility (background kill recovery).
 */
export class RealtimeManager {
  private channels: ChannelInfo[] = []
  private debounceTimers: Map<string, ReturnType<typeof setTimeout>> = new Map()
  private readonly DEBOUNCE_MS = 2000
  private readonly MAX_RETRIES = 3
  private readonly BASE_RETRY_DELAY_MS = 2000

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
   * Unsubscribes from all channels and clears debounce/retry timers.
   */
  unsubscribeAll(): void {
    for (const info of this.channels) {
      if (info.retryTimer) {
        clearTimeout(info.retryTimer)
      }
      this.client.removeChannel(info.channel)
    }
    this.channels = []

    for (const timer of this.debounceTimers.values()) {
      clearTimeout(timer)
    }
    this.debounceTimers.clear()
  }

  /**
   * Full reconnect: tears down all channels and re-subscribes.
   * Resets retry counters. Safe to call from outside (e.g. on app resume).
   */
  reconnectAll(): void {
    console.log('[FitAssistent] Realtime: reconnecting all channels')
    this.subscribeAll()
  }

  /**
   * Returns true if ALL channels are in SUBSCRIBED status.
   */
  isHealthy(): boolean {
    if (this.channels.length === 0) return false

    return this.channels.every((info) => info.status === 'SUBSCRIBED')
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

    const info: ChannelInfo = {
      table,
      channel,
      status: 'PENDING',
      retryCount: 0,
      retryTimer: null,
    }

    this.channels.push(info)

    // Subscribe with status callback for health tracking + auto-reconnect
    channel.subscribe((status: string, err?: Error) => {
      info.status = status as ChannelStatus

      if (status === 'SUBSCRIBED') {
        // Successfully connected — reset retry counter
        info.retryCount = 0
        console.log(
          `[FitAssistent] Realtime: ${table} channel SUBSCRIBED`,
        )
      } else if (
        status === 'CLOSED' ||
        status === 'CHANNEL_ERROR' ||
        status === 'TIMED_OUT'
      ) {
        console.warn(
          `[FitAssistent] Realtime: ${table} channel ${status}`,
          err ?? '',
        )
        this.scheduleRetry(info, handler)
      }
    })
  }

  /**
   * Schedules a retry for a failed channel with exponential backoff.
   * Gives up after MAX_RETRIES until the next manual reconnectAll().
   */
  private scheduleRetry(
    info: ChannelInfo,
    handler: (payload: RealtimePayload) => void,
  ): void {
    // Clear any existing retry timer
    if (info.retryTimer) {
      clearTimeout(info.retryTimer)
      info.retryTimer = null
    }

    if (info.retryCount >= this.MAX_RETRIES) {
      console.error(
        `[FitAssistent] Realtime: ${info.table} channel gave up ` +
          `after ${this.MAX_RETRIES} retries — waiting for manual reconnect`,
      )
      return
    }

    info.retryCount++
    const delay = this.BASE_RETRY_DELAY_MS * Math.pow(2, info.retryCount - 1)

    console.log(
      `[FitAssistent] Realtime: ${info.table} retry ${info.retryCount}/${this.MAX_RETRIES} in ${delay}ms`,
    )

    info.retryTimer = setTimeout(() => {
      info.retryTimer = null

      // Remove the dead channel from Supabase
      this.client.removeChannel(info.channel)

      // Remove from our tracking array
      const idx = this.channels.indexOf(info)
      if (idx !== -1) {
        this.channels.splice(idx, 1)
      }

      // Re-subscribe this single table (creates new ChannelInfo)
      this.subscribeToTable(info.table, handler)
    }, delay)
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
