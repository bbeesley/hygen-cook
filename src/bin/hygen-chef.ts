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
  .help();

cook(argv.recipe);
