import { Page, Locator } from '@playwright/test';
import { EnvironmentManager } from '@utils/environmentManager';

/**
 * Base Page Object class that all page objects should extend
 */
export class BasePage {
  /**
   * Constructor
   * @param page Playwright page object
   */
  constructor(protected page: Page) {}

  /**
   * Navigate to a specific URL path
   * @param path The path to navigate to (will be appended to the base URL)
   * @param retries Number of retries if navigation fails
   */
  async navigate(path: string = '', retries: number = 2): Promise<boolean> {
    const baseUrl = EnvironmentManager.getBaseUrl();
    const url = new URL(path, baseUrl).toString();
    
    let success = false;
    let attempts = 0;
    
    while (!success && attempts <= retries) {
      try {
        console.log(`Navigating to ${url} (attempt ${attempts + 1}/${retries + 1})`);
        await this.page.goto(url, { 
          timeout: 30000,
          waitUntil: 'domcontentloaded'
        });
        success = true;
      } catch (error) {
        console.log(`Navigation error (attempt ${attempts + 1}/${retries + 1}):`, error);
        
        if (attempts === retries) {
          console.log('All retries failed, attempting to use fallback URLs...');
          success = await EnvironmentManager.setupEnvironment(this.page);
          
          if (success && path) {
            const newBaseUrl = EnvironmentManager.getBaseUrl();
            const newUrl = new URL(path, newBaseUrl).toString();
            
            try {
              console.log(`Navigating to ${newUrl} with fallback URL`);
              await this.page.goto(newUrl, { 
                timeout: 30000,
                waitUntil: 'domcontentloaded'
              });
            } catch (pathError) {
              console.log(`Failed to navigate to path with fallback URL:`, pathError);
              success = false;
            }
          }
        }
        
        attempts++;
      }
    }
    
    return success;
  }

  /**
   * Wait for navigation to complete
   * @param options Options for waiting
   */
  async waitForNavigation(options = { waitUntil: 'networkidle' }): Promise<void> {
    await this.page.waitForLoadState(options.waitUntil as any);
  }

  /**
   * Check if an element is visible
   * @param selector CSS selector for the element
   * @param timeout Timeout in milliseconds
   * @returns True if the element is visible, false otherwise
   */
  async isVisible(selector: string, timeout = 5000): Promise<boolean> {
    try {
      await this.page.waitForSelector(selector, { state: 'visible', timeout });
      return true;
    } catch (error) {
      return false;
    }
  }

  /**
   * Click on an element
   * @param selector CSS selector for the element
   * @param options Options for clicking
   */
  async click(selector: string, options = {}): Promise<void> {
    await this.dismissOverlaysIfPresent();
    await this.page.click(selector, options);
  }

  /**
   * Fill a form field
   * @param selector CSS selector for the form field
   * @param value Value to fill
   */
  async fill(selector: string, value: string): Promise<void> {
    await this.dismissOverlaysIfPresent();
    await this.page.fill(selector, value);
  }

  /**
   * Take a screenshot
   * @param name Name of the screenshot
   */
  async takeScreenshot(name: string): Promise<void> {
    await this.page.screenshot({ path: `${name}-${Date.now()}.png` });
  }

  /**
   * Dismiss overlays or dialogs that may block UI interactions
   */
  async dismissOverlaysIfPresent(): Promise<void> {
    // Dismiss welcome banner if present
    const welcomeBanner = this.page.locator('app-welcome-banner button');
    if (await welcomeBanner.isVisible()) {
      try {
        await welcomeBanner.click();
        console.log('Dismissed welcome banner');
      } catch (error) {
        console.log('Error dismissing welcome banner:', error);
      }
    }

    // Dismiss cookie consent if present
    const cookieConsent = this.page.locator('div[aria-label="cookieconsent"] button');
    if (await cookieConsent.isVisible()) {
      try {
        await cookieConsent.click();
        console.log('Dismissed cookie consent');
      } catch (error) {
        console.log('Error dismissing cookie consent:', error);
      }
    }

    // Dismiss any other dialogs or overlays as needed
    // Add more dismissal logic here as needed
  }

  /**
   * Get a locator for an element
   * @param selector CSS selector for the element
   * @returns Playwright Locator object
   */
  getLocator(selector: string): Locator {
    return this.page.locator(selector);
  }
}