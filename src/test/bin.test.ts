import test from 'ava';
import execa from 'execa';
import { readdir, writeFile } from 'fs/promises';
import { dump } from 'js-yaml';
import { resolve } from 'path';
import sinon from 'sinon';

const execOpts = {
  cwd: resolve(__dirname, 'bin-test-output'),
  timeout: 120e3,
};

sinon.stub(process, 'cwd').callsFake(() => execOpts.cwd);
const sandbox = sinon.createSandbox();

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
  await writeFile(resolve(execOpts.cwd, 'recipe.yml'), yamlRecipe);
  const res = await execa(
    resolve(__dirname, '../../dist/bin/hygen-chef.cjs'),
    ['-r', 'recipe.yml'],
    {
      ...execOpts,
    },
  );
  console.error(res.stdout, res.stderr);

  const filesList = await readdir(resolve(execOpts.cwd, 'src/testing'));
  console.error('filesList', filesList);
  t.true(filesList.length > 1);
  t.deepEqual(filesList, ['components', 'contexts', 'hooks']);
});
