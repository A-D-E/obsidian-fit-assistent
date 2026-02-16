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
  lastEventAt: number
}

/**
 * Manages Supabase Realtime subscriptions for all relevant tables.
 * Uses 2-second debounce per table to avoid excessive syncs.
 *
 * Relies on Supabase Realtime's built-in reconnection logic for
 * transient WebSocket / channel errors. Only performs full reconnects
 * as a fallback when channels stay unhealthy for an extended period.
 */
export class RealtimeManager {
  private channels: ChannelInfo[] = []
  private debounceTimers: Map<string, ReturnType<typeof setTimeout>> = new Map()
  private recoveryTimer: ReturnType<typeof setTimeout> | null = null
  private fullReconnectCount = 0
  private readonly DEBOUNCE_MS = 2000
  private readonly MAX_FULL_RECONNECTS = 5
  private readonly BASE_RECOVERY_DELAY_MS = 15_000
  private readonly STALE_THRESHOLD_MS = 10 * 60 * 1000 // 10 min

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
    if (this.recoveryTimer) {
      clearTimeout(this.recoveryTimer)
      this.recoveryTimer = null
    }

    for (const info of this.channels) {
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
   * Resets reconnect counter. Safe to call from outside (e.g. on app resume).
   */
  reconnectAll(): void {
    console.log('[FitAssistent] Realtime: reconnecting all channels')
    this.fullReconnectCount = 0
    this.subscribeAll()
  }

  /**
   * Propagates a new JWT to the Realtime WebSocket so existing
   * channels keep working after a token refresh.
   */
  async setAuth(token: string): Promise<void> {
    try {
      this.client.realtime.setAuth(token)
      console.log('[FitAssistent] Realtime: auth token updated')
    } catch (e) {
      console.warn(
        '[FitAssistent] Realtime: setAuth failed, reconnecting all channels',
        e,
      )
      this.reconnectAll()
    }
  }

  /**
   * Returns true if ALL channels are in SUBSCRIBED status
   * and none are stale (no event received for >10 min).
   */
  isHealthy(): boolean {
    if (this.channels.length === 0) return false

    const now = Date.now()
    return this.channels.every(
      (info) =>
        info.status === 'SUBSCRIBED' &&
        now - info.lastEventAt < this.STALE_THRESHOLD_MS,
    )
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
          info.lastEventAt = Date.now()
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
      lastEventAt: Date.now(),
    }

    this.channels.push(info)

    channel.subscribe((status: string, err?: Error) => {
      const prevStatus = info.status
      info.status = status as ChannelStatus
      info.lastEventAt = Date.now()

      if (status === 'SUBSCRIBED') {
        this.fullReconnectCount = 0
        console.log(
          `[FitAssistent] Realtime: ${table} channel SUBSCRIBED`,
        )
      } else if (
        status === 'CHANNEL_ERROR' ||
        status === 'TIMED_OUT'
      ) {
        // Only log once per transition to avoid spamming the console
        // (Supabase's built-in rejoin fires the callback repeatedly)
        if (prevStatus !== status) {
          console.warn(
            `[FitAssistent] Realtime: ${table} channel ${status}`,
            err?.message ?? '',
          )
        }
        // Let Supabase's built-in rejoinTimer handle reconnection.
        // Schedule a recovery check as fallback in case built-in
        // reconnection cannot recover.
        this.scheduleRecoveryCheck()
      } else if (status === 'CLOSED') {
        if (prevStatus !== 'CLOSED') {
          console.warn(`[FitAssistent] Realtime: ${table} channel CLOSED`)
        }
      }
    })
  }

  /**
   * Schedules a deferred check: if channels are still unhealthy after
   * a delay, performs a full reconnect with exponential backoff.
   * Only one check timer runs at a time — duplicate calls are no-ops.
   */
  private scheduleRecoveryCheck(): void {
    if (this.recoveryTimer) return

    if (this.fullReconnectCount >= this.MAX_FULL_RECONNECTS) {
      console.error(
        `[FitAssistent] Realtime: exhausted ${this.MAX_FULL_RECONNECTS} ` +
          `full reconnect attempts — giving up until next manual reconnect`,
      )
      return
    }

    const delay =
      this.BASE_RECOVERY_DELAY_MS *
      Math.pow(2, Math.min(this.fullReconnectCount, 4))

    console.log(
      `[FitAssistent] Realtime: recovery check scheduled in ${Math.round(delay / 1000)}s`,
    )

    this.recoveryTimer = setTimeout(() => {
      this.recoveryTimer = null

      // Check if channels recovered on their own (via built-in rejoin)
      const anySubscribed = this.channels.some(
        (ch) => ch.status === 'SUBSCRIBED',
      )
      const allHealthy = this.channels.every(
        (ch) => ch.status === 'SUBSCRIBED',
      )

      if (allHealthy) {
        console.log(
          '[FitAssistent] Realtime: all channels recovered — no action needed',
        )
        return
      }

      if (anySubscribed) {
        console.log(
          '[FitAssistent] Realtime: some channels recovered, ' +
            'waiting for built-in reconnection to finish',
        )
        // Schedule another check since partial recovery is in progress
        this.scheduleRecoveryCheck()
        return
      }

      // No channels recovered → full reconnect
      this.fullReconnectCount++
      console.log(
        `[FitAssistent] Realtime: no channels recovered — ` +
          `full reconnect (${this.fullReconnectCount}/${this.MAX_FULL_RECONNECTS})`,
      )
      this.subscribeAll()
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
