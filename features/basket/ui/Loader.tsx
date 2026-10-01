// Modern spinner loader component

export default function Loader({
  message,
  color = "border-t-blue-500",
}: {
  message?: string;
  color?: string;
}) {
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center bg-white">
      <div
        className={`flex h-8 w-8 animate-spin rounded-full border-4 border-gray-200 ${color}`}
      ></div>
      {message && (
        <p className="mt-2 text-sm font-semibold tracking-wide text-black">
          {message}
        </p>
      )}
    </div>
  );
}
