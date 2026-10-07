import "server-only";
import { backendClient } from "@/platform/sanity/backendClient";

export async function getAllUserOrdersFull(userId: string): Promise<Record<string, unknown>[]> {
  return backendClient.fetch<Record<string, unknown>[]>(
    `*[_type == "order" && userId == $userId]`,
    { userId }
  );
}
