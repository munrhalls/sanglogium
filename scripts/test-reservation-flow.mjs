import { createClient } from 'next-sanity';

const projectId = '2tdmkpky';
const dataset = 'test';
const apiVersion = '2024-11-14';
const token = process.env.SANITY_STUDIO_READ_WRITE_CREATE || process.env.SANITY_API_TOKEN;

const writeClient = createClient({
  projectId,
  dataset,
  apiVersion,
  useCdn: false,
  token,
});

const readClient = createClient({
  projectId,
  dataset,
  apiVersion,
  useCdn: false,
});

console.log('Starting reservation flow test...');

// Create reservation document
const reservation = await writeClient.create({
  _type: "basketReservation",
  basketReservation: [
    {
      _id: "YcMKSEyusPBTcaoe1xiP1b", // Product ID
      quantity: 1,
      verifiedPrice: 10000,
    },
  ],
  createdAt: new Date().toISOString(),
});

console.log('Created reservation with ID:', reservation._id);
console.log('Reservation _type:', reservation._type);
console.log('Reservation ID equals product ID?', reservation._id === "YcMKSEyusPBTcaoe1xiP1b");

// Verify document exists
const verify = await readClient.fetch(
  `*[_type == "basketReservation" && _id == $id][0]{_id, _type, basketReservation}`,
  { id: reservation._id }
);
console.log('Verification fetch result:', verify);

// Try to mutate with the reservation ID
try {
  const result = await writeClient
    .patch(reservation._id)
    .set({
      shippingAddress: {
        regionCode: 'PL',
        postalCode: '00-001',
        street: 'Test Street',
        streetNumber: '1',
        city: 'Warsaw',
      },
    })
    .commit();
  console.log('Mutation successful with reservation ID:', reservation._id);
} catch (error) {
  console.error('Mutation failed with reservation ID:', reservation._id);
  console.error('Error:', error.message);
}

// Try to mutate with the product ID (this should fail)
try {
  const result = await writeClient
    .patch("YcMKSEyusPBTcaoe1xiP1b")
    .set({
      shippingAddress: {
        regionCode: 'PL',
        postalCode: '00-001',
        street: 'Test Street',
        streetNumber: '1',
        city: 'Warsaw',
      },
    })
    .commit();
  console.log('Mutation successful with product ID (unexpected!)');
} catch (error) {
  console.error('Mutation failed with product ID (expected):', error.message);
}

// Cleanup
await writeClient.delete(reservation._id);
console.log('Cleaned up reservation document');
