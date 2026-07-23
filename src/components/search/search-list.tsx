import Link from "next/link";
import type { SearchItem } from "./search-results";

export function SearchResultList({ items }: { items: SearchItem[] }) {
  if (!items.length) {
    return <p className="mt-4 text-gray-500">未找到相关内容。</p>;
  }
  return (
    <ul className="mt-4 space-y-3">
      {items.map((it) => (
        <li key={it.url}>
          <Link
            href={it.url}
            className="group block bg-white rounded-xl border border-gray-200 p-5 hover:shadow-lg hover:border-primary/30 transition-all"
          >
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2 py-0.5 bg-blue-50 text-blue-600 text-xs rounded-full">
                {it.type}
              </span>
              {it.category && (
                <span className="text-xs text-gray-400">{it.category}</span>
              )}
            </div>
            <h3 className="text-lg font-semibold text-gray-900 group-hover:text-primary">
              {it.title}
            </h3>
            {it.description && (
              <p className="mt-1 text-sm text-gray-500 line-clamp-2">
                {it.description}
              </p>
            )}
          </Link>
        </li>
      ))}
    </ul>
  );
}
