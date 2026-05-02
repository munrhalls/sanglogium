import client from "./getClient.mjs";

/**
 * This script fixes products with displayPrice=0 by setting estimated market prices.
 *
 * --- HOW TO USE ---
 *
 * 1. Dry Run (Recommended First):
 * $ node ./sanity/utils/fixZeroPrices.mjs --dry-run
 *
 * 2. Real Update:
 * $ node ./sanity/utils/fixZeroPrices.mjs
 */

// Estimated prices based on typical market values for these products
const PRICE_ESTIMATES = {
  // Power Accessories
  ZuUKzmkqDyQwdcwhxxgchs: 249, // AudioQuest IEC 3-Outlet Power Strip
  mhejwYdgiH5W70wqaK7C6w: 45, // Lutron Caseta Wireless Pico Remote
  ZuUKzmkqDyQwdcwhxxgteM: 2800, // McIntosh MPC500 Power Controller

  // HDMI Cables (AudioQuest Pearl series - premium 48Gbps)
  ZuUKzmkqDyQwdcwhxxfaEe: 79, // AudioQuest Pearl 48 HDMI - .75m
  Y7l1IhzX2fnyiano58Fnge: 99, // AudioQuest Pearl 48 HDMI - 1.5m

  // USB Cables
  mhejwYdgiH5W70wqaK7ngk: 69, // AudioQuest Pearl USB-A to USB-B - 1.5m

  // Subwoofers
  dLGDVDmEEI2lV8CArJ0Qzk: 1100, // Bowers & Wilkins ASW 610XP 10" Subwoofer
  dLGDVDmEEI2lV8CArJ0eCq: 3500, // Sonus faber Gravis I Subwoofer (Black)
  ZuUKzmkqDyQwdcwhxwzCoE: 5500, // Sonus faber Gravis III Active Subwoofer (Wenge)

  // RCA Audio Cables (JL Audio)
  Y7l1IhzX2fnyiano58Giz2: 60, // JL Audio 2-Channel Core RCA - 6 ft - 2-Pack
  dLGDVDmEEI2lV8CArJQDa0: 85, // JL Audio Twisted-Pair RCA - 18 ft
  dLGDVDmEEI2lV8CArJQcP6: 120, // JL Audio XB-BLUAIC2-9 Premium Interconnect 9"

  // Vinyl
  dLGDVDmEEI2lV8CArAdYEO: 25, // La La Lie / Case Of Insanity - Vinyl LP

  // McIntosh Electronics (High-End)
  Y7l1IhzX2fnyiano4jAFf2: 11000, // McIntosh C2800 Vacuum Tube Preamp
  dLGDVDmEEI2lV8CArAj4E0: 9500, // McIntosh C55 Solid State Preamp
  ZuUKzmkqDyQwdcwhxlJpXB: 7000, // McIntosh DS200 Streaming DAC
  dLGDVDmEEI2lV8CArAfLRM: 14000, // McIntosh MC257 7 Channel Power Amp
  ZuUKzmkqDyQwdcwhxlGDH5: 12500, // McIntosh MX123 A/V Processor
  Y7l1IhzX2fnyiano56QdsC: 15000, // McIntosh MX180 A/V Processor

  // Meze Audio Headphone Cables (Premium)
  dLGDVDmEEI2lV8CArJQRxs: 99, // Meze 99 Gold Standard 3.5mm - 9.94 ft
  dLGDVDmEEI2lV8CArJQSL6: 109, // Meze 99 Gold w/ Mic 3.5mm - 3.9 ft
  ZuUKzmkqDyQwdcwhxxgHdV: 79, // Meze 99 Silver Standard 3.5mm - 9.94 ft
  dLGDVDmEEI2lV8CArJQStA: 89, // Meze 99 Silver w/ Mic 3.5mm - 3.9 ft
  Y7l1IhzX2fnyiano58H1hn: 119, // Meze 3.5mm to 2.5mm Balanced - 4.9 ft

  // SVS Cables
  mhejwYdgiH5W70wqaK7lmg: 55, // SVS SoundPath RCA Subwoofer Cable - 3m
  ZuUKzmkqDyQwdcwhxxfmf0: 69, // SVS SoundPath Ultra 8K HDMI - 2m
  ZuUKzmkqDyQwdcwhxxfn3F: 89, // SVS SoundPath Ultra 8K HDMI - 3m

  // Sanus Speaker Mounts
  ZuUKzmkqDyQwdcwhxx0JMe: 65, // Sanus Adjustable Mount Sonos Era 100 - Each (Black)
  Y7l1IhzX2fnyiano57anzP: 65, // Sanus Adjustable Mount Sonos Era 100 - Each (White)
  A5Y8wEwAn6Fo0zYQ5BM6cZ: 49, // Sanus Ultra High Speed 8K HDMI - 2m
  ZuUKzmkqDyQwdcwhxx0QJc: 130, // Sanus Fixed Mounts Sonos Era 100 - Pair (Black)
  ZuUKzmkqDyQwdcwhxx0QvK: 130, // Sanus Fixed Mounts Sonos Era 100 - Pair (White)

  // madVR Video Processors (High-End)
  Y7l1IhzX2fnyiano56QYDd: 4500, // madVR Envy Core Video Processor
  ZuUKzmkqDyQwdcwhxvlsnw: 8500, // madVR Envy Extreme MK2 Video Processor
  Y7l1IhzX2fnyiano56QcX6: 6500, // madVR Envy Pro MK2 Video Processor
};

async function fixZeroPrices() {
  const isDryRun = process.argv.includes("--dry-run");

  if (isDryRun) {
    console.log("🚀 Running in DRY RUN mode. No data will be modified.\n");
  } else {
    console.log("🚀 Running in LIVE mode. Data will be modified.\n");
  }

  try {
    // Fetch all products with displayPrice = 0
    const productsWithZeroPrice = await client.fetch(
      `*[_type == "product" && displayPrice == 0]{
        _id,
        name,
        displayPrice
      } | order(name asc)`
    );

    if (productsWithZeroPrice.length === 0) {
      console.log(
        "✅ No products found with displayPrice = 0. Nothing to fix!"
      );
      return;
    }

    console.log(
      `🔍 Found ${productsWithZeroPrice.length} products with displayPrice = 0.\n`
    );

    // Separate products into those we can fix and those we can't
    const productsToFix = [];
    const productsWithoutEstimate = [];

    productsWithZeroPrice.forEach((product) => {
      if (PRICE_ESTIMATES[product._id]) {
        productsToFix.push({
          ...product,
          estimatedPrice: PRICE_ESTIMATES[product._id],
        });
      } else {
        productsWithoutEstimate.push(product);
      }
    });

    if (productsWithoutEstimate.length > 0) {
      console.log(
        "⚠️  WARNING: The following products have no price estimate:"
      );
      productsWithoutEstimate.forEach((p) => {
        console.log(`   - ${p._id}: "${p.name}"`);
      });
      console.log(
        "\nThese will be skipped. Add them to PRICE_ESTIMATES if needed.\n"
      );
    }

    if (productsToFix.length === 0) {
      console.log("❌ No products can be fixed with current price estimates.");
      return;
    }

    console.log(`📝 Will update ${productsToFix.length} products:\n`);

    // Create transaction
    const transaction = client.transaction();
    let updateCount = 0;

    productsToFix.forEach((product) => {
      const { _id, name, estimatedPrice } = product;

      if (isDryRun) {
        console.log(`[DRY RUN] -> Would update "${name}"`);
        console.log(`            ID: ${_id}`);
        console.log(`            New displayPrice: $${estimatedPrice}`);
        console.log("");
      } else {
        transaction.patch(_id, (patch) =>
          patch.set({ displayPrice: estimatedPrice })
        );
        updateCount++;
        console.log(`✓ Queued: "${name}" → $${estimatedPrice}`);
      }
    });

    // Commit transaction
    if (!isDryRun) {
      console.log("\n⚙️  Committing transaction...");
      const result = await transaction.commit();
      console.log(`✅ Success! Updated ${result.results.length} products.`);
    } else {
      console.log("\n🏁 Dry run complete. No changes made.");
    }

    // Summary
    console.log("\n" + "=".repeat(60));
    console.log("📊 SUMMARY:");
    console.log(
      `   Products with displayPrice = 0: ${productsWithZeroPrice.length}`
    );
    console.log(`   Products fixed: ${productsToFix.length}`);
    console.log(
      `   Products skipped (no estimate): ${productsWithoutEstimate.length}`
    );
    console.log("=".repeat(60) + "\n");
  } catch (error) {
    console.error("❌ Error during price fix:", error);
    process.exit(1);
  }
}

// Run the fix
fixZeroPrices();
