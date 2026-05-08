import CardMedia from "./CardMedia";
import CardDetails from "./CardDetails";
import { centsToDisplay } from "@/lib/utils/price";

interface CardProps {
  product: {
    name: string;
    brand: {
      _id: string;
      name: string;
      slug: string;
    };
    price_data: { currency: string; unit_amount: number };
    imageUrl: string;
  };
}

export default function Card({ product }: CardProps) {
  return (
    <div className="group relative flex h-full flex-col overflow-hidden rounded-[12px] border-2 border-secondary-500 bg-white transition-all duration-500 hover:shadow-cardHover shadow-card">
      <CardMedia src={product.imageUrl} alt={product.name} />
      <CardDetails
        name={product.name}
        brand={product.brand}
        price={centsToDisplay(product.price_data.unit_amount)}
      />
    </div>
  );
}
