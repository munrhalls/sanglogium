import { NextResponse } from "next/server";
import { getSession, getSignInRecord } from "@/features/auth/server";
import { getAccountExport } from "@/features/account/server";

export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const [accountData, signInRecord] = await Promise.all([getAccountExport(session.userId), getSignInRecord()]);
  const exportData = {
    ...accountData,
    signIn: {
      account: {
        email: session.user.email,
        name: session.user.name,
        emailVerified: session.user.emailVerified,
        twoFactorEnabled: Boolean(session.user.twoFactorEnabled),
        createdAt: session.user.createdAt,
      },
      ...signInRecord,
    },
  };

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
