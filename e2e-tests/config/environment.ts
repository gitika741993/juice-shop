/**
 * Environment configuration for tests
 */

/**
 * Environment interface
 */
export interface Environment {
    name: string;
    baseUrl: string;
    fallbackUrls?: string[];
    credentials: {
      admin: {
        email: string;
        password: string;
      };
      customer: {
        email: string;
        password: string;
      };
    };
  }
  
  /**
   * Available environments
   */
  export const environments: Record<string, Environment> = {
    local: {
      name: 'local',
      baseUrl: 'http://localhost:3000',
      credentials: {
        admin: {
          email: 'admin@juice-sh.op',
          password: 'admin123',
        },
        customer: {
          email: 'demo@juice-sh.op',
          password: 'demo',
        },
      },
    },
    dev: {
      name: 'development',
      baseUrl: 'https://demo.owasp-juice.shop',
      fallbackUrls: [
        'https://juice-shop.herokuapp.com',
        'https://juice-shop-v14.herokuapp.com',
        'https://juice-shop-v15.herokuapp.com'
      ],
      credentials: {
        admin: {
          email: 'admin@juice-sh.op',
          password: 'admin123',
        },
        customer: {
          email: 'demo@juice-sh.op',
          password: 'demo',
        },
      },
    },
    staging: {
      name: 'staging',
      baseUrl: 'https://demo.owasp-juice.shop',
      fallbackUrls: [
        'https://juice-shop-staging.herokuapp.com',
        'https://juice-shop.herokuapp.com'
      ],
      credentials: {
        admin: {
          email: 'admin@juice-sh.op',
          password: 'admin123',
        },
        customer: {
          email: 'demo@juice-sh.op',
          password: 'demo',
        },
      },
    },
    production: {
      name: 'production',
      baseUrl: 'https://demo.owasp-juice.shop',
      fallbackUrls: [
        'https://juice-shop.herokuapp.com',
        'https://juice-shop-v14.herokuapp.com',
        'https://juice-shop-v15.herokuapp.com'
      ],
      credentials: {
        admin: {
          email: 'admin@juice-sh.op',
          password: 'admin123',
        },
        customer: {
          email: 'demo@juice-sh.op',
          password: 'demo',
        },
      },
    },
  };
  
  /**
   * Get the current environment
   * @returns The current environment
   */
  export function getCurrentEnvironment(): Environment {
    const env = process.env.ENV || 'local';
    return environments[env.toLowerCase()] || environments.local;
  }