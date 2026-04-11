// import { auth } from "@clerk/nextjs/server";
import NavbarActions from "./NavbarActions";

export default async function NavbarActionsServer() {
  // const { userId } = await auth();
  // const isAuthenticated = !!userId;
  const isAuthenticated = false; // Temporarily hardcoded
  // Cart count: hardcode 0 for now — cart state is managed client-side via Zustand
  // A future prompt will wire up real cart count; this prompt only fixes auth state
  const cartCount = 0;

  return <NavbarActions isAuthenticated={isAuthenticated} cartCount={cartCount} />;
}
