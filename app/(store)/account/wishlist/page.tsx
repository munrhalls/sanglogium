import { verifySession } from "@/lib/auth/dal";
import { backendClient } from "@/sanity-cms/lib/backendClient";
import Link from "next/link";
import { ProductGrid } from "@/app/components/features/products/ProductGrid";
import type { Product } from "@/sanity-cms/lib/products/getProductsByVfsKeys";

export default async function WishlistPage() {
  const session = await verifySession();

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
    { authId: session.userId }
  );

  const products = result?.products?.filter(Boolean) ?? [];
  const productIds = products.map((product) => product._id);

  return (
    <div className="p-6">
      <h1 className="mb-4 text-2xl font-bold">My Wishlist</h1>

      {products.length === 0 ? (
        <p className="type-body text-secondary">Your wishlist is empty.</p>
      ) : (
        <ProductGrid products={products} wishlistProductIds={productIds} />
      )}

      <Link href="/products" className="mt-4 inline-block text-blue-600 underline">
        Continue shopping
      </Link>
    </div>
  );
}
