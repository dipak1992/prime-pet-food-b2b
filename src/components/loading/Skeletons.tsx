"use client";

export function TableSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="rounded-lg border border-[#e7e4dc] bg-white">
      <table className="w-full">
        <thead>
          <tr className="border-b border-[#e7e4dc]">
            {[1, 2, 3, 4, 5].map((i) => (
              <th key={i} className="px-6 py-3">
                <div className="h-4 w-full animate-pulse rounded bg-gray-200" />
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {Array.from({ length: rows }).map((_, rowIdx) => (
            <tr key={rowIdx} className="border-b border-[#e7e4dc] last:border-b-0">
              {[1, 2, 3, 4, 5].map((colIdx) => (
                <td key={colIdx} className="px-6 py-4">
                  <div className="h-4 w-full animate-pulse rounded bg-gray-100" />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function CardSkeleton() {
  return (
    <div className="rounded-lg border border-[#e7e4dc] bg-white p-6">
      <div className="mb-4 h-6 w-40 animate-pulse rounded bg-gray-200" />
      <div className="space-y-3">
        <div className="h-4 w-full animate-pulse rounded bg-gray-100" />
        <div className="h-4 w-5/6 animate-pulse rounded bg-gray-100" />
      </div>
    </div>
  );
}

export function FormSkeleton() {
  return (
    <div className="space-y-6 rounded-lg border border-[#e7e4dc] bg-white p-8">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="space-y-2">
          <div className="h-4 w-24 animate-pulse rounded bg-gray-200" />
          <div className="h-10 w-full animate-pulse rounded bg-gray-100" />
        </div>
      ))}
      <div className="h-10 w-full animate-pulse rounded bg-gray-100" />
    </div>
  );
}
