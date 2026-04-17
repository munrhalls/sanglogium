// Integration Test Setup
// Manages test server lifecycle for all integration tests

import { testServer } from './tests/helpers/test-server'
import { vi } from 'vitest'

// Restore original fetch for integration tests
beforeAll(() => {
  // Clear global fetch mock to allow real API calls
  if (vi.isMockFunction(global.fetch)) {
    vi.unstubAllGlobals()
  }
})

// Start server before all tests
beforeAll(async () => {
  console.log('Setting up integration test environment...')

  try {
    await testServer.start()

    // Wait for server to be ready and perform health check
    const maxAttempts = 30
    let attempts = 0
    let healthy = false

    while (attempts < maxAttempts && !healthy) {
      healthy = await testServer.healthCheck()
      if (!healthy) {
        await new Promise(resolve => setTimeout(resolve, 1000))
        attempts++
      }
    }

    if (!healthy) {
      throw new Error('Test server failed health check after 30 seconds')
    }

    console.log('Integration test server is ready')
  } catch (error) {
    console.error('Failed to start integration test server:', error)
    throw error
  }
}, 60000) // 60s timeout for server start

// Stop server after all tests
afterAll(async () => {
  console.log('Tearing down integration test environment...')

  try {
    await testServer.stop()
    console.log('Integration test server stopped successfully')
  } catch (error) {
    console.error('Failed to stop integration test server:', error)
  }
}, 60000) // 60s timeout for server stop

// Export for use in tests
export { testServer }
