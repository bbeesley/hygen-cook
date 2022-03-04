import test from 'ava';
import execa from 'execa';
import { stat, writeFile } from 'fs/promises';
import { dump } from 'js-yaml';
import { resolve } from 'path';
import sinon from 'sinon';

import { CliPackageManager } from '../main/@types';
import { cook } from '../main/chef';

const execOpts = {
  cwd: resolve(__dirname, 'args-test-output'),
  timeout: 30e3,
};

sinon.stub(process, 'cwd').callsFake(() => execOpts.cwd);

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
        package: 'react-native-component',
        generator: 'new',
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
    recipe: resolve(execOpts.cwd, 'recipe.yml'),
    packageManager: CliPackageManager.npm,
  });
  const dirStatRes = await stat(
    resolve(execOpts.cwd, 'src/features/TestFeature'),
  );
  t.true(dirStatRes.isDirectory());
  const fileStatRes = await stat(
    resolve(execOpts.cwd, 'src/features/TestFeature/Testing/Testing.js'),
  );
  t.true(fileStatRes.isFile());
});
