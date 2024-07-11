module.exports = {
  clearMocks: true,
  moduleFileExtensions: ['js', 'ts'],
  testRegex: "(/__tests__/.*|\\.(tests|spec))\\.(ts|tsx|js)$",
  testEnvironment: 'node',
  testRunner: 'jest-circus/runner',
  transform: {
    '^.+\\.ts$': 'ts-jest'
  },
  verbose: true,
  collectCoverage: true,
  coverageReporters: ["json", "html"],
  setupFilesAfterEnv: ['./jest.setup.js']
}