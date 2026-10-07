import { verifySession } from "@/features/auth/server";
import { getWishlistProducts, WishlistView } from "@/features/products/server";

export default async function WishlistPage() {
  const session = await verifySession();
  const products = await getWishlistProducts(session.userId);

  return <WishlistView products={products} />;
}
