import { NextResponse } from 'next/server'
import { getQueueRedis } from '@/lib/queue/redis'
import { TRACE_LIST_KEY, QUEUE_LIST_KEY } from '@/lib/queue/constants'

export async function POST() {
  const redis = getQueueRedis()
  await redis.del(TRACE_LIST_KEY)
  await redis.del(QUEUE_LIST_KEY)
  await redis.del('lock:checkout:processing')
  return NextResponse.json({ ok: true })
}
