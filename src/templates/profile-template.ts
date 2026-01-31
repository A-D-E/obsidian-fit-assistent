import type { UserProfile } from '../types'
import { formatNumber, renderFrontmatter, renderTable } from './template-utils'

/**
 * Renders a UserProfile as a Markdown document.
 */
export function renderProfile(profile: UserProfile): string {
  const sections: string[] = []

  // Frontmatter
  sections.push(
    renderFrontmatter({
      uid: profile.uid,
      synced: new Date().toISOString(),
    }),
  )

  sections.push('# Profil')

  // Personal info
  sections.push('## Persönliche Daten')
  const personalRows: string[][] = []

  if (profile.first_name || profile.last_name) {
    personalRows.push([
      'Name',
      [profile.first_name, profile.last_name].filter(Boolean).join(' '),
    ])
  }
  if (profile.display_name) {
    personalRows.push(['Anzeigename', profile.display_name])
  }
  if (profile.email) {
    personalRows.push(['E-Mail', profile.email])
  }
  if (profile.age) {
    personalRows.push(['Alter', `${profile.age} Jahre`])
  }
  if (profile.gender) {
    const genderLabel =
      profile.gender === 'male'
        ? 'Männlich'
        : profile.gender === 'female'
          ? 'Weiblich'
          : 'Divers'
    personalRows.push(['Geschlecht', genderLabel])
  }
  if (profile.height) {
    personalRows.push(['Größe', `${profile.height} cm`])
  }
  if (profile.occupation) {
    personalRows.push(['Beruf', profile.occupation])
  }
  if (profile.dietary_preference) {
    const dietLabel =
      profile.dietary_preference === 'vegan'
        ? 'Vegan'
        : profile.dietary_preference === 'vegetarian'
          ? 'Vegetarisch'
          : 'Omnivore'
    personalRows.push(['Ernährung', dietLabel])
  }
  if (profile.activity_level) {
    const activityLabel: Record<string, string> = {
      sedentary: 'Sitzend',
      light: 'Leicht aktiv',
      moderate: 'Moderat aktiv',
      active: 'Sehr aktiv',
    }
    personalRows.push([
      'Aktivitätslevel',
      activityLabel[profile.activity_level] ?? profile.activity_level,
    ])
  }

  if (personalRows.length > 0) {
    sections.push(renderTable(['Feld', 'Wert'], personalRows))
  }

  // Weight & Goals
  sections.push('## Gewicht & Ziele')
  const goalRows: string[][] = []

  if (profile.current_weight) {
    goalRows.push([
      'Aktuelles Gewicht',
      `${formatNumber(profile.current_weight)} kg`,
    ])
  }
  if (profile.target_weight) {
    goalRows.push(['Zielgewicht', `${formatNumber(profile.target_weight)} kg`])
  }
  if (profile.goal) {
    const goalLabel =
      profile.goal === 'lose'
        ? 'Abnehmen'
        : profile.goal === 'maintain'
          ? 'Halten'
          : 'Zunehmen'
    goalRows.push(['Ziel', goalLabel])
  }
  if (profile.weight_loss_per_month) {
    goalRows.push([
      'Pro Monat',
      `${formatNumber(profile.weight_loss_per_month)} kg`,
    ])
  }
  if (profile.target_date) {
    goalRows.push(['Zieldatum', profile.target_date])
  }

  if (goalRows.length > 0) {
    sections.push(renderTable(['Feld', 'Wert'], goalRows))
  }

  // Strategy
  if (profile.strategy) {
    sections.push('## Ernährungsstrategie')
    sections.push(
      renderTable(
        ['Kalorien/Tag', 'Protein', 'Fett', 'Kohlenhydrate'],
        [
          [
            `${profile.strategy.daily_calories} kcal`,
            `${formatNumber(profile.strategy.protein_target)} g`,
            `${formatNumber(profile.strategy.fat_target)} g`,
            `${formatNumber(profile.strategy.carb_target)} g`,
          ],
        ],
        ['right', 'right', 'right', 'right'],
      ),
    )
  }

  // Water settings
  if (profile.water_settings) {
    sections.push('## Wasser-Einstellungen')
    const waterRows: string[][] = [
      ['Tagesziel', `${profile.water_settings.daily_goal} ml`],
      [
        'Erinnerungen',
        profile.water_settings.reminder_enabled ? 'Aktiv' : 'Inaktiv',
      ],
    ]
    if (profile.water_settings.reminder_interval) {
      waterRows.push([
        'Intervall',
        `${profile.water_settings.reminder_interval} Min`,
      ])
    }
    if (profile.water_settings.start_time && profile.water_settings.end_time) {
      waterRows.push([
        'Zeitraum',
        `${profile.water_settings.start_time} – ${profile.water_settings.end_time}`,
      ])
    }
    sections.push(renderTable(['Feld', 'Wert'], waterRows))
  }

  return sections.join('\n\n')
}
