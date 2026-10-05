import type { OrderHistoryPorts, ProfilePorts } from "@/features/account/core/ports";

export async function getAccountExport(
  ports: { profile: ProfilePorts; orderHistory: OrderHistoryPorts },
  userId: string,
) {
  const [profile, orders] = await Promise.all([
    ports.profile.getFullUserProfile(userId),
    ports.orderHistory.getAllUserOrdersFull(userId),
  ]);

  return {
    userId,
    profile,
    orders: orders || [],
    exportedAt: new Date().toISOString(),
  };
}
