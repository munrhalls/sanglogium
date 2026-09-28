import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth/dal";
import { getFullUserProfile } from "@/sanity-cms/lib/account/getFullUserProfile";
import { getAllUserOrdersFull } from "@/sanity-cms/lib/orders/getAllUserOrdersFull";

export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = session.userId;

  const [profile, orders] = await Promise.all([
    getFullUserProfile(userId),
    getAllUserOrdersFull(userId),
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
