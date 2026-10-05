import "server-only";
import { backendClient } from "@/platform/db/backendClient";
import type { AccountSummary } from "@/features/account/core/rules/accountTypes";

export async function getAccountSummary(authId: string): Promise<AccountSummary | null> {
  return backendClient.fetch<AccountSummary | null>(
    `*[_type == "userProfile" && authId == $authId][0]{ _id, marketingEmailsOptIn }`,
    { authId }
  );
}
