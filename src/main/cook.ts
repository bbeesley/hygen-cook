import { readFile } from 'async-fs-wrapper';
import { load } from 'js-yaml';

import { type CookArgs, type Recipe } from './@types';
import { addIngredients } from './add-ingredients';
import { execInstructions } from './exec-instructions';

/**
 * Parses recipe file from YAML to Recipe object.
 *
 * @param {string} recipePath The path to the recipe.
 *
 * @returns {Promise<Recipe>} Parsed recipe.
 */
async function getRecipe(recipePath: string): Promise<Recipe> {
  try {
    const recipeContent = await readFile(recipePath, { encoding: 'utf8' });
    return load(recipeContent) as Recipe;
  } catch (error) {
    console.error(`Unable to load recipe from ${recipePath}`, error);
    throw error as Error;
  }
}

/**
 * Cooks the recipe in path.
 *
 * @param {CookArgs} args
 * @param {string} args.recipePath The recipe path.
 * @param {boolean} args.shouldOverwriteTemplates Flags if it should overwrite ingredients templates.
 *
 * @returns {Promise<void>}
 */
export async function cook({
  recipePath,
  shouldOverwriteTemplates,
}: CookArgs): Promise<void> {
  const { ingredients = [], instructions = [] } = await getRecipe(recipePath);
  await addIngredients(ingredients, { shouldOverwriteTemplates });
  await execInstructions(instructions);
}
