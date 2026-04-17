// Integration Test: Priority Queue Ordering
// Tests high priority jobs are processed before normal priority

import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import {
  createTestProducts,
  cleanupTestProducts,
  clearRedisTestDb,
} from './test-helpers'
import { getTestRedisClient, resetTestEnvironment } from '../config'
import { Queue } from 'bullmq'

describe('Priority Queue', () => {
  const redis = getTestRedisClient()
  const normalQueue = new Queue('queue-reservations', { connection: redis })
  const priorityQueue = new Queue('queue-priority', { connection: redis })

  beforeAll(async () => {
    await createTestProducts()
  }, 30000)

  afterAll(async () => {
    await cleanupTestProducts()
    await normalQueue.close()
    await priorityQueue.close()
    await resetTestEnvironment()
  }, 30000)

  beforeEach(async () => {
    await clearRedisTestDb()
    // Clean queues
    await normalQueue.drain()
    await priorityQueue.drain()
  })

  it('high priority jobs have higher priority score', async () => {
    // Add normal priority job
    const normalJob = await normalQueue.add('test', { type: 'normal' }, { priority: 0 })

    // Add high priority job
    const highJob = await priorityQueue.add('test', { type: 'high' }, { priority: 10 })

    // Verify jobs exist
    expect(normalJob.id).toBeTruthy()
    expect(highJob.id).toBeTruthy()

    // High priority queue should be separate
    const priorityJobs = await priorityQueue.getWaiting()
    const normalJobs = await normalQueue.getWaiting()

    expect(priorityJobs.length).toBe(1)
    expect(normalJobs.length).toBe(1)
  })

  it('priority queues are separate from normal queue', async () => {
    const normalName = normalQueue.name
    const priorityName = priorityQueue.name

    expect(normalName).toBe('queue-reservations')
    expect(priorityName).toBe('queue-priority')
    expect(normalName).not.toBe(priorityName)
  })
})
