"use client";

import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { useState, useMemo } from "react";

export type SearchItem = {
  title: string;
  description: string;
  url: string;
  type: string;
  category: string;
};

export function SearchResults({ items }: { items: SearchItem[] }) {
  const searchParams = useSearchParams();
  const q = searchParams.get("q") || "";
  const [input, setInput] = useState(q);

  const results = useMemo(() => {
    const term = q.trim().toLowerCase();
    if (!term) return [];
    return items.filter(
      (it) =>
        it.title.toLowerCase().includes(term) ||
        it.description.toLowerCase().includes(term) ||
        it.category.toLowerCase().includes(term) ||
        it.type.toLowerCase().includes(term)
    );
  }, [q, items]);

  return (
    <div className="mt-6">
      <form
        action="/search"
        method="GET"
        className="flex gap-2 max-w-xl"
      >
        <input
          name="q"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="输入关键词，如 AI 写作、CRM..."
          className="flex-1 px-4 py-3 rounded-lg border border-gray-300
                     focus:ring-2 focus:ring-primary focus:outline-none text-gray-900"
        />
        <button
          type="submit"
          className="px-5 py-3 bg-primary text-white rounded-lg font-medium hover:bg-primary-dark transition-colors"
        >
          搜索
        </button>
      </form>

      {q && (
        <p className="mt-6 text-gray-600">
          {results.length > 0
            ? `找到 ${results.length} 条与“${q}”相关的结果`
            : `未找到与“${q}”相关的结果`}
        </p>
      )}

      <ul className="mt-4 space-y-3">
        {results.map((it) => (
          <li key={it.url}>
            <Link
              href={it.url}
              className="group block bg-white rounded-xl border border-gray-200 p-5
                         hover:shadow-lg hover:border-primary/30 transition-all"
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
    </div>
  );
}
