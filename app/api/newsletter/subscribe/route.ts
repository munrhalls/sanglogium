import { NextRequest, NextResponse } from "next/server";
import { subscribeNewsletter } from "@/features/shell/server";

export async function POST(request: NextRequest) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const result = await subscribeNewsletter(body);
  return NextResponse.json(result.body, { status: result.status });
}
