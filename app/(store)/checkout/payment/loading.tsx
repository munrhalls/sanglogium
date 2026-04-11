import Loader from '@/app/components/common/Loader';

export default function Loading() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-center items-center min-h-screen">
        <Loader />
      </div>
    </div>
  );
}
