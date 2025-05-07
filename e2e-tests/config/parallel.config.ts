import { defineConfig, devices } from '@playwright/test';
import { loadEnv, getEnv } from './dotenv.config';

loadEnv();

/**
 * Configuration for parallel test execution
 * This enables parallel execution with multiple workers
 */
export default defineConfig({
  testDir: '../tests',
  timeout: parseInt(getEnv('TIMEOUT', '30000')),
  expect: {
    timeout: 5000
  },
  fullyParallel: true,
  workers: parseInt(getEnv('WORKERS', '4')),
  retries: parseInt(getEnv('RETRIES', '1')),
  reporter: [
    ['html', { outputFolder: '../test-results/html-report' }],
    ['json', { outputFile: '../test-results/test-results.json' }]
  ],
  use: {
    baseURL: getEnv('BASE_URL', 'https://user:6c4e51d892a1c360799100396e7948d7@local-juice-shop-app-tunnel-lvqj2tij.devinapps.com'),
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },
  ],
});
