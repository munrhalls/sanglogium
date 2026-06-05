import { verifySession } from "@/lib/auth/dal";
import Link from "next/link";
import AccountActionsClient from "./AccountActions.client";

export default async function AccountPage() {
  const session = await verifySession();

  return (
    <div className="p-6">
      <h1 className="mb-4 text-2xl font-bold">My Account</h1>
      <p className="mb-4">Welcome, {session.user.name || session.user.email}!</p>
      <nav className="space-y-2">
        <Link href="/account/orders" className="block text-blue-600 underline">
          My Orders
        </Link>
      </nav>
      <AccountActionsClient />
    </div>
  );
}
