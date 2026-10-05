import { verifySession } from "@/features/auth/server";
import { getWishlistProducts, WishlistPageView } from "@/features/products/server";

export default async function WishlistPage() {
  const session = await verifySession();
  const products = await getWishlistProducts(session.userId);

  return <WishlistPageView products={products} />;
}
