module.exports = {
    preset: 'ts-jest',
    testEnvironment: 'node',
    testMatch: ['**/test/**/*.test.[jt]s?(x)'], // Match your test file location
    testTimeout: 10000,
  };