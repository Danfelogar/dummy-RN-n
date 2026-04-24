const { getDefaultConfig, mergeConfig } = require('@react-native/metro-config');

/**
 * Metro configuration
 * https://reactnative.dev/docs/metro
 *
 * @type {import('@react-native/metro-config').MetroConfig}
 */

const config = {
  resolver: {
    blockList: [
      /.*\/__test__\/.*/,
      /.*\.test\.(ts|tsx|js|jsx)$/,
      /.*\.spec\.(ts|tsx|js|jsx)$/,
      /node_modules\/.*\/@testing-library\/.*/,
      /node_modules\/.*\/jest.*/,
    ],
  },
};

module.exports = mergeConfig(getDefaultConfig(__dirname), config);
