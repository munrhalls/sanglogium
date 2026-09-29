import { verifySession } from "@/lib/auth/dal";
import { getUserAddresses } from "@/sanity-cms/lib/account/getUserAddresses";
import Link from "next/link";
import AddressesClient from "./AddressesClient";

export default async function AddressesPage() {
  const session = await verifySession();

  const profile = await getUserAddresses(session.userId);

  const addresses = profile?.addresses ?? [];

  return (
    <div className="p-6">
      <h1 className="mb-4 text-2xl font-bold">My Addresses</h1>
      <p className="mb-4">Manage your saved addresses for faster checkout.</p>
      <AddressesClient addresses={addresses} />
      <Link href="/account" className="mt-4 inline-block text-blue-600 underline">
        Back to Account
      </Link>
    </div>
  );
}
