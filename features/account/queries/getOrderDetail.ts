import { notFound } from "next/navigation";
import type { OrderHistoryPorts } from "@/features/account/core/ports";

export async function getOrderDetail(
  ports: { orderHistory: OrderHistoryPorts },
  orderNumber: string,
  userId: string,
) {
  const order = await ports.orderHistory.getUserOrderByNumber(
    orderNumber,
    userId,
  );

  if (!order) {
    notFound();
  }

  return order;
}
