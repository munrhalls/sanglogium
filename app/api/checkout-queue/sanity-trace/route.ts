import { NextResponse } from 'next/server'
import { getQueueRedis } from '@/lib/queue/redis'
import { SANITY_TRACE_LIST_KEY } from '@/lib/queue/constants'

export async function GET() {
  const redis = getQueueRedis()
  const raw = await redis.lrange(SANITY_TRACE_LIST_KEY, 0, -1)
  const entries = raw
    .map((r) => (typeof r === 'string' ? JSON.parse(r) : r))
    .reverse()
  return NextResponse.json(entries)
}
