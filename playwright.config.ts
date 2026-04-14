import { defineConfig } from '@playwright/test';

const devServerCommand =
  process.platform === 'win32'
    ? 'pnpm.cmd --filter @trinus/web exec ng serve --host 127.0.0.1 --port 4200'
    : 'pnpm --filter @trinus/web exec ng serve --host 127.0.0.1 --port 4200';

export default defineConfig({
  testDir: './e2e',
  timeout: 60_000,
  expect: {
    timeout: 10_000
  },
  use: {
    baseURL: 'http://127.0.0.1:4200',
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
  webServer: {
    command: devServerCommand,
    url: 'http://127.0.0.1:4200',
    reuseExistingServer: !process.env.CI,
    timeout: 120_000
  }
});
