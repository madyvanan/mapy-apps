import type { Config } from 'jest';

const config: Config = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  rootDir: '.',
  testMatch: ['<rootDir>/tests/**/*.test.ts'],
  collectCoverageFrom: ['<rootDir>/src/**/*.ts', '!<rootDir>/src/types/**'],
  coverageThreshold: { global: { lines: 80, functions: 80, branches: 70 } },
  setupFilesAfterEnv: [],
  globalSetup: '<rootDir>/tests/setup.ts',
  globalTeardown: '<rootDir>/tests/teardown.ts',
};

export default config;
