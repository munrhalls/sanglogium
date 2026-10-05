import { NextResponse } from "next/server";
import { getSession } from "@/features/auth/server";
import { getAccountExport } from "@/features/account/server";

export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const exportData = await getAccountExport(session.userId);

  const json = JSON.stringify(exportData, null, 2);
  const date = exportData.exportedAt.split("T")[0];
  const filename = `sang-logium-data-export-${session.userId}-${date}.json`;

  return new NextResponse(json, {
    status: 200,
    headers: {
      "Content-Type": "application/json",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  });
}
