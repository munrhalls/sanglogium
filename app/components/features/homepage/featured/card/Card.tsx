import CardMedia from "./CardMedia";
import CardDetails from "./CardDetails";

interface CardProps {
  product: {
    name: string;
    brand: string;
    displayPrice: number;
    imageUrl: string;
  };
}

export default function Card({ product }: CardProps) {
  return (
    <div className="group relative flex h-full flex-col overflow-hidden rounded-sm border border-secondary-200 bg-white transition-all duration-500 hover:border-brand-300 hover:shadow-cardHover shadow-card">
      <CardMedia src={product.imageUrl} alt={product.name} />
      <CardDetails 
        name={product.name} 
        brand={product.brand} 
        price={product.displayPrice} 
      />
    </div>
  );
}
