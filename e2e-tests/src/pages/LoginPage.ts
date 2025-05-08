import { Page } from '@playwright/test';
import { BasePage } from './BasePage';
import { Navigation } from '../utils/navigation';

/**
 * Login Page Object
 */
export class LoginPage extends BasePage {
  // Selectors
  private readonly emailInput = '#email';
  private readonly passwordInput = '#password';
  private readonly loginButton = '#loginButton';
  private readonly rememberMeCheckbox = '#rememberMe';
  private readonly errorMessage = '.error';
  private readonly newCustomerLink = '#newCustomerLink';
  
  /**
   * Constructor
   * @param page Playwright page object
   */
  constructor(page: Page) {
    super(page);
  }
  
  /**
   * Navigate to the login page
   */
  async navigateToLogin(): Promise<void> {
    await this.navigate('/#/login');
    await this.dismissOverlaysIfPresent();
  }
  
  /**
   * Login with the provided credentials
   * @param email Email address
   * @param password Password
   * @param rememberMe Whether to check the "Remember Me" checkbox
   * @returns True if login was successful, false otherwise
   */
  async login(email: string, password: string, rememberMe: boolean = false): Promise<boolean> {
    try {
      console.log(`Attempting to login with email: ${email}`);
      
      // Fill the email field
      await this.fill(this.emailInput, email);
      console.log('Filled email field');
      
      // Fill the password field
      await this.fill(this.passwordInput, password);
      console.log('Filled password field');
      
      // Check the "Remember Me" checkbox if requested
      if (rememberMe) {
        try {
          // Try direct click first
          await this.click(this.rememberMeCheckbox);
          console.log('Clicked Remember Me checkbox');
        } catch (error) {
          console.log('Error clicking Remember Me checkbox, trying JavaScript click:', error);
          
          // If direct click fails, try using JavaScript
          await this.page.evaluate(() => {
            const checkbox = document.querySelector('#rememberMe') as HTMLInputElement;
            if (checkbox) {
              checkbox.checked = true;
              checkbox.dispatchEvent(new Event('change', { bubbles: true }));
            }
          });
          
          console.log('Used JavaScript to check Remember Me checkbox');
        }
      }
      
      // Take a screenshot before clicking login
      await this.takeScreenshot('before-login-click');
      
      // Click the login button
      await this.click(this.loginButton);
      console.log('Clicked login button');
      
      // Wait for navigation to complete
      await this.waitForNavigation();
      console.log('Navigation completed after login');
      
      // Take a screenshot after login attempt
      await this.takeScreenshot('after-login-click');
      
      // Check if login was successful by verifying the URL
      const currentUrl = this.page.url();
      const isLoggedIn = !currentUrl.includes('/login');
      
      if (isLoggedIn) {
        console.log('Login successful');
      } else {
        console.log('Login failed - still on login page');
      }
      
      return isLoggedIn;
    } catch (error) {
      console.log('Error during login:', error);
      
      // Take a screenshot on error
      await this.takeScreenshot('login-error');
      
      // Try a fallback login approach if the first attempt failed
      try {
        console.log('Attempting fallback login approach');
        
        // Navigate to login page again
        await this.navigateToLogin();
        
        // Fill the email field
        await this.page.fill(this.emailInput, email);
        
        // Fill the password field
        await this.page.fill(this.passwordInput, password);
        
        // Click the login button
        await this.page.click(this.loginButton);
        
        // Wait for navigation to complete
        await this.waitForNavigation();
        
        // Check if login was successful
        const currentUrl = this.page.url();
        const isLoggedIn = !currentUrl.includes('/login');
        
        if (isLoggedIn) {
          console.log('Fallback login successful');
        } else {
          console.log('Fallback login failed');
        }
        
        return isLoggedIn;
      } catch (fallbackError) {
        console.log('Fallback login also failed:', fallbackError);
        return false;
      }
    }
  }
  
  /**
   * Get the error message displayed on the login page
   * @returns The error message text
   */
  async getErrorMessage(): Promise<string> {
    try {
      await this.page.waitForSelector(this.errorMessage, { state: 'visible', timeout: 5000 });
      const message = await this.page.textContent(this.errorMessage);
      return message || '';
    } catch (error) {
      console.log('Error getting error message:', error);
      return '';
    }
  }
  
  /**
   * Click the "New Customer" link to go to the registration page
   */
  async goToRegistration(): Promise<void> {
    await this.click(this.newCustomerLink);
    await this.waitForNavigation();
  }
}