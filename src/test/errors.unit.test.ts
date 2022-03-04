import test from 'ava';
import execa from 'execa';
import { writeFile } from 'fs/promises';
import { dump } from 'js-yaml';
import { resolve } from 'path';
import sinon from 'sinon';

import { CliPackageManager } from '../main/@types';
import { cook } from '../main/chef';

const execOpts = {
  cwd: resolve(__dirname, 'errors-test-output'),
  timeout: 30e3,
};

sinon.stub(process, 'cwd').callsFake(() => execOpts.cwd);
const sandbox = sinon.createSandbox();
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
        package: 'react-native-component',
        generator: 'new',
      },
    ],
  };
  const yamlRecipe = dump(recipe);
  await writeFile(resolve(execOpts.cwd, 'recipe.yml'), yamlRecipe);
  await t.throwsAsync(
    cook({
      recipe: resolve(execOpts.cwd, 'recipe.yml'),
      packageManager: CliPackageManager.npm,
    }),
  );
  t.true(consoleErrorStub.calledWith("\n\nCan't add i-do-not-exist\n\n"));
});
test.serial('throws an error if the recipe does not exist', async (t) => {
  await t.throwsAsync(
    cook({
      recipe: resolve(execOpts.cwd, 'recipe.yml'),
      packageManager: CliPackageManager.npm,
    }),
  );
  t.true(
    consoleErrorStub.calledWith(
      `Unable to load recipe from ${resolve(execOpts.cwd, 'recipe.yml')}`,
    ),
  );
});
