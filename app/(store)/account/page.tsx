import { verifySession } from "@/features/auth/server";
import { getAccountOverview, AccountHomeView } from "@/features/account/server";

interface AccountPageProps {
  searchParams?: Promise<{ merge?: string; emailChanged?: string }>;
}

export default async function AccountPage({ searchParams }: AccountPageProps) {
  const session = await verifySession();
  const { merge, emailChanged } = (await searchParams) ?? {};
  const showMergeBanner = merge === "1";

  const { profile, mergeCount } = await getAccountOverview({
    userId: session.userId,
    email: session.user.email,
    createdAt: session.user.createdAt,
    showMergeBanner,
  });

  return (
    <AccountHomeView
      name={session.user.name || ""}
      email={session.user.email}
      mergeCount={mergeCount}
      showMergeBanner={showMergeBanner}
      showEmailChangedBanner={emailChanged === "true"}
      marketingEmailsOptIn={profile?.marketingEmailsOptIn ?? false}
      twoFactorEnabled={session.user.twoFactorEnabled as boolean | undefined}
    />
  );
}
