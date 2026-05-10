import { createClient } from "next-sanity";
import { apiVersion, dataset, projectId } from "@/sanity-cms/env";
import { submitShippingAction } from "@/app/actions/address/address";

export const runtime = 'nodejs';

// Create write client directly in API route to avoid bundling/caching issues
const writeToken = process.env.SANITY_STUDIO_READ_WRITE || process.env.SANITY_STUDIO_READ_WRITE_CREATE || process.env.SANITY_API_TOKEN;
const writeClient = createClient({
  projectId,
  dataset,
  apiVersion,
  useCdn: false,
  token: writeToken,
});

interface ShippingRequestBody {
  regionCode: string;
  postalCode: string;
  street: string;
  streetNumber: string;
  city: string;
  reservationId: string;
}

export async function POST(req: Request) {
  const body = await req.json();
  const { regionCode, postalCode, street, streetNumber, city, reservationId } = body as ShippingRequestBody;

  // Call server action for Google validation
  const validation = await submitShippingAction({
    regionCode,
    postalCode,
    street,
    streetNumber,
    city,
  });

  if (validation.status === "FIX" || !validation.address) {
    return Response.json({
      status: "FIX",
      correctedAddress: null,
    });
  }

  const correctedAddress = validation.address;

  // If address is accepted, mutate Sanity basket reservation document
  // (Note: server action returns "ACCEPT", frontend expects "CONFIRMED" for backward compatibility)
  if (validation.status === "ACCEPT" && correctedAddress && reservationId) {
    await writeClient
      .patch(reservationId)
      .set({
        shippingAddress: correctedAddress,
      })
      .commit();
  }

  return Response.json({
    status: validation.status === "ACCEPT" ? "CONFIRMED" : "FIX",
    correctedAddress,
  });
}
