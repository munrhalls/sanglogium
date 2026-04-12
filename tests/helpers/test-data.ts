import { client } from '../../sanity/lib/client';

export const TEST_PRODUCTS = [
  {
    _id: "YcMKSEyusPBTcaoe1xiP1b",
    name: "Test Product Alpha - Full Stock",
    stock: 5,
    stripePriceId: "price_1TLPiKEQ2a2vW56gjYdhtw9g",
    displayPrice: 10000
  },
  {
    _id: "MHd9dKrYZDArdj3morESVD",
    name: "Test Product Beta - Limited Stock",
    stock: 2,
    stripePriceId: "price_1TLPiKEQ2a2vW56gjYdhtw9g",
    displayPrice: 20000
  },
  {
    _id: "MHd9dKrYZDArdj3morESpg",
    name: "Test Product Gamma - Out of Stock",
    stock: 0,
    stripePriceId: "price_1TLPiKEQ2a2vW56gjYdhtw9g",
    displayPrice: 30000
  }
];

export async function getTestProducts() {
  return client.fetch(`
    *[_type == "product" && (name match "test" || name match "Test")]{
      _id, name, stock, stripePriceId, slug, displayPrice
    } | order(name asc)
  `);
}

export async function resetProductStock(productId: string, initialStock: number) {
  await client.patch(productId).set({ stock: initialStock }).commit();
}

export async function getProductStock(productId: string): Promise<number> {
  const product = await client.fetch(
    `*[_id == $productId]{stock}[0]`,
    { productId }
  );
  return product?.stock || 0;
}
