/* eslint-disable prettier/prettier, @typescript-eslint/no-var-requires */
const {
  rules: baseBestPracticesRules,
} = require('eslint-config-airbnb-base/rules/best-practices.js');
const {
  rules: baseErrorsRules,
} = require('eslint-config-airbnb-base/rules/errors.js');
const { rules: baseES6Rules } = require('eslint-config-airbnb-base/rules/es6.js');
const {
  rules: baseImportsRules,
} = require('eslint-config-airbnb-base/rules/imports.js');
const {
  rules: baseStyleRules,
} = require('eslint-config-airbnb-base/rules/style.js');
const {
  rules: baseVariablesRules,
} = require('eslint-config-airbnb-base/rules/variables.js');
/* eslint-enable */

const plugins = [
  '@typescript-eslint',
  'eslint-comments',
  'jest',
  'promise',
  'unicorn',
];
const extendsModules = [
  'plugin:prettier/recommended',
  'eslint-config-airbnb-base',
  'plugin:@typescript-eslint/recommended',
  'plugin:eslint-comments/recommended',
  'plugin:jest/recommended',
  'plugin:promise/recommended',
  'prettier',
];

const settings = {
  // Apply special parsing for TypeScript files
  'import/parsers': {
    '@typescript-eslint/parser': ['.ts', '.tsx', '.d.ts'],
  },
  // Append 'ts' extensions to Airbnb 'import/resolver' setting
  'import/resolver': {
    node: {
      extensions: ['.mjs', '.js', '.ts', '.json'],
    },
  },
  // Append 'ts' extensions to Airbnb 'import/extensions' setting
  'import/extensions': ['.js', '.ts', '.mjs'],
};
const env = {
  node: true,
  browser: true,
  jest: true,
};
const rules = {
  'no-console': 'off',

  // Replace Airbnb 'brace-style' rule with '@typescript-eslint' version
  // https://github.com/typescript-eslint/typescript-eslint/blob/master/packages/eslint-plugin/docs/rules/brace-style.md
  'brace-style': 'off',
  '@typescript-eslint/brace-style': 'off', // off because this conflicts with prettier brace rules

  // Replace Airbnb 'camelcase' rule with '@typescript-eslint' version
  // https://github.com/typescript-eslint/typescript-eslint/blob/master/packages/eslint-plugin/docs/rules/camelcase.md
  camelcase: 'off',
  '@typescript-eslint/naming-convention': [
    'error',
    {
      selector: 'default',
      format: ['camelCase'],
    },
    {
      selector: 'variable',
      format: ['camelCase', 'UPPER_CASE', 'PascalCase'],
    },
    {
      selector: 'parameter',
      format: ['camelCase', 'PascalCase'],
    },
    {
      selector: 'typeLike',
      format: ['PascalCase'],
    },
    {
      selector: 'classProperty',
      format: ['camelCase'],
    },
    {
      selector: 'objectLiteralProperty',
      format: null,
    },
    {
      selector: 'typeProperty',
      format: null,
    },
    {
      selector: 'enum',
      format: ['PascalCase', 'UPPER_CASE'],
    },
    {
      selector: 'enumMember',
      format: null,
    },
  ],

  // Replace Airbnb 'comma-spacing' rule with '@typescript-eslint' version
  // https://github.com/typescript-eslint/typescript-eslint/blob/master/packages/eslint-plugin/docs/rules/comma-spacing.md
  'comma-spacing': 'off',
  '@typescript-eslint/comma-spacing': baseStyleRules['comma-spacing'],

  // Replace Airbnb 'func-call-spacing' rule with '@typescript-eslint' version
  // https://github.com/typescript-eslint/typescript-eslint/blob/master/packages/eslint-plugin/docs/rules/func-call-spacing.md
  'func-call-spacing': 'off',
  '@typescript-eslint/func-call-spacing': baseStyleRules['func-call-spacing'],

  // Disable typescript indent since prettier covers this
  indent: 'off',
  '@typescript-eslint/indent': 'off',

  // Replace Airbnb 'no-array-constructor' rule with '@typescript-eslint' version
  // https://github.com/typescript-eslint/typescript-eslint/blob/master/packages/eslint-plugin/docs/rules/no-array-constructor.md
  'no-array-constructor': 'off',
  '@typescript-eslint/no-array-constructor':
    baseStyleRules['no-array-constructor'],

  // Replace Airbnb 'no-dupe-class-members' rule with '@typescript-eslint' version
  // https://github.com/typescript-eslint/typescript-eslint/blob/master/packages/eslint-plugin/docs/rules/no-dupe-class-members.md
  'no-dupe-class-members': 'off',
  '@typescript-eslint/no-dupe-class-members':
    baseES6Rules['no-dupe-class-members'],

  // Replace Airbnb 'no-empty-function' rule with '@typescript-eslint' version
  // https://github.com/typescript-eslint/typescript-eslint/blob/master/packages/eslint-plugin/docs/rules/no-empty-function.md
  'no-empty-function': 'off',
  '@typescript-eslint/no-empty-function':
    baseBestPracticesRules['no-empty-function'],

  // Replace Airbnb 'no-extra-parens' rule with '@typescript-eslint' version
  // https://github.com/typescript-eslint/typescript-eslint/blob/master/packages/eslint-plugin/docs/rules/no-extra-parens.md
  'no-extra-parens': 'off',
  '@typescript-eslint/no-extra-parens': baseErrorsRules['no-extra-parens'],

  // Replace Airbnb 'no-extra-semi' rule with '@typescript-eslint' version
  // https://github.com/typescript-eslint/typescript-eslint/blob/master/packages/eslint-plugin/docs/rules/no-extra-semi.md
  'no-extra-semi': 'off',
  '@typescript-eslint/no-extra-semi': baseErrorsRules['no-extra-semi'],

  // Replace Airbnb 'no-implied-eval' rule with '@typescript-eslint' version
  // https://github.com/typescript-eslint/typescript-eslint/blob/master/packages/eslint-plugin/docs/rules/no-implied-eval.md
  'no-implied-eval': 'off',
  '@typescript-eslint/no-implied-eval':
    baseBestPracticesRules['no-implied-eval'],

  // Replace Airbnb 'no-magic-numbers' rule with '@typescript-eslint' version
  // https://github.com/typescript-eslint/typescript-eslint/blob/master/packages/eslint-plugin/docs/rules/no-magic-numbers.md
  'no-magic-numbers': 'off',
  '@typescript-eslint/no-magic-numbers':
    baseBestPracticesRules['no-magic-numbers'],

  // Replace Airbnb 'no-throw-literal' rule with '@typescript-eslint' version
  // https://github.com/typescript-eslint/typescript-eslint/blob/master/packages/eslint-plugin/docs/rules/no-throw-literal.md
  'no-throw-literal': 'off',
  '@typescript-eslint/no-throw-literal':
    baseBestPracticesRules['no-throw-literal'],

  // Replace Airbnb 'no-unused-expressions' rule with '@typescript-eslint' version
  // https://github.com/typescript-eslint/typescript-eslint/blob/master/packages/eslint-plugin/docs/rules/no-unused-expressions.md
  'no-unused-expressions': 'off',
  '@typescript-eslint/no-unused-expressions':
    baseBestPracticesRules['no-unused-expressions'],

  // Replace Airbnb 'no-unused-vars' rule with '@typescript-eslint' version
  // https://github.com/typescript-eslint/typescript-eslint/blob/master/packages/eslint-plugin/docs/rules/no-unused-vars.md
  'no-unused-vars': 'off',
  '@typescript-eslint/no-unused-vars': baseVariablesRules['no-unused-vars'],

  // Replace Airbnb 'no-use-before-define' rule with '@typescript-eslint' version
  // https://github.com/typescript-eslint/typescript-eslint/blob/master/packages/eslint-plugin/docs/rules/no-use-before-define.md
  'no-use-before-define': 'off',
  '@typescript-eslint/no-use-before-define':
    baseVariablesRules['no-use-before-define'],

  // Replace Airbnb 'no-useless-constructor' rule with '@typescript-eslint' version
  // https://github.com/typescript-eslint/typescript-eslint/blob/master/packages/eslint-plugin/docs/rules/no-useless-constructor.md
  'no-useless-constructor': 'off',
  '@typescript-eslint/no-useless-constructor':
    baseES6Rules['no-useless-constructor'],

  // Replace Airbnb 'quotes' rule with '@typescript-eslint' version
  // https://github.com/typescript-eslint/typescript-eslint/blob/master/packages/eslint-plugin/docs/rules/quotes.md
  quotes: 'off',
  '@typescript-eslint/quotes': baseStyleRules.quotes,

  // Replace Airbnb 'semi' rule with '@typescript-eslint' version
  // https://github.com/typescript-eslint/typescript-eslint/blob/master/packages/eslint-plugin/docs/rules/semi.md
  semi: 'off',
  '@typescript-eslint/semi': baseStyleRules.semi,

  // Replace Airbnb 'space-before-function-paren' rule with '@typescript-eslint' version
  // https://github.com/typescript-eslint/typescript-eslint/blob/master/packages/eslint-plugin/docs/rules/space-before-function-paren.md
  'space-before-function-paren': 'off',
  '@typescript-eslint/space-before-function-paren':
    baseStyleRules['space-before-function-paren'],

  // Append 'ts' and 'tsx' extensions to Airbnb 'import/no-extraneous-dependencies' rule
  // https://github.com/benmosher/eslint-plugin-import/blob/master/docs/rules/no-extraneous-dependencies.md
  'import/no-extraneous-dependencies': [
    baseImportsRules['import/no-extraneous-dependencies'][0],
    {
      ...baseImportsRules['import/no-extraneous-dependencies'][1],
      devDependencies: baseImportsRules[
        'import/no-extraneous-dependencies'
      ][1].devDependencies.map((glob) =>
        glob.replace('js,jsx', 'js,jsx,ts,tsx'),
      ),
    },
  ],

  // Too restrictive, writing ugly code to defend against a very unlikely scenario: https://eslint.org/docs/rules/no-prototype-builtins
  'no-prototype-builtins': 'off',
  // https://basarat.gitbooks.io/typescript/docs/tips/defaultIsBad.html
  'import/prefer-default-export': 'off',
  'import/no-default-export': 'error',
  // Makes no sense to allow type inferrence for expression parameters, but require typing the response
  '@typescript-eslint/explicit-function-return-type': [
    'error',
    { allowExpressions: true, allowTypedFunctionExpressions: true },
  ],
  '@typescript-eslint/no-explicit-any': 'off',
  'class-methods-use-this': 'off',

  'no-restricted-syntax': [
    'error',
    {
      selector: 'ForInStatement',
      message:
        'for..in loops iterate over the entire prototype chain, which is virtually never what you want. Use Object.{keys,values,entries}, and iterate over the resulting array.',
    },
    {
      selector: 'LabeledStatement',
      message:
        'Labels are a form of GOTO; using them makes code confusing and hard to maintain and understand.',
    },
    {
      selector: 'WithStatement',
      message:
        '`with` is disallowed in strict mode because it makes code impossible to predict and optimize.',
    },
  ],

  // sometimes these are much clearer than if else blocks
  'no-nested-ternary': 'off',

  // avoid unknown horrors
  complexity: ['warn', { max: 9 }],

  // enforce kebab case filenames
  'unicorn/filename-case': [
    'error',
    {
      case: 'kebabCase',
    },
  ],

  'no-underscore-dangle': [
    'error',
    {
      enforceInMethodNames: true,
      allowFunctionParams: false,
    },
  ],

  // with ts 4.x we need to disable the base rule which incorrectly errors on export enum
  'no-shadow': 'off',
  '@typescript-eslint/no-shadow': ['error'],

  /* 
    The "smart" option enforces the use of === and !== except for these cases:  
    * Comparing two literal values
    * Evaluating the value of typeof
    * Comparing against null
  */

  eqeqeq: ['error', 'smart'],

  /* 
    In many cases the iterations of a loop are not actually independent of each-other. For example, the output of one
    iteration might be used as the input to another. Or, loops may be used to retry asynchronous operations that were
    unsuccessful. Or, loops may be used to prevent your code from sending an excessive amount of requests in parallel.
  */
  'no-await-in-loop': 'off',

  // require specifying the file extension when importing from a different file type
  // this allows babel to replace the filename on imports/exports with the target file extension
  'import/extensions': ['error', 'never', { js: 'always', json: 'always' }],
};
const overrides = [
  {
    files: ['**/*.test.ts', '**/__mocks__/**/*.ts', '**/__mocks__/*.ts'],
    rules: {
      'no-underscore-dangle': 'off',
      '@typescript-eslint/explicit-function-return-type': 'off',
    },
  },
  {
    files: ['./*.cjs'],
    rules: {
      'import/no-extraneous-dependencies': 'off',
    },
  },
  {
    files: ['*.ts'],
    rules: {
      // Disable `no-undef` rule within TypeScript files because it incorrectly errors when exporting default interfaces
      // https://github.com/iamturns/eslint-config-airbnb-typescript/issues/50
      // This will be caught by TypeScript compiler if `strictNullChecks` (or `strict`) is enabled
      'no-undef': 'off',

      /* Using TypeScript makes it safe enough to disable the checks below */
      // Disable ESLint-based module resolution check for improved monorepo support
      // https://github.com/benmosher/eslint-plugin-import/blob/master/docs/rules/no-unresolved.md
      'import/no-unresolved': 'off',
    },
  },
  {
    files: ['**/*.js'],
    parser: '@babel/eslint-parser',
    parserOptions: {
      sourceType: 'module',
      allowImportExportEverywhere: false,
      codeFrame: true,
    },
    extends: [
      'plugin:prettier/recommended',
      'eslint-config-airbnb-base',
      'plugin:eslint-comments/recommended',
      'plugin:jest/recommended',
      'plugin:promise/recommended',
      'prettier',
    ],
    rules: {
      // Disable indent since prettier covers this
      indent: 'off',

      // Too restrictive, writing ugly code to defend against a very unlikely scenario: https://eslint.org/docs/rules/no-prototype-builtins
      'no-prototype-builtins': 'off',
      // https://basarat.gitbooks.io/typescript/docs/tips/defaultIsBad.html
      'import/prefer-default-export': 'off',
      'import/no-default-export': 'error',
      'class-methods-use-this': 'off',

      'no-restricted-syntax': [
        'error',
        {
          selector: 'ForInStatement',
          message:
            'for..in loops iterate over the entire prototype chain, which is virtually never what you want. Use Object.{keys,values,entries}, and iterate over the resulting array.',
        },
        {
          selector: 'LabeledStatement',
          message:
            'Labels are a form of GOTO; using them makes code confusing and hard to maintain and understand.',
        },
        {
          selector: 'WithStatement',
          message:
            '`with` is disallowed in strict mode because it makes code impossible to predict and optimize.',
        },
      ],
    },
  },
];

module.exports = {
  parser: '@typescript-eslint/parser',
  parserOptions: {
    project: './tsconfig.json',
    tsconfigRootDir: __dirname,
    extraFileExtensions: ['.mjs', 'cjs'],
  },
  extends: extendsModules,
  plugins,
  ignorePatterns: [
    'node_modules/',
    'generator/',
    '**/node_modules/**',
    '**/dist/**',
    '**/coverage/**',
    '.vscode/',
    'packages/full/src/main/schema.ts', // ignore the compiled json schema
  ],
  rules,
  overrides,
  settings,
  env,
};
