import { backendClient } from "@/sanity-cms/lib/backendClient";
import type { Product } from "@/sanity-cms/lib/products/getProductsByVfsKeys";

export async function getWishlistProducts(authId: string): Promise<Product[]> {
  const result = await backendClient.fetch<{ products: Product[] | null } | null>(
    `*[_type == "userProfile" && authId == $authId][0]{
      "products": wishlist[]->{
        _id,
        name,
        brand->{
          _id,
          name,
          slug { current }
        },
        price_data,
        stock,
        reservedStock,
        "availableStock": stock - reservedStock,
        image {
          asset {
            _ref
          }
        },
        slug {
          current
        },
        catalogueLocationKeys
      }
    }`,
    { authId }
  );

  return result?.products?.filter(Boolean) ?? [];
}
