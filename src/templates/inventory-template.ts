import { t } from '../i18n'
import type { InventoryItem } from '../types'
import {
  formatDate,
  getCategoryEmoji,
  getCategoryLabel,
  renderFrontmatter,
  renderTable,
} from './template-utils'

/**
 * Renders the aggregated Inventory as a Markdown document.
 * Groups items by category (fridge, freezer, pantry).
 */
export function renderInventory(items: InventoryItem[]): string {
  const sections: string[] = []

  // Frontmatter
  sections.push(
    renderFrontmatter({
      synced: new Date().toISOString(),
      total_items: items.length,
    }),
  )

  sections.push(`# ${t('tpl.inventory.title')}`)

  if (items.length === 0) {
    sections.push(`*${t('tpl.inventory.empty')}*`)
    return sections.join('\n\n')
  }

  // Group by category
  const groups: Record<string, InventoryItem[]> = {
    fridge: [],
    freezer: [],
    pantry: [],
  }

  for (const item of items) {
    const cat = item.category ?? 'pantry'
    if (!groups[cat]) groups[cat] = []
    groups[cat].push(item)
  }

  const today = new Date()
  const warningDays = 3

  for (const category of ['fridge', 'freezer', 'pantry'] as const) {
    const categoryItems = groups[category]
    if (!categoryItems || categoryItems.length === 0) continue

    const emoji = getCategoryEmoji(category)
    const label = getCategoryLabel(category)
    sections.push(`## ${emoji} ${label} (${categoryItems.length})`)

    const headers = [t('tpl.inventory.item'), t('tpl.amount'), t('tpl.inventory.best_before'), t('tpl.status')]
    const rows: string[][] = []

    for (const item of categoryItems) {
      let expiryStr = '–'
      let statusStr = '✅'

      if (item.expiry_date) {
        const expiry = new Date(item.expiry_date)
        expiryStr = formatDate(item.expiry_date)

        const daysUntilExpiry = Math.ceil(
          (expiry.getTime() - today.getTime()) / 86400000,
        )

        if (daysUntilExpiry < 0) {
          statusStr = t('tpl.inventory.expired')
        } else if (daysUntilExpiry <= warningDays) {
          statusStr = `⚠️ ${daysUntilExpiry}d`
        }
      }

      // Low stock warning
      if (
        item.min_quantity &&
        item.min_quantity > 0 &&
        item.quantity <= item.min_quantity
      ) {
        statusStr += ` ${t('tpl.inventory.restock')}`
      }

      rows.push([
        item.name,
        `${item.quantity} ${item.unit}`,
        expiryStr,
        statusStr,
      ])
    }

    sections.push(renderTable(headers, rows))
  }

  return sections.join('\n\n')
}
