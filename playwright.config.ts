import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  globalTeardown: './scripts/e2e-real-global-teardown.cjs',
  timeout: 60_000,
  expect: {
    timeout: 10_000
  },
  use: {
    baseURL: 'http://localhost:4201',
    trace: 'on-first-retry'
  },
  projects: [
    {
      name: 'chromium',
      use: {
        browserName: 'chromium'
      }
    }
  ],
  webServer: [
    {
      command: 'node scripts/start-api-e2e.cjs',
      url: 'http://localhost:3001/health',
      reuseExistingServer: false,
      timeout: 240_000
    },
    {
      command: 'node scripts/start-web-e2e.cjs',
      url: 'http://localhost:4201',
      reuseExistingServer: false,
      timeout: 240_000
    }
  ]
});
