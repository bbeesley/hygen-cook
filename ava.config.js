module.exports = {
  files: ['src/test/**/*.test.ts', 'src/test/*.test.ts'],
  concurrency: 5,
  failFast: true,
  failWithoutAssertions: false,
  verbose: true,
  extensions: ['ts'],
  require: ['ts-node/register'],
  timeout: '1m',
};
