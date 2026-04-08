https://developers.google.com/maps/documentation/address-validation/reference/rest/v1/TopLevel/validateAddress#Granularity

# Response

    "verdict": {
      "inputGranularity": "<GRANULARITY ENUM>",
      "validationGranularity": "<GRANULARITY ENUM>",
      "geocodeGranularity": "<GRANULARITY ENUM>",
      "addressComplete": <BOOLEAN>,
      "possibleNextAction": "// irrelevant (it's in beta phase)"
      "hasUnconfirmedComponents": boolean,
      "hasInferredComponents": boolean,
      "hasReplacedComponents": boolean,
      "hasSpellCorrectedComponents": boolean
    },
    address: {
        ... addressComponents": [
            {
                ...
                "componentType": <route | street_number | postal_code | locality | country>,
                "confirmationLevel": <CONFIRMATION LEVEL ENUM>
            }
        ]
    }

# Enums

// <GRANULARITY ENUM>
SUB_PREMISE Below-building level result, such as an apartment.
PREMISE Building-level result.
PREMISE_PROXIMITY A geocode that approximates the building-level location of the address.
BLOCK The address or geocode indicates a block. Only used in regions which have block-level addressing, such as Japan.
ROUTE The geocode or address is granular to route, such as a street, road, or highway.
OTHER All other granularities, which are bucketed together since they are not deliverable.

In short: SUB_PREMISE means google could validate down to apartment number in a building. That's the level required for address being shippable. Anything less than that -> return response that prompts for confirmation / correction or rejection of untrustworthy address. SO three response types: happy path / confirmation or correct path / rejection path (and also error, of course).

// <CONFIRMATION LEVEL ENUM>
CONFIRMED We were able to verify that this component exists and makes sense in the context of the rest of the address.
UNCONFIRMED_BUT_PLAUSIBLE This component could not be confirmed, but it is plausible that it exists. For example, a street number within a known valid range of numbers on a street where specific house numbers are not known.
This component was not confirmed and is likely to be wrong. For example, a neighborhood that does not fit the rest of the address.

# Strategy

// Waterfall (Funnel) Approach
Check for "Deal Breakers" first, then "Auto-Accepts," and whatever is left falls into "Review."

1. The "Hard Reject" (Red Light)
   Logic: If any of these are true, the address is undeliverable.
   Granularity Check: validationGranularity is ROUTE, BLOCK, OTHER, or PREMISE_PROXIMITY.
   Completeness Check: addressComplete is false.
   Suspicion Check: Any component has confirmationLevel of UNCONFIRMED_AND_SUSPICIOUS.
   Return: STATUS: REJECTED

2. The "Happy Path" (Green Light)
   Logic: If it passed the Red Light, check if it is perfect.
   Granularity: validationGranularity is SUB_PREMISE (Apartment) OR PREMISE (House/Building). Note: PREMISE must be accepted, otherwise people in houses cannot buy.
   Zero Noise: All has... flags (Unconfirmed, Inferred, Replaced, SpellCorrected) are false.
   Confidence: All route | street_number | postal_code | locality | country have confirmationLevel: CONFIRMED.
   Return: STATUS: ACCEPT

3. The "Did You Mean?" (Auto-Correction)
   Logic: It’s a deliverable address, but the API changed something significant (fixed a typo, swapped Street for Avenue).
   Triggers: hasSpellCorrectedComponents is true OR hasReplacedComponents is true.
   Safety Net: Ensure validationGrngAction from "@/app/actions/
   T, SPELL_CORRECTED ADDRESS OBJECT

4. The "Are You Sure?" (Confirmation Needed)
   Logic: The address technically exists, but something is fuzzy. This is the catch-all for "Almost Perfect."
   Scenario A (The Missing Apartment): inputGranularity was SUB_PREMISE (User typed Apt 5) BUT validationGranularity is PREMISE (Google found the building but not Apt 5).
   Scenario B (New Construction): A component is UNCONFIRMED_BUT_PLAUSIBLE. (The street number looks correct mathematically, but Google hasn't driven a car past it yet).
   Return: STATUS: CONFIRMATION_NEEDED, ORIGINAL ADDRESS OBJ
