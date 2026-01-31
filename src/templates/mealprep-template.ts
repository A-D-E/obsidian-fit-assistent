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
      duration: `${plan.duration} Tage`,
      start: plan.start_date,
      end: plan.end_date,
      synced: new Date().toISOString(),
    }),
  )

  const title = plan.name ?? `Mealprep ${formatDate(plan.start_date)} – ${formatDate(plan.end_date)}`
  sections.push(`# ${title}`)

  // Status badge
  const statusLabels: Record<string, string> = {
    planning: '📝 Planung',
    active: '🟢 Aktiv',
    completed: '✅ Abgeschlossen',
    cancelled: '❌ Abgebrochen',
  }
  sections.push(`**Status:** ${statusLabels[plan.status] ?? plan.status}`)

  // Days
  if (plan.days && plan.days.length > 0) {
    sections.push('## Tagesplan')

    for (const day of plan.days) {
      const weekday = getWeekdayLabel(day.date)
      sections.push(`### ${weekday}, ${formatDate(day.date)}`)

      if (day.is_rest_day) {
        sections.push('*Ruhetag – keine Mahlzeiten geplant*')
        continue
      }

      const mealRows: string[][] = []

      if (day.meals.breakfast) {
        mealRows.push(renderMealSlotRow('Frühstück', day.meals.breakfast, recipeMap))
      }
      if (day.meals.lunch) {
        mealRows.push(renderMealSlotRow('Mittagessen', day.meals.lunch, recipeMap))
      }
      if (day.meals.dinner) {
        mealRows.push(renderMealSlotRow('Abendessen', day.meals.dinner, recipeMap))
      }
      if (day.meals.snacks && day.meals.snacks.length > 0) {
        for (const snack of day.meals.snacks) {
          mealRows.push(renderMealSlotRow('Snack', snack, recipeMap))
        }
      }

      if (mealRows.length > 0) {
        sections.push(
          renderTable(
            ['Mahlzeit', 'Rezept', 'Portionen', 'Info'],
            mealRows,
          ),
        )
      }

      if (day.prep_instructions) {
        sections.push(`> **Vorbereitung:** ${day.prep_instructions}`)
      }
    }
  }

  // Shopping list
  if (plan.shopping_list && plan.shopping_list.length > 0) {
    sections.push('## Einkaufsliste')

    const checked = plan.shopping_list.filter((i) => i.checked).length
    const total = plan.shopping_list.length
    sections.push(`**Fortschritt:** ${checked}/${total}`)

    for (const item of plan.shopping_list) {
      const checkbox = item.checked ? '- [x]' : '- [ ]'
      sections.push(
        `${checkbox} ${item.quantity} ${item.unit} ${item.ingredient}`,
      )
    }
  }

  // Feedback
  if (plan.feedback) {
    sections.push('## Feedback')
    const fb = plan.feedback
    sections.push(`- **Bewertung:** ${'⭐'.repeat(fb.overall_rating)}`)

    const portionLabels = {
      too_little: 'Zu wenig',
      perfect: 'Perfekt',
      too_much: 'Zu viel',
    }
    sections.push(
      `- **Portionen:** ${portionLabels[fb.portion_feedback]}`,
    )

    if (fb.time_issues) {
      sections.push('- **Zeitprobleme:** Ja')
    }
    if (fb.storage_issues) {
      sections.push(`- **Lagerung:** ${fb.storage_issues}`)
    }
    if (fb.freeform_notes) {
      sections.push(`- **Notizen:** ${fb.freeform_notes}`)
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
    infoParts.push('♻️ Reste')
  }
  if (slot.is_cooked) {
    infoParts.push('✅ Gekocht')
  }

  return [label, recipeName, String(slot.portions), infoParts.join(' ') || '–']
}
