module.exports = {
  preset: '@react-native/jest-preset',
  testEnvironment: 'node',
  setupFiles: ['<rootDir>/jest.setup.js'],
  moduleDirectories: [
    'node_modules',
    '<rootDir>/src/shared/__mocks__',
    __dirname,
  ],
  transformIgnorePatterns: [
    'node_modules/(?!(.pnpm|react-native|@react-native|@react-navigation|@testing-library|zustand))',
  ],
  moduleNameMapper: {
    '^react-native-mmkv$':
      '<rootDir>/src/infrastructure/storage/mmkv/__mocks__/mmkvStorage.ts',
    '^@env$': '<rootDir>/src/shared/__mocks__/env.ts',
    '^@env/(.*)$': '<rootDir>/src/shared/__mocks__/env.ts',
  },
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
  testPathIgnorePatterns: ['/node_modules/', '/android/', '/ios/'],
};
