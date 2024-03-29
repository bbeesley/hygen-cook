import { resolve, join } from 'node:path';
import { type Arg, type Instruction } from './@types';
import { HYGEN_COOK_DIR } from './constants';
import { runHygen } from './hygen/run-hygen';

/**
 * Prepares arguments for passing them to hygen (--{option-name} {option-value}).
 *
 * @param {Arg[]} args Args to pass to hygen.
 * @param {Arg[]} args[].name Arg name to pass to hygen.
 * @param {Arg[]} agrs[].value Optional. Arg value to pass to hygen.
 *
 * @returns {string[]}
 */
function prepareArgs(args: Arg[]): string[] {
  return args.reduce<string[]>(
    (acc, { option, value }) => [
      ...acc,
      `--${option}`,
      ...(value ? [value] : []),
    ],
    [],
  );
}

/**
 * Gets the ingredient template directory.
 *
 * @param {string} ingredient Ingredient npm package name.
 * @returns {string} Ingredient templates directory.
 */
function getIngredientTemplateDir(ingredient: string): string {
  return join(process.cwd(), HYGEN_COOK_DIR, ingredient, '_templates');
}

/**
 * Executes recipe instruction.
 *
 * @see execInstructions for more info.
 *
 * @param {Instruction} instruction Instruction to execute.
 * @param {string} instruction.ingredient Ingredient npm package name.
 * @param {string} instruction.generator Generator name in the ingredient.
 * @param {string} instruction.action Action name in the generator.
 * @param {Arg[]} instruction.args Instruction arguments.
 * @param {string} instruction.args[].name Arg name to pass to hygen.
 * @param {string} instruction.agrs[].value Optional. Arg value to pass to hygen.
 * @param {string} instruction.basePath Optional. Set the base path where the action is executed.
 *
 * @returns {Promise<void>}
 */
async function execInstruction({
  basePath,
  ingredient,
  generator,
  action,
  args = [],
}: Instruction): Promise<void> {
  const cwd = basePath ? resolve(process.cwd(), basePath) : process.cwd();
  await runHygen([generator, action, ...prepareArgs(args)], {
    cwd,
    templates: getIngredientTemplateDir(ingredient),
  });
}

/**
 * Executes recipe instructions.
 *
 * @param {Instruction} instructions Instructions to execute.
 * @param {string} instructions[].ingredient Ingredient npm package name.
 * @param {string} instructions[].generator Generator name in the ingredient.
 * @param {string} instructions[].action Action name in the generator.
 * @param {Arg[]} instructions[].args Instruction arguments.
 * @param {string} instructions[].args[].name Arg name to pass to hygen.
 * @param {string} instructions[].agrs[].value Optional. Arg value to pass to hygen.
 * @param {string} instructions[].basePath Optional. Used to change the working directory.
 *
 * @returns {Promise<void>}
 */
export async function execInstructions(
  instructions: Instruction[],
): Promise<void> {
  console.log('Executing instructions');
  return instructions.reduce(
    async (promise, instruction) =>
      promise.then(async () => execInstruction(instruction)),
    Promise.resolve(),
  );
}
