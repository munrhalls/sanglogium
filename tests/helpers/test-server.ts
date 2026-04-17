// Test Server Helper for Integration Tests
// Simplified approach that assumes dev server is already running

export class TestServer {
  private port: number
  private ready: boolean = false

  constructor(port = 3002) {
    this.port = port
  }

  async start(): Promise<void> {
    console.log(`Checking for test server on port ${this.port}...`)

    // Don't start server, just check if it's running
    // User needs to manually run: npm run dev
    await this.waitForReady()
  }

  async stop(): Promise<void> {
    console.log('Test server cleanup complete (server not managed by tests)')
    this.ready = false
  }

  async waitForReady(timeout = 30000): Promise<void> {
    const startTime = Date.now()

    while (!this.ready && Date.now() - startTime < timeout) {
      try {
        const healthy = await this.healthCheck()
        if (healthy) {
          this.ready = true
          console.log(`Test server is ready on port ${this.port}`)
          return
        }
      } catch {
        // Server not ready yet
      }
      await new Promise(resolve => setTimeout(resolve, 1000))
    }

    throw new Error(
      `Test server not found on port ${this.port}. Please run 'npm run dev' in another terminal.`
    )
  }

  async healthCheck(): Promise<boolean> {
    try {
      const response = await fetch(this.getUrl('/'), {
        signal: AbortSignal.timeout(5000)
      })
      return response.ok
    } catch {
      return false
    }
  }

  getUrl(path: string): string {
    return `http://localhost:${this.port}${path}`
  }

  isReady(): boolean {
    return this.ready
  }
}

// Singleton instance for all tests
export const testServer = new TestServer()
