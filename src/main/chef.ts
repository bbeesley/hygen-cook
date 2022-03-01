import { readFile } from 'async-fs-wrapper';
import { load } from 'js-yaml';
import { resolve } from 'path';

import { Arg, CliArgs, Recipe } from './@types';
import { addPackage } from './add';
import { runHygen } from './hygen/hygen-wrapper';

function prepareArgs(argsOptions: Arg[]): string[] {
  return argsOptions.reduce(
    (acc, { option, value }) => [
      ...acc,
      `--${option}`,
      ...(value ? [value] : []),
    ],
    [] as string[],
  );
}

export async function cook({
  recipe: recipePath,
  packageManager,
}: CliArgs): Promise<void> {
  const recipeContent = await readFile(recipePath, { encoding: 'utf8' });
  const recipe = load(recipeContent) as Recipe;
  const { ingredients = [] } = recipe;
  console.log('preparing ingredients');
  for (const dep of ingredients) {
    await addPackage(dep, packageManager);
  }
  const { instructions = [] } = recipe;
  console.log('following instructions');
  for (const step of instructions) {
    const cwd = step.basePath
      ? resolve(process.cwd(), step.basePath)
      : process.cwd();
    await runHygen([step.package, step.generator, ...prepareArgs(step.args)], {
      cwd,
    });
  }
}
