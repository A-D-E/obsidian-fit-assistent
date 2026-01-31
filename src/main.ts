import { Notice, Plugin } from 'obsidian'
import type { FitAssistentSettings, SyncResult, SyncState } from './types'
import { DEFAULT_SETTINGS, DEFAULT_SYNC_STATE } from './constants'
import {
  destroyClient,
  getCurrentUserId,
  getSupabaseClient,
  signIn,
  signOut,
} from './api/supabase-client'
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
  private statusBarEl: HTMLElement | null = null

  async onload(): Promise<void> {
    await this.loadSettings()

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
      this.updateStatusBar('Nicht verbunden')
    }

    // Settings tab
    this.addSettingTab(new FitAssistentSettingTab(this.app, this))

    // Commands
    this.addCommand({
      id: 'full-sync',
      name: 'Vollständige Synchronisation',
      callback: async () => {
        if (!this.isConnected) {
          new Notice('FitAssistent: Bitte zuerst anmelden')
          return
        }
        new Notice('FitAssistent: Sync gestartet...')
        const result = await this.runFullSync()
        this.notifySyncResult(result)
      },
    })

    this.addCommand({
      id: 'incremental-sync',
      name: 'Inkrementelle Synchronisation',
      callback: async () => {
        if (!this.isConnected) {
          new Notice('FitAssistent: Bitte zuerst anmelden')
          return
        }
        const result = await this.runIncrementalSync()
        this.notifySyncResult(result)
      },
    })

    // Auto-connect on startup if credentials are available
    if (
      this.settings.supabaseUrl &&
      this.settings.supabaseAnonKey &&
      this.settings.email &&
      this.settings.password
    ) {
      // Delay to avoid blocking startup
      setTimeout(() => this.connect(), 2000)
    }
  }

  async onunload(): Promise<void> {
    this.stopAutoSync()
    this.stopRealtime()
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

    // Update dependent services
    this.vaultManager?.updateSettings(this.settings)
    this.syncEngine?.updateSettings(this.settings)
  }

  // --- Connection ---

  async connect(): Promise<{ success: boolean; error?: string }> {
    const { supabaseUrl, supabaseAnonKey, email, password } = this.settings

    if (!supabaseUrl || !supabaseAnonKey) {
      return { success: false, error: 'Supabase URL und Key erforderlich' }
    }
    if (!email || !password) {
      return { success: false, error: 'E-Mail und Passwort erforderlich' }
    }

    try {
      const client = getSupabaseClient(supabaseUrl, supabaseAnonKey)
      const result = await signIn(client, email, password)

      if ('error' in result) {
        this.isConnected = false
        this.updateStatusBar('Verbindungsfehler')
        return { success: false, error: result.error }
      }

      this.dataService = new DataService(client)
      this.syncEngine = new SyncEngine(
        this.dataService,
        this.vaultManager,
        this.syncState,
        this.settings,
      )

      this.isConnected = true
      this.updateStatusBar('Verbunden')

      // Create folder structure
      await createFolderStructure(this.app.vault, this.settings.basePath, {
        recipes: this.settings.recipesFolder,
        tracker: this.settings.trackerFolder,
        mealprep: this.settings.mealprepFolder,
        health: this.settings.healthFolder,
        lists: this.settings.listsFolder,
      })

      // Start auto-sync and realtime
      this.setupAutoSync()
      if (this.settings.realtimeEnabled) {
        this.startRealtime()
      }

      return { success: true }
    } catch (e) {
      this.isConnected = false
      this.updateStatusBar('Fehler')
      const msg = e instanceof Error ? e.message : String(e)
      return { success: false, error: msg }
    }
  }

  async disconnect(): Promise<void> {
    this.stopAutoSync()
    this.stopRealtime()

    if (this.settings.supabaseUrl && this.settings.supabaseAnonKey) {
      const client = getSupabaseClient(
        this.settings.supabaseUrl,
        this.settings.supabaseAnonKey,
      )
      await signOut(client)
    }

    destroyClient()
    this.dataService = null
    this.syncEngine = null!
    this.isConnected = false
    this.updateStatusBar('Nicht verbunden')
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
            message: 'Nicht verbunden',
            timestamp: Date.now(),
          },
        ],
        duration: 0,
      }
    }

    this.updateStatusBar('Synchronisiere...')
    try {
      const result = await this.syncEngine.fullSync((msg) => {
        this.updateStatusBar(msg)
      })

      if (result.success) {
        this.updateStatusBar('Sync OK')
      } else {
        this.updateStatusBar(`Sync: ${result.errors.length} Fehler`)
      }

      return result
    } catch (e) {
      this.updateStatusBar('Sync Fehler')
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
            message: 'Nicht verbunden',
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
        this.updateStatusBar('Sync OK')
      } else {
        this.updateStatusBar(`${result.errors.length} Fehler`)
      }

      return result
    } catch (e) {
      this.updateStatusBar('Sync Fehler')
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
    if (!this.isConnected || !this.syncEngine || !this.settings.supabaseUrl) {
      return
    }

    this.stopRealtime()

    const client = getSupabaseClient(
      this.settings.supabaseUrl,
      this.settings.supabaseAnonKey,
    )

    this.realtimeManager = new RealtimeManager(client, this.syncEngine)
    this.realtimeManager.subscribeAll()
  }

  stopRealtime(): void {
    if (this.realtimeManager) {
      this.realtimeManager.unsubscribeAll()
      this.realtimeManager = null
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
        `FitAssistent: Sync OK (${result.filesCreated + result.filesUpdated} Dateien)`,
      )
    } else {
      new Notice(
        `FitAssistent: ${result.errors.length} Fehler beim Sync`,
      )
    }
  }
}
