import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: '.',
  timeout: 30 * 1000,
  expect: {
    timeout: 5000,
  },
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 2 : undefined,
  reporter: [
    ['list'],
    ['html', { open: 'never' }]
  ],
  use: {
    baseURL: process.env.BASE_URL || 'https://testacademy.hu',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },
  projects: [
    // Setup project for API auth & storageState
    {
      name: 'setup',
      testMatch: /.*auth\.setup\.ts/,
    },
    // API testing project (No browser overhead - instant execution)
    {
      name: 'api',
      testMatch: /.*api.*\.spec\.ts/,
      use: {
        baseURL: process.env.BASE_URL || 'https://testacademy.hu',
      },
    },
    // Unit tests project
    {
      name: 'unit',
      testMatch: 'kzs/tests/unit/**/*.spec.ts',
    },
    // Main Chromium project
    {
      name: 'chromium',
      testMatch: ['tests/**/*.spec.ts', 'kzs/tests/**/*.spec.ts'],
      testIgnore: ['**/*api*.spec.ts', 'kzs/tests/unit/**'],
      use: {
        ...devices['Desktop Chrome'],
      },
    },
  ],
});