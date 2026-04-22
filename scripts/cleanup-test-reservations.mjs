// Delete all test basketReservation documents from test dataset
// Used to clean up accumulated test state

import { createClient } from '@sanity/client'
import 'dotenv/config'

const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: process.env.SANITY_STUDIO_DATASET || 'test',
  useCdn: false,
  apiVersion: '2024-11-14',
  token: process.env.SANITY_STUDIO_READ_WRITE || process.env.SANITY_API_TOKEN,
})

async function cleanupTestReservations() {
  console.log('=== CLEANUP TEST RESERVATIONS ===')
  
  try {
    // Fetch all basketReservation documents
    const reservations = await client.fetch(`
      *[_type == "basketReservation"] { _id }
    `)
    
    console.log(`Found ${reservations.length} basketReservation documents`)
    
    if (reservations.length === 0) {
      console.log('No reservations to delete')
      return
    }
    
    // Delete all reservations
    const transaction = client.transaction()
    reservations.forEach(reservation => {
      transaction.delete(reservation._id)
    })
    
    await transaction.commit()
    console.log(`Deleted ${reservations.length} basketReservation documents`)
    
  } catch (error) {
    console.error('Error cleaning up reservations:', error)
    process.exit(1)
  }
}

cleanupTestReservations()
