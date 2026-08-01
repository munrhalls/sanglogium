"use client";

import Link from "next/link";
import "./globals.css";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body className="flex min-h-screen flex-col items-center justify-center bg-gray-50 px-4 text-center">
        <h1 className="mb-2 text-6xl font-bold text-gray-900">500</h1>
        <p className="mb-6 text-lg text-gray-600">Something went wrong on our end.</p>
        {error.digest && (
          <p className="mb-6 text-sm text-gray-400">Error ID: {error.digest}</p>
        )}
        <div className="flex gap-4">
          <button
            onClick={() => reset()}
            className="rounded bg-blue-600 px-4 py-2 font-medium text-white hover:bg-blue-700"
          >
            Try again
          </button>
          <Link
            href="/"
            className="rounded bg-gray-600 px-4 py-2 font-medium text-white hover:bg-gray-700"
          >
            Back to Home
          </Link>
        </div>
      </body>
    </html>
  );
}
