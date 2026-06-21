import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { Resend } from "resend";

const subscribeSchema = z.object({
  email: z.string().trim().toLowerCase().email(),
});

const resendApiKey = process.env.RESEND_API_KEY;
const audienceId = process.env.RESEND_AUDIENCE_ID;

const resend = resendApiKey ? new Resend(resendApiKey) : null;

export async function POST(request: NextRequest) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const parsed = subscribeSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Please enter a valid email address." },
      { status: 400 }
    );
  }

  if (!resend || !audienceId) {
    console.error(
      "[API/newsletter/subscribe] Missing RESEND_API_KEY or RESEND_AUDIENCE_ID"
    );
    return NextResponse.json(
      { error: "Newsletter is temporarily unavailable." },
      { status: 503 }
    );
  }

  try {
    const { error } = await resend.contacts.create({
      email: parsed.data.email,
      unsubscribed: false,
      audienceId,
    });

    if (error) {
      console.error("[API/newsletter/subscribe] Resend error:", error);
      return NextResponse.json(
        { error: "Unable to subscribe right now. Please try again." },
        { status: 502 }
      );
    }

    return NextResponse.json({ ok: true }, { status: 200 });
  } catch (err) {
    console.error("[API/newsletter/subscribe] Unexpected error:", err);
    return NextResponse.json(
      { error: "Unable to subscribe right now. Please try again." },
      { status: 500 }
    );
  }
}
