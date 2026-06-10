import { Resend } from "resend";
import dotenv from "dotenv";

// Load .env.local
dotenv.config({ path: ".env.local" });

const key = process.env.RESEND_API_KEY;
const from = process.env.RESEND_FROM_EMAIL || "onboarding@resend.dev";

if (!key) {
  console.error("❌ RESEND_API_KEY not found in .env.local");
  process.exit(1);
}

console.log(`API Key: ${key.slice(0, 8)}... (${key.length} chars)`);
console.log(`From: ${from}`);

const resend = new Resend(key);

async function test() {
  try {
    const { data, error } = await resend.emails.send({
      from: from,
      to: "antarcticdepths71@gmail.com",
      subject: "Resend Test - Sang Logium",
      html: "<p>This is a test email from your local dev environment.</p>",
    });

    if (error) {
      console.error("❌ Resend returned error:", error);
      process.exit(1);
    }

    console.log("✅ Email sent! ID:", data?.id);
    console.log("Check your inbox (and spam) for the test email.");
  } catch (err) {
    console.error("❌ Exception:", err.message);
    process.exit(1);
  }
}

test();
