#!/usr/bin/env node

import { createClient } from "@sanity/client";
import dotenv from "dotenv";
dotenv.config();

const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || "production",
  apiVersion: "2023-01-01",
  useCdn: false,
  token: process.env.SANITY_STUDIO_READ_WRITE,
});

const basketReservationId = process.argv[2];

if (!basketReservationId) {
  console.error('Usage: node debug-basket-reservation.mjs <basketReservationId>');
  process.exit(1);
}

async function debugBasketReservation() {
  console.log(`\n=== Debugging basket reservation: ${basketReservationId} ===\n`);

  try {
    // Fetch the reservation
    const reservation = await client.fetch(
      `*[_id == $id][0]{
        _id,
        _type,
        shippingAddress,
        basketReservation[]{ _id, quantity, verifiedPrice },
        createdAt
      }`,
      { id: basketReservationId }
    );

    if (!reservation) {
      console.error('❌ Reservation not found');
      process.exit(1);
    }

    console.log('✅ Reservation found:');
    console.log(`   _id: ${reservation._id}`);
    console.log(`   _type: ${reservation._type}`);
    console.log(`   createdAt: ${reservation.createdAt}`);
    console.log(`   shippingAddress: ${JSON.stringify(reservation.shippingAddress, null, 2)}`);
    console.log(`   basketReservation count: ${reservation.basketReservation?.length || 0}`);

    if (reservation.basketReservation && reservation.basketReservation.length > 0) {
      console.log('\n   Basket items:');
      reservation.basketReservation.forEach((item, i) => {
        console.log(`     ${i + 1}. _id: ${item._id}, quantity: ${item.quantity}, verifiedPrice: ${item.verifiedPrice}`);
      });

      // Fetch product parcel data
      const productIds = reservation.basketReservation.map(item => item._id);
      const products = await client.fetch(
        `*[_id in $ids]{ _id, name, parcel }`,
        { ids: productIds }
      );

      console.log('\n   Product parcel data:');
      products.forEach((product, i) => {
        console.log(`     ${i + 1}. _id: ${product._id}`);
        console.log(`        name: ${product.name}`);
        console.log(`        parcel: ${JSON.stringify(product.parcel, null, 2)}`);
      });
    }

    // Check validation requirements
    console.log('\n=== Validation Check ===');
    console.log(`shippingAddress exists: ${!!reservation.shippingAddress}`);
    console.log(`shippingAddress.regionCode: ${reservation.shippingAddress?.regionCode}`);
    console.log(`shippingAddress.postalCode: ${reservation.shippingAddress?.postalCode}`);
    console.log(`shippingAddress.street: ${reservation.shippingAddress?.street}`);
    console.log(`shippingAddress.city: ${reservation.shippingAddress?.city}`);
    console.log(`basketReservation exists: ${!!reservation.basketReservation}`);
    console.log(`basketReservation not empty: ${reservation.basketReservation?.length > 0}`);

  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

debugBasketReservation();
