import type { Medication } from '../types'
import {
  getMedTypeEmoji,
  renderFrontmatter,
  renderTable,
} from './template-utils'

/**
 * Renders the aggregated Medications list as a Markdown document.
 * Groups by type (medication, vitamin, supplement).
 */
export function renderMedications(medications: Medication[]): string {
  const sections: string[] = []

  // Frontmatter
  const activeMeds = medications.filter((m) => m.is_active)
  sections.push(
    renderFrontmatter({
      synced: new Date().toISOString(),
      total: medications.length,
      active: activeMeds.length,
    }),
  )

  sections.push('# Medikamente & Supplements')

  if (medications.length === 0) {
    sections.push('*Keine Medikamente eingetragen.*')
    return sections.join('\n\n')
  }

  // Group by type
  const groups: Record<string, Medication[]> = {
    medication: [],
    vitamin: [],
    supplement: [],
  }

  for (const med of medications) {
    const type = med.type ?? 'medication'
    if (!groups[type]) groups[type] = []
    groups[type].push(med)
  }

  const typeLabels: Record<string, string> = {
    medication: 'Medikamente',
    vitamin: 'Vitamine',
    supplement: 'Supplemente',
  }

  for (const type of ['medication', 'vitamin', 'supplement'] as const) {
    const meds = groups[type]
    if (!meds || meds.length === 0) continue

    const emoji = getMedTypeEmoji(type)
    const label = typeLabels[type]
    sections.push(`## ${emoji} ${label} (${meds.length})`)

    const headers = ['Name', 'Dosierung', 'Zeiten', 'Erinnerung', 'Status']
    const rows: string[][] = []

    for (const med of meds) {
      const dosage =
        med.dosage && med.dosage_unit
          ? `${med.dosage} ${med.dosage_unit}`
          : med.dosage ?? '–'

      const times =
        med.schedule_times && med.schedule_times.length > 0
          ? med.schedule_times.join(', ')
          : '–'

      const reminder = med.reminder_enabled ? '🔔' : '🔕'
      const status = med.is_active ? '✅ Aktiv' : '⏸️ Pausiert'

      rows.push([med.name, dosage, times, reminder, status])
    }

    sections.push(renderTable(headers, rows))

    // Notes for medications with notes
    const medsWithNotes = meds.filter((m) => m.notes)
    if (medsWithNotes.length > 0) {
      sections.push('### Notizen')
      for (const med of medsWithNotes) {
        sections.push(`- **${med.name}:** ${med.notes}`)
      }
    }
  }

  return sections.join('\n\n')
}
