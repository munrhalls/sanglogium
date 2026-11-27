import "server-only";

import { headers } from "next/headers";

/** Who is asking: the first address in x-forwarded-for (set by the host), else x-real-ip, else "unknown". */
export async function visitorKey(): Promise<string> {
  const h = await headers();
  return h.get("x-forwarded-for")?.split(",")[0]?.trim() || h.get("x-real-ip")?.trim() || "unknown";
}
