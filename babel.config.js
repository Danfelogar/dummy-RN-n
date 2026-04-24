// babel.config.js
module.exports = api => {
  const isTest = api.env('test');

  return {
    presets: ['module:@react-native/babel-preset'],
    plugins: [
      '@babel/plugin-transform-export-namespace-from',
      ...(isTest
        ? []
        : [
            [
              'module:react-native-dotenv',
              {
                moduleName: '@env',
                path: '.env',
                blacklist: null,
                whitelist: null,
                safe: false,
                allowUndefined: true,
              },
            ],
          ]),
    ],
    env: {
      production: {
        plugins: ['react-native-paper/babel'],
      },
    },
  };
};
