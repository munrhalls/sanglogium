# Environment Variables Specification

## Overview

Environment configuration for the guest checkout inventory reservation system. All variables are prefixed with `GUEST_CHECKOUT_` to avoid conflicts.

## Required Variables

### Database & CMS Connection

```bash
# Sanity CMS Configuration
GUEST_CHECKOUT_SANITY_PROJECT_ID=your_project_id
GUEST_CHECKOUT_SANITY_DATASET=production
GUEST_CHECKOUT_SANITY_API_VERSION=2024-06-20

# Sanity API Token (read/write access)
GUEST_CHECKOUT_SANITY_TOKEN=sk_your_sanity_token
```

### Redis Configuration

```bash
# Redis Connection
GUEST_CHECKOUT_REDIS_HOST=localhost
GUEST_CHECKOUT_REDIS_PORT=6379
GUEST_CHECKOUT_REDIS_PASSWORD=your_redis_password
GUEST_CHECKOUT_REDIS_DB=0

# Redis TLS (production)
GUEST_CHECKOUT_REDIS_TLS_PORT=6380
GUEST_CHECKOUT_REDIS_USE_TLS=true
```

### Stripe Configuration

```bash
# Stripe API Keys
GUEST_CHECKOUT_STRIPE_SECRET_KEY=sk_live_your_stripe_secret_key
GUEST_CHECKOUT_STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret

# Stripe API Version
GUEST_CHECKOUT_STRIPE_API_VERSION=2024-06-20
```

## Optional Variables

### Queue Configuration

```bash
# Queue Processing
GUEST_CHECKOUT_QUEUE_CONCURRENCY=5
GUEST_CHECKOUT_QUEUE_TIMEOUT=30000
GUEST_CHECKOUT_QUEUE_RETRY_DELAY_BASE=1000
GUEST_CHECKOUT_QUEUE_RETRY_DELAY_MAX=30000
GUEST_CHECKOUT_QUEUE_RETRY_JITTER=0.25

# Circuit Breaker
GUEST_CHECKOUT_CIRCUIT_BREAKER_FAILURE_THRESHOLD=5
GUEST_CHECKOUT_CIRCUIT_BREAKER_RECOVERY_TIMEOUT=30000
```

### TTL Configuration

```bash
# Reservation TTL (seconds)
GUEST_CHECKOUT_RESERVATION_TTL=600
GUEST_CHECKOUT_IDEMPOTENCY_TTL=86400

# Cleanup Intervals (milliseconds)
GUEST_CHECKOUT_CLEANUP_INTERVAL=30000
GUEST_CHECKOUT_EXPIRED_CHECK_INTERVAL=60000
```

### Logging Configuration

```bash
# Log Level (error, warn, info, debug)
GUEST_CHECKOUT_LOG_LEVEL=info

# Log Format
GUEST_CHECKOUT_LOG_FORMAT=json

# Log Destination
GUEST_CHECKOUT_LOG_FILE_PATH=/var/log/guest-checkout.log
GUEST_CHECKOUT_LOG_MAX_SIZE=100MB
GUEST_CHECKOUT_LOG_MAX_FILES=5
```

### Monitoring Configuration

```bash
# Metrics
GUEST_CHECKOUT_METRICS_ENABLED=true
GUEST_CHECKOUT_METRICS_PORT=9090

# Health Check
GUEST_CHECKOUT_HEALTH_CHECK_INTERVAL=30000
GUEST_CHECKOUT_HEALTH_CHECK_TIMEOUT=5000
```

### Development Variables

```bash
# Environment
NODE_ENV=development

# Debug Mode
GUEST_CHECKOUT_DEBUG=true
GUEST_CHECKOUT_VERBOSE_LOGGING=true

# Feature Flags
GUEST_CHECKOUT_ENABLE_QUEUE_PROCESSING=true
GUEST_CHECKOUT_ENABLE_CIRCUIT_BREAKER=true
GUEST_CHECKOUT_ENABLE_RETRY_LOGIC=true
```

## Configuration Files

### .env.example

```bash
# Copy this file to .env and fill in your values

# Sanity CMS
GUEST_CHECKOUT_SANITY_PROJECT_ID=
GUEST_CHECKOUT_SANITY_DATASET=production
GUEST_CHECKOUT_SANITY_API_VERSION=2024-06-20
GUEST_CHECKOUT_SANITY_TOKEN=

# Redis
GUEST_CHECKOUT_REDIS_HOST=localhost
GUEST_CHECKOUT_REDIS_PORT=6379
GUEST_CHECKOUT_REDIS_PASSWORD=
GUEST_CHECKOUT_REDIS_DB=0

# Stripe
GUEST_CHECKOUT_STRIPE_SECRET_KEY=
GUEST_CHECKOUT_STRIPE_WEBHOOK_SECRET=
GUEST_CHECKOUT_STRIPE_API_VERSION=2024-06-20

# Queue
GUEST_CHECKOUT_QUEUE_CONCURRENCY=5
GUEST_CHECKOUT_QUEUE_TIMEOUT=30000

# TTL
GUEST_CHECKOUT_RESERVATION_TTL=600
GUEST_CHECKOUT_IDEMPOTENCY_TTL=86400

# Logging
GUEST_CHECKOUT_LOG_LEVEL=info
GUEST_CHECKOUT_LOG_FORMAT=json

# Environment
NODE_ENV=development
```

### Configuration Validation

```typescript
// config/validation.ts
import Joi from 'joi'

const envSchema = Joi.object({
  // Sanity
  GUEST_CHECKOUT_SANITY_PROJECT_ID: Joi.string().required(),
  GUEST_CHECKOUT_SANITY_DATASET: Joi.string().required(),
  GUEST_CHECKOUT_SANITY_API_VERSION: Joi.string().required(),
  GUEST_CHECKOUT_SANITY_TOKEN: Joi.string().required(),
  
  // Redis
  GUEST_CHECKOUT_REDIS_HOST: Joi.string().required(),
  GUEST_CHECKOUT_REDIS_PORT: Joi.number().port().default(6379),
  GUEST_CHECKOUT_REDIS_PASSWORD: Joi.string().allow('').default(''),
  GUEST_CHECKOUT_REDIS_DB: Joi.number().integer().min(0).max(15).default(0),
  
  // Stripe
  GUEST_CHECKOUT_STRIPE_SECRET_KEY: Joi.string().required(),
  GUEST_CHECKOUT_STRIPE_WEBHOOK_SECRET: Joi.string().required(),
  GUEST_CHECKOUT_STRIPE_API_VERSION: Joi.string().default('2024-06-20'),
  
  // Queue
  GUEST_CHECKOUT_QUEUE_CONCURRENCY: Joi.number().integer().min(1).max(20).default(5),
  GUEST_CHECKOUT_QUEUE_TIMEOUT: Joi.number().integer().min(5000).default(30000),
  
  // TTL
  GUEST_CHECKOUT_RESERVATION_TTL: Joi.number().integer().min(60).max(3600).default(600),
  GUEST_CHECKOUT_IDEMPOTENCY_TTL: Joi.number().integer().min(3600).max(86400 * 7).default(86400),
  
  // Circuit Breaker
  GUEST_CHECKOUT_CIRCUIT_BREAKER_FAILURE_THRESHOLD: Joi.number().integer().min(3).max(20).default(5),
  GUEST_CHECKOUT_CIRCUIT_BREAKER_RECOVERY_TIMEOUT: Joi.number().integer().min(10000).default(30000),
  
  // Logging
  GUEST_CHECKOUT_LOG_LEVEL: Joi.string().valid('error', 'warn', 'info', 'debug').default('info'),
  GUEST_CHECKOUT_LOG_FORMAT: Joi.string().valid('json', 'text').default('json'),
  
  // Environment
  NODE_ENV: Joi.string().valid('development', 'production', 'test').required()
})

export function validateEnv(): void {
  const { error, value } = envSchema.validate(process.env, {
    allowUnknown: true,
    stripUnknown: true
  })
  
  if (error) {
    throw new Error(`Environment validation failed: ${error.message}`)
  }
  
  // Set validated values back to process.env
  Object.assign(process.env, value)
}
```

### Configuration Loading

```typescript
// config/index.ts
export interface Config {
  sanity: {
    projectId: string
    dataset: string
    apiVersion: string
    token: string
  }
  
  redis: {
    host: string
    port: number
    password?: string
    db: number
    useTls: boolean
  }
  
  stripe: {
    secretKey: string
    webhookSecret: string
    apiVersion: string
  }
  
  queue: {
    concurrency: number
    timeout: number
    retryDelayBase: number
    retryDelayMax: number
    retryJitter: number
  }
  
  ttl: {
    reservation: number
    idempotency: number
  }
  
  circuitBreaker: {
    failureThreshold: number
    recoveryTimeout: number
  }
  
  logging: {
    level: string
    format: string
  }
  
  isDevelopment: boolean
  isProduction: boolean
}

export function loadConfig(): Config {
  return {
    sanity: {
      projectId: process.env.GUEST_CHECKOUT_SANITY_PROJECT_ID!,
      dataset: process.env.GUEST_CHECKOUT_SANITY_DATASET!,
      apiVersion: process.env.GUEST_CHECKOUT_SANITY_API_VERSION!,
      token: process.env.GUEST_CHECKOUT_SANITY_TOKEN!
    },
    
    redis: {
      host: process.env.GUEST_CHECKOUT_REDIS_HOST!,
      port: parseInt(process.env.GUEST_CHECKOUT_REDIS_PORT || '6379'),
      password: process.env.GUEST_CHECKOUT_REDIS_PASSWORD || undefined,
      db: parseInt(process.env.GUEST_CHECKOUT_REDIS_DB || '0'),
      useTls: process.env.NODE_ENV === 'production'
    },
    
    stripe: {
      secretKey: process.env.GUEST_CHECKOUT_STRIPE_SECRET_KEY!,
      webhookSecret: process.env.GUEST_CHECKOUT_STRIPE_WEBHOOK_SECRET!,
      apiVersion: process.env.GUEST_CHECKOUT_STRIPE_API_VERSION || '2024-06-20'
    },
    
    queue: {
      concurrency: parseInt(process.env.GUEST_CHECKOUT_QUEUE_CONCURRENCY || '5'),
      timeout: parseInt(process.env.GUEST_CHECKOUT_QUEUE_TIMEOUT || '30000'),
      retryDelayBase: parseInt(process.env.GUEST_CHECKOUT_QUEUE_RETRY_DELAY_BASE || '1000'),
      retryDelayMax: parseInt(process.env.GUEST_CHECKOUT_QUEUE_RETRY_DELAY_MAX || '30000'),
      retryJitter: parseFloat(process.env.GUEST_CHECKOUT_QUEUE_RETRY_JITTER || '0.25')
    },
    
    ttl: {
      reservation: parseInt(process.env.GUEST_CHECKOUT_RESERVATION_TTL || '600'),
      idempotency: parseInt(process.env.GUEST_CHECKOUT_IDEMPOTENCY_TTL || '86400')
    },
    
    circuitBreaker: {
      failureThreshold: parseInt(process.env.GUEST_CHECKOUT_CIRCUIT_BREAKER_FAILURE_THRESHOLD || '5'),
      recoveryTimeout: parseInt(process.env.GUEST_CHECKOUT_CIRCUIT_BREAKER_RECOVERY_TIMEOUT || '30000')
    },
    
    logging: {
      level: process.env.GUEST_CHECKOUT_LOG_LEVEL || 'info',
      format: process.env.GUEST_CHECKOUT_LOG_FORMAT || 'json'
    },
    
    isDevelopment: process.env.NODE_ENV === 'development',
    isProduction: process.env.NODE_ENV === 'production'
  }
}
```

## Environment-Specific Configurations

### Development (.env.development)

```bash
NODE_ENV=development
GUEST_CHECKOUT_DEBUG=true
GUEST_CHECKOUT_VERBOSE_LOGGING=true

# Use local Redis
GUEST_CHECKOUT_REDIS_HOST=localhost
GUEST_CHECKOUT_REDIS_PORT=6379

# Use development dataset
GUEST_CHECKOUT_SANITY_DATASET=development

# Shorter TTL for testing
GUEST_CHECKOUT_RESERVATION_TTL=60
GUEST_CHECKOUT_IDEMPOTENCY_TTL=3600

# More verbose logging
GUEST_CHECKOUT_LOG_LEVEL=debug
```

### Production (.env.production)

```bash
NODE_ENV=production
GUEST_CHECKOUT_DEBUG=false
GUEST_CHECKOUT_VERBOSE_LOGGING=false

# Production Redis with TLS
GUEST_CHECKOUT_REDIS_HOST=your-redis-cluster.example.com
GUEST_CHECKOUT_REDIS_PORT=6380
GUEST_CHECKOUT_REDIS_USE_TLS=true

# Production dataset
GUEST_CHECKOUT_SANITY_DATASET=production

# Production TTL values
GUEST_CHECKOUT_RESERVATION_TTL=600
GUEST_CHECKOUT_IDEMPOTENCY_TTL=86400

# Production logging
GUEST_CHECKOUT_LOG_LEVEL=warn
GUEST_CHECKOUT_LOG_FORMAT=json

# Production queue settings
GUEST_CHECKOUT_QUEUE_CONCURRENCY=10
GUEST_CHECKOUT_QUEUE_TIMEOUT=15000
```

### Test (.env.test)

```bash
NODE_ENV=test

# Use test Redis instance
GUEST_CHECKOUT_REDIS_HOST=localhost
GUEST_CHECKOUT_REDIS_PORT=6380
GUEST_CHECKOUT_REDIS_DB=1

# Use test dataset
GUEST_CHECKOUT_SANITY_DATASET=test

# Minimal TTL for fast tests
GUEST_CHECKOUT_RESERVATION_TTL=5
GUEST_CHECKOUT_IDEMPOTENCY_TTL=60

# Test logging
GUEST_CHECKOUT_LOG_LEVEL=error
```

## Security Considerations

### Environment Variable Security

```typescript
// config/security.ts
import crypto from 'crypto'

export function encryptSecret(value: string, key: string): string {
  const algorithm = 'aes-256-gcm'
  const iv = crypto.randomBytes(16)
  const cipher = crypto.createCipher(algorithm, key)
  
  let encrypted = cipher.update(value, 'utf8', 'hex')
  encrypted += cipher.final('hex')
  
  const authTag = cipher.getAuthTag()
  
  return iv.toString('hex') + ':' + authTag.toString('hex') + ':' + encrypted
}

export function decryptSecret(encryptedValue: string, key: string): string {
  const algorithm = 'aes-256-gcm'
  const parts = encryptedValue.split(':')
  
  const iv = Buffer.from(parts[0], 'hex')
  const authTag = Buffer.from(parts[1], 'hex')
  const encrypted = parts[2]
  
  const decipher = crypto.createDecipher(algorithm, key)
  decipher.setAuthTag(authTag)
  
  let decrypted = decipher.update(encrypted, 'hex', 'utf8')
  decrypted += decipher.final('utf8')
  
  return decrypted
}

// Usage for sensitive environment variables
const ENCRYPTION_KEY = process.env.GUEST_CHECKOUT_ENCRYPTION_KEY || crypto.randomBytes(32).toString('hex')

export function getSecureEnvVar(varName: string): string {
  const encrypted = process.env[varName]
  if (!encrypted) {
    throw new Error(`Missing required environment variable: ${varName}`)
  }
  
  return decryptSecret(encrypted, ENCRYPTION_KEY)
}
```

### Environment Variable Templates

```bash
# scripts/setup-env.sh
#!/bin/bash

echo "Setting up environment variables..."

# Check for required environment variables
required_vars=(
  "GUEST_CHECKOUT_SANITY_PROJECT_ID"
  "GUEST_CHECKOUT_SANITY_TOKEN"
  "GUEST_CHECKOUT_STRIPE_SECRET_KEY"
  "GUEST_CHECKOUT_STRIPE_WEBHOOK_SECRET"
)

missing_vars=()

for var in "${required_vars[@]}"; do
  if [ -z "${!var}" ]; then
    missing_vars+=("$var")
  fi
done

if [ ${#missing_vars[@]} -gt 0 ]; then
  echo "Error: Missing required environment variables:"
  for var in "${missing_vars[@]}"; do
    echo "  - $var"
  done
  exit 1
fi

echo "All required environment variables are set!"
```

## Docker Environment Variables

### Dockerfile

```dockerfile
# Set environment variables
ENV NODE_ENV=production
ENV GUEST_CHECKOUT_QUEUE_CONCURRENCY=5
ENV GUEST_CHECKOUT_RESERVATION_TTL=600
ENV GUEST_CHECKOUT_IDEMPOTENCY_TTL=86400
ENV GUEST_CHECKOUT_LOG_LEVEL=warn
ENV GUEST_CHECKOUT_LOG_FORMAT=json

# Copy environment file
COPY .env.production .env

# Run config validation
RUN npm run validate-env
```

### docker-compose.yml

```yaml
version: '3.8'

services:
  app:
    build: .
    environment:
      - NODE_ENV=production
      - GUEST_CHECKOUT_REDIS_HOST=redis
      - GUEST_CHECKOUT_REDIS_PORT=6379
    env_file:
      - .env.production
    depends_on:
      - redis
      
  redis:
    image: redis:7-alpine
    command: redis-server --requirepass ${REDIS_PASSWORD}
    environment:
      - REDIS_PASSWORD=${REDIS_PASSWORD}
```

## Runtime Configuration Updates

```typescript
// config/runtime.ts
export class RuntimeConfig {
  private config: Config
  private watchers: Map<string, (value: any) => void> = new Map()
  
  constructor(initialConfig: Config) {
    this.config = initialConfig
    this.setupFileWatching()
  }
  
  private setupFileWatching(): void {
    if (this.config.isDevelopment) {
      // Watch .env file for changes in development
      const chokidar = require('chokidar')
      
      chokidar.watch('.env').on('change', () => {
        this.reloadConfig()
      })
    }
  }
  
  private reloadConfig(): void {
    try {
      // Reload environment variables
      delete require.cache[require.resolve('dotenv')]
      require('dotenv').config()
      
      // Validate new configuration
      validateEnv()
      
      // Load new config
      const newConfig = loadConfig()
      
      // Notify watchers of changes
      this.notifyWatchers(this.config, newConfig)
      
      this.config = newConfig
      console.log('Configuration reloaded')
    } catch (error) {
      console.error('Failed to reload configuration:', error)
    }
  }
  
  watch(key: string, callback: (value: any) => void): void {
    this.watchers.set(key, callback)
  }
  
  private notifyWatchers(oldConfig: Config, newConfig: Config): void {
    for (const [key, callback] of this.watchers) {
      const oldValue = this.getNestedValue(oldConfig, key)
      const newValue = this.getNestedValue(newConfig, key)
      
      if (oldValue !== newValue) {
        callback(newValue)
      }
    }
  }
  
  private getNestedValue(obj: any, path: string): any {
    return path.split('.').reduce((current, key) => current?.[key], obj)
  }
  
  getConfig(): Config {
    return this.config
  }
}
```
