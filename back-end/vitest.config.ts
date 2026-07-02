import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    include: ['tests/unit/**/*.test.ts'],
    coverage: {
      provider: 'v8',
      include: [
        'app/service/transaction_service.ts',
        'app/service/account_service.ts',
        'app/service/beneficiaire_service.ts'
      ],
      reporter: ['text', 'lcov']
    }
  }
})
