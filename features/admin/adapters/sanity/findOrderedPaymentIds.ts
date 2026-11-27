import "server-only";
import { backendClient } from '@/platform/sanity/backendClient'

const QUERY = '*[_type == "order" && paymentIntentId in $ids].paymentIntentId'

export async function findOrderedPaymentIds(paymentIntentIds: string[]): Promise<string[]> {
  if (paymentIntentIds.length === 0) return []
  return backendClient.fetch<string[]>(QUERY, { ids: paymentIntentIds })
}
