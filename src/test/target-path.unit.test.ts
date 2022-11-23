import { readdir, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import test from 'ava';
import execa from 'execa';
import { dump } from 'js-yaml';
import { stub } from 'sinon';

import { cook } from '../main/cook';

const execOptions = {
  cwd: resolve(__dirname, 'target-path-test-output'),
  timeout: 30e3,
};

stub(process, 'cwd').callsFake(() => execOptions.cwd);
stub(console, 'error');
stub(console, 'log');
stub(console, 'info');

test.serial.beforeEach(async () => {
  await execa('rm', ['-Rf', 'target-path-test-output'], {
    shell: true,
    cwd: __dirname,
  });
  await execa('mkdir', ['-p', 'target-path-test-output'], {
    shell: true,
    cwd: __dirname,
  });
});

test.serial.afterEach(async () => {
  await execa('rm', ['-Rf', 'target-path-test-output'], {
    shell: true,
    cwd: __dirname,
  });
});

test.serial('allows not setting a non standard target path', async (t) => {
  const recipe = {
    name: 'testing',
    ingredients: ['hygen-react-ts'],
    instructions: [
      {
        ingredient: 'hygen-react-ts',
        generator: 'feature',
        action: 'new',
        args: [
          {
            option: 'Name',
            value: 'testing',
          },
        ],
      },
    ],
  };
  const yamlRecipe = dump(recipe);
  await writeFile(resolve(execOptions.cwd, 'recipe.yml'), yamlRecipe);
  await cook({
    recipePath: resolve(execOptions.cwd, 'recipe.yml'),
    shouldOverwriteTemplates: false,
  });
  const filesList = await readdir(resolve(execOptions.cwd, 'src/testing'));
  t.true(filesList.length > 1);
  t.deepEqual(filesList, ['components', 'contexts', 'hooks']);
});

test.serial('allows setting a non standard target path', async (t) => {
  const recipe = {
    name: 'testing',
    ingredients: ['hygen-react-ts'],
    instructions: [
      {
        ingredient: 'hygen-react-ts',
        generator: 'feature',
        action: 'new',
        basePath: 'deep',
        args: [
          {
            option: 'Name',
            value: 'testing',
          },
        ],
      },
    ],
  };
  const yamlRecipe = dump(recipe);
  await writeFile(resolve(execOptions.cwd, 'recipe.yml'), yamlRecipe);
  await cook({
    recipePath: resolve(execOptions.cwd, 'recipe.yml'),
    shouldOverwriteTemplates: false,
  });
  const filesList = await readdir(resolve(execOptions.cwd, 'deep/src/testing'));
  t.true(filesList.length > 1);
  t.deepEqual(filesList, ['components', 'contexts', 'hooks']);
});
