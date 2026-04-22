// API route for expired reservation cleanup
// Called by Netlify scheduled function every 5 minutes
// Triggers backgroundCleanupJob to release stock and delete expired docs

import { NextResponse } from 'next/server'
import { backgroundCleanupJob } from '@/lib/queue/cleanup'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const results = await backgroundCleanupJob()
    return NextResponse.json({ success: true, results }, { status: 200 })
  } catch (error) {
    console.error('Cleanup job failed:', error)
    return NextResponse.json({ success: false, error: 'Cleanup job failed' }, { status: 500 })
  }
}
