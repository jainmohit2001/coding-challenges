module.exports = {
  roots: ['<rootDir>/src', '<rootDir>/tests'],
  testMatch: [
    '**/__tests__/**/*.+(ts|tsx|js)',
    '**/?(*.)+(spec|test).+(ts|tsx|js)'
  ],
  transform: {
    '^.+\\.(ts|tsx)$': 'ts-jest'
  },
  verbose: true,
  coverageDirectory: './coverage',
  collectCoverage: true,
  detectOpenHandles: true,
  silent: false
};
