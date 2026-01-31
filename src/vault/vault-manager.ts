import { type Vault, normalizePath } from 'obsidian'
import type { FitAssistentSettings, MealPrepPlan, Recipe } from '../types'
import { sanitizeFilename } from '../templates/template-utils'
import { ensureFolderExists } from './folder-structure'

/**
 * Manages file creation/update operations in the Obsidian vault.
 */
export class VaultManager {
  constructor(
    private vault: Vault,
    private settings: FitAssistentSettings,
  ) {}

  /**
   * Updates settings reference (called when settings change).
   */
  updateSettings(settings: FitAssistentSettings): void {
    this.settings = settings
  }

  // --- Path Builders ---

  private get base(): string {
    return this.settings.basePath
  }

  getRecipePath(recipe: Recipe): string {
    const title = sanitizeFilename(recipe.title || 'Unbekanntes Rezept')
    return normalizePath(
      `${this.base}/${this.settings.recipesFolder}/${title}.md`,
    )
  }

  getDailyNotePath(date: string): string {
    const [year, month] = date.split('-')
    return normalizePath(
      `${this.base}/${this.settings.trackerFolder}/${year}/${month}/${date}.md`,
    )
  }

  getMealprepPath(plan: MealPrepPlan): string {
    const startDate = new Date(plan.start_date)
    const weekNumber = getISOWeekNumber(startDate)
    const year = startDate.getFullYear()
    const name = plan.name
      ? sanitizeFilename(plan.name)
      : `KW${String(weekNumber).padStart(2, '0')}-${year}`
    return normalizePath(
      `${this.base}/${this.settings.mealprepFolder}/${name}.md`,
    )
  }

  getProfilePath(): string {
    return normalizePath(`${this.base}/${this.settings.profileFileName}`)
  }

  getInventoryPath(): string {
    return normalizePath(
      `${this.base}/${this.settings.listsFolder}/Inventar.md`,
    )
  }

  getMedicationsPath(): string {
    return normalizePath(
      `${this.base}/${this.settings.healthFolder}/Medikamente.md`,
    )
  }

  getShoppingListPath(): string {
    return normalizePath(
      `${this.base}/${this.settings.listsFolder}/Einkaufsliste.md`,
    )
  }

  // --- File Operations ---

  /**
   * Creates or updates a file at the given path.
   * Creates parent folders if they don't exist.
   * Returns true if file was created, false if updated.
   */
  async createOrUpdateFile(
    path: string,
    content: string,
  ): Promise<boolean> {
    const normalizedPath = normalizePath(path)

    // Ensure parent folder exists
    const folderPath = normalizedPath.substring(
      0,
      normalizedPath.lastIndexOf('/'),
    )
    if (folderPath) {
      await ensureFolderExists(this.vault, folderPath)
    }

    const existing = this.vault.getAbstractFileByPath(normalizedPath)

    if (existing) {
      await this.vault.modify(
        this.vault.getFileByPath(normalizedPath)!,
        content,
      )
      return false
    }

    await this.vault.create(normalizedPath, content)
    return true
  }

  /**
   * Deletes a file if it exists.
   */
  async deleteFile(path: string): Promise<void> {
    const normalizedPath = normalizePath(path)
    const file = this.vault.getFileByPath(normalizedPath)
    if (file) {
      await this.vault.delete(file)
    }
  }

  /**
   * Checks if a file exists at the given path.
   */
  fileExists(path: string): boolean {
    return this.vault.getAbstractFileByPath(normalizePath(path)) !== null
  }
}

/**
 * Returns the ISO week number for a date.
 */
function getISOWeekNumber(date: Date): number {
  const d = new Date(
    Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()),
  )
  const dayNum = d.getUTCDay() || 7
  d.setUTCDate(d.getUTCDate() + 4 - dayNum)
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1))
  return Math.ceil(((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7)
}
