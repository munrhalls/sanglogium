import Link from "next/link";
import AccountActions from "@/features/account/ui/AccountActions";

interface AccountHomeViewProps {
  name: string;
  email: string;
  mergeCount: number;
  showMergeBanner: boolean;
  showEmailChangedBanner: boolean;
  marketingEmailsOptIn: boolean;
  twoFactorEnabled: boolean | undefined;
}

export default function AccountHomeView({
  name,
  email,
  mergeCount,
  showMergeBanner,
  showEmailChangedBanner,
  marketingEmailsOptIn,
  twoFactorEnabled,
}: AccountHomeViewProps) {
  return (
    <div className="p-6">
      <h1 className="mb-4 text-2xl font-bold">My Account</h1>
      <p className="mb-4">Welcome, {name || email}!</p>

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
      <AccountActions
        name={name}
        email={email}
        shouldClearMergeFlag={showMergeBanner}
        showEmailChangedBanner={showEmailChangedBanner}
        marketingEmailsOptIn={marketingEmailsOptIn}
        twoFactorEnabled={twoFactorEnabled}
      />
    </div>
  );
}
