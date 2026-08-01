"use client";

import "./globals.css";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 px-4 text-center">
      <h2 className="mb-2 text-2xl font-bold text-gray-900">Something went wrong</h2>
      <p className="mb-4 max-w-md text-gray-600">
        {error.message || "An unexpected error occurred."}
      </p>
      {error.digest && (
        <p className="mb-4 text-sm text-gray-400">Error ID: {error.digest}</p>
      )}
      <button
        onClick={() => reset()}
        className="rounded bg-blue-600 px-4 py-2 font-medium text-white hover:bg-blue-700"
      >
        Try again
      </button>
    </div>
  );
}
