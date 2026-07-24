module.exports = {
  preset: 'jest-expo',
  testMatch: ['**/__tests__/**/*.test.ts', '**/__tests__/**/*.test.tsx'],
  collectCoverageFrom: [
    'services/**/*.ts',
    'utils/**/*.ts',
    '!**/*.d.ts'
  ],
  coveragePathIgnorePatterns: ['/node_modules/']
}
