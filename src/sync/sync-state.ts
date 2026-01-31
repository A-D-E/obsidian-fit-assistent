import type { SyncError, SyncState } from '../types'
import { DEFAULT_SYNC_STATE } from '../constants'

/**
 * Manages sync state persistence using Obsidian's plugin data storage.
 * State is loaded/saved alongside plugin settings.
 */
export class SyncStateManager {
  private state: SyncState

  constructor(
    private loadFn: () => Promise<SyncState | null>,
    private saveFn: (state: SyncState) => Promise<void>,
  ) {
    this.state = { ...DEFAULT_SYNC_STATE }
  }

  async load(): Promise<void> {
    const loaded = await this.loadFn()
    if (loaded) {
      this.state = { ...DEFAULT_SYNC_STATE, ...loaded }
    }
  }

  async save(): Promise<void> {
    await this.saveFn(this.state)
  }

  getState(): SyncState {
    return { ...this.state }
  }

  getLastSync(table: string): number | null {
    return this.state.lastSyncPerTable[table] ?? null
  }

  async updateLastSync(table: string, timestamp: number): Promise<void> {
    this.state.lastSyncPerTable[table] = timestamp
    await this.save()
  }

  async updateFullSync(): Promise<void> {
    this.state.lastFullSync = Date.now()
    await this.save()
  }

  setFileMapping(id: string, path: string): void {
    this.state.fileMappings[id] = path
  }

  removeFileMapping(id: string): void {
    delete this.state.fileMappings[id]
  }

  getFileMapping(id: string): string | undefined {
    return this.state.fileMappings[id]
  }

  addError(error: SyncError): void {
    this.state.syncErrors.push(error)
    // Keep only last 100 errors
    if (this.state.syncErrors.length > 100) {
      this.state.syncErrors = this.state.syncErrors.slice(-100)
    }
  }

  clearErrors(): void {
    this.state.syncErrors = []
  }

  getErrors(): SyncError[] {
    return [...this.state.syncErrors]
  }

  async reset(): Promise<void> {
    this.state = { ...DEFAULT_SYNC_STATE }
    await this.save()
  }
}
