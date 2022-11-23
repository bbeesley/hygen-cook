import { readdir, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import test from 'ava';
import execa from 'execa';
import { dump } from 'js-yaml';
import { createSandbox, stub } from 'sinon';

const execOptions = {
  cwd: resolve(__dirname, 'bin-test-output'),
  timeout: 120e3,
};

stub(process, 'cwd').callsFake(() => execOptions.cwd);
const sandbox = createSandbox();

test.serial.beforeEach(async () => {
  sandbox.restore();
  await execa('rm', ['-Rf', 'bin-test-output'], {
    shell: true,
    cwd: __dirname,
  });
  await execa('mkdir', ['-p', 'bin-test-output'], {
    shell: true,
    cwd: __dirname,
  });
});

test.serial.afterEach(async () => {
  sandbox.restore();
  await execa('rm', ['-Rf', 'bin-test-output'], {
    shell: true,
    cwd: __dirname,
  });
});

test.serial('passes the expected arguments to the cook function', async (t) => {
  t.timeout(120e3);
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
  const response = await execa(
    resolve(__dirname, '../../dist/bin/hygen-chef.cjs'),
    ['-r', 'recipe.yml'],
    {
      ...execOptions,
    },
  );
  console.error(response.stdout, response.stderr);

  const filesList = await readdir(resolve(execOptions.cwd, 'src/testing'));
  console.error('filesList', filesList);
  t.true(filesList.length > 1);
  t.deepEqual(filesList, ['components', 'contexts', 'hooks']);
});
