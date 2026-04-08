import { GoogleValidationResponse } from "@/app/actions/address/address";

const MOCK_GOOGLE_SUCCESS: GoogleValidationResponse = {
  result: {
    verdict: {
      addressComplete: true,
      inputGranularity: "PREMISE",
      validationGranularity: "PREMISE",
      geocodeGranularity: "PREMISE",
      hasReplacedComponents: false,
      hasSpellCorrectedComponents: false,
    },
    address: {
      addressComponents: [
        { componentType: "route", componentName: { text: "Woodstock Road" } },
        { componentType: "street_number", componentName: { text: "28" } },
        { componentType: "locality", componentName: { text: "London" } },
        { componentType: "postal_code", componentName: { text: "W4 5RA" } },
      ],
      postalAddress: { regionCode: "GB" },
    },
    geocode: {
      location: {
        latitude: 51.4934,
        longitude: -0.2678,
      },
      placeId: "ChIJdd4hrwug2EcRmSrV3Vo6llI",
    },
  },
};

export { MOCK_GOOGLE_SUCCESS };
