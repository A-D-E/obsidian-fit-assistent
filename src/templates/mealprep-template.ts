import { t } from '../i18n'
import type { MealPrepPlan, MealSlot, Recipe } from '../types'
import {
  formatDate,
  getWeekdayLabel,
  renderFrontmatter,
  renderTable,
} from './template-utils'

/**
 * Renders a MealPrep Plan as a Markdown document.
 * Needs a recipe lookup map to resolve recipe_id -> recipe title.
 */
export function renderMealprepPlan(
  plan: MealPrepPlan,
  recipeMap: Map<string, Recipe>,
): string {
  const sections: string[] = []

  // Frontmatter
  sections.push(
    renderFrontmatter({
      id: plan.id,
      status: plan.status,
      duration: `${plan.duration} ${t('tpl.days_suffix')}`,
      start: plan.start_date,
      end: plan.end_date,
      synced: new Date().toISOString(),
    }),
  )

  const title = plan.name ?? `${t('tpl.mealprep.fallback_title')} ${formatDate(plan.start_date)} – ${formatDate(plan.end_date)}`
  sections.push(`# ${title}`)

  // Status badge
  const statusLabels: Record<string, string> = {
    planning: t('tpl.mealprep.status_planning'),
    active: t('tpl.mealprep.status_active'),
    completed: t('tpl.mealprep.status_completed'),
    cancelled: t('tpl.mealprep.status_cancelled'),
  }
  sections.push(`**${t('tpl.status')}:** ${statusLabels[plan.status] ?? plan.status}`)

  // Days
  if (plan.days && plan.days.length > 0) {
    sections.push(`## ${t('tpl.mealprep.daily_plan')}`)

    for (const day of plan.days) {
      const weekday = getWeekdayLabel(day.date)
      sections.push(`### ${weekday}, ${formatDate(day.date)}`)

      if (day.is_rest_day) {
        sections.push(`*${t('tpl.mealprep.rest_day')}*`)
        continue
      }

      const mealRows: string[][] = []

      if (day.meals.breakfast) {
        mealRows.push(renderMealSlotRow(t('tpl.mealprep.breakfast'), day.meals.breakfast, recipeMap))
      }
      if (day.meals.lunch) {
        mealRows.push(renderMealSlotRow(t('tpl.mealprep.lunch'), day.meals.lunch, recipeMap))
      }
      if (day.meals.dinner) {
        mealRows.push(renderMealSlotRow(t('tpl.mealprep.dinner'), day.meals.dinner, recipeMap))
      }
      if (day.meals.snacks && day.meals.snacks.length > 0) {
        for (const snack of day.meals.snacks) {
          mealRows.push(renderMealSlotRow(t('tpl.mealprep.snack'), snack, recipeMap))
        }
      }

      if (mealRows.length > 0) {
        sections.push(
          renderTable(
            [t('tpl.daily.meal'), t('tpl.mealprep.recipe'), t('tpl.mealprep.portions'), t('tpl.mealprep.info')],
            mealRows,
          ),
        )
      }

      if (day.prep_instructions) {
        sections.push(`> **${t('tpl.mealprep.preparation')}:** ${day.prep_instructions}`)
      }
    }
  }

  // Shopping list
  if (plan.shopping_list && plan.shopping_list.length > 0) {
    sections.push(`## ${t('tpl.mealprep.shopping_list')}`)

    const checked = plan.shopping_list.filter((i) => i.checked).length
    const total = plan.shopping_list.length
    sections.push(`**${t('tpl.progress')}:** ${checked}/${total}`)

    for (const item of plan.shopping_list) {
      const checkbox = item.checked ? '- [x]' : '- [ ]'
      sections.push(
        `${checkbox} ${item.quantity} ${item.unit} ${item.ingredient}`,
      )
    }
  }

  // Feedback
  if (plan.feedback) {
    sections.push(`## ${t('tpl.mealprep.feedback')}`)
    const fb = plan.feedback
    sections.push(`- **${t('tpl.mealprep.rating')}:** ${'⭐'.repeat(fb.overall_rating)}`)

    const portionLabels: Record<string, string> = {
      too_little: t('tpl.mealprep.too_little'),
      perfect: t('tpl.mealprep.perfect'),
      too_much: t('tpl.mealprep.too_much'),
    }
    sections.push(
      `- **${t('tpl.mealprep.portions_feedback')}:** ${portionLabels[fb.portion_feedback]}`,
    )

    if (fb.time_issues) {
      sections.push(`- **${t('tpl.mealprep.time_issues')}:** ${t('tpl.mealprep.yes')}`)
    }
    if (fb.storage_issues) {
      sections.push(`- **${t('tpl.mealprep.storage')}:** ${fb.storage_issues}`)
    }
    if (fb.freeform_notes) {
      sections.push(`- **${t('tpl.notes')}:** ${fb.freeform_notes}`)
    }
  }

  return sections.join('\n\n')
}

function renderMealSlotRow(
  label: string,
  slot: MealSlot,
  recipeMap: Map<string, Recipe>,
): string[] {
  const recipe = recipeMap.get(slot.recipe_id)
  const recipeName = recipe?.title ?? slot.recipe_id

  const infoParts: string[] = []
  if (slot.is_leftover) {
    infoParts.push(t('tpl.mealprep.leftover'))
  }
  if (slot.is_cooked) {
    infoParts.push(t('tpl.mealprep.cooked'))
  }

  return [label, recipeName, String(slot.portions), infoParts.join(' ') || '–']
}
