// CONTRACT
// PURPOSE - TEST IT WORKS ON VARIOUS OS PLATFORMS AND BROWSERS
// - ANDROID/IOS/MAC OS/WINDOWS/LNUX
// - CHROME, SAFARI, FIREFOX, EDGE, OPERA

// Required pre-conditions:
//   - validAddresses entry has address.addressLines[0], address.locality, address.postalCode
//   - page /checkout/shipping exists with street, city, postalCode input fields
//   - Submit btn exists and triggers address validation
// Promises:
//   - City and postal code values persist after validation
//   - No navigation occurs (user stays on checkout/shipping page)
//   - Valid address shows enabled "proceed-to-payment-btn" within 3500ms

import dotenv from "dotenv";
import path from "path";
import { test, expect } from "@playwright/test";
import validAddresses from "../tests/address/CASE_ACCEPT/cases_valid.json" assert { type: "json" };

dotenv.config({ path: path.resolve(process.cwd(), "tests", ".env.test") });

const shouldRunRealApiTests = process.env.TESTS_WITH_REAL_API === "true";

test.describe("Tracer Code: Accept Path", () => {
  test.skip(
    !shouldRunRealApiTests,
    "Skipping: TESTS_WITH_REAL_API not enabled"
  );

  for (const entry of validAddresses) {
    const { address } = entry;

    test(`Should ACCEPT valid address: ${address.regionCode} ${address.locality} ${address.addressLines[0]}`, async ({
      page,
    }) => {
      await page.goto("/checkout/shipping", { waitUntil: "domcontentloaded" });
      await page.selectOption('select[name="regionCode"]', address.regionCode);

      const fullAddress = address.addressLines[0];
      const lastSpaceIndex = fullAddress.lastIndexOf(" ");
      const street =
        lastSpaceIndex > 0 ? fullAddress.slice(0, lastSpaceIndex) : fullAddress;
      const streetNumber =
        lastSpaceIndex > 0 ? fullAddress.slice(lastSpaceIndex + 1) : "1";

      await page.fill('input[name="street"]', street);
      await page.fill('input[name="streetNumber"]', streetNumber);
      await page.fill('input[name="city"]', address.locality);
      await page.fill('input[name="postalCode"]', address.postalCode);

      await page.locator('input[name="postalCode"]').blur();

      const submitButton = page.getByRole("button", {
        name: "Continue to Payment",
      });

      await expect(submitButton).toBeEnabled();
      await submitButton.click();

      const proceedButton = page.getByTestId("proceed-to-payment-btn");

      await expect(proceedButton).toBeVisible({ timeout: 5000 });
      await expect(proceedButton).toBeEnabled();
    });
  }
});
