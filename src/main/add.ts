import { access, mkdir, readdir } from 'async-fs-wrapper';
import { green, yellow } from 'chalk';
import execa from 'execa';
import fs from 'fs-extra';
import inquirer from 'inquirer';
import ora from 'ora';
import { join, dirname } from 'path';
import { URL } from 'url';

import { AddOptions, CliPackageManager } from './@types';

const tmpl = (x): string => join('_templates', x);

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
  return { name: pkg, isUrl: false };
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
  packageManager: CliPackageManager,
  options: AddOptions = {},
): Promise<void> {
  const { name, isUrl } = resolvePackage(pkg, options);
  const spinner = ora(`Adding: ${name}`).start();

  try {
    await execa(
      packageManager,
      [
        packageManager === CliPackageManager.npm ? 'i -D' : 'add --dev',
        isUrl ? pkg : name,
      ],
      { shell: true, cwd: process.cwd() },
    );
    const templatePath = join(
      dirname(require.resolve(`${name}/package.json`)),
      '_templates',
    );
    await mkdir(join(process.cwd(), '_templates'), {
      recursive: true,
    });

    for (const g of await readdir(templatePath)) {
      const maybePrefixed = options.prefix ? `${options.prefix}-${g}` : g;
      const wantedTargetPath = join(process.cwd(), tmpl(maybePrefixed));
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
    console.error(
      `\n\nCan't add ${name}${isUrl ? ` (source: ${pkg})` : ''}\n\n`,
      ex,
    );
  } finally {
    spinner.stop();
  }
}
