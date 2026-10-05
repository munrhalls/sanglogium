import { verifySession } from "@/features/auth/server";
import { getUserAddresses, AddressesView } from "@/features/account/server";

export default async function AddressesPage() {
  const session = await verifySession();

  const profile = await getUserAddresses(session.userId);

  return <AddressesView addresses={profile?.addresses ?? []} />;
}
