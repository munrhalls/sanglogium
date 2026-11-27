import "server-only";
import { cache } from "react";
import { notFound } from "next/navigation";
import { getSignInFacts } from "@/features/auth/server";
import { ownerList } from "./core/rules/ownerList";
import { isOwner } from "./core/rules/isOwner";

// Anyone but the owner gets "page not found": no page, no data, no hint.
export const requireOwner = cache(async (): Promise<void> => {
  const facts = await getSignInFacts();
  if (!isOwner(facts, ownerList(process.env.OWNER_EMAILS), Date.now())) notFound();
});
