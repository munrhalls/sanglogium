import { cookies } from "next/headers";
import NavbarActions from "./NavbarActions";

export default async function NavbarActionsServer() {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get("better-auth.session_token");
  const isAuthenticated = !!sessionCookie;

  // Cart count: hardcode 0 for now — cart state is managed client-side via Zustand
  const cartCount = 0;

  return <NavbarActions isAuthenticated={isAuthenticated} cartCount={cartCount} />;
}
