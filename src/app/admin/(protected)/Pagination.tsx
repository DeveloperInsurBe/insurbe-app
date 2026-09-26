import Link from "next/link";

export const PAGE_SIZES = [10, 20, 30, 50, 100] as const;

export function parsePageSize(value: string | undefined) {
  const size = Number(value);

  return PAGE_SIZES.includes(size as (typeof PAGE_SIZES)[number])
    ? size
    : PAGE_SIZES[0];
}

export function parsePage(value: string | undefined, totalPages: number) {
  const page = Math.floor(Number(value));

  if (!Number.isFinite(page) || page < 1) return 1;

  return Math.min(page, Math.max(totalPages, 1));
}

/**
 * Page numbers around the current page, with null for gaps.
 */
function pageWindow(page: number, totalPages: number) {
  const pages = new Set([1, totalPages, page - 1, page, page + 1]);

  const sorted = [...pages]
    .filter((item) => item >= 1 && item <= totalPages)
    .sort((a, b) => a - b);

  const result: (number | null)[] = [];

  for (const item of sorted) {
    const previous = result[result.length - 1];

    if (typeof previous === "number" && item - previous > 1) {
      result.push(null);
    }

    result.push(item);
  }

  return result;
}

export default function Pagination({
  page,
  pageSize,
  totalItems,
  hrefFor,
}: {
  page: number;
  pageSize: number;
  totalItems: number;
  hrefFor: (params: { page: number; size: number }) => string;
}) {
  const totalPages = Math.max(Math.ceil(totalItems / pageSize), 1);
  const from = totalItems === 0 ? 0 : (page - 1) * pageSize + 1;
  const to = Math.min(page * pageSize, totalItems);

  const buttonClass =
    "flex h-9 min-w-9 items-center justify-center rounded-lg border px-3 text-xs font-semibold transition-all sm:text-sm";

  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-gray-200 bg-white p-3 sm:flex-row sm:items-center sm:justify-between sm:p-4">
      <div className="flex flex-wrap items-center gap-2 text-xs text-gray-600 sm:text-sm">
        <span>Rows per page:</span>
        {PAGE_SIZES.map((size) => (
          <Link
            key={size}
            href={hrefFor({ page: 1, size })}
            className={`rounded-lg px-2.5 py-1 font-semibold transition-all ${
              size === pageSize
                ? "bg-[#820ad1] text-white"
                : "border border-gray-200 text-gray-600 hover:bg-gray-100"
            }`}
          >
            {size}
          </Link>
        ))}
        <span className="ml-1 text-gray-500">
          {from}–{to} of {totalItems}
        </span>
      </div>

      <div className="flex flex-wrap items-center gap-1.5">
        {page > 1 ? (
          <Link
            href={hrefFor({ page: page - 1, size: pageSize })}
            className={`${buttonClass} border-gray-200 text-gray-700 hover:bg-gray-100`}
          >
            ← Prev
          </Link>
        ) : (
          <span className={`${buttonClass} border-gray-100 text-gray-300`}>
            ← Prev
          </span>
        )}

        {pageWindow(page, totalPages).map((item, index) =>
          item === null ? (
            <span key={`gap-${index}`} className="px-1 text-gray-400">
              …
            </span>
          ) : (
            <Link
              key={item}
              href={hrefFor({ page: item, size: pageSize })}
              className={`${buttonClass} ${
                item === page
                  ? "border-[#820ad1] bg-[#820ad1] text-white"
                  : "border-gray-200 text-gray-700 hover:bg-gray-100"
              }`}
            >
              {item}
            </Link>
          ),
        )}

        {page < totalPages ? (
          <Link
            href={hrefFor({ page: page + 1, size: pageSize })}
            className={`${buttonClass} border-gray-200 text-gray-700 hover:bg-gray-100`}
          >
            Next →
          </Link>
        ) : (
          <span className={`${buttonClass} border-gray-100 text-gray-300`}>
            Next →
          </span>
        )}
      </div>
    </div>
  );
}
