module.exports = function configureBabel(api) {
  const isTest = api.env('test');
  api.cache(true);

  const presets = [
    [
      '@babel/preset-env',
      {
        targets: {
          node: '14.11.0',
        },
        modules: 'cjs',
      },
    ],
    [
      '@babel/preset-typescript', // this plugin allows babel to work with typescript (bear in mind it will only transpile it, it doesn't care if you have type errors)
    ],
  ];

  const plugins = isTest
    ? []
    : [
        [
          'babel-plugin-add-import-extension',
          { extension: 'cjs', replace: true },
        ],
      ];

  return {
    presets,
    plugins,
  };
};
