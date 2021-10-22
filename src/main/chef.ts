import { readFile } from 'async-fs-wrapper';
import execSh from 'exec-sh';
import { load } from 'js-yaml';
import { join } from 'path';

import { addPackage } from './add';

type Arg = {
  option: string;
  value?: string;
};
type Instruction = {
  package: string;
  generator: string;
  args: Arg[];
};
type Recipe = {
  name: string;
  ingredients?: string[];
  instructions: Instruction[];
};

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

export async function cook(recipePath: string): Promise<void> {
  const recipeContent = await readFile(recipePath);
  const recipe = load(recipeContent) as Recipe;
  const { ingredients = [] } = recipe;
  console.log('preparing ingredients');
  for (const dep of ingredients) {
    await addPackage(dep);
  }
  const { instructions = [] } = recipe;
  console.log('following instructions');
  for (const step of instructions) {
    console.log(
      `${join(__dirname, '../../node_modules/.bin/')}hygen ${[
        step.package,
        step.generator,
        ...prepareArgs(step.args),
      ].join(' ')}`,
    );
    await execSh.promise(
      `${join(__dirname, '../../node_modules/.bin/')}hygen ${[
        step.package,
        step.generator,
        ...prepareArgs(step.args),
      ].join(' ')}`,
    );
  }
}
