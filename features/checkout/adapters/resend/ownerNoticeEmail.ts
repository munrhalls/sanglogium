import "server-only";
import { sendEmailOnce } from "@/platform/email/send";
import { ownerList } from "@/platform/utils/ownerList";
import type { OwnerNotice } from "@/features/checkout/core/types/checkoutTypes";

export async function sendOwnerNotice(notice: OwnerNotice): Promise<void> {
  const owners = ownerList(process.env.OWNER_EMAILS);
  if (owners.length === 0) throw new Error("OWNER_EMAILS is not set: the owner cannot be told");
  await sendEmailOnce({ to: owners, subject: notice.subject, text: notice.text, idempotencyKey: notice.key });
}
