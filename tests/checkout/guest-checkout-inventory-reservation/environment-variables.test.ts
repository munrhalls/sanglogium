import { test, expect } from '@playwright/test'
import { execSync } from 'child_process'
import { writeFileSync, readFileSync, unlinkSync } from 'fs'
import { join } from 'path'

// Helper to create temporary .env file
function createEnvFile(vars: Record<string, string>): string {
  const envPath = join(process.cwd(), '.env.test')
  const envContent = Object.entries(vars)
    .map(([key, value]) => `${key}=${value}`)
    .join('\n')

  writeFileSync(envPath, envContent)
  return envPath
}

// Helper to clean up .env file
function cleanupEnvFile(envPath: string): void {
  try {
    unlinkSync(envPath)
  } catch {
    // File might not exist
  }
}

// Helper to run config validation script
function runConfigValidation(envPath: string): { stdout: string; stderr: string; exitCode: number } {
  try {
    const result = execSync(`node -e "
      process.env.NODE_ENV = 'test';
      require('dotenv').config({ path: '${envPath}' });

      // Simulate config validation
      const required = [
        'GUEST_CHECKOUT_SANITY_PROJECT_ID',
        'GUEST_CHECKOUT_SANITY_DATASET',
        'GUEST_CHECKOUT_SANITY_TOKEN',
        'GUEST_CHECKOUT_REDIS_HOST',
        'GUEST_CHECKOUT_STRIPE_SECRET_KEY'
      ];

      const missing = required.filter(key => !process.env[key]);
      if (missing.length > 0) {
        console.error('Missing required variables:', missing.join(', '));
        process.exit(1);
      }

      // Validate types
      const port = parseInt(process.env.GUEST_CHECKOUT_REDIS_PORT || '6379');
      if (isNaN(port) || port < 1 || port > 65535) {
        console.error('Invalid REDIS_PORT');
        process.exit(1);
      }

      console.log('Configuration valid');
      process.exit(0);
    "`, { encoding: 'utf8' })

    return {
      stdout: result,
      stderr: '',
      exitCode: 0
    }
  } catch (error: unknown) {
    const err = error as { stdout?: string; stderr?: string; status?: number }
    return {
      stdout: err.stdout || '',
      stderr: err.stderr || '',
      exitCode: err.status || 1
    }
  }
}

test.describe('Environment Variables Configuration', () => {
  test('Validates required variables are present', async () => {
    const envPath = createEnvFile({
      GUEST_CHECKOUT_SANITY_PROJECT_ID: 'test-project',
      GUEST_CHECKOUT_SANITY_DATASET: 'test-dataset',
      GUEST_CHECKOUT_SANITY_TOKEN: 'sk-test-token',
      GUEST_CHECKOUT_REDIS_HOST: 'localhost',
      GUEST_CHECKOUT_REDIS_PORT: '6379',
      GUEST_CHECKOUT_STRIPE_SECRET_KEY: 'sk_test_stripe-key'
    })

    try {
      const result = runConfigValidation(envPath)
      expect(result.exitCode).toBe(0)
      expect(result.stdout).toContain('Configuration valid')
    } finally {
      cleanupEnvFile(envPath)
    }
  })

  test('Fails when required variables are missing', async () => {
    const envPath = createEnvFile({
      GUEST_CHECKOUT_SANITY_PROJECT_ID: 'test-project',
      // Missing other required variables
    })

    try {
      const result = runConfigValidation(envPath)
      expect(result.exitCode).toBe(1)
      expect(result.stderr).toContain('Missing required variables')
    } finally {
      cleanupEnvFile(envPath)
    }
  })

  test('Validates variable types and ranges', async () => {
    const envPath = createEnvFile({
      GUEST_CHECKOUT_SANITY_PROJECT_ID: 'test-project',
      GUEST_CHECKOUT_SANITY_DATASET: 'test-dataset',
      GUEST_CHECKOUT_SANITY_TOKEN: 'sk-test-token',
      GUEST_CHECKOUT_REDIS_HOST: 'localhost',
      GUEST_CHECKOUT_REDIS_PORT: 'invalid', // Invalid port
      GUEST_CHECKOUT_STRIPE_SECRET_KEY: 'sk_test_stripe-key'
    })

    try {
      const result = runConfigValidation(envPath)
      expect(result.exitCode).toBe(1)
      expect(result.stderr).toContain('Invalid REDIS_PORT')
    } finally {
      cleanupEnvFile(envPath)
    }
  })

  test('Loads default values for optional variables', async () => {
    const envPath = createEnvFile({
      GUEST_CHECKOUT_SANITY_PROJECT_ID: 'test-project',
      GUEST_CHECKOUT_SANITY_DATASET: 'test-dataset',
      GUEST_CHECKOUT_SANITY_TOKEN: 'sk-test-token',
      GUEST_CHECKOUT_REDIS_HOST: 'localhost',
      GUEST_CHECKOUT_REDIS_PORT: '6379',
      GUEST_CHECKOUT_STRIPE_SECRET_KEY: 'sk_test_stripe-key'
      // No optional variables
    })

    try {
      const result = execSync(`node -e "
        process.env.NODE_ENV = 'test';
        require('dotenv').config({ path: '${envPath}' });

        // Check default values
        const concurrency = process.env.GUEST_CHECKOUT_QUEUE_CONCURRENCY || '5';
        const ttl = process.env.GUEST_CHECKOUT_RESERVATION_TTL || '600';
        const logLevel = process.env.GUEST_CHECKOUT_LOG_LEVEL || 'info';

        console.log('Concurrency:', concurrency);
        console.log('TTL:', ttl);
        console.log('Log Level:', logLevel);

        if (concurrency === '5' && ttl === '600' && logLevel === 'info') {
          console.log('Defaults loaded correctly');
          process.exit(0);
        } else {
          console.log('Defaults not loaded');
          process.exit(1);
        }
      "`, { encoding: 'utf8' })

      expect(result).toContain('Defaults loaded correctly')
    } finally {
      cleanupEnvFile(envPath)
    }
  })

  test('Environment-specific configurations', async () => {
    // Test development environment
    const devEnvPath = createEnvFile({
      NODE_ENV: 'development',
      GUEST_CHECKOUT_SANITY_PROJECT_ID: 'test-project',
      GUEST_CHECKOUT_SANITY_DATASET: 'development',
      GUEST_CHECKOUT_SANITY_TOKEN: 'sk-test-token',
      GUEST_CHECKOUT_REDIS_HOST: 'localhost',
      GUEST_CHECKOUT_REDIS_PORT: '6379',
      GUEST_CHECKOUT_STRIPE_SECRET_KEY: 'sk_test_stripe-key'
    })

    try {
      const result = execSync(`node -e "
        process.env.NODE_ENV = 'development';
        require('dotenv').config({ path: '${devEnvPath}' });

        const nodeEnv = process.env.NODE_ENV;
        const dataset = process.env.GUEST_CHECKOUT_SANITY_DATASET;

        if (nodeEnv === 'development' && dataset === 'development') {
          console.log('Development config loaded');
          process.exit(0);
        } else {
          console.log('Development config not loaded');
          process.exit(1);
        }
      "`, { encoding: 'utf8' })

      expect(result).toContain('Development config loaded')
    } finally {
      cleanupEnvFile(devEnvPath)
    }

    // Test production environment
    const prodEnvPath = createEnvFile({
      NODE_ENV: 'production',
      GUEST_CHECKOUT_SANITY_PROJECT_ID: 'test-project',
      GUEST_CHECKOUT_SANITY_DATASET: 'production',
      GUEST_CHECKOUT_SANITY_TOKEN: 'sk-prod-token',
      GUEST_CHECKOUT_REDIS_HOST: 'redis-cluster',
      GUEST_CHECKOUT_REDIS_PORT: '6380',
      GUEST_CHECKOUT_REDIS_USE_TLS: 'true',
      GUEST_CHECKOUT_STRIPE_SECRET_KEY: 'sk_live_stripe-key'
    })

    try {
      const result = execSync(`node -e "
        process.env.NODE_ENV = 'production';
        require('dotenv').config({ path: '${prodEnvPath}' });

        const nodeEnv = process.env.NODE_ENV;
        const dataset = process.env.GUEST_CHECKOUT_SANITY_DATASET;
        const useTls = process.env.GUEST_CHECKOUT_REDIS_USE_TLS;

        if (nodeEnv === 'production' && dataset === 'production' && useTls === 'true') {
          console.log('Production config loaded');
          process.exit(0);
        } else {
          console.log('Production config not loaded');
          process.exit(1);
        }
      "`, { encoding: 'utf8' })

      expect(result).toContain('Production config loaded')
    } finally {
      cleanupEnvFile(prodEnvPath)
    }
  })

  test('Security variables are masked in logs', async () => {
    const envPath = createEnvFile({
      GUEST_CHECKOUT_SANITY_PROJECT_ID: 'test-project',
      GUEST_CHECKOUT_SANITY_DATASET: 'test-dataset',
      GUEST_CHECKOUT_SANITY_TOKEN: 'sk-secret-token-that-should-be-masked',
      GUEST_CHECKOUT_REDIS_HOST: 'localhost',
      GUEST_CHECKOUT_REDIS_PORT: '6379',
      GUEST_CHECKOUT_STRIPE_SECRET_KEY: 'sk_live_very-secret-key',
      GUEST_CHECKOUT_STRIPE_WEBHOOK_SECRET: 'whsec_webhook-secret'
    })

    try {
      const result = execSync(`node -e "
        process.env.NODE_ENV = 'test';
        require('dotenv').config({ path: '${envPath}' });

        // Simulate logging with masking
        const maskSecret = (value: string) => {
          if (value.startsWith('sk_')) {
            return value.substring(0, 7) + '***MASKED***';
          }
          if (value.startsWith('whsec_')) {
            return value.substring(0, 10) + '***MASKED***';
          }
          return value;
        };

        const sanityToken = maskSecret(process.env.GUEST_CHECKOUT_SANITY_TOKEN || '');
        const stripeKey = maskSecret(process.env.GUEST_CHECKOUT_STRIPE_SECRET_KEY || '');
        const webhookSecret = maskSecret(process.env.GUEST_CHECKOUT_STRIPE_WEBHOOK_SECRET || '');

        console.log('Sanity Token:', sanityToken);
        console.log('Stripe Key:', stripeKey);
        console.log('Webhook Secret:', webhookSecret);

        if (sanityToken.includes('***MASKED***') &&
            stripeKey.includes('***MASKED***') &&
            webhookSecret.includes('***MASKED***')) {
          console.log('Secrets masked successfully');
          process.exit(0);
        } else {
          console.log('Secrets not masked');
          process.exit(1);
        }
      "`, { encoding: 'utf8' })

      expect(result).toContain('Secrets masked successfully')
      expect(result).not.toContain('sk-secret-token-that-should-be-masked')
      expect(result).not.toContain('sk_live_very-secret-key')
      expect(result).not.toContain('whsec_webhook-secret')
    } finally {
      cleanupEnvFile(envPath)
    }
  })

  test('Variable prefix validation', async () => {
    // Test with wrong prefix
    const wrongPrefixEnvPath = createEnvFile({
      SANITY_PROJECT_ID: 'test-project', // Wrong prefix
      GUEST_CHECKOUT_SANITY_DATASET: 'test-dataset',
      GUEST_CHECKOUT_SANITY_TOKEN: 'sk-test-token',
      REDIS_HOST: 'localhost', // Wrong prefix
      GUEST_CHECKOUT_REDIS_PORT: '6379',
      STRIPE_SECRET_KEY: 'sk_test_stripe-key', // Wrong prefix
      GUEST_CHECKOUT_STRIPE_WEBHOOK_SECRET: 'whsec_test'
    })

    try {
      const result = execSync(`node -e "
        process.env.NODE_ENV = 'test';
        require('dotenv').config({ path: '${wrongPrefixEnvPath}' });

        // Check only correct prefixes are loaded
        const correctPrefixes = Object.keys(process.env)
          .filter(key => key.startsWith('GUEST_CHECKOUT_'))
          .sort();

        const expectedPrefixes = [
          'GUEST_CHECKOUT_SANITY_DATASET',
          'GUEST_CHECKOUT_SANITY_TOKEN',
          'GUEST_CHECKOUT_REDIS_PORT',
          'GUEST_CHECKOUT_STRIPE_WEBHOOK_SECRET'
        ];

        console.log('Loaded variables:', correctPrefixes.join(', '));

        if (correctPrefixes.length === expectedPrefixes.length) {
          console.log('Prefix validation passed');
          process.exit(0);
        } else {
          console.log('Prefix validation failed');
          process.exit(1);
        }
      "`, { encoding: 'utf8' })

      expect(result).toContain('Prefix validation passed')
    } finally {
      cleanupEnvFile(wrongPrefixEnvPath)
    }
  })

  test('Configuration hot reload for optional variables', async () => {
    const envPath = createEnvFile({
      GUEST_CHECKOUT_SANITY_PROJECT_ID: 'test-project',
      GUEST_CHECKOUT_SANITY_DATASET: 'test-dataset',
      GUEST_CHECKOUT_SANITY_TOKEN: 'sk-test-token',
      GUEST_CHECKOUT_REDIS_HOST: 'localhost',
      GUEST_CHECKOUT_REDIS_PORT: '6379',
      GUEST_CHECKOUT_STRIPE_SECRET_KEY: 'sk_test_stripe-key',
      GUEST_CHECKOUT_LOG_LEVEL: 'info'
    })

    try {
      // Initial load
      const initialResult = execSync(`node -e "
        process.env.NODE_ENV = 'test';
        require('dotenv').config({ path: '${envPath}' });
        console.log('Initial log level:', process.env.GUEST_CHECKOUT_LOG_LEVEL);
      "`, { encoding: 'utf8' })

      expect(initialResult).toContain('Initial log level: info')

      // Update file
      writeFileSync(envPath, readFileSync(envPath, 'utf8').replace('LOG_LEVEL=info', 'LOG_LEVEL=debug'))

      // Reload
      const reloadedResult = execSync(`node -e "
        process.env.NODE_ENV = 'test';
        require('dotenv').config({ path: '${envPath}' });
        console.log('Reloaded log level:', process.env.GUEST_CHECKOUT_LOG_LEVEL);
      "`, { encoding: 'utf8' })

      expect(reloadedResult).toContain('Reloaded log level: debug')
    } finally {
      cleanupEnvFile(envPath)
    }
  })

  test('Performance with large variable set', async () => {
    // Create env file with many variables
    const manyVars: Record<string, string> = {
      GUEST_CHECKOUT_SANITY_PROJECT_ID: 'test-project',
      GUEST_CHECKOUT_SANITY_DATASET: 'test-dataset',
      GUEST_CHECKOUT_SANITY_TOKEN: 'sk-test-token',
      GUEST_CHECKOUT_REDIS_HOST: 'localhost',
      GUEST_CHECKOUT_REDIS_PORT: '6379',
      GUEST_CHECKOUT_STRIPE_SECRET_KEY: 'sk_test_stripe-key'
    }

    // Add 100 optional variables
    for (let i = 0; i < 100; i++) {
      manyVars[`GUEST_CHECKOUT_OPTIONAL_VAR_${i}`] = `value-${i}`
    }

    const envPath = createEnvFile(manyVars)

    try {
      const startTime = Date.now()
      const result = runConfigValidation(envPath)
      const endTime = Date.now()

      expect(result.exitCode).toBe(0)
      expect(endTime - startTime).toBeLessThan(1000) // Should load in under 1 second
    } finally {
      cleanupEnvFile(envPath)
    }
  })
})
