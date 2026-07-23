"use client";

import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { useState, useMemo } from "react";
import { SearchResultList } from "./search-list";

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
    if (!term) return items;
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

      {q ? (
        <p className="mt-6 text-gray-600">
          {results.length > 0
            ? `找到 ${results.length} 条与“${q}”相关的结果`
            : `未找到与“${q}”相关的结果`}
        </p>
      ) : (
        <p className="mt-6 text-gray-600">共收录 {items.length} 条，输入关键词可实时筛选</p>
      )}

      <SearchResultList items={results} />
    </div>
  );
}
