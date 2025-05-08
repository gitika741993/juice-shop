import { defineConfig, devices } from '@playwright/test';
import { EnvironmentManager } from './src/utils/environmentManager';

// Initialize the environment manager
EnvironmentManager.initialize();

/**
 * Read environment variables from file.
 * https://github.com/motdotla/dotenv
 */
import { getEnv } from './config/dotenv.config';

/**
 * See https://playwright.dev/docs/test-configuration.
 */
export default defineConfig({
  testDir: './tests',
  /* Maximum time one test can run for. */
  timeout: parseInt(getEnv('TIMEOUT', '30000')),
  expect: {
    /**
     * Maximum time expect() should wait for the condition to be met.
     * For example in `await expect(locator).toHaveText();`
     */
    timeout: 5000
  },
  /* Run tests in files in parallel */
  fullyParallel: true,
  /* Fail the build on CI if you accidentally left test.only in the source code. */
  forbidOnly: !!process.env.CI,
  /* Retry on CI only */
  retries: process.env.CI ? parseInt(getEnv('RETRIES', '2')) : 0,
  /* Opt out of parallel tests on CI. */
  workers: process.env.CI ? 1 : parseInt(getEnv('WORKERS', '1')),
  /* Reporter to use. See https://playwright.dev/docs/test-reporters */
  reporter: 'html',
  /* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
  use: {
    /* Base URL to use in actions like `await page.goto('/')`. */
    baseURL: EnvironmentManager.getBaseUrl(),

    /* Collect trace when retrying the failed test. See https://playwright.dev/docs/trace-viewer */
    trace: 'on-first-retry',
    
    /* Take screenshot on failure */
    screenshot: 'only-on-failure',
    
    /* Record video on failure */
    video: 'on-first-retry',
    
    /* Set timeout for navigation */
    navigationTimeout: parseInt(getEnv('TIMEOUT', '30000')),
    
    /* HTTP credentials */
    httpCredentials: {
      username: getEnv('HTTP_USERNAME', ''),
      password: getEnv('HTTP_PASSWORD', ''),
    },
  },

  /* Configure projects for major browsers */
  projects: [
    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome'],
        headless: getEnv('HEADLESS', 'true') === 'true',
        launchOptions: {
          slowMo: parseInt(getEnv('SLOW_MO', '0')),
        },
      },
    },
    {
      name: 'firefox',
      use: {
        ...devices['Desktop Firefox'],
        headless: getEnv('HEADLESS', 'true') === 'true',
        launchOptions: {
          slowMo: parseInt(getEnv('SLOW_MO', '0')),
        },
      },
    },
    {
      name: 'webkit',
      use: {
        ...devices['Desktop Safari'],
        headless: getEnv('HEADLESS', 'true') === 'true',
        launchOptions: {
          slowMo: parseInt(getEnv('SLOW_MO', '0')),
        },
      },
    },
  ],
});