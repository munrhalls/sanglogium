import { NextResponse } from 'next/server'
import { getQueueRedis } from '@/lib/queue/redis'
import { TRACE_LIST_KEY } from '@/lib/queue/constants'

export async function GET() {
  const redis = getQueueRedis()
  const raw = await redis.lrange(TRACE_LIST_KEY, 0, -1)
  const entries = raw
    .map((r) => (typeof r === 'string' ? JSON.parse(r) : r))
    .reverse() // LPUSH means newest-first; reverse to chronological
  return NextResponse.json(entries)
}
