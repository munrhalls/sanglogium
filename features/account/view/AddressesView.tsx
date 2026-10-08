import Link from "next/link";
import Addresses from "@/features/account/ui/Addresses";
import type { SavedAddress } from "@/features/account/core/types/accountTypes";

export default function AddressesView({
  addresses,
}: {
  addresses: SavedAddress[];
}) {
  return (
    <div className="p-6">
      <h1 className="mb-4 text-2xl font-bold">My Addresses</h1>
      <p className="mb-4">Manage your saved addresses for faster checkout.</p>
      <Addresses addresses={addresses} />
      <Link href="/account" className="mt-4 inline-block text-blue-600 underline">
        Back to Account
      </Link>
    </div>
  );
}
