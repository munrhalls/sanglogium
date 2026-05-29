import { submitShippingAction } from "@/app/actions/address/address";

export const runtime = 'nodejs';

interface ShippingRequestBody {
  regionCode: string;
  postalCode: string;
  street: string;
  streetNumber: string;
  city: string;
}

export async function POST(req: Request) {
  const body = await req.json();
  const { regionCode, postalCode, street, streetNumber, city } = body as ShippingRequestBody;

  // Call server action for Google validation
  // Contact fields are not required for standalone address validation
  const validation = await submitShippingAction({
    firstName: "",
    lastName: "",
    phone: "",
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

  return Response.json({
    status: validation.status === "ACCEPT" ? "CONFIRMED" : "FIX",
    correctedAddress: validation.address,
  });
}
