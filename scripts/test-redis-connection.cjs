// Test script to verify Redis connection with @upstash/redis
const fs = require('fs')
const path = require('path')

// Load .env file
const envPath = path.join(__dirname, '..', '.env')
const envContent = fs.readFileSync(envPath, 'utf8')
const envVars = {}

envContent.split('\n').forEach(line => {
  const [key, ...valueParts] = line.split('=')
  if (key && valueParts.length > 0) {
    envVars[key.trim()] = valueParts.join('=').trim().replace(/"/g, '')
  }
})

// Set environment variables
Object.assign(process.env, envVars)

// Import @upstash/redis
const { Redis } = require('@upstash/redis')

async function testRedisConnection() {
  console.log('Testing Redis connection with @upstash/redis...\n')

  try {
    // Method 1: Using fromEnv()
    console.log('1. Testing Redis.fromEnv()...')
    const redis1 = Redis.fromEnv()
    
    await redis1.set('test-key', 'test-value')
    const value1 = await redis1.get('test-key')
    console.log(`   Set/Get test: ${value1}`)
    
    await redis1.del('test-key')
    console.log('   \u2705 Redis.fromEnv() works!\n')

    // Method 2: Using explicit config
    console.log('2. Testing explicit config...')
    const redis2 = new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL,
      token: process.env.UPSTASH_REDIS_REST_TOKEN,
    })
    
    await redis2.set('test-key-2', 'test-value-2')
    const value2 = await redis2.get('test-key-2')
    console.log(`   Set/Get test: ${value2}`)
    
    await redis2.del('test-key-2')
    console.log('   \u2705 Explicit config works!\n')

    // Test TTL functionality
    console.log('3. Testing TTL functionality...')
    await redis1.setex('ttl-test', 60, 'expires-in-60s')
    const ttl = await redis1.ttl('ttl-test')
    console.log(`   TTL set: ${ttl} seconds`)
    
    await redis1.del('ttl-test')
    console.log('   \u2705 TTL functionality works!\n')

    console.log('\u2728 All Redis connection tests passed!')
    console.log('Ready to update scripts to use @upstash/redis')

  } catch (error) {
    console.error('\u274c Redis connection test failed:', error.message)
    console.error('Stack:', error.stack)
    process.exit(1)
  }
}

// Run if called directly
if (require.main === module) {
  testRedisConnection()
}

module.exports = { testRedisConnection }
