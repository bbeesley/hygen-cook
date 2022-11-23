#!/usr/bin/env node
// eslint-disable-next-line n/file-extension-in-import
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

void cook({
  recipePath: (argv as Record<string, any>)['recipe'] as string,
  shouldOverwriteTemplates: (argv as Record<string, any>)[
    'overwriteTemplates'
  ] as boolean,
});
