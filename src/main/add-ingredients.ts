import { mkdir, readdir } from 'async-fs-wrapper';
import { green, yellow } from 'chalk';
import execa from 'execa';
import fs from 'fs-extra';
import ora from 'ora';
import { join, dirname } from 'path';
import { NpmPackage, CookArgs, CopyPackageGeneratorArgs } from './@types';
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
 * Creates the templates directory (_templates).
 *
 * @returns {Promise<string>} The templates path.
 */
async function createTemplatesDir(): Promise<string> {
  const templatesPath = join(process.cwd(), '_templates');
  await mkdir(join(process.cwd(), '_templates'), {
    recursive: true,
  });
  return templatesPath;
}

/**
 * Copies all templates for the specified generator in the npm package,
 * namespaced by the npm package name.
 *
 * @param {CopyPackageGeneratorArgs} args
 * @param {Pick<NpmPackage, 'name'>} args.npmPackage The npm package.
 * @param {string} args.npmPackage.name The npm package name.
 * @param {string} args.generator The generator name.
 * @param {string} args.sourceTemplateDir The source template directory.
 * @param {string} args.targetTemplateDir The target template directory.
 * @param {string} args.shouldOverwriteTemplates Flags if it should overwrite ingredients templates.
 *
 * @returns {Promise<void>}
 */
async function copyNpmPackageGenerator({
  npmPackage: { name },
  generator,
  sourceTemplateDir,
  targetTemplateDir,
  shouldOverwriteTemplates,
}: CopyPackageGeneratorArgs): Promise<void> {
  const sourcePath = join(sourceTemplateDir, generator);
  const targetPath = join(targetTemplateDir, name, generator);
  const targetPathExists = await fs.pathExists(targetPath);
  if (!shouldOverwriteTemplates && targetPathExists) {
    console.log(yellow(` skipped: ${name}/${generator}`));
    return;
  }
  await fs.copy(sourcePath, targetPath, {
    recursive: true,
  });
  console.log(green(` added: ${name}/${generator}`));
}

/**
 * Copies all templates for the generators in the npm package,
 * namespaced by the npm package name.
 *
 * @param {Pick<NpmPackage, 'name'>} npmPackage The npm package.
 * @param {string} npmPackage.name The npm package name.
 * @param {Pick<CookArgs, 'shouldOverwriteTemplates'>} options The options to add ingredients.
 * @param {boolean} options.shouldOverwriteTemplates Flags if it should overwrite ingredients templates.
 *
 * @returns {Promise<void>}
 */
async function copyNpmPackageGenerators(
  npmPackage: Pick<NpmPackage, 'name'>,
  { shouldOverwriteTemplates }: Pick<CookArgs, 'shouldOverwriteTemplates'>,
): Promise<void> {
  const nodeModuleDir = dirname(
    require.resolve(`${npmPackage.name}/package.json`, {
      paths: [process.cwd()],
    }),
  );
  const sourceTemplateDir = join(nodeModuleDir, '_templates');
  const targetTemplateDir = await createTemplatesDir();
  const generators = await readdir(sourceTemplateDir);
  await Promise.all(
    generators.map((generator) =>
      limitConcurrency(() =>
        copyNpmPackageGenerator({
          npmPackage,
          generator,
          sourceTemplateDir,
          targetTemplateDir,
          shouldOverwriteTemplates,
        }),
      ),
    ),
  );
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
    await copyNpmPackageGenerators(npmPackage, { shouldOverwriteTemplates });
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
  await Promise.all(
    ingredients.map((ingredient) =>
      limitConcurrency(() => addIngredient(ingredient, options)),
    ),
  );
}