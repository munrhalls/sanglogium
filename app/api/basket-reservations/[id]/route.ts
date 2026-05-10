import { NextRequest, NextResponse } from 'next/server'
import { getBackendClient } from '@/sanity-cms/lib/backendClient'

interface ShippingChoice {
  provider: string
  serviceLevel: string
  rateId: string
  amount: number
  currency: string
  estimatedDays: number
}

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params

    const backendClient = getBackendClient()
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

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params
    const body = await request.json()
    const { shippingChoice } = body as { shippingChoice?: ShippingChoice }

    if (!shippingChoice) {
      return NextResponse.json(
        { error: 'shippingChoice is required' },
        { status: 400 }
      )
    }

    const backendClient = getBackendClient()

    // Verify reservation exists
    const query = `*[_type == "basketReservation" && _id == $id][0]`
    const reservation = await backendClient.fetch(query, { id })

    if (!reservation) {
      return NextResponse.json(
        { error: 'Reservation not found' },
        { status: 404 }
      )
    }

    // Update reservation with shipping choice
    await backendClient
      .patch(id)
      .set({ shippingChoice })
      .commit()

    return NextResponse.json({ success: true, shippingChoice })
  } catch (error) {
    console.error('Error updating basket reservation:', error)
    return NextResponse.json(
      { error: 'Failed to update reservation' },
      { status: 500 }
    )
  }
}
