import { access, mkdir, readdir } from 'async-fs-wrapper';
import chalk from 'chalk';
import execa from 'execa';
import fs from 'fs-extra';
import inquirer from 'inquirer';
import ora from 'ora';
import { join } from 'path';
import { URL } from 'url';

const tmpl = (x): string => join('_templates', x);

type AddOptions = {
  name?: string;
  prefix?: string;
};

const resolvePackage = (
  pkg,
  opts: AddOptions = {},
): { name: string; isUrl: boolean } => {
  if (pkg.match(/^http/)) {
    if (opts.name) {
      return { name: opts.name, isUrl: true };
    }
    const url = new URL(pkg);
    return { name: url.href.split('/').pop() as string, isUrl: true };
  }
  return { name: `hygen-${pkg}`, isUrl: false };
};

async function pathExists(path: string): Promise<boolean> {
  try {
    await access(path);
    return true;
  } catch (err) {
    return false;
  }
}

export async function addPackage(
  pkg: string,
  options: AddOptions = {},
): Promise<void> {
  const { red, green, yellow } = chalk;
  const { name, isUrl } = resolvePackage(pkg, options);
  const spinner = ora(`Adding: ${name}`).start();

  try {
    await execa(
      `${join(__dirname, '../../node_modules/.bin/')}yarn add --dev ${
        isUrl ? pkg : name
      }`,
      { shell: true },
    );
    const templatePath = join('./node_modules', name, '_templates');
    await mkdir('_templates', {
      recursive: true,
    });

    spinner.stop();
    for (const g of await readdir(templatePath)) {
      const maybePrefixed = options.prefix ? `${options.prefix}-${g}` : g;
      const wantedTargetPath = tmpl(maybePrefixed);
      const sourcePath = join(templatePath, g);

      if (await pathExists(wantedTargetPath)) {
        if (
          !(await inquirer
            .prompt([
              {
                message: `'${maybePrefixed}' already exists. Overwrite? (Y/n): `,
                name: 'overwrite',
                prefix: '      🤔 :',
                type: 'confirm',
              },
            ])
            .then(({ overwrite }) => overwrite))
        ) {
          console.log(yellow(` skipped: ${maybePrefixed}`));
          // eslint-disable-next-line no-continue
          continue;
        }
      }

      await fs.copy(sourcePath, wantedTargetPath, {
        recursive: true,
      });
      console.log(green(`   added: ${maybePrefixed}`));
    }
  } catch (ex) {
    console.log(
      red(`\n\nCan't add ${name}${isUrl ? ` (source: ${pkg})` : ''}\n\n`),
      ex,
    );
  }
}