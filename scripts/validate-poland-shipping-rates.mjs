#!/usr/bin/env node
/**
 * Poland Shipping Rate Calculation Experiment
 * Validates epaka.pl API returns distance-based shipping rates for Poland domestic shipping.
 *
 * Prerequisites:
 *   1. Register free account at https://www.epaka.pl/uzytkownik/rejestracja
 *   2. Generate OAuth Client ID and Client Secret in user panel (Integracje / API)
 *   3. Set EPAKA_CLIENT_ID, EPAKA_CLIENT_SECRET, EPAKA_USERNAME, EPAKA_PASSWORD env vars
 *
 * Run:
 *   node scripts/validate-poland-shipping-rates.mjs
 */

const BASE_URL = "https://api.epaka.pl";

// Test Configuration
const SENDER = {
  city: "Warszawa",
  postCode: "00-533",
  country: "PL",
};

const RECEIVERS = [
  {
    label: "CLOSE",
    city: "Warszawa",
    postCode: "00-001",
    distanceKm: "~2",
    expected: "lowest rates / shortest timelines",
  },
  {
    label: "MEDIUM",
    city: "Warszawa Praga",
    postCode: "03-001",
    distanceKm: "~8",
    expected: "medium rates / medium timelines",
  },
  {
    label: "FAR",
    city: "Kraków",
    postCode: "30-001",
    distanceKm: "~300",
    expected: "highest rates / longest timelines",
  },
];

const PACKAGE = {
  weight: 1.5,
  height: 15,
  width: 15,
  length: 15,
  type: 0, // standard packaging
};

function logSection(title) {
  console.log(`\n${"=".repeat(60)}`);
  console.log(`  ${title}`);
  console.log(`${"=".repeat(60)}`);
}

async function getAccessToken() {
  const clientId = process.env.EPAKA_CLIENT_ID;
  const clientSecret = process.env.EPAKA_CLIENT_SECRET;
  const username = process.env.EPAKA_USERNAME;
  const password = process.env.EPAKA_PASSWORD;

  if (!clientId || !clientSecret || !username || !password) {
    console.error("Missing required environment variables:");
    console.error("  EPAKA_CLIENT_ID, EPAKA_CLIENT_SECRET, EPAKA_USERNAME, EPAKA_PASSWORD");
    process.exit(1);
  }

  const body = new URLSearchParams({
    grant_type: "password",
    client_id: clientId,
    client_secret: clientSecret,
    username,
    password,
  });

  const res = await fetch(`${BASE_URL}/oauth/token`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body,
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`OAuth token request failed: ${res.status} ${text}`);
  }

  const data = await res.json();
  return data.access_token;
}

async function fetchCourierPrices(token, receiverPostCode) {
  const payload = {
    shippingType: "package",
    senderCountry: SENDER.country,
    senderPostCode: SENDER.postCode,
    receiverCountry: "PL",
    receiverPostCode,
    onlyAvailable: true,
    packages: [PACKAGE],
  };

  const res = await fetch(`${BASE_URL}/v1/order/prices`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Prices request failed: ${res.status} ${text}`);
  }

  return res.json();
}

function summarizeResults(results) {
  const summary = [];
  for (const [label, data] of Object.entries(results)) {
    if (!data.couriers || data.couriers.length === 0) {
      summary.push({ label, cheapest: null, mostExpensive: null, count: 0 });
      continue;
    }
    const prices = data.couriers
      .filter((c) => c.available && c.grossPriceTotal != null)
      .map((c) => ({
        name: c.courier?.name || "Unknown",
        grossPrice: c.grossPriceTotal,
        netPrice: c.netPriceTotal,
        deliveryType: c.courierDeliveryType,
      }))
      .sort((a, b) => a.grossPrice - b.grossPrice);

    summary.push({
      label,
      cheapest: prices[0] || null,
      mostExpensive: prices[prices.length - 1] || null,
      count: prices.length,
      all: prices,
    });
  }
  return summary;
}

function validateDistanceVariation(summary) {
  logSection("VALIDATION: Distance-Based Rate Variation");

  const closeCheapest = summary.find((s) => s.label === "CLOSE")?.cheapest?.grossPrice;
  const mediumCheapest = summary.find((s) => s.label === "MEDIUM")?.cheapest?.grossPrice;
  const farCheapest = summary.find((s) => s.label === "FAR")?.cheapest?.grossPrice;

  console.log(`\n  CLOSE  (Warsaw ~2km):  cheapest = ${closeCheapest ?? "N/A"} PLN`);
  console.log(`  MEDIUM (Warsaw ~8km):  cheapest = ${mediumCheapest ?? "N/A"} PLN`);
  console.log(`  FAR    (Krakow ~300km): cheapest = ${farCheapest ?? "N/A"} PLN`);

  if (closeCheapest == null || farCheapest == null) {
    console.log("\n  [WARN] Cannot validate — insufficient data from API.");
    return false;
  }

  const passed = farCheapest > closeCheapest;
  if (passed) {
    console.log(`\n  [PASS] FAR > CLOSE (${farCheapest} > ${closeCheapest}) — rates vary with distance.`);
  } else {
    console.log(`\n  [FAIL] FAR <= CLOSE (${farCheapest} <= ${closeCheapest}) — no distance variation detected.`);
  }
  return passed;
}

async function main() {
  logSection("Poland Shipping Rate Experiment");
  console.log(`  Sender:  ${SENDER.city} ${SENDER.postCode}`);
  console.log(`  Package: ${PACKAGE.length}x${PACKAGE.width}x${PACKAGE.height} cm, ${PACKAGE.weight} kg`);

  logSection("Step 1: OAuth Authentication");
  const token = await getAccessToken();
  console.log("  [OK] Access token acquired");

  const results = {};
  for (const receiver of RECEIVERS) {
    logSection(`Step: Fetch rates — ${receiver.label} (${receiver.city}, ${receiver.postCode})`);
    try {
      const data = await fetchCourierPrices(token, receiver.postCode);
      results[receiver.label] = data;
      const count = data.couriers?.length || 0;
      console.log(`  [OK] ${count} courier offers returned`);
    } catch (err) {
      console.error(`  [ERR] ${err.message}`);
      results[receiver.label] = { couriers: [] };
    }
  }

  const summary = summarizeResults(results);

  logSection("Step: Full Results");
  for (const item of summary) {
    console.log(`\n  --- ${item.label} ---`);
    if (item.count === 0) {
      console.log("  No available couriers.");
      continue;
    }
    for (const p of item.all) {
      console.log(`  ${p.name}: ${p.grossPrice} PLN gross (${p.netPrice} PLN net) [${p.deliveryType}]`);
    }
  }

  const passed = validateDistanceVariation(summary);

  logSection("Experiment Complete");
  console.log(`  Result: ${passed ? "PASSED" : "FAILED / INCONCLUSIVE"}`);
  console.log(`  Conclusion: ${passed
    ? "epaka.pl returns real distance-based rates for Poland domestic shipping."
    : "Could not confirm distance-based variation. Check API responses above."}`);
}

main().catch((err) => {
  console.error("\n[CRITICAL ERROR]", err.message);
  process.exit(1);
});
