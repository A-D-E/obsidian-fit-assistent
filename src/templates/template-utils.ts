/**
 * Shared template utilities for Markdown generation.
 */

/**
 * Renders YAML frontmatter from a key-value object.
 */
export function renderFrontmatter(data: Record<string, unknown>): string {
  const lines = ['---']

  for (const [key, value] of Object.entries(data)) {
    if (value === undefined || value === null) continue

    if (Array.isArray(value)) {
      if (value.length === 0) {
        lines.push(`${key}: []`)
      } else {
        lines.push(`${key}:`)
        for (const item of value) {
          lines.push(`  - ${String(item)}`)
        }
      }
    } else if (typeof value === 'object') {
      // Skip nested objects in frontmatter for simplicity
      lines.push(`${key}: "${JSON.stringify(value).replace(/"/g, '\\"')}"`)
    } else if (typeof value === 'string') {
      // Escape quotes in strings
      const escaped = value.replace(/"/g, '\\"')
      lines.push(`${key}: "${escaped}"`)
    } else {
      lines.push(`${key}: ${String(value)}`)
    }
  }

  lines.push('---')
  return lines.join('\n')
}

/**
 * Renders a Markdown table from headers and rows.
 */
export function renderTable(
  headers: string[],
  rows: string[][],
  alignments?: ('left' | 'center' | 'right')[],
): string {
  if (rows.length === 0) return ''

  const headerLine = `| ${headers.join(' | ')} |`
  const separatorParts = headers.map((_, i) => {
    const align = alignments?.[i] ?? 'left'
    switch (align) {
      case 'center':
        return ':---:'
      case 'right':
        return '---:'
      default:
        return '---'
    }
  })
  const separatorLine = `| ${separatorParts.join(' | ')} |`
  const dataLines = rows.map((row) => `| ${row.join(' | ')} |`)

  return [headerLine, separatorLine, ...dataLines].join('\n')
}

/**
 * Sanitizes a string for use as a filename.
 */
export function sanitizeFilename(name: string): string {
  return name
    .replace(/[/\\?%*:|"<>]/g, '-')
    .replace(/\s+/g, ' ')
    .trim()
    .substring(0, 200)
}

/**
 * Formats a number with locale-appropriate decimal places.
 */
export function formatNumber(value: number, decimals = 1): string {
  return value.toFixed(decimals).replace('.', ',')
}

/**
 * Formats a timestamp (ms) or ISO string as a readable date.
 */
export function formatDate(
  value: number | string,
  format: 'date' | 'datetime' | 'time' = 'date',
): string {
  const date = typeof value === 'number' ? new Date(value) : new Date(value)

  if (isNaN(date.getTime())) return String(value)

  const day = String(date.getDate()).padStart(2, '0')
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const year = date.getFullYear()
  const hours = String(date.getHours()).padStart(2, '0')
  const minutes = String(date.getMinutes()).padStart(2, '0')

  switch (format) {
    case 'datetime':
      return `${day}.${month}.${year} ${hours}:${minutes}`
    case 'time':
      return `${hours}:${minutes}`
    default:
      return `${day}.${month}.${year}`
  }
}

/**
 * Returns a status emoji for medication log status.
 */
export function getMedLogEmoji(
  status: 'pending' | 'taken' | 'missed' | 'skipped',
): string {
  switch (status) {
    case 'taken':
      return '✅'
    case 'missed':
      return '❌'
    case 'skipped':
      return '⏭️'
    case 'pending':
    default:
      return '⏳'
  }
}

/**
 * Returns a type emoji for medication type.
 */
export function getMedTypeEmoji(
  type: 'medication' | 'vitamin' | 'supplement',
): string {
  switch (type) {
    case 'medication':
      return '💊'
    case 'vitamin':
      return '🟡'
    case 'supplement':
      return '🟢'
    default:
      return '💊'
  }
}

/**
 * Classifies a blood pressure reading.
 */
export function getBPStatus(
  systolic: number,
  diastolic: number,
): { label: string; emoji: string } {
  if (systolic < 120 && diastolic < 80)
    return { label: 'Optimal', emoji: '🟢' }
  if (systolic < 130 && diastolic < 85)
    return { label: 'Normal', emoji: '🟡' }
  if (systolic < 140 && diastolic < 90)
    return { label: 'Hoch-Normal', emoji: '🟠' }
  if (systolic < 160 && diastolic < 100)
    return { label: 'Grad 1', emoji: '🔴' }
  if (systolic < 180 && diastolic < 110)
    return { label: 'Grad 2', emoji: '🔴' }
  return { label: 'Grad 3', emoji: '🔴' }
}

/**
 * Returns a category emoji for inventory categories.
 */
export function getCategoryEmoji(
  category: 'fridge' | 'freezer' | 'pantry',
): string {
  switch (category) {
    case 'fridge':
      return '🧊'
    case 'freezer':
      return '❄️'
    case 'pantry':
      return '🗄️'
    default:
      return '📦'
  }
}

/**
 * Returns a German label for inventory categories.
 */
export function getCategoryLabel(
  category: 'fridge' | 'freezer' | 'pantry',
): string {
  switch (category) {
    case 'fridge':
      return 'Kühlschrank'
    case 'freezer':
      return 'Tiefkühler'
    case 'pantry':
      return 'Vorratskammer'
    default:
      return 'Sonstiges'
  }
}

/**
 * Returns a German label for shopping categories.
 */
export function getShoppingCategoryLabel(category: string): string {
  const labels: Record<string, string> = {
    produce: '🥬 Obst & Gemüse',
    grains: '🌾 Getreide & Hülsenfrüchte',
    protein: '🥜 Proteinquellen',
    dairy: '🥛 Milchalternativen',
    bakery: '🍞 Backwaren',
    cheese: '🧀 Käse',
    meat: '🥩 Fleisch & Alternativen',
    spices: '🧂 Gewürze & Öle',
    frozen: '❄️ Tiefkühl',
    household: '🧹 Haushalt',
    other: '📦 Sonstiges',
  }
  return labels[category] ?? category
}

/**
 * Calculates progress bar string for shopping list.
 */
export function renderProgressBar(
  checked: number,
  total: number,
  width = 20,
): string {
  if (total === 0) return ''
  const pct = Math.round((checked / total) * 100)
  const filled = Math.round((checked / total) * width)
  const empty = width - filled
  return `[${'█'.repeat(filled)}${'░'.repeat(empty)}] ${pct}% (${checked}/${total})`
}

/**
 * Generates a German weekday label from an ISO date string.
 */
export function getWeekdayLabel(date: string): string {
  const days = [
    'Sonntag',
    'Montag',
    'Dienstag',
    'Mittwoch',
    'Donnerstag',
    'Freitag',
    'Samstag',
  ]
  const d = new Date(date)
  return days[d.getDay()] ?? ''
}
