module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  testMatch: ['**/tests/**/*.test.ts'],
  moduleNameMapper: {
    '^vscode$': '<rootDir>/tests/__mocks__/vscode.ts',
  },
  transform: {
    '^.+\\.tsx?$': [
      'ts-jest',
      {
        tsconfig: {
          module: 'commonjs',
          target: 'ES2022',
          strict: true,
          esModuleInterop: true,
        },
      },
    ],
  },
  collectCoverageFrom: [
    'src/timerManager.ts',
    'src/statusBarManager.ts',
  ],
};
