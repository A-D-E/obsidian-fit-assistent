import type { Vault } from 'obsidian'

/**
 * Ensures a folder path exists in the vault, creating parent folders as needed.
 */
export async function ensureFolderExists(
  vault: Vault,
  path: string,
): Promise<void> {
  const parts = path.split('/')
  let current = ''

  for (const part of parts) {
    current = current ? `${current}/${part}` : part

    const existing = vault.getAbstractFileByPath(current)
    if (!existing) {
      await vault.createFolder(current)
    }
  }
}

/**
 * Creates the full FitAssistent folder structure in the vault.
 */
export async function createFolderStructure(
  vault: Vault,
  basePath: string,
  folders: {
    recipes: string
    tracker: string
    mealprep: string
    health: string
    lists: string
  },
): Promise<void> {
  await ensureFolderExists(vault, basePath)
  await ensureFolderExists(vault, `${basePath}/${folders.recipes}`)
  await ensureFolderExists(vault, `${basePath}/${folders.tracker}`)
  await ensureFolderExists(vault, `${basePath}/${folders.mealprep}`)
  await ensureFolderExists(vault, `${basePath}/${folders.health}`)
  await ensureFolderExists(vault, `${basePath}/${folders.lists}`)
}
