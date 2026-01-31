import type { Recipe, StructuredIngredient } from '../types'
import {
  formatDate,
  formatNumber,
  renderFrontmatter,
  renderTable,
} from './template-utils'

/**
 * Renders a Recipe as a full Markdown document.
 */
export function renderRecipe(recipe: Recipe): string {
  const sections: string[] = []

  // Frontmatter
  sections.push(
    renderFrontmatter({
      id: recipe.id,
      type: recipe.type ?? 'generated',
      calories: recipe.calories,
      protein: recipe.protein,
      carbs: recipe.carbs,
      fat: recipe.fat,
      tags: recipe.tags,
      created: formatDate(recipe.created_at),
      favorite: recipe.is_favorite ?? false,
      visibility: recipe.visibility,
    }),
  )

  // Title
  sections.push(`# ${recipe.title || 'Unbekanntes Rezept'}`)

  // Description
  if (recipe.description) {
    sections.push(`> ${recipe.description}`)
  }

  // Metadata line
  const metaParts: string[] = []
  if (recipe.preparation_time) {
    metaParts.push(`⏱️ ${recipe.preparation_time} Min`)
  }
  if (recipe.total_weight) {
    metaParts.push(`⚖️ ${recipe.total_weight}`)
  }
  if (recipe.is_favorite) {
    metaParts.push('⭐ Favorit')
  }
  if (metaParts.length > 0) {
    sections.push(metaParts.join(' | '))
  }

  // Nutrition overview
  sections.push('## Nährwerte')
  sections.push(
    renderTable(
      ['Kalorien', 'Protein', 'Kohlenhydrate', 'Fett'],
      [
        [
          `${recipe.calories} kcal`,
          `${formatNumber(recipe.protein)} g`,
          `${formatNumber(recipe.carbs)} g`,
          `${formatNumber(recipe.fat)} g`,
        ],
      ],
      ['right', 'right', 'right', 'right'],
    ),
  )

  // Extended micros
  const extendedMicros: string[][] = []
  if (recipe.fiber !== undefined) {
    extendedMicros.push(['Ballaststoffe', `${formatNumber(recipe.fiber)} g`])
  }
  if (recipe.sugar !== undefined) {
    extendedMicros.push(['Zucker', `${formatNumber(recipe.sugar)} g`])
  }
  if (recipe.salt !== undefined) {
    extendedMicros.push(['Salz', `${formatNumber(recipe.salt)} g`])
  }
  if (recipe.zinc !== undefined) {
    extendedMicros.push(['Zink', `${formatNumber(recipe.zinc)} mg`])
  }

  if (extendedMicros.length > 0) {
    sections.push(renderTable(['Nährstoff', 'Menge'], extendedMicros))
  }

  // Micros highlights
  if (recipe.micros_highlights && recipe.micros_highlights.length > 0) {
    sections.push('### Mikronährstoff-Highlights')
    for (const micro of recipe.micros_highlights) {
      sections.push(`- **${micro.name}** (${micro.amount}): ${micro.benefit}`)
    }
  }

  // Ingredients
  sections.push('## Zutaten')
  if (recipe.ingredients && recipe.ingredients.length > 0) {
    if (isStructuredIngredients(recipe.ingredients)) {
      for (const ing of recipe.ingredients) {
        sections.push(`- ${ing.amount} ${ing.item}`)
      }
    } else {
      for (const ing of recipe.ingredients as string[]) {
        sections.push(`- ${ing}`)
      }
    }
  }

  // Instructions
  sections.push('## Zubereitung')
  if (recipe.instructions && recipe.instructions.length > 0) {
    recipe.instructions.forEach((step, i) => {
      sections.push(`${i + 1}. ${step}`)
    })
  }

  // Meta info
  if (recipe.meta) {
    if (recipe.meta.activity_context) {
      sections.push('## Aktivitäts-Kontext')
      sections.push(recipe.meta.activity_context)
    }
    if (recipe.meta.carb_stretch_technique) {
      sections.push('## Carb-Stretch Technik')
      sections.push(recipe.meta.carb_stretch_technique)
    }
  }

  // Tags
  if (recipe.tags && recipe.tags.length > 0) {
    sections.push('---')
    sections.push(`Tags: ${recipe.tags.map((t) => `#${t}`).join(' ')}`)
  }

  return sections.join('\n\n')
}

function isStructuredIngredients(
  ingredients: unknown[],
): ingredients is StructuredIngredient[] {
  return (
    ingredients.length > 0 &&
    typeof ingredients[0] === 'object' &&
    ingredients[0] !== null &&
    'item' in ingredients[0]
  )
}
