import { writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import test from 'ava';
import execa from 'execa';
import { dump } from 'js-yaml';
import { createSandbox, stub } from 'sinon';
import { cook } from '../main/cook';

const execOptions = {
  cwd: resolve(__dirname, 'errors-test-output'),
  timeout: 30e3,
};

stub(process, 'cwd').callsFake(() => execOptions.cwd);
const sandbox = createSandbox();
let consoleErrorStub = sandbox.stub(console, 'error');

test.serial.beforeEach(async () => {
  sandbox.restore();
  consoleErrorStub = sandbox.stub(console, 'error');
  await execa('rm', ['-Rf', 'errors-test-output'], {
    shell: true,
    cwd: __dirname,
  });
  await execa('mkdir', ['-p', 'errors-test-output'], {
    shell: true,
    cwd: __dirname,
  });
});

test.serial.afterEach(async () => {
  sandbox.restore();
  await execa('rm', ['-Rf', 'errors-test-output'], {
    shell: true,
    cwd: __dirname,
  });
});

test.serial('throws an error if the ingredient does not exist', async (t) => {
  const recipe = {
    name: 'testing',
    ingredients: ['i-do-not-exist'],
    instructions: [
      {
        ingredients: 'i-do-not-exist',
        generator: 'react-native-component',
        action: 'new',
      },
    ],
  };
  const yamlRecipe = dump(recipe);
  await writeFile(resolve(execOptions.cwd, 'recipe.yml'), yamlRecipe);
  await t.throwsAsync(
    cook({
      recipePath: resolve(execOptions.cwd, 'recipe.yml'),
      shouldOverwriteTemplates: true,
    }),
  );
  t.true(consoleErrorStub.calledWith("\n\nCan't add i-do-not-exist\n\n"));
});

test.serial('throws an error if the recipe does not exist', async (t) => {
  await t.throwsAsync(
    cook({
      recipePath: resolve(execOptions.cwd, 'recipe.yml'),
      shouldOverwriteTemplates: true,
    }),
  );
  t.true(
    consoleErrorStub.calledWith(
      `Unable to load recipe from ${resolve(execOptions.cwd, 'recipe.yml')}`,
    ),
  );
});
