import "server-only";
import { backendClient } from "@/platform/db/backendClient";
import type { Address } from "@/features/checkout";

export async function addProfileAddress(
  profileId: string,
  address: { _key: string } & Address,
): Promise<void> {
  await backendClient
    .patch(profileId)
    .setIfMissing({ addresses: [] })
    .append("addresses", [address])
    .commit();
}
