import type { OrderHistoryPorts, ProfilePorts } from "@/features/account/core/ports";

export interface AccountOverviewParams {
  userId: string;
  email: string | undefined;
  createdAt: Date | string | undefined;
  showMergeBanner: boolean;
}

export async function getAccountOverview(
  ports: { profile: ProfilePorts; orderHistory: OrderHistoryPorts },
  params: AccountOverviewParams,
) {
  const profile = await ports.profile.getAccountSummary(params.userId);

  let mergeCount = 0;

  if (params.showMergeBanner && params.email) {
    const userCreatedAt = params.createdAt
      ? new Date(params.createdAt).toISOString()
      : new Date().toISOString();

    mergeCount = await ports.orderHistory.countMergedGuestOrders({
      userId: params.userId,
      email: params.email,
      userCreatedAt,
    });
  }

  return { profile, mergeCount };
}
