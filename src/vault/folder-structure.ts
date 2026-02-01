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
 * Joins a base path with a subfolder, handling empty base gracefully.
 */
export function joinPath(base: string, sub: string): string {
  if (!base) return sub
  return `${base}/${sub}`
}

/**
 * Creates the full folder structure in the vault.
 * If basePath is empty, folders are created at vault root level.
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
  if (basePath) {
    await ensureFolderExists(vault, basePath)
  }
  await ensureFolderExists(vault, joinPath(basePath, folders.recipes))
  await ensureFolderExists(vault, joinPath(basePath, folders.tracker))
  await ensureFolderExists(vault, joinPath(basePath, folders.mealprep))
  await ensureFolderExists(vault, joinPath(basePath, folders.health))
  await ensureFolderExists(vault, joinPath(basePath, folders.lists))
}
