#!/usr/bin/env node
import yargs from 'yargs/yargs';
import { cook } from '../main/cook';

const { argv } = yargs(process.argv.slice(2))
  .option('recipe', {
    alias: 'r',
    demandOption: true,
    string: true,
    requiresArg: true,
    describe: 'The recipe to cook up',
  })
  .option('overwriteTemplates', {
    demandOption: false,
    boolean: true,
    requiresArg: false,
    default: false,
    describe: 'Should overwrite templates?',
  })
  .help();

cook({
  /* eslint-disable dot-notation */
  recipePath: argv['recipe'],
  shouldOverwriteTemplates: argv['overwriteTemplates'],
  /* eslint-enable dot-notation */
});
