import { verifySession } from "@/lib/auth/dal";
import { backendClient } from "@/sanity-cms/lib/backendClient";
import Link from "next/link";
import AccountActionsClient from "./AccountActions.client";

interface AccountPageProps {
  searchParams?: Promise<{ merge?: string }>;
}

export default async function AccountPage({ searchParams }: AccountPageProps) {
  const session = await verifySession();
  const { merge } = (await searchParams) ?? {};
  const showMergeBanner = merge === "1";

  const profile = await backendClient.fetch<{ _id?: string; marketingEmailsOptIn?: boolean }>(
    `*[_type == "userProfile" && authId == $authId][0]{ _id, marketingEmailsOptIn }`,
    { authId: session.userId }
  );

  let mergeCount = 0;

  if (showMergeBanner && session.user.email) {
    const userCreatedAt = session.user.createdAt
      ? new Date(session.user.createdAt).toISOString()
      : new Date().toISOString();

    const mergedOrders = await backendClient.fetch<Array<{ _id: string }>>(
      `*[_type == "order" && userId == $userId && customerEmail == $email && isGuest == false && dates.orderedAt < $userCreatedAt]{_id}`,
      {
        userId: session.userId,
        email: session.user.email,
        userCreatedAt,
      }
    );

    mergeCount = mergedOrders?.length ?? 0;
  }

  return (
    <div className="p-6">
      <h1 className="mb-4 text-2xl font-bold">My Account</h1>
      <p className="mb-4">Welcome, {session.user.name || session.user.email}!</p>

      {showMergeBanner && mergeCount > 0 && (
        <div className="mb-4 rounded border border-success-500 bg-success-500/10 p-3 text-success-500 type-caption">
          We found {mergeCount} previous order{mergeCount === 1 ? "" : "s"} placed with this email and added them to your account.
        </div>
      )}

      <nav className="space-y-2">
        <Link href="/account/orders" className="block text-blue-600 underline">
          My Orders
        </Link>
        <Link href="/account/addresses" className="block text-blue-600 underline">
          My Addresses
        </Link>
        <Link href="/account/wishlist" className="block text-blue-600 underline">
          My Wishlist
        </Link>
      </nav>
      <AccountActionsClient
        name={session.user.name || ""}
        shouldClearMergeFlag={showMergeBanner}
        marketingEmailsOptIn={profile?.marketingEmailsOptIn ?? false}
        twoFactorEnabled={session.user.twoFactorEnabled as boolean | undefined}
      />
    </div>
  );
}
