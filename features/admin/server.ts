import "server-only";
import { cache } from "react";
import { notFound } from "next/navigation";
import { getSignInFacts } from "@/features/auth/server";
import { ownerList } from "@/platform/utils/ownerList";
import { isOwner } from "./core/rules/isOwner";
import type { AdminLedgers } from "./core/ports";
import type { PaymentWithoutOrder } from "./core/types/adminTypes";
import { getPaymentsWithoutOrder as getPaymentsWithoutOrderQuery } from "./queries/getPaymentsWithoutOrder";
import { listSucceededPayments } from "./adapters/stripe/listSucceededPayments";
import { findOrderedPaymentIds } from "./adapters/sanity/findOrderedPaymentIds";

const ledgers: AdminLedgers = { listSucceededPayments, findOrderedPaymentIds };

// Anyone but the owner gets "page not found": no page, no data, no hint.
export const requireOwner = cache(async (): Promise<void> => {
  const facts = await getSignInFacts();
  if (!isOwner(facts, ownerList(process.env.OWNER_EMAILS), Date.now())) notFound();
});

export const getPaymentsWithoutOrder = async (): Promise<PaymentWithoutOrder[]> => {
  await requireOwner();
  return getPaymentsWithoutOrderQuery(ledgers, Date.now());
};
