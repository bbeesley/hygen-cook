import { stat, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import test from 'ava';
import execa from 'execa';
import { dump } from 'js-yaml';
import { stub } from 'sinon';
import { cook } from '../main/cook';

const execOptions = {
  cwd: resolve(__dirname, 'args-test-output'),
  timeout: 30e3,
};

stub(process, 'cwd').callsFake(() => execOptions.cwd);

test.beforeEach(async () => {
  await execa('rm', ['-Rf', 'args-test-output'], {
    shell: true,
    cwd: __dirname,
  });
  await execa('mkdir', ['-p', 'args-test-output'], {
    shell: true,
    cwd: __dirname,
  });
});

test.afterEach(async () => {
  await execa('rm', ['-Rf', 'args-test-output'], {
    shell: true,
    cwd: __dirname,
  });
});

test.serial('converts instructions to hygen args', async (t) => {
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
  await writeFile(resolve(execOptions.cwd, 'recipe.yml'), yamlRecipe);
  await cook({
    recipePath: resolve(execOptions.cwd, 'recipe.yml'),
    shouldOverwriteTemplates: true,
  });
  const dirStatResponse = await stat(
    resolve(execOptions.cwd, 'src/features/TestFeature'),
  );
  t.true(dirStatResponse.isDirectory());
  const fileStatResponse = await stat(
    resolve(execOptions.cwd, 'src/features/TestFeature/Testing/Testing.js'),
  );
  t.true(fileStatResponse.isFile());
});
