import { mkdir } from 'async-fs-wrapper';
import { green, yellow } from 'chalk';
import execa from 'execa';
import { writeFile, readFile } from 'fs/promises';
import fs from 'fs-extra';
import ora from 'ora';
import { join, dirname } from 'path';
import { NpmPackage, CookArgs } from './@types';
import { HYGEN_COOK_DIR } from './constants';
import { limitConcurrency } from './limit-concurency';

/**
 * Converts the ingredient to an npm package.
 *
 * An ingredient can either be a repo url or a npm package name.
 * In case it's a repo url, the npm package name will be deduced by splitting
 * the url on '/' and extracting the last part. Namespaced package names won't
 * work with repo url approach.
 *
 * @param {string} ingredient The ingredient.
 *
 * @returns {NpmPackage} Resolved npm package.
 */
function resolveNpmPackage(ingredient: string): NpmPackage {
  if (ingredient.match(/^http/)) {
    const url = new URL(ingredient);
    const name = url.href.split('/').pop();
    if (!name) throw new Error(`Invalid URL for ingredient ${ingredient}`);
    return { name, repo: ingredient };
  }
  return { name: ingredient };
}

/**
 * Installs the npm package, without saving it to package.json.
 *
 * @param {Pick<NpmPackage, 'name'>} args.npmPackage The npm package.
 * @param {string} args.npmPackage.name The npm package name.
 *
 * @returns {Promise<void>}
 */
async function installNpmPackage({
  name,
}: Pick<NpmPackage, 'name'>): Promise<void> {
  await execa('npm', ['i', '--no-save', name], {
    shell: true,
    cwd: process.cwd(),
  });
}

/**
 * Creates the hygen cook directory (_hygencook).
 *
 * @returns {Promise<string>} The templates path.
 */
async function createHygenCookDir(): Promise<string> {
  const hygenCookDirPath = join(process.cwd(), HYGEN_COOK_DIR);
  try {
    await mkdir(hygenCookDirPath, {
      recursive: true,
    });
    await writeFile(
      join(hygenCookDirPath, 'package.json'),
      JSON.stringify({
        type: 'commonjs',
      }),
    );
  } catch (err) {
    // no problem if directory exists
  }
  return hygenCookDirPath;
}

async function setGitignore(): Promise<void> {
  const gitignorePath = join(process.cwd(), '.gitignore');
  try {
    const gitignore = await readFile(gitignorePath, { encoding: 'utf8' });
    if ((gitignore.match(/_hygencook/gm) || []).length > 0) {
      return;
    }
  } catch (err) {
    // ignore if the file does not exist
  }
  const ignoreEntry = `\n# hygen-cook build data\n${HYGEN_COOK_DIR}\n`;
  await writeFile(gitignorePath, ignoreEntry, {
    flag: 'a',
  });
}

/**
 * Copies all templates for the npm package namespaced by the npm package name.
 *
 * Note: templates will be copied over to _hygencook/${packageName}/_templates
 *
 * @param {Pick<NpmPackage, 'name'>} npmPackage The npm package.
 * @param {string} npmPackage.name The npm package name.
 * @param {Pick<CookArgs, 'shouldOverwriteTemplates'>} options The options to add ingredients.
 * @param {boolean} options.shouldOverwriteTemplates Flags if it should overwrite ingredients templates.
 *
 * @returns {Promise<void>}
 */
async function copyNpmPackageTemplates(
  { name }: Pick<NpmPackage, 'name'>,
  { shouldOverwriteTemplates }: Pick<CookArgs, 'shouldOverwriteTemplates'>,
): Promise<void> {
  const nodeModuleDir = dirname(
    require.resolve(`${name}/package.json`, {
      paths: [process.cwd()],
    }),
  );
  const hygenCookDir = await createHygenCookDir();
  const sourceTemplateDir = join(nodeModuleDir, '_templates');
  const targetTemplateDir = join(hygenCookDir, name, '_templates');
  const targetPathExists = await fs.pathExists(targetTemplateDir);
  if (!shouldOverwriteTemplates && targetPathExists) {
    console.log(yellow(` skipped: ${name}`));
    return;
  }
  await fs.copy(sourceTemplateDir, targetTemplateDir, {
    recursive: true,
    errorOnExist: false,
    overwrite: true,
  });
  console.log(green(` added: ${name}`));
}

/**
 * Logs that an ingredient couldn't be added.
 *
 * @param {Error} e The error to be logged.
 * @param {NpmPackage} npmPackage The npm package that errored.
 * @param {string} npmPackage.name The npm package name.
 * @param {string} npmPackage.repo Optional. The npm package repo.
 *
 * @returns {void}
 */
function logErrorAddingIngredient(e: Error, { name, repo }: NpmPackage): void {
  console.error(
    `\n\nCan't add ${name}${repo ? ` (source: ${repo})` : ''}\n\n`,
    e,
    e.stack,
  );
}

/**
 * Add ingredient and prepares it to be executed.
 *
 * @see addIngredients for more info.
 *
 * @param {string} ingredient The ingredient to add.
 * @param {Pick<CookArgs, 'shouldOverwriteTemplates'>} options The options to add ingredients.
 * @param {boolean} options[].shouldOverwriteTemplates Flags if it should overwrite ingredients templates.
 *
 * @returns {Promise<void>}
 */
async function addIngredient(
  ingredient: string,
  { shouldOverwriteTemplates }: Pick<CookArgs, 'shouldOverwriteTemplates'>,
): Promise<void> {
  const npmPackage = resolveNpmPackage(ingredient);
  const spinner = ora(`Adding: ${npmPackage.name}`).start();
  try {
    await installNpmPackage(npmPackage);
    await copyNpmPackageTemplates(npmPackage, { shouldOverwriteTemplates });
  } catch (e) {
    logErrorAddingIngredient(e, npmPackage);
  } finally {
    spinner.stop();
  }
}

/**
 * Adds ingredients and prepares them to be executed, by copying all templates
 * in _templates directory, namespaced by the npm package name.
 *
 * An ingredient can either be a repo url or a npm package name.
 *
 * @see resolveNpmPackage for more info on how ingredients are resolved.
 *
 * @param {string[]} ingredients The ingredients to add.
 * @param {Pick<CookArgs, 'shouldOverwriteTemplates'>} options The options to add ingredients.
 * @param {boolean} options.shouldOverwriteTemplates Flags if it should overwrite ingredients templates.
 *
 * @returns {Promise<void>}
 */
export async function addIngredients(
  ingredients: string[],
  options: Pick<CookArgs, 'shouldOverwriteTemplates'>,
): Promise<void> {
  await setGitignore();
  await Promise.all(
    ingredients.map((ingredient) =>
      limitConcurrency(() => addIngredient(ingredient, options)),
    ),
  );
}
