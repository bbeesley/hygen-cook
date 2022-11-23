import { readdir, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { readFile } from 'async-fs-wrapper';
import test from 'ava';
import execa from 'execa';
import { dump } from 'js-yaml';
import { stub } from 'sinon';
import { cook } from '../main/cook';

const execOptions = {
  cwd: resolve(__dirname, 'ingredients-test-output'),
  timeout: 30e3,
};

stub(process, 'cwd').callsFake(() => execOptions.cwd);

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
  await writeFile(resolve(execOptions.cwd, 'recipe.yml'), yamlRecipe);
  await cook({
    recipePath: resolve(execOptions.cwd, 'recipe.yml'),
    shouldOverwriteTemplates: true,
  });
  const filesList = await readdir(
    resolve(execOptions.cwd, 'src/features/TestFeature/Testing'),
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

test.serial('supports anchors in recipes', async (t) => {
  const yamlRecipe = `
name: &name testing
ingredients:
  - &module hygen-emiketic-react
instructions:
  - ingredient: *module
    generator: react-native-component
    action: new
    args:
      - option: name
        value: *name
      - option: feature
        value: test-feature
`;
  await writeFile(resolve(execOptions.cwd, 'recipe.yml'), yamlRecipe);
  await cook({
    recipePath: resolve(execOptions.cwd, 'recipe.yml'),
    shouldOverwriteTemplates: true,
  });
  const filesList = await readdir(
    resolve(execOptions.cwd, 'src/features/TestFeature/Testing'),
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

test.serial(
  "adds a pseudo package json so that hygen doesn't throw an error reading ts prompt files in es modules",
  async (t) => {
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
    const pkg = await readFile(
      resolve(execOptions.cwd, '_hygencook/package.json'),
      { encoding: 'utf8' },
    );
    t.deepEqual(JSON.parse(pkg), {
      type: 'commonjs',
    });
  },
);

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
  await writeFile(resolve(execOptions.cwd, 'recipe.yml'), yamlRecipe);
  await cook({
    recipePath: resolve(execOptions.cwd, 'recipe.yml'),
    shouldOverwriteTemplates: true,
  });
  const filesList = await readdir(
    resolve(execOptions.cwd, 'src/features/TestFeature/Testing'),
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

test.serial('adds a gitignore file if one does not exist', async (t) => {
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
  const filesList = await readdir(resolve(execOptions.cwd));
  t.true(filesList.includes('.gitignore'));
  const gitignore = await readFile(resolve(execOptions.cwd, '.gitignore'), {
    encoding: 'utf8',
  });
  t.regex(gitignore, /_hygencook/);
});

test.serial('adds entry to existing gitignore file', async (t) => {
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
  await writeFile(
    resolve(execOptions.cwd, '.gitignore'),
    'path/to\nexisting/**\n/ignorable-stuff',
  );
  await cook({
    recipePath: resolve(execOptions.cwd, 'recipe.yml'),
    shouldOverwriteTemplates: true,
  });
  const gitignore = await readFile(resolve(execOptions.cwd, '.gitignore'), {
    encoding: 'utf8',
  });
  t.regex(gitignore, /_hygencook/);
});

test.serial(
  'does not add entry to existing gitignore file if already exists',
  async (t) => {
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
    await writeFile(
      resolve(execOptions.cwd, '.gitignore'),
      'path/to\nexisting/**\n_hygencook\n/ignorable-stuff',
    );
    await cook({
      recipePath: resolve(execOptions.cwd, 'recipe.yml'),
      shouldOverwriteTemplates: true,
    });
    const gitignore = await readFile(resolve(execOptions.cwd, '.gitignore'), {
      encoding: 'utf8',
    });
    t.true((gitignore.match(/_hygencook/gm) ?? []).length === 1);
  },
);
