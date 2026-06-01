import { headers } from "next/headers";
import { getSessionCookie } from "better-auth/cookies";
import NavbarActions from "./NavbarActions";

export default async function NavbarActionsServer() {
  const headersList = await headers();
  const sessionToken = getSessionCookie(headersList);
  const isAuthenticated = !!sessionToken;

  // Cart count: hardcode 0 for now — cart state is managed client-side via Zustand
  const cartCount = 0;

  return <NavbarActions isAuthenticated={isAuthenticated} cartCount={cartCount} />;
}
