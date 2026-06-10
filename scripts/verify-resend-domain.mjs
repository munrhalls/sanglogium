import { Resend } from "resend";
import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const key = process.env.RESEND_API_KEY;

if (!key) {
  console.error("❌ RESEND_API_KEY not found in .env.local");
  process.exit(1);
}

const resend = new Resend(key);

async function verifyDomain() {
  try {
    // Step 1: Get domain ID
    console.log("Fetching domains...");
    const { data: domains, error: listError } = await resend.domains.list();

    if (listError) {
      console.error("❌ Failed to list domains:", listError);
      process.exit(1);
    }

    const sanglogiumDomain = domains?.data?.find(d => d.name === "sanglogium.com");

    if (!sanglogiumDomain) {
      console.error("❌ sanglogium.com not found in your Resend domains");
      process.exit(1);
    }

    console.log(`Found domain: ${sanglogiumDomain.name}`);
    console.log(`Domain ID: ${sanglogiumDomain.id}`);
    console.log(`Current status: ${sanglogiumDomain.status}`);

    // Step 2: Trigger verification
    console.log("\nTriggering verification...");
    const { data: verifyData, error: verifyError } = await resend.domains.verify(sanglogiumDomain.id);

    if (verifyError) {
      console.error("❌ Verification failed:", verifyError);
      process.exit(1);
    }

    console.log("✅ Verification triggered successfully!");
    console.log(`Domain ID: ${verifyData?.id}`);
    console.log("\nStatus should change to 'pending' within a few minutes.");
    console.log("Check the Resend dashboard to see progress.");

  } catch (err) {
    console.error("❌ Exception:", err.message);
    process.exit(1);
  }
}

verifyDomain();
