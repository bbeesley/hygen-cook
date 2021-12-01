import { readFile } from 'async-fs-wrapper';
import { load } from 'js-yaml';

import { Arg, CliArgs, Recipe } from './@types';
import { addPackage } from './add';
import { Hygen } from './hygen/Hygen';

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
  const recipeContent = await readFile(recipePath);
  const recipe = load(recipeContent) as Recipe;
  const { ingredients = [] } = recipe;
  console.log('preparing ingredients');
  for (const dep of ingredients) {
    await addPackage(dep, packageManager);
  }
  const { instructions = [] } = recipe;
  console.log('following instructions');
  for (const step of instructions) {
    await new Hygen().run([
      step.package,
      step.generator,
      ...prepareArgs(step.args),
    ]);
  }
}
