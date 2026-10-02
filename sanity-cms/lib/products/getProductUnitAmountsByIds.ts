import { getBackendClient } from '@/sanity-cms/lib/backendClient';
import groq from 'groq';

export async function getProductUnitAmountsByIds(
  ids: string[]
): Promise<{ _id: string; price_data: { unit_amount: number } | null }[]> {
  return getBackendClient().fetch<{ _id: string; price_data: { unit_amount: number } | null }[]>(
    groq`*[_type == "product" && _id in $ids]{ _id, price_data { unit_amount } }`,
    { ids }
  );
}
