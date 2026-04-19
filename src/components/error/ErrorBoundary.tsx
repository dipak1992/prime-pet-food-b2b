"use client";

import { useEffect } from "react";

export function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex h-screen items-center justify-center bg-[#f8f7f4]">
      <div className="w-full max-w-md rounded-lg bg-white p-8 shadow-lg">
        <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-50">
          <svg className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4v2m0-12C6.48 3 2 7.48 2 12s4.48 9 10 9 10-4.48 10-10S17.52 3 12 3z" />
          </svg>
        </div>
        <h1 className="mb-2 text-xl font-bold text-gray-900">Something went wrong</h1>
        <p className="mb-6 text-sm text-gray-600">{error.message || "An unexpected error occurred. Please try again."}</p>
        <button
          onClick={reset}
          className="w-full rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700 transition-colors"
        >
          Try again
        </button>
      </div>
    </div>
  );
}
