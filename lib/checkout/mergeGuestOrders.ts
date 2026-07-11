import { backendClient } from "@/sanity-cms/lib/backendClient";

export async function mergeGuestOrdersByEmail(
  userId: string,
  verifiedEmail: string
): Promise<{ linked: number }> {
  const guestOrders = await backendClient.fetch<Array<{ _id: string }>>(
    `*[_type == "order" && isGuest == true && customerEmail == $email && !defined(userId)]{_id}`,
    { email: verifiedEmail }
  );

  if (!guestOrders || guestOrders.length === 0) {
    return { linked: 0 };
  }

  const tx = backendClient.transaction();

  for (const order of guestOrders) {
    tx.patch(order._id, (p) =>
      p.set({ userId, isGuest: false })
    );
  }

  await tx.commit();
  return { linked: guestOrders.length };
}
