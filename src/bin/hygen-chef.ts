#!/usr/bin/env node
import yargs from 'yargs/yargs';
import { cook } from '../main/chef';

const { argv } = yargs(process.argv.slice(2))
  .option('recipe', {
    alias: 'r',
    demandOption: true,
    string: true,
    requiresArg: true,
    describe: 'The recipe to cook up',
  })
  .option('packageManager', {
    alias: 'm',
    demandOption: true,
    string: true,
    requiresArg: false,
    default: 'npm',
    choices: ['npm', 'yarn'],
    describe: 'The package manager to use when installing generator packages',
  })
  .help();

cook({
  recipe: argv.recipe,
  packageManager: argv.packageManager as 'npm' | 'yarn',
});
