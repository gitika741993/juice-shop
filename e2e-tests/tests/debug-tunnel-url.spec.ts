import { test } from '@playwright/test';
import { getCurrentEnvironment } from '../config/environments';

test('Debug tunnel URL and login page', async ({ page, context }) => {
  console.log('Starting debug test for tunnel URL...');
  const env = getCurrentEnvironment();
  console.log(`Using environment: ${env.name} with baseUrl: ${env.baseUrl}`);
  
  await context.addCookies([
    {
      name: 'welcomebanner_status',
      value: 'dismiss',
      domain: new URL(env.baseUrl).hostname,
      path: '/',
    },
    {
      name: 'cookieconsent_status',
      value: 'dismiss',
      domain: new URL(env.baseUrl).hostname,
      path: '/',
    }
  ]);
  
  await page.goto('/');
  console.log('Current URL after navigation to home:', page.url());
  await page.screenshot({ path: 'debug-tunnel-base.png' });
  
  await page.goto('/#/login');
  console.log('Current URL after navigation to login:', page.url());
  await page.screenshot({ path: 'debug-tunnel-login.png' });
  
  const selectors = [
    'input[name="email"]',
    'input[type="email"]',
    'input#email',
    'input[id="email"]',
    'form input:nth-child(1)'
  ];
  
  for (const selector of selectors) {
    const element = page.locator(selector);
    const isVisible = await element.isVisible().catch(() => false);
    console.log(`Selector "${selector}" visible:`, isVisible);
    
    if (isVisible) {
      console.log(`Found email input with selector: ${selector}`);
      await element.highlight();
      await page.screenshot({ path: `debug-tunnel-found-${selector.replace(/[^a-zA-Z0-9]/g, '-')}.png` });
    }
  }
});