module.exports = {
  clearMocks: true,
  moduleFileExtensions: ['js', 'ts'],
  testRegex: "(/__tests__/.*|\\.(tests|spec))\\.(ts|tsx|js)$",
  testEnvironment: 'node',
  moduleNameMapper: {
    '^@actions/artifact$': '<rootDir>/node_modules/@actions/artifact/lib/artifact.js',
    '^@actions/core$': '<rootDir>/node_modules/@actions/core/lib/core.js',
    '^@actions/exec$': '<rootDir>/node_modules/@actions/exec/lib/exec.js',
    '^@actions/github$': '<rootDir>/node_modules/@actions/github/lib/github.js',
    '^@actions/glob$': '<rootDir>/node_modules/@actions/glob/lib/glob.js',
    '^@actions/http-client$': '<rootDir>/node_modules/@actions/http-client/lib/index.js',
    '^@actions/io$': '<rootDir>/node_modules/@actions/io/lib/io.js'
  },
  testRunner: 'jest-circus/runner',
  extensionsToTreatAsEsm: ['.ts'],
  transform: {
    '^.+\\.ts$': ['ts-jest', { useESM: true, tsconfig: 'tsconfig.json' }]
  },
  verbose: true,
  collectCoverage: true,
  coverageReporters: ["json", "html"],
  setupFilesAfterEnv: ['./jest.setup.mjs']
}
