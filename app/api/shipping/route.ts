import { createClient } from "next-sanity";
import { apiVersion, dataset, projectId } from "@/sanity/env";

export const runtime = 'nodejs';

// Create write client directly in API route to avoid bundling/caching issues
const writeToken = process.env.SANITY_STUDIO_READ_WRITE || process.env.SANITY_STUDIO_READ_WRITE_CREATE || process.env.SANITY_API_TOKEN;
console.log('SHIPPING ROUTE: writeToken loaded:', writeToken ? 'YES' : 'NO');
console.log('SHIPPING ROUTE: writeToken length:', writeToken?.length);
console.log('SHIPPING ROUTE: writeToken first 10 chars:', writeToken?.substring(0, 10));
const writeClient = createClient({
  projectId,
  dataset,
  apiVersion,
  useCdn: false,
  token: writeToken,
});

interface AddressLines {
  regionCode: string;
  locality: string;
  postalCode: string;
  addressLines: [string];
}

interface GoogleValidationAPIRequest {
  address: AddressLines;
}

interface ShippingRequestBody {
  regionCode: string;
  postalCode: string;
  street: string;
  streetNumber: string;
  city: string;
  reservationId: string;
}

interface AddressComponentName {
  text: string;
  languageCode?: string;
}

interface GoogleAddressComponent {
  componentType: string;
  componentName: AddressComponentName;
}

export async function POST(req: Request) {
  const body = await req.json();
  // Temporarily hardcode API key to isolate environment variable issue
  const apiKey = 'AIzaSyDSYZeJMFcpyVoVzDjx9fFbwv-FnjI8dFI';
  console.log('SHIPPING ROUTE: Using hardcoded API key for debugging');
  console.log('SHIPPING ROUTE: API key length:', apiKey?.length);
  const validationURL = `https://addressvalidation.googleapis.com/v1:validateAddress?key=${apiKey}`;
  console.log('SHIPPING ROUTE: Request URL:', validationURL);

  const { regionCode, postalCode, street, streetNumber, city, reservationId } = body as ShippingRequestBody;

  const regionCodeMap: Record<string, string> = {
    EN: "GB",
    PL: "PL",
  };

  const validationRequestBody: GoogleValidationAPIRequest = {
    address: {
      regionCode: regionCodeMap[regionCode] || regionCode,
      locality: city,
      postalCode: postalCode,
      addressLines: [`${street} ${streetNumber}`],
    },
  };

  console.log('=== SHIPPING ROUTE DEBUG ===');
  console.log('Request URL:', validationURL);
  console.log('Request body:', JSON.stringify(validationRequestBody, null, 2));

  let validationResponse;
  try {
    validationResponse = await fetch(validationURL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(validationRequestBody),
    });
  } catch (error) {
    console.log('Fetch error:', error);
    throw error;
  }

  console.log('Response status:', validationResponse.status);
  console.log('Response status text:', validationResponse.statusText);
  const responseText = await validationResponse.text();
  console.log('Response body:', responseText);
  console.log('=== END SHIPPING ROUTE DEBUG ===');

  const validationData = JSON.parse(responseText);

  const verdict = validationData.result?.verdict;
  const action = verdict?.possibleNextAction || "NULL";

  let status: "FIX" | "PARTIAL" | "CONFIRMED";
  if (action === "FIX") {
    status = "FIX";
  } else if (action === "CONFIRM_ADD_SUBPREMISES") {
    status = "PARTIAL";
  } else {
    status = "CONFIRMED";
  }

  const components = validationData.result?.address?.addressComponents || [];
  const postalAddress = validationData.result?.address?.postalAddress;

  const getGoogleAPIAddressComponent = (type: string) => {
    // @ts-nocheck
    const comp = components.find(
      (c: GoogleAddressComponent) => c.componentType === type
    );
    return comp?.componentName?.text || "";
  };

  const correctedAddress = postalAddress
    ? {
        street: getGoogleAPIAddressComponent("route") || "",
        streetNumber: getGoogleAPIAddressComponent("street_number") || "",
        city:
          getGoogleAPIAddressComponent("locality") ||
          postalAddress.locality ||
          "",
        postalCode: postalAddress.postalCode || "",
        regionCode: postalAddress.regionCode || regionCode,
      }
    : null;

  // If address is confirmed, mutate Sanity basket reservation document
  if (status === "CONFIRMED" && correctedAddress && reservationId) {
    await writeClient
      .patch(reservationId)
      .set({
        shippingAddress: correctedAddress,
      })
      .commit();
  }

  return Response.json({
    status,
    correctedAddress,
  });
}
