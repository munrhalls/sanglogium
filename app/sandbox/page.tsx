import { FeaturedCard } from '@/app/components/features/homepage/featured/Featured';


const mockFeaturedData = {
  imageUrl: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&q=80',
  overline: 'New Arrival',
  title: 'Premium Wireless Headphones',
  price: '$299.99',
  buttonText: 'Shop Now'
};

export default function SandboxPage() {
  return (
    <main className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="w-full max-w-7xl p-8">
        <FeaturedCard
          product={{
            _id: '1',
            name: mockFeaturedData.title,
            brand: mockFeaturedData.overline,
            displayPrice: mockFeaturedData.price,
            image: {
              asset: {
                url: mockFeaturedData.imageUrl
              }
            }
          }}
        />
      </div>
    </main>
  );
}
