import { headers } from "next/headers";
import { getSessionCookie } from "better-auth/cookies";
import ActionBar from "@/features/shell/ui/navigation/ActionBar";

export default async function ActionBarServer() {
  const headersList = await headers();
  const sessionToken = getSessionCookie(headersList);
  const isAuthenticated = !!sessionToken;

  return <ActionBar isAuthenticated={isAuthenticated} />;
}
