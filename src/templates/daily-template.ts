import { CROSS_LINKS, dailyNoteLinkPath } from '../constants'
import { t } from '../i18n'
import type {
  DailyData,
  Medication,
  UserProfile,
} from '../types'
import {
  formatDate,
  formatNumber,
  getBPStatus,
  getMedLogEmoji,
  getWeekdayLabel,
  renderFrontmatter,
  renderTable,
} from './template-utils'

/**
 * Returns the adjacent date (prev/next) as a YYYY-MM-DD string.
 * Uses UTC noon to avoid DST edge cases.
 */
function getAdjacentDate(dateStr: string, offsetDays: number): string {
  const date = new Date(`${dateStr}T12:00:00Z`)
  date.setUTCDate(date.getUTCDate() + offsetDays)
  return date.toISOString().slice(0, 10)
}

/**
 * Renders a Daily Note aggregating meals, water, weight, medication logs, and blood pressure.
 */
export function renderDailyNote(
  data: DailyData,
  profile: UserProfile | null,
  medicationMap: Map<string, Medication>,
): string {
  const sections: string[] = []
  const weekday = getWeekdayLabel(data.date)

  // Frontmatter
  sections.push(
    renderFrontmatter({
      date: data.date,
      weekday,
      meals: data.meals.length,
      water_entries: data.waterLogs.length,
      synced: new Date().toISOString(),
    }),
  )

  sections.push(`# ${weekday}, ${formatDate(data.date)}`)

  // --- Weight ---
  if (data.weightLogs.length > 0) {
    sections.push(`## ${t('tpl.daily.weight')}`)
    for (const log of data.weightLogs) {
      sections.push(`**${formatNumber(log.weight)} kg**`)
    }
  }

  // --- Meals ---
  if (data.meals.length > 0) {
    sections.push(`## ${t('tpl.daily.meals')}`)

    const mealRows: string[][] = []
    let totalCal = 0
    let totalProtein = 0
    let totalCarbs = 0
    let totalFat = 0

    for (const meal of data.meals) {
      mealRows.push([
        meal.description,
        `${meal.calories}`,
        `${formatNumber(meal.protein)}`,
        `${formatNumber(meal.carbs)}`,
        `${formatNumber(meal.fat)}`,
      ])
      totalCal += meal.calories
      totalProtein += meal.protein
      totalCarbs += meal.carbs
      totalFat += meal.fat
    }

    // Summary row
    mealRows.push([
      `**${t('tpl.daily.total')}**`,
      `**${totalCal}**`,
      `**${formatNumber(totalProtein)}**`,
      `**${formatNumber(totalCarbs)}**`,
      `**${formatNumber(totalFat)}**`,
    ])

    sections.push(
      renderTable(
        [t('tpl.daily.meal'), 'kcal', t('tpl.daily.protein_g'), t('tpl.daily.carbs_g'), t('tpl.daily.fat_g')],
        mealRows,
        ['left', 'right', 'right', 'right', 'right'],
      ),
    )

    // Goal comparison if strategy exists
    if (profile?.strategy) {
      sections.push(`### ${t('tpl.daily.goal_comparison')}`)
      const strategy = profile.strategy

      const calDiff = totalCal - strategy.daily_calories
      const proteinDiff = totalProtein - strategy.protein_target
      const carbDiff = totalCarbs - strategy.carb_target
      const fatDiff = totalFat - strategy.fat_target

      sections.push(
        renderTable(
          [t('tpl.nutrient'), t('tpl.daily.actual'), t('tpl.daily.goal'), t('tpl.daily.diff')],
          [
            [
              t('tpl.calories'),
              `${totalCal} kcal`,
              `${strategy.daily_calories} kcal`,
              `${calDiff >= 0 ? '+' : ''}${calDiff} kcal`,
            ],
            [
              t('tpl.protein'),
              `${formatNumber(totalProtein)} g`,
              `${formatNumber(strategy.protein_target)} g`,
              `${proteinDiff >= 0 ? '+' : ''}${formatNumber(proteinDiff)} g`,
            ],
            [
              t('tpl.carbs'),
              `${formatNumber(totalCarbs)} g`,
              `${formatNumber(strategy.carb_target)} g`,
              `${carbDiff >= 0 ? '+' : ''}${formatNumber(carbDiff)} g`,
            ],
            [
              t('tpl.fat'),
              `${formatNumber(totalFat)} g`,
              `${formatNumber(strategy.fat_target)} g`,
              `${fatDiff >= 0 ? '+' : ''}${formatNumber(fatDiff)} g`,
            ],
          ],
          ['left', 'right', 'right', 'right'],
        ),
      )
    }
  }

  // --- Water ---
  if (data.waterLogs.length > 0) {
    sections.push(`## ${t('tpl.daily.water')}`)

    const rawTotal = data.waterLogs.reduce((sum, log) => sum + log.amount, 0)
    const goalMl = profile?.water_settings?.daily_goal ?? 2500

    // Water amounts from Supabase may be in liters (e.g. 0.2) while goal is in ml (e.g. 2500)
    const isLiters = rawTotal > 0 && rawTotal < goalMl / 100
    const toMl = (amount: number) => isLiters ? Math.round(amount * 1000) : Math.round(amount)
    const formatWater = (ml: number) => ml >= 1000 ? `${(ml / 1000).toFixed(1)} L` : `${ml} ml`

    const totalMl = toMl(rawTotal)
    const goalDisplay = formatWater(goalMl)
    const pct = Math.round((totalMl / goalMl) * 100)
    sections.push(`**${formatWater(totalMl)}** / ${goalDisplay} (${pct}%)`)

    if (data.waterLogs.length > 1) {
      const waterRows = data.waterLogs.map((log) => [
        formatDate(log.timestamp, 'time'),
        `${toMl(log.amount)} ml`,
      ])
      sections.push(renderTable([t('tpl.time'), t('tpl.amount')], waterRows))
    }
  }

  // --- Medication Logs ---
  if (data.medicationLogs.length > 0) {
    sections.push(`## 💊 [[${CROSS_LINKS.medications}|${t('tpl.meds.type_medication')}]]`)

    const medRows: string[][] = []
    for (const log of data.medicationLogs) {
      const med = medicationMap.get(log.medication_id)
      const medName = med?.name ?? log.medication_id
      const emoji = getMedLogEmoji(log.status)
      const time = log.actual_time ?? log.scheduled_time

      medRows.push([emoji, medName, time, log.status])
    }

    sections.push(
      renderTable(['', t('tpl.daily.medication'), t('tpl.time'), t('tpl.status')], medRows),
    )
  }

  // --- Blood Pressure ---
  if (data.bloodPressureLogs.length > 0) {
    sections.push(`## ${t('tpl.daily.blood_pressure')}`)

    const bpRows: string[][] = []
    for (const log of data.bloodPressureLogs) {
      const time = formatDate(log.measured_at, 'time')
      const bp = getBPStatus(log.systolic, log.diastolic)
      const pulse = log.pulse != null ? `${log.pulse} bpm` : '–'
      const period = log.period
        ? log.period === 'morning'
          ? '🌅'
          : log.period === 'evening'
            ? '🌙'
            : '🕐'
        : ''

      bpRows.push([
        `${period} ${time}`,
        `${log.systolic}/${log.diastolic}`,
        `${bp.emoji} ${bp.label}`,
        pulse,
      ])

      if (log.notes) {
        bpRows.push(['', `*${log.notes}*`, '', ''])
      }
    }

    sections.push(
      renderTable([t('tpl.time'), t('tpl.daily.bp_value'), t('tpl.daily.rating'), t('tpl.daily.pulse')], bpRows),
    )
  }

  // Empty state
  if (
    data.meals.length === 0 &&
    data.waterLogs.length === 0 &&
    data.weightLogs.length === 0 &&
    data.medicationLogs.length === 0 &&
    data.bloodPressureLogs.length === 0
  ) {
    sections.push(`*${t('tpl.daily.no_data')}*`)
  }

  // --- Navigation ---
  const prevDate = getAdjacentDate(data.date, -1)
  const nextDate = getAdjacentDate(data.date, 1)
  const prevLink = `[[${dailyNoteLinkPath(prevDate)}|← ${prevDate}]]`
  const nextLink = `[[${dailyNoteLinkPath(nextDate)}|${nextDate} →]]`
  const overviewLink = `[[${CROSS_LINKS.trackerOverview}|📊 Übersicht]]`

  sections.push(`---\n${prevLink} | ${overviewLink} | ${nextLink}`)

  return sections.join('\n\n')
}
