import test from 'ava';
import execa from 'execa';
import { readdir, writeFile } from 'fs/promises';
import { dump } from 'js-yaml';
import { resolve } from 'path';
import sinon from 'sinon';

import { cook } from '../main/cook';

const execOpts = {
  cwd: resolve(__dirname, 'target-path-test-output'),
  timeout: 30e3,
};

sinon.stub(process, 'cwd').callsFake(() => execOpts.cwd);
sinon.stub(console, 'error');
sinon.stub(console, 'log');
sinon.stub(console, 'info');

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

test.afterEach(async () => {
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
  await writeFile(resolve(execOpts.cwd, 'recipe.yml'), yamlRecipe);
  await cook({
    recipePath: resolve(execOpts.cwd, 'recipe.yml'),
    shouldOverwriteTemplates: false,
  });
  const filesList = await readdir(resolve(execOpts.cwd, 'src/testing'));
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
  await writeFile(resolve(execOpts.cwd, 'recipe.yml'), yamlRecipe);
  await cook({
    recipePath: resolve(execOpts.cwd, 'recipe.yml'),
    shouldOverwriteTemplates: false,
  });
  const filesList = await readdir(resolve(execOpts.cwd, 'deep/src/testing'));
  t.true(filesList.length > 1);
  t.deepEqual(filesList, ['components', 'contexts', 'hooks']);
});
