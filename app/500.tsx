import Link from "next/link";

export default function Custom500() {
  return (
    <html lang="en">
      <body className="flex min-h-screen flex-col items-center justify-center bg-gray-50 px-4 text-center">
        <h1 className="mb-2 text-6xl font-bold text-gray-900">500</h1>
        <p className="mb-6 text-lg text-gray-600">Something went wrong on our end.</p>
        <Link
          href="/"
          className="rounded bg-blue-600 px-4 py-2 font-medium text-white hover:bg-blue-700"
        >
          Back to Home
        </Link>
      </body>
    </html>
  );
}
