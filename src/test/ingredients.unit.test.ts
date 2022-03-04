import test from 'ava';
import execa from 'execa';
import { readdir, writeFile } from 'fs/promises';
import { dump } from 'js-yaml';
import { resolve } from 'path';
import sinon from 'sinon';
import { cook } from '../main/cook';

const execOpts = {
  cwd: resolve(__dirname, 'ingredients-test-output'),
  timeout: 30e3,
};

sinon.stub(process, 'cwd').callsFake(() => execOpts.cwd);

test.beforeEach(async () => {
  await execa('rm', ['-Rf', 'ingredients-test-output'], {
    shell: true,
    cwd: __dirname,
  });
  await execa('mkdir', ['-p', 'ingredients-test-output'], {
    shell: true,
    cwd: __dirname,
  });
});

test.afterEach(async () => {
  await execa('rm', ['-Rf', 'ingredients-test-output'], {
    shell: true,
    cwd: __dirname,
  });
});

test.serial('imports ingredients from npm modules', async (t) => {
  const recipe = {
    name: 'testing',
    ingredients: ['hygen-emiketic-react'],
    instructions: [
      {
        ingredient: 'hygen-emiketic-react',
        generator: 'react-native-component',
        action: 'new',
        args: [
          {
            option: 'name',
            value: 'testing',
          },
          {
            option: 'feature',
            value: 'test-feature',
          },
        ],
      },
    ],
  };
  const yamlRecipe = dump(recipe);
  await writeFile(resolve(execOpts.cwd, 'recipe.yml'), yamlRecipe);
  await cook({
    recipePath: resolve(execOpts.cwd, 'recipe.yml'),
    shouldOverwriteTemplates: true,
  });
  const filesList = await readdir(
    resolve(execOpts.cwd, 'src/features/TestFeature/Testing'),
  );
  t.true(filesList.length > 1);
  t.deepEqual(filesList, [
    'Testing.js',
    'Testing.stories.js',
    '__tests__',
    'index.js',
    'styles',
  ]);
});

test.serial('imports ingredients from git repos', async (t) => {
  const recipe = {
    name: 'testing',
    ingredients: ['https://github.com/emiketic/hygen-emiketic-react'],
    instructions: [
      {
        ingredient: 'hygen-emiketic-react',
        generator: 'react-native-component',
        action: 'new',
        args: [
          {
            option: 'name',
            value: 'testing',
          },
          {
            option: 'feature',
            value: 'test-feature',
          },
        ],
      },
    ],
  };
  const yamlRecipe = dump(recipe);
  await writeFile(resolve(execOpts.cwd, 'recipe.yml'), yamlRecipe);
  await cook({
    recipePath: resolve(execOpts.cwd, 'recipe.yml'),
    shouldOverwriteTemplates: true,
  });
  const filesList = await readdir(
    resolve(execOpts.cwd, 'src/features/TestFeature/Testing'),
  );
  t.true(filesList.length > 1);
  t.deepEqual(filesList, [
    'Testing.js',
    'Testing.stories.js',
    '__tests__',
    'index.js',
    'styles',
  ]);
});
