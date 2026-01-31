import { t } from '../i18n'
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

  sections.push(`# ${t('tpl.profile.title')}`)

  // Personal info
  sections.push(`## ${t('tpl.profile.personal')}`)
  const personalRows: string[][] = []

  if (profile.first_name || profile.last_name) {
    personalRows.push([
      t('tpl.profile.name'),
      [profile.first_name, profile.last_name].filter(Boolean).join(' '),
    ])
  }
  if (profile.display_name) {
    personalRows.push([t('tpl.profile.display_name'), profile.display_name])
  }
  if (profile.email) {
    personalRows.push([t('tpl.profile.email'), profile.email])
  }
  if (profile.age) {
    personalRows.push([t('tpl.profile.age'), `${profile.age} ${t('tpl.years_suffix')}`])
  }
  if (profile.gender) {
    const genderLabel =
      profile.gender === 'male'
        ? t('tpl.profile.male')
        : profile.gender === 'female'
          ? t('tpl.profile.female')
          : t('tpl.profile.diverse')
    personalRows.push([t('tpl.profile.gender'), genderLabel])
  }
  if (profile.height) {
    personalRows.push([t('tpl.profile.height'), `${profile.height} cm`])
  }
  if (profile.occupation) {
    personalRows.push([t('tpl.profile.occupation'), profile.occupation])
  }
  if (profile.dietary_preference) {
    const dietLabel =
      profile.dietary_preference === 'vegan'
        ? t('tpl.profile.vegan')
        : profile.dietary_preference === 'vegetarian'
          ? t('tpl.profile.vegetarian')
          : t('tpl.profile.omnivore')
    personalRows.push([t('tpl.profile.diet'), dietLabel])
  }
  if (profile.activity_level) {
    const activityLabels: Record<string, string> = {
      sedentary: t('tpl.profile.sedentary'),
      light: t('tpl.profile.light'),
      moderate: t('tpl.profile.moderate'),
      active: t('tpl.profile.active'),
    }
    personalRows.push([
      t('tpl.profile.activity'),
      activityLabels[profile.activity_level] ?? profile.activity_level,
    ])
  }

  if (personalRows.length > 0) {
    sections.push(renderTable([t('tpl.field'), t('tpl.value')], personalRows))
  }

  // Weight & Goals
  sections.push(`## ${t('tpl.profile.weight_goals')}`)
  const goalRows: string[][] = []

  if (profile.current_weight) {
    goalRows.push([
      t('tpl.profile.current_weight'),
      `${formatNumber(profile.current_weight)} kg`,
    ])
  }
  if (profile.target_weight) {
    goalRows.push([t('tpl.profile.target_weight'), `${formatNumber(profile.target_weight)} kg`])
  }
  if (profile.goal) {
    const goalLabel =
      profile.goal === 'lose'
        ? t('tpl.profile.lose')
        : profile.goal === 'maintain'
          ? t('tpl.profile.maintain')
          : t('tpl.profile.gain')
    goalRows.push([t('tpl.profile.goal'), goalLabel])
  }
  if (profile.weight_loss_per_month) {
    goalRows.push([
      t('tpl.profile.per_month'),
      `${formatNumber(profile.weight_loss_per_month)} kg`,
    ])
  }
  if (profile.target_date) {
    goalRows.push([t('tpl.profile.target_date'), profile.target_date])
  }

  if (goalRows.length > 0) {
    sections.push(renderTable([t('tpl.field'), t('tpl.value')], goalRows))
  }

  // Strategy
  if (profile.strategy) {
    sections.push(`## ${t('tpl.profile.strategy')}`)
    sections.push(
      renderTable(
        [t('tpl.profile.cal_day'), t('tpl.protein'), t('tpl.fat'), t('tpl.carbs')],
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
    sections.push(`## ${t('tpl.profile.water_settings')}`)
    const waterRows: string[][] = [
      [t('tpl.profile.daily_goal'), `${profile.water_settings.daily_goal} ml`],
      [
        t('tpl.profile.reminders'),
        profile.water_settings.reminder_enabled ? t('tpl.profile.reminder_active') : t('tpl.profile.reminder_inactive'),
      ],
    ]
    if (profile.water_settings.reminder_interval) {
      waterRows.push([
        t('tpl.profile.interval'),
        `${profile.water_settings.reminder_interval} ${t('tpl.min_suffix')}`,
      ])
    }
    if (profile.water_settings.start_time && profile.water_settings.end_time) {
      waterRows.push([
        t('tpl.profile.timeframe'),
        `${profile.water_settings.start_time} – ${profile.water_settings.end_time}`,
      ])
    }
    sections.push(renderTable([t('tpl.field'), t('tpl.value')], waterRows))
  }

  return sections.join('\n\n')
}
