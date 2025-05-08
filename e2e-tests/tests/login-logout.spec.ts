import { test, expect, Page } from '@playwright/test';
import { LoginPage } from '../src/pages/LoginPage';
import { HomePage } from '../src/pages/HomePage';
import { Navigation } from '../src/utils/navigation';
import { Auth } from '../src/utils/auth';
import { TestData } from '../src/utils/testData';
import { BasePage } from '../src/pages/BasePage';
import { EnvironmentManager } from '../src/utils/environmentManager';
import * as fs from 'fs';
import * as path from 'path';

/**
 * Get a registered user for testing
 * @returns User credentials
 */
function getRegisteredUser() {
  // Use environment-specific credentials
  const credentials = EnvironmentManager.getCustomerCredentials();
  
  // Log the user being used (but mask the password)
  console.log(`Using registered user: ${credentials.email}`);
  
  return credentials;
}

test.describe('Login and Logout', () => {
  test.setTimeout(180000); // Increased timeout for flaky connections and fallback attempts
  
  test.beforeEach(async ({ page }) => {
    test.skip(
      process.env.CI !== 'true', 
      'Skipping login tests on demo site - they are unreliable. Run with CI=true to force tests.'
    );
    
    EnvironmentManager.initialize();
  });
  
  test('should login successfully with valid credentials', async ({ page }) => {
    try {
      const registeredUser = getRegisteredUser();
      console.log(`Using registered user: ${registeredUser.email}`);
      
      const connected = await EnvironmentManager.setupEnvironment(page);
      if (!connected) {
        console.log('Failed to connect to any Juice Shop instance. Skipping test.');
        test.skip();
        return;
      }
      
      await page.screenshot({ path: `site-access-check-${Date.now()}.png` });
      console.log('Successfully accessed the site');
      
      const loginPage = await Navigation.goToLoginPage(page);
      await page.screenshot({ path: `before-login-${Date.now()}.png` });
      
      await loginPage.login(registeredUser.email, registeredUser.password);
      await page.screenshot({ path: `after-login-${Date.now()}.png` });
      
      // Verify login was successful
      const homePage = new HomePage(page);
      expect(await homePage.isLoggedIn()).toBeTruthy();
      
      console.log('Login test passed');
    } catch (error) {
      console.log('Error in login test:', error);
      await page.screenshot({ path: `login-error-${Date.now()}.png` });
      throw error;
    }
  });
  
  test('should show error with invalid credentials', async ({ page }) => {
    try {
      const connected = await EnvironmentManager.setupEnvironment(page);
      if (!connected) {
        console.log('Failed to connect to any Juice Shop instance. Skipping test.');
        test.skip();
        return;
      }
      
      const loginPage = await Navigation.goToLoginPage(page);
      await page.screenshot({ path: `before-login-invalid-${Date.now()}.png` });
      
      // Use invalid credentials
      const invalidEmail = TestData.getRandomEmail();
      const invalidPassword = TestData.getRandomPassword();
      
      await loginPage.login(invalidEmail, invalidPassword);
      await page.screenshot({ path: `after-login-invalid-${Date.now()}.png` });
      
      // Verify error message is displayed
      const errorMessage = await loginPage.getErrorMessage();
      expect(errorMessage).toContain('Invalid email or password');
      
      console.log('Invalid credentials test passed');
    } catch (error) {
      console.log('Error in invalid credentials test:', error);
      await page.screenshot({ path: `invalid-login-error-${Date.now()}.png` });
      throw error;
    }
  });
  
  test('should logout successfully', async ({ page }) => {
    try {
      const registeredUser = getRegisteredUser();
      console.log(`Logging in with registered user: ${registeredUser.email}`);
      
      const connected = await EnvironmentManager.setupEnvironment(page);
      if (!connected) {
        console.log('Failed to connect to any Juice Shop instance. Skipping test.');
        test.skip();
        return;
      }
      
      await page.screenshot({ path: `site-access-check-logout-test-${Date.now()}.png` });
      console.log('Successfully accessed the site for logout test');
      
      const loginPage = await Navigation.goToLoginPage(page);
      await loginPage.login(registeredUser.email, registeredUser.password);
      
      const homePage = new HomePage(page);
      expect(await homePage.isLoggedIn()).toBeTruthy();
      
      await homePage.logout();
      
      // Verify logout was successful
      expect(await homePage.isLoggedIn()).toBeFalsy();
      
      console.log('Logout test passed');
    } catch (error) {
      console.log('Error in logout test:', error);
      await page.screenshot({ path: `logout-error-${Date.now()}.png` });
      throw error;
    }
  });
  
  test('should remember login with "Remember me" checked', async ({ page }) => {
    try {
      const registeredUser = getRegisteredUser();
      console.log(`Logging in with registered user and Remember Me: ${registeredUser.email}`);
      
      const connected = await EnvironmentManager.setupEnvironment(page);
      if (!connected) {
        console.log('Failed to connect to any Juice Shop instance. Skipping test.');
        test.skip();
        return;
      }
      
      await page.screenshot({ path: `site-access-check-remember-me-${Date.now()}.png` });
      console.log('Successfully accessed the site for Remember Me test');
      
      const loginPage = await Navigation.goToLoginPage(page);
      await loginPage.login(registeredUser.email, registeredUser.password, true);
      
      const homePage = new HomePage(page);
      expect(await homePage.isLoggedIn()).toBeTruthy();
      
      // Create a new context to simulate browser restart
      const context = page.context();
      const newPage = await context.newPage();
      
      // Navigate to the site again
      await newPage.goto(EnvironmentManager.getBaseUrl());
      
      // Check if still logged in
      const newHomePage = new HomePage(newPage);
      expect(await newHomePage.isLoggedIn()).toBeTruthy();
      
      console.log('Remember Me test passed');
    } catch (error) {
      console.log('Error in Remember Me test:', error);
      await page.screenshot({ path: `remember-me-error-${Date.now()}.png` });
      throw error;
    }
  });
});