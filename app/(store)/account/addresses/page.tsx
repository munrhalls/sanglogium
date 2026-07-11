import { verifySession } from "@/lib/auth/dal";
import { backendClient } from "@/sanity-cms/lib/backendClient";
import Link from "next/link";
import type { Address } from "@/app/checkout/checkout.types";
import AddressesClient from "./AddressesClient";

type SavedAddress = Address & { _key: string };

export default async function AddressesPage() {
  const session = await verifySession();

  const profile = await backendClient.fetch<{
    _id: string;
    addresses?: SavedAddress[];
  }>(
    `*[_type == "userProfile" && authId == $authId][0]{
      _id,
      addresses
    }`,
    { authId: session.userId }
  );

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
