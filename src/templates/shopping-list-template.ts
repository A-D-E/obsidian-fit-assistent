import { t } from '../i18n'
import type { ShoppingItem } from '../types'
import {
  getShoppingCategoryLabel,
  renderFrontmatter,
  renderProgressBar,
} from './template-utils'

/**
 * Renders the Shopping List as a Markdown document with checkboxes.
 * Groups items by category with a progress bar.
 */
export function renderShoppingList(items: ShoppingItem[]): string {
  const sections: string[] = []

  const checkedCount = items.filter((i) => i.checked).length

  // Frontmatter
  sections.push(
    renderFrontmatter({
      synced: new Date().toISOString(),
      total_items: items.length,
      checked: checkedCount,
    }),
  )

  sections.push(`# ${t('tpl.shopping.title')}`)

  if (items.length === 0) {
    sections.push(`*${t('tpl.shopping.empty')}*`)
    return sections.join('\n\n')
  }

  // Progress bar
  sections.push(`**${t('tpl.progress')}:** ${renderProgressBar(checkedCount, items.length)}`)

  // Group by category
  const categoryOrder = [
    'produce',
    'grains',
    'protein',
    'dairy',
    'bakery',
    'cheese',
    'meat',
    'spices',
    'frozen',
    'household',
    'other',
  ]

  const groups: Record<string, ShoppingItem[]> = {}
  for (const item of items) {
    const cat = item.category ?? 'other'
    if (!groups[cat]) groups[cat] = []
    groups[cat].push(item)
  }

  for (const category of categoryOrder) {
    const categoryItems = groups[category]
    if (!categoryItems || categoryItems.length === 0) continue

    const label = getShoppingCategoryLabel(category)
    sections.push(`## ${label}`)

    const lines: string[] = []
    for (const item of categoryItems) {
      const checkbox = item.checked ? '- [x]' : '- [ ]'
      const qty =
        item.quantity && item.unit
          ? `${item.quantity} ${item.unit} `
          : ''
      lines.push(`${checkbox} ${qty}${item.ingredient}`)
    }
    sections.push(lines.join('\n'))
  }

  return sections.join('\n\n')
}
