import { NextRequest, NextResponse } from 'next/server'
import { backendClient } from '@/sanity/lib/backendClient'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params

    const query = `*[_type == "basketReservation" && _id == $id][0]`
    const reservation = await backendClient.fetch(query, { id })

    if (!reservation) {
      return NextResponse.json(
        { error: 'Reservation not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(reservation)
  } catch (error) {
    console.error('Error fetching basket reservation:', error)
    return NextResponse.json(
      { error: 'Failed to fetch reservation' },
      { status: 500 }
    )
  }
}
