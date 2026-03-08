import Link from "next/link";
import CardMedia from "./CardMedia";
import CardDetails from "./CardDetails";

export default function Card({ product }: { product: any }) {
  if (!product) return null;
  const href = typeof product.slug === 'string' ? `/product/${product.slug}` : `/product/${product.slug?.current || ""}`;

  return (
    <Link href={href} className="group flex flex-col h-full bg-white border border-secondary-100 transition-all duration-500 rounded-sm hover:shadow-card-hover overflow-hidden">
      <CardMedia src={product.imageUrl} alt={product.name} />
      <CardDetails name={product.name} brand={product.brand} price={product.displayPrice} />
    </Link>
  );
}
