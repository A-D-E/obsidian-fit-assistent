import { Notice, Plugin } from 'obsidian'
import type { FitAssistentSettings, SyncResult, SyncState } from './types'
import { DEFAULT_SETTINGS, DEFAULT_SYNC_STATE, LEGACY_FOLDER_DEFAULTS } from './constants'
import { initLocale, t } from './i18n'
import {
  authenticateWithPat,
  destroyClient,
  getSupabaseClient,
  setSessionFromJwt,
} from './api/supabase-client'
import { decodeConnectionToken, isValidTokenFormat } from './api/token'
import { DataService } from './api/data-service'
import { VaultManager } from './vault/vault-manager'
import { createFolderStructure } from './vault/folder-structure'
import { SyncStateManager } from './sync/sync-state'
import { SyncEngine } from './sync/sync-engine'
import { RealtimeManager } from './sync/realtime'
import { FitAssistentSettingTab } from './settings'

interface PluginData {
  settings: FitAssistentSettings
  syncState: SyncState
}

export default class FitAssistentPlugin extends Plugin {
  settings: FitAssistentSettings = DEFAULT_SETTINGS
  isConnected = false

  private syncState!: SyncStateManager
  private syncEngine!: SyncEngine
  private vaultManager!: VaultManager
  private dataService: DataService | null = null
  private realtimeManager: RealtimeManager | null = null
  private autoSyncInterval: ReturnType<typeof setInterval> | null = null
  private jwtRefreshInterval: ReturnType<typeof setInterval> | null = null
  private healthCheckInterval: ReturnType<typeof setInterval> | null = null
  private statusBarEl: HTMLElement | null = null
  private decodedUrl = ''
  private decodedAnonKey = ''
  private decodedSecret = ''
  private lastResumeTime = 0
  private readonly RESUME_DEBOUNCE_MS = 30_000
  private readonly HEALTH_CHECK_INTERVAL_MS = 5 * 60 * 1000
  private boundVisibilityHandler: (() => void) | null = null

  async onload(): Promise<void> {
    // Detect locale from Obsidian's language setting
    initLocale((this.app as unknown as { locale: string }).locale)

    await this.loadSettings()
    await this.migrateSettingsIfNeeded()

    // Initialize sync state manager
    this.syncState = new SyncStateManager(
      async () => {
        const data = await this.loadData()
        return data?.syncState ?? null
      },
      async (state) => {
        const data = (await this.loadData()) ?? {}
        data.syncState = state
        await this.saveData(data)
      },
    )
    await this.syncState.load()

    // Initialize vault manager
    this.vaultManager = new VaultManager(this.app.vault, this.settings)

    // Status bar
    if (this.settings.showStatusBar) {
      this.statusBarEl = this.addStatusBarItem()
      this.updateStatusBar(t('connection.disconnected'))
    }

    // Settings tab
    this.addSettingTab(new FitAssistentSettingTab(this.app, this))

    // Commands
    this.addCommand({
      id: 'full-sync',
      name: t('cmd.full_sync'),
      callback: async () => {
        if (!this.isConnected) {
          new Notice(`FitAssistent: ${t('notice.please_sign_in')}`)
          return
        }
        new Notice(`FitAssistent: ${t('sync.started')}`)
        const result = await this.runFullSync()
        this.notifySyncResult(result)
      },
    })

    this.addCommand({
      id: 'incremental-sync',
      name: t('cmd.incremental_sync'),
      callback: async () => {
        if (!this.isConnected) {
          new Notice(`FitAssistent: ${t('notice.please_sign_in')}`)
          return
        }
        const result = await this.runIncrementalSync()
        this.notifySyncResult(result)
      },
    })

    // Auto-connect on startup if connection token is available
    if (this.settings.connectionToken) {
      setTimeout(() => this.connect(), 2000)
    }
  }

  async onunload(): Promise<void> {
    this.stopAutoSync()
    this.stopJwtRefresh()
    this.stopRealtime()
    this.stopHealthCheck()
    this.removeVisibilityListener()
    destroyClient()
  }

  // --- Settings Management ---

  async loadSettings(): Promise<void> {
    const data = await this.loadData()
    this.settings = Object.assign({}, DEFAULT_SETTINGS, data?.settings ?? {})
  }

  async saveSettings(): Promise<void> {
    const data = (await this.loadData()) ?? {}
    data.settings = this.settings
    await this.saveData(data)

    this.vaultManager?.updateSettings(this.settings)
    this.syncEngine?.updateSettings(this.settings)
  }

  // --- Settings Migration ---

  /**
   * Migrate legacy folder settings to new lowercase defaults.
   * Only touches values that EXACTLY match the old defaults —
   * custom user paths are left untouched.
   */
  private async migrateSettingsIfNeeded(): Promise<void> {
    const s = this.settings
    const legacy = LEGACY_FOLDER_DEFAULTS

    const isLegacy =
      s.basePath === legacy.basePath &&
      s.recipesFolder === legacy.recipesFolder &&
      s.trackerFolder === legacy.trackerFolder &&
      s.mealprepFolder === legacy.mealprepFolder &&
      s.healthFolder === legacy.healthFolder &&
      s.listsFolder === legacy.listsFolder

    if (!isLegacy) return

    // Apply new defaults
    s.basePath = DEFAULT_SETTINGS.basePath
    s.recipesFolder = DEFAULT_SETTINGS.recipesFolder
    s.trackerFolder = DEFAULT_SETTINGS.trackerFolder
    s.mealprepFolder = DEFAULT_SETTINGS.mealprepFolder
    s.healthFolder = DEFAULT_SETTINGS.healthFolder
    s.listsFolder = DEFAULT_SETTINGS.listsFolder

    await this.saveSettings()

    console.log(
      '[FitAssistent] Settings migrated from legacy defaults ' +
        `(basePath="${legacy.basePath}") to new defaults ` +
        `(basePath="${s.basePath || '(vault root)'}", lowercase folders).`,
    )
  }

  // --- Connection ---

  async connect(): Promise<{ success: boolean; error?: string }> {
    const { connectionToken } = this.settings

    if (!connectionToken) {
      return { success: false, error: t('auth.token_required') }
    }

    if (!isValidTokenFormat(connectionToken)) {
      return { success: false, error: t('auth.token_invalid_format') }
    }

    const decoded = decodeConnectionToken(connectionToken)
    if (!decoded) {
      return { success: false, error: t('connection.invalid_token') }
    }

    this.decodedUrl = decoded.url
    this.decodedAnonKey = decoded.anonKey
    this.decodedSecret = decoded.secret

    try {
      // Authenticate via PAT → get JWT
      const authResult = await authenticateWithPat(
        decoded.url,
        decoded.anonKey,
        decoded.secret,
      )

      if ('error' in authResult) {
        this.isConnected = false
        this.updateStatusBar(t('connection.error'))
        return { success: false, error: authResult.error }
      }

      // Set JWT session on the client
      const client = getSupabaseClient(decoded.url, decoded.anonKey)
      const userId = await setSessionFromJwt(client, authResult.access_token)

      if (!userId) {
        this.isConnected = false
        this.updateStatusBar(t('connection.error'))
        return { success: false, error: t('auth.no_user') }
      }

      this.dataService = new DataService(client)
      this.syncEngine = new SyncEngine(
        this.dataService,
        this.vaultManager,
        this.syncState,
        this.settings,
      )

      this.isConnected = true
      this.updateStatusBar(t('connection.connected'))

      await createFolderStructure(this.app.vault, this.settings.basePath, {
        recipes: this.settings.recipesFolder,
        tracker: this.settings.trackerFolder,
        mealprep: this.settings.mealprepFolder,
        health: this.settings.healthFolder,
        lists: this.settings.listsFolder,
      })

      this.setupAutoSync()
      this.setupJwtRefresh(authResult.expires_at)
      if (this.settings.realtimeEnabled) {
        this.startRealtime()
      }

      // iOS catch-up: listen for app resume + periodic health check
      this.registerVisibilityListener()
      this.startHealthCheck()

      return { success: true }
    } catch (e) {
      this.isConnected = false
      this.updateStatusBar(t('notice.error'))
      const msg = e instanceof Error ? e.message : String(e)
      return { success: false, error: msg }
    }
  }

  async disconnect(): Promise<void> {
    this.stopAutoSync()
    this.stopJwtRefresh()
    this.stopRealtime()
    this.stopHealthCheck()
    this.removeVisibilityListener()

    destroyClient()
    this.dataService = null
    this.syncEngine = null!
    this.isConnected = false
    this.decodedUrl = ''
    this.decodedAnonKey = ''
    this.decodedSecret = ''
    this.updateStatusBar(t('connection.disconnected'))
  }

  // --- JWT Refresh ---

  private setupJwtRefresh(expiresAt: number): void {
    this.stopJwtRefresh()

    // Refresh 5 minutes before expiry (expiresAt is unix seconds)
    const nowSec = Math.floor(Date.now() / 1000)
    const refreshInMs = Math.max((expiresAt - nowSec - 300) * 1000, 60_000)

    this.jwtRefreshInterval = setTimeout(async () => {
      if (!this.isConnected || !this.decodedSecret) return

      try {
        const authResult = await authenticateWithPat(
          this.decodedUrl,
          this.decodedAnonKey,
          this.decodedSecret,
        )

        if ('error' in authResult) {
          this.isConnected = false
          this.updateStatusBar(t('connection.error'))
          new Notice(`FitAssistent: ${authResult.error}`)
          return
        }

        const client = getSupabaseClient(this.decodedUrl, this.decodedAnonKey)
        await setSessionFromJwt(client, authResult.access_token)

        if (this.realtimeManager) {
          await this.realtimeManager.setAuth(authResult.access_token)
        }

        // Schedule next refresh
        this.setupJwtRefresh(authResult.expires_at)
      } catch {
        this.isConnected = false
        this.updateStatusBar(t('connection.error'))
      }
    }, refreshInMs)
  }

  private stopJwtRefresh(): void {
    if (this.jwtRefreshInterval) {
      clearTimeout(this.jwtRefreshInterval)
      this.jwtRefreshInterval = null
    }
  }

  // --- Sync Operations ---

  async runFullSync(): Promise<SyncResult> {
    if (!this.syncEngine) {
      return {
        success: false,
        filesCreated: 0,
        filesUpdated: 0,
        errors: [
          {
            table: 'sync_engine',
            itemId: 'init',
            message: t('notice.not_connected'),
            timestamp: Date.now(),
          },
        ],
        duration: 0,
      }
    }

    this.updateStatusBar(t('sync.syncing'))
    try {
      const result = await this.syncEngine.fullSync((msg) => {
        this.updateStatusBar(msg)
      })

      if (result.success) {
        this.updateStatusBar(t('sync.ok'))
      } else {
        this.updateStatusBar(
          `Sync: ${result.errors.length} ${t('notice.error')}`,
        )
      }

      return result
    } catch (e) {
      this.updateStatusBar(t('sync.error'))
      throw e
    }
  }

  async runIncrementalSync(): Promise<SyncResult> {
    if (!this.syncEngine) {
      return {
        success: false,
        filesCreated: 0,
        filesUpdated: 0,
        errors: [
          {
            table: 'sync_engine',
            itemId: 'init',
            message: t('notice.not_connected'),
            timestamp: Date.now(),
          },
        ],
        duration: 0,
      }
    }

    this.updateStatusBar('Sync...')
    try {
      const result = await this.syncEngine.incrementalSync((msg) => {
        this.updateStatusBar(msg)
      })

      if (result.success) {
        this.updateStatusBar(t('sync.ok'))
      } else {
        this.updateStatusBar(
          `${result.errors.length} ${t('notice.error')}`,
        )
      }

      return result
    } catch (e) {
      this.updateStatusBar(t('sync.error'))
      throw e
    }
  }

  // --- Auto-Sync ---

  setupAutoSync(): void {
    this.stopAutoSync()

    if (!this.settings.autoSync || !this.isConnected) return

    const interval = this.settings.syncIntervalMinutes * 60 * 1000
    this.autoSyncInterval = setInterval(async () => {
      if (this.isConnected) {
        await this.runIncrementalSync()
      }
    }, interval)
  }

  private stopAutoSync(): void {
    if (this.autoSyncInterval) {
      clearInterval(this.autoSyncInterval)
      this.autoSyncInterval = null
    }
  }

  // --- Realtime ---

  startRealtime(): void {
    if (!this.isConnected || !this.syncEngine || !this.decodedUrl) {
      return
    }

    this.stopRealtime()

    const client = getSupabaseClient(this.decodedUrl, this.decodedAnonKey)

    this.realtimeManager = new RealtimeManager(client, this.syncEngine)
    this.realtimeManager.subscribeAll()
  }

  stopRealtime(): void {
    if (this.realtimeManager) {
      this.realtimeManager.unsubscribeAll()
      this.realtimeManager = null
    }
  }

  // --- App Resume / iOS Catch-up ---

  /**
   * Registers the visibilitychange listener so the plugin can
   * catch up when iOS (or any OS) brings the app back to foreground.
   */
  private registerVisibilityListener(): void {
    this.removeVisibilityListener()

    this.boundVisibilityHandler = () => {
      if (document.visibilityState === 'visible') {
        this.onAppResume()
      }
    }

    document.addEventListener('visibilitychange', this.boundVisibilityHandler)
  }

  private removeVisibilityListener(): void {
    if (this.boundVisibilityHandler) {
      document.removeEventListener(
        'visibilitychange',
        this.boundVisibilityHandler,
      )
      this.boundVisibilityHandler = null
    }
  }

  /**
   * Called when the app comes back to the foreground.
   * Reconnects realtime channels and runs a quick delta sync.
   * Debounced: fires at most once per RESUME_DEBOUNCE_MS (30s).
   */
  private async onAppResume(): Promise<void> {
    if (!this.isConnected) return

    const now = Date.now()
    if (now - this.lastResumeTime < this.RESUME_DEBOUNCE_MS) {
      return
    }
    this.lastResumeTime = now

    console.log('[FitAssistent] App resumed — reconnecting & syncing')

    // 1. Reconnect realtime channels
    if (this.settings.realtimeEnabled && this.realtimeManager) {
      this.realtimeManager.reconnectAll()
    }

    // 2. Quick delta sync (incremental — only changes since last sync)
    try {
      await this.runIncrementalSync()
    } catch (e) {
      console.error('[FitAssistent] Delta sync on resume failed:', e)
    }
  }

  // --- Periodic Health Check ---

  private startHealthCheck(): void {
    this.stopHealthCheck()

    this.healthCheckInterval = setInterval(() => {
      if (
        !this.isConnected ||
        !this.settings.realtimeEnabled ||
        !this.realtimeManager
      ) {
        return
      }

      if (!this.realtimeManager.isHealthy()) {
        console.warn(
          '[FitAssistent] Health check: channels unhealthy — reconnecting',
        )
        this.realtimeManager.reconnectAll()
      }
    }, this.HEALTH_CHECK_INTERVAL_MS)
  }

  private stopHealthCheck(): void {
    if (this.healthCheckInterval) {
      clearInterval(this.healthCheckInterval)
      this.healthCheckInterval = null
    }
  }

  // --- Sync State ---

  getSyncState(): SyncState {
    return this.syncState.getState()
  }

  async resetSyncState(): Promise<void> {
    await this.syncState.reset()
  }

  // --- Status Bar ---

  private updateStatusBar(text: string): void {
    if (this.statusBarEl && this.settings.showStatusBar) {
      this.statusBarEl.setText(`FA: ${text}`)
    }
  }

  // --- Notifications ---

  private notifySyncResult(result: SyncResult): void {
    if (result.success) {
      new Notice(
        `FitAssistent: ${t('notice.sync_ok', { count: result.filesCreated + result.filesUpdated })}`,
      )
    } else {
      new Notice(
        `FitAssistent: ${t('notice.sync_errors', { count: result.errors.length })}`,
      )
    }
  }
}
