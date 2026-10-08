import "server-only";
import { backendClient } from '@/platform/sanity/backendClient';
import groq from 'groq';

export async function getProductUnitAmountsByIds(
  ids: string[]
): Promise<{ _id: string; price_data: { unit_amount: number } | null }[]> {
  return backendClient.fetch<{ _id: string; price_data: { unit_amount: number } | null }[]>(
    groq`*[_type == "product" && _id in $ids]{ _id, price_data { unit_amount } }`,
    { ids }
  );
}
