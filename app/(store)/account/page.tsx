import { verifySession } from "@/features/auth/server";
import { getAccountSummary } from "@/sanity-cms/lib/account/getAccountSummary";
import { countMergedGuestOrders } from "@/sanity-cms/lib/account/countMergedGuestOrders";
import Link from "next/link";
import { AccountActionsClient } from "@/features/account";

interface AccountPageProps {
  searchParams?: Promise<{ merge?: string; emailChanged?: string }>;
}

export default async function AccountPage({ searchParams }: AccountPageProps) {
  const session = await verifySession();
  const { merge, emailChanged } = (await searchParams) ?? {};
  const showMergeBanner = merge === "1";
  const showEmailChangedBanner = emailChanged === "true";

  const profile = await getAccountSummary(session.userId);

  let mergeCount = 0;

  if (showMergeBanner && session.user.email) {
    const userCreatedAt = session.user.createdAt
      ? new Date(session.user.createdAt).toISOString()
      : new Date().toISOString();

    mergeCount = await countMergedGuestOrders({
      userId: session.userId,
      email: session.user.email,
      userCreatedAt,
    });
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
        email={session.user.email}
        shouldClearMergeFlag={showMergeBanner}
        showEmailChangedBanner={showEmailChangedBanner}
        marketingEmailsOptIn={profile?.marketingEmailsOptIn ?? false}
        twoFactorEnabled={session.user.twoFactorEnabled as boolean | undefined}
      />
    </div>
  );
}
