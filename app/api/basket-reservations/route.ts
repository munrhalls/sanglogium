import { NextRequest, NextResponse } from 'next/server'
import { backendClient } from '@/sanity/lib/backendClient'

export async function GET() {
  try {
    const query = `*[_type == "basketReservation"] | order(_createdAt desc)`
    const reservations = await backendClient.fetch(query)
    return NextResponse.json({ count: reservations.length, reservations })
  } catch (error) {
    console.error('Error fetching basket reservations:', error)
    return NextResponse.json(
      { error: 'Failed to fetch reservations' },
      { status: 500 }
    )
  }
}

export async function DELETE() {
  try {
    const query = `*[_type == "basketReservation"]`
    const reservations = await backendClient.fetch(query)
    
    if (!Array.isArray(reservations)) {
      return NextResponse.json({ count: 0, deleted: 0 })
    }
    
    const deletedCount = reservations.length
    for (const reservation of reservations) {
      await backendClient.delete(reservation._id)
    }
    
    return NextResponse.json({ count: deletedCount, deleted: deletedCount })
  } catch (error) {
    console.error('Error deleting basket reservations:', error)
    return NextResponse.json(
      { error: 'Failed to delete reservations' },
      { status: 500 }
    )
  }
}
