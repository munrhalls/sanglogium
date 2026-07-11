import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth/dal";
import { backendClient } from "@/sanity-cms/lib/backendClient";

export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = session.userId;

  const [profile, orders] = await Promise.all([
    backendClient.fetch<Record<string, unknown> | null>(
      `*[_type == "userProfile" && authId == $authId][0]`,
      { authId: userId }
    ),
    backendClient.fetch<Record<string, unknown>[]>(
      `*[_type == "order" && userId == $userId]`,
      { userId }
    ),
  ]);

  const exportData = {
    userId,
    profile,
    orders: orders || [],
    exportedAt: new Date().toISOString(),
  };

  const json = JSON.stringify(exportData, null, 2);
  const date = new Date().toISOString().split("T")[0];
  const filename = `sang-logium-data-export-${userId}-${date}.json`;

  return new NextResponse(json, {
    status: 200,
    headers: {
      "Content-Type": "application/json",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  });
}
