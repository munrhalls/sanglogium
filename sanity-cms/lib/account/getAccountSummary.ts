import { backendClient } from "@/sanity-cms/lib/backendClient";

export interface AccountSummary {
  _id?: string;
  marketingEmailsOptIn?: boolean;
}

export async function getAccountSummary(authId: string): Promise<AccountSummary | null> {
  return backendClient.fetch<AccountSummary | null>(
    `*[_type == "userProfile" && authId == $authId][0]{ _id, marketingEmailsOptIn }`,
    { authId }
  );
}
